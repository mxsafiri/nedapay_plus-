#!/bin/bash

# NedaPay Node.js 22 Upgrade Script
echo "🚀 NedaPay Node.js 22 Upgrade Script"
echo "===================================="

# Check if nvm is installed
if command -v nvm &> /dev/null; then
    echo "✅ nvm is installed"
    
    # Install and use Node.js 22
    echo "📦 Installing Node.js 22..."
    nvm install 22
    nvm use 22
    nvm alias default 22
    
    echo "✅ Node.js 22 installed and set as default"
else
    echo "❌ nvm not found. Please install nvm first:"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   Then restart your terminal and run this script again."
    exit 1
fi

# Verify installation
echo ""
echo "🔍 Verifying installation..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check if versions meet requirements
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 22 ]; then
    echo "✅ Node.js version meets requirements (22+)"
else
    echo "❌ Node.js version is too old. Please install Node.js 22 or later."
    exit 1
fi

# Clean install dependencies
echo ""
echo "🧹 Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

echo ""
echo "🎉 Upgrade complete! You're now running Node.js 22"
echo "   You can now run: npm run dev"
