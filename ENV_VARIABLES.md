# Environment Variables Configuration

Complete list of environment variables needed for NedaPay Plus.

---

## 🔐 Core Configuration

### Database
\`\`\`bash
# PostgreSQL connection string (Supabase)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"  # For migrations
\`\`\`

### Next.js
\`\`\`bash
# App URL (production)
NEXT_PUBLIC_APP_URL="https://nedapayplus.xyz"

# API URL (if different from app URL)
NEXT_PUBLIC_API_URL="https://api.nedapayplus.xyz"
\`\`\`

---

## 💳 Paycrest Off-Ramp (REQUIRED for off-ramp)

\`\`\`bash
# Paycrest API credentials
PAYCREST_API_KEY="your_paycrest_api_key"        # Get from app.paycrest.io
PAYCREST_ENV="sandbox"                           # or "production"

# Webhook configuration
PAYCREST_WEBHOOK_SECRET="your_webhook_secret"    # Optional: For webhook verification
\`\`\`

**How to get:**
1. Sign up at [app.paycrest.io](https://app.paycrest.io)
2. Go to Settings → API Keys
3. Generate new API key
4. Copy to `.env`

---

## ⛓️ Base Chain (REQUIRED for off-ramp)

\`\`\`bash
# Base network configuration
BASE_TREASURY_ADDRESS="0x..."                    # Your Base wallet address
BASE_PRIVATE_KEY="0x..."                         # Your wallet private key (NEVER commit!)
BASE_RPC_URL="https://mainnet.base.org"         # or sepolia for testnet
BASE_REFUND_ADDRESS="0x..."                      # Where refunds go if order fails

# Optional: Specific RPC provider
BASE_RPC_PROVIDER="alchemy"                      # or "infura", "quicknode"
BASE_ALCHEMY_KEY="your_alchemy_key"             # If using Alchemy
\`\`\`

**How to get:**
1. Create wallet using MetaMask or similar
2. Fund with USDC on Base chain
3. Export private key (KEEP SECRET!)
4. Add to `.env` file

**Security:**
- Never commit private keys to git
- Use environment variables only
- Rotate keys quarterly
- Consider hardware wallet for production

---

## 🪙 Hedera (OPTIONAL - For future low-cost transactions)

\`\`\`bash
# Hedera network
HEDERA_NETWORK="testnet"                         # or "mainnet"
HEDERA_OPERATOR_ID="0.0.123456"                  # Your Hedera account ID
HEDERA_OPERATOR_KEY="302e..."                    # Your Hedera private key
HEDERA_TREASURY_ID="0.0.123456"                  # Treasury account
HEDERA_USDC_TOKEN_ID="0.0.429274"               # USDC token on Hedera

# Optional: Mirror node
HEDERA_MIRROR_NODE_URL="https://testnet.mirrornode.hedera.com"
\`\`\`

**Status:** Not required for Paycrest integration. Add later for cost optimization.

---

## 🔑 Authentication

\`\`\`bash
# NextAuth / Auth configuration
NEXTAUTH_URL="https://nedapayplus.xyz"
NEXTAUTH_SECRET="your_random_secret_string"      # Generate with: openssl rand -base64 32

# Session
SESSION_SECRET="your_session_secret"             # Another random string
\`\`\`

---

## 📧 Email (Optional - For notifications)

\`\`\`bash
# SMTP configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASSWORD="your_app_password"
SMTP_FROM="noreply@nedapay.com"
\`\`\`

---

## 🔔 Webhooks

\`\`\`bash
# Your webhook URLs (configure in sender profiles)
SENDER_WEBHOOK_URL="https://yourapp.com/webhooks/nedapay"

# Webhook secrets for verification
WEBHOOK_SECRET="your_webhook_secret"             # For signing outgoing webhooks
\`\`\`

---

## 📊 Analytics & Monitoring (Optional)

\`\`\`bash
# Sentry for error tracking
SENTRY_DSN="https://..."
SENTRY_ENV="production"

# PostHog for analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Google Analytics
NEXT_PUBLIC_GA_ID="G-..."
\`\`\`

---

## 🧪 Testing & Development

\`\`\`bash
# Node environment
NODE_ENV="development"                           # or "production"

# Enable test mode
ENABLE_TEST_MODE="true"                          # Allow test API keys

# Mock services (for testing without real APIs)
MOCK_BLOCKCHAIN="false"                          # Use real blockchain
MOCK_PAYCREST="false"                           # Use real Paycrest API
\`\`\`

---

## 📁 Example `.env` File

\`\`\`bash
# ===================================
# NedaPay Plus - Environment Variables
# ===================================

# Database
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"

# ===== PAYCREST OFF-RAMP =====
PAYCREST_API_KEY="your_api_key_from_paycrest_dashboard"
# Get your API Key from: https://app.paycrest.io (Dashboard → Settings → API Keys)

# ===== BASE CHAIN =====
BASE_TREASURY_ADDRESS="0xYourWalletAddress"
BASE_PRIVATE_KEY="0xYourPrivateKey"
BASE_RPC_URL="https://mainnet.base.org"
BASE_REFUND_ADDRESS="0xYourRefundAddress"

# ===== OPTIONAL: HEDERA (Future) =====
# HEDERA_NETWORK="testnet"
# HEDERA_OPERATOR_ID="0.0.123456"
# HEDERA_OPERATOR_KEY="302e..."

# ===== OPTIONAL: Email =====
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your_email@gmail.com"
# SMTP_PASSWORD="your_app_password"

# ===== OPTIONAL: Analytics =====
# SENTRY_DSN="https://..."
# NEXT_PUBLIC_POSTHOG_KEY="phc_..."
\`\`\`

---

## ✅ Verification Checklist

After setting up environment variables:

- [ ] `.env` file exists and is in `.gitignore`
- [ ] `DATABASE_URL` connects successfully
- [ ] `PAYCREST_API_KEY` is valid (test with sandbox)
- [ ] `BASE_TREASURY_ADDRESS` has USDC balance
- [ ] `BASE_PRIVATE_KEY` is kept secret
- [ ] `NEXTAUTH_SECRET` is random and secure
- [ ] All URLs use HTTPS in production
- [ ] Test mode works with test API keys
- [ ] Production keys separated from test keys

---

## 🔒 Security Best Practices

### Never Commit Secrets
\`\`\`bash
# Add to .gitignore
.env
.env.local
.env.production
.env.development
\`\`\`

### Use Different Keys Per Environment
\`\`\`bash
# Development
.env.development

# Production
.env.production
\`\`\`

### Rotate Keys Regularly
- API keys: Every 90 days
- Private keys: Consider hardware wallet
- Webhook secrets: Every 180 days

### Monitor Usage
- Set up alerts for unusual API activity
- Monitor wallet balances daily
- Track failed authentication attempts

---

## 🚀 Quick Setup Script

\`\`\`bash
#!/bin/bash
# setup-env.sh - Quick environment setup

echo "🚀 NedaPay Plus - Environment Setup"
echo ""

# Check if .env exists
if [ -f .env ]; then
  echo "⚠️  .env file already exists. Backup created: .env.backup"
  cp .env .env.backup
fi

# Copy example
cp .env.example .env

echo "✅ .env file created"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Get Paycrest API key: https://app.paycrest.io"
echo "3. Fund your Base wallet with USDC"
echo "4. Test with: npm run dev"
echo ""
\`\`\`

---

## 📞 Support

**Questions about environment setup?**
- Email: support@nedapay.com
- Docs: [nedapayplus.xyz/docs](https://nedapayplus.xyz/docs)
- Discord: [discord.gg/nedapay](https://discord.gg/nedapay)
