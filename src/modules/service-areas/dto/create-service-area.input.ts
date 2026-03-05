import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateServiceAreaInput {
    @Field()
    postcode: string;

    @Field({ nullable: true })
    location?: string;

    @Field()
    businessId: string;
}
