const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'jamshedlinkedin@gmail.com';
  
  const user = await prisma.user.findUnique({ where: { email } });
  const sysAdmin = await prisma.systemAdmin.findUnique({ where: { email } });
  
  console.log(`[Verification] User ID: ${user.id}`);
  console.log(`[Verification] SysAdmin ID: ${sysAdmin.id}`);
  
  if (user.id === sysAdmin.id) {
    console.log('[Verification] SUCCESS: IDs are harmonized!');
  } else {
    console.log('[Verification] FAILURE: IDs are still different!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
