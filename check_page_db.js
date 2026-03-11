const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const acc = await prisma.socialAccount.findFirst({
    where: { accountId: '1030895783438343' }
  });
  if (acc) {
    console.log('Found Account in DB:');
    console.log(`- ID: ${acc.id}`);
    console.log(`- Name: ${acc.accountName}`);
    console.log(`- Platform: ${acc.platform}`);
    console.log(`- BusinessID: ${acc.businessId}`);
  } else {
    console.log('Account 1030895783438343 NOT found in DB.');
  }
}

check().finally(() => prisma.$disconnect());
