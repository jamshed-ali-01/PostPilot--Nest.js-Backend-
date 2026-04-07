import { AdStatus } from '@prisma/client';
export declare class Ad {
    id: string;
    headline: string;
    primaryText: string;
    description?: string;
    mediaUrls?: string[];
    platform: string;
    status: AdStatus;
    businessId: string;
    adAccountId?: string;
    pageId?: string;
    campaignId?: string;
    adSetId?: string;
    metaAdId?: string;
    budget?: number;
    postcode?: string;
    startDate?: Date;
    endDate?: Date;
    destinationLink?: string;
    metaError?: string;
    createdAt: Date;
    updatedAt: Date;
}
