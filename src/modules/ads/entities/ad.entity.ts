import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { AdStatus } from '@prisma/client';

registerEnumType(AdStatus, {
    name: 'AdStatus',
});

@ObjectType()
export class Ad {
    @Field(() => ID)
    id: string;

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

    @Field(() => AdStatus)
    status: AdStatus;

    @Field(() => ID)
    businessId: string;

    @Field({ nullable: true })
    adAccountId?: string;

    @Field({ nullable: true })
    pageId?: string;

    @Field({ nullable: true })
    campaignId?: string;

    @Field({ nullable: true })
    adSetId?: string;

    @Field({ nullable: true })
    metaAdId?: string;

    @Field({ nullable: true })
    budget?: number;

    @Field({ nullable: true })
    postcode?: string;

    @Field({ nullable: true })
    startDate?: Date;

    @Field({ nullable: true })
    endDate?: Date;

    @Field({ nullable: true })
    metaError?: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
