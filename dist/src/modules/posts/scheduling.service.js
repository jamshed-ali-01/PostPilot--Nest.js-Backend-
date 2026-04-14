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
var SchedulingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
const social_accounts_service_js_1 = require("../social-accounts/social-accounts.service.js");
const client_1 = require("@prisma/client");
let SchedulingService = SchedulingService_1 = class SchedulingService {
    prisma;
    socialAccountsService;
    logger = new common_1.Logger(SchedulingService_1.name);
    constructor(prisma, socialAccountsService) {
        this.prisma = prisma;
        this.socialAccountsService = socialAccountsService;
    }
    async handleScheduledPosts() {
        this.logger.debug('Checking for scheduled posts to publish...');
        const postsToPublish = await this.prisma.post.findMany({
            where: {
                status: client_1.PostStatus.SCHEDULED,
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
                const results = await this.socialAccountsService.publishToPlatforms(post.platformIds, post.content, post.mediaUrls);
                const platformErrors = {};
                const platformPostIds = {};
                let successCount = 0;
                results.forEach(r => {
                    if (r.success) {
                        successCount++;
                        if (r.data && (r.data.id || r.data.fbid)) {
                            platformPostIds[r.platform] = r.data.id || r.data.fbid;
                        }
                    }
                    else {
                        platformErrors[r.platform] = r.error || 'Unknown error';
                    }
                });
                await this.prisma.post.update({
                    where: { id: post.id },
                    data: {
                        status: successCount > 0 ? client_1.PostStatus.PUBLISHED : client_1.PostStatus.FAILED,
                        publishedAt: successCount > 0 ? new Date() : null,
                        platformErrors,
                        platformPostIds,
                    },
                });
                this.logger.log(`Post ${post.id} processing complete. Success: ${successCount > 0}`);
            }
            catch (error) {
                this.logger.error(`Failed to publish scheduled post ${post.id}:`, error);
                await this.prisma.post.update({
                    where: { id: post.id },
                    data: { status: client_1.PostStatus.FAILED },
                });
            }
        }
    }
};
exports.SchedulingService = SchedulingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulingService.prototype, "handleScheduledPosts", null);
exports.SchedulingService = SchedulingService = SchedulingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        social_accounts_service_js_1.SocialAccountsService])
], SchedulingService);
//# sourceMappingURL=scheduling.service.js.map