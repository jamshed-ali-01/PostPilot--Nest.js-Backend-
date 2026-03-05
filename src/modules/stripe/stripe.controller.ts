import { Controller, Post, Req, Res, Headers, Logger, RawBody, Inject, forwardRef } from '@nestjs/common';
import * as fastify from 'fastify';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Controller('stripe')
export class StripeController {
    private readonly stripe: Stripe;
    private readonly logger = new Logger(StripeController.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-02-24.acacia' as any,
        });
    }

    @Post('webhook')
    async handleWebhook(
        @Req() req: fastify.FastifyRequest,
        @Res() res: fastify.FastifyReply,
        @Headers('stripe-signature') signature: string,
        @RawBody() rawBody: Buffer,
    ) {
        let event: Stripe.Event;

        // Skip webhook signature verification if we are strictly local/testing without a key.
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            try {
                event = this.stripe.webhooks.constructEvent(
                    rawBody,
                    signature,
                    process.env.STRIPE_WEBHOOK_SECRET,
                );
            } catch (err) {
                this.logger.error(`Webhook signature verification failed: ${err.message}`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
        } else {
            // Mock event decoding if no secret provided
            event = req.body as Stripe.Event;
            this.logger.warn("Skipped Stripe Webhook Signature Verification due to missing SECRET env.");
        }

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    // The metadata we passed during creation is under session.metadata, not subscription_data.metadata
                    const businessId = session.metadata?.businessId || session.client_reference_id;
                    const planId = session.metadata?.planId;
                    const isNewReg = session.metadata?.type === 'new_reg';

                    if (isNewReg) {
                        await this.authService.completeRegistration(session.metadata);
                        this.logger.log(`Completed new registration for ${session.metadata?.email} via checkout session.`);
                    } else if (businessId) {
                        await (this.prisma.business as any).update({
                            where: { id: businessId },
                            data: {
                                isActive: true,
                                stripeCustomerId: session.customer as string,
                                stripeSubscriptionId: session.subscription as string,
                                ...(planId && { subscriptionPlanId: planId }),
                            } as any,
                        });
                        this.logger.log(`Activated business ${businessId} via checkout session.`);
                    }
                    break;
                }
                case 'customer.subscription.updated': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const business = await (this.prisma.business as any).findFirst({
                        where: { stripeSubscriptionId: subscription.id } as any,
                    });

                    if (business) {
                        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
                        await (this.prisma.business as any).update({
                            where: { id: business.id },
                            data: {
                                trialEndsAt: trialEnd,
                                isActive: subscription.status === 'active' || subscription.status === 'trialing',
                            } as any,
                        });
                        this.logger.log(`Updated subscription status for business ${business.id}`);
                    }
                    break;
                }
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const business = await (this.prisma.business as any).findFirst({
                        where: { stripeSubscriptionId: subscription.id } as any,
                    });

                    if (business) {
                        await (this.prisma.business as any).update({
                            where: { id: business.id },
                            data: {
                                isActive: false,
                            } as any,
                        });
                        this.logger.log(`Deactivated business ${business.id} due to canceled subscription.`);
                    }
                    break;
                }
                default:
                    this.logger.log(`Unhandled event type ${event.type}`);
            }

            res.status(200).send({ received: true });
        } catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`);
            res.status(500).send('Internal Server Error');
        }
    }
}
