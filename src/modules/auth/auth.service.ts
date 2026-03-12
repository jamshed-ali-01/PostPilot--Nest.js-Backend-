import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
        console.log(`[AuthService] Validating user: ${email}`);

        // 1. Check System Admins First
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

        // 2. Check Business Users Fallback
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            console.log(`[AuthService] Found Business User matching: ${email}`);
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
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }


    async initiateRegister(input: RegisterInput) {
        const existingUser = await this.usersService.findByEmail(input.email);
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

            // 2. Permissions
            const perms = ['CREATE_POST', 'PUBLISH_POST', 'VIEW_ANALYTICS', 'ADMIN_SETTINGS'];
            for (const p of perms) {
                await tx.permission.upsert({
                    where: { name: p },
                    update: {},
                    create: { name: p }
                });
            }

            // 3. OWNER Role
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

            // 4. Create User
            const user = await tx.user.create({
                data: {
                    email,
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
        });
    }



    async registerByInvite(input: RegisterInput, token: string) {
        const invitation = await this.invitationsService.findByToken(token);
        const hashedPassword = await bcrypt.hash(input.password, 10);

        return await this.prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email: invitation.email,
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
        const sysAdmin = await this.prisma.systemAdmin.findUnique({
            where: { id: userId }
        });

        if (sysAdmin) {
            return {
                ...sysAdmin,
                isSystemAdmin: true,
                firstName: sysAdmin.name || 'System',
                lastName: 'Admin'
            };
        }

        // If not, check if it's a regular Business User
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { business: true }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            ...user,
            isSystemAdmin: false, // For regular users
        };
    }
}
