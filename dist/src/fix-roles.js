"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'jamshedlinkedin@gmail.com';
    const bizId = '699f4ae941f0a67bb7b65054';
    const ownerRole = await prisma.role.findFirst({
        where: { name: 'Business Owner' }
    });
    if (!ownerRole) {
        console.error('Business Owner role not found!');
        return;
    }
    const user = await prisma.user.findUnique({
        where: { email },
        include: { roles: true }
    });
    if (user) {
        console.log(`Fixing roles for ${email}...`);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                roles: {
                    set: [{ id: ownerRole.id }]
                }
            }
        });
        console.log('Roles fixed to only Business Owner.');
    }
    console.log('\n--- ALL ROLES ---');
    const allRoles = await prisma.role.findMany({
        include: { permissions: true }
    });
    for (const r of allRoles) {
        console.log(`Role: ${r.name} (${r.id})`);
        console.log(`Permissions: ${r.permissions.map(p => p.name).join(', ')}`);
    }
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=fix-roles.js.map