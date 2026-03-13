import { BusinessesService } from './businesses.service';
export declare class BusinessesResolver {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    createBusiness(name: string): Promise<{
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
    }>;
    toggleActiveStatus(businessId: string, isActive: boolean, user: any): Promise<{
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
    }>;
    toggleBusinessSubscription(businessId: string, isSubscriptionActive: boolean, user: any): Promise<{
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
    }>;
    purchaseSubscription(planId: string, user: any): Promise<{
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
    }>;
    findAll(): Promise<({
        users: {
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
        }[];
        subscriptionPlan: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            features: string[];
            isPopular: boolean;
        } | null;
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
    findOne(id: string): Promise<({
        roles: {
            id: string;
            name: string;
            description: string | null;
            businessId: string | null;
            permissionIds: string[];
            userIds: string[];
        }[];
        users: {
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
        }[];
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
    }) | null>;
    deleteBusiness(businessId: string, user: any): Promise<boolean>;
}
