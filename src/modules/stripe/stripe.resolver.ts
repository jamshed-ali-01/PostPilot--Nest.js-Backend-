import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { StripeService } from './stripe.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver()
export class StripeResolver {
    constructor(private readonly stripeService: StripeService) { }

    @Mutation(() => String, { name: 'createCheckoutSession' })
    @UseGuards(GqlAuthGuard)
    async createCheckoutSession(
        @Args('planId') planId: string,
        @CurrentUser() user: User,
    ): Promise<string> {
        // Determine the business requesting the checkout
        const businessId = user.businessId;
        return this.stripeService.createCheckoutSession(businessId, planId);
    }
}
