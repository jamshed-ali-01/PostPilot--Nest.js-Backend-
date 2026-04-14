import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateTestimonialInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    area: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    content: string;

    @Field(() => ID)
    @IsString()
    @IsNotEmpty()
    businessId: string;
}
