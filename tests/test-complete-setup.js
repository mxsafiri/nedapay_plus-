/**
 * Complete Paycrest + Base Wallet Integration Test
 */

const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

// Configuration
const PAYCREST_API_KEY = process.env.PAYCREST_CLIENT_ID;
const BASE_RPC_URL = process.env.BASE_RPC_URL;
const BASE_TREASURY_ADDRESS = process.env.BASE_TREASURY_ADDRESS;
const BASE_PRIVATE_KEY = process.env.BASE_PRIVATE_KEY;

console.log('🚀 Complete Integration Test\n');
console.log('='.repeat(60));

async function test1_PaycrestAPI() {
  console.log('\n✅ Test 1: Paycrest API');
  try {
    const response = await axios.get(
      'https://api.paycrest.io/v1/rates/USDC/100/NGN?network=base',
      {
        headers: { 'API-Key': PAYCREST_API_KEY }
      }
    );
    console.log(`   ✓ API Working`);
    console.log(`   ✓ Rate: 1 USDC = ${response.data.data} NGN`);
    return true;
  } catch (error) {
    console.log(`   ✗ Failed: ${error.message}`);
    return false;
  }
}

async function test2_BaseRPC() {
  console.log('\n✅ Test 2: Base RPC Connection');
  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const network = await provider.getNetwork();
    console.log(`   ✓ Connected to Chain ID: ${network.chainId}`);
    
    if (network.chainId !== 8453n) {
      console.log('   ⚠️  Warning: Not Base Mainnet (8453)');
    }
    return true;
  } catch (error) {
    console.log(`   ✗ Failed: ${error.message}`);
    return false;
  }
}

async function test3_WalletConnection() {
  console.log('\n✅ Test 3: Wallet & Private Key');
  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const wallet = new ethers.Wallet(BASE_PRIVATE_KEY, provider);
    
    console.log(`   ✓ Wallet Address: ${wallet.address}`);
    
    if (wallet.address.toLowerCase() !== BASE_TREASURY_ADDRESS.toLowerCase()) {
      console.log('   ✗ ERROR: Private key does not match treasury address!');
      return false;
    }
    
    console.log(`   ✓ Private key matches treasury address`);
    return true;
  } catch (error) {
    console.log(`   ✗ Failed: ${error.message}`);
    console.log('   ✗ Check your BASE_PRIVATE_KEY format (should start with 0x)');
    return false;
  }
}

async function test4_ETHBalance() {
  console.log('\n✅ Test 4: ETH Balance (for gas)');
  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const balance = await provider.getBalance(BASE_TREASURY_ADDRESS);
    const ethBalance = ethers.formatEther(balance);
    
    console.log(`   ✓ Balance: ${parseFloat(ethBalance).toFixed(6)} ETH`);
    
    if (parseFloat(ethBalance) < 0.001) {
      console.log('   ⚠️  Low balance! Need at least 0.01 ETH for gas fees');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`   ✗ Failed: ${error.message}`);
    return false;
  }
}

async function test5_USDCBalance() {
  console.log('\n✅ Test 5: USDC Balance');
  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const USDC_ABI = ['function balanceOf(address) view returns (uint256)'];
    
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
    const balance = await usdcContract.balanceOf(BASE_TREASURY_ADDRESS);
    const usdcBalance = ethers.formatUnits(balance, 6);
    
    console.log(`   ✓ Balance: ${parseFloat(usdcBalance).toFixed(2)} USDC`);
    
    if (parseFloat(usdcBalance) === 0) {
      console.log('   ⚠️  No USDC! Bridge at: https://bridge.base.org');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`   ✗ Failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  const results = {
    paycrest: false,
    rpc: false,
    wallet: false,
    eth: false,
    usdc: false
  };
  
  results.paycrest = await test1_PaycrestAPI();
  results.rpc = await test2_BaseRPC();
  results.wallet = await test3_WalletConnection();
  
  if (results.wallet) {
    results.eth = await test4_ETHBalance();
    results.usdc = await test5_USDCBalance();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`Paycrest API:     ${results.paycrest ? '✅' : '❌'}`);
  console.log(`Base RPC:         ${results.rpc ? '✅' : '❌'}`);
  console.log(`Wallet Setup:     ${results.wallet ? '✅' : '❌'}`);
  console.log(`ETH Balance:      ${results.eth ? '✅' : '❌'}`);
  console.log(`USDC Balance:     ${results.usdc ? '✅' : '❌'}`);
  console.log('='.repeat(60));
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! You are PRODUCTION READY!');
    console.log('\n📋 Final Steps:');
    console.log('1. Run database migration on Supabase');
    console.log('2. Restart dev server: npm run dev');
    console.log('3. Test creating an off-ramp order via API\n');
  } else {
    console.log('\n⚠️  Some tests failed. Fix issues above before going live.\n');
  }
}

runAllTests().catch(error => {
  console.error('\n❌ Test crashed:', error.message);
});
