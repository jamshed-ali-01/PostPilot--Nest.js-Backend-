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
        const fbAccount = await this.prisma.socialAccount.findFirst({
            where: { businessId: (businessId || null) as any, platform: 'FACEBOOK', isActive: true }
        });

        console.log("[AdsService] fbAccount found in DB:", fbAccount ? { id: fbAccount.id, name: fbAccount.accountName, hasToken: !!fbAccount.accessToken } : "NULL");

        // If no linked Facebook account, return empty list instead of throwing
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
            if (error.stack) console.error(error.stack);
            // Return error in the list for frontend debugging
            return [{
                id: 'error',
                name: `Error: ${error.message || 'Unknown Meta Error'}`,
                currency: 'ERR'
            }];
        }
    }

    async getFacebookPages(businessId: string | null | undefined) {
        const fbAccount = await this.prisma.socialAccount.findFirst({
            where: { businessId: (businessId || null) as any, platform: 'FACEBOOK', isActive: true }
        });

        // If no linked Facebook account, return empty list
        if (!fbAccount || !fbAccount.accessToken) {
            return [];
        }

        try {
            const pagesResponse = await fetch(
                `https://graph.facebook.com/v18.0/me/accounts?fields=name,access_token\u0026access_token=${fbAccount.accessToken}`
            );
            const pagesData = await pagesResponse.json();
            return pagesData.data?.map((p: any) => ({
                id: p.id,
                name: p.name,
            })) || [];
        } catch (error) {
            console.error("[AdsService] Error fetching Pages:", error);
            // Return empty array on error
            return [];
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
        const fbAccount = await this.prisma.socialAccount.findFirst({
            where: { businessId: input.businessId, platform: 'FACEBOOK', isActive: true }
        });

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
                }
            );

            // 3. Create AdSet (PAUSED)
            // Note: Budget needs to be in minimum units (e.g., cents, so $50 = 5000)
            const dailyBudget = Math.floor((input.budget || 50) * 100);

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
                    [AdSet.Fields.bid_amount]: 200, // manual bid or use lowest cost
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
            console.error("[AdsService] Meta Ad Creation Error:", error?.response?.error || error);
            // Fallback save as DRAFT if Meta API fails
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
