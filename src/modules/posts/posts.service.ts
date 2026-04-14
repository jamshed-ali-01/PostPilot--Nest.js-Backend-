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
                const results = await this.socialAccountsService.publishToPlatforms(
                    input.platformIds,
                    input.content,
                    resolvedMediaUrls
                );

                const platformErrors: any = {};
                const platformPostIds: any = {};
                let successCount = 0;
                results.forEach(r => {
                    if (r.success) {
                        successCount++;
                        if (r.data && (r.data.id || r.data.fbid)) {
                            platformPostIds[r.platform] = r.data.id || r.data.fbid;
                        }
                    }
                    else platformErrors[r.platform] = r.error || 'Unknown error';
                });

                if (successCount > 0 || Object.keys(platformErrors).length > 0) {
                    return this.prisma.post.update({
                        where: { id: post.id },
                        data: { 
                            platformErrors,
                            platformPostIds,
                            status: successCount === 0 ? PostStatus.FAILED : PostStatus.PUBLISHED,
                            publishedAt: successCount > 0 ? new Date() : null
                        } as any,
                        include: {
                            business: true,
                            author: { include: { roles: { include: { permissions: true } } } },
                        },
                    });
                }
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

    async getRecommendedScheduleTimes(businessId: string): Promise<Date[]> {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const posts = await this.prisma.post.findMany({
            where: {
                businessId,
                status: PostStatus.PUBLISHED,
                publishedAt: { gte: ninetyDaysAgo },
            },
            select: {
                publishedAt: true,
                reach: true,
                engagement: true,
            },
        });

        // Fallback for new users or users with very few posts
        if (posts.length < 5) {
            return this.getDefaultOptimalTimes();
        }

        // Group by Day (0-6) and Hour (0-23)
        const stats: Record<string, { totalReach: number; count: number }> = {};

        posts.forEach(post => {
            if (!post.publishedAt) return;
            const date = new Date(post.publishedAt);
            const day = date.getUTCDay();
            const hour = date.getUTCHours();
            const key = `${day}-${hour}`;

            if (!stats[key]) {
                stats[key] = { totalReach: 0, count: 0 };
            }
            stats[key].totalReach += post.reach || 0;
            stats[key].count += 1;
        });

        // Calculate averages and sort
        const recommendations = Object.entries(stats)
            .map(([key, data]) => {
                const [day, hour] = key.split('-').map(Number);
                return {
                    day,
                    hour,
                    avgReach: data.totalReach / data.count,
                };
            })
            .sort((a, b) => b.avgReach - a.avgReach)
            .slice(0, 3);

        return recommendations.map(rec => this.getNextOccurrence(rec.day, rec.hour));
    }

    private getDefaultOptimalTimes(): Date[] {
        const times: { day: number | null; hour: number }[] = [
            { day: null, hour: 10 }, // Weekdays/Daily 10 AM
            { day: null, hour: 18 }, // Weekdays/Daily 6 PM
            { day: null, hour: 13 }, // Weekdays/Daily 1 PM
        ];

        return times.map(t => {
            const date = new Date();
            date.setUTCHours(t.hour, 0, 0, 0);
            if (date <= new Date()) {
                date.setUTCDate(date.getUTCDate() + 1);
            }
            return date;
        });
    }

    private getNextOccurrence(day: number, hour: number): Date {
        const now = new Date();
        const next = new Date(now);
        next.setUTCHours(hour, 0, 0, 0);

        while (next <= now || next.getUTCDay() !== day) {
            next.setUTCDate(next.getUTCDate() + 1);
        }

        return next;
    }

    async getOptimalScheduleTime(businessId: string): Promise<Date> {
        const recs = await this.getRecommendedScheduleTimes(businessId);
        return recs[0];
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
            // Only aggregate metrics for posts that have been verified on Meta/LinkedIn
            const isVerified = p.status === PostStatus.PUBLISHED && p.platformPostIds && Object.keys(p.platformPostIds as any).length > 0;
            
            if (isVerified) {
                acc.totalReach += p.reach || 0;
                acc.impressions += p.impressions || 0;
                acc.likes += p.likes || 0;
                acc.comments += p.comments || 0;
                acc.shares += p.shares || 0;
                acc.totalEngagement += p.engagement || 0;
                acc.verifiedCount += 1;
            }
            return acc;
        }, { totalReach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, totalEngagement: 0, verifiedCount: 0 });

        const avgEngagement = metrics.verifiedCount > 0 ? metrics.totalEngagement / metrics.verifiedCount : 0;

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
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { business: { include: { socialAccounts: true } } }
        });

        if (!post || post.status !== PostStatus.PUBLISHED || !post.platformPostIds) {
            return post;
        }

        let totalReach = 0;
        let totalImpressions = 0;
        let totalLikes = 0;
        let totalComments = 0;
        let totalShares = 0;

        for (const saId of post.platformIds) {
            const account = post.business?.socialAccounts.find(a => a.id === saId && a.isActive);
            if (!account || !account.accessToken) continue;

            const platform = account.platform;
            const remoteId = (post.platformPostIds as any)?.[platform];
            if (!remoteId) continue;

            try {
                if (platform === 'FACEBOOK') {
                    console.log(`[PostsService] Syncing Meta stats for post ${id} (Remote: ${remoteId}) using account ${account.accountName}`);
                    
                    try {
                        console.log(`[PostsService] Fetching Interactions for ${remoteId}...`);
                        
                        // 1. Fetch Likes (using connections for better resilience)
                        const likesRes = await fetch(`https://graph.facebook.com/v19.0/${remoteId}/likes?summary=true&limit=0&access_token=${account.accessToken}`);
                        const likesData = await likesRes.json();
                        if (likesData.summary) {
                            totalLikes += likesData.summary.total_count || 0;
                        } else if (likesData.error) {
                            console.warn(`[PostsService] Likes connection failed, trying field fallback...`);
                            // Fallback to field if connection fails
                            const fRes = await fetch(`https://graph.facebook.com/v19.0/${remoteId}?fields=reactions.summary(total_count),like_count&access_token=${account.accessToken}`);
                            const fData = await fRes.json();
                            totalLikes += fData.reactions?.summary?.total_count ?? fData.like_count ?? 0;
                        }

                        // 2. Fetch Comments
                        const commentsRes = await fetch(`https://graph.facebook.com/v19.0/${remoteId}/comments?summary=true&limit=0&access_token=${account.accessToken}`);
                        const commentsData = await commentsRes.json();
                        if (commentsData.summary) {
                            totalComments += commentsData.summary.total_count || 0;
                        } else {
                            const fRes = await fetch(`https://graph.facebook.com/v19.0/${remoteId}?fields=comments_count&access_token=${account.accessToken}`);
                            const fData = await fRes.json();
                            totalComments += fData.comments_count || 0;
                        }

                        // 3. Fetch Shares
                        const sharesRes = await fetch(`https://graph.facebook.com/v19.0/${remoteId}?fields=shares&access_token=${account.accessToken}`);
                        const sharesData = await sharesRes.json();
                        totalShares += sharesData.shares?.count || 0;

                        console.log(`[PostsService] Meta Interactions Success: Likes=${totalLikes}, Comments=${totalComments}`);
                    } catch (e) {
                         console.error(`[PostsService] Meta Interactions Exception:`, e);
                    }

                    // 4. Fetch Insights (Reach/Impressions)
                    const tryFetchInsights = async (targetId: string, metrics: string) => {
                         // Adding period=lifetime is often required for post-level insights
                         const res = await fetch(`https://graph.facebook.com/v19.0/${targetId}/insights?metric=${metrics}&period=lifetime&access_token=${account.accessToken}`);
                         return await res.json();
                    };

                    try {
                        console.log(`[PostsService] Fetching Insights for ${remoteId}...`);
                        // TRY 1: Standard Post Metrics
                        let insights = await tryFetchInsights(remoteId, 'post_impressions,post_impressions_unique');
                        
                        // TRY 2: Video/Reel/Simplified Metrics Fallback
                        if (insights.error) {
                             insights = await tryFetchInsights(remoteId, 'impressions,reach,post_video_views');
                        }

                        if (insights.error) {
                            console.warn(`[PostsService] Meta Insights (Reach) may be unavailable for post ${id}:`, insights.error.message);
                        } else if (insights.data) {
                            const imp = insights.data.find((m: any) => m.name === 'post_impressions' || m.name === 'impressions')?.values[0]?.value || 0;
                            const rch = insights.data.find((m: any) => m.name === 'post_impressions_unique' || m.name === 'reach')?.values[0]?.value || 0;
                            const videoViews = insights.data.find((m: any) => m.name === 'post_video_views')?.values[0]?.value || 0;
                            
                            totalImpressions += (imp || videoViews);
                            totalReach += (rch || imp || videoViews);
                            console.log(`[PostsService] Meta Insights Success: Reach=${totalReach}, Impressions=${totalImpressions}`);
                        }
                    } catch (e) {
                        console.error(`[PostsService] Meta Insights Exception:`, e);
                    }
                } else if (platform === 'LINKEDIN') {
                    // LinkedIn Stats
                    const orgUrn = account.accountId.startsWith('urn:li:organization:') ? account.accountId : null;
                    if (orgUrn) {
                        const statsRes = await fetch(
                            `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${orgUrn}&shares[0]=${remoteId}`,
                            { headers: { Authorization: `Bearer ${account.accessToken}` } }
                        );
                        const stats = await statsRes.json();
                        if (stats.elements?.[0]) {
                            const e = stats.elements[0].totalShareStatistics;
                            totalImpressions += e.impressionCount || 0;
                            totalLikes += e.likeCount || 0;
                            totalComments += e.commentCount || 0;
                            totalShares += e.shareCount || 0;
                            totalReach += e.uniqueImpressionsCount || e.impressionCount || 0;
                        }
                    }
                }
            } catch (err) {
                console.error(`[PostsService] Error syncing metrics for post ${id}:`, err);
            }
        }

        const engagement = totalReach > 0 
            ? parseFloat(((totalLikes + totalComments + totalShares) / totalReach * 100).toFixed(2))
            : 0;

        return this.prisma.post.update({
            where: { id },
            data: {
                reach: totalReach,
                impressions: totalImpressions,
                likes: totalLikes,
                comments: totalComments,
                shares: totalShares,
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
}
