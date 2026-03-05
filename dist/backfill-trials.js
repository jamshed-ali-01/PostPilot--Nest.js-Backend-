"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    console.log('Backfilling trial periods for all businesses...');
    const result = await prisma.business.updateMany({
        where: {
            trialEndsAt: null
        },
        data: {
            trialEndsAt: trialEnd,
            isActive: false
        }
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
//# sourceMappingURL=backfill-trials.js.map