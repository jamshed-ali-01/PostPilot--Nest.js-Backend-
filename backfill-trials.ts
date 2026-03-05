import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    console.log('Backfilling trial periods for all businesses...');

    const result = await (prisma.business as any).updateMany({
        where: {
            trialEndsAt: null
        } as any,
        data: {
            trialEndsAt: trialEnd,
            isActive: false
        } as any
    });

    console.log(`Updated ${result.count} businesses.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
