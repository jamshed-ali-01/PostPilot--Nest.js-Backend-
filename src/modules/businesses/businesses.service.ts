import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BusinessesService {
    constructor(private prisma: PrismaService) { }

    async create(name: string) {
        const business = await this.prisma.business.create({
            data: { name },
        });

        // Seed default permissions if they don't exist
        const permissionNames = [
            'CREATE_POST', 'EDIT_POST', 'SCHEDULE_POST', 'PUBLISH_POST',
            'VIEW_ANALYTICS', 'MANAGE_INTEGRATIONS', 'MANAGE_SERVICE_AREAS',
            'INVITE_USERS', 'REMOVE_USERS', 'MANAGE_BILLING'
        ];

        for (const pName of permissionNames) {
            await this.prisma.permission.upsert({
                where: { name: pName },
                update: {},
                create: { name: pName },
            });
        }

        const allPermissions = await this.prisma.permission.findMany();
        const getPermId = (name: string) => allPermissions.find(p => p.name === name)?.id;

        // Seed default roles
        const ownerPerms = allPermissions.map(p => p.id);
        const managerPerms = [
            'CREATE_POST', 'EDIT_POST', 'SCHEDULE_POST', 'PUBLISH_POST',
            'VIEW_ANALYTICS', 'MANAGE_SERVICE_AREAS', 'INVITE_USERS'
        ].map(getPermId).filter(id => !!id) as string[];

        const staffPerms = [
            'CREATE_POST', 'VIEW_ANALYTICS'
        ].map(getPermId).filter(id => !!id) as string[];

        const roles = [
            { name: `OWNER`, description: 'Full access', permissionIds: ownerPerms },
            { name: `MANAGER`, description: 'Manage posts and users', permissionIds: managerPerms },
            { name: `STAFF`, description: 'Create drafts', permissionIds: staffPerms },
        ];

        for (const roleData of roles) {
            await this.prisma.role.create({
                data: {
                    ...roleData,
                    name: `${roleData.name}_${business.id}`,
                    businessId: business.id,
                },
            });
        }

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
}
