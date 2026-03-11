const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const b = await prisma.business.findUnique({
    where: { id: '699f4ae941f0a67bb7b65054' }
  });
  console.log('Business 699f4ae941f0a67bb7b65054:', b ? b.name : 'NOT FOUND');
  
  const all = await prisma.business.findMany({ take: 5 });
  console.log('Other businesses:');
  all.forEach(x => console.log(`- ${x.id}: ${x.name}`));
}

check().finally(() => prisma.$disconnect());
