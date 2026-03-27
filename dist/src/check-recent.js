"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('--- RECENT USERS ---');
    console.log(JSON.stringify(users, null, 2));
    const businesses = await prisma.business.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('\n--- RECENT BUSINESSES ---');
    console.log(JSON.stringify(businesses, null, 2));
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=check-recent.js.map