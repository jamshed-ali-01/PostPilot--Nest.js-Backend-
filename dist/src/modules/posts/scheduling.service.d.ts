import { PrismaService } from '../../prisma/prisma.service.js';
import { SocialAccountsService } from '../social-accounts/social-accounts.service.js';
export declare class SchedulingService {
    private prisma;
    private socialAccountsService;
    private readonly logger;
    constructor(prisma: PrismaService, socialAccountsService: SocialAccountsService);
    handleScheduledPosts(): Promise<void>;
}
