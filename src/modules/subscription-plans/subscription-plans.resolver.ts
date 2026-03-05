import { Resolver, Query, Mutation, Args, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SubscriptionPlansService } from './subscription-plans.service';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => SubscriptionPlan)
export class SubscriptionPlansResolver {
    constructor(private readonly plansService: SubscriptionPlansService) { }

    @Query(() => [SubscriptionPlan], { name: 'subscriptionPlans' })
    async findAll() {
        return this.plansService.findAll();
    }

    @Mutation(() => SubscriptionPlan)
    @UseGuards(GqlAuthGuard)
    async createSubscriptionPlan(
        @Args('name') name: string,
        @Args('price', { type: () => Float }) price: number,
        @Args('features', { type: () => [String] }) features: string[],
        @Args('description', { nullable: true }) description: string,
        @Args('isPopular', { defaultValue: false }) isPopular: boolean,
        @CurrentUser() user: any
    ) {
        if (!user) throw new Error("Unauthorized");
        return this.plansService.create({ name, price, description, features, isPopular });
    }

    @Mutation(() => SubscriptionPlan)
    @UseGuards(GqlAuthGuard)
    async updateSubscriptionPlan(
        @Args('id') id: string,
        @Args('name', { nullable: true }) name: string,
        @Args('price', { type: () => Float, nullable: true }) price: number,
        @Args('features', { type: () => [String], nullable: true }) features: string[],
        @Args('description', { nullable: true }) description: string,
        @Args('isPopular', { nullable: true }) isPopular: boolean,
        @CurrentUser() user: any
    ) {
        if (!user) throw new Error("Unauthorized");
        return this.plansService.update(id, { name, price, description, features, isPopular });
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlAuthGuard)
    async deleteSubscriptionPlan(
        @Args('id') id: string,
        @CurrentUser() user: any
    ) {
        if (!user) throw new Error("Unauthorized");
        await this.plansService.remove(id);
        return true;
    }
}
