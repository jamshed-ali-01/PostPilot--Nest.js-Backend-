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
    permissions?: string[];
    roles?: RoleDto[];
}
declare class RoleDto {
    id: string;
    name: string;
}
export declare class AuthResolver {
    private readonly authService;
    constructor(authService: AuthService);
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
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
                createdAt: Date;
                updatedAt: Date;
                name: string;
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
    initiateRegister(registerInput: RegisterInput): Promise<{
        stripeUrl: string;
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
    getMe(user: any): Promise<{
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
    confirmRegistration(sessionId: string): Promise<boolean>;
}
export {};
