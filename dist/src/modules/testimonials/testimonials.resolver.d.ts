import { TestimonialsService } from './testimonials.service.js';
import { CreateTestimonialInput } from './dto/create-testimonial.input.js';
export declare class TestimonialsResolver {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    submitTestimonial(input: CreateTestimonialInput): Promise<{
        name: string;
        id: string;
        content: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        businessId: string;
        createdAt: Date;
        area: string;
    }>;
    findAll(businessId: string): Promise<{
        name: string;
        id: string;
        content: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        businessId: string;
        createdAt: Date;
        area: string;
    }[]>;
    approveTestimonial(id: string, user: any): Promise<{
        id: string;
        content: string;
        mediaUrls: string[];
        status: import(".prisma/client").$Enums.PostStatus;
        scheduledAt: Date | null;
        publishedAt: Date | null;
        businessId: string | null;
        authorId: string | null;
        targetingRegions: string[];
        platformIds: string[];
        reach: number;
        impressions: number;
        likes: number;
        comments: number;
        shares: number;
        engagement: number;
        platformErrors: import("@prisma/client/runtime/library").JsonValue | null;
        platformPostIds: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
