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
exports.Business = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("../../users/entities/user.entity");
const subscription_plan_entity_1 = require("../../subscription-plans/entities/subscription-plan.entity");
let Business = class Business {
    id;
    name;
    logo;
    theme;
    isActive;
    isSubscriptionActive;
    subscriptionPlan;
    subscriptionPlanId;
    users;
    stripeCustomerId;
    stripeSubscriptionId;
    stripePriceId;
    trialEndsAt;
};
exports.Business = Business;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Business.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Business.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "logo", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Business.prototype, "theme", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], Business.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], Business.prototype, "isSubscriptionActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => subscription_plan_entity_1.SubscriptionPlan, { nullable: true }),
    __metadata("design:type", subscription_plan_entity_1.SubscriptionPlan)
], Business.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "subscriptionPlanId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [user_entity_1.User]),
    __metadata("design:type", Array)
], Business.prototype, "users", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "stripeCustomerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "stripeSubscriptionId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Business.prototype, "stripePriceId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Business.prototype, "trialEndsAt", void 0);
exports.Business = Business = __decorate([
    (0, graphql_1.ObjectType)()
], Business);
//# sourceMappingURL=business.entity.js.map