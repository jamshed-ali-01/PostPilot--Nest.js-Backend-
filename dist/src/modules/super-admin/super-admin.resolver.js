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
exports.SuperAdminResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const super_admin_service_js_1 = require("./super-admin.service.js");
const business_entity_js_1 = require("../businesses/entities/business.entity.js");
const user_entity_js_1 = require("../users/entities/user.entity.js");
const global_stats_entity_js_1 = require("./entities/global-stats.entity.js");
const system_settings_entity_js_1 = require("./entities/system-settings.entity.js");
const update_system_settings_input_js_1 = require("./dto/update-system-settings.input.js");
const gql_auth_guard_js_1 = require("../../common/guards/gql-auth.guard.js");
const rbac_guard_js_1 = require("../../common/guards/rbac.guard.js");
let SuperAdminResolver = class SuperAdminResolver {
    superAdminService;
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }
    async getAllBusinesses() {
        return this.superAdminService.getAllBusinesses();
    }
    async getAllUsers() {
        return this.superAdminService.getAllUsers();
    }
    async getGlobalStats() {
        return this.superAdminService.getGlobalStats();
    }
    async getSystemSettings() {
        return this.superAdminService.getSystemSettings();
    }
    async updateSystemSettings(input) {
        return this.superAdminService.updateSystemSettings(input);
    }
    async toggleActiveStatus(businessId, isActive) {
        return this.superAdminService.toggleActiveStatus(businessId, isActive);
    }
    async toggleBusinessSubscription(businessId, isSubscriptionActive) {
        return this.superAdminService.toggleBusinessSubscription(businessId, isSubscriptionActive);
    }
    async deleteBusiness(businessId) {
        return this.superAdminService.deleteBusiness(businessId);
    }
};
exports.SuperAdminResolver = SuperAdminResolver;
__decorate([
    (0, graphql_1.Query)(() => [business_entity_js_1.Business], { name: 'adminAllBusinesses' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminResolver.prototype, "getAllBusinesses", null);
__decorate([
    (0, graphql_1.Query)(() => [user_entity_js_1.User], { name: 'adminAllUsers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminResolver.prototype, "getAllUsers", null);
__decorate([
    (0, graphql_1.Query)(() => global_stats_entity_js_1.GlobalStats, { name: 'adminGlobalStats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminResolver.prototype, "getGlobalStats", null);
__decorate([
    (0, graphql_1.Query)(() => [system_settings_entity_js_1.SystemSettings], { name: 'adminSystemSettings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminResolver.prototype, "getSystemSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => system_settings_entity_js_1.SystemSettings, { name: 'adminUpdateSystemSettings' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_system_settings_input_js_1.UpdateSystemSettingsInput]),
    __metadata("design:returntype", Promise)
], SuperAdminResolver.prototype, "updateSystemSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => business_entity_js_1.Business, { name: 'toggleActiveStatus' }),
    __param(0, (0, graphql_1.Args)('businessId')),
    __param(1, (0, graphql_1.Args)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], SuperAdminResolver.prototype, "toggleActiveStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => business_entity_js_1.Business, { name: 'toggleBusinessSubscription' }),
    __param(0, (0, graphql_1.Args)('businessId')),
    __param(1, (0, graphql_1.Args)('isSubscriptionActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], SuperAdminResolver.prototype, "toggleBusinessSubscription", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteBusiness' }),
    __param(0, (0, graphql_1.Args)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminResolver.prototype, "deleteBusiness", null);
exports.SuperAdminResolver = SuperAdminResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard, rbac_guard_js_1.RbacGuard),
    __metadata("design:paramtypes", [super_admin_service_js_1.SuperAdminService])
], SuperAdminResolver);
//# sourceMappingURL=super-admin.resolver.js.map