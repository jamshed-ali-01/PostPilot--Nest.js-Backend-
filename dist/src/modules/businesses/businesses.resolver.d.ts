import { BusinessesService } from './businesses.service';
export declare class BusinessesResolver {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    createBusiness(name: string): Promise<{
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
    }>;
    toggleActiveStatus(businessId: string, isActive: boolean, user: any): Promise<{
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
    }>;
    toggleBusinessSubscription(businessId: string, isSubscriptionActive: boolean, user: any): Promise<{
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
    }>;
    purchaseSubscription(planId: string, user: any): Promise<{
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
    }>;
    findAll(): Promise<({
        subscriptionPlan: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            price: number;
            features: string[];
            isPopular: boolean;
        } | null;
        users: {
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
        }[];
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
    findOne(id: string): Promise<({
        roles: {
            id: string;
            businessId: string | null;
            name: string;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        }[];
        users: {
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
        }[];
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
    }) | null>;
    deleteBusiness(businessId: string, user: any): Promise<boolean>;
}
