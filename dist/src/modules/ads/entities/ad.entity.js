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
exports.Ad = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
(0, graphql_1.registerEnumType)(client_1.AdStatus, {
    name: 'AdStatus',
});
let Ad = class Ad {
    id;
    headline;
    primaryText;
    description;
    mediaUrls;
    platform;
    status;
    businessId;
    adAccountId;
    pageId;
    campaignId;
    adSetId;
    metaAdId;
    budget;
    postcode;
    startDate;
    endDate;
    metaError;
    createdAt;
    updatedAt;
};
exports.Ad = Ad;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Ad.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Ad.prototype, "headline", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Ad.prototype, "primaryText", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Ad.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], Ad.prototype, "mediaUrls", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Ad.prototype, "platform", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.AdStatus),
    __metadata("design:type", String)
], Ad.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Ad.prototype, "businessId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Ad.prototype, "adAccountId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Ad.prototype, "pageId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Ad.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Ad.prototype, "adSetId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Ad.prototype, "metaAdId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], Ad.prototype, "budget", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Ad.prototype, "postcode", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Ad.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Ad.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Ad.prototype, "metaError", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Ad.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Ad.prototype, "updatedAt", void 0);
exports.Ad = Ad = __decorate([
    (0, graphql_1.ObjectType)()
], Ad);
//# sourceMappingURL=ad.entity.js.map