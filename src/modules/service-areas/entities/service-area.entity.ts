import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ServiceArea {
    @Field(() => ID)
    id: string;

    @Field()
    postcode: string;

    @Field({ nullable: true })
    location?: string;

    @Field()
    businessId: string;
}
