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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path_1 = require("path");
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
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
    async handleOAuthCallback(businessId, platform, code) {
        console.log(`[SocialAccountsService] handleOAuthCallback started for platform: ${platform}, businessId: ${businessId}`);
        const rawBackendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const backendUrl = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;
        const redirectUri = `${backendUrl}/social-accounts/callback`;
        if (platform.toUpperCase() === 'FACEBOOK') {
            const appId = process.env.FB_CLIENT_ID || process.env.META_APP_ID;
            const appSecret = process.env.FB_CLIENT_SECRET || process.env.META_APP_SECRET;
            console.log(`[SocialAccountsService] FB Token Exchange for App ID: ${appId}`);
            const encodedRedirectUri = encodeURIComponent(redirectUri);
            const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodedRedirectUri}&client_secret=${appSecret}&code=${code}`);
            const tokenData = await tokenResponse.json();
            if (tokenData.error) {
                console.error(`[SocialAccountsService] FB Token Error:`, tokenData.error);
                throw new Error(`Facebook Token Exchange Failed: ${tokenData.error.message}`);
            }
            const userAccessToken = tokenData.access_token;
            console.log(`[SocialAccountsService] FB User Token obtained. Fetching User profile...`);
            const userProfileRes = await fetch(`https://graph.facebook.com/v18.0/me?fields=name,id&access_token=${userAccessToken}`);
            const userProfile = await userProfileRes.json();
            console.log(`[SocialAccountsService] FB User Profile: ${userProfile.name} (${userProfile.id})`);
            await this.connectAccount(businessId, {
                platform: 'FACEBOOK',
                accountName: `${userProfile.name} (User Account)`,
                accountId: userProfile.id,
                accessToken: userAccessToken,
            });
            const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=name,access_token&access_token=${userAccessToken}`);
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
                if (!firstResult)
                    firstResult = result;
            }
            return firstResult;
        }
        if (platform.toUpperCase() === 'INSTAGRAM') {
            const appId = process.env.IG_CLIENT_ID || process.env.META_APP_ID;
            const appSecret = process.env.IG_CLIENT_SECRET || process.env.META_APP_SECRET;
            console.log(`[SocialAccountsService] Direct IG Token Exchange for App ID: ${appId}`);
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
            const igResponse = await fetch(`https://graph.instagram.com/v18.0/me?fields=username,id&access_token=${accessToken}`);
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
        const account = await this.prisma.socialAccount.findUnique({ where: { id } });
        if (!account)
            return;
        await this.prisma.socialAccount.update({
            where: { id },
            data: { isActive: false },
        });
        if (!account.accountName.includes("(User Account)")) {
            const userAccount = await this.prisma.socialAccount.findFirst({
                where: {
                    businessId: account.businessId,
                    platform: account.platform,
                    isActive: true,
                    accountName: { contains: "(User Account)" }
                }
            });
            if (userAccount) {
                console.log(`[SocialAccountsService] Cascading disconnect to User Account: ${userAccount.id}`);
                await this.prisma.socialAccount.update({
                    where: { id: userAccount.id },
                    data: { isActive: false }
                });
            }
        }
    }
    async publishToPlatforms(platformIds, content, mediaUrls) {
        const results = [];
        const isVideo = (url) => url.startsWith('data:video') || /\.(mp4|mov|avi|wmv|flv|webm)($|\?)/i.test(url);
        const isImage = (url) => url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp|heic)($|\?)/i.test(url);
        for (const id of platformIds) {
            const account = await this.prisma.socialAccount.findUnique({ where: { id } });
            if (!account || !account.isActive)
                continue;
            if (account.platform === 'FACEBOOK') {
                try {
                    const videoUrls = mediaUrls.filter(isVideo);
                    const imageUrls = mediaUrls.filter(isImage);
                    if (videoUrls.length > 0) {
                        const videoUrl = videoUrls[0];
                        const fbUrl = `https://graph.facebook.com/v18.0/${account.accountId}/videos`;
                        let response;
                        if (videoUrl.startsWith('data:')) {
                            const [meta, data] = videoUrl.split(',');
                            const mime = meta.split(':')[1].split(';')[0];
                            const binary = Buffer.from(data, 'base64');
                            const formData = new FormData();
                            formData.append('source', new Blob([binary], { type: mime }));
                            formData.append('description', content);
                            formData.append('access_token', account.accessToken || '');
                            response = await fetch(fbUrl, { method: 'POST', body: formData });
                        }
                        else {
                            const params = new URLSearchParams();
                            params.append('file_url', videoUrl);
                            params.append('description', content);
                            params.append('access_token', account.accessToken || '');
                            response = await fetch(`${fbUrl}?${params.toString()}`, { method: 'POST' });
                        }
                        const result = await response.json();
                        console.log(`[FB] Video upload result:`, result);
                        results.push({
                            platform: 'FACEBOOK',
                            success: !result.error,
                            data: result,
                            error: result.error ? (result.error.message || JSON.stringify(result.error)) : null
                        });
                    }
                    else if (imageUrls.length > 0) {
                        const photoIds = [];
                        let uploadError = null;
                        for (const url of imageUrls) {
                            const photoUrl = `https://graph.facebook.com/v18.0/${account.accountId}/photos`;
                            let res;
                            if (url.startsWith('data:')) {
                                const [meta, data] = url.split(',');
                                const mime = meta.split(':')[1].split(';')[0];
                                const binary = Buffer.from(data, 'base64');
                                const formData = new FormData();
                                formData.append('source', new Blob([binary], { type: mime }));
                                formData.append('published', 'false');
                                formData.append('access_token', account.accessToken || '');
                                res = await fetch(photoUrl, { method: 'POST', body: formData });
                            }
                            else {
                                const params = new URLSearchParams();
                                params.append('url', url);
                                params.append('published', 'false');
                                params.append('access_token', account.accessToken || '');
                                res = await fetch(`${photoUrl}?${params.toString()}`, { method: 'POST' });
                            }
                            const photoData = await res.json();
                            if (photoData.error) {
                                uploadError = photoData.error.message || JSON.stringify(photoData.error);
                                break;
                            }
                            if (photoData.id)
                                photoIds.push(photoData.id);
                        }
                        if (uploadError) {
                            results.push({ platform: 'FACEBOOK', success: false, error: uploadError });
                            continue;
                        }
                        const postUrl = `https://graph.facebook.com/v18.0/${account.accountId}/feed`;
                        const params = new URLSearchParams();
                        params.append('message', content);
                        params.append('access_token', account.accessToken || '');
                        if (photoIds.length > 0) {
                            params.append('attached_media', JSON.stringify(photoIds.map(id => ({ media_fbid: id }))));
                        }
                        const response = await fetch(postUrl, { method: 'POST', body: params });
                        const result = await response.json();
                        results.push({
                            platform: 'FACEBOOK',
                            success: !result.error,
                            data: result,
                            error: result.error ? (result.error.message || JSON.stringify(result.error)) : null
                        });
                    }
                    else {
                        const postUrl = `https://graph.facebook.com/v18.0/${account.accountId}/feed`;
                        const response = await fetch(postUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                message: content,
                                access_token: account.accessToken,
                            }),
                        });
                        const data = await response.json();
                        results.push({
                            platform: 'FACEBOOK',
                            success: !data.error,
                            data,
                            error: data.error ? (data.error.message || JSON.stringify(data.error)) : null
                        });
                    }
                }
                catch (error) {
                    console.error('[SocialAccountsService] FB Publish Error:', error);
                    results.push({ platform: 'FACEBOOK', success: false, error: error.message });
                }
            }
            if (account.platform === 'LINKEDIN') {
                try {
                    const hasBase64 = mediaUrls.some(url => url.startsWith('data:image'));
                    let mediaUrn;
                    let linkedinError = null;
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
                                if (registerData.status >= 400 || registerData.error) {
                                    linkedinError = registerData.message || JSON.stringify(registerData);
                                    break;
                                }
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
                                    if (uploadRes.status >= 400) {
                                        linkedinError = `Binary upload failed with status ${uploadRes.status}`;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    if (linkedinError) {
                        results.push({ platform: 'LINKEDIN', success: false, error: linkedinError });
                        continue;
                    }
                    const postUrl = 'https://api.linkedin.com/v2/ugcPosts';
                    const authorUrn = account.accountId.startsWith('urn:li:')
                        ? account.accountId
                        : `urn:li:person:${account.accountId}`;
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
                    if (response.status !== 201) {
                        results.push({ platform: 'LINKEDIN', success: false, error: data.message || JSON.stringify(data) });
                    }
                    else {
                        results.push({ platform: 'LINKEDIN', success: true, data });
                    }
                }
                catch (error) {
                    console.error(`[SocialAccountsService] LinkedIn Publish Error:`, error);
                    results.push({ platform: 'LINKEDIN', success: false, error: error.message });
                }
            }
            if (account.platform === 'INSTAGRAM') {
                try {
                    const igBaseUrl = 'https://graph.instagram.com/v18.0';
                    console.log(`[IG] Starting publish for account ${account.accountName} (${account.accountId})`);
                    const publicUrls = [];
                    for (const url of mediaUrls) {
                        const type = isVideo(url) ? 'VIDEO' : 'IMAGE';
                        if (url.startsWith('data:')) {
                            const [meta, data] = url.split(',');
                            const mime = meta.split(':')[1].split(';')[0];
                            const ext = mime.split('/')[1]?.split('+')[0] || (type === 'VIDEO' ? 'mp4' : 'jpg');
                            const filename = `${(0, uuid_1.v4)()}.${ext}`;
                            const filePath = (0, path_1.join)(process.cwd(), 'src/uploads', filename);
                            const buffer = Buffer.from(data, 'base64');
                            if (type === 'IMAGE') {
                                await (0, sharp_1.default)(buffer)
                                    .resize(1080, 1080, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
                                    .toFile(filePath);
                            }
                            else {
                                fs.writeFileSync(filePath, buffer);
                            }
                            publicUrls.push({ url: `${process.env.BACKEND_URL}/uploads/${filename}`, type });
                        }
                        else {
                            publicUrls.push({ url, type });
                        }
                    }
                    if (publicUrls.length === 0) {
                        results.push({ platform: 'INSTAGRAM', success: false, error: 'No media provided' });
                        continue;
                    }
                    if (publicUrls.length === 1) {
                        const mediaItem = publicUrls[0];
                        const containerParams = {
                            caption: content,
                            access_token: account.accessToken
                        };
                        if (mediaItem.type === 'VIDEO') {
                            containerParams.media_type = 'VIDEO';
                            containerParams.video_url = mediaItem.url;
                        }
                        else {
                            containerParams.image_url = mediaItem.url;
                        }
                        const containerRes = await fetch(`${igBaseUrl}/${account.accountId}/media`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(containerParams),
                        });
                        const containerData = await containerRes.json();
                        if (containerData.error) {
                            results.push({
                                platform: 'INSTAGRAM',
                                success: false,
                                error: containerData.error.message || JSON.stringify(containerData.error)
                            });
                            continue;
                        }
                        let isReady = false;
                        let retries = 0;
                        let lastError = null;
                        while (!isReady && retries < 15) {
                            await new Promise(resolve => setTimeout(resolve, 5000));
                            const statusRes = await fetch(`${igBaseUrl}/${containerData.id}?fields=status_code&access_token=${account.accessToken}`);
                            const statusData = await statusRes.json();
                            if (statusData.status_code === 'FINISHED') {
                                isReady = true;
                            }
                            else if (statusData.status_code === 'ERROR') {
                                lastError = `Media processing failed: ${JSON.stringify(statusData)}`;
                                break;
                            }
                            retries++;
                        }
                        if (!isReady) {
                            results.push({ platform: 'INSTAGRAM', success: false, error: lastError || 'Timeout waiting for media processing' });
                            continue;
                        }
                        const publishRes = await fetch(`${igBaseUrl}/${account.accountId}/media_publish`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ creation_id: containerData.id, access_token: account.accessToken }),
                        });
                        const publishData = await publishRes.json();
                        console.log(`[IG] Single publish result:`, publishData);
                        results.push({
                            platform: 'INSTAGRAM',
                            success: !!publishData.id,
                            data: publishData,
                            error: publishData.error ? (publishData.error.message || JSON.stringify(publishData.error)) : null
                        });
                    }
                    else {
                        const carouselItemIds = [];
                        let carouselItemError = null;
                        for (const item of publicUrls) {
                            const itemParams = {
                                is_carousel_item: true,
                                access_token: account.accessToken,
                            };
                            if (item.type === 'VIDEO') {
                                itemParams.media_type = 'VIDEO';
                                itemParams.video_url = item.url;
                            }
                            else {
                                itemParams.image_url = item.url;
                            }
                            const itemRes = await fetch(`${igBaseUrl}/${account.accountId}/media`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(itemParams),
                            });
                            const itemData = await itemRes.json();
                            if (itemData.error) {
                                carouselItemError = itemData.error.message || JSON.stringify(itemData.error);
                                break;
                            }
                            if (itemData.id)
                                carouselItemIds.push(itemData.id);
                        }
                        if (carouselItemError) {
                            results.push({ platform: 'INSTAGRAM', success: false, error: carouselItemError });
                            continue;
                        }
                        if (carouselItemIds.length < 2) {
                            results.push({ platform: 'INSTAGRAM', success: false, error: 'Not enough media containers created for carousel' });
                            continue;
                        }
                        for (const itemId of carouselItemIds) {
                            let isReady = false;
                            let retries = 0;
                            while (!isReady && retries < 15) {
                                await new Promise(resolve => setTimeout(resolve, 5000));
                                const statusRes = await fetch(`${igBaseUrl}/${itemId}?fields=status_code&access_token=${account.accessToken}`);
                                const statusData = await statusRes.json();
                                if (statusData.status_code === 'FINISHED' || !statusData.status_code) {
                                    isReady = true;
                                }
                                else if (statusData.status_code === 'ERROR') {
                                    break;
                                }
                                retries++;
                            }
                        }
                        const carouselRes = await fetch(`${igBaseUrl}/${account.accountId}/media`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                media_type: 'CAROUSEL',
                                caption: content,
                                children: carouselItemIds.join(','),
                                access_token: account.accessToken,
                            }),
                        });
                        const carouselData = await carouselRes.json();
                        if (carouselData.error) {
                            results.push({
                                platform: 'INSTAGRAM',
                                success: false,
                                error: carouselData.error.message || JSON.stringify(carouselData.error)
                            });
                            continue;
                        }
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        const publishRes = await fetch(`${igBaseUrl}/${account.accountId}/media_publish`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ creation_id: carouselData.id, access_token: account.accessToken }),
                        });
                        const publishData = await publishRes.json();
                        results.push({
                            platform: 'INSTAGRAM',
                            success: !!publishData.id,
                            data: publishData,
                            error: publishData.error ? (publishData.error.message || JSON.stringify(publishData.error)) : null
                        });
                    }
                }
                catch (error) {
                    console.error(`[SocialAccountsService] Instagram Publish Error:`, error);
                    results.push({ platform: 'INSTAGRAM', success: false, error: error.message });
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