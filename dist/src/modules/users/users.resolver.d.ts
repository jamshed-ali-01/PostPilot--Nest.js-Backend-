import { UsersService } from './users.service';
import { UpdateAiPreferencesInput } from './dto/update-ai-preferences.input';
export declare class UsersResolver {
    private readonly usersService;
    constructor(usersService: UsersService);
    findByEmail(email: string): Promise<({
        business: {
            id: string;
            name: string;
            logo: string | null;
            theme: string | null;
            isActive: boolean;
            subscriptionPlanId: string | null;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            stripePriceId: string | null;
            trialEndsAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        roles: ({
            permissions: {
                id: string;
                name: string;
                roleIds: string[];
                description: string | null;
            }[];
        } & {
            id: string;
            name: string;
            businessId: string | null;
            description: string | null;
            permissionIds: string[];
            userIds: string[];
        })[];
    } & {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        businessId: string;
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        password: string;
        roleIds: string[];
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateAiPreferences(user: any, input: UpdateAiPreferencesInput): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        businessId: string;
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        password: string;
        roleIds: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
