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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const stripe_service_1 = require("../stripe/stripe.service");
const invitations_service_1 = require("../invitations/invitations.service");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    prisma;
    stripeService;
    invitationsService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService, prisma, stripeService, invitationsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.invitationsService = invitationsService;
    }
    async validateUser(email, pass) {
        console.log(`[AuthService] Validating user: ${email}`);
        const sysAdmin = await this.prisma.systemAdmin.findUnique({ where: { email } });
        console.log(`[AuthService] Searched SystemAdmin for ${email}:`, sysAdmin ? 'Found' : 'Not Found');
        if (sysAdmin && (await bcrypt.compare(pass, sysAdmin.password))) {
            console.log(`[AuthService] Validated SystemAdmin matching: ${email}`);
            const { password, ...result } = sysAdmin;
            return {
                ...result,
                _type: 'sysadmin',
                isSystemAdmin: true,
                firstName: sysAdmin.name || 'System',
                lastName: 'Admin'
            };
        }
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            console.log(`[AuthService] Found Business User matching: ${email}`);
            const { password, ...result } = user;
            return { ...result, _type: 'user' };
        }
        return null;
    }
    async login(loginInput) {
        const user = await this.validateUser(loginInput.email, loginInput.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id, isSystemAdmin: !!user.isSystemAdmin };
        const fullUser = await this.getMe(user.id);
        return {
            access_token: this.jwtService.sign(payload),
            user: fullUser,
        };
    }
    async initiateRegister(input) {
        const email = input.email.toLowerCase().trim();
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(input.password, 10);
        const stripeUrl = await this.stripeService.createCheckoutSessionForRegistration(input, hashedPassword);
        return { stripeUrl };
    }
    async completeRegistration(metadata) {
        this.logger.log(`Completing registration for: ${metadata.email}`);
        const { email, password, firstName, lastName, businessName, planId } = metadata;
        return await this.prisma.$transaction(async (tx) => {
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + 14);
            const business = await tx.business.create({
                data: {
                    name: businessName,
                    trialEndsAt,
                    isActive: true,
                    subscriptionPlanId: planId
                }
            });
            const bizId = business.id;
            const perms = [
                'CREATE_POST', 'EDIT_POST', 'DELETE_POST', 'PUBLISH_POST', 'SCHEDULE_POST',
                'VIEW_POSTS', 'VIEW_ANALYTICS', 'VIEW_ADS', 'CREATE_AD', 'EDIT_AD', 'DELETE_AD',
                'INVITE_USER', 'REMOVE_USERS', 'MANAGE_TEAM', 'VIEW_TEAM',
                'MANAGE_SETTINGS', 'MANAGE_BILLING', 'ADMIN_SETTINGS',
                'MANAGE_INTEGRATIONS', 'MANAGE_SERVICE_AREAS'
            ];
            for (const p of perms) {
                await tx.permission.upsert({
                    where: { name: p },
                    update: {},
                    create: { name: p }
                });
            }
            const allPerms = await tx.permission.findMany();
            const role = await tx.role.create({
                data: {
                    name: `OWNER_${bizId}`,
                    description: 'Full business access',
                    businessId: bizId,
                    permissions: {
                        connect: allPerms.map(p => ({ id: p.id }))
                    }
                }
            });
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase().trim(),
                    password,
                    firstName,
                    lastName,
                    businessId: bizId,
                    roles: {
                        connect: [{ id: role.id }]
                    }
                }
            });
            this.logger.log(`Successfully completed registration for user ${user.id} and business ${bizId}`);
            return user;
        });
    }
    async registerByInvite(input, token) {
        const invitation = await this.invitationsService.findByToken(token);
        const hashedPassword = await bcrypt.hash(input.password, 10);
        return await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: invitation.email.toLowerCase().trim(),
                    password: hashedPassword,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    businessId: invitation.businessId,
                    roles: {
                        connect: [{ id: invitation.roleId }]
                    }
                }
            });
            await tx.invitation.update({
                where: { token },
                data: { acceptedAt: new Date() },
            });
            return user;
        });
    }
    async getMe(userId) {
        const sysAdmin = await this.prisma.systemAdmin.findUnique({
            where: { id: userId }
        });
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: sysAdmin?.email }
                ]
            },
            include: { business: true, roles: { include: { permissions: true } } }
        });
        if (sysAdmin && user) {
            const permissions = new Set();
            user.roles?.forEach(r => r.permissions?.forEach(p => permissions.add(p.name)));
            return {
                ...user,
                ...sysAdmin,
                isSystemAdmin: true,
                firstName: user.firstName || sysAdmin.name || 'System',
                lastName: user.lastName || 'Admin',
                permissions: Array.from(permissions)
            };
        }
        if (sysAdmin) {
            return {
                ...sysAdmin,
                isSystemAdmin: true,
                firstName: sysAdmin.name || 'System',
                lastName: 'Admin',
                permissions: []
            };
        }
        if (!user) {
            throw new Error('User not found');
        }
        const permissions = new Set();
        user.roles?.forEach(r => r.permissions?.forEach(p => permissions.add(p.name)));
        return {
            ...user,
            isSystemAdmin: false,
            permissions: Array.from(permissions)
        };
    }
    async confirmRegistrationBySession(sessionId) {
        this.logger.log(`[confirmRegistration] Checking session: ${sessionId}`);
        try {
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-02-24.acacia' });
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.metadata?.type !== 'new_reg') {
                this.logger.log(`[confirmRegistration] Session ${sessionId} is not a new_reg session. Skipping.`);
                return false;
            }
            const email = session.metadata?.email;
            if (!email) {
                this.logger.error(`[confirmRegistration] No email found in session metadata.`);
                return false;
            }
            const existingUser = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
            if (existingUser) {
                this.logger.log(`[confirmRegistration] User ${email} already exists. Skipping duplicate registration.`);
                return true;
            }
            if (session.payment_status !== 'paid' && session.status !== 'complete') {
                this.logger.warn(`[confirmRegistration] Session ${sessionId} not paid yet. Status: ${session.payment_status}`);
                return false;
            }
            await this.completeRegistration(session.metadata);
            this.logger.log(`[confirmRegistration] Registration completed for ${email}`);
            return true;
        }
        catch (error) {
            this.logger.error(`[confirmRegistration] Error: ${error.message}`);
            return false;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => stripe_service_1.StripeService))),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        invitations_service_1.InvitationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map