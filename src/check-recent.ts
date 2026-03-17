import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('--- RECENT USERS ---');
  console.log(JSON.stringify(users, null, 2));

  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('\n--- RECENT BUSINESSES ---');
  console.log(JSON.stringify(businesses, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
