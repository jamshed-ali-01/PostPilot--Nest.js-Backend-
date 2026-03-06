import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginInput, RegisterInput } from './dto/auth-inputs';
import { StripeService } from '../stripe/stripe.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    private stripeService;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService, stripeService: StripeService);
    validateUser(email: string, pass: string): Promise<any>;
    login(loginInput: LoginInput): Promise<{
        access_token: string;
        user: any;
    }>;
    initiateRegister(input: RegisterInput): Promise<{
        stripeUrl: string;
    }>;
    completeRegistration(metadata: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    getMe(userId: string): Promise<{
        isSystemAdmin: boolean;
        firstName: string;
        lastName: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
    } | {
        isSystemAdmin: boolean;
        business: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            logo: string | null;
            theme: string | null;
            isActive: boolean;
            isSubscriptionActive: boolean;
            subscriptionPlanId: string | null;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            stripePriceId: string | null;
            trialEndsAt: Date | null;
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
}
