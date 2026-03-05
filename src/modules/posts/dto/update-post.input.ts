import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreatePostInput } from './create-post.input';

@InputType()
export class UpdatePostInput extends PartialType(CreatePostInput) {
    @Field(() => ID)
    id: string;
}
