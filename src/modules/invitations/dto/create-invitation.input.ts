import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateInvitationInput {
    @Field()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Field(() => ID)
    @IsString()
    @IsNotEmpty()
    roleId: string;

    @Field(() => ID, { nullable: true })
    @IsString()
    businessId?: string;
}
