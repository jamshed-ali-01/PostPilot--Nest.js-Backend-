const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  try {
    const targetAccountId = '699f580691408351de05a1f2';
    const targetBusinessId = '699f4ae941f0a67bb7b65054';
    
    await prisma.socialAccount.update({
      where: { id: targetAccountId },
      data: {
        businessId: targetBusinessId,
        isActive: true,
        accountName: 'Sandbox Meta Ad Account'
      }
    });
    
    console.log('Successfully fixed account linking to businessId:', targetBusinessId);
  } catch (err) {
    console.error('Error fixing account:', err.message);
  }
}

fix().finally(() => prisma.$disconnect());
