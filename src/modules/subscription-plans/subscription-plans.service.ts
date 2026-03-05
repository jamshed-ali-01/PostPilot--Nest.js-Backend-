import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionPlansService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return (this.prisma.subscriptionPlan as any).findMany({
            orderBy: { price: 'asc' } as any
        });
    }

    async findOne(id: string) {
        return (this.prisma.subscriptionPlan as any).findUnique({ where: { id } as any });
    }

    async create(data: { name: string, price: number, description?: string, features: string[], isPopular?: boolean }) {
        return (this.prisma.subscriptionPlan as any).create({ data: data as any });
    }

    async update(id: string, data: Partial<{ name: string, price: number, description: string, features: string[], isPopular: boolean }>) {
        return (this.prisma.subscriptionPlan as any).update({
            where: { id } as any,
            data: data as any
        });
    }

    async remove(id: string) {
        return (this.prisma.subscriptionPlan as any).delete({ where: { id } as any });
    }
}
