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
exports.PostsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const posts_service_js_1 = require("./posts.service.js");
const post_entity_js_1 = require("./entities/post.entity.js");
const analytics_entity_js_1 = require("./entities/analytics.entity.js");
const create_post_input_js_1 = require("./dto/create-post.input.js");
const update_post_input_js_1 = require("./dto/update-post.input.js");
const permissions_decorator_js_1 = require("../../common/decorators/permissions.decorator.js");
const common_1 = require("@nestjs/common");
const gql_auth_guard_js_1 = require("../../common/guards/gql-auth.guard.js");
const rbac_guard_js_1 = require("../../common/guards/rbac.guard.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
let PostsResolver = class PostsResolver {
    postsService;
    constructor(postsService) {
        this.postsService = postsService;
    }
    async createPost(input) {
        return this.postsService.create(input);
    }
    async getBusinessPosts(businessId) {
        return this.postsService.findAllByBusiness(businessId);
    }
    async getPendingPosts(businessId) {
        return this.postsService.getPendingPosts(businessId);
    }
    async getPost(id) {
        return this.postsService.findOne(id);
    }
    async generateAIContent(user, prompt, tone, location, imageUrls) {
        return this.postsService.generateAIContent(user.id, prompt, tone, location, imageUrls);
    }
    async submitPostForApproval(id) {
        return this.postsService.submitForApproval(id);
    }
    async approvePost(id, status) {
        return this.postsService.updateStatus(id, status);
    }
    async getBusinessAnalytics(businessId) {
        return this.postsService.getAnalytics(businessId);
    }
    async deletePost(id) {
        return this.postsService.delete(id);
    }
    async updatePost(input) {
        const { id, ...data } = input;
        return this.postsService.update(id, data);
    }
    async getPlatforms(post) {
        if (!post.platformIds || post.platformIds.length === 0)
            return [];
        const accounts = await this.postsService.getPlatformsByAccountIds(post.platformIds);
        return accounts.map(a => a.platform);
    }
    async syncPostMetrics(id) {
        return this.postsService.syncPostMetrics(id);
    }
    async syncBusinessAnalytics(businessId) {
        return this.postsService.syncAllBusinessMetrics(businessId);
    }
    async seedDemoData(businessId) {
        return this.postsService.seedDemoData(businessId);
    }
};
exports.PostsResolver = PostsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => post_entity_js_1.Post),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_input_js_1.CreatePostInput]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "createPost", null);
__decorate([
    (0, graphql_1.Query)(() => [post_entity_js_1.Post], { name: 'businessPosts' }),
    __param(0, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getBusinessPosts", null);
__decorate([
    (0, graphql_1.Query)(() => [post_entity_js_1.Post], { name: 'pendingPosts' }),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getPendingPosts", null);
__decorate([
    (0, graphql_1.Query)(() => post_entity_js_1.Post, { name: 'post', nullable: true }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getPost", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('prompt')),
    __param(2, (0, graphql_1.Args)('tone', { nullable: true })),
    __param(3, (0, graphql_1.Args)('location', { nullable: true })),
    __param(4, (0, graphql_1.Args)('imageUrls', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Array]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "generateAIContent", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_entity_js_1.Post),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "submitPostForApproval", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_entity_js_1.Post),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard, rbac_guard_js_1.RbacGuard),
    (0, permissions_decorator_js_1.Permissions)('PUBLISH_POST'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('status', { type: () => client_1.PostStatus })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "approvePost", null);
__decorate([
    (0, graphql_1.Query)(() => analytics_entity_js_1.BusinessAnalytics, { name: 'businessAnalytics' }),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard, rbac_guard_js_1.RbacGuard),
    __param(0, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getBusinessAnalytics", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_entity_js_1.Post),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "deletePost", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_entity_js_1.Post),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_post_input_js_1.UpdatePostInput]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "updatePost", null);
__decorate([
    (0, graphql_1.ResolveField)('platforms', () => [String]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_entity_js_1.Post]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "getPlatforms", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_entity_js_1.Post),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "syncPostMetrics", null);
__decorate([
    (0, graphql_1.Mutation)(() => analytics_entity_js_1.BusinessAnalytics),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "syncBusinessAnalytics", null);
__decorate([
    (0, graphql_1.Mutation)(() => analytics_entity_js_1.BusinessAnalytics),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsResolver.prototype, "seedDemoData", null);
exports.PostsResolver = PostsResolver = __decorate([
    (0, graphql_1.Resolver)(() => post_entity_js_1.Post),
    __metadata("design:paramtypes", [posts_service_js_1.PostsService])
], PostsResolver);
//# sourceMappingURL=posts.resolver.js.map