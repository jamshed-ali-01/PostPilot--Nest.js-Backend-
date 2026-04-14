import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanupSocialAccounts() {
    const VALID_BIZ_ID = '69d7d438f39270ef2676e984'; // PostPilot Business
    const STALE_BIZ_ID = '699f4ae941f0a67bb7b65054';

    console.log(`Re-linking social accounts from ${STALE_BIZ_ID} to ${VALID_BIZ_ID}...`);

    try {
        const result = await prisma.socialAccount.updateMany({
            where: { businessId: STALE_BIZ_ID },
            data: { businessId: VALID_BIZ_ID }
        });

        console.log(`SUCCESS: Updated ${result.count} social accounts.`);
    } catch (err) {
        console.error("FAILED to update social accounts:", err);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupSocialAccounts();
