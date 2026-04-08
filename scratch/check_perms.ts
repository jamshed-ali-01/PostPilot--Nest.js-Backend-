import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const perms = await prisma.permission.findMany();
    console.log('Available Permissions:');
    perms.forEach(p => console.log(`- ${p.name}`));
}

check().catch(console.error).finally(() => prisma.$disconnect());
