import { PostStatus } from '@prisma/client';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
export declare class Post {
    id: string;
    content: string;
    mediaUrls: string[];
    status: PostStatus;
    scheduledAt?: Date;
    publishedAt?: Date;
    businessId?: string;
    business?: Business;
    authorId?: string;
    author: User;
    targetingRegions: string[];
    platformIds: string[];
    platforms: string[];
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
    createdAt: Date;
    updatedAt: Date;
}
