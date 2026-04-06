const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'jamshedlinkedin@gmail.com';
  const targetId = '699f4ae941f0a67bb7b65058'; // The User ID
  const oldSysAdminId = '69a86e7a0fa1ac4988320c75'; 

  console.log(`[Account Merge] Deleting old SystemAdmin record (${oldSysAdminId}) to re-create with harmonized ID...`);
  
  try {
    // MongoDB doesn't allow updating the _id field directly via Prisma easily,
    // so we delete and re-create with the target ID.
    await prisma.systemAdmin.delete({ where: { email } });
    
    const newSysAdmin = await prisma.systemAdmin.create({
      data: {
        id: targetId,
        email,
        password: '$2b$10$ZHwXtQ91cq0CGZtW0aFzQuCI9kpubnZ.wryX5JOST6OBkxfgjRi/e',
        name: 'ali',
      }
    });

    console.log('[Account Merge] Success! SystemAdmin record harmonized with ID:', newSysAdmin.id);
  } catch (err) {
    console.error('[Account Merge] Error:', err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
