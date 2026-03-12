import { TestimonialsService } from './testimonials.service.js';
import { CreateTestimonialInput } from './dto/create-testimonial.input.js';
export declare class TestimonialsResolver {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    submitTestimonial(input: CreateTestimonialInput): Promise<{
        id: string;
        name: string;
        businessId: string;
        createdAt: Date;
        content: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        area: string;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        name: string;
        businessId: string;
        createdAt: Date;
        content: string;
        status: import(".prisma/client").$Enums.TestimonialStatus;
        area: string;
    }[]>;
    approveTestimonial(id: string, user: any): Promise<{
        id: string;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        mediaUrls: string[];
        scheduledAt: Date | null;
        targetingRegions: string[];
        platformIds: string[];
        authorId: string | null;
        status: import(".prisma/client").$Enums.PostStatus;
        publishedAt: Date | null;
        reach: number;
        impressions: number;
        likes: number;
        comments: number;
        shares: number;
        engagement: number;
    }>;
}
