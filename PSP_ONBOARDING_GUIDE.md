# 🏦 PSP Onboarding Guide - NedaPay Plus

## Welcome to NedaPay! 🎉

This guide will help you set up your settlement wallets in **5-10 minutes**. Don't worry - we'll walk you through every step!

---

## 📋 What You Need

Before starting, have these ready:
- ✅ Your email address
- ✅ A smartphone (for 2FA codes)
- ✅ 10 minutes of time
- ❌ **NO crypto experience needed!**

---

## 🎯 Overview: What We're Setting Up

You'll create **2 settlement wallets** to receive USDC payments:

```
1. Hedera Wallet (Primary) - Receives 95% of payments
   └─ Ultra-low fees ($0.0001 per transaction)
   
2. Base Wallet (Backup) - Receives 5% of payments
   └─ Only used when Hedera is unavailable
```

**Don't worry!** While these are called "wallets," they work just like bank accounts for receiving payments. You'll never need to understand blockchain - we handle everything behind the scenes.

---

## 🌐 STEP 1: Create Your Hedera Account (5 minutes)

### Why Hedera?
Hedera processes 95% of our payments because it's:
- ⚡ Super fast (3-5 seconds)
- 💰 Super cheap ($0.0001 per transaction vs $0.03 on other networks)
- 🔒 Super secure (used by Google, IBM, Boeing)

### Step-by-Step Instructions:

#### 1.1 Visit Hedera Portal
```
🔗 https://portal.hedera.com/
```

#### 1.2 Create Account
1. Click **"Create Account"** (big blue button)
2. Select **"Testnet"** (for testing - we'll switch to mainnet later)
3. Click **"Continue"**

#### 1.3 Sign Up
1. Enter your email: `support@yourcompany.com`
2. Create a strong password
3. Click **"Create Account"**
4. Check your email and verify

#### 1.4 Get Your Account ID
After verification, you'll see:
```
┌────────────────────────────────────┐
│ Your Hedera Account                │
├────────────────────────────────────┤
│ Account ID: 0.0.7099612            │ ← COPY THIS!
│                                    │
│ Network: Testnet                   │
│ Status: Active                     │
└────────────────────────────────────┘
```

**IMPORTANT:** Copy your Account ID (looks like `0.0.xxxxxxx`)

#### 1.5 Get Free Test HBAR
1. Click **"Faucet"** in the left menu
2. Click **"Request HBAR"**
3. Wait 30 seconds
4. You'll receive ~100 HBAR (worth ~$7)

**Why?** This is "gas money" for transactions - like having a few dollars in your account for fees. NedaPay will top this up for you if needed.

#### 1.6 Save Your Recovery Phrase
1. Click **"Settings"** → **"Backup Keys"**
2. Write down your 24-word recovery phrase
3. Store it safely (NOT on your computer!)

**⚠️ CRITICAL:** This phrase is like your bank PIN. If you lose it, you lose access to funds!

```
✅ DO: Write on paper, store in safe
❌ DON'T: Screenshot, email, cloud storage
```

---

### ✅ Hedera Setup Complete!

You should now have:
- ✅ Hedera Account ID: `0.0.xxxxxxx`
- ✅ Recovery phrase written down
- ✅ ~100 HBAR in your account

**Next:** Set up your Base wallet (backup)

---

## ⛓️ STEP 2: Create Your Base Wallet (3 minutes)

### Why Base?
Base is our backup network for the rare cases when Hedera needs maintenance. It's:
- 🏗️ Built by Coinbase (trusted)
- 🔄 Compatible with Ethereum
- 🆘 Our safety net for 24/7 uptime

### Step-by-Step Instructions:

#### 2.1 Install MetaMask
**On Computer:**
1. Visit: `https://metamask.io/download/`
2. Click **"Install MetaMask for Chrome"** (or your browser)
3. Click **"Add to Chrome"** → **"Add Extension"**

**On Mobile:**
1. iPhone: Download from App Store
2. Android: Download from Google Play
3. Search: "MetaMask - Blockchain Wallet"

#### 2.2 Set Up MetaMask
1. Click **"Create a new wallet"**
2. Click **"I agree"** to terms
3. Create a password (write it down!)
4. Click **"Create a new wallet"**

#### 2.3 Save Your Recovery Phrase
1. Click **"Secure my wallet"**
2. **WRITE DOWN** the 12 words shown (in order!)
3. Click **"Next"**
4. Confirm by selecting words in correct order
5. Click **"Confirm"**

**⚠️ CRITICAL:** Store this separately from your Hedera phrase!

#### 2.4 Get Your Wallet Address
1. Open MetaMask
2. Click on your account name at the top
3. You'll see an address like: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
4. Click to copy

**That's it!** Your Base wallet is ready.

---

### ✅ Base Setup Complete!

You should now have:
- ✅ MetaMask installed
- ✅ Wallet address: `0x742d35Cc...`
- ✅ Recovery phrase written down

**Next:** Add these to NedaPay

---

## 🔧 STEP 3: Configure NedaPay (2 minutes)

Now let's add your wallet addresses to NedaPay so you can receive payments!

### 3.1 Log Into NedaPay
1. Visit: `https://app.nedapay.com/login`
2. Enter your credentials
3. Click **"Sign In"**

### 3.2 Navigate to Settings
1. Click your profile icon (top right)
2. Click **"Settings"**
3. Click **"Provider Configuration"**
4. Scroll to **"Wallet Addresses"** section

### 3.3 Enter Your Hedera Account ID
```
┌─────────────────────────────────────────┐
│ Hedera Testnet [Priority 1] PRIMARY    │
│ ──────────────────────────────────────  │
│ • Network: testnet                      │
│ • Format: Hedera Account ID             │
│                                         │
│ [0.0.7099612___________________]        │
│         ↑ Paste your Account ID here    │
└─────────────────────────────────────────┘
```

1. Find the Hedera wallet input
2. Paste your Account ID (e.g., `0.0.7099612`)
3. Double-check it's correct!

### 3.4 Enter Your Base Wallet Address
```
┌─────────────────────────────────────────┐
│ Base Sepolia [Priority 2]              │
│ ──────────────────────────────────────  │
│ • Chain ID: 84532                       │
│ • Format: EVM Address                   │
│                                         │
│ [0x742d35Cc6634C0532925a3b8...]        │
│     ↑ Paste your MetaMask address here  │
└─────────────────────────────────────────┘
```

1. Find the Base wallet input
2. Paste your MetaMask address (starts with `0x`)
3. Double-check it's correct!

### 3.5 Save Configuration
1. Click **"Update"** at the bottom
2. Wait for confirmation: "Settings saved successfully!"
3. Done! ✅

---

## 🎉 CONGRATULATIONS! You're All Set!

Your settlement wallets are now configured. Here's what happens next:

### How Payments Work:

```
1. Bank submits payment order
   ↓
2. NedaPay assigns order to you
   ↓
3. USDC sent to your Hedera wallet (95% of time)
   - Or Base wallet (5% of time)
   ↓
4. You see notification: "New order: $2,044"
   ↓
5. You fulfill order (settle in destination currency)
   ↓
6. You mark order complete
   ↓
7. Commission credited to your balance
   ↓
8. Withdraw to your bank account monthly
```

**You'll never need to touch your wallets again!** NedaPay handles everything automatically.

---

## 📱 STEP 4: Test Your Setup (Optional but Recommended)

Let's make sure everything works:

### 4.1 Request Test Payment
1. Contact NedaPay support: `support@nedapay.com`
2. Say: "Please send me a test payment to verify my wallets"
3. They'll send $1 USDC to test

### 4.2 Verify Receipt
**Check Hedera:**
1. Go to: `https://hashscan.io/testnet`
2. Search your Account ID: `0.0.xxxxxxx`
3. You should see the test transaction

**Check Base:**
1. Open MetaMask
2. Look for USDC balance
3. Should show $1.00 USDC

### 4.3 Confirm with NedaPay
Once you see the test payment:
1. Email support: "Test payment received!"
2. They'll activate your account for live orders

---

## 🆘 TROUBLESHOOTING

### Issue: "I didn't receive test HBAR"
**Solution:**
1. Wait 2-3 minutes (sometimes delayed)
2. Check spam folder for verification email
3. If still nothing, contact: `support@nedapay.com`

### Issue: "MetaMask won't install"
**Solution:**
1. Try different browser (Chrome works best)
2. Disable ad-blockers temporarily
3. Clear browser cache
4. Try mobile app instead

### Issue: "I lost my recovery phrase"
**Solution:**
⚠️ This is serious! Contact support immediately.
- They can help create a new wallet
- Old wallet funds may be unrecoverable
- Prevention: Store phrase in safe deposit box

### Issue: "Wrong network in MetaMask"
**Solution:**
We'll add the correct network for you:
1. Open MetaMask
2. Click network dropdown (shows "Ethereum Mainnet")
3. NedaPay will provide Base Sepolia RPC details
4. Or we'll do it remotely with your permission

### Issue: "I pasted the wrong address"
**Solution:**
No problem!
1. Go back to Settings → Wallet Addresses
2. Update the incorrect address
3. Click "Update" to save
4. Verify with a test payment

---

## 📞 NEED HELP?

Our team is here for you!

### Support Channels:

**Email:** support@nedapay.com
- Response time: Within 2 hours
- Best for: Account issues, technical problems

**WhatsApp:** +255-XXX-XXX-XXX
- Response time: Within 30 minutes
- Best for: Urgent wallet setup help

**Video Call:** Schedule at calendly.com/nedapay
- Response time: Same day
- Best for: Personalized walkthrough

**Knowledge Base:** help.nedapay.com
- 24/7 access
- Video tutorials, FAQs, guides

---

## 🔐 SECURITY BEST PRACTICES

### DO:
✅ Write recovery phrases on paper
✅ Store phrases in separate secure locations
✅ Use strong, unique passwords
✅ Enable 2FA on Hedera Portal
✅ Keep your phone/computer secure
✅ Log out when finished

### DON'T:
❌ Share recovery phrases with ANYONE (even NedaPay!)
❌ Store phrases digitally (screenshots, cloud)
❌ Use the same password everywhere
❌ Click suspicious links in emails
❌ Install untrusted browser extensions

---

## 💰 UNDERSTANDING YOUR EARNINGS

### How Commissions Work:

```
Example Transaction:
├─ Order Value: $2,044 USDC
├─ Your Commission Rate: 0.3%
└─ You Earn: $6.13

Monthly Example (150 orders):
├─ Total Volume: $306,000
├─ Your Commission: 0.3%
└─ You Earn: $918/month
```

### Viewing Your Balance:

**Dashboard → Overview:**
```
┌────────────────────────────────┐
│ Your Earnings                  │
├────────────────────────────────┤
│ This Month: $918.00            │
│ All Time: $12,463.02           │
│                                │
│ [Withdraw to Bank]             │
└────────────────────────────────┘
```

### Withdrawing Funds:

**Monthly Withdrawals:**
1. Click "Withdraw to Bank"
2. Enter amount (min: $100)
3. Confirm bank details
4. NedaPay converts USDC → TZS
5. Funds in your bank within 24 hours

**Withdrawal Fees:**
- Platform fee: 0.5%
- Bank transfer: Free
- Example: Withdraw $1,000 → Receive TSh 2,432,500

---

## 📊 WHAT'S NEXT?

### After Setup:

**Week 1:** Learning Phase
- Receive 1-2 test orders
- Practice fulfillment workflow
- Get comfortable with dashboard

**Week 2:** Ramp Up
- Receive 5-10 real orders
- Build confidence
- Optimize processes

**Month 1:** Full Operations
- Receive 50+ orders
- Earn first commissions
- Request first withdrawal

### Growing Your Business:

**Increase Order Volume:**
- Improve fulfillment speed
- Maintain high completion rate
- Build reputation score

**Unlock Better Rates:**
- 100 orders → 0.35% commission
- 500 orders → 0.4% commission
- 1,000 orders → 0.5% commission

**Add More Currencies:**
- Start with TZS → CNY
- Add TZS → USD
- Add TZS → EUR
- Expand globally!

---

## 📚 ADDITIONAL RESOURCES

### Video Tutorials:
- 🎥 "Hedera Account Setup" (3 min)
- 🎥 "MetaMask Installation" (2 min)
- 🎥 "First Order Walkthrough" (5 min)

### Downloadable Guides:
- 📄 "Security Checklist" (PDF)
- 📄 "Troubleshooting Guide" (PDF)
- 📄 "Recovery Phrase Storage Guide" (PDF)

### Live Webinars:
- 📅 Weekly: "PSP Onboarding Session"
- 📅 Monthly: "Advanced Features Workshop"
- 📅 Quarterly: "Business Growth Strategies"

---

## ✅ CHECKLIST: Are You Ready?

Before going live, make sure you have:

**Wallets:**
- [ ] Hedera Account ID created
- [ ] Hedera recovery phrase stored safely
- [ ] MetaMask installed
- [ ] Base wallet address copied
- [ ] Both addresses added to NedaPay
- [ ] Settings saved successfully

**Security:**
- [ ] Recovery phrases written on paper
- [ ] Phrases stored in secure location
- [ ] Strong passwords set
- [ ] 2FA enabled on Hedera
- [ ] Understanding of security best practices

**Testing:**
- [ ] Test payment requested
- [ ] Test payment received
- [ ] Dashboard shows correct balance
- [ ] Support team notified of completion

**Knowledge:**
- [ ] Understand how payments work
- [ ] Know how to fulfill orders
- [ ] Familiar with dashboard
- [ ] Know how to withdraw funds
- [ ] Have support contact info saved

**All checked?** 🎉 **YOU'RE READY TO GO LIVE!**

---

## 🙏 THANK YOU!

Welcome to the NedaPay family! We're excited to have you as a Payment Service Provider.

Together, we're making cross-border payments:
- ⚡ Faster (3-5 seconds vs 3-5 days)
- 💰 Cheaper (99.67% cost reduction)
- 🌍 More accessible (Africa ↔ World)

Questions? We're here 24/7!

**Let's build the future of payments together! 🚀**

---

*Last Updated: October 2025*  
*Version: 1.0*  
*For: PSP Onboarding*
