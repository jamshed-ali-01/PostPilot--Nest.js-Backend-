import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Permission {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    description?: string;
}
