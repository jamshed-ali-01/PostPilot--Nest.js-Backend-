
const { PrismaClient } = require('@prisma/client');
const bizSdk = require('facebook-nodejs-business-sdk');
const User = bizSdk.User;
const Business = bizSdk.Business;

const prisma = new PrismaClient();

async function debug() {
  const account = await prisma.socialAccount.findFirst({
    where: { accountName: { contains: 'User Account' } }
  });

  if (!account) {
    console.log('No User Account found in DB.');
    process.exit(0);
  }

  bizSdk.FacebookAdsApi.init(account.accessToken);
  const me = new User('me');
  
  try {
    console.log('--- Fetching Business Portfolios ---');
    const businesses = await me.getBusinesses(['name', 'id']);
    for (const biz of businesses) {
      console.log(`Business: ${biz.name} (ID: ${biz.id})`);
      
      const b = new Business(biz.id);
      const accounts = await b.getAdAccounts(['name', 'account_id']);
      console.log(`  Ad Accounts for ${biz.name}:`);
      accounts.forEach(acc => {
        console.log(`  - ${acc.name} (ID: ${acc.id})`);
      });
    }

    console.log('\n--- Fetching Direct User Ad Accounts ---');
    const adAccounts = await me.getAdAccounts(['name', 'account_id']);
    adAccounts.forEach(acc => {
      console.log(`  - ${acc.name} (ID: ${acc.id})`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

debug();
