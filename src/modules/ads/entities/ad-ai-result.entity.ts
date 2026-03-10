import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AIAdResult {
    @Field()
    headline: string;

    @Field()
    primaryText: string;

    @Field()
    description: string;
}
