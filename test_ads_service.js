const { PrismaClient } = require('@prisma/client');
const { AdsService } = require('./src/modules/ads/ads.service');

// Mocking dependencies to test AdsService directly
const prisma = new PrismaClient();
const adsService = new AdsService(prisma, null); // AI service is null for this test

async function test() {
  console.log('--- Testing AdsService.getFacebookAdAccounts ---');
  
  // Test for SystemAdmin (businessId: null)
  const accounts = await adsService.getFacebookAdAccounts(null);
  
  console.log('Resulting accounts:', JSON.stringify(accounts, null, 2));
}

test().finally(() => prisma.$disconnect());
