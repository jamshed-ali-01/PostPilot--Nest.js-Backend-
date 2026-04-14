"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'jamshedlinkedin@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { business: true, roles: { include: { permissions: true } } }
    });
    const sysAdmin = await prisma.systemAdmin.findUnique({
        where: { email }
    });
    console.log('User Found:', !!user);
    if (user) {
        console.log('Business:', user.business ? user.business.name : 'NONE');
        console.log('Business Active:', user.business?.isActive);
        console.log('Trial Ends At:', user.business?.trialEndsAt);
        console.log('Subscription Active:', user.business?.isSubscriptionActive);
        console.log('Roles:', user.roles.map(r => r.name));
        const perms = new Set();
        user.roles.forEach(r => r.permissions.forEach(p => perms.add(p.name)));
        console.log('Permissions:', Array.from(perms));
    }
    console.log('System Admin Found:', !!sysAdmin);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check_user.js.map