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
exports.BusinessAnalytics = void 0;
const graphql_1 = require("@nestjs/graphql");
let BusinessAnalytics = class BusinessAnalytics {
    totalReach;
    engagement;
    impressions;
    likes;
    comments;
    shares;
    totalPosts;
    publishedPosts;
    scheduledPosts;
    pendingPosts;
    bestContentInsight;
    suggestedAction;
};
exports.BusinessAnalytics = BusinessAnalytics;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "totalReach", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "engagement", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "impressions", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "likes", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "comments", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "shares", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "totalPosts", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "publishedPosts", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "scheduledPosts", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], BusinessAnalytics.prototype, "pendingPosts", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BusinessAnalytics.prototype, "bestContentInsight", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BusinessAnalytics.prototype, "suggestedAction", void 0);
exports.BusinessAnalytics = BusinessAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], BusinessAnalytics);
//# sourceMappingURL=analytics.entity.js.map