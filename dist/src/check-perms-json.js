"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const roles = await prisma.role.findMany({
        include: { permissions: true }
    });
    console.log('JSON_START');
    console.log(JSON.stringify(roles, null, 2));
    console.log('JSON_END');
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=check-perms-json.js.map