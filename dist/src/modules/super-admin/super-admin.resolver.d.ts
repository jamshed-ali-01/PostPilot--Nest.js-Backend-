import { SuperAdminService } from './super-admin.service.js';
import { UpdateSystemSettingsInput } from './dto/update-system-settings.input.js';
export declare class SuperAdminResolver {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
    getAllBusinesses(): Promise<({
        _count: {
            posts: number;
            users: number;
            testimonials: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
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
        business: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
        roles: {
            id: string;
            businessId: string | null;
            name: string;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        }[];
    } & {
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getGlobalStats(): Promise<{
        businessCount: number;
        userCount: number;
        postCount: number;
        testimonialCount: number;
    }>;
    getSystemSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    updateSystemSettings(input: UpdateSystemSettingsInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
