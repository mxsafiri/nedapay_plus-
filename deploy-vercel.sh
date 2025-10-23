#!/bin/bash

# ============================================
# NedaPay Plus - Vercel Deployment Script
# ============================================

echo "🚀 NedaPay Plus - Vercel Deployment"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

# Check Node version
echo "🔍 Checking Node.js version..."
node_version=$(node -v)
echo "Node version: $node_version"
echo ""

# Login to Vercel
echo "🔐 Logging into Vercel..."
echo "This will open your browser for authentication."
echo ""
vercel login

echo ""
echo "🎯 Ready to deploy!"
echo ""
echo "Choose deployment type:"
echo "1) Preview Deployment (for testing)"
echo "2) Production Deployment"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying Preview..."
        vercel
        ;;
    2)
        echo ""
        echo "⚠️  WARNING: This will deploy to PRODUCTION!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo ""
            echo "🚀 Deploying to Production..."
            vercel --prod
        else
            echo "❌ Deployment cancelled"
            exit 0
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Next steps:"
echo "1. Check deployment status in your browser"
echo "2. Configure environment variables if needed"
echo "3. Test your live application"
echo ""
echo "📖 See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
