import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from '../../roles/entities/role.entity';
import { Business } from '../../businesses/entities/business.entity';

@ObjectType()
export class User {
    @Field(() => ID)
    id: string;

    @Field()
    email: string;

    @Field({ nullable: true })
    firstName?: string;

    @Field({ nullable: true })
    lastName?: string;

    @Field()
    businessId: string;

    @Field(() => Business, { nullable: true })
    business?: Business;

    @Field(() => [Role])
    roles: Role[];

    @Field({ nullable: true })
    aiTone?: string;

    @Field(() => [String])
    aiHashtags: string[];

    @Field({ nullable: true })
    aiCaptionLength?: string;

    @Field({ nullable: true })
    aiIncludeEmojis?: boolean;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
