import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleInput } from './dto/create-role.input';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async create(createRoleInput: CreateRoleInput) {
        const { name, description, permissionIds, businessId } = createRoleInput;

        return this.prisma.role.create({
            data: {
                name,
                description,
                businessId,
                permissions: {
                    connect: permissionIds.map((id: string) => ({ id })),
                },
            },
            include: {
                permissions: true,
            },
        });
    }

    async createPermission(name: string, description?: string) {
        return this.prisma.permission.create({
            data: { name, description },
        });
    }

    async findAllGlobal() {
        return this.prisma.role.findMany({
            where: { businessId: null },
            include: { permissions: true },
        });
    }

    async findAllByBusiness(businessId: string) {
        return this.prisma.role.findMany({
            where: {
                OR: [{ businessId }, { businessId: null }],
            },
            include: { permissions: true },
        });
    }

    async assignToUser(userId: string, roleId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                roles: {
                    connect: { id: roleId },
                },
            },
        });
    }

    async findPermissions() {
        return this.prisma.permission.findMany();
    }
}
