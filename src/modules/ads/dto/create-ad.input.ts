import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateAdInput {
    @Field()
    headline: string;

    @Field()
    primaryText: string;

    @Field({ nullable: true })
    description?: string;

    @Field(() => [String], { nullable: true })
    mediaUrls?: string[];

    @Field()
    platform: string;

    @Field(() => ID)
    businessId: string;

    @Field({ nullable: true })
    adAccountId?: string;

    @Field({ nullable: true })
    pageId?: string;

    @Field({ nullable: true })
    budget?: number;

    @Field({ nullable: true })
    postcode?: string;

    @Field({ nullable: true })
    startDate?: Date;

    @Field({ nullable: true })
    endDate?: Date;
}
