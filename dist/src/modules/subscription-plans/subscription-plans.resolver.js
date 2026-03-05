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
exports.SubscriptionPlansResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const subscription_plans_service_1 = require("./subscription-plans.service");
const subscription_plan_entity_1 = require("./entities/subscription-plan.entity");
const gql_auth_guard_1 = require("../../common/guards/gql-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SubscriptionPlansResolver = class SubscriptionPlansResolver {
    plansService;
    constructor(plansService) {
        this.plansService = plansService;
    }
    async findAll() {
        return this.plansService.findAll();
    }
    async createSubscriptionPlan(name, price, features, description, isPopular, user) {
        if (!user)
            throw new Error("Unauthorized");
        return this.plansService.create({ name, price, description, features, isPopular });
    }
    async updateSubscriptionPlan(id, name, price, features, description, isPopular, user) {
        if (!user)
            throw new Error("Unauthorized");
        return this.plansService.update(id, { name, price, description, features, isPopular });
    }
    async deleteSubscriptionPlan(id, user) {
        if (!user)
            throw new Error("Unauthorized");
        await this.plansService.remove(id);
        return true;
    }
};
exports.SubscriptionPlansResolver = SubscriptionPlansResolver;
__decorate([
    (0, graphql_1.Query)(() => [subscription_plan_entity_1.SubscriptionPlan], { name: 'subscriptionPlans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionPlansResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Mutation)(() => subscription_plan_entity_1.SubscriptionPlan),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('name')),
    __param(1, (0, graphql_1.Args)('price', { type: () => graphql_1.Float })),
    __param(2, (0, graphql_1.Args)('features', { type: () => [String] })),
    __param(3, (0, graphql_1.Args)('description', { nullable: true })),
    __param(4, (0, graphql_1.Args)('isPopular', { defaultValue: false })),
    __param(5, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Array, String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionPlansResolver.prototype, "createSubscriptionPlan", null);
__decorate([
    (0, graphql_1.Mutation)(() => subscription_plan_entity_1.SubscriptionPlan),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('name', { nullable: true })),
    __param(2, (0, graphql_1.Args)('price', { type: () => graphql_1.Float, nullable: true })),
    __param(3, (0, graphql_1.Args)('features', { type: () => [String], nullable: true })),
    __param(4, (0, graphql_1.Args)('description', { nullable: true })),
    __param(5, (0, graphql_1.Args)('isPopular', { nullable: true })),
    __param(6, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Array, String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionPlansResolver.prototype, "updateSubscriptionPlan", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionPlansResolver.prototype, "deleteSubscriptionPlan", null);
exports.SubscriptionPlansResolver = SubscriptionPlansResolver = __decorate([
    (0, graphql_1.Resolver)(() => subscription_plan_entity_1.SubscriptionPlan),
    __metadata("design:paramtypes", [subscription_plans_service_1.SubscriptionPlansService])
], SubscriptionPlansResolver);
//# sourceMappingURL=subscription-plans.resolver.js.map