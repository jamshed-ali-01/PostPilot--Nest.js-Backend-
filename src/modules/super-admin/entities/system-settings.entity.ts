import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';

@ObjectType()
export class SystemSettings {
  @Field(() => ID)
  id: string;

  @Field()
  key: string;

  @Field(() => GraphQLJSONObject)
  value: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
