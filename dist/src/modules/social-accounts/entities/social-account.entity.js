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
exports.SocialAccount = void 0;
const graphql_1 = require("@nestjs/graphql");
const business_entity_1 = require("../../businesses/entities/business.entity");
let SocialAccount = class SocialAccount {
    id;
    platform;
    accountName;
    accountId;
    isActive;
    business;
    businessId;
    createdAt;
    updatedAt;
};
exports.SocialAccount = SocialAccount;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SocialAccount.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SocialAccount.prototype, "platform", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SocialAccount.prototype, "accountName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SocialAccount.prototype, "accountId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], SocialAccount.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => business_entity_1.Business),
    __metadata("design:type", business_entity_1.Business)
], SocialAccount.prototype, "business", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SocialAccount.prototype, "businessId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SocialAccount.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SocialAccount.prototype, "updatedAt", void 0);
exports.SocialAccount = SocialAccount = __decorate([
    (0, graphql_1.ObjectType)()
], SocialAccount);
//# sourceMappingURL=social-account.entity.js.map