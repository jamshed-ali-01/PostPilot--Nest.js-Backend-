"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const common_1 = require("@nestjs/common");
const fastify = __importStar(require("fastify"));
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_service_1 = require("../auth/auth.service");
let StripeController = StripeController_1 = class StripeController {
    prisma;
    authService;
    stripe;
    logger = new common_1.Logger(StripeController_1.name);
    constructor(prisma, authService) {
        this.prisma = prisma;
        this.authService = authService;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-02-24.acacia',
        });
    }
    async handleWebhook(req, res, signature, rawBody) {
        const fs = await import('fs');
        const logPath = './stripe-webhook.log';
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Webhook received: ${req.url}, sig: ${signature ? 'PRESENT' : 'MISSING'}\n`);
        let event;
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            try {
                event = this.stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
            }
            catch (err) {
                this.logger.error(`Webhook signature verification failed: ${err.message}`);
                fs.appendFileSync(logPath, `[ERROR] Signature verification failed: ${err.message}\n`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
        }
        else {
            event = req.body;
            this.logger.warn("Skipped Stripe Webhook Signature Verification due to missing SECRET env.");
            fs.appendFileSync(logPath, `[WARN] Skipped signature verification\n`);
        }
        fs.appendFileSync(logPath, `[INFO] Event type: ${event.type}\n`);
        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object;
                    fs.appendFileSync(logPath, `[INFO] Session metadata: ${JSON.stringify(session.metadata)}\n`);
                    const businessId = session.metadata?.businessId || session.client_reference_id;
                    const planId = session.metadata?.planId;
                    const isNewReg = session.metadata?.type === 'new_reg';
                    if (isNewReg) {
                        fs.appendFileSync(logPath, `[INFO] Starting completeRegistration for ${session.metadata?.email}\n`);
                        await this.authService.completeRegistration(session.metadata);
                        this.logger.log(`Completed new registration for ${session.metadata?.email} via checkout session.`);
                        fs.appendFileSync(logPath, `[SUCCESS] Registration completed for ${session.metadata?.email}\n`);
                    }
                    else if (businessId) {
                        fs.appendFileSync(logPath, `[INFO] Activating business ${businessId}\n`);
                        await this.prisma.business.update({
                            where: { id: businessId },
                            data: {
                                isActive: true,
                                stripeCustomerId: session.customer,
                                stripeSubscriptionId: session.subscription,
                                ...(planId && { subscriptionPlanId: planId }),
                            },
                        });
                        this.logger.log(`Activated business ${businessId} via checkout session.`);
                        fs.appendFileSync(logPath, `[SUCCESS] Business ${businessId} activated\n`);
                    }
                    break;
                }
                case 'customer.subscription.updated': {
                    const subscription = event.data.object;
                    const business = await this.prisma.business.findFirst({
                        where: { stripeSubscriptionId: subscription.id },
                    });
                    if (business) {
                        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
                        await this.prisma.business.update({
                            where: { id: business.id },
                            data: {
                                trialEndsAt: trialEnd,
                                isActive: subscription.status === 'active' || subscription.status === 'trialing',
                            },
                        });
                        this.logger.log(`Updated subscription status for business ${business.id}`);
                        fs.appendFileSync(logPath, `[INFO] Subscription updated for business ${business.id}, status: ${subscription.status}\n`);
                    }
                    break;
                }
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object;
                    const business = await this.prisma.business.findFirst({
                        where: { stripeSubscriptionId: subscription.id },
                    });
                    if (business) {
                        await this.prisma.business.update({
                            where: { id: business.id },
                            data: {
                                isActive: false,
                            },
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
        }
        catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`);
            fs.appendFileSync(logPath, `[CRITICAL ERROR] ${error.message}\nSTACK: ${error.stack}\n`);
            res.status(500).send('Internal Server Error');
        }
    }
};
exports.StripeController = StripeController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Headers)('stripe-signature')),
    __param(3, (0, common_1.RawBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Buffer]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "handleWebhook", null);
exports.StripeController = StripeController = StripeController_1 = __decorate([
    (0, common_1.Controller)('stripe'),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map