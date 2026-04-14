"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const count = await prisma.testimonial.count({ where: { businessId: '69d7d438f39270ef2676e984' } });
    console.log('Count:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=count_testimonials.js.map