const bizSdk = require('facebook-nodejs-business-sdk');
const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient();
  const fbAccount = await prisma.socialAccount.findFirst({
    where: { platform: 'FACEBOOK', isActive: true, businessId: '699f4ae941f0a67bb7b65054' }
  });

  if (!fbAccount) {
    console.log("No account found!");
    return;
  }

  console.log("Account found:", fbAccount.accountName);
  console.log("Token length:", fbAccount.accessToken.length);

  try {
    bizSdk.FacebookAdsApi.init(fbAccount.accessToken);
    const User = bizSdk.User;
    const user = new User('me');
    
    console.log("Fetching accounts...");
    const adAccounts = await user.getAdAccounts(['name', 'account_id', 'currency'], { limit: 10 });
    console.log("Found:", adAccounts.length);
  } catch (error) {
    console.error("ERROR TYPE:", typeof error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR STACK:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();
