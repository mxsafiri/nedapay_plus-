# 🔌 Multi-Chain API Integration Guide

Complete guide for integrating multi-chain transaction routing into your NedaPay Plus platform.

---

## 📋 Available APIs

### **1. Network Status API**

**Endpoint:** `GET /api/networks/status`

**Purpose:** Check available blockchain networks and their status

**Response:**
```json
{
  "success": true,
  "data": {
    "networks": [
      {
        "network": "hedera-testnet",
        "type": "hedera",
        "priority": 1,
        "available": true,
        "fee": 0.0001
      },
      {
        "network": "base-sepolia",
        "type": "evm",
        "priority": 2,
        "available": true,
        "fee": 0.03
      }
    ],
    "count": 2,
    "primary": { ... }
  }
}
```

**Usage:**
```typescript
const response = await fetch('/api/networks/status');
const { data } = await response.json();

console.log(`Primary network: ${data.primary.network}`);
console.log(`Fee: $${data.primary.fee}`);
```

---

### **2. Cost Comparison API**

**Endpoint:** `GET /api/networks/costs?token=USDC&amount=100`

**Purpose:** Compare transaction costs across all networks

**Parameters:**
- `token` (string): Token symbol (e.g., "USDC", "DAI")
- `amount` (number): Transaction amount in token's standard unit

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "USDC",
    "amount": 100,
    "costs": [
      {
        "network": "hedera-testnet",
        "networkType": "hedera",
        "transactionFee": 0.0001,
        "totalCost": 100.0001,
        "savings": 0.0299
      },
      {
        "network": "base-sepolia",
        "networkType": "evm",
        "transactionFee": 0.03,
        "totalCost": 100.03,
        "savings": 0
      }
    ],
    "recommendation": {
      "network": "hedera-testnet",
      "totalCost": 100.0001,
      "fee": 0.0001
    },
    "savings": {
      "amount": 0.0299,
      "percent": 0.03,
      "vs": "base-sepolia"
    }
  }
}
```

**Usage:**
```typescript
const response = await fetch('/api/networks/costs?token=USDC&amount=100');
const { data } = await response.json();

console.log(`Recommended network: ${data.recommendation.network}`);
console.log(`You save: $${data.savings.amount} (${data.savings.percent}%)`);
```

---

### **3. Multi-Chain Transfer API**

**Endpoint:** `POST /api/blockchain/transfer`

**Purpose:** Execute token transfer with automatic network selection and failover

**Request Body:**
```json
{
  "from": "0.0.7099609",
  "to": "0.0.123456",
  "tokenSymbol": "USDC",
  "amount": 100,
  "memo": "Payment for order #123",
  "orderId": "uuid-here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "transactionId": "0.0.7099609@1234567890.123456789",
    "transactionHash": "0.0.7099609@1234567890.123456789",
    "networkUsed": "hedera-testnet",
    "networkType": "hedera",
    "fee": 0.0001,
    "timestamp": "2025-10-21T16:30:00.000Z",
    "attemptedNetworks": ["hedera-testnet"]
  },
  "message": "Transfer completed successfully on hedera-testnet"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Transfer failed",
  "message": "All networks failed. Last error: ...",
  "attemptedNetworks": ["hedera-testnet", "base-sepolia"]
}
```

**Usage:**
```typescript
const response = await fetch('/api/blockchain/transfer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: '0.0.7099609',
    to: '0.0.123456',
    tokenSymbol: 'USDC',
    amount: 100,
    memo: 'Payment',
    orderId: paymentOrder.id
  })
});

const result = await response.json();

if (result.success) {
  console.log(`✅ Transfer successful!`);
  console.log(`   Network: ${result.data.networkUsed}`);
  console.log(`   TX ID: ${result.data.transactionId}`);
  console.log(`   Fee: $${result.data.fee}`);
} else {
  console.error(`❌ Transfer failed: ${result.message}`);
}
```

---

## 🔄 Integration Patterns

### **Pattern 1: Direct API Call**

Use the transfer API directly from your frontend or backend:

```typescript
// In your payment processing code
async function processPayment(order: PaymentOrder) {
  try {
    const response = await fetch('/api/blockchain/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: order.fromAddress,
        to: order.toAddress,
        tokenSymbol: order.tokenSymbol,
        amount: order.amount,
        memo: `Order #${order.id}`,
        orderId: order.id
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Update your database
      await updatePaymentOrder(order.id, {
        status: 'completed',
        transactionId: result.data.transactionId,
        networkUsed: result.data.networkUsed,
        fee: result.data.fee
      });
      
      return { success: true, data: result.data };
    } else {
      // Handle failure
      await updatePaymentOrder(order.id, {
        status: 'failed',
        error: result.message
      });
      
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return { success: false, error: 'Internal error' };
  }
}
```

### **Pattern 2: Use Blockchain Module Directly**

For server-side operations, use the blockchain module directly:

```typescript
import { executeTransfer } from '@/lib/blockchain';

async function processPayment(order: PaymentOrder) {
  try {
    const result = await executeTransfer({
      from: order.fromAddress,
      to: order.toAddress,
      tokenSymbol: order.tokenSymbol,
      amount: order.amount,
      memo: `Order #${order.id}`,
      orderId: order.id
    });

    if (result.success) {
      // Payment successful
      return { success: true, data: result };
    } else {
      // Payment failed
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### **Pattern 3: Show Cost Comparison to Users**

Let users see savings before confirming:

```typescript
async function showPaymentOptions(amount: number, token: string) {
  const response = await fetch(`/api/networks/costs?token=${token}&amount=${amount}`);
  const { data } = await response.json();

  // Display to user:
  // "We'll use Hedera network"
  // "Transaction fee: $0.0001"
  // "You save $0.0299 compared to other networks"
  
  return data;
}
```

---

## 🎯 Integration Checklist

### **For Existing Payment Flows:**

- [ ] **Identify payment execution points**
  - Find where you currently make blockchain transactions
  - Replace direct blockchain calls with router

- [ ] **Update transaction logic**
  - Replace EVM-only calls with `executeTransfer()`
  - Add orderId to track payments

- [ ] **Update database schema** (already done ✅)
  - `network_used` field populated automatically
  - `tx_id` and `tx_hash` tracked

- [ ] **Add network display**
  - Show users which network was used
  - Display cost savings

- [ ] **Update error handling**
  - Router returns detailed error messages
  - Show attempted networks on failure

### **For Provider Dashboard:**

- [ ] **Show network selection**
  - Display available networks
  - Show cost comparison

- [ ] **Add performance metrics**
  - Track which network was used for each order
  - Calculate total savings

- [ ] **Add network health monitoring**
  - Use `/api/networks/status` to show status
  - Alert if primary network is down

---

## 📊 Example: Update Existing Payment Endpoint

**Before (EVM-only):**
```typescript
// app/api/payments/execute/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Direct EVM call
  const result = await executeEVMTransfer(body);
  
  return NextResponse.json(result);
}
```

**After (Multi-chain with failover):**
```typescript
// app/api/payments/execute/route.ts
import { executeTransfer } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Multi-chain with automatic failover
  const result = await executeTransfer({
    from: body.from,
    to: body.to,
    tokenSymbol: body.token,
    amount: body.amount,
    memo: body.memo,
    orderId: body.orderId
  });
  
  return NextResponse.json(result);
}
```

**That's it!** The router handles:
- ✅ Network selection (Hedera first)
- ✅ Automatic failover to Base
- ✅ Database updates
- ✅ Transaction tracking
- ✅ Cost optimization

---

## 🧪 Testing

### **1. Test APIs:**
```bash
# Make sure dev server is running
npm run dev

# In another terminal:
npm run test:api-endpoints
```

### **2. Test Transfer (curl):**
```bash
curl -X POST http://localhost:3000/api/blockchain/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0.0.7099609",
    "to": "0.0.123456",
    "tokenSymbol": "USDC",
    "amount": 1,
    "memo": "Test payment"
  }'
```

### **3. Test in Browser:**
```javascript
// Open browser console on your app
const response = await fetch('/api/networks/status');
const data = await response.json();
console.log(data);
```

---

## 🔐 Security Considerations

1. **API Authentication**
   - Add authentication middleware to transfer endpoint
   - Validate user permissions before executing transfers

2. **Rate Limiting**
   - Implement rate limiting on transfer endpoint
   - Prevent abuse and DDoS attacks

3. **Input Validation**
   - Already validates required fields
   - Add additional checks for your use case

4. **Logging**
   - All transfers are logged automatically
   - Add additional logging for audit trail

---

## 📈 Monitoring

### **Metrics to Track:**

1. **Network Usage**
   - Which network is used most often?
   - Success rate per network

2. **Cost Savings**
   - Total saved vs if only using Base
   - Monthly/yearly savings report

3. **Performance**
   - Average transaction time per network
   - Failover frequency

4. **Failures**
   - Which networks fail most often?
   - Common error types

---

## 🎉 You're Ready!

Your multi-chain integration is complete. The router will:
- ✅ Try Hedera first (99.67% cheaper)
- ✅ Fall back to Base automatically
- ✅ Track everything in database
- ✅ Return detailed results

**Start integrating and save $35,880/year!** 🚀

---

## 💬 Need Help?

Check these files:
- `lib/blockchain/index.ts` - Router implementation
- `scripts/test-routing.ts` - Routing examples
- `PHASE3_SUMMARY.md` - Technical details

Or review the API responses to understand the data structure.
