"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function fix() {
    console.log('--- Fixing Business Subscription Statuses ---');
    const result = await prisma.business.updateMany({
        where: { isActive: true },
        data: { isSubscriptionActive: true }
    });
    console.log(`Updated ${result.count} businesses to active subscription state.`);
}
fix().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=fix_subscription_status.js.map