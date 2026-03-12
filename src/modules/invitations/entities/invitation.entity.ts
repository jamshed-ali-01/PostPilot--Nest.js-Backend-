import { ObjectType, Field, ID } from '@nestjs/graphql';

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

    @Field()
    businessId: string;

    @Field()
    expiresAt: Date;

    @Field({ nullable: true })
    acceptedAt?: Date;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
