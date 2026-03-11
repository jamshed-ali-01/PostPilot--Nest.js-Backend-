
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const accounts = await prisma.socialAccount.findMany({
    where: { platform: 'FACEBOOK' }
  });
  console.log('Facebook Accounts in DB:');
  accounts.forEach(a => {
    console.log(`- Name: ${a.accountName}, ID: ${a.accountId}, HasToken: ${!!a.accessToken}, BizId: ${a.businessId}`);
  });
  process.exit(0);
}

check();
