import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from '../posts/ai.service';
import { CreateAdInput } from './dto/create-ad.input';
import { AdStatus } from '@prisma/client';
import * as bizSdk from 'facebook-nodejs-business-sdk';

@Injectable()
export class AdsService {
    constructor(
        private prisma: PrismaService,
        private aiService: AIService,
    ) { }

    async getFacebookAdAccounts(businessId: string | null | undefined) {
        console.log("[AdsService] getFacebookAdAccounts called for businessId:", businessId);
        
        const accounts = await this.prisma.socialAccount.findMany({
            where: { 
                businessId: (businessId || null) as any, 
                platform: 'FACEBOOK', 
                isActive: true,
                accessToken: { not: null }
            }
        });

        console.log(`[AdsService] Found ${accounts.length} FB accounts in DB`);

        // Prioritize User Account token (contains 'User Account' in name)
        const fbAccount = accounts.find(a => a.accountName.includes('User Account')) || accounts[0];

        console.log("[AdsService] Selected account for Ad fetching:", fbAccount ? { id: fbAccount.id, name: fbAccount.accountName } : "NULL");

        if (!fbAccount || !fbAccount.accessToken) {
            return [];
        }

        bizSdk.FacebookAdsApi.init(fbAccount.accessToken);
        const User = bizSdk.User;
        const user = new User('me');

        try {
            const adAccounts = await user.getAdAccounts(['name', 'account_id', 'currency'], { limit: 10 });
            return adAccounts.map((acc: any) => ({
                id: acc.id,
                name: acc.name,
                currency: acc.currency,
            }));
        } catch (error: any) {
            console.error("[AdsService] Error fetching Ad Accounts:", error);
            return [{
                id: 'error',
                name: `Error: ${error.message || 'Unknown Meta Error'}`,
                currency: 'ERR'
            }];
        }
    }

    async getFacebookPages(businessId: string | null | undefined) {
        const fbAccount = await this.prisma.socialAccount.findFirst({
            where: { 
                businessId: (businessId || null) as any, 
                platform: 'FACEBOOK', 
                isActive: true,
                accessToken: { not: null }
            }
        });

        // If no linked Facebook account, return empty list
        if (!fbAccount || !fbAccount.accessToken) {
            return [];
        }

        try {
            const pagesResponse = await fetch(
                `https://graph.facebook.com/v18.0/me/accounts?fields=name,access_token&access_token=${fbAccount.accessToken}`
            );
            const pagesData = await pagesResponse.json();
            
            if (pagesData.error) {
                console.error("[AdsService] getFacebookPages Meta Error:", pagesData.error);
                return [{ id: 'error', name: `Error: ${pagesData.error.message}` }];
            }

            const pages = pagesData.data || [];
            const result = await Promise.all(pages.map(async (p: any) => {
                let name = p.name;
                if (!name || name === 'Unnamed Page') {
                    // Try to find name in DB
                    const dbAcc = await this.prisma.socialAccount.findFirst({
                        where: { accountId: p.id, platform: 'FACEBOOK' }
                    });
                    if (dbAcc) name = dbAcc.accountName;
                }
                return {
                    id: p.id,
                    name: name || 'Unnamed Page',
                };
            }));
            
            return result;
        } catch (error: any) {
            console.error("[AdsService] Error fetching Pages:", error);
            return [{ id: 'error', name: `Error: ${error.message}` }];
        }
    }

    async create(input: CreateAdInput) {
        if (input.platform === 'FACEBOOK' && input.adAccountId && input.pageId) {
            return this.createMetaAd(input);
        }

        // Fallback for non-Facebook or incomplete data
        return this.prisma.ad.create({
            data: {
                headline: input.headline,
                primaryText: input.primaryText,
                description: input.description,
                mediaUrls: input.mediaUrls || [],
                platform: input.platform,
                businessId: input.businessId,
                status: AdStatus.DRAFT,
                adAccountId: input.adAccountId,
                pageId: input.pageId,
                budget: input.budget,
                postcode: input.postcode,
                startDate: input.startDate,
                endDate: input.endDate,
            },
        });
    }

    private async createMetaAd(input: CreateAdInput) {
        const accounts = await this.prisma.socialAccount.findMany({
            where: { businessId: input.businessId, platform: 'FACEBOOK', isActive: true, accessToken: { not: null } }
        });

        // Prioritize User Account token for ad management permissions
        const fbAccount = accounts.find(a => a.accountName.includes('User Account')) || accounts[0];

        if (!fbAccount || !fbAccount.accessToken) {
            throw new Error("Facebook Account not connected");
        }

        bizSdk.FacebookAdsApi.init(fbAccount.accessToken);
        const AdAccount = bizSdk.AdAccount;
        const Campaign = bizSdk.Campaign;
        const AdSet = bizSdk.AdSet;
        const AdCreative = bizSdk.AdCreative;
        const Ad = bizSdk.Ad;
        const AdImage = bizSdk.AdImage;

        const account = new AdAccount(input.adAccountId); // e.g., 'act_123456789'

        try {
            // 1. Upload Image
            let imageHash = null;
            if (input.mediaUrls && input.mediaUrls.length > 0 && input.mediaUrls[0].startsWith('data:image')) {
                // Remove the data:image prefix
                const base64Data = input.mediaUrls[0].replace(/^data:image\/\w+;base64,/, "");
                const binaryData = Buffer.from(base64Data, 'base64');
                const formData = new FormData();
                formData.append('filename', new Blob([binaryData]), 'ad_image.jpg');

                const imageUploadRes = await fetch(`https://graph.facebook.com/v18.0/${input.adAccountId}/adimages?access_token=${fbAccount.accessToken}`, {
                    method: 'POST',
                    body: formData,
                });
                const imageData = await imageUploadRes.json();
                if (imageData.images && imageData.images['ad_image.jpg']) {
                    imageHash = imageData.images['ad_image.jpg'].hash;
                } else {
                    console.error("[AdsService] Meta Image Upload Failed:", imageData);
                    throw new Error(`Meta Image Upload Failed: ${imageData.error?.message || 'No hash returned'}`);
                }
            }

            // 2. Create Campaign (PAUSED)
            const campaign = await account.createCampaign(
                [Campaign.Fields.Id],
                {
                    [Campaign.Fields.name]: `Campaign - ${input.headline}`,
                    [Campaign.Fields.objective]: 'OUTCOME_TRAFFIC', // or OUTCOME_ENGAGEMENT
                    [Campaign.Fields.status]: 'PAUSED',
                    [Campaign.Fields.special_ad_categories]: ['NONE'],
                    'is_adset_budget_sharing_enabled': false,
                }
            );

            // 3. Create AdSet (PAUSED)
            // Note: Budget needs to be in minimum units (e.g., cents, so $50 = 5000)
            const rawBudget = Math.max(input.budget || 300, 300);
            const dailyBudget = Math.floor(rawBudget * 100);

            // Basic targeting using postcode (if provided and API allows string zip) or broad defaults
            const targeting: any = {
                geo_locations: {
                    countries: ['GB'], // Default to GB for now, ideally derived
                }
            };

            const adSet = await account.createAdSet(
                [AdSet.Fields.Id],
                {
                    [AdSet.Fields.name]: `AdSet - ${input.headline}`,
                    [AdSet.Fields.campaign_id]: campaign.id,
                    [AdSet.Fields.daily_budget]: dailyBudget,
                    [AdSet.Fields.billing_event]: 'IMPRESSIONS',
                    [AdSet.Fields.optimization_goal]: 'LINK_CLICKS',
                    // Use LOWEST_COST_WITHOUT_CAP to avoid needing a manual bid_amount
                    'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
                    [AdSet.Fields.promoted_object]: { page_id: input.pageId },
                    [AdSet.Fields.targeting]: targeting,
                    [AdSet.Fields.status]: 'PAUSED',
                }
            );

            // 4. Create Ad Creative
            const creativeData: any = {
                [AdCreative.Fields.name]: `Creative - ${input.headline}`,
                [AdCreative.Fields.object_story_spec]: {
                    page_id: input.pageId,
                    link_data: {
                        image_hash: imageHash, // Must use hash for API
                        link: 'https://postpilot.co', // Needs actual destination
                        message: input.primaryText,
                        name: input.headline,
                        description: input.description,
                    }
                }
            };
            console.log("[AdsService] Creating Meta AdCreative with data:", JSON.stringify(creativeData, null, 2));
            const creative = await account.createAdCreative([AdCreative.Fields.Id], creativeData);

            // 5. Create Ad (PAUSED)
            const ad = await account.createAd(
                [Ad.Fields.Id],
                {
                    [Ad.Fields.name]: `Ad - ${input.headline}`,
                    [Ad.Fields.adset_id]: adSet.id,
                    [Ad.Fields.creative]: { creative_id: creative.id },
                    [Ad.Fields.status]: 'PAUSED',
                }
            );

            // Save to Database
            return this.prisma.ad.create({
                data: {
                    headline: input.headline,
                    primaryText: input.primaryText,
                    description: input.description,
                    mediaUrls: input.mediaUrls || [],
                    platform: input.platform,
                    businessId: input.businessId,
                    status: AdStatus.PAUSED, // Start paused
                    adAccountId: input.adAccountId,
                    pageId: input.pageId,
                    campaignId: campaign.id,
                    adSetId: adSet.id,
                    metaAdId: ad.id,
                    budget: input.budget,
                    postcode: input.postcode,
                },
            });

        } catch (error: any) {
            const metaError = error?.response?.error || error?.response?.data?.error || error;
            console.error("[AdsService] Meta Ad Creation Error Details:", JSON.stringify(metaError, null, 2));
            
            const friendlyMsg = metaError.error_user_msg || metaError.message || "Meta API Error occurred";

            // Save as DRAFT and store the Meta error so user sees it but record is not lost
            return (this.prisma.ad as any).create({
                data: {
                    headline: input.headline,
                    primaryText: input.primaryText,
                    description: input.description,
                    mediaUrls: input.mediaUrls || [],
                    platform: input.platform,
                    businessId: input.businessId,
                    status: AdStatus.DRAFT,
                    adAccountId: input.adAccountId,
                    pageId: input.pageId,
                    budget: input.budget,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    metaError: friendlyMsg,
                } as any,
            });
        }
    }

    async findAllByBusiness(businessId: string) {
        return this.prisma.ad.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async generateAIAd(userId: string, prompt: string, platform: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const tone = user?.aiTone || 'professional';

        return this.aiService.generateAdContent(prompt, tone, platform);
    }

    async delete(id: string) {
        return this.prisma.ad.delete({ where: { id } });
    }
}
