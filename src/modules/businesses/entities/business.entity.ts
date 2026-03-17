import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from '../../subscription-plans/entities/subscription-plan.entity';

@ObjectType()
export class Business {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    logo?: string;

    @Field({ nullable: true })
    phone?: string;

    @Field({ nullable: true })
    email?: string;

    @Field()
    theme: string;

    @Field(() => Boolean, { defaultValue: false })
    isActive: boolean;

    @Field(() => Boolean, { defaultValue: false })
    isSubscriptionActive: boolean;

    @Field(() => SubscriptionPlan, { nullable: true })
    subscriptionPlan?: SubscriptionPlan;

    @Field({ nullable: true })
    subscriptionPlanId?: string;

    @Field(() => [User])
    users: User[];

    @Field({ nullable: true })
    stripeCustomerId?: string;

    @Field({ nullable: true })
    stripeSubscriptionId?: string;

    @Field({ nullable: true })
    stripePriceId?: string;

    @Field({ nullable: true })
    trialEndsAt?: Date;
}
