"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function check() {
    const perms = await prisma.permission.findMany();
    console.log('Available Permissions:');
    perms.forEach(p => console.log(`- ${p.name}`));
}
check().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=check_perms.js.map