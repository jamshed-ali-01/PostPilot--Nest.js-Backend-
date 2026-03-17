import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USER TABLE DUPLICATES ---');
    const allUsers = await prisma.user.findMany({ select: { email: true } });
    const userEmails = allUsers.map(u => u.email.toLowerCase());
    const userCounts = userEmails.reduce((acc, email) => {
        acc[email] = (acc[email] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const dupeUsers = Object.entries(userCounts).filter(([_, count]) => count > 1);
    console.log('Duplicate User Emails (case-insensitive):', JSON.stringify(dupeUsers));

    console.log('\n--- INVITATIONS FOR REGISTERED USERS ---');
    const invites = await prisma.invitation.findMany();
    for (const inv of invites) {
        const user = await prisma.user.findUnique({ where: { email: inv.email } });
        const admin = await prisma.systemAdmin.findUnique({ where: { email: inv.email } });
        if (user || admin) {
            console.log(`FOUND_INVITE_FOR_REGISTERED: ${inv.email} (IsUser: ${!!user}, IsAdmin: ${!!admin}, Business: ${inv.businessId})`);
        }
    }

    console.log('\n--- DUPLICATE INVITATIONS (Email + Business) ---');
    const inviteKeys = invites.map(i => `${i.email.toLowerCase()}_${i.businessId}`);
    const inviteCounts = inviteKeys.reduce((acc, key) => {
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const dupeInvites = Object.entries(inviteCounts).filter(([_, count]) => count > 1);
    console.log('Duplicate Invites:', JSON.stringify(dupeInvites));
}

main().catch(console.error).finally(() => prisma.$disconnect());
