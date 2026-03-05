import { StripeService } from './stripe.service';
import { User } from '../users/entities/user.entity';
export declare class StripeResolver {
    private readonly stripeService;
    constructor(stripeService: StripeService);
    createCheckoutSession(planId: string, user: User): Promise<string>;
}
