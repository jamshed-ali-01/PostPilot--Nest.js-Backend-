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
exports.TestimonialsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const testimonials_service_js_1 = require("./testimonials.service.js");
const testimonial_entity_js_1 = require("./entities/testimonial.entity.js");
const create_testimonial_input_js_1 = require("./dto/create-testimonial.input.js");
const common_1 = require("@nestjs/common");
const gql_auth_guard_js_1 = require("../../common/guards/gql-auth.guard.js");
const rbac_guard_js_1 = require("../../common/guards/rbac.guard.js");
const permissions_decorator_js_1 = require("../../common/decorators/permissions.decorator.js");
const post_entity_js_1 = require("../posts/entities/post.entity.js");
const current_user_decorator_js_1 = require("../../common/decorators/current-user.decorator.js");
let TestimonialsResolver = class TestimonialsResolver {
    testimonialsService;
    constructor(testimonialsService) {
        this.testimonialsService = testimonialsService;
    }
    async submitTestimonial(input) {
        return this.testimonialsService.create(input);
    }
    async findAll(businessId) {
        return this.testimonialsService.findAllByBusiness(businessId);
    }
    async approveTestimonial(id, user) {
        return this.testimonialsService.approveAndConvertToPost(id, user.id);
    }
};
exports.TestimonialsResolver = TestimonialsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => testimonial_entity_js_1.Testimonial),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_testimonial_input_js_1.CreateTestimonialInput]),
    __metadata("design:returntype", Promise)
], TestimonialsResolver.prototype, "submitTestimonial", null);
__decorate([
    (0, graphql_1.Query)(() => [testimonial_entity_js_1.Testimonial], { name: 'businessTestimonials' }),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard, rbac_guard_js_1.RbacGuard),
    (0, permissions_decorator_js_1.Permissions)('VIEW_ANALYTICS'),
    __param(0, (0, graphql_1.Args)('businessId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestimonialsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_entity_js_1.Post),
    (0, common_1.UseGuards)(gql_auth_guard_js_1.GqlAuthGuard, rbac_guard_js_1.RbacGuard),
    (0, permissions_decorator_js_1.Permissions)('CREATE_POST'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestimonialsResolver.prototype, "approveTestimonial", null);
exports.TestimonialsResolver = TestimonialsResolver = __decorate([
    (0, graphql_1.Resolver)(() => testimonial_entity_js_1.Testimonial),
    __metadata("design:paramtypes", [testimonials_service_js_1.TestimonialsService])
], TestimonialsResolver);
//# sourceMappingURL=testimonials.resolver.js.map