import { UsersService } from './users.service';
import { UpdateAiPreferencesInput } from './dto/update-ai-preferences.input';
export declare class UsersResolver {
    private readonly usersService;
    constructor(usersService: UsersService);
    findByEmail(email: string): Promise<({
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
    } & {
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
    }) | null>;
    updateAiPreferences(user: any, input: UpdateAiPreferencesInput): Promise<{
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
    findAllByBusiness(businessId: string): Promise<({
        roles: {
            id: string;
            businessId: string | null;
            name: string;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        }[];
    } & {
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
    })[]>;
    removeTeamMember(userId: string, user: any): Promise<boolean>;
}
