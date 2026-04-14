import { InvitationsService } from './invitations.service.js';
import { CreateInvitationInput } from './dto/create-invitation.input.js';
export declare class InvitationsResolver {
    private readonly invitationsService;
    constructor(invitationsService: InvitationsService);
    createInvitation(input: CreateInvitationInput, user: any): Promise<{
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
    getInvitation(token: string): Promise<{
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
    businessInvitations(businessId: string): Promise<({
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
    cancelInvitation(id: string, user: any): Promise<boolean>;
}
