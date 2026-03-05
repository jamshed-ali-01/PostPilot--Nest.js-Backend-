import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SuperAdminService {
    constructor(private prisma: PrismaService) { }

    async getAllBusinesses() {
        return this.prisma.business.findMany({
            include: {
                _count: {
                    select: { users: true, posts: true, testimonials: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getAllUsers() {
        return this.prisma.user.findMany({
            include: {
                business: true,
                roles: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getGlobalStats() {
        const [businessCount, userCount, postCount, testimonialCount] = await Promise.all([
            this.prisma.business.count(),
            this.prisma.user.count(),
            this.prisma.post.count(),
            this.prisma.testimonial.count()
        ]);

        return {
            businessCount,
            userCount,
            postCount,
            testimonialCount
        };
    }
}
