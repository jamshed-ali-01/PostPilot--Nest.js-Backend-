import { Business } from '../../businesses/entities/business.entity';
export declare class SocialAccount {
    id: string;
    platform: string;
    accountName: string;
    accountId: string;
    isActive: boolean;
    business: Business;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
}
