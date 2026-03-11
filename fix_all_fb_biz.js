const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const bizId = '699f4ae941f0a67bb7b65054'; // Jamshed Plumbing
  const res = await prisma.socialAccount.updateMany({
    where: { platform: 'FACEBOOK' },
    data: { businessId: bizId }
  });
  console.log(`Updated ${res.count} Facebook account(s) to businessId: ${bizId}`);
}

fix().finally(() => prisma.$disconnect());
