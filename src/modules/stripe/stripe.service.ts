import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
import { RegisterInput } from '../auth/dto/auth-inputs';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;
    private readonly logger = new Logger(StripeService.name);

    constructor(private readonly prisma: PrismaService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-02-24.acacia' as any,
        });
    }

    async createCheckoutSession(businessId: string, planId: string): Promise<string> {
        this.logger.log(`Creating Checkout Session for Custom Plan: ${planId} Business: ${businessId}`);

        const business = await (this.prisma.business as any).findUnique({
            where: { id: businessId },
        });

        if (!business) {
            throw new Error('Business not found for Stripe checkout');
        }

        const plan = await (this.prisma.subscriptionPlan as any).findUnique({
            where: { id: planId },
        });

        if (!plan) {
            throw new Error('Subscription plan not found for checkout');
        }

        const price = plan.price * 100; // Cents
        const currency = 'gbp';

        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'subscription',
                client_reference_id: businessId,
                customer_email: 'temp@test.com', // Typically from the registering user
                metadata: {
                    businessId,
                    planId,
                },
                subscription_data: {
                    trial_period_days: 14,
                },
                line_items: [
                    {
                        price_data: {
                            currency,
                            recurring: { interval: 'month' },
                            product_data: {
                                name: `PostPilot - ${plan.name} Package`,
                                description: plan.description || undefined,
                            },
                            unit_amount: price,
                        },
                        quantity: 1,
                    },
                ],
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/pricing`,
            });

            return session.url!;
        } catch (error) {
            this.logger.error(`Stripe checkout error: ${error.message}`);
            if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
                this.logger.warn("Using placeholder stripe key, returning mock checkout URL.");
                return `${process.env.FRONTEND_URL || 'http://localhost:8080'}/dashboard?trial=mock_started`;
            }
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }

    async createCheckoutSessionForRegistration(input: RegisterInput, hashedPassword: string): Promise<string> {
        this.logger.log(`Creating Checkout Session for NEW Registration: ${input.email}`);

        const plan = await (this.prisma.subscriptionPlan as any).findUnique({
            where: { id: input.planId },
        });

        if (!plan) {
            throw new Error('Subscription plan not found for registration checkout');
        }

        const price = plan.price * 100; // Cents
        const currency = 'gbp';

        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'subscription',
                customer_email: input.email,
                metadata: {
                    type: 'new_reg',
                    email: input.email,
                    password: hashedPassword,
                    firstName: input.firstName || '',
                    lastName: input.lastName || '',
                    businessName: input.businessName || '',
                    planId: input.planId || '',
                },
                subscription_data: {
                    trial_period_days: 14,
                },
                line_items: [
                    {
                        price_data: {
                            currency,
                            recurring: { interval: 'month' },
                            product_data: {
                                name: `PostPilot - ${plan.name} Package`,
                                description: plan.description || undefined,
                            },
                            unit_amount: price,
                        },
                        quantity: 1,
                    },
                ],
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/success?session_id={CHECKOUT_SESSION_ID}&type=new_reg`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/pricing`,
            });

            return session.url!;
        } catch (error) {
            this.logger.error(`Stripe registration checkout error: ${error.message}`);
            if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
                return `${process.env.FRONTEND_URL || 'http://localhost:8080'}/success?type=new_reg&mock=true`;
            }
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }
}
