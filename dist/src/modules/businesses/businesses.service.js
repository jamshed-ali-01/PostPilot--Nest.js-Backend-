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
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BusinessesService = class BusinessesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(name) {
        const business = await this.prisma.business.create({
            data: { name },
        });
        return business;
    }
    async toggleActiveStatus(id, isActive) {
        return this.prisma.business.update({
            where: { id },
            data: { isActive },
        });
    }
    async toggleSubscription(id, isSubscriptionActive) {
        return this.prisma.business.update({
            where: { id },
            data: { isSubscriptionActive },
        });
    }
    async purchaseSubscription(id, planId) {
        console.log(`[Subscription] User purchased plan ${planId} for business ${id}`);
        return this.prisma.business.update({
            where: { id },
            data: {
                isActive: true,
                subscriptionPlanId: planId
            },
        });
    }
    async findOne(id) {
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
    async deleteBusiness(id) {
        return this.prisma.business.delete({
            where: { id },
        });
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map