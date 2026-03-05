import { PrismaService } from '../../prisma/prisma.service';
export declare class BusinessesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(name: string): Promise<{
        id: string;
        name: string;
        logo: string | null;
        theme: string | null;
        isActive: boolean;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        subscriptionPlanId: string | null;
    }>;
    toggleSubscription(id: string, isActive: boolean): Promise<{
        id: string;
        name: string;
        logo: string | null;
        theme: string | null;
        isActive: boolean;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        subscriptionPlanId: string | null;
    }>;
    purchaseSubscription(id: string, planId: string): Promise<{
        id: string;
        name: string;
        logo: string | null;
        theme: string | null;
        isActive: boolean;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        subscriptionPlanId: string | null;
    }>;
    findOne(id: string): Promise<({
        users: {
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
        }[];
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
        name: string;
        logo: string | null;
        theme: string | null;
        isActive: boolean;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        subscriptionPlanId: string | null;
    }) | null>;
    findAll(): Promise<({
        subscriptionPlan: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            features: string[];
            isPopular: boolean;
        } | null;
        users: {
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
        }[];
    } & {
        id: string;
        name: string;
        logo: string | null;
        theme: string | null;
        isActive: boolean;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        subscriptionPlanId: string | null;
    })[]>;
}
