# NedaPay API Testing Guide
Complete guide for testing both Sender (Bank) and Provider (PSP) workflows

---

## 🏦 SENDER (BANK) TESTING

### Step 1: Generate Test API Key

```bash
curl -X POST https://nedapay-plus.vercel.app/api/generate-api-key \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SENDER_USER_ID" \
  -d '{
    "keyName": "Bank Test Key",
    "isTest": true,
    "regenerate": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "apiKey": "np_test_48characters...",
  "keyId": "uuid",
  "type": "test",
  "message": "API key generated successfully."
}
```

**Save the `apiKey` value - you'll need it for all subsequent requests!**

---

### Step 2: Create a Test Payment Order

```bash
curl -X POST https://nedapay-plus.vercel.app/api/v1/payment-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer np_test_YOUR_KEY_HERE" \
  -d '{
    "fromCurrency": "TZS",
    "toCurrency": "CNY",
    "amount": 1000000,
    "recipientDetails": {
      "accountNumber": "622848123456789",
      "accountName": "Beijing Trading Company",
      "institution": "Industrial & Commercial Bank of China"
    },
    "reference": "INV-2025-001"
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
  "exchangeRate": 0.00245,
  "bankMarkup": 4.9,
  "estimatedCompletion": "2025-10-27T10:00:00.000Z",
  "createdAt": "2025-10-27T10:00:00.000Z",
  "reference": "INV-2025-001",
  "testMode": true,
  "testData": {
    "txHash": "0x7f9fade1c0532925...",
    "network": "hedera-testnet",
    "message": "This is a test transaction. No real funds were moved."
  }
}
```

**✅ Success Indicators:**
- `testMode: true`
- `status: "confirmed"` (instant in test mode)
- `testData` object present
- `orderId` starts with `test_order_`

---

### Step 3: List Your Payment Orders

```bash
curl -X GET "https://nedapay-plus.vercel.app/api/v1/payment-orders?limit=10&offset=0" \
  -H "Authorization: Bearer np_test_YOUR_KEY_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "orders": [
    {
      "orderId": "test_order_1729756800_abc123",
      "status": "confirmed",
      "fromAmount": 1000000,
      "toAmount": 2450,
      "exchangeRate": 0.00245,
      "bankMarkup": 4.9,
      "platformFee": 0.5,
      "reference": "INV-2025-001",
      "recipient": {
        "account_name": "Beijing Trading Company",
        "account_identifier": "622848123456789",
        "institution": "Industrial & Commercial Bank of China",
        "memo": null
      },
      "token": "USDC",
      "createdAt": "2025-10-27T10:00:00.000Z",
      "updatedAt": "2025-10-27T10:00:00.000Z",
      "txHash": "0x7f9fade...",
      "network": "hedera-testnet",
      "testMode": true
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

---

## 💰 PROVIDER (PSP) TESTING

### Step 1: Generate Test API Key

```bash
curl -X POST https://nedapay-plus.vercel.app/api/generate-api-key \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PROVIDER_USER_ID" \
  -d '{
    "keyName": "PSP Test Key",
    "isTest": true,
    "regenerate": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "apiKey": "np_test_48characters...",
  "keyId": "uuid",
  "type": "test"
}
```

---

### Step 2: Try Creating Payment Order (Should FAIL)

```bash
curl -X POST https://nedapay-plus.vercel.app/api/v1/payment-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer np_test_YOUR_PROVIDER_KEY" \
  -d '{
    "fromCurrency": "TZS",
    "toCurrency": "CNY",
    "amount": 1000000,
    "recipientDetails": {...}
  }'
```

**Expected Response (403 Error):**
```json
{
  "success": false,
  "error": "Only banks can create payment orders"
}
```

**✅ This is correct!** Providers don't create orders - they fulfill them.

---

### Step 3: View Assigned Orders

```bash
curl -X GET "https://nedapay-plus.vercel.app/api/v1/payment-orders?limit=20" \
  -H "Authorization: Bearer np_test_YOUR_PROVIDER_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "orders": [
    {
      "orderId": "test_order_1729756800_xyz",
      "status": "pending",
      "fromAmount": 1000000,
      "toAmount": 2450,
      "amountInUsd": 2450,
      "exchangeRate": 0.00245,
      "pspCommission": 7.35,
      "platformFee": 0.5,
      "reference": "INV-2025-001",
      "recipient": {
        "account_name": "Beijing Trading Company",
        "account_identifier": "622848123456789",
        "institution": "Industrial & Commercial Bank of China",
        "memo": null
      },
      "senderEmail": "bank@example.com",
      "token": "USDC",
      "createdAt": "2025-10-27T10:00:00.000Z",
      "updatedAt": "2025-10-27T10:00:00.000Z",
      "txHash": null,
      "network": null,
      "testMode": true,
      "percentSettled": 0,
      "needsFulfillment": true
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  },
  "summary": {
    "totalEarnings": 7.35,
    "pendingOrders": 1,
    "completedOrders": 0
  }
}
```

**✅ Success Indicators:**
- `pspCommission` shows what you'll earn
- `needsFulfillment: true` for pending orders
- `summary` shows aggregate earnings
- Only see orders assigned to your PSP

---

## 📊 COMPARISON: SENDER VS PROVIDER

| Feature | Sender (Bank) | Provider (PSP) |
|---------|---------------|----------------|
| **Create Orders** | ✅ YES | ❌ NO (403) |
| **View Orders** | ✅ Their submitted orders | ✅ Orders assigned to them |
| **Revenue Field** | `bankMarkup` | `pspCommission` |
| **See Recipient** | ✅ YES | ✅ YES |
| **See Sender Email** | N/A | ✅ YES |
| **Fulfillment Status** | ❌ NO | ✅ YES (`percentSettled`, `needsFulfillment`) |
| **Summary Stats** | ❌ NO | ✅ YES (`totalEarnings`, `pendingOrders`) |

---

## 🔍 TESTING CHECKLIST

### For Senders (Banks):
- [ ] Can generate test API key (`np_test_*`)
- [ ] Can create payment order with test key
- [ ] Order has `testMode: true`
- [ ] Order auto-confirms (status: "confirmed")
- [ ] Can list orders they created
- [ ] See `bankMarkup` in response
- [ ] Orders filtered by test mode

### For Providers (PSPs):
- [ ] Can generate test API key (`np_test_*`)
- [ ] Cannot create payment order (403 error)
- [ ] Can list orders assigned to them
- [ ] See `pspCommission` in response
- [ ] See `needsFulfillment` flag
- [ ] See sender email for coordination
- [ ] Get summary stats (earnings, pending, completed)
- [ ] Orders filtered by test mode

---

## 🚀 QUERY PARAMETERS

### Pagination:
```bash
GET /api/v1/payment-orders?limit=50&offset=0
```
- `limit`: Number of orders per page (default: 50)
- `offset`: Starting position (default: 0)
- Returns `hasMore: true` if more orders available

### Filter by Status:
```bash
GET /api/v1/payment-orders?status=pending
GET /api/v1/payment-orders?status=confirmed
GET /api/v1/payment-orders?status=failed
```

---

## ⚠️ IMPORTANT NOTES

### Test Mode Isolation:
- Test API keys (`np_test_*`) only see test orders
- Live API keys (`np_live_*`) only see live orders
- **No mixing of test and live data**

### Expected Errors:

**401 Unauthorized**
```json
{ "success": false, "error": "Unauthorized" }
```
→ Missing or invalid API key

**403 Forbidden** (Provider trying to create order)
```json
{ "success": false, "error": "Only banks can create payment orders" }
```
→ Correct behavior for PSPs

**400 Bad Request** (Missing profile)
```json
{
  "error": "Please complete your profile setup first",
  "details": "You need to complete either sender (bank) or provider (PSP) onboarding"
}
```
→ Complete onboarding first

---

## 💡 NEXT STEPS

### After Testing Both Flows:

1. **Deploy to Production**
   ```bash
   git push origin main
   vercel --prod
   ```

2. **Test in Production**
   - Create test API keys for both user types
   - Run through both workflows
   - Verify data isolation

3. **Create Live Keys**
   - Uncheck "Test Mode" checkbox
   - Generate `np_live_*` keys
   - Use for real transactions

4. **Monitor Logs**
   - Check Vercel function logs
   - Watch for console output
   - Track test vs live usage

---

## 📚 SUMMARY

**Status**: ✅ **FULLY FUNCTIONAL (Not Yet Deployed)**

✅ **Working Features:**
- API key generation for both senders and providers
- Test mode detection and data isolation
- Payment order creation (senders only)
- Payment order listing (both with different views)
- Mock blockchain service
- Pagination and filtering
- Revenue tracking (bankMarkup, pspCommission)
- Test balance management

🚀 **Ready to Deploy!**
