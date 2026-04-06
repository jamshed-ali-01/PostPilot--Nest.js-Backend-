const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'jamshedlinkedin@gmail.com';
  console.log(`Checking accounts for: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true }
  });
  
  const sysAdmin = await prisma.systemAdmin.findUnique({
    where: { email }
  });
  
  console.log('User Record:', JSON.stringify(user, null, 2));
  console.log('SystemAdmin Record:', JSON.stringify(sysAdmin, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
