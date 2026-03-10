const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const accounts = await prisma.socialAccount.findMany({
    where: { platform: 'FACEBOOK' }
  });
  console.log('FB Accounts:');
  accounts.forEach(acc => {
    console.log(`- ID: ${acc.id}, Name: ${acc.accountName}, BizId: ${acc.businessId}, Active: ${acc.isActive}`);
    console.log(`  Token starts with: ${acc.accessToken ? acc.accessToken.substring(0, 20) : 'NULL'}`);
  });
}

check().finally(() => prisma.$disconnect());
