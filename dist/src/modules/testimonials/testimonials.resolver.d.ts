import { TestimonialsService } from './testimonials.service.js';
import { CreateTestimonialInput } from './dto/create-testimonial.input.js';
export declare class TestimonialsResolver {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    submitTestimonial(input: CreateTestimonialInput): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        content: string;
        area: string;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        content: string;
        area: string;
    }[]>;
    approveTestimonial(id: string, user: any): Promise<{
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
