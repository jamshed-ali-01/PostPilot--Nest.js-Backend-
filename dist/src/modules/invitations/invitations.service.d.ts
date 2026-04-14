import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { CreateInvitationInput } from './dto/create-invitation.input.js';
export declare class InvitationsService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    create(input: CreateInvitationInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: string;
        businessId: string;
        email: string;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
    findByToken(token: string): Promise<{
        business: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            logo: string | null;
            phone: string | null;
            email: string | null;
            theme: string | null;
            isActive: boolean;
            isSubscriptionActive: boolean;
            subscriptionPlanId: string | null;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            stripePriceId: string | null;
            trialEndsAt: Date | null;
        };
        role: {
            name: string;
            id: string;
            businessId: string | null;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: string;
        businessId: string;
        email: string;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
    accept(token: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: string;
        businessId: string;
        email: string;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
    findByBusiness(businessId: string): Promise<({
        role: {
            name: string;
            id: string;
            businessId: string | null;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: string;
        businessId: string;
        email: string;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    })[]>;
    deleteInvitation(id: string, businessId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: string;
        businessId: string;
        email: string;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
}
