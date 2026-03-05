import { TestimonialStatus } from '@prisma/client';
export declare class Testimonial {
    id: string;
    name: string;
    area: string;
    content: string;
    status: TestimonialStatus;
    businessId: string;
    createdAt: Date;
}
