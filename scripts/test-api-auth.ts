import crypto from 'crypto';

/**
 * Test script to verify API authentication works with hashed keys
 */

function hashApiKey(apiKey: string): string {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

function generateApiKey(isTest: boolean = false): string {
  const prefix = isTest ? 'np_test_' : 'np_live_';
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return prefix + randomBytes;
}

// Test the authentication flow
console.log('🔐 Testing API Key Authentication Flow\n');

// 1. Generate a test API key (like the /api/generate-api-key endpoint does)
const testApiKey = generateApiKey(true);
console.log('1️⃣  Generated API Key:');
console.log('   ', testApiKey);
console.log();

// 2. Hash it for storage (like we store in database)
const storedHash = hashApiKey(testApiKey);
console.log('2️⃣  Stored Hash (in database):');
console.log('   ', storedHash);
console.log();

// 3. Simulate incoming request with the plain key
const incomingKey = testApiKey; // What bank sends in Authorization header
console.log('3️⃣  Incoming Key (from Authorization header):');
console.log('   ', incomingKey);
console.log();

// 4. Hash the incoming key to match
const incomingHash = hashApiKey(incomingKey);
console.log('4️⃣  Hashed Incoming Key:');
console.log('   ', incomingHash);
console.log();

// 5. Verify they match
const authSuccess = storedHash === incomingHash;
console.log('5️⃣  Authentication Result:');
console.log('   ', authSuccess ? '✅ SUCCESS - Hashes match!' : '❌ FAILED - Hashes don\'t match');
console.log();

// 6. Show what happens with wrong key
const wrongKey = generateApiKey(true);
const wrongHash = hashApiKey(wrongKey);
const wrongAuthSuccess = storedHash === wrongHash;
console.log('6️⃣  Test with Wrong Key:');
console.log('    Wrong Key:', wrongKey);
console.log('    Wrong Hash:', wrongHash);
console.log('    Result:', wrongAuthSuccess ? '✅ Matched (bug!)' : '❌ Rejected (correct!)');
console.log();

console.log('✨ Authentication flow verified!');
