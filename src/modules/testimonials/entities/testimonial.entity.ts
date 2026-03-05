import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { TestimonialStatus } from '@prisma/client';

registerEnumType(TestimonialStatus, {
    name: 'TestimonialStatus',
});

@ObjectType()
export class Testimonial {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field()
    area: string;

    @Field()
    content: string;

    @Field(() => TestimonialStatus)
    status: TestimonialStatus;

    @Field(() => ID)
    businessId: string;

    @Field()
    createdAt: Date;
}
