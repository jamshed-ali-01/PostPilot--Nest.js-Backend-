"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        include: { business: true }
    });
    console.log('--- USERS AND THEIR BUSINESSES ---');
    users.forEach(u => {
        console.log(`User: ${u.email}, BusinessId: ${u.businessId}, BusinessName: ${u.business?.name || 'NONE'}`);
    });
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=check-user-business.js.map