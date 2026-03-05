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
exports.ServiceAreasResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const service_areas_service_js_1 = require("./service-areas.service.js");
const service_area_entity_js_1 = require("./entities/service-area.entity.js");
const create_service_area_input_js_1 = require("./dto/create-service-area.input.js");
const gql_auth_guard_js_1 = require("../../common/guards/gql-auth.guard.js");
const rbac_guard_js_1 = require("../../common/guards/rbac.guard.js");
const permissions_decorator_js_1 = require("../../common/decorators/permissions.decorator.js");
let ServiceAreasResolver = class ServiceAreasResolver {
    serviceAreasService;
    constructor(serviceAreasService) {
        this.serviceAreasService = serviceAreasService;
    }
    async createServiceArea(input) {
        return this.serviceAreasService.create(input);
    }
    async findAll(businessId) {
        return this.serviceAreasService.findAllByBusiness(businessId);
    }
    async removeServiceArea(id) {
        return this.serviceAreasService.remove(id);
    }
};
exports.ServiceAreasResolver = ServiceAreasResolver;
__decorate([
    (0, graphql_1.Mutation)(() => service_area_entity_js_1.ServiceArea),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard, rbac_guard_js_1.RbacGuard),
    (0, permissions_decorator_js_1.Permissions)('ADMIN_SETTINGS'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_area_input_js_1.CreateServiceAreaInput]),
    __metadata("design:returntype", Promise)
], ServiceAreasResolver.prototype, "createServiceArea", null);
__decorate([
    (0, graphql_1.Query)(() => [service_area_entity_js_1.ServiceArea], { name: 'businessServiceAreas' }),
    __param(0, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceAreasResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Mutation)(() => service_area_entity_js_1.ServiceArea),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard, rbac_guard_js_1.RbacGuard),
    (0, permissions_decorator_js_1.Permissions)('ADMIN_SETTINGS'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceAreasResolver.prototype, "removeServiceArea", null);
exports.ServiceAreasResolver = ServiceAreasResolver = __decorate([
    (0, graphql_1.Resolver)(() => service_area_entity_js_1.ServiceArea),
    __metadata("design:paramtypes", [service_areas_service_js_1.ServiceAreasService])
], ServiceAreasResolver);
//# sourceMappingURL=service-areas.resolver.js.map