import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

@InputType()
export class CreateRoleInput {
    @Field()
    @IsString()
    name: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field(() => [String], { defaultValue: [] })
    @IsArray()
    @IsString({ each: true })
    permissionIds: string[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    businessId?: string;
}
