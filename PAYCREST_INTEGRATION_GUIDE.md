# 🚀 Paycrest Stablecoin Off-Ramp Integration

## Overview

Your NedaPay Plus platform now supports **stablecoin-to-fiat off-ramp** via Paycrest, enabling crypto-first companies to automatically convert USDC/USDT to local fiat currencies.

**What's Ready:**
- ✅ USDC/USDT → 9 African & Global currencies
- ✅ Base chain integration (ultra-low fees)
- ✅ 1-2 minute automated settlement
- ✅ API-first architecture
- ✅ Webhook status updates

---

## 🎯 Target Customers

### Primary Use Cases

1. **Crypto Exchanges** (Quidax, Luno, Bundle, Yellow Card)
   - Automate user withdrawals to bank accounts
   - No manual bank transfers needed
   - Support multiple countries with one integration

2. **Web3 Companies** (DAOs, DeFi platforms)
   - Pay contractors in local currencies
   - Automated payroll processing
   - Cross-border payments without banking relationships

3. **Stablecoin Remittance Services**
   - Accept USDC in source country
   - Deliver local fiat in destination country
   - Faster and cheaper than traditional remittance

4. **DeFi Platforms**
   - Enable fiat exit ramps for users
   - Convert yield/rewards to fiat
   - Cash-out to bank accounts

---

## 📋 Setup Instructions

### Step 1: Run Database Migration

Go to your **Supabase Dashboard** → SQL Editor and run:

\`\`\`sql
-- Add Paycrest tracking fields
ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS paycrest_order_id VARCHAR;

ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS paycrest_valid_until TIMESTAMPTZ;

ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_orders_paycrest_order_id 
ON payment_orders(paycrest_order_id)
WHERE paycrest_order_id IS NOT NULL;
\`\`\`

Or run locally:
\`\`\`bash
# If you have the SQL file
psql $DATABASE_URL < scripts/add-paycrest-fields-simple.sql
\`\`\`

### Step 2: Add Environment Variables

Add these to your `.env` file:

\`\`\`bash
# Paycrest Configuration
PAYCREST_API_KEY=your_paycrest_api_key_here
PAYCREST_ENV=sandbox  # or 'production'

# Base Chain (if not already configured)
BASE_TREASURY_ADDRESS=0x...  # Your Base wallet address
BASE_PRIVATE_KEY=0x...       # Your Base wallet private key
BASE_RPC_URL=https://mainnet.base.org  # or sepolia for testnet

# Refund address (if Paycrest order fails)
BASE_REFUND_ADDRESS=0x...  # Where failed orders refund to
\`\`\`

### Step 3: Get Paycrest API Key

1. Sign up at [app.paycrest.io](https://app.paycrest.io)
2. Go to Settings → API Keys
3. Generate new API key
4. Copy to your `.env` file

### Step 4: Configure Paycrest Webhook

In Paycrest Dashboard → Settings → Webhooks:

- **Webhook URL**: `https://yourdomain.com/api/webhooks/paycrest`
- **Events**: Select all (order.fulfilled, order.settled, order.failed, etc.)
- **Save** and copy webhook secret (not needed for MVP, but recommended for production)

### Step 5: Test the Integration

\`\`\`bash
# Start your dev server
npm run dev

# Test API endpoint (use Postman/curl)
curl -X POST http://localhost:3000/api/v1/payment-orders \\
  -H "Authorization: Bearer your_sender_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 10,
    "token": "USDC",
    "toCurrency": "NGN",
    "recipientDetails": {
      "bankCode": "GTB",
      "accountNumber": "0123456789",
      "accountName": "Test Recipient",
      "memo": "Test payment"
    },
    "reference": "TEST-001"
  }'
\`\`\`

---

## 🔌 API Documentation

### Create Off-Ramp Order

**Endpoint:** `POST /api/v1/payment-orders`

**Headers:**
\`\`\`
Authorization: Bearer {sender_api_key}
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "amount": 100,                    // USDC amount
  "token": "USDC",                  // or "USDT"
  "toCurrency": "NGN",              // Destination currency
  "recipientDetails": {
    "bankCode": "GTB",              // Bank code
    "accountNumber": "0123456789",  // Account number
    "accountName": "John Doe",      // Account name
    "memo": "Optional payment memo" // Optional
  },
  "reference": "YOUR-REF-123",      // Optional tracking reference
  "webhookUrl": "https://..."       // Optional webhook for status updates
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "success": true,
  "orderId": "offramp_1234567890_abc",
  "status": "processing",
  "fromAmount": 100,
  "fromCurrency": "USDC",
  "toAmount": 158050,
  "toCurrency": "NGN",
  "exchangeRate": 1580.50,
  "fees": {
    "senderMarkup": 0.50,
    "platformFee": 2.00,
    "paycrestSenderFee": 0.50,
    "networkFee": 0.03,
    "totalFees": 3.03
  },
  "paycrest": {
    "orderId": "paycrest_xyz789",
    "receiveAddress": "0x...",
    "validUntil": "2024-11-29T13:20:00Z"
  },
  "blockchain": {
    "network": "base",
    "transactionHash": "0xabc...def"
  },
  "estimatedCompletion": "1-2 minutes",
  "createdAt": "2024-11-29T12:20:00Z",
  "reference": "YOUR-REF-123",
  "testMode": false,
  "message": "Off-ramp order created successfully. Fiat will be delivered to recipient bank account within 1-2 minutes."
}
\`\`\`

### Supported Currencies

- 🇳🇬 **NGN** - Nigerian Naira
- 🇰🇪 **KES** - Kenyan Shilling
- 🇺🇬 **UGX** - Ugandan Shilling
- 🇹🇿 **TZS** - Tanzanian Shilling
- 🇬🇭 **GHS** - Ghanaian Cedi
- 🇲🇼 **MWK** - Malawian Kwacha
- 🌍 **XOF** - West African CFA Franc
- 🇮🇳 **INR** - Indian Rupee
- 🇧🇷 **BRL** - Brazilian Real

### Error Responses

\`\`\`json
{
  "success": false,
  "error": "Currency TZS not supported",
  "supportedCurrencies": ["NGN", "KES", "UGX", "TZS", "GHS", "MWK", "XOF", "INR", "BRL"]
}
\`\`\`

\`\`\`json
{
  "success": false,
  "error": "Invalid recipient details",
  "details": ["Account number is required", "Bank code is required"]
}
\`\`\`

---

## 🔔 Webhook Events

Paycrest will send status updates to your webhook URL:

**Webhook Payload:**
\`\`\`json
{
  "orderId": "paycrest_xyz789",
  "status": "fulfilled",
  "reference": "offramp_1234567890_abc",
  "transactionHash": "0x...",
  "completedAt": "2024-11-29T12:22:00Z",
  "event": "order.fulfilled"
}
\`\`\`

**Status Values:**
- `pending` - Order created, awaiting USDC
- `processing` - USDC received, converting to fiat
- `fulfilled` - Fiat sent to recipient bank ✅
- `settled` - Recipient confirmed receipt ✅
- `cancelled` - Order cancelled or expired ❌
- `refunded` - USDC refunded to sender ❌

---

## 💰 Pricing & Economics

### Per Transaction Costs

| Item | Cost | Who Pays |
|------|------|----------|
| Base network fee | $0.03 | Platform |
| Paycrest sender fee | $0.50 | Platform |
| **Total infrastructure** | **$0.53** | **Platform** |

### Your Revenue (Customizable)

| Item | Default | Notes |
|------|---------|-------|
| Sender markup | 0.5% | Configurable per sender |
| Platform fee | $2.00 | Fixed per transaction |
| **Total revenue** | **$2.50+** | **On $100 tx** |

### Example: 100 USDC → NGN

\`\`\`
Input: 100 USDC
Exchange rate: 1580.50 NGN/USDC
Expected payout: 158,050 NGN

Costs:
- Base gas: $0.03
- Paycrest: $0.50
- Total: $0.53

Revenue:
- Sender markup (0.5%): $0.50
- Platform fee: $2.00
- Total: $2.50

Net margin: $1.97 per transaction 💰
\`\`\`

---

## 🧪 Testing Checklist

### Test Mode

- [ ] Create test API key for sender
- [ ] Test with small USDC amount (1-10 USDC)
- [ ] Verify Paycrest order created
- [ ] Check Base transaction on BaseScan
- [ ] Confirm webhook received
- [ ] Verify order status updates

### Sandbox Testing

Use Paycrest sandbox environment:
\`\`\`bash
PAYCREST_ENV=sandbox
PAYCREST_API_KEY=your_sandbox_key
\`\`\`

### Production Checklist

- [ ] Paycrest KYB approved
- [ ] Production API key configured
- [ ] Base mainnet wallet funded with USDC
- [ ] Webhook URL publicly accessible (HTTPS)
- [ ] Test with real small amount
- [ ] Monitor first 10 transactions closely
- [ ] Set up error alerts

---

## 🚨 Common Issues & Solutions

### Issue: "Base network not configured"

**Solution:** Add Base network to your database:

\`\`\`sql
INSERT INTO networks (identifier, network_type, priority, fee, is_enabled, is_testnet, chain_id, rpc_endpoint)
VALUES ('base', 'evm', 1, 0.03, true, false, 8453, 'https://mainnet.base.org');
\`\`\`

### Issue: "USDC token not configured"

**Solution:** Add USDC token to your database:

\`\`\`sql
INSERT INTO tokens (symbol, contract_address, token_type, decimals, network_tokens, is_enabled)
VALUES ('USDC', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'erc20', 6, (SELECT id FROM networks WHERE identifier='base'), true);
\`\`\`

### Issue: "Insufficient balance" on Base wallet

**Solution:** Fund your Base treasury wallet with USDC:
- Buy USDC on Coinbase
- Bridge to Base via [bridge.base.org](https://bridge.base.org)
- Send to your `BASE_TREASURY_ADDRESS`

### Issue: Webhook not receiving updates

**Solution:**
1. Check webhook URL is publicly accessible (use ngrok for local testing)
2. Verify webhook configured in Paycrest dashboard
3. Check server logs for incoming webhook calls
4. Test webhook endpoint: `GET https://yourdomain.com/api/webhooks/paycrest` should return 200

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Order Volume**
   - Total off-ramp orders per day/week/month
   - Average order size
   - Total USDC processed

2. **Success Rate**
   - % of orders fulfilled successfully
   - Failed order reasons
   - Average time to fulfillment

3. **Revenue**
   - Total platform fees earned
   - Average margin per transaction
   - Top sender customers

4. **Costs**
   - Base gas fees spent
   - Paycrest fees paid
   - Net margin

### Query Examples

\`\`\`sql
-- Today's off-ramp volume
SELECT 
  COUNT(*) as orders,
  SUM(amount) as total_usdc,
  SUM(platform_fee) as revenue
FROM payment_orders
WHERE fulfillment_method = 'paycrest'
  AND created_at >= CURRENT_DATE;

-- Success rate last 7 days
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM payment_orders
WHERE fulfillment_method = 'paycrest'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY status;
\`\`\`

---

## 🔐 Security Best Practices

1. **API Keys**
   - Never commit API keys to git
   - Use environment variables only
   - Rotate keys quarterly

2. **Private Keys**
   - Store Base wallet private key securely
   - Use hardware wallet for production if possible
   - Never log private keys

3. **Webhook Verification**
   - Add signature verification (Paycrest webhook secret)
   - Log all webhook events
   - Alert on suspicious activity

4. **Rate Limiting**
   - Limit API calls per sender
   - Monitor for abuse patterns
   - Implement cooldown periods

---

## 📞 Support & Resources

### Paycrest Support
- Docs: [docs.paycrest.io](https://docs.paycrest.io)
- Email: support@paycrest.io
- Telegram: @paycrest

### Base Chain
- Docs: [docs.base.org](https://docs.base.org)
- Explorer: [basescan.org](https://basescan.org)
- Bridge: [bridge.base.org](https://bridge.base.org)

### Your NedaPay Plus Support
- Dashboard: Check logs in `/api/v1/payment-orders`
- Webhook logs: `/api/webhooks/paycrest`
- Transaction logs: `transaction_logs` table

---

## 🎉 You're Ready!

Your stablecoin off-ramp is **production-ready**. Start onboarding your users:

1. Share API documentation with crypto exchange partners
2. Provide sandbox keys for testing
3. Monitor first transactions closely
4. Scale up as confidence grows

**Next Steps:**
- Add more PSPs when Thunes approved (fiat-to-fiat corridors)
- Implement Hedera for even lower fees (optional)
- Build sender dashboards with analytics
- Add more currency support

---

**Questions?** Review the integration code in:
- `lib/offramp/paycrest-service.ts` - Paycrest API client
- `app/api/v1/payment-orders/route.ts` - Off-ramp endpoint
- `app/api/webhooks/paycrest/route.ts` - Webhook handler
