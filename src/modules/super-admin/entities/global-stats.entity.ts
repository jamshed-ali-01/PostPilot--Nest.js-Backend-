import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class GlobalStats {
    @Field(() => Int)
    businessCount: number;

    @Field(() => Int)
    userCount: number;

    @Field(() => Int)
    postCount: number;

    @Field(() => Int)
    testimonialCount: number;
}
