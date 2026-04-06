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
        @CurrentUser() user: any,
    ): Promise<string> {
        // Determine the business requesting the checkout
        const businessId = user.businessId;
        const email = user.email;
        
        console.log(`[StripeResolver] Initiating checkout: user=${email}, businessId=${businessId}, isAdmin=${!!user.isSystemAdmin}`);
        
        if (!businessId) {
            if (user.isSystemAdmin) {
                throw new Error('As a System Administrator, you are not directly linked to a business for personal subscriptions. Please log in as a Business Owner to manage a specific account.');
            }
            throw new Error('Business ID not found for your account. Please contact support.');
        }

        return this.stripeService.createCheckoutSession(businessId, planId, email);
    }
}
