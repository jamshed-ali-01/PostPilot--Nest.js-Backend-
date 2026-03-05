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
        businessId: string;
        content: string;
        mediaUrls: string[];
        scheduledAt: Date | null;
        targetingRegions: string[];
        platformIds: string[];
        authorId: string;
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
