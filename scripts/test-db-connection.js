// Quick database connection test
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    // Test 1: Check if we can connect
    await prisma.$connect();
    console.log('✅ Database connection: SUCCESS');
    
    // Test 2: Count users
    const userCount = await prisma.users.count();
    console.log(`✅ Users in database: ${userCount}`);
    
    // Test 3: Count networks
    const networkCount = await prisma.networks.count();
    console.log(`✅ Networks configured: ${networkCount}`);
    
    // Test 4: Count tokens
    const tokenCount = await prisma.tokens.count();
    console.log(`✅ Tokens configured: ${tokenCount}`);
    
    // Test 5: Count payment orders
    const orderCount = await prisma.payment_orders.count();
    console.log(`✅ Payment orders: ${orderCount}`);
    
    console.log('\n🎉 Database is connected and operational!');
    console.log('\n📊 Database Summary:');
    console.log(`   - Total Users: ${userCount}`);
    console.log(`   - Networks: ${networkCount}`);
    console.log(`   - Tokens: ${tokenCount}`);
    console.log(`   - Orders: ${orderCount}`);
    
  } catch (error) {
    console.error('\n❌ Database connection FAILED!');
    console.error('\nError details:');
    console.error(error.message);
    
    if (error.message.includes('DATABASE_URL')) {
      console.error('\n💡 Fix: Check your .env file for DATABASE_URL');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
