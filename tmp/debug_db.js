const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({ take: 5 });
  console.log('Sample Businesses:', JSON.stringify(businesses, null, 2));
  
  const targetId = '699f4ae941f0a67bb7b65054';
  const targetBiz = await prisma.business.findUnique({ where: { id: targetId } });
  console.log(`Searching for ID ${targetId}:`, targetBiz ? 'FOUND' : 'NOT FOUND');
  
  if (!targetBiz) {
    const allIds = (await prisma.business.findMany({ select: { id: true } })).map(b => b.id);
    console.log('Available Business IDs:', allIds);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
