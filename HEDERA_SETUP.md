# 🌐 Hedera Setup Guide

Complete guide to set up and test Hedera integration in NedaPay Plus.

---

## 📋 Prerequisites

- ✅ Phase 1 completed (multi-chain database schema)
- ✅ Node.js ≥22.0.0
- ✅ Hedera SDK installed (`@hashgraph/sdk`)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Get Hedera Testnet Account

1. Visit **https://portal.hedera.com/**
2. Click "**Create Account**" → Select "**Testnet**"
3. Complete registration
4. Save your credentials:
   - Account ID: `0.0.xxxxx`
   - Private Key: `302e020100...`
5. Get free testnet HBAR from the faucet (~$10 worth)

### Step 2: Configure Environment

1. Copy the Hedera environment template:
   ```bash
   cat .env.hedera.example
   ```

2. Add to your `.env` file:
   ```env
   # Hedera Configuration
   HEDERA_NETWORK=testnet
   HEDERA_OPERATOR_ID=0.0.xxxxx           # Your account ID
   HEDERA_OPERATOR_KEY=302e020100...      # Your private key
   HEDERA_USDC_TOKEN_ID=0.0.429274        # Testnet USDC
   ```

3. **⚠️ SECURITY**: Make sure `.env` is in `.gitignore`!

### Step 3: Test Connection

```bash
npm run hedera:test
```

**Expected Output:**
```
🌐 Testing Hedera Connection...
==================================================================

📋 Step 1: Checking Configuration...
   Network: testnet
   Operator configured: ✅ Yes
   Operator ID: 0.0.xxxxx

🏓 Step 2: Pinging Hedera Network...
   ✅ Network is reachable!

💰 Step 3: Checking Operator Balance...
   HBAR Balance: 100.0 ℏ
   No tokens associated yet

📊 Step 4: Getting Account Info...
   Account ID: 0.0.xxxxx
   Balance: 100.0 ℏ
   Deleted: ✅ No

🔗 Step 5: Checking USDC Token Association...
   Token ID: 0.0.429274
   ⚠️  USDC token not associated
   To associate, run: npm run hedera:associate-usdc

==================================================================

✅ ALL TESTS PASSED!
```

### Step 4: Associate USDC Token

```bash
npm run hedera:associate-usdc
```

**Expected Output:**
```
🔗 Associating USDC Token with Operator Account...
   Operator Account: 0.0.xxxxx
   USDC Token ID: 0.0.429274

⏳ Token not associated yet. Associating...

✅ USDC Token Associated Successfully!
   Transaction ID: 0.0.xxxxx@1234567890.123456789
   View on HashScan: https://hashscan.io/testnet/transaction/...

💡 You can now receive USDC on Hedera!
```

### Step 5: Verify Multi-Chain Setup

```bash
npm run db:verify
```

**Expected Output:**
```
📊 NETWORKS (ordered by priority):

1. HEDERA-TESTNET (Priority 1 - PRIMARY)
   Type: hedera
   Fee: $0.0001 per tx
   Status: ✅ Enabled
   Tokens: 2

2. BASE-SEPOLIA (Priority 2 - FALLBACK)
   Type: evm
   Fee: $0.0300 per tx
   Status: ✅ Enabled
   Tokens: 10

💵 COST COMPARISON (per 1,000 transactions):
   Base Sepolia:    $30.00
   Hedera Testnet:  $0.10
   💰 Savings:      $29.90 (99.67% reduction!)
```

---

## 🔧 Troubleshooting

### Issue: "No operator configured"

**Solution:**
```bash
# Check your .env file
cat .env | grep HEDERA

# Should show:
# HEDERA_NETWORK=testnet
# HEDERA_OPERATOR_ID=0.0.xxxxx
# HEDERA_OPERATOR_KEY=302e020100...
```

### Issue: "Insufficient HBAR balance"

**Solution:**
- Visit https://portal.hedera.com/
- Click "**Faucet**" → Request testnet HBAR
- Wait 30 seconds, check balance again

### Issue: "Token association failed"

**Causes:**
- Not enough HBAR (need ~0.05 HBAR = $0.001)
- Invalid token ID
- Network issues

**Solution:**
```bash
# 1. Check HBAR balance
npm run hedera:test

# 2. Get more HBAR from faucet if needed

# 3. Try again
npm run hedera:associate-usdc
```

### Issue: "Network timeout"

**Solution:**
- Check internet connection
- Verify Hedera testnet is operational: https://status.hedera.com/
- Try again after a few minutes

---

## 📊 Understanding Hedera Costs

### Transaction Fees:

| Operation | Cost (Testnet) | Cost (Mainnet) |
|-----------|----------------|----------------|
| **Token Transfer (USDC)** | $0.0001 | $0.0001 |
| HBAR Transfer | $0.0001 | $0.0001 |
| Account Creation | $1.00 | $1.00 |
| Token Association | $0.05 | $0.05 |
| Query (balance check) | FREE | FREE |

### Cost Comparison:

**Scenario: 100,000 transactions/month**

| Network | Cost/tx | Monthly Cost | Annual Cost |
|---------|---------|--------------|-------------|
| **Hedera** | $0.0001 | **$10** | **$120** |
| Base L2 | $0.03 | $3,000 | $36,000 |
| Ethereum L1 | $1-50 | $100k-5M | $1.2M-60M |

**Savings with Hedera: 99.67%** 🎉

---

## 🧪 Test Scenarios

### Test 1: Simple Balance Check

```bash
npm run hedera:test
```

Verifies:
- ✅ Network connectivity
- ✅ Operator account exists
- ✅ HBAR balance > 0
- ✅ Token associations

### Test 2: Token Association

```bash
npm run hedera:associate-usdc
```

Verifies:
- ✅ Can sign transactions
- ✅ Can execute HTS operations
- ✅ Transaction confirmation works

### Test 3: Multi-Chain Verification

```bash
npm run db:verify
```

Verifies:
- ✅ Database has both networks
- ✅ Hedera is Priority 1
- ✅ Base is Priority 2
- ✅ Tokens configured correctly

---

## 📚 Useful Commands

### Database & Verification:
```bash
npm run db:status          # Full database status
npm run db:verify          # Multi-chain verification
npm run prisma:studio      # Visual database editor
```

### Hedera:
```bash
npm run hedera:test                # Test Hedera connection
npm run hedera:associate-usdc      # Associate USDC token
```

### Development:
```bash
npm run dev               # Start Next.js dev server
npm run build             # Build for production
npm run prisma:generate   # Regenerate Prisma client
```

---

## 🔐 Security Best Practices

### 1. **Never Commit Private Keys**
```bash
# Always check .gitignore includes:
.env
.env.local
.env*.local
```

### 2. **Use Different Keys for Different Environments**
```env
# Testnet (.env.test)
HEDERA_OPERATOR_KEY=302e...testnet_key...

# Mainnet (.env.production)
HEDERA_OPERATOR_KEY=302e...mainnet_key...  # DIFFERENT KEY!
```

### 3. **Rotate Keys Regularly**
- Change keys every 90 days in production
- Use environment variables, never hardcode
- Encrypt keys in database

### 4. **Monitor Account Activity**
- Check HashScan regularly: https://hashscan.io/
- Set up alerts for large transactions
- Monitor balance changes

---

## 🌐 Useful Links

### Official Resources:
- **Portal (Get Account)**: https://portal.hedera.com/
- **Documentation**: https://docs.hedera.com/
- **SDK Repository**: https://github.com/hashgraph/hedera-sdk-js
- **Status Page**: https://status.hedera.com/

### Explorers:
- **Testnet Explorer**: https://hashscan.io/testnet
- **Mainnet Explorer**: https://hashscan.io/mainnet

### Testnet Resources:
- **Mirror Node API**: https://testnet.mirrornode.hedera.com
- **USDC Token**: 0.0.429274 (testnet)

---

## 📝 Next Steps

After completing this setup:

1. ✅ **Phase 2 Complete** - Hedera SDK integrated
2. ⏳ **Phase 3** - Build smart routing logic
3. ⏳ **Phase 4** - Update transaction APIs
4. ⏳ **Phase 5** - Testing & monitoring

---

## 💡 Pro Tips

### Tip 1: Use HashScan for Debugging
```
View any transaction:
https://hashscan.io/testnet/transaction/YOUR_TX_ID

View your account:
https://hashscan.io/testnet/account/0.0.xxxxx
```

### Tip 2: Keep Testnet HBAR Handy
- Always keep 10-20 HBAR in testnet account
- Prevents "insufficient balance" errors
- Faucet refills take 30-60 seconds

### Tip 3: Test Incrementally
```bash
# Don't skip tests!
1. npm run hedera:test          # ← Start here
2. npm run hedera:associate-usdc # ← Then this
3. npm run db:verify            # ← Verify setup
```

---

**Setup Time**: ~5 minutes  
**Cost**: FREE (testnet)  
**Difficulty**: Easy 🟢

Ready to continue to Phase 3? Run `npm run hedera:test` to verify everything works! 🚀
