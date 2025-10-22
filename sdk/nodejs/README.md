# NedaPay Node.js SDK

Official Node.js SDK for integrating NedaPay cross-border payment infrastructure.

## Installation

```bash
npm install @nedapay/node
# or
yarn add @nedapay/node
```

## Quick Start

```typescript
import { NedaPay } from '@nedapay/node';

// Initialize with your API key
const nedapay = new NedaPay('sk_live_your_api_key');

// Create a payment order
const order = await nedapay.paymentOrders.create({
  fromCurrency: 'TZS',
  toCurrency: 'CNY',
  amount: 50000,
  recipientDetails: {
    name: 'Beijing Trading Co',
    accountNumber: '6214********1234',
    bankCode: 'ICBCCNBJ'
  },
  reference: 'INV-2024-001'
});

console.log('Payment order created:', order.orderId);
```

## Authentication

Get your API keys from the [NedaPay Dashboard](https://app.nedapay.com/settings/api-keys).

```typescript
// Test environment
const nedapay = new NedaPay('sk_test_...');

// Production environment
const nedapay = new NedaPay('sk_live_...');
```

## API Reference

### Payment Orders

#### Create Payment Order

Submit a new cross-border payment request:

```typescript
const order = await nedapay.paymentOrders.create({
  fromCurrency: 'TZS',        // Source currency
  toCurrency: 'CNY',          // Destination currency
  amount: 50000,              // Amount in source currency
  recipientDetails: {
    name: 'Recipient Name',
    accountNumber: '1234567890',
    bankCode: 'ICBCCNBJ',     // Optional
    address: 'Full address'    // Optional
  },
  reference: 'YOUR_REF',      // Optional: Your internal reference
  webhookUrl: 'https://...'   // Optional: Override default webhook
});

// Response
{
  orderId: 'order_abc123...',
  status: 'pending',
  fromAmount: 50000,
  fromCurrency: 'TZS',
  toAmount: 122.50,
  toCurrency: 'CNY',
  exchangeRate: 0.00245,
  bankMarkup: 0.25,
  estimatedCompletion: '2025-10-22T15:30:00Z',
  createdAt: '2025-10-22T14:00:00Z'
}
```

#### List Payment Orders

Get your payment orders:

```typescript
const { orders, count } = await nedapay.paymentOrders.list({
  limit: 20,                  // Optional: default 20
  status: 'completed'         // Optional: filter by status
});

console.log(`Found ${count} orders`);
orders.forEach(order => {
  console.log(`${order.orderId}: ${order.status}`);
});
```

#### Get Payment Order

Retrieve a specific order by ID:

```typescript
const { order } = await nedapay.paymentOrders.retrieve('order_abc123...');

console.log('Order status:', order.status);
console.log('Transaction hash:', order.txHash);
```

#### Update Payment Order (PSP Only)

PSPs can update order status:

```typescript
const { order } = await nedapay.paymentOrders.update('order_abc123...', {
  status: 'completed',
  txHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  networkUsed: 'hedera-testnet'
});
```

## Webhooks

### Handling Webhooks

Set up a webhook endpoint to receive real-time updates:

```typescript
import express from 'express';
import { NedaPay } from '@nedapay/node';

const app = express();

app.post('/nedapay/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body.toString();
  
  // Verify webhook signature
  const isValid = NedaPay.verifyWebhookSignature(
    payload,
    signature,
    process.env.NEDAPAY_WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  // Handle webhook events
  switch (event.event) {
    case 'payment.completed':
      console.log('Payment completed:', event.orderId);
      // Update your database
      break;
      
    case 'payment.failed':
      console.log('Payment failed:', event.orderId);
      // Handle failure
      break;
  }
  
  res.status(200).send('OK');
});

app.listen(3000);
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `payment.pending` | Payment order created |
| `payment.processing` | PSP is processing the payment |
| `payment.completed` | Payment successfully delivered |
| `payment.failed` | Payment failed |

### Webhook Payload

```json
{
  "event": "payment.completed",
  "orderId": "order_abc123...",
  "status": "completed",
  "fromAmount": 50000,
  "fromCurrency": "TZS",
  "toAmount": 122.50,
  "toCurrency": "CNY",
  "bankMarkup": 0.25,
  "txHash": "0x742d35Cc...",
  "completedAt": "2025-10-22T15:25:00Z",
  "reference": "INV-2024-001",
  "timestamp": "2025-10-22T15:25:01Z"
}
```

## Error Handling

The SDK throws `NedaPayError` for API errors:

```typescript
import { NedaPay, NedaPayError } from '@nedapay/node';

try {
  const order = await nedapay.paymentOrders.create({...});
} catch (error) {
  if (error instanceof NedaPayError) {
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `invalid_request` | Missing or invalid parameters |
| 401 | `invalid_api_key` | API key is invalid or inactive |
| 403 | `forbidden` | Not authorized for this operation |
| 404 | `not_found` | Resource not found |
| 503 | `no_available_psps` | No PSPs available for this corridor |

## Configuration

```typescript
const nedapay = new NedaPay('sk_live_...', {
  baseUrl: 'https://api.nedapay.com',  // Optional: custom API base URL
  timeout: 30000                        // Optional: request timeout in ms
});
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import { 
  NedaPay, 
  PaymentOrder, 
  CreatePaymentOrderRequest,
  NedaPayError 
} from '@nedapay/node';
```

## Support

- **Documentation**: https://docs.nedapay.com
- **Dashboard**: https://app.nedapay.com
- **Email**: support@nedapay.com

## License

MIT
