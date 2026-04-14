import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ScheduleSuggestion {
  @Field()
  time: Date;

  @Field()
  reason: string;

  @Field()
  boost: string;
}
