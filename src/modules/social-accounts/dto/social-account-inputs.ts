import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class ConnectSocialAccountInput {
    @Field()
    @IsNotEmpty()
    @IsString()
    platform: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    accountName: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    accountId: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    accessToken?: string;
}
