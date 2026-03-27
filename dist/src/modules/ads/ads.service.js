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
            },
        });
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
        const AdImage = bizSdk.AdImage;
        const account = new AdAccount(input.adAccountId);
        try {
            let imageHash = null;
            if (input.mediaUrls && input.mediaUrls.length > 0 && input.mediaUrls[0].startsWith('data:image')) {
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
                else {
                    console.error("[AdsService] Meta Image Upload Failed:", imageData);
                    throw new Error(`Meta Image Upload Failed: ${imageData.error?.message || 'No hash returned'}`);
                }
            }
            const allCampaigns = await account.getCampaigns(['id', 'name']);
            const existingCampaign = allCampaigns.find(c => c.name === `Campaign - ${input.headline}`);
            let campaign;
            if (existingCampaign) {
                console.log(`[AdsService] Reusing existing Meta Campaign: ${existingCampaign.id}`);
                campaign = existingCampaign;
            }
            else {
                console.log(`[AdsService] Creating new Meta Campaign`);
                campaign = await account.createCampaign(['id'], {
                    [Campaign.Fields.name]: `Campaign - ${input.headline}`,
                    [Campaign.Fields.objective]: 'OUTCOME_TRAFFIC',
                    [Campaign.Fields.status]: 'PAUSED',
                    [Campaign.Fields.special_ad_categories]: ['NONE'],
                    'is_adset_budget_sharing_enabled': false,
                });
            }
            const rawBudget = Math.max(input.budget || 300, 300);
            const dailyBudget = Math.floor(rawBudget * 100);
            const targeting = {
                geo_locations: {
                    countries: ['GB'],
                }
            };
            const allAdSets = await account.getAdSets(['id', 'name']);
            const existingAdSet = allAdSets.find(as => as.name === `AdSet - ${input.headline}`);
            let adSet;
            if (existingAdSet) {
                console.log(`[AdsService] Reusing existing Meta AdSet: ${existingAdSet.id}`);
                adSet = existingAdSet;
            }
            else {
                console.log(`[AdsService] Creating new Meta AdSet`);
                adSet = await account.createAdSet(['id'], {
                    [AdSet.Fields.name]: `AdSet - ${input.headline}`,
                    [AdSet.Fields.campaign_id]: campaign.id,
                    [AdSet.Fields.daily_budget]: dailyBudget,
                    [AdSet.Fields.billing_event]: 'IMPRESSIONS',
                    [AdSet.Fields.optimization_goal]: 'LINK_CLICKS',
                    'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
                    [AdSet.Fields.promoted_object]: { page_id: input.pageId },
                    [AdSet.Fields.targeting]: targeting,
                    [AdSet.Fields.status]: 'PAUSED',
                });
            }
            const creativeData = {
                [AdCreative.Fields.name]: `Creative - ${input.headline}`,
                [AdCreative.Fields.object_story_spec]: {
                    page_id: input.pageId,
                    link_data: {
                        image_hash: imageHash,
                        link: 'https://postpilot.co',
                        message: input.primaryText,
                        name: input.headline,
                        description: input.description,
                    }
                }
            };
            console.log("[AdsService] Creating Meta AdCreative with data:", JSON.stringify(creativeData, null, 2));
            const creative = await account.createAdCreative([AdCreative.Fields.Id], creativeData);
            const ad = await account.createAd([Ad.Fields.Id], {
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
                metaError: null,
            };
            const existingAdLocal = await this.prisma.ad.findFirst({
                where: {
                    headline: input.headline,
                    businessId: input.businessId,
                    status: client_1.AdStatus.DRAFT
                }
            });
            if (existingAdLocal) {
                console.log(`[AdsService] Updating existing local draft: ${existingAdLocal.id}`);
                return this.prisma.ad.update({
                    where: { id: existingAdLocal.id },
                    data: adData,
                });
            }
            else {
                console.log(`[AdsService] Creating new local record`);
                return this.prisma.ad.create({ data: adData });
            }
        }
        catch (error) {
            const metaError = error?.response?.error || error?.response?.data?.error || error;
            console.error("[AdsService] Meta Ad Creation Error Details:", JSON.stringify(metaError, null, 2));
            const friendlyMsg = metaError.error_user_msg || metaError.message || "Meta API Error occurred";
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
                metaError: friendlyMsg,
            };
            const existingAdLocal = await this.prisma.ad.findFirst({
                where: {
                    headline: input.headline,
                    businessId: input.businessId,
                    status: client_1.AdStatus.DRAFT
                }
            });
            if (existingAdLocal) {
                return this.prisma.ad.update({
                    where: { id: existingAdLocal.id },
                    data: draftData,
                });
            }
            else {
                return this.prisma.ad.create({ data: draftData });
            }
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