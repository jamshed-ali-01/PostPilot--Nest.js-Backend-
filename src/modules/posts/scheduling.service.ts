import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SocialAccountsService } from '../social-accounts/social-accounts.service.js';
import { PostStatus } from '@prisma/client';

@Injectable()
export class SchedulingService {
    private readonly logger = new Logger(SchedulingService.name);

    constructor(
        private prisma: PrismaService,
        private socialAccountsService: SocialAccountsService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleScheduledPosts() {
        this.logger.debug('Checking for scheduled posts to publish...');

        const postsToPublish = await this.prisma.post.findMany({
            where: {
                status: PostStatus.SCHEDULED,
                scheduledAt: {
                    lte: new Date(),
                },
            },
            include: {
                business: true,
            },
        });

        if (postsToPublish.length === 0) {
            return;
        }

        this.logger.log(`Found ${postsToPublish.length} posts to publish.`);

        for (const post of postsToPublish) {
            try {
                this.logger.log(`Publishing post ${post.id} to platforms: ${post.platformIds.join(', ')}`);
                
                const results = await this.socialAccountsService.publishToPlatforms(
                    post.platformIds,
                    post.content,
                    post.mediaUrls
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
                    } else {
                        platformErrors[r.platform] = r.error || 'Unknown error';
                    }
                });

                await this.prisma.post.update({
                    where: { id: post.id },
                    data: {
                        status: successCount > 0 ? PostStatus.PUBLISHED : PostStatus.FAILED,
                        publishedAt: successCount > 0 ? new Date() : null,
                        platformErrors,
                        platformPostIds,
                    } as any,
                });

                this.logger.log(`Post ${post.id} processing complete. Success: ${successCount > 0}`);
            } catch (error) {
                this.logger.error(`Failed to publish scheduled post ${post.id}:`, error);
                await this.prisma.post.update({
                    where: { id: post.id },
                    data: { status: PostStatus.FAILED },
                });
            }
        }
    }
}
