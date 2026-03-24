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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_service_1 = require("./ai.service");
const client_1 = require("@prisma/client");
const social_accounts_service_1 = require("../social-accounts/social-accounts.service");
const fs = __importStar(require("fs"));
const path_1 = require("path");
const uuid_1 = require("uuid");
let PostsService = class PostsService {
    prisma;
    aiService;
    socialAccountsService;
    constructor(prisma, aiService, socialAccountsService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.socialAccountsService = socialAccountsService;
    }
    async create(input) {
        try {
            const author = input.authorId ? await this.prisma.user.findUnique({
                where: { id: input.authorId },
                include: { roles: { include: { permissions: true } } }
            }) : null;
            let hasPublishPermission = false;
            if (author) {
                hasPublishPermission = author.roles.some(role => role.permissions.some(p => p.name === 'PUBLISH_POST'));
            }
            else {
                const sysAdmin = await this.prisma.systemAdmin.findUnique({
                    where: { id: input.authorId }
                });
                if (sysAdmin) {
                    hasPublishPermission = true;
                }
            }
            let status = client_1.PostStatus.DRAFT;
            if (input.publishNow) {
                status = client_1.PostStatus.PUBLISHED;
            }
            else if (input.scheduledAt) {
                status = hasPublishPermission ? client_1.PostStatus.SCHEDULED : client_1.PostStatus.PENDING_APPROVAL;
            }
            const backendUrl = (process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
            const uploadDir = (0, path_1.join)(process.cwd(), 'src/uploads');
            if (!fs.existsSync(uploadDir))
                fs.mkdirSync(uploadDir, { recursive: true });
            const resolvedMediaUrls = await Promise.all((input.mediaUrls || []).map(async (url) => {
                if (url.startsWith('data:')) {
                    const [meta, data] = url.split(',');
                    const mime = meta.split(':')[1].split(';')[0];
                    const ext = mime.split('/')[1]?.split('+')[0] || 'bin';
                    const filename = `${(0, uuid_1.v4)()}.${ext}`;
                    const filePath = (0, path_1.join)(uploadDir, filename);
                    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
                    return `${backendUrl}/uploads/${filename}`;
                }
                return url;
            }));
            const post = await this.prisma.post.create({
                data: {
                    content: input.content,
                    mediaUrls: resolvedMediaUrls,
                    scheduledAt: input.scheduledAt,
                    targetingRegions: input.targetingRegions,
                    businessId: input.businessId,
                    authorId: input.authorId,
                    status: status,
                    platformIds: input.platformIds || [],
                },
                include: {
                    business: true,
                    author: { include: { roles: { include: { permissions: true } } } },
                },
            });
            if (input.publishNow && input.platformIds && input.platformIds.length > 0) {
                console.log(`[PostsService] Instant publishing triggered for post ${post.id}`);
                const results = await this.socialAccountsService.publishToPlatforms(input.platformIds, input.content, resolvedMediaUrls);
                const platformErrors = {};
                let successCount = 0;
                results.forEach(r => {
                    if (r.success)
                        successCount++;
                    else
                        platformErrors[r.platform] = r.error || 'Unknown error';
                });
                if (Object.keys(platformErrors).length > 0) {
                    return this.prisma.post.update({
                        where: { id: post.id },
                        data: {
                            platformErrors,
                            status: successCount === 0 ? client_1.PostStatus.FAILED : client_1.PostStatus.PUBLISHED
                        },
                        include: {
                            business: true,
                            author: { include: { roles: { include: { permissions: true } } } },
                        },
                    });
                }
            }
            return post;
        }
        catch (error) {
            console.error('[PostsService.create Error]', error);
            const fs = require('fs');
            fs.appendFileSync('server_errors.log', `[${new Date().toISOString()}] PostsService.create Error: ${error.message}\nStack: ${error.stack}\nInput: ${JSON.stringify(input)}\n\n`);
            throw error;
        }
    }
    async submitForApproval(id) {
        return this.prisma.post.update({
            where: { id },
            data: { status: client_1.PostStatus.PENDING_APPROVAL },
        });
    }
    async getPendingPosts(businessId) {
        return this.prisma.post.findMany({
            where: {
                businessId,
                status: client_1.PostStatus.PENDING_APPROVAL
            },
            include: { author: true },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findAllByBusiness(businessId) {
        return this.prisma.post.findMany({
            where: { businessId },
            include: { business: true, author: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.post.findUnique({
            where: { id },
            include: { business: true, author: true },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.post.update({
            where: { id },
            data: { status },
        });
    }
    async generateAIContent(userId, prompt, tone, location, imageUrls) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });
            const finalTone = tone || user?.aiTone || 'professional';
            const hashtags = user?.aiHashtags || [];
            let enrichedPrompt = prompt;
            if (hashtags.length > 0) {
                enrichedPrompt += `\nInclude these themes or hashtags if relevant: ${hashtags.join(', ')}`;
            }
            const result = await this.aiService.generateCaption(enrichedPrompt, finalTone, location, imageUrls, user?.aiIncludeEmojis ?? true, user?.aiCaptionLength || 'medium');
            return result;
        }
        catch (error) {
            console.error('[AI Generation Error]', error?.message || error);
            throw error;
        }
    }
    async getOptimalScheduleTime(businessId) {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const scheduledTime = new Date(tomorrow);
        scheduledTime.setHours(10, 0, 0, 0);
        return scheduledTime;
    }
    async getAnalytics(businessId) {
        const posts = await this.prisma.post.findMany({
            where: { businessId },
        });
        const totalPosts = posts.length;
        const publishedPosts = posts.filter(p => p.status === client_1.PostStatus.PUBLISHED).length;
        const scheduledPosts = posts.filter(p => p.status === client_1.PostStatus.SCHEDULED).length;
        const pendingPosts = posts.filter(p => p.status === client_1.PostStatus.PENDING_APPROVAL).length;
        const metrics = posts.reduce((acc, p) => {
            acc.totalReach += p.reach || 0;
            acc.impressions += p.impressions || 0;
            acc.likes += p.likes || 0;
            acc.comments += p.comments || 0;
            acc.shares += p.shares || 0;
            acc.totalEngagement += p.engagement || 0;
            return acc;
        }, { totalReach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, totalEngagement: 0 });
        const avgEngagement = publishedPosts > 0 ? metrics.totalEngagement / publishedPosts : 0;
        return {
            totalReach: metrics.totalReach,
            impressions: metrics.impressions,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            engagement: parseFloat(avgEngagement.toFixed(2)),
            totalPosts,
            publishedPosts,
            scheduledPosts,
            pendingPosts
        };
    }
    async syncPostMetrics(id) {
        const reach = Math.floor(Math.random() * 5000) + 500;
        const impressions = Math.floor(reach * (1.2 + Math.random()));
        const likes = Math.floor(reach * 0.05);
        const comments = Math.floor(likes * 0.1);
        const shares = Math.floor(likes * 0.05);
        const engagement = parseFloat(((likes + comments + shares) / reach * 100).toFixed(2));
        return this.prisma.post.update({
            where: { id },
            data: {
                reach,
                impressions,
                likes,
                comments,
                shares,
                engagement
            }
        });
    }
    async syncAllBusinessMetrics(businessId) {
        const posts = await this.prisma.post.findMany({
            where: { businessId, status: client_1.PostStatus.PUBLISHED },
            select: { id: true }
        });
        for (const post of posts) {
            await this.syncPostMetrics(post.id);
        }
        return this.getAnalytics(businessId);
    }
    async getPlatformsByAccountIds(ids) {
        return this.prisma.socialAccount.findMany({
            where: { id: { in: ids } },
            select: { platform: true }
        });
    }
    async delete(id) {
        return this.prisma.post.delete({
            where: { id },
        });
    }
    async update(id, data) {
        return this.prisma.post.update({
            where: { id },
            data,
        });
    }
    async seedDemoData(businessId) {
        const posts = await this.prisma.post.findMany({
            where: { businessId }
        });
        const areas = ["Croydon", "Bromley", "Lewisham", "Greenwich", "Southwark", "Lambeth"];
        for (const post of posts) {
            const reach = Math.floor(Math.random() * 5000) + 500;
            const impressions = Math.floor(reach * (1.2 + Math.random()));
            const likes = Math.floor(reach * 0.05);
            const comments = Math.floor(likes * 0.1);
            const shares = Math.floor(likes * 0.05);
            const engagement = parseFloat(((likes + comments + shares) / reach * 100).toFixed(2));
            const targetingRegions = post.targetingRegions.length > 0
                ? post.targetingRegions
                : [areas[Math.floor(Math.random() * areas.length)]];
            await this.prisma.post.update({
                where: { id: post.id },
                data: {
                    reach,
                    impressions,
                    likes,
                    comments,
                    shares,
                    engagement,
                    targetingRegions,
                    status: client_1.PostStatus.PUBLISHED
                }
            });
        }
        return this.getAnalytics(businessId);
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService,
        social_accounts_service_1.SocialAccountsService])
], PostsService);
//# sourceMappingURL=posts.service.js.map