import { PrismaService } from '../../prisma/prisma.service.js';
export declare class SuperAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllBusinesses(): Promise<({
        _count: {
            users: number;
            posts: number;
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
        isSubscriptionActive: boolean;
        subscriptionPlanId: string | null;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        trialEndsAt: Date | null;
    })[]>;
    getAllUsers(): Promise<({
        roles: {
            id: string;
            name: string;
            description: string | null;
            businessId: string | null;
            permissionIds: string[];
            userIds: string[];
        }[];
        business: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            logo: string | null;
            theme: string | null;
            isActive: boolean;
            isSubscriptionActive: boolean;
            subscriptionPlanId: string | null;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            stripePriceId: string | null;
            trialEndsAt: Date | null;
        } | null;
    } & {
        id: string;
        roleIds: string[];
        businessId: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getGlobalStats(): Promise<{
        businessCount: number;
        userCount: number;
        postCount: number;
        testimonialCount: number;
    }>;
    createGlobalPermission(name: string, description?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        roleIds: string[];
    }>;
    createGlobalRole(name: string, description: string, permissionIds: string[]): Promise<{
        permissions: {
            id: string;
            name: string;
            description: string | null;
            roleIds: string[];
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        businessId: string | null;
        permissionIds: string[];
        userIds: string[];
    }>;
}
