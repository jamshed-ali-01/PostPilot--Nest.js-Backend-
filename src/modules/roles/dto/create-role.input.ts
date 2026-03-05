import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateRoleInput {
    @Field()
    name: string;

    @Field({ nullable: true })
    description?: string;

    @Field(() => [String], { defaultValue: [] })
    permissionIds: string[];

    @Field({ nullable: true })
    businessId?: string;
}
