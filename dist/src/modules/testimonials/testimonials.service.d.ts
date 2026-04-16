import { PrismaService } from '../../prisma/prisma.service';
import { CreateTestimonialInput } from './dto/create-testimonial.input';
export declare class TestimonialsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(input: CreateTestimonialInput): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        content: string;
        area: string;
    }>;
    findAllByBusiness(businessId: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        content: string;
        area: string;
    }[]>;
    approveAndConvertToPost(id: string, authorId: string): Promise<{
        id: string;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
        mediaUrls: string[];
        status: import(".prisma/client").$Enums.PostStatus;
        content: string;
        scheduledAt: Date | null;
        targetingRegions: string[];
        platformIds: string[];
        authorId: string | null;
        publishedAt: Date | null;
        reach: number;
        impressions: number;
        likes: number;
        comments: number;
        shares: number;
        engagement: number;
        platformErrors: import("@prisma/client/runtime/library").JsonValue | null;
        platformPostIds: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
