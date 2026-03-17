import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BusinessesService {
    constructor(private prisma: PrismaService) { }

    async create(name: string) {
        const business = await this.prisma.business.create({
            data: { name },
        });

        // Global roles are now used by default, no need for business-specific role seeding.
        return business;
    }

    async toggleActiveStatus(id: string, isActive: boolean) {
        return this.prisma.business.update({
            where: { id },
            data: { isActive },
        });
    }

    async toggleSubscription(id: string, isSubscriptionActive: boolean) {
        return this.prisma.business.update({
            where: { id },
            data: { isSubscriptionActive },
        });
    }

    async purchaseSubscription(id: string, planId: string) {
        // Mock payment implementation: immediately sets the account to active
        console.log(`[Subscription] User purchased plan ${planId} for business ${id}`);
        return this.prisma.business.update({
            where: { id },
            data: {
                isActive: true,
                subscriptionPlanId: planId
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.business.findUnique({
            where: { id },
            include: { users: true, roles: true },
        });
    }

    async findAll() {
        return this.prisma.business.findMany({
            include: { users: true, subscriptionPlan: true },
        });
    }



    async deleteBusiness(id: string) {
        return this.prisma.business.delete({
            where: { id },
        });
    }

    async updateBusiness(id: string, data: { name?: string; logo?: string; phone?: string; email?: string }) {
        return (this.prisma.business as any).update({
            where: { id },
            data: data as any,
        });
    }
}
