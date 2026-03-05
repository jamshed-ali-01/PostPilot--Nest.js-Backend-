import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class BusinessAnalytics {
    @Field()
    totalReach: number;

    @Field()
    engagement: number;

    @Field()
    impressions: number;

    @Field()
    likes: number;

    @Field()
    comments: number;

    @Field()
    shares: number;

    @Field()
    totalPosts: number;

    @Field()
    publishedPosts: number;

    @Field()
    scheduledPosts: number;

    @Field()
    pendingPosts: number;
}
