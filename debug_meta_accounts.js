
const { PrismaClient } = require('@prisma/client');
const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
const User = bizSdk.User;

const prisma = new PrismaClient();

async function debug() {
  const account = await prisma.socialAccount.findFirst({
    where: { accountName: { contains: 'User Account' } }
  });

  if (!account) {
    console.log('No User Account found in DB.');
    process.exit(0);
  }

  console.log(`Using Token for: ${account.accountName}`);
  bizSdk.FacebookAdsApi.init(account.accessToken);
  
  const me = new User('me');
  try {
    const accounts = await me.getAdAccounts(['name', 'account_id', 'currency', 'account_status']);
    console.log('Meta Returned Ad Accounts:');
    accounts.forEach(acc => {
      console.log(`- Name: ${acc.name}, ID: ${acc.id}, Status: ${acc.account_status}`);
    });
  } catch (err) {
    console.error('Error fetching from Meta:', err.message);
  }
  process.exit(0);
}

debug();
