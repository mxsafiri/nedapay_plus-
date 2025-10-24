# Testing Guide: Sandbox Functionality

## ✅ What Was Fixed

### 1. **Database Migration Applied**
- Added `is_test` column to `api_keys` table
- Added `is_test_mode` column to `payment_orders` table
- Added `test_balance` to `sender_profiles` and `provider_profiles`
- All columns now exist in production database

### 2. **UI Improvements**
- ✅ Added **"Test Mode" checkbox** in API key creation dialog
- ✅ Better error messages with console logging
- ✅ Auto-regeneration of keys (no more "key already exists" error)
- ✅ Clear indication of test vs live keys

### 3. **Backend Fixes**
- ✅ API key generation now saves `is_test` flag
- ✅ Payment orders detect test mode from API key
- ✅ Mock blockchain service creates fake transactions
- ✅ Test orders auto-confirm instantly

---

## 🧪 How to Test (Browser - Easiest)

### Step 1: Create a Test API Key

1. **Go to**: https://nedapay-plus.vercel.app/protected/settings
2. **Click**: "API Keys" tab (left sidebar)
3. **Click**: "Create API Key" button
4. **Enter name**: "My Test Key"
5. **Check**: ✅ "Test Mode (Sandbox)" checkbox (should be checked by default)
6. **Click**: "Create Key"
7. **Copy the key** - it starts with `np_test_`

**Expected Result:**
```
✅ Success toast: "API key created successfully!"
🔑 Key format: np_test_48charsofhexadecimal...
```

### Step 2: Test Payment Order Creation (Using cURL)

Open your terminal and run:

```bash
curl -X POST https://nedapay-plus.vercel.app/api/v1/payment-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEST_API_KEY_HERE" \
  -d '{
    "fromCurrency": "TZS",
    "toCurrency": "CNY",
    "amount": 1000000,
    "recipientDetails": {
      "accountNumber": "9876543210",
      "accountName": "Test Corp",
      "institution": "Test Bank"
    },
    "reference": "TEST-001"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "orderId": "test_order_1729756800_abc123",
  "status": "confirmed",
  "fromAmount": 1000000,
  "fromCurrency": "TZS",
  "toAmount": 2450,
  "toCurrency": "CNY",
  "testMode": true,
  "testData": {
    "txHash": "0x7f9fade1c0532925...",
    "network": "hedera-testnet",
    "message": "This is a test transaction. No real funds were moved."
  }
}
```

---

## 🔧 How to Test (Using Test Script)

### Step 1: Get Your User ID

Open browser console on https://nedapay-plus.vercel.app/protected/settings and run:

```javascript
// Copy this entire block and paste in console
fetch('/api/auth/me')
  .then(r => r.json())
  .then(data => {
    console.log('Your User ID:', data.id);
    console.log('Copy this ID and paste it in test-sandbox.js');
  });
```

### Step 2: Update Test Script

Open `test-sandbox.js` and replace:
```javascript
const USER_ID = 'YOUR_USER_ID_HERE';
```

With your actual user ID:
```javascript
const USER_ID = 'abc-123-def-456...';
```

### Step 3: Run Tests

```bash
node test-sandbox.js
```

**Expected Output:**
```
🚀 Starting NedaPay Sandbox Tests
==================================================

🔑 Testing TEST API Key Generation...
✅ API Key Created!
   Key ID: abc-123...
   Type: test
   API Key: np_test_48chars...
   Prefix: np_test_...

💰 Testing Payment Order Creation...
   Using API key: np_test_48chars...
✅ Payment Order Created!
   Order ID: test_order_1729756800_xyz
   Status: confirmed
   Test Mode: true
   From Amount: 1000000 TZS
   To Amount: 2450 CNY
   Bank Markup: 4.9
   🧪 Test Data:
      TX Hash: 0x7f9fade1c0532925...
      Network: hedera-testnet
      Message: This is a test transaction. No real funds were moved.

==================================================
📊 Test Results Summary:
   Test API Key: ✅
   Test Payment Order: ✅

🎉 All tests passed! Sandbox is working correctly.
```

---

## 🔍 Troubleshooting

### "Unauthorized" Error
**Problem**: API returns 401  
**Solution**: Make sure you're using the correct user ID or API key

### "User not found" Error
**Problem**: No user profile exists  
**Solution**: Complete onboarding as a sender (bank) or provider (PSP)

### "Please complete your profile setup first"
**Problem**: User doesn't have sender_profile or provider_profile  
**Solution**: 
1. Go to https://nedapay-plus.vercel.app/onboarding/sender
2. Complete bank onboarding
3. Then try creating API key again

### API Key Creation Shows Error
**Problem**: See error toast  
**Solution**: 
1. Open browser console (F12)
2. Look for detailed error messages
3. Check if you have a sender or provider profile

### Test Mode Checkbox Missing
**Problem**: Don't see checkbox in dialog  
**Solution**: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

---

## ✅ What to Verify

### For Banks (Senders):
- [ ] Can create test API key with checkbox checked
- [ ] Key starts with `np_test_`
- [ ] Can create payment order with test key
- [ ] Order has `testMode: true` in response
- [ ] Order auto-confirms instantly
- [ ] See mock transaction hash

### For PSPs (Providers):
- [ ] Can create test API key
- [ ] Can view test orders in queue
- [ ] Can fulfill test orders
- [ ] Commissions calculated correctly
- [ ] Test balance shows $50,000

---

## 📊 Test Checklist

```
✅ Database migration applied
✅ Can access settings page
✅ Can click "Create API Key"
✅ See "Test Mode" checkbox
✅ Can enter key name
✅ Can create test key (np_test_*)
✅ Can copy API key
✅ Can use key in API request
✅ Payment order creation works
✅ Order returns testMode: true
✅ Order has mock transaction data
✅ No real blockchain transaction
```

---

## 🚀 Next Steps After Testing

Once tests pass:

1. **Create Live API Key**:
   - Uncheck "Test Mode" checkbox
   - Get `np_live_*` key
   - Use for production

2. **Read Documentation**:
   - See `SANDBOX_GUIDE.md` for complete reference
   - Understand test vs live differences

3. **Integrate into App**:
   - Use test key during development
   - Switch to live key for production
   - Never commit keys to git

---

## 💡 Quick Test (No Script Required)

### Test 1: API Key Generation
```bash
# Replace USER_ID with your actual ID
curl -X POST https://nedapay-plus.vercel.app/api/generate-api-key \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_ID" \
  -d '{"keyName":"Test","isTest":true,"regenerate":true}'
```

### Test 2: Payment Order
```bash
# Replace API_KEY with the key from Test 1
curl -X POST https://nedapay-plus.vercel.app/api/v1/payment-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"fromCurrency":"TZS","toCurrency":"CNY","amount":1000000,"recipientDetails":{"accountNumber":"123","accountName":"Test","institution":"Bank"}}'
```

---

## 📝 Notes

- **Test Mode Default**: Checkbox is checked by default for safety
- **Regeneration**: Keys auto-regenerate if they already exist
- **Data Isolation**: Test orders are completely separate from live
- **No Costs**: Test mode has zero blockchain fees
- **Instant**: Test transactions confirm immediately

---

## ❓ Get Help

If tests fail:
1. Check browser console for errors
2. Verify you completed onboarding
3. Ensure user has sender_profile or provider_profile
4. Check that database migration succeeded
5. Review API response error messages

---

**Ready to test?** Start with the browser method (easiest) or use the test script for automation!
