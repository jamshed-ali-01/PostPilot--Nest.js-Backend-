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
                destinationLink: input.destinationLink,
            },
        });
    }

    private async uploadImageToMeta(adAccountId: string, accessToken: string, mediaUrl: string): Promise<string> {
        if (!mediaUrl.startsWith('data:image')) {
            throw new Error("Only base64 data:image format is supported for instant upload currently");
        }

        const base64Data = mediaUrl.replace(/^data:image\/\w+;base64,/, "");
        const binaryData = Buffer.from(base64Data, 'base64');
        const formData = new FormData();
        // Construct a filename for Meta
        formData.append('filename', new Blob([binaryData]), `ad_image_${Date.now()}.jpg`);

        const response = await fetch(`https://graph.facebook.com/v18.0/${adAccountId}/adimages?access_token=${accessToken}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.images && Object.values(data.images).length > 0) {
            return (Object.values(data.images)[0] as any).hash;
        }

        console.error("[AdsService] Meta Image Upload Failed:", data);
        throw new Error(`Meta Image Upload Failed: ${data.error?.message || 'No hash returned'}`);
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

        const account = new AdAccount(input.adAccountId); 
        const destinationLink = input.destinationLink || 'https://postpilot.co';

        try {
            // 1. Upload Images and get hashes
            const mediaUrls = input.mediaUrls || [];
            const imageHashes = await Promise.all(
                mediaUrls.slice(0, 10).map(url => this.uploadImageToMeta(input.adAccountId!, fbAccount.accessToken!, url))
            );

            if (imageHashes.length === 0) throw new Error("At least one image is required for Meta Ads");

            // 2. Campaign Setup (Traffic Objective)
            const allCampaigns = await account.getCampaigns(['id', 'name']);
            const campaignName = `Campaign - ${input.headline}`;
            let campaign = allCampaigns.find(c => c.name === campaignName);

            if (campaign) {
                console.log(`[AdsService] Reusing existing Meta Campaign: ${campaign.id}`);
            } else {
                console.log(`[AdsService] Creating new Meta Campaign`);
                campaign = await account.createCampaign([], {
                    [Campaign.Fields.name]: campaignName,
                    [Campaign.Fields.objective]: 'OUTCOME_TRAFFIC',
                    [Campaign.Fields.status]: 'PAUSED',
                    [Campaign.Fields.special_ad_categories]: ['NONE'],
                });
            }

            // 3. AdSet Setup (Budget & Dynamic Targeting)
            const rawBudget = Math.max(input.budget || 300, 300);
            const dailyBudget = Math.floor(rawBudget * 100);

            // Construct Targeting: specific postcode if provided, otherwise GB wide
            const targeting: any = {
                geo_locations: input.postcode 
                    ? { countries: ['GB'], zips: [{ key: `GB:${input.postcode.split(' ')[0]}` }] } 
                    : { countries: ['GB'] }
            };

            const allAdSets = await account.getAdSets(['id', 'name']);
            const adSetName = `AdSet - ${input.headline}`;
            let adSet = allAdSets.find(as => as.name === adSetName);

            const adSetParams = {
                [AdSet.Fields.name]: adSetName,
                [AdSet.Fields.campaign_id]: campaign.id,
                [AdSet.Fields.daily_budget]: dailyBudget,
                [AdSet.Fields.billing_event]: 'IMPRESSIONS',
                [AdSet.Fields.optimization_goal]: 'LINK_CLICKS',
                'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
                [AdSet.Fields.promoted_object]: { page_id: input.pageId },
                [AdSet.Fields.targeting]: targeting,
                [AdSet.Fields.status]: 'PAUSED',
            };

            if (adSet) {
                console.log(`[AdsService] Updating existing Meta AdSet: ${adSet.id}`);
                await new AdSet(adSet.id).update([], adSetParams);
            } else {
                console.log(`[AdsService] Creating new Meta AdSet`);
                adSet = await account.createAdSet(['id'], adSetParams);
            }

            // 4. Ad Creative Setup (Single Image vs Carousel)
            let creativeParams: any;
            if (imageHashes.length > 1) {
                // Carousel Ad
                creativeParams = {
                    [AdCreative.Fields.name]: `Carousel - ${input.headline}`,
                    [AdCreative.Fields.object_story_spec]: {
                        page_id: input.pageId,
                        link_data: {
                            link: destinationLink,
                            message: input.primaryText,
                            caption: 'postpilot.co',
                            child_attachments: imageHashes.map(hash => ({
                                image_hash: hash,
                                link: destinationLink,
                                name: input.headline,
                                description: input.description || '',
                            }))
                        }
                    }
                };
            } else {
                // Single Image Ad
                creativeParams = {
                    [AdCreative.Fields.name]: `Single Image - ${input.headline}`,
                    [AdCreative.Fields.object_story_spec]: {
                        page_id: input.pageId,
                        link_data: {
                            image_hash: imageHashes[0],
                            link: destinationLink,
                            message: input.primaryText,
                            name: input.headline,
                            description: input.description || '',
                        }
                    }
                };
            }

            console.log("[AdsService] Creating Meta AdCreative...");
            const creative = await account.createAdCreative(['id'], creativeParams);

            // 5. Ad Setup
            const ad = await account.createAd(['id'], {
                [Ad.Fields.name]: `Ad - ${input.headline}`,
                [Ad.Fields.adset_id]: adSet.id,
                [Ad.Fields.creative]: { creative_id: creative.id },
                [Ad.Fields.status]: 'PAUSED',
            });

            // 6. Local Sync
            const adData = {
                headline: input.headline,
                primaryText: input.primaryText,
                description: input.description,
                mediaUrls: input.mediaUrls || [],
                platform: input.platform,
                businessId: input.businessId,
                status: AdStatus.PAUSED,
                adAccountId: input.adAccountId,
                pageId: input.pageId,
                campaignId: campaign.id,
                adSetId: adSet.id,
                metaAdId: ad.id,
                budget: input.budget,
                postcode: input.postcode,
                destinationLink: input.destinationLink,
                metaError: null,
            };

            const existingLocal = await this.prisma.ad.findFirst({
                where: { headline: input.headline, businessId: input.businessId, status: AdStatus.DRAFT }
            });

            return existingLocal 
                ? this.prisma.ad.update({ where: { id: existingLocal.id }, data: adData })
                : this.prisma.ad.create({ data: adData });

        } catch (error: any) {
            const metaError = error?.response?.error || error?.response?.data?.error || error;
            const friendlyMsg = metaError.error_user_msg || metaError.message || "Meta API Error";
            console.error("[AdsService] Meta Ad Creation Error:", JSON.stringify(metaError, null, 2));

            if (error.code === 'P2002' || error.message?.includes('foreign key')) {
                console.error("[AdsService] Database Constraint Error during Ad Creation. Check businessId validity.");
            }

            const draftData = {
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
                destinationLink: input.destinationLink,
                metaError: friendlyMsg,
            };

            const existingLocal = await this.prisma.ad.findFirst({
                where: { headline: input.headline, businessId: input.businessId, status: AdStatus.DRAFT }
            });

            return existingLocal
                ? this.prisma.ad.update({ where: { id: existingLocal.id }, data: draftData })
                : (this.prisma.ad as any).create({ data: draftData });
        }
    }

    async update(input: any) {
        const { id, ...data } = input;
        return this.prisma.ad.update({
            where: { id },
            data,
        });
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
        const ad = await this.prisma.ad.findUnique({ where: { id } });
        if (!ad) throw new Error("Ad not found");

        if (ad.campaignId) {
            try {
                const fbAccounts = await this.prisma.socialAccount.findMany({
                    where: { businessId: ad.businessId, platform: 'FACEBOOK' }
                });
                
                const userAccount = fbAccounts.find(acc => acc.accountName.includes('User Account')) || fbAccounts[0];
                
                if (userAccount?.accessToken) {
                    const bizSdk = require('facebook-nodejs-business-sdk');
                    const AdsApi = bizSdk.FacebookAdsApi.init(userAccount.accessToken);
                    const Campaign = bizSdk.Campaign;
                    
                    console.log(`[AdsService] Deleting Meta Campaign via SDK: ${ad.campaignId}`);
                    const campaign = new Campaign(ad.campaignId);
                    await campaign.delete();
                }
            } catch (error) {
                console.error("[AdsService] Meta deletion sync failed:", error);
            }
        }

        return this.prisma.ad.delete({ where: { id } });
    }
}
