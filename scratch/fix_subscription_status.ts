import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
    console.log('--- Fixing Business Subscription Statuses ---');
    const result = await prisma.business.updateMany({
        where: { isActive: true },
        data: { isSubscriptionActive: true }
    });
    console.log(`Updated ${result.count} businesses to active subscription state.`);
}

fix().catch(console.error).finally(() => prisma.$disconnect());
