import { PrismaClient } from '@prisma/client';
import { AdsService } from '../src/modules/ads/ads.service';
import { AIService } from '../src/modules/posts/ai.service';

const prisma = new PrismaClient();
const aiService = new AIService(); // Fixed: No arguments needed
const adsService = new AdsService(prisma as any, aiService);

async function testCreateAd() {
    const VALID_BIZ_ID = '69d7d438f39270ef2676e984'; // PostPilot
    const business = await prisma.business.findUnique({ where: { id: VALID_BIZ_ID } });

    if (!business) {
        console.error("VALID_BIZ_ID not found in database.");
        return;
    }

    console.log(`Testing ad creation for business: ${business.name} (${business.id})`);

    const input = {
        headline: "Verification Ad Headline",
        primaryText: "Verification Primary Text",
        description: "Verification Description",
        platform: "FACEBOOK",
        businessId: business.id,
        budget: 500,
        mediaUrls: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="] // Valid mini base64
    };

    try {
        console.log("Calling adsService.create...");
        const result = await adsService.create(input as any);
        console.log("Ad Created Successfully in DB:", result.id);
        console.log("Status:", result.status);
        console.log("Meta Error (Expected if not fully configured):", result.metaError);
    } catch (err) {
        console.error("Ad Creation FAILED:", err);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateAd();
