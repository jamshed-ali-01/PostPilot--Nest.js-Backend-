import { Resolver, Query, Args, Mutation, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateAiPreferencesInput } from './dto/update-ai-preferences.input';

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) { }

    @Query(() => User, { name: 'user', nullable: true })
    async findByEmail(@Args('email') email: string) {
        return this.usersService.findByEmail(email);
    }

    @Mutation(() => User)
    @UseGuards(GqlAuthGuard)
    async updateAiPreferences(
        @CurrentUser() user: any,
        @Args('input') input: UpdateAiPreferencesInput
    ) {
        return this.usersService.updateAiPreferences(user.id, input);
    }

    @Query(() => [User], { name: 'businessUsers' })
    @UseGuards(GqlAuthGuard)
    async findAllByBusiness(@Args('businessId', { type: () => ID }) businessId: string) {
        return this.usersService.findAllByBusiness(businessId);
    }
}
