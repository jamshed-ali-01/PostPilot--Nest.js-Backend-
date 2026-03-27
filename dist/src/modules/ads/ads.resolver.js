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
exports.AdsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const ads_service_1 = require("./ads.service");
const ad_entity_1 = require("./entities/ad.entity");
const create_ad_input_1 = require("./dto/create-ad.input");
const update_ad_input_1 = require("./dto/update-ad.input");
const ad_ai_result_entity_1 = require("./entities/ad-ai-result.entity");
const fb_metadata_entity_1 = require("./entities/fb-metadata.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../common/guards/gql-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdsResolver = class AdsResolver {
    adsService;
    constructor(adsService) {
        this.adsService = adsService;
    }
    async createAd(input) {
        return this.adsService.create(input);
    }
    async getBusinessAds(businessId) {
        return this.adsService.findAllByBusiness(businessId);
    }
    async getFacebookAdAccounts(user, businessId) {
        const idToSearch = businessId === 'admin' ? null : businessId;
        return this.adsService.getFacebookAdAccounts(idToSearch);
    }
    async getFacebookPages(user, businessId) {
        const idToSearch = businessId === 'admin' ? null : businessId;
        return this.adsService.getFacebookPages(idToSearch);
    }
    async generateAIAd(user, prompt, platform) {
        return this.adsService.generateAIAd(user.id, prompt, platform);
    }
    async updateAd(input) {
        return this.adsService.update(input);
    }
    async deleteAd(id) {
        return this.adsService.delete(id);
    }
};
exports.AdsResolver = AdsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => ad_entity_1.Ad),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ad_input_1.CreateAdInput]),
    __metadata("design:returntype", Promise)
], AdsResolver.prototype, "createAd", null);
__decorate([
    (0, graphql_1.Query)(() => [ad_entity_1.Ad], { name: 'businessAds' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdsResolver.prototype, "getBusinessAds", null);
__decorate([
    (0, graphql_1.Query)(() => [fb_metadata_entity_1.FbAdAccount], { name: 'facebookAdAccounts' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdsResolver.prototype, "getFacebookAdAccounts", null);
__decorate([
    (0, graphql_1.Query)(() => [fb_metadata_entity_1.FbPage], { name: 'facebookPages' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdsResolver.prototype, "getFacebookPages", null);
__decorate([
    (0, graphql_1.Mutation)(() => ad_ai_result_entity_1.AIAdResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('prompt')),
    __param(2, (0, graphql_1.Args)('platform', { defaultValue: 'FACEBOOK' })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdsResolver.prototype, "generateAIAd", null);
__decorate([
    (0, graphql_1.Mutation)(() => ad_entity_1.Ad),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_ad_input_1.UpdateAdInput]),
    __metadata("design:returntype", Promise)
], AdsResolver.prototype, "updateAd", null);
__decorate([
    (0, graphql_1.Mutation)(() => ad_entity_1.Ad),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdsResolver.prototype, "deleteAd", null);
exports.AdsResolver = AdsResolver = __decorate([
    (0, graphql_1.Resolver)(() => ad_entity_1.Ad),
    __metadata("design:paramtypes", [ads_service_1.AdsService])
], AdsResolver);
//# sourceMappingURL=ads.resolver.js.map