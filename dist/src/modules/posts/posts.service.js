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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_service_1 = require("./ai.service");
const client_1 = require("@prisma/client");
let PostsService = class PostsService {
    prisma;
    aiService;
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async create(input) {
        try {
            const author = await this.prisma.user.findUnique({
                where: { id: input.authorId },
                include: { roles: { include: { permissions: true } } }
            });
            const hasPublishPermission = author?.roles.some(role => role.permissions.some(p => p.name === 'PUBLISH_POST'));
            let status = client_1.PostStatus.DRAFT;
            if (input.scheduledAt) {
                status = hasPublishPermission ? client_1.PostStatus.SCHEDULED : client_1.PostStatus.PENDING_APPROVAL;
            }
            return await this.prisma.post.create({
                data: {
                    content: input.content,
                    mediaUrls: input.mediaUrls,
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
        ai_service_1.AIService])
], PostsService);
//# sourceMappingURL=posts.service.js.map