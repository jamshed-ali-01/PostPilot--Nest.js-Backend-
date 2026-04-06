const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'jamshedlinkedin@gmail.com' }
  });
  console.log('User Record:', JSON.stringify(user, null, 2));

  if (!user) {
    const admin = await prisma.systemAdmin.findUnique({
       where: { email: 'jamshedlinkedin@gmail.com' }
    });
    console.log('SystemAdmin Record:', JSON.stringify(admin, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
