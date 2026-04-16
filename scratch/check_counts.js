const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.count();
  const ads = await prisma.ad.count();
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          posts: true,
          ads: true
        }
      }
    }
  });
  
  console.log('--- GLOBAL COUNTS ---');
  console.log(`Total Posts: ${posts}`);
  console.log(`Total Ads: ${ads}`);
  console.log('--- BUSINESS BREAKDOWN ---');
  businesses.forEach(b => {
    console.log(`Business: ${b.name} (${b.id})`);
    console.log(`  Posts: ${b._count.posts}`);
    console.log(`  Ads: ${b._count.ads}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
