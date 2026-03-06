import { PrismaService } from '../../prisma/prisma.service';
import { ConnectSocialAccountInput } from './dto/social-account-inputs';
export declare class SocialAccountsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByBusiness(businessId: string | undefined): Promise<{
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
    connect(businessId: string, input: ConnectSocialAccountInput): Promise<{
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
    connectAccount(businessId: string | undefined, input: ConnectSocialAccountInput): Promise<{
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
    getAuthUrl(businessId: string | undefined, platform: string): Promise<string>;
    handleOAuthCallback(businessId: string | undefined, platform: string, code: string): Promise<any>;
    disconnect(id: string): Promise<{
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
    publishToPlatforms(platformIds: string[], content: string, mediaUrls: string[]): Promise<any[]>;
}
