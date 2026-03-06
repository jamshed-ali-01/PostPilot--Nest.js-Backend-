import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectSocialAccountInput } from './dto/social-account-inputs';

@Injectable()
export class SocialAccountsService {
    constructor(private prisma: PrismaService) { }

    async findAllByBusiness(businessId: string | undefined) {
        return this.prisma.socialAccount.findMany({
            where: {
                businessId: (businessId || null) as any,
                isActive: true
            },
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
    async connectAccount(businessId: string | undefined, input: ConnectSocialAccountInput) {
        const existing = await this.prisma.socialAccount.findFirst({
            where: {
                businessId: (businessId || null) as any,
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
            } as any,
        });
    }

    async getAuthUrl(businessId: string | undefined, platform: string) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const redirectUri = `${backendUrl}/social-accounts/callback`;
        const state = `${businessId || 'ADMIN'}:${platform}`;

        const fbClientId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
        const igClientId = process.env.IG_CLIENT_ID || process.env.META_APP_ID;
        const liClientId = process.env.LI_CLIENT_ID;

        switch (platform.toUpperCase()) {
            case 'FACEBOOK':
                // Using v22.0 (latest stable)
                const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${redirectUri}&state=${state}&scope=pages_manage_posts,pages_read_engagement,pages_show_list,public_profile`;
                console.log(`[SocialAccountsService] Generated FB Auth URL: ${url}`);
                return url;
            case 'INSTAGRAM':
                return `https://api.instagram.com/oauth/authorize?client_id=${igClientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code&state=${state}`;
            case 'LINKEDIN':
                return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${liClientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile%20w_member_social%20email`;
            default:
                throw new Error('Unsupported platform');
        }
    }

    async handleOAuthCallback(businessId: string | undefined, platform: string, code: string) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const redirectUri = `${backendUrl}/social-accounts/callback`;

        if (platform.toUpperCase() === 'FACEBOOK') {
            const appId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
            const appSecret = process.env.FB_CLIENT_SECRET || process.env.META_APP_SECRET;

            // 1. Exchange Code for Access Token (User Token)
            const tokenResponse = await fetch(
                `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`
            );
            const tokenData = await tokenResponse.json();
            console.log(`[SocialAccountsService] Token exchange response:`, tokenData);

            if (tokenData.error) {
                console.error(`[SocialAccountsService] Meta Token Exchange Error:`, tokenData.error);
                throw new Error(`Meta Token Exchange Failed: ${tokenData.error.message}`);
            }

            const userAccessToken = tokenData.access_token;

            // 2. Get Managed Pages (Page ID + Page Access Token)
            const pagesResponse = await fetch(
                `https://graph.facebook.com/v22.0/me/accounts?access_token=${userAccessToken}`
            );
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

            // 3. Connect all managed pages
            let firstPageResult;
            for (const page of pages) {
                const result = await this.connectAccount(businessId, {
                    platform: 'FACEBOOK',
                    accountName: page.name,
                    accountId: page.id,
                    accessToken: page.access_token, // This is the Page Access Token
                });
                if (!firstPageResult) firstPageResult = result;
            }

            return firstPageResult;
        }

        if (platform.toUpperCase() === 'LINKEDIN') {
            const clientId = process.env.LI_CLIENT_ID;
            const clientSecret = process.env.LI_CLIENT_SECRET;

            const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: redirectUri,
                    client_id: clientId || '',
                    client_secret: clientSecret || '',
                }),
            });
            const tokenData = await tokenResponse.json();
            console.log(`[SocialAccountsService] LinkedIn Token Data:`, tokenData);

            if (tokenData.error) {
                throw new Error(`LinkedIn Token Exchange Failed: ${tokenData.error_description || tokenData.error}`);
            }

            const accessToken = tokenData.access_token;
            const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const profileData = await profileResponse.json();
            console.log(`[SocialAccountsService] LinkedIn Profile Data:`, profileData);

            return this.connectAccount(businessId, {
                platform: 'LINKEDIN',
                accountName: profileData.name || 'LinkedIn User',
                accountId: profileData.sub,
                accessToken: accessToken,
            });
        }
    }

    async disconnect(id: string) {
        return this.prisma.socialAccount.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async publishToPlatforms(platformIds: string[], content: string, mediaUrls: string[]) {
        const results: any[] = [];
        for (const id of platformIds) {
            const account = await this.prisma.socialAccount.findUnique({ where: { id } });
            if (!account || !account.isActive) continue;

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
                                const response = await fetch(photoUrl, { method: 'POST', body: formData });
                                const result = await response.json();
                                results.push({ platform: 'FACEBOOK', success: !result.error, data: result });
                            }
                        }
                    } else {
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
                        results.push({ platform: 'FACEBOOK', success: !data.error, data });
                    }
                } catch (error) {
                    results.push({ platform: 'FACEBOOK', success: false, error });
                }
            }

            if (account.platform === 'LINKEDIN') {
                try {
                    const hasBase64 = mediaUrls.some(url => url.startsWith('data:image'));
                    let mediaUrn: string | undefined;

                    if (hasBase64) {
                        for (const url of mediaUrls) {
                            if (url.startsWith('data:image')) {
                                const [meta, data] = url.split(',');
                                const mime = meta.split(':')[1].split(';')[0];
                                const binary = Buffer.from(data, 'base64');

                                const registerUrl = 'https://api.linkedin.com/v2/assets?action=registerUpload';
                                const registerRes = await fetch(registerUrl, {
                                    method: 'POST',
                                    headers: {
                                        Authorization: `Bearer ${account.accessToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        registerUploadRequest: {
                                            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                                            owner: `urn:li:person:${account.accountId}`,
                                            serviceRelationships: [{
                                                relationshipType: 'OWNER',
                                                identifier: 'urn:li:userGeneratedContent',
                                            }],
                                        },
                                    }),
                                });

                                const registerData = await registerRes.json();
                                console.log(`[SocialAccountsService] LinkedIn Register Asset:`, registerData);

                                if (registerData.value) {
                                    const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
                                    mediaUrn = registerData.value.asset;

                                    const uploadRes = await fetch(uploadUrl, {
                                        method: 'POST',
                                        headers: {
                                            Authorization: `Bearer ${account.accessToken}`,
                                            'Content-Type': mime,
                                        },
                                        body: binary,
                                    });
                                    console.log(`[SocialAccountsService] LinkedIn Binary Upload Status:`, uploadRes.status);
                                }
                                break;
                            }
                        }
                    }

                    // Using ugcPosts for better compatibility with images
                    const postUrl = 'https://api.linkedin.com/v2/ugcPosts';
                    const ugcBody: any = {
                        author: `urn:li:person:${account.accountId}`,
                        lifecycleState: 'PUBLISHED',
                        specificContent: {
                            'com.linkedin.ugc.ShareContent': {
                                shareCommentary: { text: content },
                                shareMediaCategory: mediaUrn ? 'IMAGE' : 'NONE',
                            },
                        },
                        visibility: {
                            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                        },
                    };

                    if (mediaUrn) {
                        ugcBody.specificContent['com.linkedin.ugc.ShareContent'].media = [
                            {
                                status: 'READY',
                                media: mediaUrn,
                                title: { text: 'Post Image' },
                            },
                        ];
                    }

                    const response = await fetch(postUrl, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${account.accessToken}`,
                            'Content-Type': 'application/json',
                            'X-Restli-Protocol-Version': '2.0.0',
                        },
                        body: JSON.stringify(ugcBody),
                    });

                    const data = await response.json();
                    console.log(`[SocialAccountsService] LinkedIn ugcPublish Response:`, data);
                    results.push({ platform: 'LINKEDIN', success: response.status === 201, data });
                } catch (error) {
                    console.error(`[SocialAccountsService] LinkedIn Publish Error:`, error);
                    results.push({ platform: 'LINKEDIN', success: false, error });
                }
            }
        }
        return results;
    }
}
