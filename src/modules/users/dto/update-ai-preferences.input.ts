import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class UpdateAiPreferencesInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    aiTone?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    aiHashtags?: string[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    aiCaptionLength?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    aiIncludeEmojis?: boolean;
}
