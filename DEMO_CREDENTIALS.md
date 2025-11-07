# 🎭 Demo Ecosystem Credentials

This document contains pre-configured demo accounts for showcasing NedaPay Plus to prospects, investors, and partners.

> **⚠️ IMPORTANT**: These are DEMO accounts only. Never use in production!

---

## 🚀 Quick Start

### 1. Seed Demo Data
```bash
npm run demo:seed
```

This creates:
- 3 Demo Banks with realistic data
- 3 Demo PSPs with fulfillment capabilities
- 500+ historical completed transactions
- Revenue analytics and metrics

### 2. Start Virtual PSP Bot (Optional)
```bash
npm run demo:bot
```

Keep this running during live demos for automatic order fulfillment (30-90 seconds per order).

---

## 🏦 Demo Bank Accounts

All demo accounts use password: **`Demo2025!`**

### CRDB Bank Tanzania
- **Email**: `demo@crdbbank.co.tz`
- **Role**: Bank/Sender
- **Markup**: 0.2%
- **Subscription**: Premium
- **Use Case**: Large commercial bank

### NMB Bank Tanzania  
- **Email**: `demo@nmbbank.co.tz`
- **Role**: Bank/Sender
- **Markup**: 0.25%
- **Subscription**: Premium
- **Use Case**: Mid-size retail bank

### Mufindi Community Bank
- **Email**: `demo@mufindibank.co.tz`
- **Role**: Bank/Sender
- **Markup**: 0.3%
- **Subscription**: Basic
- **Use Case**: Small community bank

---

## 💼 Demo PSP Accounts

All demo accounts use password: **`Demo2025!`**

### Thunes Global
- **Email**: `demo@thunes.com`
- **Role**: PSP/Provider
- **Commission**: 0.3%
- **Coverage**: China, Kenya, Tanzania, Uganda, Rwanda
- **Use Case**: Global money transfer network

### M-Pesa Tanzania
- **Email**: `demo@mpesa.com`
- **Role**: PSP/Provider
- **Commission**: 0.25%
- **Coverage**: Tanzania, Kenya
- **Use Case**: Mobile money specialist

### Tigo Pesa
- **Email**: `demo@tigopesa.com`
- **Role**: PSP/Provider
- **Commission**: 0.28%
- **Coverage**: Tanzania
- **Use Case**: Local mobile money provider

---

## 🔑 API Keys

After running `npm run demo:seed`, API keys are saved to `.env.demo`.

### For Banks
```bash
DEMO_BANK_1_API_KEY="bank_live_abc123..."
DEMO_BANK_2_API_KEY="bank_live_def456..."
DEMO_BANK_3_API_KEY="bank_live_ghi789..."
```

### For PSPs
```bash
DEMO_PSP_1_API_KEY="psp_live_xyz123..."
DEMO_PSP_2_API_KEY="psp_live_uvw456..."
DEMO_PSP_3_API_KEY="psp_live_rst789..."
```

---

## 🎬 Demo Script Examples

### Scenario 1: Bank Submits Order (2 min)

**Login as CRDB Bank:**
1. Email: `demo@crdbbank.co.tz` | Password: `Demo2025!`
2. Navigate to "New Payment"
3. Fill in:
   - Amount: 1,000,000 TZS
   - Currency: CNY
   - Recipient: Chinese supplier details
4. Submit order
5. **Virtual Bot auto-assigns to PSP**

**Show Real-Time Updates:**
- Order status: `pending` → `processing` → `completed` (30-90s)
- Bank markup earned: ~$2.45
- Settlement transaction on Hedera testnet

---

### Scenario 2: PSP Dashboard (2 min)

**Login as Thunes:**
1. Email: `demo@thunes.com` | Password: `Demo2025!`
2. View assigned orders queue
3. Show fulfillment workflow
4. Commission earned per order: ~$3.00
5. Total monthly revenue: $X,XXX

**Highlight Features:**
- Multi-currency support
- Automatic settlement tracking
- Treasury management
- Fiat fulfillment methods

---

### Scenario 3: Platform Analytics (1 min)

**Admin View** (if applicable):
- Total transaction volume: $500K+
- Number of transactions: 500+
- Active banks: 3
- Active PSPs: 3
- Average settlement time: 45 seconds
- Platform fees earned: $250+

---

## 📊 Pre-Seeded Transaction History

The demo ecosystem includes 500+ realistic transactions:

| Corridor | Count | Total Volume |
|----------|-------|--------------|
| TZS → CNY | 350+ | $300K+ |
| TZS → KES | 80+ | $100K+ |
| TZS → UGX | 70+ | $100K+ |

**Transaction characteristics:**
- Spread over 30 days
- Various amounts (300K - 2.5M TZS)
- All marked as completed
- Real settlement transactions
- Realistic timestamps

---

## 🤖 Virtual PSP Bot Features

The bot automatically:
- ✅ Monitors for pending orders
- ✅ Assigns orders to available PSPs
- ✅ Simulates 30-90 second processing
- ✅ Marks orders as completed
- ✅ Generates mock transaction hashes
- ✅ Triggers USDC settlements
- ✅ Updates commission tracking

**Perfect for:**
- Live demos with prospects
- Trade show demonstrations
- Video recordings
- Investor presentations

---

## 🎯 Use Cases

### For Sales Demos
Login as a bank → submit order → watch virtual bot complete it → show PSP earning commission

### For Technical Evaluations
Provide demo API keys → let prospects test endpoints → show sandbox isolation

### For Investor Pitches
Pre-populated dashboards → show transaction volume → demonstrate revenue model

### For Partnership Discussions
Show both bank and PSP portals → explain value proposition → highlight settlement flow

---

## 🔄 Resetting Demo Data

To start fresh:

```bash
# Re-run seeder (clears old demo data)
npm run demo:seed
```

This will:
1. Delete existing demo accounts
2. Clear demo transactions
3. Recreate everything fresh

---

## 🔒 Security Notes

**Demo Accounts are:**
- ✅ Clearly marked as "demo@..." emails
- ✅ Isolated from production data
- ✅ Use test balances (not real funds)
- ✅ Safe to share in controlled settings

**Never:**
- ❌ Use demo accounts in production
- ❌ Process real customer data through demos
- ❌ Share demo credentials publicly
- ❌ Mix demo and live API keys

---

## 📈 What Prospects Will See

### Bank Dashboard
- Revenue dashboard with earnings
- Transaction history (500+ completed)
- API key management
- Webhook configuration
- White-label settings

### PSP Dashboard
- Order fulfillment queue
- Commission tracking
- Treasury accounts
- Fiat fulfillment methods
- Settlement history

### Live Demo Flow
1. Bank submits payment (1 min)
2. Virtual bot processes (30-90s)
3. Order completes automatically
4. Settlement appears on blockchain
5. Both parties see revenue updates

**Total demo time: ~3 minutes** for complete end-to-end flow!

---

## 🎉 Ready to Demo!

You now have a fully functional demo ecosystem that:
- ✅ Looks like a real production platform
- ✅ Shows realistic transaction volumes
- ✅ Demonstrates automatic fulfillment
- ✅ Proves technical capabilities
- ✅ Validates business model

**Go close some deals!** 💰

---

## 📞 Support

For questions about the demo ecosystem:
- Check `.env.demo` for API keys after seeding
- Review console output for account details
- Virtual bot logs show real-time activity

**Commands:**
```bash
npm run demo:seed  # Create ecosystem
npm run demo:bot   # Start auto-fulfillment
```
