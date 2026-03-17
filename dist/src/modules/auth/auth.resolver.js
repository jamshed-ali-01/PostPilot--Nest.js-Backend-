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
exports.AuthResolver = exports.AuthUser = void 0;
const graphql_1 = require("@nestjs/graphql");
const auth_service_1 = require("./auth.service");
const auth_inputs_1 = require("./dto/auth-inputs");
const auth_inputs_2 = require("./dto/auth-inputs");
const user_entity_1 = require("../users/entities/user.entity");
const business_entity_1 = require("../businesses/entities/business.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../common/guards/gql-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuthUser = class AuthUser {
    id;
    email;
    firstName;
    lastName;
    name;
    isSystemAdmin;
    businessId;
    business;
    aiTone;
    aiHashtags;
    aiCaptionLength;
    aiIncludeEmojis;
    permissions;
    roles;
};
exports.AuthUser = AuthUser;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuthUser.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuthUser.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuthUser.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuthUser.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuthUser.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], AuthUser.prototype, "isSystemAdmin", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuthUser.prototype, "businessId", void 0);
__decorate([
    (0, graphql_1.Field)(() => business_entity_1.Business, { nullable: true }),
    __metadata("design:type", business_entity_1.Business)
], AuthUser.prototype, "business", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuthUser.prototype, "aiTone", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AuthUser.prototype, "aiHashtags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuthUser.prototype, "aiCaptionLength", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], AuthUser.prototype, "aiIncludeEmojis", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AuthUser.prototype, "permissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [RoleDto], { nullable: true }),
    __metadata("design:type", Array)
], AuthUser.prototype, "roles", void 0);
exports.AuthUser = AuthUser = __decorate([
    (0, graphql_1.ObjectType)()
], AuthUser);
let RoleDto = class RoleDto {
    id;
    name;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RoleDto.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RoleDto.prototype, "name", void 0);
RoleDto = __decorate([
    (0, graphql_1.ObjectType)()
], RoleDto);
let AuthResponse = class AuthResponse {
    access_token;
    user;
    stripeUrl;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuthResponse.prototype, "access_token", void 0);
__decorate([
    (0, graphql_1.Field)(() => AuthUser),
    __metadata("design:type", AuthUser)
], AuthResponse.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuthResponse.prototype, "stripeUrl", void 0);
AuthResponse = __decorate([
    (0, graphql_1.ObjectType)()
], AuthResponse);
let AuthInitiateResponse = class AuthInitiateResponse {
    stripeUrl;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuthInitiateResponse.prototype, "stripeUrl", void 0);
AuthInitiateResponse = __decorate([
    (0, graphql_1.ObjectType)()
], AuthInitiateResponse);
let AuthResolver = class AuthResolver {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginInput) {
        return this.authService.login(loginInput);
    }
    async initiateRegister(registerInput) {
        return this.authService.initiateRegister(registerInput);
    }
    async registerByInvite(input, token) {
        return this.authService.registerByInvite(input, token);
    }
    async getMe(user) {
        return this.authService.getMe(user.id);
    }
    async confirmRegistration(sessionId) {
        return this.authService.confirmRegistrationBySession(sessionId);
    }
};
exports.AuthResolver = AuthResolver;
__decorate([
    (0, graphql_1.Mutation)(() => AuthResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_inputs_1.LoginInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "login", null);
__decorate([
    (0, graphql_1.Mutation)(() => AuthInitiateResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_inputs_2.RegisterInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "initiateRegister", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_entity_1.User),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Args)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_inputs_2.RegisterInput, String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "registerByInvite", null);
__decorate([
    (0, graphql_1.Query)(() => AuthUser, { name: 'me' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "getMe", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "confirmRegistration", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map