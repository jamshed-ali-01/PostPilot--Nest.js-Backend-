import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkFailedAds() {
    try {
        const failedAds = await prisma.ad.findMany({
            where: {
                metaError: { not: null }
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        console.log("=== FAILED ADS INSPECTION ===");
        if (failedAds.length === 0) {
            console.log("No ads found with metaError in DB.");
        } else {
            failedAds.forEach((ad, i) => {
                console.log(`\n[Ad ${i+1}] ID: ${ad.id}`);
                console.log(`Headline: ${ad.headline}`);
                console.log(`Error: ${ad.metaError}`);
                console.log(`Status: ${ad.status}`);
            });
        }
    } catch (err) {
        console.error("Error fetching failed ads:", err);
    } finally {
        await prisma.$disconnect();
    }
}

checkFailedAds();
