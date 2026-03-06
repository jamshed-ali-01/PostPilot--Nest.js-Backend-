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
            case 'INSTAGRAM':
                const fbScopes = encodeURIComponent('pages_manage_posts,pages_read_engagement,pages_show_list,public_profile,instagram_basic,instagram_content_publish');
                const fbUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${redirectUri}&state=${state}&scope=${fbScopes}`;
                console.log(`[SocialAccountsService] Generated FB/IG Auth URL: ${fbUrl}`);
                return fbUrl;
            case 'LINKEDIN':
                const liScopes = encodeURIComponent('openid profile w_member_social email');
                return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${liClientId}&redirect_uri=${redirectUri}&state=${state}&scope=${liScopes}`;
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
            const pagesResponse = await fetch(`https://graph.facebook.com/v22.0/me/accounts?fields=name,access_token,instagram_business_account&access_token=${userAccessToken}`);
            const pagesData = await pagesResponse.json();
            console.log(`[SocialAccountsService] Pages/IG data received:`, pagesData);
            if (pagesData.error) {
                console.error(`[SocialAccountsService] Meta Pages Fetch Error:`, pagesData.error);
                throw new Error(`Meta Pages Fetch Failed: ${pagesData.error.message}`);
            }
            const pages = pagesData.data || [];
            if (pages.length === 0) {
                throw new Error('No Facebook Pages found. You must have a Facebook Page to post.');
            }
            let firstResult;
            for (const page of pages) {
                const fbResult = await this.connectAccount(businessId, {
                    platform: 'FACEBOOK',
                    accountName: page.name,
                    accountId: page.id,
                    accessToken: page.access_token,
                });
                if (!firstResult)
                    firstResult = fbResult;
                if (page.instagram_business_account) {
                    const igResult = await this.connectAccount(businessId, {
                        platform: 'INSTAGRAM',
                        accountName: `${page.name} (Instagram)`,
                        accountId: page.instagram_business_account.id,
                        accessToken: page.access_token,
                    });
                    if (!firstResult)
                        firstResult = igResult;
                }
            }
            return firstResult;
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
            const personalAccount = await this.connectAccount(businessId, {
                platform: 'LINKEDIN',
                accountName: profileData.name || 'LinkedIn User',
                accountId: `urn:li:person:${profileData.sub}`,
                accessToken: accessToken,
            });
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
            }
            catch (error) {
                console.error(`[SocialAccountsService] Error fetching LinkedIn Organizations:`, error);
            }
            return personalAccount;
        }
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
                                const response = await fetch(photoUrl, { method: 'POST', body: formData });
                                const result = await response.json();
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
                        results.push({ platform: 'FACEBOOK', success: !data.error, data });
                    }
                }
                catch (error) {
                    results.push({ platform: 'FACEBOOK', success: false, error });
                }
            }
            if (account.platform === 'LINKEDIN') {
                try {
                    const hasBase64 = mediaUrls.some(url => url.startsWith('data:image'));
                    let mediaUrn;
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
                    const postUrl = 'https://api.linkedin.com/v2/ugcPosts';
                    const ugcBody = {
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
                }
                catch (error) {
                    console.error(`[SocialAccountsService] LinkedIn Publish Error:`, error);
                    results.push({ platform: 'LINKEDIN', success: false, error });
                }
            }
            if (account.platform === 'INSTAGRAM') {
                try {
                    const hasBase64 = mediaUrls.some(url => url.startsWith('data:image'));
                    if (hasBase64) {
                        for (const url of mediaUrls) {
                            if (url.startsWith('data:image')) {
                                const [meta, data] = url.split(',');
                                const binary = Buffer.from(data, 'base64');
                                const fbAppId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
                                const containerUrl = `https://graph.facebook.com/v22.0/${account.accountId}/media`;
                                const containerFormData = new FormData();
                                containerFormData.append('caption', content);
                                containerFormData.append('access_token', account.accessToken || '');
                                const containerRes = await fetch(containerUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        caption: content,
                                        image_url: url.startsWith('http') ? url : undefined,
                                        access_token: account.accessToken
                                    })
                                });
                                const containerData = await containerRes.json();
                                console.log(`[SocialAccountsService] IG Media Container:`, containerData);
                                if (containerData.id) {
                                    const publishUrl = `https://graph.facebook.com/v22.0/${account.accountId}/media_publish`;
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
                                }
                                else {
                                    results.push({ platform: 'INSTAGRAM', success: false, data: containerData });
                                }
                                break;
                            }
                        }
                    }
                    else if (mediaUrls.length > 0) {
                        const containerUrl = `https://graph.facebook.com/v22.0/${account.accountId}/media`;
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
                            const publishUrl = `https://graph.facebook.com/v22.0/${account.accountId}/media_publish`;
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
                        }
                        else {
                            results.push({ platform: 'INSTAGRAM', success: false, data: containerData });
                        }
                    }
                }
                catch (error) {
                    console.error(`[SocialAccountsService] Instagram Publish Error:`, error);
                    results.push({ platform: 'INSTAGRAM', success: false, error });
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