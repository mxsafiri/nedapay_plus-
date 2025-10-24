/**
 * Test Script for NedaPay Sandbox Functionality
 * Tests both API key generation and payment order creation
 */

const BASE_URL = 'https://nedapay-plus.vercel.app';

// Replace with your actual user ID from the database
const USER_ID = 'YOUR_USER_ID_HERE';

async function testApiKeyGeneration(isTest = true) {
  console.log(`\n🔑 Testing ${isTest ? 'TEST' : 'LIVE'} API Key Generation...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/generate-api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_ID}`,
      },
      body: JSON.stringify({
        keyName: `${isTest ? 'Test' : 'Live'} Key ${Date.now()}`,
        isTest: isTest,
        regenerate: true
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error:', data.error);
      return null;
    }

    console.log('✅ API Key Created!');
    console.log('   Key ID:', data.keyId);
    console.log('   Type:', data.type);
    console.log('   API Key:', data.apiKey);
    console.log('   Prefix:', data.apiKey.substring(0, 8) + '...');
    
    return data.apiKey;
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

async function testPaymentOrderCreation(apiKey) {
  console.log('\n💰 Testing Payment Order Creation...');
  console.log('   Using API key:', apiKey.substring(0, 20) + '...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/v1/payment-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        fromCurrency: 'TZS',
        toCurrency: 'CNY',
        amount: 1000000, // 1M TZS
        recipientDetails: {
          accountNumber: '9876543210',
          accountName: 'Test Recipient Corp',
          institution: 'Industrial Bank of China'
        },
        reference: 'TEST-' + Date.now()
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error:', data.error);
      if (data.details) console.error('   Details:', data.details);
      return false;
    }

    console.log('✅ Payment Order Created!');
    console.log('   Order ID:', data.orderId);
    console.log('   Status:', data.status);
    console.log('   Test Mode:', data.testMode);
    console.log('   From Amount:', data.fromAmount, data.fromCurrency);
    console.log('   To Amount:', data.toAmount, data.toCurrency);
    console.log('   Bank Markup:', data.bankMarkup);
    
    if (data.testMode && data.testData) {
      console.log('   🧪 Test Data:');
      console.log('      TX Hash:', data.testData.txHash);
      console.log('      Network:', data.testData.network);
      console.log('      Message:', data.testData.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting NedaPay Sandbox Tests');
  console.log('=' .repeat(50));
  
  // Test 1: Create Test API Key
  const testApiKey = await testApiKeyGeneration(true);
  if (!testApiKey) {
    console.log('\n❌ Test API key generation failed. Stopping tests.');
    return;
  }
  
  // Wait a bit for database to update
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Create Payment Order with Test Key
  const testOrderSuccess = await testPaymentOrderCreation(testApiKey);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary:');
  console.log('   Test API Key: ✅');
  console.log('   Test Payment Order:', testOrderSuccess ? '✅' : '❌');
  
  if (testOrderSuccess) {
    console.log('\n🎉 All tests passed! Sandbox is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check logs above.');
  }
}

// Check if USER_ID is set
if (USER_ID === 'YOUR_USER_ID_HERE') {
  console.log('❌ Error: Please set your USER_ID in the test script first.');
  console.log('   You can find your user ID in the database or from the settings page.');
  console.log('\n   To run: node test-sandbox.js');
} else {
  runTests().catch(console.error);
}
