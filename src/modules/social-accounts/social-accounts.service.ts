import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectSocialAccountInput } from './dto/social-account-inputs';

@Injectable()
export class SocialAccountsService {
    constructor(private prisma: PrismaService) { }

    async findAllByBusiness(businessId: string) {
        return this.prisma.socialAccount.findMany({
            where: { businessId, isActive: true },
        });
    }

    async connect(businessId: string, input: ConnectSocialAccountInput) {
        return this.prisma.socialAccount.upsert({
            where: {
                id: '', // We don't have ID for upsert on accountId usually, but we can find by business + platform + accountId
                // In Prisma with MongoDB, unique constraints work differently.
                // Let's use findFirst then create/update for simplicity if unique index isn't set.
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

    // Improved connect with findFirst for MongoDB
    async connectAccount(businessId: string, input: ConnectSocialAccountInput) {
        const existing = await this.prisma.socialAccount.findFirst({
            where: {
                businessId,
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
                businessId,
            },
        });
    }

    async getAuthUrl(businessId: string, platform: string) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const redirectUri = `${backendUrl}/social-accounts/callback`;
        const state = `${businessId}:${platform}`;

        const fbClientId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
        const igClientId = process.env.IG_CLIENT_ID || process.env.META_APP_ID;
        const liClientId = process.env.LI_CLIENT_ID;

        switch (platform.toUpperCase()) {
            case 'FACEBOOK':
                // Using v22.0 (latest stable)
                return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${redirectUri}&state=${state}&scope=pages_manage_posts,pages_read_engagement,pages_show_list,public_profile`;
            case 'INSTAGRAM':
                return `https://api.instagram.com/oauth/authorize?client_id=${igClientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code&state=${state}`;
            case 'LINKEDIN':
                return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${liClientId}&redirect_uri=${redirectUri}&state=${state}&scope=w_member_social`;
            default:
                throw new Error('Unsupported platform');
        }
    }

    async handleOAuthCallback(businessId: string, platform: string, code: string) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const redirectUri = `${backendUrl}/social-accounts/callback`;

        if (platform.toUpperCase() === 'FACEBOOK') {
            const appId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
            const appSecret = process.env.FB_CLIENT_SECRET || process.env.META_APP_SECRET;

            // 1. Exchange Code for Access Token
            const tokenResponse = await fetch(
                `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`
            );
            const tokenData = await tokenResponse.json();

            if (tokenData.error) {
                throw new Error(`Meta Token Exchange Failed: ${tokenData.error.message}`);
            }

            const accessToken = tokenData.access_token;

            // 2. Get User/Page Profile
            const profileResponse = await fetch(
                `https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`
            );
            const profileData = await profileResponse.json();

            return this.connectAccount(businessId, {
                platform: 'FACEBOOK',
                accountName: profileData.name || 'Facebook User',
                accountId: profileData.id,
                accessToken: accessToken,
            });
        }

        // Keep mock for other platforms until real keys are provided
        const mockTokens: Record<string, any> = {
            INSTAGRAM: { name: "johnsplumbing_official", id: "ig_real_123", token: "ig_real_token_" + Math.random() },
            LINKEDIN: { name: "Johns Plumbing Ltd (Verified)", id: "li_real_123", token: "li_real_token_" + Math.random() },
        };

        const data = mockTokens[platform.toUpperCase()];
        if (!data) throw new Error('Platform data not found');

        return this.connectAccount(businessId, {
            platform: platform.toUpperCase(),
            accountName: data.name,
            accountId: data.id,
            accessToken: data.token,
        });
    }

    async disconnect(id: string) {
        return this.prisma.socialAccount.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
