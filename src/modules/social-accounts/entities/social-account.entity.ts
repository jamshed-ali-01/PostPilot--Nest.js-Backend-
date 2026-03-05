import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Business } from '../../businesses/entities/business.entity';

@ObjectType()
export class SocialAccount {
    @Field(() => ID)
    id: string;

    @Field()
    platform: string; // FACEBOOK, INSTAGRAM, LINKEDIN, GOOGLE_BUSINESS

    @Field()
    accountName: string;

    @Field()
    accountId: string;

    @Field({ nullable: true })
    isActive: boolean;

    @Field(() => Business)
    business: Business;

    @Field()
    businessId: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
