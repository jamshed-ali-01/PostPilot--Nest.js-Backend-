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
            where: { businessId, isActive: true },
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
                return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${redirectUri}&state=${state}&scope=pages_manage_posts,pages_read_engagement,pages_show_list,public_profile`;
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
            if (tokenData.error) {
                throw new Error(`Meta Token Exchange Failed: ${tokenData.error.message}`);
            }
            const accessToken = tokenData.access_token;
            const profileResponse = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`);
            const profileData = await profileResponse.json();
            return this.connectAccount(businessId, {
                platform: 'FACEBOOK',
                accountName: profileData.name || 'Facebook User',
                accountId: profileData.id,
                accessToken: accessToken,
            });
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
};
exports.SocialAccountsService = SocialAccountsService;
exports.SocialAccountsService = SocialAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SocialAccountsService);
//# sourceMappingURL=social-accounts.service.js.map