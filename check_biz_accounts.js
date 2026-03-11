const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const accounts = await prisma.socialAccount.findMany({
    where: { businessId: '699f4ae941f0a67bb7b65054' }
  });
  console.log('Accounts for Business 699f4ae941f0a67bb7b65054:');
  accounts.forEach(acc => {
    console.log(`- ID: ${acc.id}, Platform: ${acc.platform}, Name: ${acc.accountName}, Active: ${acc.isActive}`);
  });
}

check().finally(() => prisma.$disconnect());
