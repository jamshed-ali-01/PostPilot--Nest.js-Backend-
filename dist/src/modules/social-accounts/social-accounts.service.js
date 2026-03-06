"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SocialAccountsService = class SocialAccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllByBusiness(businessId) {
        return this.prisma.socialAccount.findMany({
            where: {
                businessId: (businessId || null),
                isActive: true
            },
        });
    }
    async connect(businessId, input) {
        return this.prisma.socialAccount.upsert({
            where: {
                id: '',
            },
            update: {
                accountName: input.accountName,
                accessToken: input.accessToken,
                isActive: true,
            },
            create: {
                ...input,
                businessId,
            },
        });
    }
    async connectAccount(businessId, input) {
        const existing = await this.prisma.socialAccount.findFirst({
            where: {
                businessId: (businessId || null),
                platform: input.platform,
                accountId: input.accountId,
            },
        });
        if (existing) {
            return this.prisma.socialAccount.update({
                where: { id: existing.id },
                data: {
                    accountName: input.accountName,
                    accessToken: input.accessToken,
                    isActive: true,
                },
            });
        }
        return this.prisma.socialAccount.create({
            data: {
                ...input,
                businessId: businessId || null,
            },
        });
    }
    async getAuthUrl(businessId, platform) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const redirectUri = `${backendUrl}/social-accounts/callback`;
        const state = `${businessId || 'ADMIN'}:${platform}`;
        const fbClientId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
        const igClientId = process.env.IG_CLIENT_ID || process.env.META_APP_ID;
        const liClientId = process.env.LI_CLIENT_ID;
        switch (platform.toUpperCase()) {
            case 'FACEBOOK':
                const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${redirectUri}&state=${state}&scope=pages_manage_posts,pages_read_engagement,pages_show_list,public_profile`;
                console.log(`[SocialAccountsService] Generated FB Auth URL: ${url}`);
                return url;
            case 'INSTAGRAM':
                return `https://api.instagram.com/oauth/authorize?client_id=${igClientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code&state=${state}`;
            case 'LINKEDIN':
                return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${liClientId}&redirect_uri=${redirectUri}&state=${state}&scope=w_member_social`;
            default:
                throw new Error('Unsupported platform');
        }
    }
    async handleOAuthCallback(businessId, platform, code) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const redirectUri = `${backendUrl}/social-accounts/callback`;
        if (platform.toUpperCase() === 'FACEBOOK') {
            const appId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
            const appSecret = process.env.FB_CLIENT_SECRET || process.env.META_APP_SECRET;
            const tokenResponse = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`);
            const tokenData = await tokenResponse.json();
            console.log(`[SocialAccountsService] Token exchange response:`, tokenData);
            if (tokenData.error) {
                console.error(`[SocialAccountsService] Meta Token Exchange Error:`, tokenData.error);
                throw new Error(`Meta Token Exchange Failed: ${tokenData.error.message}`);
            }
            const userAccessToken = tokenData.access_token;
            const pagesResponse = await fetch(`https://graph.facebook.com/v22.0/me/accounts?access_token=${userAccessToken}`);
            const pagesData = await pagesResponse.json();
            console.log(`[SocialAccountsService] Pages data received:`, pagesData);
            if (pagesData.error) {
                console.error(`[SocialAccountsService] Meta Pages Fetch Error:`, pagesData.error);
                throw new Error(`Meta Pages Fetch Failed: ${pagesData.error.message}`);
            }
            const pages = pagesData.data || [];
            if (pages.length === 0) {
                throw new Error('No Facebook Pages found. You must have a Facebook Page to post.');
            }
            let firstPageResult;
            for (const page of pages) {
                const result = await this.connectAccount(businessId, {
                    platform: 'FACEBOOK',
                    accountName: page.name,
                    accountId: page.id,
                    accessToken: page.access_token,
                });
                if (!firstPageResult)
                    firstPageResult = result;
            }
            return firstPageResult;
        }
        const mockTokens = {
            INSTAGRAM: { name: "johnsplumbing_official", id: "ig_real_123", token: "ig_real_token_" + Math.random() },
            LINKEDIN: { name: "Johns Plumbing Ltd (Verified)", id: "li_real_123", token: "li_real_token_" + Math.random() },
        };
        const data = mockTokens[platform.toUpperCase()];
        if (!data)
            throw new Error('Platform data not found');
        return this.connectAccount(businessId, {
            platform: platform.toUpperCase(),
            accountName: data.name,
            accountId: data.id,
            accessToken: data.token,
        });
    }
    async disconnect(id) {
        return this.prisma.socialAccount.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async publishToPlatforms(platformIds, content, mediaUrls) {
        const results = [];
        for (const id of platformIds) {
            const account = await this.prisma.socialAccount.findUnique({ where: { id } });
            if (!account || !account.isActive)
                continue;
            if (account.platform === 'FACEBOOK') {
                try {
                    const hasBase64 = mediaUrls.some(url => url.startsWith('data:image'));
                    if (hasBase64) {
                        for (const url of mediaUrls) {
                            if (url.startsWith('data:image')) {
                                const [meta, data] = url.split(',');
                                const mime = meta.split(':')[1].split(';')[0];
                                const binary = Buffer.from(data, 'base64');
                                const formData = new FormData();
                                formData.append('source', new Blob([binary], { type: mime }));
                                formData.append('caption', content);
                                formData.append('access_token', account.accessToken || '');
                                const photoUrl = `https://graph.facebook.com/v22.0/${account.accountId}/photos`;
                                const response = await fetch(photoUrl, {
                                    method: 'POST',
                                    body: formData,
                                });
                                const result = await response.json();
                                console.log(`[SocialAccountsService] FB Photo Upload Response:`, result);
                                results.push({ platform: 'FACEBOOK', success: !result.error, data: result });
                            }
                        }
                    }
                    else {
                        const postUrl = `https://graph.facebook.com/v22.0/${account.accountId}/feed`;
                        const response = await fetch(postUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                message: content,
                                link: mediaUrls.length > 0 ? mediaUrls[0] : undefined,
                                access_token: account.accessToken,
                            }),
                        });
                        const data = await response.json();
                        console.log(`[SocialAccountsService] FB Feed Response:`, data);
                        results.push({ platform: 'FACEBOOK', success: !data.error, data });
                    }
                }
                catch (error) {
                    console.error(`[SocialAccountsService] FB Publish Error:`, error);
                    results.push({ platform: 'FACEBOOK', success: false, error });
                }
            }
        }
        return results;
    }
};
exports.SocialAccountsService = SocialAccountsService;
exports.SocialAccountsService = SocialAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SocialAccountsService);
//# sourceMappingURL=social-accounts.service.js.map