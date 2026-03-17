import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
        console.log(`[RolesService] Finding roles for business: "${businessId}"`);
        const roles = await this.prisma.role.findMany({
            where: {
                OR: [
                    { businessId: businessId || undefined }, 
                    { businessId: null }
                ],
            },
            include: { permissions: true },
        });
        console.log(`[RolesService] Found ${roles.length} roles.`);
        return roles;
    }

    async assignToUser(userId: string, roleId: string, currentUserId?: string) {
        // Prevent users from changing their own role if they are an owner
        if (userId === currentUserId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { roles: true }
            });
            const isOwner = user?.roles.some(r => r.name === 'Business Owner' || r.name.startsWith('OWNER_'));
            if (isOwner) {
                throw new BadRequestException('As a Business Owner, you cannot change your own role.');
            }
        }

        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) throw new NotFoundException('Role not found');

        if (role.name === 'Business Owner' || role.name.startsWith('OWNER_')) {
            throw new BadRequestException('The "Business Owner" role cannot be manually assigned. It is uniquely assigned during registration.');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                roles: {
                    set: [{ id: roleId }],
                },
            },
        });
    }

    async findPermissions() {
        return this.prisma.permission.findMany();
    }

    async findPermissionByName(name: string) {
        return this.prisma.permission.findUnique({ where: { name } });
    }

    async update(id: string, updateRoleInput: Partial<CreateRoleInput>) {
        const { name, description, permissionIds } = updateRoleInput;

        return this.prisma.role.update({
            where: { id },
            data: {
                name,
                description,
                permissionIds: permissionIds,
            },
            include: { permissions: true },
        });
    }

    async delete(id: string) {
        return this.prisma.role.delete({ where: { id } });
    }
}
