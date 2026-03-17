import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateSystemSettingsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  key: string;

  @Field(() => GraphQLJSONObject)
  value: any;
}
