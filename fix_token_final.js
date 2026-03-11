const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const sandboxToken = 'EAASDR6kEiWcBQ1c9SAMPACssZCUZCWtXp1hwsJq41LnQOlZCqaTBXQYpHDMG32ZBjeTtm6wLV8KBaYcQGB6M3zUBKdDtGSrj0TYaYI5D3Wjkopi4rgNa14Mscm6UrHFQpK4ZCIlLSdtS2Up540ryEinGAZC2fsF5MTb0TXh0fnMFTFJmuGqVrKKfPXDghpuLUNlKxYpRkL';
  const businessId = '699f4ae941f0a67bb7b65054';

  const result = await prisma.socialAccount.updateMany({
    where: { 
      platform: 'FACEBOOK', 
      businessId: businessId 
    },
    data: {
      accessToken: sandboxToken,
      isActive: true,
      accountName: 'Sandbox Meta Ad Account'
    }
  });

  if (result.count === 0) {
    // If no account exists for this businessId, create one
    await prisma.socialAccount.create({
      data: {
        platform: 'FACEBOOK',
        businessId: businessId,
        accessToken: sandboxToken,
        isActive: true,
        accountName: 'Sandbox Meta Ad Account',
        accountId: 'sandbox_user_123'
      }
    });
    console.log('Created new Facebook account for businessId:', businessId);
  } else {
    console.log('Updated', result.count, 'Facebook account(s) for businessId:', businessId);
  }
}

fix().finally(() => prisma.$disconnect());
