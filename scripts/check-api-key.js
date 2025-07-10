#!/usr/bin/env node

// Simple script to check if your Crossmint API key is the correct type

const fs = require('fs');
const path = require('path');

// Load .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
let apiKey = process.env.EXPO_PUBLIC_CROSSMINT_API_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/EXPO_PUBLIC_CROSSMINT_API_KEY=(.+)/);
  if (match) {
    apiKey = match[1].trim();
  }
}

console.log('\n🔍 Checking Crossmint API Key...\n');

if (!apiKey) {
  console.error('❌ No API key found!');
  console.log('   Make sure EXPO_PUBLIC_CROSSMINT_API_KEY is set in your .env.local file\n');
  process.exit(1);
}

if (apiKey.startsWith('sk_')) {
  console.error('❌ Wrong API key type!');
  console.log('   You have: SERVER key (starts with sk_)');
  console.log('   You need: CLIENT key (starts with ck_)');
  console.log('\n📝 How to fix:');
  console.log('   1. Go to https://console.crossmint.com');
  console.log('   2. Navigate to API Keys section');
  console.log('   3. Create or copy a CLIENT API key (ck_production_xxx or ck_staging_xxx)');
  console.log('   4. Update your .env.local file with the client key\n');
  process.exit(1);
}

if (apiKey.startsWith('ck_')) {
  console.log('✅ Correct API key type! (CLIENT key)');
  console.log(`   Key: ${apiKey.substring(0, 20)}...`);
  
  if (apiKey.includes('staging')) {
    console.log('   Environment: STAGING');
  } else if (apiKey.includes('production')) {
    console.log('   Environment: PRODUCTION');
  }
  
  console.log('\n✨ Your API key is configured correctly for React Native!\n');
  process.exit(0);
}

console.warn('⚠️  Unusual API key format');
console.log(`   Key: ${apiKey.substring(0, 20)}...`);
console.log('   Expected format: ck_production_xxx or ck_staging_xxx\n');
process.exit(1); 