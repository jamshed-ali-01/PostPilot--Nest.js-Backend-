import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { PostStatus } from '@prisma/client';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';

registerEnumType(PostStatus, {
    name: 'PostStatus',
});

@ObjectType()
export class Post {
    @Field(() => ID)
    id: string;

    @Field()
    content: string;

    @Field(() => [String])
    mediaUrls: string[];

    @Field(() => PostStatus)
    status: PostStatus;

    @Field({ nullable: true })
    scheduledAt?: Date;

    @Field({ nullable: true })
    publishedAt?: Date;

    @Field({ nullable: true })
    businessId?: string;

    @Field(() => Business, { nullable: true })
    business?: Business;

    @Field({ nullable: true })
    authorId?: string;

    @Field(() => User)
    author: User;

    @Field(() => [String])
    targetingRegions: string[];

    @Field(() => [String], { defaultValue: [] })
    platformIds: string[];

    @Field(() => [String], { defaultValue: [] })
    platforms: string[];

    @Field()
    reach: number;

    @Field()
    impressions: number;

    @Field()
    likes: number;

    @Field()
    comments: number;

    @Field()
    shares: number;

    @Field()
    engagement: number;

    @Field(() => GraphQLJSONObject, { nullable: true })
    platformErrors?: any;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
