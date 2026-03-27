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
exports.InvitationsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const invitations_service_js_1 = require("./invitations.service.js");
const invitation_entity_js_1 = require("./entities/invitation.entity.js");
const create_invitation_input_js_1 = require("./dto/create-invitation.input.js");
const common_1 = require("@nestjs/common");
const gql_auth_guard_js_1 = require("../../common/guards/gql-auth.guard.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
const common_2 = require("@nestjs/common");
let InvitationsResolver = class InvitationsResolver {
    invitationsService;
    constructor(invitationsService) {
        this.invitationsService = invitationsService;
    }
    async createInvitation(input, user) {
        if (!input.businessId) {
            if (!user.businessId) {
                throw new common_2.BadRequestException('Business ID is required for invitations.');
            }
            input.businessId = user.businessId;
        }
        return this.invitationsService.create(input);
    }
    async getInvitation(token) {
        return this.invitationsService.findByToken(token);
    }
    async businessInvitations(businessId) {
        return this.invitationsService.findByBusiness(businessId);
    }
    async cancelInvitation(id, user) {
        await this.invitationsService.deleteInvitation(id, user.businessId);
        return true;
    }
};
exports.InvitationsResolver = InvitationsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => invitation_entity_js_1.Invitation),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invitation_input_js_1.CreateInvitationInput, Object]),
    __metadata("design:returntype", Promise)
], InvitationsResolver.prototype, "createInvitation", null);
__decorate([
    (0, graphql_1.Query)(() => invitation_entity_js_1.Invitation),
    __param(0, (0, graphql_1.Args)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationsResolver.prototype, "getInvitation", null);
__decorate([
    (0, graphql_1.Query)(() => [invitation_entity_js_1.Invitation]),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationsResolver.prototype, "businessInvitations", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvitationsResolver.prototype, "cancelInvitation", null);
exports.InvitationsResolver = InvitationsResolver = __decorate([
    (0, graphql_1.Resolver)(() => invitation_entity_js_1.Invitation),
    __metadata("design:paramtypes", [invitations_service_js_1.InvitationsService])
], InvitationsResolver);
//# sourceMappingURL=invitations.resolver.js.map