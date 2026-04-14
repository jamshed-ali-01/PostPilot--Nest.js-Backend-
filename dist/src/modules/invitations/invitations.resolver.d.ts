import { InvitationsService } from './invitations.service.js';
import { CreateInvitationInput } from './dto/create-invitation.input.js';
export declare class InvitationsResolver {
    private readonly invitationsService;
    constructor(invitationsService: InvitationsService);
    createInvitation(input: CreateInvitationInput, user: any): Promise<{
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
    getInvitation(token: string): Promise<{
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
    businessInvitations(businessId: string): Promise<({
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
    cancelInvitation(id: string, user: any): Promise<boolean>;
}
