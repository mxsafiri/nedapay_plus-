/**
 * NedaPay Plus API - Test Script
 * Test your API integration for stablecoin off-ramp
 */

const axios = require('axios');

// Configuration
const API_KEY = process.env.NEDAPAY_API_KEY || 'your_api_key_here';
const BASE_URL = process.env.NEDAPAY_API_URL || 'http://localhost:3000';

const nedapay = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Test 1: Create Off-Ramp Order
async function testCreateOrder() {
  console.log('📤 Test 1: Creating off-ramp order...\n');
  
  try {
    const response = await nedapay.post('/api/v1/payment-orders', {
      amount: 10,
      token: 'USDC',
      toCurrency: 'NGN',
      recipientDetails: {
        bankCode: 'GTB',
        accountNumber: '0123456789',
        accountName: 'Test User',
        memo: 'Test payment from NedaPay API'
      },
      reference: `TEST-${Date.now()}`,
      webhookUrl: 'https://webhook.site/your-webhook-id' // Optional: Use webhook.site for testing
    });

    console.log('✅ Order created successfully!\n');
    console.log('Order Details:');
    console.log('- Order ID:', response.data.orderId);
    console.log('- Status:', response.data.status);
    console.log('- From Amount:', response.data.fromAmount, response.data.fromCurrency);
    console.log('- To Amount:', response.data.toAmount, response.data.toCurrency);
    console.log('- Exchange Rate:', response.data.exchangeRate);
    console.log('- Transaction Hash:', response.data.blockchain?.transactionHash);
    console.log('- Network:', response.data.blockchain?.network);
    console.log('- Estimated Completion:', response.data.estimatedCompletion);
    console.log('\nFees Breakdown:');
    console.log('- Sender Markup:', `$${response.data.fees.senderMarkup}`);
    console.log('- Platform Fee:', `$${response.data.fees.platformFee}`);
    console.log('- Paycrest Fee:', `$${response.data.fees.paycrestSenderFee}`);
    console.log('- Network Fee:', `$${response.data.fees.networkFee}`);
    console.log('- Total Fees:', `$${response.data.fees.totalFees}`);
    
    return response.data.orderId;
  } catch (error) {
    console.error('❌ Error creating order:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.error);
    console.error('Details:', error.response?.data?.details);
    throw error;
  }
}

// Test 2: Get Order Status
async function testGetOrderStatus(orderId) {
  console.log('\n📊 Test 2: Getting order status...\n');
  
  try {
    const response = await nedapay.get(`/api/v1/payment-orders/${orderId}`);
    
    console.log('✅ Order status retrieved!\n');
    console.log('Order Details:');
    console.log('- Order ID:', response.data.order.orderId);
    console.log('- Status:', response.data.order.status);
    console.log('- Created At:', response.data.order.createdAt);
    if (response.data.order.completedAt) {
      console.log('- Completed At:', response.data.order.completedAt);
    }
    
    return response.data.order;
  } catch (error) {
    console.error('❌ Error getting order status:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.error);
    throw error;
  }
}

// Test 3: List Orders
async function testListOrders() {
  console.log('\n📋 Test 3: Listing orders...\n');
  
  try {
    const response = await nedapay.get('/api/v1/payment-orders', {
      params: {
        limit: 5,
        status: 'completed'
      }
    });
    
    console.log('✅ Orders retrieved!\n');
    console.log(`Found ${response.data.orders.length} orders:`);
    response.data.orders.forEach((order, index) => {
      console.log(`\n${index + 1}. ${order.orderId}`);
      console.log('   Status:', order.status);
      console.log('   Amount:', order.toAmount, order.toCurrency);
      console.log('   Created:', new Date(order.createdAt).toLocaleString());
    });
    
    console.log('\nPagination:');
    console.log('- Total:', response.data.pagination.total);
    console.log('- Limit:', response.data.pagination.limit);
    console.log('- Has More:', response.data.pagination.hasMore);
    
    return response.data.orders;
  } catch (error) {
    console.error('❌ Error listing orders:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.error);
    throw error;
  }
}

// Test 4: Test Invalid Request
async function testInvalidRequest() {
  console.log('\n🧪 Test 4: Testing error handling...\n');
  
  try {
    await nedapay.post('/api/v1/payment-orders', {
      amount: 10,
      token: 'USDC',
      toCurrency: 'INVALID', // Invalid currency
      recipientDetails: {
        bankCode: 'GTB',
        accountNumber: '0123456789',
        accountName: 'Test User'
      }
    });
  } catch (error) {
    console.log('✅ Error handling works correctly!\n');
    console.log('Expected error received:');
    console.log('- Status:', error.response?.status);
    console.log('- Error:', error.response?.data?.error);
    console.log('- Supported Currencies:', error.response?.data?.supportedCurrencies?.join(', '));
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 NedaPay Plus API Tests\n');
  console.log('='.repeat(50));
  console.log(`API URL: ${BASE_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
  console.log('='.repeat(50) + '\n');

  try {
    // Test 1: Create order
    const orderId = await testCreateOrder();
    
    // Wait a bit for order to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Get order status
    await testGetOrderStatus(orderId);
    
    // Test 3: List orders
    await testListOrders();
    
    // Test 4: Test error handling
    await testInvalidRequest();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ Tests failed!');
    console.log('='.repeat(50));
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testCreateOrder, testGetOrderStatus, testListOrders };
