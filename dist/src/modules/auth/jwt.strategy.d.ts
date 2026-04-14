import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private usersService;
    private prisma;
    private authService;
    constructor(configService: ConfigService, usersService: UsersService, prisma: PrismaService, authService: AuthService);
    validate(payload: any): Promise<{
        isSystemAdmin: boolean;
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
        firstName: string | null;
        lastName: string | null;
        businessId: string;
        roleIds: string[];
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
    } | {
        isSystemAdmin: boolean;
        id: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
    } | {
        isSystemAdmin: boolean;
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
}
export {};
