import { PrismaService } from '../../prisma/prisma.service';
import { CreateTestimonialInput } from './dto/create-testimonial.input';
export declare class TestimonialsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(input: CreateTestimonialInput): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        businessId: string;
        content: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        area: string;
    }>;
    findAllByBusiness(businessId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        businessId: string;
        content: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        area: string;
    }[]>;
    approveAndConvertToPost(id: string, authorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string | null;
        content: string;
        mediaUrls: string[];
        status: import(".prisma/client").$Enums.PostStatus;
        scheduledAt: Date | null;
        publishedAt: Date | null;
        targetingRegions: string[];
        platformIds: string[];
        reach: number;
        impressions: number;
        likes: number;
        comments: number;
        shares: number;
        engagement: number;
        authorId: string | null;
    }>;
}
