import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIService } from './ai.service';
import { CreatePostInput } from './dto/create-post.input';
import { PostStatus } from '@prisma/client';
import { SocialAccountsService } from '../social-accounts/social-accounts.service';
import * as fs from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostsService {
    constructor(
        private prisma: PrismaService,
        private aiService: AIService,
        private socialAccountsService: SocialAccountsService,
    ) { }

    async create(input: CreatePostInput) {
        try {
            const author = input.authorId ? await this.prisma.user.findUnique({
                where: { id: input.authorId },
                include: { roles: { include: { permissions: true } } }
            }) : null;

            // If author not found in User table, check if it's a SystemAdmin
            let hasPublishPermission = false;
            if (author) {
                hasPublishPermission = author.roles.some(role =>
                    role.permissions.some(p => p.name === 'PUBLISH_POST')
                );
            } else {
                // Check if authorId belongs to a SystemAdmin
                const sysAdmin = await this.prisma.systemAdmin.findUnique({
                    where: { id: input.authorId }
                });
                if (sysAdmin) {
                    hasPublishPermission = true; // SystemAdmins always have permission
                }
            }

            let status: PostStatus = PostStatus.DRAFT;
            if (input.publishNow) {
                status = PostStatus.PUBLISHED;
            } else if (input.scheduledAt) {
                status = hasPublishPermission ? PostStatus.SCHEDULED : PostStatus.PENDING_APPROVAL;
            }

            // Convert any base64 data URLs to disk files before saving to DB
            const backendUrl = (process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
            const uploadDir = join(process.cwd(), 'src/uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const resolvedMediaUrls = await Promise.all(
                (input.mediaUrls || []).map(async (url: string) => {
                    if (url.startsWith('data:')) {
                        const [meta, data] = url.split(',');
                        const mime = meta.split(':')[1].split(';')[0];
                        const ext = mime.split('/')[1]?.split('+')[0] || 'bin';
                        const filename = `${uuidv4()}.${ext}`;
                        const filePath = join(uploadDir, filename);
                        fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
                        return `${backendUrl}/uploads/${filename}`;
                    }
                    return url;
                })
            );

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

            // Handle Instant Publishing
            if (input.publishNow && input.platformIds && input.platformIds.length > 0) {
                console.log(`[PostsService] Instant publishing triggered for post ${post.id}`);
                await this.socialAccountsService.publishToPlatforms(
                    input.platformIds,
                    input.content,
                    resolvedMediaUrls
                );
            }

            return post;
        } catch (error: any) {
            console.error('[PostsService.create Error]', error);
            const fs = require('fs');
            fs.appendFileSync('server_errors.log', `[${new Date().toISOString()}] PostsService.create Error: ${error.message}\nStack: ${error.stack}\nInput: ${JSON.stringify(input)}\n\n`);
            throw error;
        }
    }

    async submitForApproval(id: string) {
        return this.prisma.post.update({
            where: { id },
            data: { status: PostStatus.PENDING_APPROVAL },
        });
    }

    async getPendingPosts(businessId: string) {
        return this.prisma.post.findMany({
            where: {
                businessId,
                status: PostStatus.PENDING_APPROVAL
            },
            include: { author: true },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findAllByBusiness(businessId: string) {
        return this.prisma.post.findMany({
            where: { businessId },
            include: { business: true, author: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.post.findUnique({
            where: { id },
            include: { business: true, author: true },
        });
    }

    async updateStatus(id: string, status: PostStatus) {
        return this.prisma.post.update({
            where: { id },
            data: { status },
        });
    }

    async generateAIContent(userId: string, prompt: string, tone?: string, location?: string, imageUrls?: string[]) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });

            // Use user's preferences if not explicitly provided
            const finalTone = tone || user?.aiTone || 'professional';
            const hashtags = user?.aiHashtags || [];

            // Enrich prompt with user preferences if needed
            let enrichedPrompt = prompt;
            if (hashtags.length > 0) {
                enrichedPrompt += `\nInclude these themes or hashtags if relevant: ${hashtags.join(', ')}`;
            }

            const result = await this.aiService.generateCaption(
                enrichedPrompt,
                finalTone,
                location,
                imageUrls,
                user?.aiIncludeEmojis ?? true,
                user?.aiCaptionLength || 'medium'
            );
            return result;
        } catch (error: any) {
            console.error('[AI Generation Error]', error?.message || error);
            throw error;
        }
    }

    async getOptimalScheduleTime(businessId: string): Promise<Date> {
        // Mock AI scheduling logic
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const scheduledTime = new Date(tomorrow);
        scheduledTime.setHours(10, 0, 0, 0);
        return scheduledTime;
    }

    async getAnalytics(businessId: string) {
        const posts = await this.prisma.post.findMany({
            where: { businessId },
        });

        const totalPosts = posts.length;
        const publishedPosts = posts.filter(p => p.status === PostStatus.PUBLISHED).length;
        const scheduledPosts = posts.filter(p => p.status === PostStatus.SCHEDULED).length;
        const pendingPosts = posts.filter(p => p.status === PostStatus.PENDING_APPROVAL).length;

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

    async syncPostMetrics(id: string) {
        // Mocking a sync from Meta/LinkedIn API
        // In reality, this would use SocialAccount tokens to fetch data
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

    async syncAllBusinessMetrics(businessId: string) {
        const posts = await this.prisma.post.findMany({
            where: { businessId, status: PostStatus.PUBLISHED },
            select: { id: true }
        });

        for (const post of posts) {
            await this.syncPostMetrics(post.id);
        }

        return this.getAnalytics(businessId);
    }

    async getPlatformsByAccountIds(ids: string[]) {
        return this.prisma.socialAccount.findMany({
            where: { id: { in: ids } },
            select: { platform: true }
        });
    }

    async delete(id: string) {
        return this.prisma.post.delete({
            where: { id },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.post.update({
            where: { id },
            data,
        });
    }
    async seedDemoData(businessId: string) {
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

            // Randomly assign some areas if none exist
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
                    status: PostStatus.PUBLISHED // Make them published for analytics
                }
            });
        }

        return this.getAnalytics(businessId);
    }
}
