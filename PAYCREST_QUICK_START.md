# ⚡ Paycrest Quick Start (5 Minutes)

Get your stablecoin off-ramp running in 5 minutes!

## Step 1: Database Migration (1 min)

Go to **Supabase Dashboard** → **SQL Editor** → Paste and run:

\`\`\`sql
ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS paycrest_order_id VARCHAR,
ADD COLUMN IF NOT EXISTS paycrest_valid_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_payment_orders_paycrest_order_id 
ON payment_orders(paycrest_order_id)
WHERE paycrest_order_id IS NOT NULL;
\`\`\`

## Step 2: Environment Variables (2 min)

Add to `.env`:

\`\`\`bash
# Paycrest
PAYCREST_API_KEY=your_key_from_paycrest_dashboard
PAYCREST_ENV=sandbox

# Base Chain
BASE_TREASURY_ADDRESS=0x_your_wallet_address
BASE_PRIVATE_KEY=0x_your_private_key
BASE_RPC_URL=https://mainnet.base.org
BASE_REFUND_ADDRESS=0x_your_refund_wallet
\`\`\`

## Step 3: Configure Webhook (1 min)

Paycrest Dashboard → Settings → Webhooks:
- URL: `https://yourdomain.com/api/webhooks/paycrest`
- Events: Select all
- Save

## Step 4: Test API (1 min)

\`\`\`bash
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
      "accountName": "Test User"
    }
  }'
\`\`\`

## ✅ Done!

You now have a working stablecoin off-ramp API!

**Supported:** USDC/USDT → NGN, KES, UGX, TZS, GHS, MWK, XOF, INR, BRL

**Next:** Read full guide in `PAYCREST_INTEGRATION_GUIDE.md`

---

## 📞 Need Help?

### Common Issues

**"Base network not configured"**
→ Run: `INSERT INTO networks...` (see full guide)

**"USDC token not found"**
→ Run: `INSERT INTO tokens...` (see full guide)

**"Insufficient balance"**
→ Fund your Base wallet with USDC

**Webhook not working**
→ Make sure URL is public (use ngrok for local testing)
