const axios = require('axios');
require('dotenv').config();

const orderId = '7a0f32a1-2969-4446-9f91-d71e38978881';
const apiKey = process.env.PAYCREST_CLIENT_ID;

console.log('🔍 Checking Order Status...\n');

async function checkStatus() {
  try {
    const response = await axios.get(
      `https://api.paycrest.io/v1/sender/orders/${orderId}`,
      {
        headers: { 'API-Key': apiKey }
      }
    );
    
    const order = response.data.data;
    
    console.log('Order Status:');
    console.log(`   ID: ${order.id}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Amount: ${order.amount} ${order.token}`);
    console.log(`   Created: ${new Date(order.createdAt).toLocaleString()}`);
    
    if (order.completedAt) {
      console.log(`   Completed: ${new Date(order.completedAt).toLocaleString()}`);
    }
    
    console.log('\nStatus Meanings:');
    console.log('   initiated → Waiting for USDC confirmation');
    console.log('   processing → USDC received, paying out fiat');
    console.log('   completed → Fiat delivered to bank account ✅');
    console.log('   failed → Something went wrong ❌');
    
  } catch (error) {
    console.log('Error:', error.response?.data?.message || error.message);
  }
}

checkStatus();
