import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateTestimonialInput {
    @Field()
    name: string;

    @Field()
    area: string;

    @Field()
    content: string;

    @Field(() => ID)
    businessId: string;
}
