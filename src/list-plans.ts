import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.subscriptionPlan.findMany();
  console.log('--- SUBSCRIPTION PLANS ---');
  console.log(JSON.stringify(plans, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
