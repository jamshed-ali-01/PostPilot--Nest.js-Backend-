"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const plans = await prisma.subscriptionPlan.findMany();
    console.log('--- SUBSCRIPTION PLANS ---');
    console.log(JSON.stringify(plans, null, 2));
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=list-plans.js.map