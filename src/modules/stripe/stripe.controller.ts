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
        const fs = await import('fs');
        const logPath = './stripe-webhook.log';
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Webhook received: ${req.url}, sig: ${signature ? 'PRESENT' : 'MISSING'}\n`);

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
                fs.appendFileSync(logPath, `[ERROR] Signature verification failed: ${err.message}\n`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
        } else {
            // Mock event decoding if no secret provided
            event = req.body as Stripe.Event;
            this.logger.warn("Skipped Stripe Webhook Signature Verification due to missing SECRET env.");
            fs.appendFileSync(logPath, `[WARN] Skipped signature verification\n`);
        }

        fs.appendFileSync(logPath, `[INFO] Event type: ${event.type}\n`);

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    fs.appendFileSync(logPath, `[INFO] Session metadata: ${JSON.stringify(session.metadata)}\n`);
                    
                    const businessId = session.metadata?.businessId || session.client_reference_id;
                    const planId = session.metadata?.planId;
                    const isNewReg = session.metadata?.type === 'new_reg';

                    if (isNewReg) {
                        fs.appendFileSync(logPath, `[INFO] Starting completeRegistration for ${session.metadata?.email}\n`);
                        await this.authService.completeRegistration(session.metadata);
                        this.logger.log(`Completed new registration for ${session.metadata?.email} via checkout session.`);
                        fs.appendFileSync(logPath, `[SUCCESS] Registration completed for ${session.metadata?.email}\n`);
                    } else if (businessId) {
                        fs.appendFileSync(logPath, `[INFO] Activating business ${businessId}\n`);
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
                        fs.appendFileSync(logPath, `[SUCCESS] Business ${businessId} activated\n`);
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
                        fs.appendFileSync(logPath, `[INFO] Subscription updated for business ${business.id}, status: ${subscription.status}\n`);
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
                        fs.appendFileSync(logPath, `[INFO] Subscription deleted for business ${business.id}\n`);
                    }
                    break;
                }
                default:
                    this.logger.log(`Unhandled event type ${event.type}`);
            }

            res.status(200).send({ received: true });
        } catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`);
            fs.appendFileSync(logPath, `[CRITICAL ERROR] ${error.message}\nSTACK: ${error.stack}\n`);
            res.status(500).send('Internal Server Error');
        }
    }
}
