"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Checking for Duplicate Users ---');
    const users = await prisma.user.findMany({
        select: { email: true }
    });
    const emailCounts = users.reduce((acc, user) => {
        acc[user.email] = (acc[user.email] || 0) + 1;
        return acc;
    }, {});
    const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1);
    console.log('Duplicate User Emails:', duplicates);
    console.log('\n--- Checking for Invitations for Existing Users ---');
    const invitations = await prisma.invitation.findMany();
    for (const invite of invitations) {
        const user = await prisma.user.findUnique({ where: { email: invite.email } });
        const admin = await prisma.systemAdmin.findUnique({ where: { email: invite.email } });
        if (user || admin) {
            console.log(`Invite exists for registered email: ${invite.email} (User: ${!!user}, Admin: ${!!admin})`);
        }
    }
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=check-duplicates.js.map