import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.testimonial.count({ where: { businessId: '69d7d438f39270ef2676e984' } });
    console.log('Count:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
