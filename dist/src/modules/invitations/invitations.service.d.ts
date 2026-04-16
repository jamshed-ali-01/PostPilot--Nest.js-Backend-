import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { CreateInvitationInput } from './dto/create-invitation.input.js';
export declare class InvitationsService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    create(input: CreateInvitationInput): Promise<{
        id: string;
        email: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        roleId: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
    findByToken(token: string): Promise<{
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
        };
        role: {
            id: string;
            businessId: string | null;
            name: string;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        };
    } & {
        id: string;
        email: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        roleId: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
    accept(token: string): Promise<{
        id: string;
        email: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        roleId: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
    findByBusiness(businessId: string): Promise<({
        role: {
            id: string;
            businessId: string | null;
            name: string;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        };
    } & {
        id: string;
        email: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        roleId: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    })[]>;
    deleteInvitation(id: string, businessId: string): Promise<{
        id: string;
        email: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        roleId: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
}
