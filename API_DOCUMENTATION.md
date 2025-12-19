# NedaPay Plus API Documentation

## Overview

NedaPay Plus provides a simple, powerful API for **stablecoin-to-fiat off-ramp** services. Perfect for crypto exchanges, Web3 companies, and fintech platforms that need to convert USDC/USDT to local fiat currencies.

**Base URL:** `https://api.nedapayplus.xyz`  
**Authentication:** API Key (Bearer token)  
**Format:** JSON

---

## Authentication

All API requests require authentication using an API key.

### Getting Your API Key

1. Sign up at [nedapayplus.xyz](https://nedapayplus.xyz)
2. Complete KYB verification
3. Go to Settings → API Keys
4. Generate a new API key
5. **Test Mode**: Toggle to get separate test keys
6. **Production**: Use live keys for real transactions

### Using Your API Key

Include your API key in the `Authorization` header of all requests:

\`\`\`bash
Authorization: Bearer your_api_key_here
\`\`\`

### Test Mode vs Production

- **Test Mode**: No real funds moved, instant mock transactions
- **Production**: Real USDC sent, real fiat delivered

---

## Endpoints

### 1. Create Off-Ramp Order

Convert USDC/USDT to local fiat currency and deliver to recipient bank account.

**Endpoint:** `POST /api/v1/payment-orders`

**Request:**

\`\`\`bash
curl -X POST https://api.nedapayplus.xyz/api/v1/payment-orders \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100,
    "token": "USDC",
    "toCurrency": "NGN",
    "recipientDetails": {
      "bankCode": "GTB",
      "accountNumber": "0123456789",
      "accountName": "John Doe",
      "memo": "Payment for services"
    },
    "reference": "YOUR-REF-123",
    "webhookUrl": "https://yourapp.com/webhooks/nedapay"
  }'
\`\`\`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | USDC/USDT amount to convert |
| `token` | string | No | "USDC" or "USDT" (default: USDC) |
| `toCurrency` | string | Yes | Destination currency code |
| `recipientDetails` | object | Yes | Recipient bank information |
| `recipientDetails.bankCode` | string | Yes | Bank/institution code |
| `recipientDetails.accountNumber` | string | Yes | Recipient account number |
| `recipientDetails.accountName` | string | Yes | Account holder name |
| `recipientDetails.memo` | string | No | Payment memo/reference |
| `reference` | string | No | Your internal reference ID |
| `webhookUrl` | string | No | URL for status updates |

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

**Response (Error):**

\`\`\`json
{
  "success": false,
  "error": "Currency UGX not supported",
  "supportedCurrencies": ["NGN", "KES", "UGX", "TZS", "GHS", "MWK", "XOF", "INR", "BRL"]
}
\`\`\`

---

### 2. Get Order Status

Check the status of an existing off-ramp order.

**Endpoint:** `GET /api/v1/payment-orders/{orderId}`

**Request:**

\`\`\`bash
curl -X GET https://api.nedapayplus.xyz/api/v1/payment-orders/offramp_1234567890_abc \\
  -H "Authorization: Bearer your_api_key_here"
\`\`\`

**Response:**

\`\`\`json
{
  "success": true,
  "order": {
    "orderId": "offramp_1234567890_abc",
    "status": "completed",
    "fromAmount": 100,
    "fromCurrency": "USDC",
    "toAmount": 158050,
    "toCurrency": "NGN",
    "exchangeRate": 1580.50,
    "fees": {
      "totalFees": 3.03
    },
    "blockchain": {
      "network": "base",
      "transactionHash": "0xabc...def"
    },
    "createdAt": "2024-11-29T12:20:00Z",
    "completedAt": "2024-11-29T12:22:00Z",
    "reference": "YOUR-REF-123"
  }
}
\`\`\`

---

### 3. List Orders

Get a list of your off-ramp orders.

**Endpoint:** `GET /api/v1/payment-orders`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Number of orders to return |
| `offset` | integer | 0 | Pagination offset |
| `status` | string | - | Filter by status (pending, processing, completed, failed) |

**Request:**

\`\`\`bash
curl -X GET "https://api.nedapayplus.xyz/api/v1/payment-orders?limit=10&status=completed" \\
  -H "Authorization: Bearer your_api_key_here"
\`\`\`

**Response:**

\`\`\`json
{
  "success": true,
  "orders": [
    {
      "orderId": "offramp_1234567890_abc",
      "status": "completed",
      "fromAmount": 100,
      "toAmount": 158050,
      "toCurrency": "NGN",
      "createdAt": "2024-11-29T12:20:00Z",
      "completedAt": "2024-11-29T12:22:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
\`\`\`

---

## Webhooks

Receive real-time updates when order status changes.

### Configuring Webhooks

1. Provide `webhookUrl` in your order request
2. Or configure default webhook URL in dashboard Settings

### Webhook Payload

We'll POST to your webhook URL when order status changes:

\`\`\`json
{
  "event": "payment.completed",
  "orderId": "offramp_1234567890_abc",
  "status": "completed",
  "fromAmount": 100,
  "fromCurrency": "USDC",
  "toAmount": 158050,
  "toCurrency": "NGN",
  "txHash": "0xabc...def",
  "networkUsed": "base",
  "completedAt": "2024-11-29T12:22:00Z",
  "reference": "YOUR-REF-123",
  "timestamp": "2024-11-29T12:22:05Z"
}
\`\`\`

### Webhook Events

| Event | Description |
|-------|-------------|
| `payment.pending` | Order created, awaiting processing |
| `payment.processing` | USDC sent, converting to fiat |
| `payment.completed` | Fiat delivered to recipient ✅ |
| `payment.failed` | Order failed (with failure reason) ❌ |

### Verifying Webhooks

1. Check the timestamp is recent (within 5 minutes)
2. Verify the orderId exists in your system
3. Return HTTP 200 to acknowledge receipt
4. Retry logic: We'll retry up to 3 times with exponential backoff

**Example Webhook Handler (Node.js):**

\`\`\`javascript
app.post('/webhooks/nedapay', async (req, res) => {
  const { event, orderId, status, reference } = req.body;
  
  // Update your database
  await db.orders.update({
    where: { id: reference },
    data: { 
      nedapayStatus: status,
      updatedAt: new Date()
    }
  });
  
  // Acknowledge receipt
  res.status(200).json({ received: true });
});
\`\`\`

---

## Supported Currencies

## Supported Coverage (Countries + Chains)

For the always-up-to-date, canonical list, see:

- `SUPPORTED_COVERAGE.md` in this repository
- `GET /api/v1/currencies` (supported payout currencies)
- `GET /api/networks` (enabled blockchain networks)

### Destination Currencies (Fiat)

To retrieve supported payout destinations, call:

```http
GET /api/v1/currencies
```

Response shape (example):

```json
{
  "success": true,
  "currencies": [
    { "code": "NGN", "name": "Nigerian Naira", "country": "Nigeria", "flag": "🇳🇬" }
  ],
  "count": 1
}
```

### Source Tokens

- **USDC** (USD Coin) - Recommended
- **USDT** (Tether USD)

### Blockchain Networks

To retrieve enabled settlement networks, call:

```http
GET /api/networks
```

Response shape (example):

```json
{
  "networks": [
    {
      "id": "1",
      "identifier": "base-sepolia",
      "network_type": "evm",
      "priority": 2,
      "is_testnet": true,
      "is_enabled": true,
      "fee": 0.03
    }
  ]
}
```

---

## Rate Limiting

- **Rate Limit**: 100 requests per minute per API key
- **Burst**: Up to 10 requests per second

**Response Headers:**

\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701264120
\`\`\`

**Error Response (Rate Limit Exceeded):**

\`\`\`json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
\`\`\`

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Order doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Contact support |
| 503 | Service Unavailable - Temporary issue |

### Error Response Format

\`\`\`json
{
  "success": false,
  "error": "Human-readable error message",
  "details": "Additional technical details (optional)",
  "code": "ERROR_CODE"
}
\`\`\`

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid API key` | Wrong or expired key | Generate new key in dashboard |
| `Currency not supported` | Unsupported destination currency | Check supported currencies list |
| `Invalid recipient details` | Missing or invalid bank info | Verify account number and bank code |
| `Insufficient balance` | Not enough USDC in your wallet | Fund your wallet with USDC |
| `Order expired` | Order validity period elapsed | Create a new order |

---

## Best Practices

### 1. Handle Webhooks Idempotently

Process the same webhook multiple times without side effects:

\`\`\`javascript
// Good: Use reference or orderId as idempotency key
const existingUpdate = await db.statusUpdates.findUnique({
  where: { orderId_status: { orderId, status } }
});

if (!existingUpdate) {
  await db.orders.update({ ... });
}
\`\`\`

### 2. Store Order IDs

Always store the `orderId` returned from create order API:

\`\`\`javascript
const response = await createOrder({ ... });
await db.orders.create({
  id: yourInternalId,
  nedapayOrderId: response.orderId, // Store this!
  status: 'pending'
});
\`\`\`

### 3. Use Reference Field

Track orders with your internal ID:

\`\`\`javascript
const order = await createOrder({
  amount: 100,
  reference: 'USER-123-WITHDRAWAL-456', // Your internal ID
  ...
});
\`\`\`

### 4. Handle Test Mode Properly

Use separate API keys for test and production:

\`\`\`javascript
const apiKey = process.env.NODE_ENV === 'production' 
  ? process.env.NEDAPAY_LIVE_KEY 
  : process.env.NEDAPAY_TEST_KEY;
\`\`\`

### 5. Implement Retry Logic

Retry failed requests with exponential backoff:

\`\`\`javascript
async function createOrderWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await createOrder(data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
\`\`\`

---

## SDK & Code Examples

### JavaScript/TypeScript

\`\`\`typescript
import axios from 'axios';

const nedapay = axios.create({
  baseURL: 'https://api.nedapayplus.xyz',
  headers: {
    'Authorization': \`Bearer \${process.env.NEDAPAY_API_KEY}\`,
    'Content-Type': 'application/json'
  }
});

// Create off-ramp order
async function createOfframpOrder() {
  try {
    const response = await nedapay.post('/api/v1/payment-orders', {
      amount: 100,
      token: 'USDC',
      toCurrency: 'NGN',
      recipientDetails: {
        bankCode: 'GTB',
        accountNumber: '0123456789',
        accountName: 'John Doe'
      },
      reference: 'ORDER-123'
    });
    
    console.log('Order created:', response.data.orderId);
    console.log('Status:', response.data.status);
    console.log('TX Hash:', response.data.blockchain.transactionHash);
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Check order status
async function checkOrderStatus(orderId: string) {
  const response = await nedapay.get(\`/api/v1/payment-orders/\${orderId}\`);
  return response.data.order;
}
\`\`\`

### Python

\`\`\`python
import requests
import os

NEDAPAY_API_KEY = os.getenv('NEDAPAY_API_KEY')
BASE_URL = 'https://api.nedapayplus.xyz'

def create_offramp_order():
    response = requests.post(
        f'{BASE_URL}/api/v1/payment-orders',
        headers={
            'Authorization': f'Bearer {NEDAPAY_API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'amount': 100,
            'token': 'USDC',
            'toCurrency': 'NGN',
            'recipientDetails': {
                'bankCode': 'GTB',
                'accountNumber': '0123456789',
                'accountName': 'John Doe'
            },
            'reference': 'ORDER-123'
        }
    )
    
    response.raise_for_status()
    return response.json()

def check_order_status(order_id):
    response = requests.get(
        f'{BASE_URL}/api/v1/payment-orders/{order_id}',
        headers={'Authorization': f'Bearer {NEDAPAY_API_KEY}'}
    )
    return response.json()['order']
\`\`\`

---

## Testing

### Sandbox Environment

Use sandbox for testing without real funds:

1. Generate **test API key** in dashboard
2. Orders process instantly (mock transactions)
3. No real USDC sent
4. No real fiat delivered

**Sandbox URL:** Same as production  
**Test Mode:** Automatically detected from API key

### Test Scenarios

**1. Successful Order:**
\`\`\`json
{
  "amount": 10,
  "token": "USDC",
  "toCurrency": "NGN",
  "recipientDetails": {
    "bankCode": "GTB",
    "accountNumber": "0123456789",
    "accountName": "Test User"
  }
}
\`\`\`

**2. Invalid Currency:**
\`\`\`json
{
  "amount": 10,
  "token": "USDC",
  "toCurrency": "ZAR" // Not supported
}
\`\`\`

**3. Invalid Bank Details:**
\`\`\`json
{
  "recipientDetails": {
    "bankCode": "INVALID",
    "accountNumber": "123" // Too short
  }
}
\`\`\`

---

## Support

### Documentation
- **API Docs**: [nedapayplus.xyz/docs](https://nedapayplus.xyz/docs)
- **Integration Guide**: See `PAYCREST_INTEGRATION_GUIDE.md`
- **Quick Start**: See `PAYCREST_QUICK_START.md`

### Contact
- **Email**: support@nedapay.com
- **Discord**: [discord.gg/nedapay](https://discord.gg/nedapay)
- **Status**: [status.nedapayplus.xyz](https://status.nedapayplus.xyz)

### Response Times
- **Critical Issues**: < 1 hour
- **General Support**: < 24 hours
- **Feature Requests**: < 1 week

---

## Changelog

### v1.0.0 (November 2024)
- Initial release
- USDC/USDT off-ramp to 9 currencies
- Base chain integration
- Webhook support
- Test mode

### Upcoming
- Hedera network integration (lower fees)
- Batch payments
- Scheduled/recurring payments
- More currencies

---

**Ready to integrate?** Get your API key at [nedapayplus.xyz](https://nedapayplus.xyz)
