import { SocialAccountsService } from './social-accounts.service';
import { ConnectSocialAccountInput } from './dto/social-account-inputs';
export declare class SocialAccountsResolver {
    private readonly socialAccountsService;
    constructor(socialAccountsService: SocialAccountsService);
    socialAccounts(user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string | null;
        isActive: boolean;
        platform: string;
        accountName: string;
        accountId: string;
        accessToken: string | null;
    }[]>;
    getAuthUrl(user: any, platform: string): Promise<string>;
    connectSocialAccount(user: any, input: ConnectSocialAccountInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string | null;
        isActive: boolean;
        platform: string;
        accountName: string;
        accountId: string;
        accessToken: string | null;
    }>;
    disconnectSocialAccount(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string | null;
        isActive: boolean;
        platform: string;
        accountName: string;
        accountId: string;
        accessToken: string | null;
    }>;
}
