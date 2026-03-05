import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTestimonialInput } from './dto/create-testimonial.input';
import { PostStatus, TestimonialStatus } from '@prisma/client';

@Injectable()
export class TestimonialsService {
    constructor(private prisma: PrismaService) { }

    async create(input: CreateTestimonialInput) {
        return this.prisma.testimonial.create({
            data: {
                ...input,
                status: TestimonialStatus.PENDING,
            },
        });
    }

    async findAllByBusiness(businessId: string) {
        return this.prisma.testimonial.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async approveAndConvertToPost(id: string, authorId: string) {
        const testimonial = await this.prisma.testimonial.findUnique({
            where: { id },
        });

        if (!testimonial) throw new Error('Testimonial not found');

        // Create a draft post
        const post = await this.prisma.post.create({
            data: {
                content: `✨ Customer Highlight: "${testimonial.content}" - ${testimonial.name} from ${testimonial.area}`,
                businessId: testimonial.businessId,
                authorId: authorId,
                status: PostStatus.DRAFT,
                targetingRegions: [testimonial.area],
            },
        });

        // Update testimonial status
        await this.prisma.testimonial.update({
            where: { id },
            data: { status: TestimonialStatus.CONVERTED_TO_POST },
        });

        return post;
    }
}
