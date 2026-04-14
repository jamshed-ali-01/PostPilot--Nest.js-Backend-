"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkAllAds() {
    try {
        const ads = await prisma.ad.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' }
        });
        console.log("=== ALL ADS INSPECTION ===");
        if (ads.length === 0) {
            console.log("No ads found in DB.");
        }
        else {
            ads.forEach((ad, i) => {
                console.log(`\n[Ad ${i + 1}] ID: ${ad.id}`);
                console.log(`Headline: ${ad.headline}`);
                console.log(`Status: ${ad.status}`);
                console.log(`Meta ID: ${ad.metaAdId}`);
                console.log(`Meta Error: ${ad.metaError}`);
            });
        }
    }
    catch (err) {
        console.error("Error fetching ads:", err);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkAllAds();
//# sourceMappingURL=check_all_ads.js.map