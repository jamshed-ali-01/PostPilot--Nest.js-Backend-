import { PrismaService } from '../../prisma/prisma.service';
import { ConnectSocialAccountInput } from './dto/social-account-inputs';
export declare class SocialAccountsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByBusiness(businessId: string | undefined): Promise<{
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
    connect(businessId: string, input: ConnectSocialAccountInput): Promise<{
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
    connectAccount(businessId: string | undefined, input: ConnectSocialAccountInput): Promise<{
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
    getAuthUrl(businessId: string | undefined, platform: string): Promise<string>;
    handleOAuthCallback(businessId: string | undefined, platform: string, code: string): Promise<any>;
    disconnect(id: string): Promise<{
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
    publishToPlatforms(platformIds: string[], content: string, mediaUrls: string[]): Promise<any[]>;
}
