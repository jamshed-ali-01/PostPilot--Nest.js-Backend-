"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function check() {
    const roles = await prisma.role.findMany({
        include: { permissions: true }
    });
    console.log('Roles with Permissions:');
    roles.forEach(r => {
        console.log(`Role: ${r.name}, Perms Count: ${r.permissions.length}`);
        r.permissions.forEach(p => console.log(`  - ${p.name}`));
    });
}
check().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=check_roles.js.map