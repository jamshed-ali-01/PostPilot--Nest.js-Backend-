"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlansModule = void 0;
const common_1 = require("@nestjs/common");
const subscription_plans_service_1 = require("./subscription-plans.service");
const subscription_plans_resolver_1 = require("./subscription-plans.resolver");
const prisma_module_1 = require("../../prisma/prisma.module");
let SubscriptionPlansModule = class SubscriptionPlansModule {
};
exports.SubscriptionPlansModule = SubscriptionPlansModule;
exports.SubscriptionPlansModule = SubscriptionPlansModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [subscription_plans_resolver_1.SubscriptionPlansResolver, subscription_plans_service_1.SubscriptionPlansService],
        exports: [subscription_plans_service_1.SubscriptionPlansService]
    })
], SubscriptionPlansModule);
//# sourceMappingURL=subscription-plans.module.js.map