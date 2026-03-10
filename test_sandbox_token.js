const bizSdk = require('facebook-nodejs-business-sdk');

const accessToken = 'EAASDR6kEiWcBQ1c9SAMPACssZCUZCWtXp1hwsJq41LnQOlZCqaTBXQYpHDMG32ZBjeTtm6wLV8KBaYcQGB6M3zUBKdDtGSrj0TYaYI5D3Wjkopi4rgNa14Mscm6UrHFQpK4ZCIlLSdtS2Up540ryEinGAZC2fsF5MTb0TXh0fnMFTFJmuGqVrKKfPXDghpuLUNlKxYpRkL';
bizSdk.FacebookAdsApi.init(accessToken);

const AdAccount = bizSdk.AdAccount;
const User = bizSdk.User;
const me = new User('me');

async function test() {
  try {
    console.log('Fetching ad accounts...');
    const adAccounts = await me.getAdAccounts(['name', 'account_id', 'currency'], { limit: 10 });
    console.log('Success! Ad Accounts found:', adAccounts.length);
    adAccounts.forEach(acc => {
      console.log(`- ${acc.name} (${acc.id})`);
    });
  } catch (error) {
    console.error('Error fetching ad accounts:', error.message);
    if (error.response && error.response.body) {
        console.error('Full error:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

test();
