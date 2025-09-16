#!/usr/bin/env node

const crypto = require('crypto');

function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

function generateMultipleKeys(count = 3) {
  console.log('🔑 Generated API Keys:');
  console.log('====================');
  
  for (let i = 1; i <= count; i++) {
    const key = generateApiKey();
    console.log(`Key ${i}: ${key}`);
  }
  
  console.log('\n📝 Usage:');
  console.log('Add these keys to your .env file:');
  console.log('VALID_API_KEYS=key1,key2,key3');
  console.log('\n🔒 Security Notes:');
  console.log('- Store keys securely');
  console.log('- Never commit keys to version control');
  console.log('- Rotate keys regularly');
  console.log('- Use different keys for different environments');
}

// Command line usage
if (require.main === module) {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 3;
  
  if (isNaN(count) || count < 1 || count > 10) {
    console.error('Usage: node generateApiKeys.js [count]');
    console.error('Count must be between 1 and 10');
    process.exit(1);
  }
  
  generateMultipleKeys(count);
}

module.exports = { generateApiKey, generateMultipleKeys };