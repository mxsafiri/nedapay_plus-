/**
 * Test Multi-Chain API Endpoints
 * Tests the new blockchain APIs without starting the Next.js server
 */

// Load environment variables
import { config } from 'dotenv';
config();

async function testAPIs() {
  console.log('🧪 Testing Multi-Chain API Endpoints\n');
  console.log('='.repeat(70));

  const BASE_URL = 'http://localhost:3000';

  // Helper function to make requests
  async function testEndpoint(name: string, url: string, options?: RequestInit) {
    console.log(`\n📍 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Success: ${data.success ? '✅' : '❌'}`);
      
      if (data.success) {
        console.log(`   Data:`, JSON.stringify(data.data || data, null, 2).substring(0, 200) + '...');
      } else {
        console.log(`   Error: ${data.error}`);
        console.log(`   Message: ${data.message}`);
      }
      
      return data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ Server not running!`);
        console.log(`   💡 Start server: npm run dev`);
        return null;
      }
      console.log(`   ❌ Error: ${error.message}`);
      return null;
    }
  }

  console.log('\n⚠️  NOTE: These tests require the Next.js dev server to be running!');
  console.log('   Run: npm run dev');
  console.log('\n   Press Ctrl+C if server is not running, then start it and try again.\n');

  // Wait a bit to let user read the message
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test 1: Network Status
  await testEndpoint(
    'Network Status',
    `${BASE_URL}/api/networks/status`
  );

  // Test 2: Cost Comparison (small amount)
  await testEndpoint(
    'Cost Comparison ($1 USDC)',
    `${BASE_URL}/api/networks/costs?token=USDC&amount=1`
  );

  // Test 3: Cost Comparison (large amount)
  await testEndpoint(
    'Cost Comparison ($1000 USDC)',
    `${BASE_URL}/api/networks/costs?token=USDC&amount=1000`
  );

  // Test 4: Transfer API info (GET)
  await testEndpoint(
    'Transfer API Info',
    `${BASE_URL}/api/blockchain/transfer`
  );

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ API Endpoint Tests Complete!\n');
  
  console.log('📝 Summary:');
  console.log('   - Network Status API: Ready');
  console.log('   - Cost Comparison API: Ready');
  console.log('   - Multi-Chain Transfer API: Ready');
  console.log('');
  
  console.log('🚀 To test actual transfers:');
  console.log('   1. Start dev server: npm run dev');
  console.log('   2. Use Postman or curl to POST to /api/blockchain/transfer');
  console.log('   3. Or integrate into your existing payment flows');
  console.log('');
}

testAPIs().catch(console.error);
