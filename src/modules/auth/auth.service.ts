import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginInput, RegisterInput } from './dto/auth-inputs';
import { StripeService } from '../stripe/stripe.service';
import { InvitationsService } from '../invitations/invitations.service';
import { MailService } from '../mail/mail.service';

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
        private mailService: MailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const normalizedEmail = email.toLowerCase().trim();
        this.logger.debug(`[validateUser] Login attempt: ${normalizedEmail}`);

        // 1. Check System Admins First
        const sysAdmin = await this.prisma.systemAdmin.findUnique({ where: { email: normalizedEmail } });
        if (sysAdmin) {
            this.logger.debug(`[validateUser] SystemAdmin record found for: ${normalizedEmail}`);
            const isValid = await bcrypt.compare(pass, sysAdmin.password);
            if (isValid) {
                this.logger.log(`[validateUser] Successful SystemAdmin login: ${normalizedEmail}`);
                const { password, ...result } = sysAdmin;
                return {
                    ...result,
                    _type: 'sysadmin',
                    isSystemAdmin: true,
                    firstName: sysAdmin.name || 'System',
                    lastName: 'Admin'
                };
            } else {
                this.logger.warn(`[validateUser] Password mismatch for SystemAdmin: ${normalizedEmail}`);
            }
        }

        // 2. Check Business Users Fallback
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (user) {
            this.logger.debug(`[validateUser] Business User record found for: ${normalizedEmail}`);
            const isValid = await bcrypt.compare(pass, user.password);
            if (isValid) {
                this.logger.log(`[validateUser] Successful Business User login: ${normalizedEmail}`);
                const { password, ...result } = user;
                return { ...result, _type: 'user' };
            } else {
                this.logger.warn(`[validateUser] Password mismatch for Business User: ${normalizedEmail}`);
            }
        } else {
            this.logger.warn(`[validateUser] No account found for email: ${normalizedEmail}`);
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

        // Check if email is verified
        const otpRecord = await this.prisma.verificationOtp.findFirst({
            where: {
                email,
                type: 'REGISTER',
                verifiedAt: { not: null },
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            throw new UnauthorizedException('Email verification required before registration');
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Trigger Stripe Checkout with registration metadata
        const stripeUrl = await this.stripeService.createCheckoutSessionForRegistration(input, hashedPassword);

        return { stripeUrl };
    }

    async sendOtp(email: string) {
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        // Save to DB
        await this.prisma.verificationOtp.create({
            data: {
                email: normalizedEmail,
                code: otp,
                type: 'REGISTER',
                expiresAt,
            }
        });

        // Send Email
        try {
            await this.mailService.sendOtpEmail(normalizedEmail, otp);
        } catch (error) {
            this.logger.warn(`Failed to send OTP email to ${normalizedEmail}. You can find the code in the server logs.`);
        }
        return true;
    }

    async verifyOtp(email: string, code: string) {
        const normalizedEmail = email.toLowerCase().trim();
        
        const record = await this.prisma.verificationOtp.findFirst({
            where: {
                email: normalizedEmail,
                code,
                type: 'REGISTER',
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) {
            throw new UnauthorizedException('Invalid or expired verification code');
        }

        // Mark as verified
        await this.prisma.verificationOtp.update({
            where: { id: record.id },
            data: { verifiedAt: new Date() }
        });

        return true;
    }

    async sendResetPasswordOtp(email: string) {
        const normalizedEmail = email.toLowerCase().trim();
        
        // Find user or system admin
        const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        const sysAdmin = await this.prisma.systemAdmin.findUnique({ where: { email: normalizedEmail } });

        if (!user && !sysAdmin) {
            // For security, we don't say "User not found". 
            // We just return true as if we sent it.
            return true;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        // Save to DB
        await this.prisma.verificationOtp.create({
            data: {
                email: normalizedEmail,
                code: otp,
                type: 'FORGOT_PASSWORD',
                expiresAt,
            }
        });

        // Send Email
        try {
            await this.mailService.sendResetPasswordEmail(normalizedEmail, otp);
        } catch (error) {
            this.logger.warn(`Failed to send reset email to ${normalizedEmail}. You can find the code in the server logs.`);
        }
        return true;
    }

    async resetPassword(email: string, code: string, newPassword: string) {
        const normalizedEmail = email.toLowerCase().trim();
        
        const record = await this.prisma.verificationOtp.findFirst({
            where: {
                email: normalizedEmail,
                code,
                type: 'FORGOT_PASSWORD',
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) {
            throw new UnauthorizedException('Invalid or expired reset code');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update User or SystemAdmin
        const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (user) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
        } else {
            const sysAdmin = await this.prisma.systemAdmin.findUnique({ where: { email: normalizedEmail } });
            if (sysAdmin) {
                await this.prisma.systemAdmin.update({
                    where: { id: sysAdmin.id },
                    data: { password: hashedPassword }
                });
            }
        }

        // Delete the used OTP
        await this.prisma.verificationOtp.delete({ where: { id: record.id } });

        return true;
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
                    isSubscriptionActive: true,
                    subscriptionPlanId: planId
                } as any
            });

            const bizId = business.id;

            // 2. Fetch All Permissions & Global Roles
            const allPerms = await tx.permission.findMany();
            const globalRoles = await tx.role.findMany({
                where: { businessId: null }
            });

            // 3. Create Local Roles for Business
            // 3.1 Standard OWNER Role
            const ownerRole = await tx.role.create({
                data: {
                    name: `OWNER_${bizId}`,
                    description: 'Full business access',
                    businessId: bizId,
                    permissions: {
                        connect: allPerms.map(p => ({ id: p.id }))
                    }
                }
            });

            // 3.2 Standard MANAGER & STAFF Roles (copied from global templates)
            for (const gr of globalRoles) {
                // Skip the template if it's the owner template (we handled it above)
                if (gr.name.includes('Owner (Template)')) continue;

                await tx.role.create({
                    data: {
                        name: gr.name,
                        description: gr.description,
                        businessId: bizId,
                        permissions: {
                            connect: gr.permissionIds.map(pid => ({ id: pid }))
                        }
                    }
                });
            }

            // 4. Create User
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase().trim(),
                    password, // Already hashed from initiation
                    firstName,
                    lastName,
                    businessId: bizId,
                    roles: {
                        connect: [{ id: ownerRole.id }]
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

        // Identity Bridge: If sysAdmin exists but no user record, create it
        if (sysAdmin && !user) {
            user = await this.ensureAdminUserRecord(sysAdmin.email) as any;
            // Refetch with includes
            user = await this.prisma.user.findUnique({
                where: { id: user?.id },
                include: { business: true, roles: { include: { permissions: true } } }
            }) as any;
        }

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

    private async getOrCreateMainBusiness() {
        let business = await this.prisma.business.findFirst({
            where: { name: 'PostPilot' }
        });

        if (!business) {
            business = await this.prisma.business.create({
                data: {
                    name: 'PostPilot',
                    isActive: true,
                    isSubscriptionActive: true,
                    trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year trial
                }
            });
            this.logger.log(`Created Main Business: PostPilot (${business.id})`);
        }

        return business;
    }

    async ensureAdminUserRecord(email: string) {
        const business = await this.getOrCreateMainBusiness();
        const normalizedEmail = email.toLowerCase().trim();

        let user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { business: true, roles: { include: { permissions: true } } }
        });

        if (!user) {
            // Find or Create OWNER Role for this business
            let ownerRole = await this.prisma.role.findFirst({
                where: { name: `OWNER_${business.id}`, businessId: business.id }
            });

            if (!ownerRole) {
                const allPerms = await this.prisma.permission.findMany();
                ownerRole = await this.prisma.role.create({
                    data: {
                        name: `OWNER_${business.id}`,
                        description: 'System Admin Owner Role',
                        businessId: business.id,
                        permissions: { connect: allPerms.map(p => ({ id: p.id })) }
                    }
                });
            }

            user = await this.prisma.user.create({
                data: {
                    email: normalizedEmail,
                    password: 'SYSTEM_ADMIN_NO_LOGIN', // They login via SystemAdmin record
                    firstName: 'System',
                    lastName: 'Admin',
                    businessId: business.id,
                    roles: { connect: [{ id: ownerRole.id }] }
                },
                include: { business: true, roles: { include: { permissions: true } } }
            });
            this.logger.log(`Bridged SystemAdmin to Business User: ${normalizedEmail}`);
        }

        return user;
    }

    async confirmRegistrationBySession(sessionId: string) {
        this.logger.log(`[confirmRegistration] Checking session: ${sessionId}`);
        try {
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-02-24.acacia' as any });
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (session.metadata?.type !== 'new_reg') {
                this.logger.log(`[confirmRegistration] Session ${sessionId} is not a new_reg session. Skipping.`);
                throw new Error('Invalid session type');
            }

            const email = session.metadata?.email;
            if (!email) {
                this.logger.error(`[confirmRegistration] No email found in session metadata.`);
                throw new Error('No email in metadata');
            }

            // Check if user already exists
            let user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
            
            if (!user) {
                if (session.payment_status !== 'paid' && session.status !== 'complete') {
                    this.logger.warn(`[confirmRegistration] Session ${sessionId} not paid yet. Status: ${session.payment_status}`);
                    throw new Error('Payment not completed');
                }
                user = await this.completeRegistration(session.metadata);
            }

            this.logger.log(`[confirmRegistration] Registration ready for ${email}. Issuing token.`);
            
            // Auto-login: Sign payload
            const payload = { email: user.email, sub: user.id, isSystemAdmin: false };
            const fullUser = await this.getMe(user.id);

            return {
                access_token: this.jwtService.sign(payload),
                user: fullUser,
            };
        } catch (error) {
            this.logger.error(`[confirmRegistration] Error: ${error.message}`);
            throw new UnauthorizedException(error.message || 'Registration confirmation failed');
        }
    }
}
