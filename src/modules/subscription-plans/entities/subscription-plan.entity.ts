import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class SubscriptionPlan {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field(() => Float)
    price: number;

    @Field({ nullable: true })
    description?: string;

    @Field(() => [String])
    features: string[];

    @Field()
    isPopular: boolean;
}
