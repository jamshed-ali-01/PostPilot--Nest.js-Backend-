import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateInvitationInput {
    @Field()
    email: string;

    @Field(() => ID)
    roleId: string;

    @Field(() => ID)
    businessId: string;
}
