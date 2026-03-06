import { SocialAccountsService } from './social-accounts.service';
import { ConnectSocialAccountInput } from './dto/social-account-inputs';
export declare class SocialAccountsResolver {
    private readonly socialAccountsService;
    constructor(socialAccountsService: SocialAccountsService);
    socialAccounts(user: any): Promise<{
        id: string;
        platform: string;
        accountName: string;
        accountId: string;
        accessToken: string | null;
        isActive: boolean;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAuthUrl(user: any, platform: string): Promise<string>;
    connectSocialAccount(user: any, input: ConnectSocialAccountInput): Promise<{
        id: string;
        platform: string;
        accountName: string;
        accountId: string;
        accessToken: string | null;
        isActive: boolean;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    disconnectSocialAccount(id: string): Promise<{
        id: string;
        platform: string;
        accountName: string;
        accountId: string;
        accessToken: string | null;
        isActive: boolean;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
