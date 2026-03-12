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
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
let SuperAdminService = class SuperAdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async createGlobalPermission(name, description) {
        return this.prisma.permission.create({
            data: { name, description }
        });
    }
    async createGlobalRole(name, description, permissionIds) {
        return this.prisma.role.create({
            data: {
                name,
                description,
                businessId: null,
                permissions: {
                    connect: permissionIds.map(id => ({ id }))
                }
            },
            include: { permissions: true }
        });
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map