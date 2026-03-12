import { UsersService } from './users.service';
import { UpdateAiPreferencesInput } from './dto/update-ai-preferences.input';
export declare class UsersResolver {
    private readonly usersService;
    constructor(usersService: UsersService);
    findByEmail(email: string): Promise<({
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
        } | null;
    } & {
        id: string;
        roleIds: string[];
        businessId: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateAiPreferences(user: any, input: UpdateAiPreferencesInput): Promise<{
        id: string;
        roleIds: string[];
        businessId: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
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
            name: string;
            description: string | null;
            businessId: string | null;
            permissionIds: string[];
            userIds: string[];
        }[];
    } & {
        id: string;
        roleIds: string[];
        businessId: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
