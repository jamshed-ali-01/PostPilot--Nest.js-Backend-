import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany();
    const admins = await prisma.systemAdmin.findMany();

    console.log('--- Users ---');
    users.forEach(u => console.log(`User: ${u.email}`));
    
    console.log('\n--- System Admins ---');
    admins.forEach(a => console.log(`Admin: ${a.email}`));

    // Find duplicates
    const userEmails = users.map(u => u.email.toLowerCase().trim());
    const adminEmails = admins.map(a => a.email.toLowerCase().trim());
    
    const intersection = userEmails.filter(e => adminEmails.includes(e));
    console.log('\n--- Duplicate Emails (Exist in both) ---');
    console.log(intersection);
}

check().catch(console.error).finally(() => prisma.$disconnect());
