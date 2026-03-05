import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    password: string;
}

@InputType()
export class RegisterInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @MinLength(6)
    password: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    businessId?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    businessName?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    firstName?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    lastName?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    planId?: string;
}
