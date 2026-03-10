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
exports.SocialAccountsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const social_accounts_service_1 = require("./social-accounts.service");
const social_account_entity_1 = require("./entities/social-account.entity");
const social_account_inputs_1 = require("./dto/social-account-inputs");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../common/guards/gql-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SocialAccountsResolver = class SocialAccountsResolver {
    socialAccountsService;
    constructor(socialAccountsService) {
        this.socialAccountsService = socialAccountsService;
    }
    async socialAccounts(user) {
        const busId = user?.businessId || user?.business?.id;
        if (!busId && !user?.isSystemAdmin)
            return [];
        return this.socialAccountsService.findAllByBusiness(busId);
    }
    async getAuthUrl(user, platform) {
        const busId = user?.businessId || user?.business?.id;
        console.log(`[SocialAccountsResolver] getAuthUrl called for platform: ${platform}, user:`, { id: user?.id, businessId: busId, type: user?.isSystemAdmin ? 'Admin' : 'BusinessUser' });
        if (!busId && !user?.isSystemAdmin)
            throw new Error('Unauthorized');
        return this.socialAccountsService.getAuthUrl(busId, platform);
    }
    async connectSocialAccount(user, input) {
        const busId = user?.businessId || user?.business?.id;
        if (!busId && !user?.isSystemAdmin)
            throw new Error('Only business users or admins can connect accounts');
        return this.socialAccountsService.connectAccount(busId, input);
    }
    async disconnectSocialAccount(id) {
        return this.socialAccountsService.disconnect(id);
    }
};
exports.SocialAccountsResolver = SocialAccountsResolver;
__decorate([
    (0, graphql_1.Query)(() => [social_account_entity_1.SocialAccount]),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialAccountsResolver.prototype, "socialAccounts", null);
__decorate([
    (0, graphql_1.Query)(() => String, { name: 'socialAccountAuthUrl' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('platform')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialAccountsResolver.prototype, "getAuthUrl", null);
__decorate([
    (0, graphql_1.Mutation)(() => social_account_entity_1.SocialAccount),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, social_account_inputs_1.ConnectSocialAccountInput]),
    __metadata("design:returntype", Promise)
], SocialAccountsResolver.prototype, "connectSocialAccount", null);
__decorate([
    (0, graphql_1.Mutation)(() => social_account_entity_1.SocialAccount),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialAccountsResolver.prototype, "disconnectSocialAccount", null);
exports.SocialAccountsResolver = SocialAccountsResolver = __decorate([
    (0, graphql_1.Resolver)(() => social_account_entity_1.SocialAccount),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata("design:paramtypes", [social_accounts_service_1.SocialAccountsService])
], SocialAccountsResolver);
//# sourceMappingURL=social-accounts.resolver.js.map