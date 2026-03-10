const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createFacebookAccount() {
  const sandboxToken = 'EAASDR6kEiWcBQ1c9SAMPACssZCUZCWtXp1hwsJq41LnQOlZCqaTBXQYpHDMG32ZBjeTtm6wLV8KBaYcQGB6M3zUBKdDtGSrj0TYaYI5D3Wjkopi4rgNa14Mscm6UrHFQpK4ZCIlLSdtS2Up540ryEinGAZC2fsF5MTb0TXh0fnMFTFJmuGqVrKKfPXDghpuLUNlKxYpRkL';
  
  // Create or update Facebook account for SystemAdmin (businessId: null)
  const account = await prisma.socialAccount.upsert({
    where: {
      id: 'sandbox_facebook_account_id' // Just a dummy ID for upsert or we can find by platform
    },
    update: {
      accessToken: sandboxToken,
      isActive: true,
      businessId: null,
      accountName: 'Sandbox Meta Account'
    },
    create: {
      id: 'sandbox_facebook_account_id',
      platform: 'FACEBOOK',
      accountName: 'Sandbox Meta Account',
      accountId: 'sandbox_user_id_123',
      accessToken: sandboxToken,
      isActive: true,
      businessId: null
    }
  });
  
  console.log('Facebook SocialAccount created/updated for Sandbox testing:', account.id);
}

createFacebookAccount().finally(() => prisma.$disconnect());
