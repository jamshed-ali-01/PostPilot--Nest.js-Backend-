import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Permission } from './permission.entity';

@ObjectType()
export class Role {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    description?: string;

    @Field(() => [Permission])
    permissions: Permission[];
}
