import { PrismaService } from '../../prisma/prisma.service.js';
export declare class SuperAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllBusinesses(): Promise<({
        _count: {
            posts: number;
            users: number;
            testimonials: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        theme: string | null;
        isActive: boolean;
        subscriptionPlanId: string | null;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        trialEndsAt: Date | null;
    })[]>;
    getAllUsers(): Promise<({
        business: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            logo: string | null;
            theme: string | null;
            isActive: boolean;
            subscriptionPlanId: string | null;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            stripePriceId: string | null;
            trialEndsAt: Date | null;
        };
        roles: {
            id: string;
            name: string;
            description: string | null;
            businessId: string | null;
            permissionIds: string[];
            userIds: string[];
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        businessId: string;
        roleIds: string[];
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
    })[]>;
    getGlobalStats(): Promise<{
        businessCount: number;
        userCount: number;
        postCount: number;
        testimonialCount: number;
    }>;
}
