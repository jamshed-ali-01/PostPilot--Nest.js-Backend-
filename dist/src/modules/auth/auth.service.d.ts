import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginInput, RegisterInput } from './dto/auth-inputs';
import { StripeService } from '../stripe/stripe.service';
import { InvitationsService } from '../invitations/invitations.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    private stripeService;
    private invitationsService;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService, stripeService: StripeService, invitationsService: InvitationsService);
    validateUser(email: string, pass: string): Promise<any>;
    login(loginInput: LoginInput): Promise<{
        access_token: string;
        user: {
            isSystemAdmin: boolean;
            firstName: string;
            lastName: string;
            permissions: string[];
            id: string;
            email: string;
            password: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            business: {
                id: string;
                email: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                logo: string | null;
                phone: string | null;
                theme: string | null;
                isActive: boolean;
                isSubscriptionActive: boolean;
                subscriptionPlanId: string | null;
                stripeCustomerId: string | null;
                stripeSubscriptionId: string | null;
                stripePriceId: string | null;
                trialEndsAt: Date | null;
            } | null;
            roles: ({
                permissions: {
                    id: string;
                    roleIds: string[];
                    name: string;
                    description: string | null;
                }[];
            } & {
                id: string;
                businessId: string | null;
                name: string;
                description: string | null;
                permissionIds: string[];
                userIds: string[];
            })[];
            businessId: string;
            roleIds: string[];
            aiTone: string | null;
            aiHashtags: string[];
            aiCaptionLength: string | null;
            aiIncludeEmojis: boolean | null;
        } | {
            isSystemAdmin: boolean;
            firstName: string;
            lastName: string;
            permissions: never[];
            id: string;
            email: string;
            password: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
        } | {
            isSystemAdmin: boolean;
            permissions: string[];
            business: {
                id: string;
                email: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                logo: string | null;
                phone: string | null;
                theme: string | null;
                isActive: boolean;
                isSubscriptionActive: boolean;
                subscriptionPlanId: string | null;
                stripeCustomerId: string | null;
                stripeSubscriptionId: string | null;
                stripePriceId: string | null;
                trialEndsAt: Date | null;
            } | null;
            roles: ({
                permissions: {
                    id: string;
                    roleIds: string[];
                    name: string;
                    description: string | null;
                }[];
            } & {
                id: string;
                businessId: string | null;
                name: string;
                description: string | null;
                permissionIds: string[];
                userIds: string[];
            })[];
            id: string;
            email: string;
            password: string;
            firstName: string | null;
            lastName: string | null;
            businessId: string;
            roleIds: string[];
            aiTone: string | null;
            aiHashtags: string[];
            aiCaptionLength: string | null;
            aiIncludeEmojis: boolean | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    initiateRegister(input: RegisterInput): Promise<{
        stripeUrl: string;
    }>;
    completeRegistration(metadata: any): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        businessId: string;
        roleIds: string[];
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    registerByInvite(input: RegisterInput, token: string): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        businessId: string;
        roleIds: string[];
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMe(userId: string): Promise<{
        isSystemAdmin: boolean;
        firstName: string;
        lastName: string;
        permissions: string[];
        id: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        business: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            logo: string | null;
            phone: string | null;
            theme: string | null;
            isActive: boolean;
            isSubscriptionActive: boolean;
            subscriptionPlanId: string | null;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            stripePriceId: string | null;
            trialEndsAt: Date | null;
        } | null;
        roles: ({
            permissions: {
                id: string;
                roleIds: string[];
                name: string;
                description: string | null;
            }[];
        } & {
            id: string;
            businessId: string | null;
            name: string;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        })[];
        businessId: string;
        roleIds: string[];
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
    } | {
        isSystemAdmin: boolean;
        firstName: string;
        lastName: string;
        permissions: never[];
        id: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
    } | {
        isSystemAdmin: boolean;
        permissions: string[];
        business: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            logo: string | null;
            phone: string | null;
            theme: string | null;
            isActive: boolean;
            isSubscriptionActive: boolean;
            subscriptionPlanId: string | null;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            stripePriceId: string | null;
            trialEndsAt: Date | null;
        } | null;
        roles: ({
            permissions: {
                id: string;
                roleIds: string[];
                name: string;
                description: string | null;
            }[];
        } & {
            id: string;
            businessId: string | null;
            name: string;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        })[];
        id: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        businessId: string;
        roleIds: string[];
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    confirmRegistrationBySession(sessionId: string): Promise<boolean>;
}
