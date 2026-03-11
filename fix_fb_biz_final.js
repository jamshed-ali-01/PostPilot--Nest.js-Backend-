
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEST_BIZ_ID = '699f4ae941f0a67bb7b65054';

async function fix() {
  const result = await prisma.socialAccount.updateMany({
    where: { platform: 'FACEBOOK' },
    data: { businessId: TEST_BIZ_ID }
  });
  console.log(`Updated ${result.count} Facebook accounts to Business ID: ${TEST_BIZ_ID}`);
  process.exit(0);
}

fix();
