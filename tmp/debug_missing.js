const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const missingBizId = '699f4ae941f0a67bb7b65054';
  const usersWithMissingBiz = await prisma.user.findMany({
    where: { businessId: missingBizId }
  });
  console.log(`Users linked to missing business ${missingBizId}:`, usersWithMissingBiz.map(u => u.email));
  
  const allBusinesses = await prisma.business.findMany({ select: { id: true, name: true } });
  console.log('Available Businesses:', allBusinesses);
}

main().catch(console.error).finally(() => prisma.$disconnect());
