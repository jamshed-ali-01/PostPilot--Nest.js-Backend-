import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from '../../subscription-plans/entities/subscription-plan.entity';
export declare class Business {
    id: string;
    name: string;
    logo?: string;
    theme: string;
    isActive: boolean;
    isSubscriptionActive: boolean;
    subscriptionPlan?: SubscriptionPlan;
    subscriptionPlanId?: string;
    users: User[];
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    trialEndsAt?: Date;
}
