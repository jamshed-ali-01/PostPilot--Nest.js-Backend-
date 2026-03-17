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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const businesses_service_1 = require("./businesses.service");
const business_entity_1 = require("./entities/business.entity");
const gql_auth_guard_1 = require("../../common/guards/gql-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let BusinessesResolver = class BusinessesResolver {
    businessesService;
    constructor(businessesService) {
        this.businessesService = businessesService;
    }
    async createBusiness(name) {
        return this.businessesService.create(name);
    }
    async toggleActiveStatus(businessId, isActive, user) {
        if (!user.isSystemAdmin) {
            throw new Error("Unauthorized: Only System Admins can toggle account active status.");
        }
        return this.businessesService.toggleActiveStatus(businessId, isActive);
    }
    async toggleBusinessSubscription(businessId, isSubscriptionActive, user) {
        if (!user.isSystemAdmin) {
            throw new Error("Unauthorized: Only System Admins can toggle subscriptions.");
        }
        return this.businessesService.toggleSubscription(businessId, isSubscriptionActive);
    }
    async purchaseSubscription(planId, user) {
        if (!user.businessId) {
            throw new Error("User is not associated with any business.");
        }
        return this.businessesService.purchaseSubscription(user.businessId, planId);
    }
    async findAll() {
        return this.businessesService.findAll();
    }
    async getBusinessProfile(user) {
        if (!user.businessId)
            throw new Error('No business associated');
        return this.businessesService.findOne(user.businessId);
    }
    async updateBusiness(name, logo, phone, email, user) {
        if (!user.businessId)
            throw new Error('No business associated');
        return this.businessesService.updateBusiness(user.businessId, { name, logo, phone, email });
    }
    async findOne(id) {
        return this.businessesService.findOne(id);
    }
    async deleteBusiness(businessId, user) {
        if (!user.isSystemAdmin) {
            throw new Error("Unauthorized: Only System Admins can delete businesses.");
        }
        await this.businessesService.deleteBusiness(businessId);
        return true;
    }
};
exports.BusinessesResolver = BusinessesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => business_entity_1.Business),
    __param(0, (0, graphql_1.Args)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessesResolver.prototype, "createBusiness", null);
__decorate([
    (0, graphql_1.Mutation)(() => business_entity_1.Business),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('businessId')),
    __param(1, (0, graphql_1.Args)('isActive')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], BusinessesResolver.prototype, "toggleActiveStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => business_entity_1.Business),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('businessId')),
    __param(1, (0, graphql_1.Args)('isSubscriptionActive')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], BusinessesResolver.prototype, "toggleBusinessSubscription", null);
__decorate([
    (0, graphql_1.Mutation)(() => business_entity_1.Business),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('planId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessesResolver.prototype, "purchaseSubscription", null);
__decorate([
    (0, graphql_1.Query)(() => [business_entity_1.Business], { name: 'businesses' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessesResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => business_entity_1.Business, { name: 'businessProfile' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessesResolver.prototype, "getBusinessProfile", null);
__decorate([
    (0, graphql_1.Mutation)(() => business_entity_1.Business, { name: 'updateBusiness' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('name', { nullable: true })),
    __param(1, (0, graphql_1.Args)('logo', { nullable: true })),
    __param(2, (0, graphql_1.Args)('phone', { nullable: true })),
    __param(3, (0, graphql_1.Args)('email', { nullable: true })),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], BusinessesResolver.prototype, "updateBusiness", null);
__decorate([
    (0, graphql_1.Query)(() => business_entity_1.Business, { name: 'business' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessesResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('businessId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessesResolver.prototype, "deleteBusiness", null);
exports.BusinessesResolver = BusinessesResolver = __decorate([
    (0, graphql_1.Resolver)(() => business_entity_1.Business),
    __metadata("design:paramtypes", [businesses_service_1.BusinessesService])
], BusinessesResolver);
//# sourceMappingURL=businesses.resolver.js.map