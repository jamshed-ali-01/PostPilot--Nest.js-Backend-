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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_scalars_1 = require("graphql-scalars");
const client_1 = require("@prisma/client");
const user_entity_1 = require("../../users/entities/user.entity");
const business_entity_1 = require("../../businesses/entities/business.entity");
(0, graphql_1.registerEnumType)(client_1.PostStatus, {
    name: 'PostStatus',
});
let Post = class Post {
    id;
    content;
    mediaUrls;
    status;
    scheduledAt;
    publishedAt;
    businessId;
    business;
    authorId;
    author;
    targetingRegions;
    platformIds;
    platforms;
    reach;
    impressions;
    likes;
    comments;
    shares;
    engagement;
    platformErrors;
    createdAt;
    updatedAt;
};
exports.Post = Post;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], Post.prototype, "mediaUrls", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.PostStatus),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Post.prototype, "scheduledAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Post.prototype, "publishedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "businessId", void 0);
__decorate([
    (0, graphql_1.Field)(() => business_entity_1.Business, { nullable: true }),
    __metadata("design:type", business_entity_1.Business)
], Post.prototype, "business", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "authorId", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], Post.prototype, "author", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], Post.prototype, "targetingRegions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { defaultValue: [] }),
    __metadata("design:type", Array)
], Post.prototype, "platformIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { defaultValue: [] }),
    __metadata("design:type", Array)
], Post.prototype, "platforms", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Post.prototype, "reach", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Post.prototype, "impressions", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Post.prototype, "likes", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Post.prototype, "comments", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Post.prototype, "shares", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Post.prototype, "engagement", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_scalars_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], Post.prototype, "platformErrors", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
exports.Post = Post = __decorate([
    (0, graphql_1.ObjectType)()
], Post);
//# sourceMappingURL=post.entity.js.map