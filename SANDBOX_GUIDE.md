# NedaPay Sandbox Testing Guide

## Overview

The NedaPay platform includes a complete sandbox environment that allows banks (senders) and PSPs (providers) to test all platform functionality without risking real money or making actual blockchain transactions.

## Key Benefits

### For Banks (Senders)
- Test API integration without real funds
- Validate payment workflows end-to-end
- Debug webhook implementations safely
- Train developers in a risk-free environment
- Test error handling and edge cases
- Unlimited test balance ($10,000 USD equivalent)

### For PSPs (Providers)
- Practice order fulfillment workflows
- Test commission calculations
- Validate multi-chain routing
- Simulate treasury management
- Test different scenarios (failures, delays, etc.)
- Generous test balance ($50,000 USD equivalent)

---

## How It Works

### Test vs Live Mode

NedaPay uses **API key prefixes** to determine the environment:

```
np_test_...  → Sandbox/Test Mode
np_live_...  → Production/Live Mode
```

**All operations are automatically isolated based on the API key used.**

---

## Getting Started

### Step 1: Create a Test API Key

1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Enter a name (e.g., "Development Testing")
4. **Check the "Test Mode" checkbox** (if available in UI)
5. OR use the API with `isTest: true`:

```typescript
POST /api/generate-api-key
{
  "keyName": "My Test Key",
  "isTest": true
}
```

6. Copy and save your test API key (starts with `np_test_`)

### Step 2: Use Test API Key in Your Code

```typescript
const apiKey = 'np_test_48charsofhexadecimal...';

const response = await fetch('https://nedapay-plus.vercel.app/api/v1/payment-orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    fromCurrency: 'TZS',
    toCurrency: 'CNY',
    amount: 1000000, // 1M TZS
    recipientDetails: {
      accountNumber: '1234567890',
      accountName: 'Test Recipient',
      institution: 'Test Bank'
    },
    reference: 'TEST-001'
  })
});
```

### Step 3: Verify Test Mode Response

Test mode responses include a `testMode` flag and `testData`:

```json
{
  "success": true,
  "orderId": "test_order_1729756800000_abc123",
  "status": "confirmed",
  "fromAmount": 1000000,
  "fromCurrency": "TZS",
  "toAmount": 2450,
  "toCurrency": "CNY",
  "testMode": true,
  "testData": {
    "txHash": "0x1234...5678",
    "network": "hedera-testnet",
    "message": "This is a test transaction. No real funds were moved."
  }
}
```

---

## What's Different in Test Mode

### 1. Instant Confirmations
- No waiting for blockchain confirmations
- Orders auto-confirm immediately
- Perfect for rapid testing

### 2. Mock Blockchain Transactions
- No real gas fees charged
- Generates realistic mock transaction hashes
- Simulates Hedera format: `0.0.123@timestamp`
- Simulates EVM format: `0x...`

### 3. Test Balances
- **Banks**: $10,000 USD test balance
- **PSPs**: $50,000 USD test balance
- Balances don't decrease (unlimited testing)
- Reset anytime via API

### 4. Data Isolation
- Test orders NEVER mix with live orders
- Separate dashboards/analytics
- Test transactions clearly marked
- Can be bulk deleted

### 5. No Real Money
- Zero blockchain fees
- No actual USDC transferred
- No fiat clearance needed
- Risk-free environment

---

## Test Mode Features

### For Banks (Senders)

#### Create Test Payment Order
```typescript
POST /api/v1/payment-orders
Authorization: Bearer np_test_...

{
  "fromCurrency": "TZS",
  "toCurrency": "CNY",
  "amount": 1000000,
  "recipientDetails": {
    "accountNumber": "9876543210",
    "accountName": "Test Corp",
    "institution": "Industrial Bank of China"
  }
}
```

#### Response (Test Mode)
```json
{
  "success": true,
  "orderId": "test_order_1729756800000_xyz789",
  "status": "confirmed",  // ← Auto-confirmed!
  "estimatedCompletion": "2025-10-24T10:00:00.000Z",  // ← Instant!
  "testMode": true,
  "testData": {
    "txHash": "0x7f9fade...abc123",
    "network": "hedera-testnet"
  }
}
```

### For PSPs (Providers)

#### View Test Orders
```typescript
GET /api/v1/payment-orders
Authorization: Bearer np_test_...
```

Only returns test orders if using test API key.

#### Fulfill Test Order
```typescript
POST /api/v1/payment-orders/{orderId}/fulfill
Authorization: Bearer np_test_...

{
  "fulfillmentDetails": {
    "txHash": "mock_tx_12345",
    "completedAt": "2025-10-24T10:05:00Z"
  }
}
```

---

## Testing Scenarios

### 1. Happy Path
Test successful payment flow from creation to completion.

### 2. Webhook Delivery
Configure webhook URL and verify events are received:
```json
{
  "event": "order.confirmed",
  "orderId": "test_order_...",
  "testMode": true
}
```

### 3. Error Handling
Test API returns proper errors for invalid input.

### 4. Rate Limiting
Verify rate limits work (test mode has higher limits).

### 5. Commission Calculations
Validate markup and commission amounts are correct.

---

## Best Practices

### DO's ✅
- Always use test keys for development
- Test all edge cases in sandbox
- Validate webhook signatures
- Check error responses
- Document your integration
- Move to live keys only when fully tested

### DON'Ts ❌
- **Never** use live keys in test code
- **Never** commit API keys to git
- **Never** mix test and live transactions
- **Never** assume test behavior = live behavior
- **Never** test with real customer data

---

## Switching to Production

### Checklist Before Going Live

- [ ] All tests pass in sandbox
- [ ] Webhooks working correctly
- [ ] Error handling implemented
- [ ] KYB verification completed
- [ ] Treasury wallets configured
- [ ] Generate **live API key** (`np_live_...`)
- [ ] Update environment variables
- [ ] Monitor first live transactions closely

### Generate Live API Key

```typescript
POST /api/generate-api-key
{
  "keyName": "Production API Key",
  "isTest": false  // ← Important!
}
```

You'll receive `np_live_...` key.

---

## Troubleshooting

### "Invalid API key"
- Check key starts with `np_test_` or `np_live_`
- Verify key hasn't been revoked
- Ensure key is for correct environment

### "Cannot mix test and live data"
- Using test key with live order ID (or vice versa)
- Generate separate keys for each environment

### Test orders not showing
- Verify using test API key (`np_test_...`)
- Check you're filtering for test mode in UI
- Test orders are isolated from live view

---

## API Reference

### Headers Required

```
Authorization: Bearer {api_key}
Content-Type: application/json
```

### Test Mode Detection

Automatically detected from API key prefix:
- `np_test_*` → Test Mode ON
- `np_live_*` → Test Mode OFF

### Response Fields

All responses in test mode include:
```json
{
  "testMode": true,
  "testData": {
    "txHash": "...",
    "network": "...",
    "message": "..."
  }
}
```

---

## Support

### Need Help?
- **Email**: support@nedapay.com
- **Documentation**: `/protected/docs`
- **Status Page**: Check platform status

### Report Issues
If you find bugs in sandbox mode, please report with:
1. API key type (test/live)
2. Request/response logs
3. Expected vs actual behavior
4. Steps to reproduce

---

## Summary

The NedaPay sandbox provides a **complete, isolated, risk-free environment** for testing cross-border payment infrastructure. Use test API keys (`np_test_...`) to:

✅ Validate integrations safely  
✅ Practice workflows without risk  
✅ Debug issues efficiently  
✅ Train team members  
✅ Test edge cases  

When ready, switch to live keys (`np_live_...`) for production transactions.

**Happy Testing!** 🧪
