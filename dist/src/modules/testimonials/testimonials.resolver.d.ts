import { TestimonialsService } from './testimonials.service.js';
import { CreateTestimonialInput } from './dto/create-testimonial.input.js';
export declare class TestimonialsResolver {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    submitTestimonial(input: CreateTestimonialInput): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        businessId: string;
        content: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        area: string;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        businessId: string;
        content: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        area: string;
    }[]>;
    approveTestimonial(id: string, user: any): Promise<{
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
