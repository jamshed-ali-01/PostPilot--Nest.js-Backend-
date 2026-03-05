"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeModule = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const stripe_controller_1 = require("./stripe.controller");
const stripe_resolver_1 = require("./stripe.resolver");
const prisma_module_1 = require("../../prisma/prisma.module");
const common_2 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
let StripeModule = class StripeModule {
};
exports.StripeModule = StripeModule;
exports.StripeModule = StripeModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_2.forwardRef)(() => auth_module_1.AuthModule)],
        providers: [stripe_service_1.StripeService, stripe_resolver_1.StripeResolver],
        controllers: [stripe_controller_1.StripeController],
        exports: [stripe_service_1.StripeService]
    })
], StripeModule);
//# sourceMappingURL=stripe.module.js.map