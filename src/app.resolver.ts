import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
    @Query(() => String)
    hello(): string {
        return 'Welcome to Post Pilot API!';
    }
}
