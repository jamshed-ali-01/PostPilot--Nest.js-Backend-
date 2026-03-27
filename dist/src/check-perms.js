"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const bizId = '699f4ae941f0a67bb7b65054';
    console.log('--- ROLES & PERMISSIONS ---');
    const roles = await prisma.role.findMany({
        where: {
            OR: [
                { businessId: bizId },
                { businessId: null }
            ]
        },
        include: { permissions: true }
    });
    for (const role of roles) {
        console.log(`Role: ${role.name} (ID: ${role.id}, bizId: ${role.businessId})`);
        console.log(`Permissions: ${role.permissions.map(p => p.name).join(', ')}`);
    }
    console.log('\n--- USERS IN BUSINESS ---');
    const users = await prisma.user.findMany({
        where: { businessId: bizId },
        include: { roles: { include: { permissions: true } } }
    });
    for (const u of users) {
        console.log(`User: ${u.email} (ID: ${u.id})`);
        console.log(`Roles: ${u.roles.map(r => r.name).join(', ')}`);
        const allPerms = new Set();
        u.roles.forEach(r => r.permissions.forEach(p => allPerms.add(p.name)));
        console.log(`Total Permissions: ${Array.from(allPerms).join(', ')}`);
    }
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=check-perms.js.map