import { SuperAdminService } from './super-admin.service.js';
export declare class SuperAdminResolver {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
    getAllBusinesses(): Promise<({
        _count: {
            users: number;
            posts: number;
            testimonials: number;
        };
    } & {
        id: string;
        name: string;
        logo: string | null;
        theme: string | null;
        isActive: boolean;
        subscriptionPlanId: string | null;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getAllUsers(): Promise<({
        business: {
            id: string;
            name: string;
            logo: string | null;
            theme: string | null;
            isActive: boolean;
            subscriptionPlanId: string | null;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            stripePriceId: string | null;
            trialEndsAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        roles: {
            id: string;
            name: string;
            businessId: string | null;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        }[];
    } & {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        businessId: string;
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        password: string;
        roleIds: string[];
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getGlobalStats(): Promise<{
        businessCount: number;
        userCount: number;
        postCount: number;
        testimonialCount: number;
    }>;
}
