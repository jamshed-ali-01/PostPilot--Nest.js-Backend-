import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreatePostInput {
    @Field()
    @IsNotEmpty()
    @IsString()
    content: string;

    @Field(() => [String], { defaultValue: [] })
    @IsArray()
    @IsString({ each: true })
    mediaUrls: string[];

    @Field({ nullable: true })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    scheduledAt?: Date;

    @Field(() => [String], { defaultValue: [] })
    @IsArray()
    @IsString({ each: true })
    targetingRegions: string[];

    @Field(() => [String], { defaultValue: [] })
    @IsArray()
    @IsString({ each: true })
    platformIds: string[];

    @Field()
    @IsNotEmpty()
    @IsString()
    businessId: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    authorId: string;
}
