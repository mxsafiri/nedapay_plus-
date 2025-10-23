#!/bin/bash

# Quick script to show values and commands for adding env vars to Vercel

echo "🔑 Environment Variables - Copy & Paste Guide"
echo "=============================================="
echo ""
echo "For each variable below:"
echo "1. Run the 'vercel env add' command"
echo "2. Paste the VALUE when prompted"
echo "3. Select: Production, Preview, Development (all 3)"
echo "4. Press Enter"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load .env
source .env 2>/dev/null

# Function to display variable
show_var() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -n "$var_value" ]; then
        echo "📝 Variable: $var_name"
        echo ""
        echo "   COMMAND:"
        echo "   vercel env add $var_name"
        echo ""
        echo "   VALUE TO PASTE:"
        echo "   $var_value"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
    fi
}

# Critical variables
echo "🔴 CRITICAL (App won't work without these):"
echo ""
show_var "DATABASE_URL"
show_var "NEXT_PUBLIC_SUPABASE_URL"
show_var "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
show_var "SUPABASE_SERVICE_ROLE_KEY"

echo "🟡 IMPORTANT (For full functionality):"
echo ""
show_var "HEDERA_NETWORK"
show_var "HEDERA_OPERATOR_ID"
show_var "HEDERA_OPERATOR_KEY"
show_var "HEDERA_USDC_TOKEN_ID"
show_var "ADMIN_ACCESS_PASSWORD"

echo "🟢 OPTIONAL (Nice to have):"
echo ""
show_var "DIRECT_URL"
show_var "HEDERA_TREASURY_ID"
show_var "HEDERA_TREASURY_KEY"
show_var "HEDERA_MIRROR_NODE_URL"
show_var "RESEND_API_KEY"

echo ""
echo "✅ After adding all variables, redeploy:"
echo "   vercel --prod"
echo ""
