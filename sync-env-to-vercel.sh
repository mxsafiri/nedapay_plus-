#!/bin/bash

# ============================================
# Sync .env to Vercel - Interactive Version
# ============================================

echo "🔑 Syncing Environment Variables to Vercel"
echo "==========================================="
echo ""
echo "This will add each variable from your .env file to Vercel."
echo "You'll need to confirm each one."
echo ""
read -p "Press ENTER to continue..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

# List of critical variables
CRITICAL_VARS=(
    "DATABASE_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

# List of important variables
IMPORTANT_VARS=(
    "HEDERA_NETWORK"
    "HEDERA_OPERATOR_ID"
    "HEDERA_OPERATOR_KEY"
    "HEDERA_USDC_TOKEN_ID"
    "ADMIN_ACCESS_PASSWORD"
)

# List of optional variables
OPTIONAL_VARS=(
    "DIRECT_URL"
    "HEDERA_TREASURY_ID"
    "HEDERA_TREASURY_KEY"
    "HEDERA_MIRROR_NODE_URL"
    "RESEND_API_KEY"
)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔴 CRITICAL Variables (Required for app to work)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for var in "${CRITICAL_VARS[@]}"; do
    value=$(grep "^${var}=" .env | cut -d'=' -f2-)
    if [ -n "$value" ]; then
        echo "📝 $var"
        echo "   Value preview: ${value:0:50}..."
        echo ""
        echo "Run this command:"
        echo "vercel env add $var"
        echo ""
        echo "Then paste the value when prompted and select:"
        echo "1. Production"
        echo "2. Preview"
        echo "3. Development"
        echo ""
        read -p "Ready to add $var? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            echo "$value" | pbcopy
            echo "✅ Value copied to clipboard!"
            echo "   Now run: vercel env add $var"
            echo ""
            read -p "Press ENTER when done..."
        else
            echo "⏭️  Skipped $var"
        fi
        echo ""
    else
        echo "⚠️  $var not found in .env"
        echo ""
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟡 IMPORTANT Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for var in "${IMPORTANT_VARS[@]}"; do
    value=$(grep "^${var}=" .env | cut -d'=' -f2-)
    if [ -n "$value" ]; then
        echo "📝 $var"
        echo "   Value preview: ${value:0:50}..."
        echo ""
        read -p "Add this variable? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            echo "$value" | pbcopy
            echo "✅ Value copied to clipboard!"
            echo "   Now run: vercel env add $var"
            echo ""
            read -p "Press ENTER when done..."
        else
            echo "⏭️  Skipped $var"
        fi
        echo ""
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🟢 OPTIONAL Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Add optional variables? (y/n): " add_optional
if [ "$add_optional" = "y" ]; then
    for var in "${OPTIONAL_VARS[@]}"; do
        value=$(grep "^${var}=" .env | cut -d'=' -f2-)
        if [ -n "$value" ]; then
            echo "📝 $var"
            echo "$value" | pbcopy
            echo "✅ Value copied to clipboard!"
            echo "   Run: vercel env add $var"
            read -p "Press ENTER when done..."
            echo ""
        fi
    done
fi

echo ""
echo "✅ Environment variable sync complete!"
echo ""
echo "🚀 Next step: Redeploy with new variables"
echo "   Run: vercel --prod"
echo ""
