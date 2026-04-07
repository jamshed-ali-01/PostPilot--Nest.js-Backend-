"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_service_1 = require("../posts/ai.service");
const client_1 = require("@prisma/client");
const bizSdk = __importStar(require("facebook-nodejs-business-sdk"));
let AdsService = class AdsService {
    prisma;
    aiService;
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async getFacebookAdAccounts(businessId) {
        console.log("[AdsService] getFacebookAdAccounts called for businessId:", businessId);
        const accounts = await this.prisma.socialAccount.findMany({
            where: {
                businessId: (businessId || null),
                platform: 'FACEBOOK',
                isActive: true,
                accessToken: { not: null }
            }
        });
        console.log(`[AdsService] Found ${accounts.length} FB accounts in DB`);
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
            return adAccounts.map((acc) => ({
                id: acc.id,
                name: acc.name,
                currency: acc.currency,
            }));
        }
        catch (error) {
            console.error("[AdsService] Error fetching Ad Accounts:", error);
            return [{
                    id: 'error',
                    name: `Error: ${error.message || 'Unknown Meta Error'}`,
                    currency: 'ERR'
                }];
        }
    }
    async getFacebookPages(businessId) {
        const fbAccount = await this.prisma.socialAccount.findFirst({
            where: {
                businessId: (businessId || null),
                platform: 'FACEBOOK',
                isActive: true,
                accessToken: { not: null }
            }
        });
        if (!fbAccount || !fbAccount.accessToken) {
            return [];
        }
        try {
            const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=name,access_token&access_token=${fbAccount.accessToken}`);
            const pagesData = await pagesResponse.json();
            if (pagesData.error) {
                console.error("[AdsService] getFacebookPages Meta Error:", pagesData.error);
                return [{ id: 'error', name: `Error: ${pagesData.error.message}` }];
            }
            const pages = pagesData.data || [];
            const result = await Promise.all(pages.map(async (p) => {
                let name = p.name;
                if (!name || name === 'Unnamed Page') {
                    const dbAcc = await this.prisma.socialAccount.findFirst({
                        where: { accountId: p.id, platform: 'FACEBOOK' }
                    });
                    if (dbAcc)
                        name = dbAcc.accountName;
                }
                return {
                    id: p.id,
                    name: name || 'Unnamed Page',
                };
            }));
            return result;
        }
        catch (error) {
            console.error("[AdsService] Error fetching Pages:", error);
            return [{ id: 'error', name: `Error: ${error.message}` }];
        }
    }
    async create(input) {
        if (input.platform === 'FACEBOOK' && input.adAccountId && input.pageId) {
            return this.createMetaAd(input);
        }
        return this.prisma.ad.create({
            data: {
                headline: input.headline,
                primaryText: input.primaryText,
                description: input.description,
                mediaUrls: input.mediaUrls || [],
                platform: input.platform,
                businessId: input.businessId,
                status: client_1.AdStatus.DRAFT,
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
    async uploadImageToMeta(adAccountId, accessToken, mediaUrl) {
        if (!mediaUrl.startsWith('data:image')) {
            throw new Error("Only base64 data:image format is supported for instant upload currently");
        }
        const base64Data = mediaUrl.replace(/^data:image\/\w+;base64,/, "");
        const binaryData = Buffer.from(base64Data, 'base64');
        const formData = new FormData();
        formData.append('filename', new Blob([binaryData]), `ad_image_${Date.now()}.jpg`);
        const response = await fetch(`https://graph.facebook.com/v18.0/${adAccountId}/adimages?access_token=${accessToken}`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (data.images && Object.values(data.images).length > 0) {
            return Object.values(data.images)[0].hash;
        }
        console.error("[AdsService] Meta Image Upload Failed:", data);
        throw new Error(`Meta Image Upload Failed: ${data.error?.message || 'No hash returned'}`);
    }
    async createMetaAd(input) {
        const accounts = await this.prisma.socialAccount.findMany({
            where: { businessId: input.businessId, platform: 'FACEBOOK', isActive: true, accessToken: { not: null } }
        });
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
            const mediaUrls = input.mediaUrls || [];
            const imageHashes = await Promise.all(mediaUrls.slice(0, 10).map(url => this.uploadImageToMeta(input.adAccountId, fbAccount.accessToken, url)));
            if (imageHashes.length === 0)
                throw new Error("At least one image is required for Meta Ads");
            const allCampaigns = await account.getCampaigns(['id', 'name']);
            const campaignName = `Campaign - ${input.headline}`;
            let campaign = allCampaigns.find(c => c.name === campaignName);
            if (campaign) {
                console.log(`[AdsService] Reusing existing Meta Campaign: ${campaign.id}`);
            }
            else {
                console.log(`[AdsService] Creating new Meta Campaign`);
                campaign = await account.createCampaign([], {
                    [Campaign.Fields.name]: campaignName,
                    [Campaign.Fields.objective]: 'OUTCOME_TRAFFIC',
                    [Campaign.Fields.status]: 'PAUSED',
                    [Campaign.Fields.special_ad_categories]: ['NONE'],
                });
            }
            const rawBudget = Math.max(input.budget || 300, 300);
            const dailyBudget = Math.floor(rawBudget * 100);
            const targeting = {
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
            }
            else {
                console.log(`[AdsService] Creating new Meta AdSet`);
                adSet = await account.createAdSet(['id'], adSetParams);
            }
            let creativeParams;
            if (imageHashes.length > 1) {
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
            }
            else {
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
            const ad = await account.createAd(['id'], {
                [Ad.Fields.name]: `Ad - ${input.headline}`,
                [Ad.Fields.adset_id]: adSet.id,
                [Ad.Fields.creative]: { creative_id: creative.id },
                [Ad.Fields.status]: 'PAUSED',
            });
            const adData = {
                headline: input.headline,
                primaryText: input.primaryText,
                description: input.description,
                mediaUrls: input.mediaUrls || [],
                platform: input.platform,
                businessId: input.businessId,
                status: client_1.AdStatus.PAUSED,
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
                where: { headline: input.headline, businessId: input.businessId, status: client_1.AdStatus.DRAFT }
            });
            return existingLocal
                ? this.prisma.ad.update({ where: { id: existingLocal.id }, data: adData })
                : this.prisma.ad.create({ data: adData });
        }
        catch (error) {
            const metaError = error?.response?.error || error?.response?.data?.error || error;
            const friendlyMsg = metaError.error_user_msg || metaError.message || "Meta API Error";
            console.error("[AdsService] Meta Ad Creation Error:", JSON.stringify(metaError, null, 2));
            const draftData = {
                headline: input.headline,
                primaryText: input.primaryText,
                description: input.description,
                mediaUrls: input.mediaUrls || [],
                platform: input.platform,
                businessId: input.businessId,
                status: client_1.AdStatus.DRAFT,
                adAccountId: input.adAccountId,
                pageId: input.pageId,
                budget: input.budget,
                postcode: input.postcode,
                destinationLink: input.destinationLink,
                metaError: friendlyMsg,
            };
            const existingLocal = await this.prisma.ad.findFirst({
                where: { headline: input.headline, businessId: input.businessId, status: client_1.AdStatus.DRAFT }
            });
            return existingLocal
                ? this.prisma.ad.update({ where: { id: existingLocal.id }, data: draftData })
                : this.prisma.ad.create({ data: draftData });
        }
    }
    async update(input) {
        const { id, ...data } = input;
        return this.prisma.ad.update({
            where: { id },
            data,
        });
    }
    async findAllByBusiness(businessId) {
        return this.prisma.ad.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async generateAIAd(userId, prompt, platform) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const tone = user?.aiTone || 'professional';
        return this.aiService.generateAdContent(prompt, tone, platform);
    }
    async delete(id) {
        const ad = await this.prisma.ad.findUnique({ where: { id } });
        if (!ad)
            throw new Error("Ad not found");
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
            }
            catch (error) {
                console.error("[AdsService] Meta deletion sync failed:", error);
            }
        }
        return this.prisma.ad.delete({ where: { id } });
    }
};
exports.AdsService = AdsService;
exports.AdsService = AdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService])
], AdsService);
//# sourceMappingURL=ads.service.js.map