const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const accounts = await prisma.socialAccount.findMany();
  accounts.forEach(acc => {
    console.log(`[${acc.platform}] Name: "${acc.accountName}", Biz: ${acc.businessId}, Active: ${acc.isActive}, Token: ${acc.accessToken ? acc.accessToken.substring(0, 10) + '...' : 'none'}`);
  });
}

check().finally(() => prisma.$disconnect());
