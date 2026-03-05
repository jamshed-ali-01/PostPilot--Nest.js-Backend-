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
exports.RolesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const roles_service_1 = require("./roles.service");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const create_role_input_1 = require("./dto/create-role.input");
let RolesResolver = class RolesResolver {
    rolesService;
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    async createRole(input) {
        return this.rolesService.create(input);
    }
    async assignRoleToUser(userId, roleId) {
        await this.rolesService.assignToUser(userId, roleId);
        return true;
    }
    async getGlobalRoles() {
        return this.rolesService.findAllGlobal();
    }
    async getBusinessRoles(businessId) {
        return this.rolesService.findAllByBusiness(businessId);
    }
    async getPermissions() {
        return this.rolesService.findPermissions();
    }
    async createPermission(name, description) {
        return this.rolesService.createPermission(name, description);
    }
};
exports.RolesResolver = RolesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => role_entity_1.Role),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_input_1.CreateRoleInput]),
    __metadata("design:returntype", Promise)
], RolesResolver.prototype, "createRole", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RolesResolver.prototype, "assignRoleToUser", null);
__decorate([
    (0, graphql_1.Query)(() => [role_entity_1.Role], { name: 'globalRoles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolesResolver.prototype, "getGlobalRoles", null);
__decorate([
    (0, graphql_1.Query)(() => [role_entity_1.Role], { name: 'businessRoles' }),
    __param(0, (0, graphql_1.Args)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolesResolver.prototype, "getBusinessRoles", null);
__decorate([
    (0, graphql_1.Query)(() => [permission_entity_1.Permission], { name: 'permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolesResolver.prototype, "getPermissions", null);
__decorate([
    (0, graphql_1.Mutation)(() => permission_entity_1.Permission),
    __param(0, (0, graphql_1.Args)('name')),
    __param(1, (0, graphql_1.Args)('description', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RolesResolver.prototype, "createPermission", null);
exports.RolesResolver = RolesResolver = __decorate([
    (0, graphql_1.Resolver)(() => role_entity_1.Role),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesResolver);
//# sourceMappingURL=roles.resolver.js.map