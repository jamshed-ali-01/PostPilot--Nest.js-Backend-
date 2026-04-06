const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetEmail = 'jamshedlinkedin@gmail.com';
  const validBusinessId = '69a9bb6e9f6c27e7392f4c72'; // Kieran Norman
  
  console.log(`[DB Repair] Attempting to update user ${targetEmail} with businessId ${validBusinessId}`);
  
  const user = await prisma.user.update({
    where: { email: targetEmail },
    data: { businessId: validBusinessId }
  });
  
  console.log('[DB Repair] Success! User record updated:', JSON.stringify(user, null, 2));
  
  // Verify the business link
  const biz = await prisma.business.findUnique({ where: { id: user.businessId } });
  console.log('[DB Repair] Verified Business Name:', biz ? biz.name : 'STILL NOT FOUND');
}

main().catch(console.error).finally(() => prisma.$disconnect());
