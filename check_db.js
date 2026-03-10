const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const accounts = await prisma.socialAccount.findMany();
  accounts.forEach(acc => {
    console.log(`- ID: ${acc.id}, Platform: ${acc.platform}, Name: ${acc.accountName}, BusinessId: ${acc.businessId}`);
  });
}

check().finally(() => prisma.$disconnect());
