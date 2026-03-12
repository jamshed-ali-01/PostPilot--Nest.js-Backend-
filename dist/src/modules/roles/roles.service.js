"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRoleInput) {
        const { name, description, permissionIds, businessId } = createRoleInput;
        return this.prisma.role.create({
            data: {
                name,
                description,
                businessId,
                permissions: {
                    connect: permissionIds.map((id) => ({ id })),
                },
            },
            include: {
                permissions: true,
            },
        });
    }
    async createPermission(name, description) {
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
    async findAllByBusiness(businessId) {
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
    async assignToUser(userId, roleId) {
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
    async findPermissionByName(name) {
        return this.prisma.permission.findUnique({ where: { name } });
    }
    async update(id, updateRoleInput) {
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
    async delete(id) {
        return this.prisma.role.delete({ where: { id } });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map