import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SuperAdminService {
    constructor(private prisma: PrismaService) { }

    async getAllBusinesses() {
        return (this.prisma.business as any).findMany({
            include: {
                users: {
                    include: { roles: true }
                },
                subscriptionPlan: true,
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

    async createGlobalPermission(name: string, description?: string) {
        return this.prisma.permission.create({
            data: { name, description }
        });
    }

    async createGlobalRole(name: string, description: string, permissionIds: string[]) {
        return this.prisma.role.create({
            data: {
                name,
                description,
                businessId: null, // Global role
                permissions: {
                    connect: permissionIds.map(id => ({ id }))
                }
            },
            include: { permissions: true }
        });
    }

    async getSystemSettings() {
        return this.prisma.systemSettings.findMany();
    }

    async updateSystemSettings(input: { key: string; value: any }) {
        return this.prisma.systemSettings.upsert({
            where: { key: input.key },
            update: { value: input.value },
            create: { key: input.key, value: input.value }
        });
    }

    async toggleActiveStatus(businessId: string, isActive: boolean) {
        return (this.prisma.business as any).update({
            where: { id: businessId },
            data: { isActive } as any
        });
    }

    async toggleBusinessSubscription(businessId: string, isSubscriptionActive: boolean) {
        return (this.prisma.business as any).update({
            where: { id: businessId },
            data: { isSubscriptionActive } as any
        });
    }

    async deleteBusiness(businessId: string) {
        await (this.prisma.business as any).delete({ where: { id: businessId } });
        return true;
    }
}
