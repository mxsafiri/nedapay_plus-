#!/bin/bash

# ============================================
# Add Environment Variables to Vercel
# ============================================

echo "🔑 Adding Environment Variables to Vercel"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Array of variables to add
VARS=(
    "DATABASE_URL"
    "DIRECT_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "HEDERA_NETWORK"
    "HEDERA_OPERATOR_ID"
    "HEDERA_OPERATOR_KEY"
    "HEDERA_TREASURY_ID"
    "HEDERA_TREASURY_KEY"
    "HEDERA_USDC_TOKEN_ID"
    "HEDERA_MIRROR_NODE_URL"
    "ADMIN_ACCESS_PASSWORD"
    "RESEND_API_KEY"
)

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo "⚠️  Skipping $var_name (not set in .env)"
        return
    fi
    
    echo "📝 Adding: $var_name"
    
    # Use echo to pipe the value to vercel env add
    echo "$var_value" | vercel env add "$var_name" production preview development
    
    if [ $? -eq 0 ]; then
        echo "✅ Added: $var_name"
    else
        echo "❌ Failed: $var_name"
    fi
    echo ""
}

# Add each variable
for var in "${VARS[@]}"; do
    add_env_var "$var"
    sleep 1  # Brief pause between adds
done

echo ""
echo "✅ Environment variables added!"
echo ""
echo "🚀 Next step: Redeploy to apply changes"
echo "   Run: vercel --prod"
echo ""
