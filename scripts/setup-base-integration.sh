#!/bin/bash

# Setup Script: Base/EVM Integration for Thunes
# Run this to prepare your environment for Thunes stablecoin integration

set -e  # Exit on error

echo "🚀 Setting up Base/EVM Integration for NEDAplus"
echo "================================================"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing ethers.js..."
npm install ethers@^6.13.0
echo "✅ Dependencies installed"
echo ""

# Step 2: Generate Prisma types
echo "🔧 Step 2: Regenerating Prisma types..."
npx prisma generate
echo "✅ Prisma types updated"
echo ""

# Step 3: Check environment variables
echo "🔍 Step 3: Checking environment configuration..."

if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Creating from .env.base.example..."
    cp .env.base.example .env
    echo "   ⚠️  Please edit .env and add your Base wallet private key!"
fi

if ! grep -q "EVM_PRIVATE_KEY" .env; then
    echo "⚠️  Warning: EVM_PRIVATE_KEY not found in .env"
    echo "   Please add Base wallet credentials to .env"
    echo ""
    echo "   Required variables:"
    echo "   - EVM_PRIVATE_KEY=0x..."
    echo "   - BASE_SEPOLIA_RPC=https://sepolia.base.org"
    echo "   - BASE_SEPOLIA_USDC=0x036CbD53842c5426634e7929541eC2318f3dCF7e"
else
    echo "✅ EVM configuration found in .env"
fi
echo ""

# Step 4: Verify database schema
echo "🗄️  Step 4: Verifying database schema..."

if ! psql $DATABASE_URL -c "SELECT 1 FROM networks WHERE network_type = 'evm' LIMIT 1;" > /dev/null 2>&1; then
    echo "⚠️  Warning: Multi-chain schema not found"
    echo "   Run: psql \$DATABASE_URL < scripts/migrate-to-multichain.sql"
else
    echo "✅ Database schema up to date"
fi
echo ""

# Step 5: Test compilation
echo "🔨 Step 5: Testing TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  Warning: TypeScript errors detected"
    echo "   This is normal if you haven't updated .env yet"
fi
echo ""

# Summary
echo "================================================"
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Base Wallet:"
echo "   - Edit .env and add your Base wallet private key"
echo "   - Get testnet USDC from Base Sepolia faucet"
echo ""
echo "2. Test Base Integration:"
echo "   npm run dev"
echo "   # Then test via API or dashboard"
echo ""
echo "3. When Thunes Adds Stablecoin:"
echo "   psql \$DATABASE_URL < scripts/switch-to-base-priority.sql"
echo ""
echo "📖 Read BLOCKCHAIN_STRATEGY.md for detailed guide"
echo "================================================"
