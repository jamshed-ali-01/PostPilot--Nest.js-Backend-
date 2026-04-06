import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginInput, RegisterInput } from './dto/auth-inputs';
import { StripeService } from '../stripe/stripe.service';
import { InvitationsService } from '../invitations/invitations.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
        @Inject(forwardRef(() => StripeService))
        private stripeService: StripeService,
        private invitationsService: InvitationsService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const normalizedEmail = email.toLowerCase().trim();
        console.log(`[AuthService] Validating user: ${normalizedEmail}`);

        // 1. Check System Admins First
        const sysAdmin = await this.prisma.systemAdmin.findUnique({ where: { email: normalizedEmail } });
        console.log(`[AuthService] Searched SystemAdmin for ${normalizedEmail}:`, sysAdmin ? 'Found' : 'Not Found');

        if (sysAdmin && (await bcrypt.compare(pass, sysAdmin.password))) {
            console.log(`[AuthService] Validated SystemAdmin matching: ${normalizedEmail}`);
            const { password, ...result } = sysAdmin;
            return {
                ...result,
                _type: 'sysadmin',
                isSystemAdmin: true,
                firstName: sysAdmin.name || 'System',
                lastName: 'Admin'
            };
        }

        // 2. Check Business Users Fallback
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (user && (await bcrypt.compare(pass, user.password))) {
            console.log(`[AuthService] Found Business User matching: ${normalizedEmail}`);
            const { password, ...result } = user;
            return { ...result, _type: 'user' };
        }

        return null;
    }

    async login(loginInput: LoginInput) {
        const user = await this.validateUser(loginInput.email, loginInput.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id, isSystemAdmin: !!user.isSystemAdmin };
        // Call getMe to get full user profile with roles and permissions
        const fullUser = await this.getMe(user.id);
        return {
            access_token: this.jwtService.sign(payload),
            user: fullUser,
        };
    }


    async initiateRegister(input: RegisterInput) {
        const email = input.email.toLowerCase().trim();
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Trigger Stripe Checkout with registration metadata
        const stripeUrl = await this.stripeService.createCheckoutSessionForRegistration(input, hashedPassword);

        return { stripeUrl };
    }

    async completeRegistration(metadata: any) {
        this.logger.log(`Completing registration for: ${metadata.email}`);

        const { email, password, firstName, lastName, businessName, planId } = metadata;

        // 1. Move Permission Upserts OUTSIDE the transaction for speed
        const perms = [
            'CREATE_POST', 'EDIT_POST', 'DELETE_POST', 'PUBLISH_POST', 'SCHEDULE_POST',
            'VIEW_POSTS', 'VIEW_ANALYTICS', 'VIEW_ADS', 'CREATE_AD', 'EDIT_AD', 'DELETE_AD',
            'INVITE_USER', 'REMOVE_USERS', 'MANAGE_TEAM', 'VIEW_TEAM',
            'MANAGE_SETTINGS', 'MANAGE_BILLING', 'ADMIN_SETTINGS',
            'MANAGE_INTEGRATIONS', 'MANAGE_SERVICE_AREAS'
        ];

        // Do upserts outside the transaction
        for (const p of perms) {
            await this.prisma.permission.upsert({
                where: { name: p },
                update: {},
                create: { name: p }
            });
        }

        return await this.prisma.$transaction(async (tx) => {
            // 1. Create Business
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + 14);

            const business = await tx.business.create({
                data: {
                    name: businessName,
                    trialEndsAt,
                    isActive: true, // Mark as active since they just paid
                    subscriptionPlanId: planId
                } as any
            });

            const bizId = business.id;

            // 2. Fetch All Permissions (Fast inside tx)
            const allPerms = await tx.permission.findMany();

            // 3. OWNER Role
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

            // 4. Create User
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase().trim(),
                    password, // Already hashed from initiation
                    firstName,
                    lastName,
                    businessId: bizId,
                    roles: {
                        connect: [{ id: role.id }]
                    }
                } as any
            });

            this.logger.log(`Successfully completed registration for user ${user.id} and business ${bizId}`);
            return user;
        }, { timeout: 10000 });
    }



    async registerByInvite(input: RegisterInput, token: string) {
        const invitation = await this.invitationsService.findByToken(token);
        const hashedPassword = await bcrypt.hash(input.password, 10);

        return await this.prisma.$transaction(async (tx) => {
            // 1. Create User
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

            // 2. Mark invitation as accepted
            await tx.invitation.update({
                where: { token },
                data: { acceptedAt: new Date() },
            });

            return user;
        });
    }

    async getMe(userId: string) {
        // First check if this ID belongs to a SystemAdmin
        let sysAdmin = await this.prisma.systemAdmin.findUnique({
            where: { id: userId }
        });

        // Search by ID or Email to find the corresponding Business User
        let user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: sysAdmin?.email }
                ]
            },
            include: { business: true, roles: { include: { permissions: true } } }
        });

        // Enhanced Identity Bridge: If we find one but not the other by ID/Email, we sync them
        if (!user || !sysAdmin) {
            const commonEmail = user?.email || sysAdmin?.email;
            if (commonEmail) {
                if (!user) user = await this.prisma.user.findUnique({ where: { email: commonEmail }, include: { business: true, roles: { include: { permissions: true } } } });
                if (!sysAdmin) sysAdmin = await this.prisma.systemAdmin.findUnique({ where: { email: commonEmail } });
            }
        }

        if (sysAdmin && user) {
            const permissions = new Set<string>();
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
                permissions: [] // System admins get all permissions via business owner role if merged
            };
        }

        if (!user) {
            throw new Error('User not found');
        }

        const permissions = new Set<string>();
        user.roles?.forEach(r => r.permissions?.forEach(p => permissions.add(p.name)));

        return {
            ...user,
            isSystemAdmin: false,
            permissions: Array.from(permissions)
        };
    }

    async confirmRegistrationBySession(sessionId: string) {
        this.logger.log(`[confirmRegistration] Checking session: ${sessionId}`);
        try {
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-02-24.acacia' as any });
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

            // Check if user already exists (webhook may have already processed this)
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
        } catch (error) {
            this.logger.error(`[confirmRegistration] Error: ${error.message}`);
            return false;
        }
    }
}
