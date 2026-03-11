import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
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
        const rawBackendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const backendUrl = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;
        const redirectUri = `${backendUrl}/social-accounts/callback`;
        const state = `${businessId || 'ADMIN'}:${platform}`;

        const fbClientId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
        const igClientId = process.env.IG_CLIENT_ID || process.env.META_APP_ID;
        const liClientId = process.env.LI_CLIENT_ID;

        switch (platform.toUpperCase()) {
            case 'FACEBOOK':
                const fbScopes = encodeURIComponent('pages_manage_posts,pages_read_engagement,pages_show_list,public_profile,ads_management,business_management');
                const encodedFbRedirect = encodeURIComponent(redirectUri);
                return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${encodedFbRedirect}&state=${state}&scope=${fbScopes}`;

            case 'INSTAGRAM':
                // DIRECT INSTAGRAM LOGIN FLOW (Standalone)
                // This uses api.instagram.com instead of facebook.com/v18.0
                const encodedIgRedirect = encodeURIComponent(redirectUri);
                const igScopes = encodeURIComponent('instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_messages');
                const igUrl = `https://api.instagram.com/oauth/authorize?client_id=${igClientId}&redirect_uri=${encodedIgRedirect}&scope=${igScopes}&response_type=code&state=${state}`;
                console.log(`[SocialAccountsService] Generated Direct IG Auth URL: ${igUrl}`);
                return igUrl;

            case 'LINKEDIN':
                const liScopes = encodeURIComponent('openid profile w_member_social email');
                return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${liClientId}&redirect_uri=${redirectUri}&state=${state}&scope=${liScopes}`;

            default:
                throw new Error('Unsupported platform');
        }
    }

    async handleOAuthCallback(businessId: string | undefined, platform: string, code: string) {
        console.log(`[SocialAccountsService] handleOAuthCallback started for platform: ${platform}, businessId: ${businessId}`);
        const rawBackendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const backendUrl = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;
        const redirectUri = `${backendUrl}/social-accounts/callback`;

        if (platform.toUpperCase() === 'FACEBOOK') {
            const appId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
            const appSecret = process.env.FB_CLIENT_SECRET || process.env.META_APP_SECRET;

            console.log(`[SocialAccountsService] FB Token Exchange for App ID: ${appId}`);

            // 1. Exchange Code for Access Token
            const encodedRedirectUri = encodeURIComponent(redirectUri);
            const tokenResponse = await fetch(
                `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodedRedirectUri}&client_secret=${appSecret}&code=${code}`
            );
            const tokenData = await tokenResponse.json();

            if (tokenData.error) {
                console.error(`[SocialAccountsService] FB Token Error:`, tokenData.error);
                throw new Error(`Facebook Token Exchange Failed: ${tokenData.error.message}`);
            }

            const userAccessToken = tokenData.access_token;
            console.log(`[SocialAccountsService] FB User Token obtained. Fetching User profile...`);

            // 2. Get User Profile (to store a User Token for Ad management)
            const userProfileRes = await fetch(
                `https://graph.facebook.com/v18.0/me?fields=name,id&access_token=${userAccessToken}`
            );
            const userProfile = await userProfileRes.json();
            console.log(`[SocialAccountsService] FB User Profile: ${userProfile.name} (${userProfile.id})`);

            // Connect the User's own account (holds the primary token for Ads)
            await this.connectAccount(businessId, {
                platform: 'FACEBOOK',
                accountName: `${userProfile.name} (User Account)`,
                accountId: userProfile.id,
                accessToken: userAccessToken,
            });

            // 3. Get Managed Pages
            const pagesResponse = await fetch(
                `https://graph.facebook.com/v18.0/me/accounts?fields=name,access_token&access_token=${userAccessToken}`
            );
            const pagesData = await pagesResponse.json();
            const pages = pagesData.data || [];

            let firstResult;
            for (const page of pages) {
                const result = await this.connectAccount(businessId, {
                    platform: 'FACEBOOK',
                    accountName: page.name,
                    accountId: page.id,
                    accessToken: page.access_token,
                });
                if (!firstResult) firstResult = result;
            }
            return firstResult;
        }

        if (platform.toUpperCase() === 'INSTAGRAM') {
            const appId = process.env.IG_CLIENT_ID || process.env.META_APP_ID;
            const appSecret = process.env.IG_CLIENT_SECRET || process.env.META_APP_SECRET;

            console.log(`[SocialAccountsService] Direct IG Token Exchange for App ID: ${appId}`);

            // 1. Exchange Code for Access Token (POST to api.instagram.com)
            const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: appId || '',
                    client_secret: appSecret || '',
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUri,
                    code: code,
                }),
            });
            const tokenData = await tokenResponse.json();
            console.log(`[SocialAccountsService] Direct IG Token Data:`, tokenData);

            if (tokenData.error_message || tokenData.error) {
                throw new Error(`Instagram Token Exchange Failed: ${tokenData.error_message || tokenData.error}`);
            }

            const accessToken = tokenData.access_token;
            const userId = tokenData.user_id;

            // 2. Get Instagram Professional account details
            const igResponse = await fetch(
                `https://graph.instagram.com/v18.0/me?fields=username,id&access_token=${accessToken}`
            );
            const igData = await igResponse.json();
            console.log(`[SocialAccountsService] Direct IG Account Data:`, igData);

            return await this.connectAccount(businessId, {
                platform: 'INSTAGRAM',
                accountName: igData.username || 'Instagram Business',
                accountId: igData.id || userId,
                accessToken: accessToken,
            });
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

            // Connect Personal Profile
            const personalAccount = await this.connectAccount(businessId, {
                platform: 'LINKEDIN',
                accountName: profileData.name || 'LinkedIn User',
                accountId: `urn:li:person:${profileData.sub}`, // Store full URN
                accessToken: accessToken,
            });

            // Fetch Managed Organizations
            try {
                const aclResponse = await fetch('https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'X-Restli-Protocol-Version': '2.0.0'
                    },
                });
                const aclData = await aclResponse.json();
                console.log(`[SocialAccountsService] LinkedIn ACL Data:`, aclData);

                if (aclData.elements && aclData.elements.length > 0) {
                    for (const acl of aclData.elements) {
                        const orgUrn = acl.organization;
                        const orgId = orgUrn.split(':').pop();

                        // Fetch Org Details
                        const orgDetailsRes = await fetch(`https://api.linkedin.com/v2/organizations/${orgId}`, {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        });
                        const orgDetails = await orgDetailsRes.json();
                        console.log(`[SocialAccountsService] LinkedIn Org Details:`, orgDetails);

                        if (orgDetails.localizedName) {
                            await this.connectAccount(businessId, {
                                platform: 'LINKEDIN',
                                accountName: `${orgDetails.localizedName} (Page)`,
                                accountId: orgUrn,
                                accessToken: accessToken,
                            });
                        }
                    }
                }
            } catch (error) {
                console.error(`[SocialAccountsService] Error fetching LinkedIn Organizations:`, error);
            }

            return personalAccount;
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
                                const photoUrl = `https://graph.facebook.com/v18.0/${account.accountId}/photos`;
                                const response = await fetch(photoUrl, { method: 'POST', body: formData });
                                const result = await response.json();
                                results.push({ platform: 'FACEBOOK', success: !result.error, data: result });
                            }
                        }
                    } else {
                        const postUrl = `https://graph.facebook.com/v18.0/${account.accountId}/feed`;
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

                                const authorUrn = account.accountId.startsWith('urn:li:')
                                    ? account.accountId
                                    : `urn:li:person:${account.accountId}`;

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
                                            owner: authorUrn,
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

                    const authorUrn = account.accountId.startsWith('urn:li:')
                        ? account.accountId
                        : `urn:li:person:${account.accountId}`;

                    // Using ugcPosts for better compatibility with images
                    const postUrl = 'https://api.linkedin.com/v2/ugcPosts';
                    const ugcBody: any = {
                        author: authorUrn,
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

            if (account.platform === 'INSTAGRAM') {
                try {
                    const hasBase64 = mediaUrls.some(url => url.startsWith('data:image'));
                    // Use graph.instagram.com for standalone IG tokens
                    const igBaseUrl = 'https://graph.instagram.com/v18.0';

                    if (hasBase64) {
                        for (const url of mediaUrls) {
                            if (url.startsWith('data:image')) {
                                // 1. Save Base64 to Local File (with Square Padding)
                                const [meta, data] = url.split(',');
                                const ext = meta.split('/')[1].split(';')[0] || 'jpg';
                                const filename = `${uuidv4()}.${ext}`;
                                const filePath = join(process.cwd(), 'src/uploads', filename);

                                const buffer = Buffer.from(data, 'base64');
                                await sharp(buffer)
                                    .resize(1080, 1080, {
                                        fit: 'contain',
                                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                                    })
                                    .toFile(filePath);

                                // 2. Generate Public URL
                                const publicUrl = `${process.env.BACKEND_URL}/uploads/${filename}`;
                                console.log(`[SocialAccountsService] Generated IG Public URL: ${publicUrl}`);

                                // 3. Create Media Container
                                const containerUrl = `${igBaseUrl}/${account.accountId}/media`;

                                const containerRes = await fetch(containerUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        caption: content,
                                        image_url: publicUrl,
                                        access_token: account.accessToken
                                    })
                                });

                                const containerData = await containerRes.json();
                                console.log(`[SocialAccountsService] IG Media Container:`, containerData);

                                if (containerData.id) {
                                    // 4. Wait for media to process (common IG requirement)
                                    console.log(`[SocialAccountsService] Waiting 3s for IG to process media...`);
                                    await new Promise(resolve => setTimeout(resolve, 3000));

                                    // 5. Publish Media
                                    const publishUrl = `${igBaseUrl}/${account.accountId}/media_publish`;
                                    const publishRes = await fetch(publishUrl, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            creation_id: containerData.id,
                                            access_token: account.accessToken
                                        })
                                    });
                                    const publishData = await publishRes.json();
                                    console.log(`[SocialAccountsService] IG Media Publish Response:`, publishData);
                                    results.push({ platform: 'INSTAGRAM', success: !!publishData.id, data: publishData });
                                } else {
                                    let errorMsg = containerData.error?.message || 'Failed to create media container';
                                    if (containerData.error?.code === 36003 || errorMsg.includes('aspect ratio')) {
                                        errorMsg = "Instagram Aspect Ratio Error: Please use a Square (1:1), Portrait (4:5), or Landscape (1.91:1) image.";
                                    }
                                    results.push({ platform: 'INSTAGRAM', success: false, data: { ...containerData, userMessage: errorMsg } });
                                }
                                break;
                            }
                        }
                    } else if (mediaUrls.length > 0) {
                        // Handle public URL
                        const containerUrl = `${igBaseUrl}/${account.accountId}/media`;
                        const containerRes = await fetch(containerUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                caption: content,
                                image_url: mediaUrls[0],
                                access_token: account.accessToken
                            })
                        });
                        const containerData = await containerRes.json();
                        if (containerData.id) {
                            const publishUrl = `${igBaseUrl}/${account.accountId}/media_publish`;
                            const publishRes = await fetch(publishUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    creation_id: containerData.id,
                                    access_token: account.accessToken
                                })
                            });
                            const publishData = await publishRes.json();
                            results.push({ platform: 'INSTAGRAM', success: !!publishData.id, data: publishData });
                        } else {
                            let errorMsg = containerData.error?.message || 'Failed to create media container';
                            if (containerData.error?.code === 36003 || errorMsg.includes('aspect ratio')) {
                                errorMsg = "Instagram Aspect Ratio Error: Please use a Square (1:1), Portrait (4:5), or Landscape (1.91:1) image.";
                            }
                            results.push({ platform: 'INSTAGRAM', success: false, data: { ...containerData, userMessage: errorMsg } });
                        }
                    }
                } catch (error) {
                    console.error(`[SocialAccountsService] Instagram Publish Error:`, error);
                    results.push({ platform: 'INSTAGRAM', success: false, error });
                }
            }
        }
        return results;
    }
}
