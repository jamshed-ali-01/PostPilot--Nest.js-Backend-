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
exports.Invitation = void 0;
const graphql_1 = require("@nestjs/graphql");
const role_entity_js_1 = require("../../roles/entities/role.entity.js");
const business_entity_js_1 = require("../../businesses/entities/business.entity.js");
let Invitation = class Invitation {
    id;
    token;
    email;
    roleId;
    role;
    businessId;
    business;
    expiresAt;
    acceptedAt;
    createdAt;
    updatedAt;
};
exports.Invitation = Invitation;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Invitation.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Invitation.prototype, "token", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Invitation.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Invitation.prototype, "roleId", void 0);
__decorate([
    (0, graphql_1.Field)(() => role_entity_js_1.Role, { nullable: true }),
    __metadata("design:type", role_entity_js_1.Role)
], Invitation.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Invitation.prototype, "businessId", void 0);
__decorate([
    (0, graphql_1.Field)(() => business_entity_js_1.Business, { nullable: true }),
    __metadata("design:type", business_entity_js_1.Business)
], Invitation.prototype, "business", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Invitation.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Invitation.prototype, "acceptedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Invitation.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Invitation.prototype, "updatedAt", void 0);
exports.Invitation = Invitation = __decorate([
    (0, graphql_1.ObjectType)()
], Invitation);
//# sourceMappingURL=invitation.entity.js.map