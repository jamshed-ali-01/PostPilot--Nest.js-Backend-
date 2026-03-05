"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialsModule = void 0;
const common_1 = require("@nestjs/common");
const testimonials_service_1 = require("./testimonials.service");
const testimonials_resolver_1 = require("./testimonials.resolver");
let TestimonialsModule = class TestimonialsModule {
};
exports.TestimonialsModule = TestimonialsModule;
exports.TestimonialsModule = TestimonialsModule = __decorate([
    (0, common_1.Module)({
        providers: [testimonials_service_1.TestimonialsService, testimonials_resolver_1.TestimonialsResolver],
        exports: [testimonials_service_1.TestimonialsService],
    })
], TestimonialsModule);
//# sourceMappingURL=testimonials.module.js.map