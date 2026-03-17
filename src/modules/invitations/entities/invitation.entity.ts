import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from '../../roles/entities/role.entity.js';
import { Business } from '../../businesses/entities/business.entity.js';

@ObjectType()
export class Invitation {
    @Field(() => ID)
    id: string;

    @Field()
    token: string;

    @Field()
    email: string;

    @Field()
    roleId: string;

    @Field(() => Role, { nullable: true })
    role?: Role;

    @Field()
    businessId: string;

    @Field(() => Business, { nullable: true })
    business?: Business;

    @Field()
    expiresAt: Date;

    @Field({ nullable: true })
    acceptedAt?: Date;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
