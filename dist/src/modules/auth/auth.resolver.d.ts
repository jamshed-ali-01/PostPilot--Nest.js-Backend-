import { AuthService } from './auth.service';
import { LoginInput } from './dto/auth-inputs';
import { RegisterInput } from './dto/auth-inputs';
import { Business } from '../businesses/entities/business.entity';
export declare class AuthUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    isSystemAdmin: boolean;
    businessId?: string;
    business?: Business;
    aiTone?: string;
    aiHashtags?: string[];
    aiCaptionLength?: string;
    aiIncludeEmojis?: boolean;
}
export declare class AuthResolver {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginInput: LoginInput): Promise<{
        access_token: string;
        user: any;
    }>;
    initiateRegister(registerInput: RegisterInput): Promise<{
        stripeUrl: string;
    }>;
    getMe(user: any): Promise<{
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
