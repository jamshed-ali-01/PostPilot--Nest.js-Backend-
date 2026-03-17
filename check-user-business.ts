import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { business: true }
    });
    
    console.log('--- USERS AND THEIR BUSINESSES ---');
    users.forEach(u => {
        console.log(`User: ${u.email}, BusinessId: ${u.businessId}, BusinessName: ${u.business?.name || 'NONE'}`);
    });
}

main().finally(() => prisma.$disconnect());
