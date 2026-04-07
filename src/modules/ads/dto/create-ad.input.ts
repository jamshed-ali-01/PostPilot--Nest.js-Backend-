import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateAdInput {
    @Field()
    @IsNotEmpty()
    @IsString()
    headline: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    primaryText: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    mediaUrls?: string[];

    @Field()
    @IsNotEmpty()
    @IsString()
    platform: string;

    @Field(() => ID)
    @IsNotEmpty()
    @IsString()
    businessId: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    adAccountId?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    pageId?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    budget?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    postcode?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDate?: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    destinationLink?: string;
}
