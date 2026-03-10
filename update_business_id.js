const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBusinessId() {
  const targetBusinessId = '699f4ae941f0a67bb7b65054';
  const sandboxToken = 'EAASDR6kEiWcBQ1c9SAMPACssZCUZCWtXp1hwsJq41LnQOlZCqaTBXQYpHDMG32ZBjeTtm6wLV8KBaYcQGB6M3zUBKdDtGSrj0TYaYI5D3Wjkopi4rgNa14Mscm6UrHFQpK4ZCIlLSdtS2Up540ryEinGAZC2fsF5MTb0TXh0fnMFTFJmuGqVrKKfPXDghpuLUNlKxYpRkL';

  const result = await prisma.socialAccount.updateMany({
    where: {
      platform: 'FACEBOOK',
      accessToken: sandboxToken
    },
    data: {
      businessId: targetBusinessId,
      isActive: true
    }
  });

  console.log(`Updated ${result.count} accounts with businessId: ${targetBusinessId}`);
}

updateBusinessId().finally(() => prisma.$disconnect());
