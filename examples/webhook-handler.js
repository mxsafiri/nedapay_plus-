/**
 * NedaPay Plus - Example Webhook Handler
 * Handle status updates from NedaPay Plus
 */

const express = require('express');
const app = express();

app.use(express.json());

// In-memory store (use database in production)
const orders = new Map();

/**
 * Webhook endpoint
 * This is what you'd deploy on your server
 */
app.post('/webhooks/nedapay', async (req, res) => {
  try {
    const webhook = req.body;
    
    console.log('📨 Webhook received:', {
      event: webhook.event,
      orderId: webhook.orderId,
      status: webhook.status,
      reference: webhook.reference
    });

    // Validate webhook (basic checks)
    if (!webhook.orderId || !webhook.status) {
      console.error('❌ Invalid webhook payload');
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Check if we already processed this status update (idempotency)
    const existingUpdate = orders.get(webhook.orderId);
    if (existingUpdate && existingUpdate.status === webhook.status) {
      console.log('ℹ️  Already processed this status update');
      return res.status(200).json({ received: true, duplicate: true });
    }

    // Update order in your database
    await updateOrderStatus(webhook);

    // Trigger business logic based on status
    switch (webhook.status) {
      case 'completed':
        await handleOrderCompleted(webhook);
        break;
      case 'failed':
        await handleOrderFailed(webhook);
        break;
      case 'processing':
        await handleOrderProcessing(webhook);
        break;
    }

    // Acknowledge receipt
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    // Return 500 so NedaPay retries
    res.status(500).json({ error: 'Processing failed' });
  }
});

/**
 * Update order status in your database
 */
async function updateOrderStatus(webhook) {
  // Example: Update in your database
  orders.set(webhook.orderId, {
    orderId: webhook.orderId,
    status: webhook.status,
    reference: webhook.reference,
    updatedAt: new Date(),
    completedAt: webhook.completedAt || null,
    txHash: webhook.txHash || null
  });

  console.log('✅ Order status updated in database');

  // Example with real database (uncomment and adapt):
  /*
  await db.orders.update({
    where: { nedapayOrderId: webhook.orderId },
    data: {
      status: webhook.status,
      completedAt: webhook.completedAt ? new Date(webhook.completedAt) : null,
      txHash: webhook.txHash,
      updatedAt: new Date()
    }
  });
  */
}

/**
 * Handle completed order
 */
async function handleOrderCompleted(webhook) {
  console.log('✅ Order completed:', webhook.orderId);
  
  // Your business logic:
  // 1. Credit user's account
  // 2. Send notification email
  // 3. Update analytics
  // 4. Trigger any post-completion workflows
  
  // Example:
  console.log('- Crediting user account...');
  console.log('- Sending completion email...');
  console.log('- Updating analytics...');
}

/**
 * Handle failed order
 */
async function handleOrderFailed(webhook) {
  console.log('❌ Order failed:', webhook.orderId);
  
  // Your business logic:
  // 1. Refund user (if needed)
  // 2. Send failure notification
  // 3. Log for support team
  // 4. Trigger retry logic (if applicable)
  
  // Example:
  console.log('- Initiating refund process...');
  console.log('- Notifying user of failure...');
  console.log('- Logging to support system...');
}

/**
 * Handle processing order
 */
async function handleOrderProcessing(webhook) {
  console.log('⏳ Order processing:', webhook.orderId);
  
  // Your business logic:
  // 1. Show "pending" status to user
  // 2. Send processing notification
  // 3. Update UI in real-time (via websockets)
  
  // Example:
  console.log('- Updating user UI to "processing"...');
  console.log('- Sending status email...');
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * View all orders (for debugging)
 */
app.get('/orders', (req, res) => {
  const allOrders = Array.from(orders.values());
  res.json({ orders: allOrders, count: allOrders.length });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on http://localhost:${PORT}`);
  console.log(`📨 Webhook endpoint: http://localhost:${PORT}/webhooks/nedapay`);
  console.log(`\nFor testing with local development:`);
  console.log(`1. Install ngrok: npm install -g ngrok`);
  console.log(`2. Run: ngrok http ${PORT}`);
  console.log(`3. Use the ngrok URL as your webhook URL in NedaPay dashboard`);
});

module.exports = app;
