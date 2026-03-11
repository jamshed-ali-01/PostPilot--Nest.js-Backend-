const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const acc = await prisma.socialAccount.findFirst({
    where: { platform: 'FACEBOOK', isActive: true, businessId: '699f4ae941f0a67bb7b65054' }
  });
  if (acc) {
    console.log('Token Length:', acc.accessToken?.length);
    console.log('Token Value:', acc.accessToken);
  } else {
    console.log('Account not found');
  }
}

check().finally(() => prisma.$disconnect());
