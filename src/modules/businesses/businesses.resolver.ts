import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { Business } from './entities/business.entity';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => Business)
export class BusinessesResolver {
    constructor(private readonly businessesService: BusinessesService) { }

    @Mutation(() => Business)
    async createBusiness(@Args('name') name: string) {
        return this.businessesService.create(name);
    }

    @Mutation(() => Business)
    @UseGuards(GqlAuthGuard)
    async toggleActiveStatus(
        @Args('businessId') businessId: string,
        @Args('isActive') isActive: boolean,
        @CurrentUser() user: any
    ) {
        if (!user.isSystemAdmin) {
            throw new Error("Unauthorized: Only System Admins can toggle account active status.");
        }
        return this.businessesService.toggleActiveStatus(businessId, isActive);
    }

    @Mutation(() => Business)
    @UseGuards(GqlAuthGuard)
    async toggleBusinessSubscription(
        @Args('businessId') businessId: string,
        @Args('isSubscriptionActive') isSubscriptionActive: boolean,
        @CurrentUser() user: any
    ) {
        if (!user.isSystemAdmin) {
            throw new Error("Unauthorized: Only System Admins can toggle subscriptions.");
        }
        return this.businessesService.toggleSubscription(businessId, isSubscriptionActive);
    }

    @Mutation(() => Business)
    @UseGuards(GqlAuthGuard)
    async purchaseSubscription(
        @Args('planId') planId: string,
        @CurrentUser() user: any
    ) {
        if (!user.businessId) {
            throw new Error("User is not associated with any business.");
        }
        return this.businessesService.purchaseSubscription(user.businessId, planId);
    }

    @Query(() => [Business], { name: 'businesses' })
    async findAll() {
        return this.businessesService.findAll();
    }

    @Query(() => Business, { name: 'business' })
    async findOne(@Args('id') id: string) {
        return this.businessesService.findOne(id);
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlAuthGuard)
    async deleteBusiness(
        @Args('businessId') businessId: string,
        @CurrentUser() user: any
    ) {
        if (!user.isSystemAdmin) {
            throw new Error("Unauthorized: Only System Admins can delete businesses.");
        }
        await this.businessesService.deleteBusiness(businessId);
        return true;
    }
}
