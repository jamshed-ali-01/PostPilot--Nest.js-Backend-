import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class FbAdAccount {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    currency?: string;
}

@ObjectType()
export class FbPage {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;
}
