import { StripeService } from './stripe.service';
export declare class StripeResolver {
    private readonly stripeService;
    constructor(stripeService: StripeService);
    createCheckoutSession(planId: string, user: any): Promise<string>;
}
