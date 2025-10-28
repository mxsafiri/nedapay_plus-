# 🔑 NedaPay Test Credentials

**For Demo & Initial User Testing**

---

## 📤 Test Bank Accounts (Senders)

### Bank 1: CRDB Bank (Test)
```
Email:    test-bank@crdb.co.tz
Password: TestBank123!
Role:     BANK (Sender)

Profile Details:
- Business Name: CRDB Bank Tanzania (Test)
- Trading Name: CRDB Test
- Test Balance: $100,000 USD
- Markup Rate: 0.2% (default)
- Countries: Tanzania, Kenya, Uganda
- Status: KYB Approved ✅

API Credentials:
- API Key: test_crdb_bank_api_key_sandbox_2024
- Environment: Sandbox
- Webhook URL: (configure in settings)

What they can do:
✅ Create payment orders via API
✅ View transaction history
✅ Track revenue from markups
✅ Configure webhook notifications
✅ White-label settings
```

### Bank 2: NMB Bank (Test)
```
Email:    test-bank@nmb.co.tz
Password: TestBank123!
Role:     BANK (Sender)

Profile Details:
- Business Name: NMB Bank Tanzania (Test)
- Trading Name: NMB Test
- Test Balance: $100,000 USD
- Markup Rate: 0.2% (default)
- Countries: Tanzania, Kenya
- Status: KYB Approved ✅

API Credentials:
- API Key: test_nmb_bank_api_key_sandbox_2024
- Environment: Sandbox

What they can do:
✅ Create payment orders via API
✅ View transaction history
✅ Track revenue from markups
✅ Monitor order status
✅ Export reports
```

---

## 📥 Test PSP Accounts (Providers)

### PSP 1: M-Pesa Tanzania (Test)
```
Email:    test-psp@mpesa.com
Password: TestPSP123!
Role:     PSP (Provider)

Profile Details:
- Business Name: M-Pesa Tanzania Payment Services (Test)
- Trading Name: M-Pesa Test
- Test Balance: $50,000 USD
- Commission Rate: 0.3% (default)
- Supported Countries: TZ, KE, UG, RW
- Status: KYB Approved ✅

Fiat Fulfillment Methods:
✅ M-Pesa
   - Provider: Vodacom
   - Business Number: +255754999888
   - Business Name: M-Pesa Tanzania (Test)
   - Daily Limit: $50,000

Settlement Wallets (Receives USDC):
✅ Hedera Testnet: 0.0.7099609
✅ Base Sepolia: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e

What they can do:
✅ View incoming order queue
✅ Accept/reject orders
✅ Mark orders as fulfilled
✅ Track commission earnings
✅ View settlement history
✅ Monitor pending settlements
```

### PSP 2: Thunes Payment Services (Test)
```
Email:    test-psp@thunes.com
Password: TestPSP123!
Role:     PSP (Provider)

Profile Details:
- Business Name: Thunes Payment Services (Test)
- Trading Name: Thunes Test
- Test Balance: $50,000 USD
- Commission Rate: 0.3% (default)
- Supported Countries: TZ, KE, UG, RW, Global
- Status: KYB Approved ✅

Fiat Fulfillment Methods:
✅ Thunes API
   - Account ID: test-thunes-account
   - API Key: test_thunes_api_key_sandbox
   - Environment: Sandbox
   - Status: Connected ✅

Settlement Wallets (Receives USDC):
✅ Hedera Testnet: 0.0.7099610
✅ Base Sepolia: 0x842d35Cc6634C0532925a3b844Bc454e4438f55f

What they can do:
✅ View incoming order queue
✅ Accept/reject orders
✅ Fulfill via Thunes API
✅ Mark orders as fulfilled
✅ Track commission earnings
✅ View settlement history
```

---

## 👤 Test Admin Account

### Admin: NedaPay Admin (Test)
```
Email:    admin@nedapay.io
Password: AdminTest123!
Role:     ADMIN

Access to Backstage:
- URL: /backstage
- Password: (same as login)

What they can do:
✅ Monitor all settlements
✅ Approve/reject KYB applications
✅ View all transactions
✅ Manage users
✅ Configure system settings
✅ Retry failed settlements
✅ View platform metrics
✅ Export reports
```

---

## 🧪 Test Scenarios

### Scenario 1: Simple Payment Flow
**Participants:** CRDB Bank + M-Pesa PSP

```bash
1. Bank (CRDB) creates order via API
   POST /api/v1/orders
   {
     "amount": 100,
     "currency": "USD",
     "recipient": {
       "method": "mpesa",
       "phone": "+255754123456",
       "name": "John Doe"
     },
     "reference": "TEST-001"
   }

2. M-Pesa PSP sees order in queue
   - Logs into dashboard
   - Goes to "Orders" tab
   - Sees pending order

3. M-Pesa PSP accepts order
   - Clicks "Accept Order"
   - Sends 280,000 TZS via M-Pesa
   - Gets M-Pesa reference: MPESA-TEST-123

4. M-Pesa PSP marks complete
   - Clicks "Mark Complete"
   - Enters tx proof: MPESA-TEST-123
   - Submits

5. Settlement auto-triggers
   - System calculates: $100 + $2 commission = $102
   - Sends 102 USDC to PSP's Hedera wallet
   - Updates dashboard

6. Bank receives webhook
   - Status: completed
   - TX Hash: blockchain transaction
```

### Scenario 2: Multi-Provider
**Participants:** NMB Bank + Both PSPs

```bash
1. NMB creates order for Kenya
   - Amount: $500
   - Destination: Kenya M-Pesa

2. Both PSPs can see order
   - M-Pesa PSP (Kenya coverage)
   - Thunes PSP (Global coverage)

3. First to accept wins
   - Thunes PSP accepts first
   - Uses Thunes API to fulfill
   - Gets paid in USDC

4. Bank tracks everything
   - Real-time status updates
   - Webhook notifications
   - Revenue tracking
```

---

## 🔐 Security Notes

### Test Environment
- ✅ All accounts are in SANDBOX mode
- ✅ No real money involved
- ✅ Test blockchain networks (Hedera Testnet, Base Sepolia)
- ✅ Simulated Thunes API
- ✅ Test M-Pesa transactions

### Password Policy
```
Minimum requirements:
- 10 characters minimum
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
```

### API Key Security
- 🔒 Never commit API keys to code
- 🔒 Store in environment variables
- 🔒 Use HTTPS only
- 🔒 Rotate keys regularly
- 🔒 Test keys prefixed with `test_`

---

## 📊 Test Data Available

### Pre-loaded Test Data:
- ✅ 2 Test Banks (fully configured)
- ✅ 2 Test PSPs (fully configured)
- ✅ $100k balance per bank
- ✅ $50k balance per PSP
- ✅ KYB pre-approved
- ✅ Fiat methods configured
- ✅ Settlement wallets ready

### What Users Can Test:
1. **Bank Portal:**
   - Create orders via API
   - View transaction history
   - Track revenue
   - Configure webhooks
   - Export reports

2. **PSP Portal:**
   - View order queue
   - Accept/reject orders
   - Fulfill orders
   - Track commissions
   - View settlements
   - Monitor wallet balance

3. **Admin Portal:**
   - Monitor all activity
   - Manage settlements
   - Approve KYB
   - View analytics
   - System configuration

---

## 🚀 Getting Started

### For Banks:
1. Log in with bank credentials
2. Navigate to API Settings
3. Copy API key
4. Follow Bank API Guide
5. Create test orders
6. Monitor dashboard

### For PSPs:
1. Log in with PSP credentials
2. Check order queue
3. Accept an order
4. Mark as fulfilled
5. Check settlements tab
6. Verify USDC received (testnet)

### For Testing:
1. Use Postman/Insomnia for API calls
2. Use Bank credentials for orders
3. Use PSP credentials for fulfillment
4. Use Admin credentials for monitoring
5. Check blockchain explorers for settlements

---

## 🔗 Useful Links

### Dashboards:
- Bank Dashboard: `/protected` (after login)
- PSP Dashboard: `/protected` (after login)
- Admin Dashboard: `/backstage` → `/admin`

### API Documentation:
- Bank API: `/docs/bank-api`
- Webhook Guide: `/docs/webhooks`

### Blockchain Explorers:
- Hedera Testnet: https://hashscan.io/testnet
- Base Sepolia: https://sepolia.basescan.org

---

## 📝 Notes for Initial Users

### What to Expect:
✅ Fully functional test environment
✅ Instant settlements (Testnet USDC)
✅ Real-time dashboards
✅ Webhook notifications
✅ Complete audit trail

### What's Simulated:
⚠️ Thunes API (sandbox mode)
⚠️ M-Pesa transactions (test mode)
⚠️ USDC on testnets (not real value)
⚠️ KYB verification (pre-approved)

### Known Limitations:
- Test mode only
- Limited to configured test accounts
- Testnet blockchain delays (~5 seconds)
- No real fiat transfers

---

## 🆘 Troubleshooting

### Can't log in?
- Check email/password exactly as shown
- Clear browser cache
- Try incognito mode

### Orders not showing?
- Refresh dashboard
- Check you're using correct role
- Verify KYB status is approved

### Settlements not working?
- Check provider has Hedera wallet configured
- Verify order marked as "completed"
- Check admin dashboard for status

### API errors?
- Verify API key format
- Check request headers
- Use correct environment (sandbox)
- Check API documentation

---

## 📧 Support

**For test environment issues:**
- Email: dev@nedapay.io
- Slack: #nedapay-testing
- Documentation: /docs

**Share this document with initial users for demo access!** 🚀
