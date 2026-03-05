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
exports.TestimonialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TestimonialsService = class TestimonialsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        return this.prisma.testimonial.create({
            data: {
                ...input,
                status: client_1.TestimonialStatus.PENDING,
            },
        });
    }
    async findAllByBusiness(businessId) {
        return this.prisma.testimonial.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveAndConvertToPost(id, authorId) {
        const testimonial = await this.prisma.testimonial.findUnique({
            where: { id },
        });
        if (!testimonial)
            throw new Error('Testimonial not found');
        const post = await this.prisma.post.create({
            data: {
                content: `✨ Customer Highlight: "${testimonial.content}" - ${testimonial.name} from ${testimonial.area}`,
                businessId: testimonial.businessId,
                authorId: authorId,
                status: client_1.PostStatus.DRAFT,
                targetingRegions: [testimonial.area],
            },
        });
        await this.prisma.testimonial.update({
            where: { id },
            data: { status: client_1.TestimonialStatus.CONVERTED_TO_POST },
        });
        return post;
    }
};
exports.TestimonialsService = TestimonialsService;
exports.TestimonialsService = TestimonialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestimonialsService);
//# sourceMappingURL=testimonials.service.js.map