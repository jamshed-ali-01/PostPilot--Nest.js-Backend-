import { UsersService } from './users.service';
import { UpdateAiPreferencesInput } from './dto/update-ai-preferences.input';
export declare class UsersResolver {
    private readonly usersService;
    constructor(usersService: UsersService);
    findByEmail(email: string): Promise<({
        business: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            logo: string | null;
            theme: string | null;
            isActive: boolean;
            isSubscriptionActive: boolean;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            stripePriceId: string | null;
            trialEndsAt: Date | null;
            subscriptionPlanId: string | null;
        } | null;
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
    } & {
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
    }) | null>;
    updateAiPreferences(user: any, input: UpdateAiPreferencesInput): Promise<{
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
