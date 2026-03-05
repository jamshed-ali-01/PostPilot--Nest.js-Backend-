import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private usersService;
    private prisma;
    constructor(configService: ConfigService, usersService: UsersService, prisma: PrismaService);
    validate(payload: any): Promise<{
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
        };
        roles: ({
            permissions: {
                id: string;
                name: string;
                description: string | null;
                roleIds: string[];
            }[];
        } & {
            id: string;
            name: string;
            description: string | null;
            businessId: string | null;
            permissionIds: string[];
            userIds: string[];
        })[];
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
    } | {
        isSystemAdmin: boolean;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
    }>;
}
export {};
