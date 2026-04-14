"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const stripe_1 = __importDefault(require("stripe"));
let StripeService = StripeService_1 = class StripeService {
    prisma;
    stripe;
    logger = new common_1.Logger(StripeService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-02-24.acacia',
        });
    }
    async createCheckoutSession(businessId, planId, email) {
        this.logger.log(`Creating Checkout Session for Custom Plan: ${planId} Business: ${businessId} User: ${email || 'unknown'}`);
        const business = await this.prisma.business.findUnique({
            where: { id: businessId },
        });
        if (!business) {
            throw new Error('Business not found for Stripe checkout');
        }
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new Error('Subscription plan not found for checkout');
        }
        const price = plan.price * 100;
        const currency = 'gbp';
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'subscription',
                client_reference_id: businessId,
                customer_email: email || 'temp@test.com',
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
                                name: `Recommend - ${plan.name} Package`,
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
            return session.url;
        }
        catch (error) {
            this.logger.error(`Stripe checkout error: ${error.message}`);
            if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
                this.logger.warn("Using placeholder stripe key, returning mock checkout URL.");
                return `${process.env.FRONTEND_URL || 'http://localhost:8080'}/dashboard?trial=mock_started`;
            }
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }
    async createCheckoutSessionForRegistration(input, hashedPassword) {
        this.logger.log(`Creating Checkout Session for NEW Registration: ${input.email}`);
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id: input.planId },
        });
        if (!plan) {
            throw new Error('Subscription plan not found for registration checkout');
        }
        const price = plan.price * 100;
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
                                name: `Recommend - ${plan.name} Package`,
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
            return session.url;
        }
        catch (error) {
            this.logger.error(`Stripe registration checkout error: ${error.message}`);
            if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
                return `${process.env.FRONTEND_URL || 'http://localhost:8080'}/success?type=new_reg&mock=true`;
            }
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map