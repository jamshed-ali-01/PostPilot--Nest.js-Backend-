import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateAdInput } from './create-ad.input';

@InputType()
export class UpdateAdInput extends PartialType(CreateAdInput) {
    @Field(() => ID)
    id: string;
}
