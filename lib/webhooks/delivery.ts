import crypto from 'crypto';

export interface WebhookPayload {
  event: string;
  orderId: string;
  status: string;
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  bankMarkup?: number;
  pspCommission?: number;
  txHash?: string;
  txId?: string;
  networkUsed?: string;
  completedAt?: string;
  reference?: string;
  timestamp: string;
}

/**
 * Generate webhook signature for verification
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Deliver webhook to specified URL
 */
export async function deliverWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  webhookSecret?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📤 Delivering webhook to:', webhookUrl);
    console.log('Payload:', payload);

    const payloadString = JSON.stringify(payload);
    
    // Generate signature if secret provided
    const signature = webhookSecret 
      ? `sha256=${generateWebhookSignature(payloadString, webhookSecret)}`
      : undefined;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'NedaPay-Webhooks/1.0',
    };

    if (signature) {
      headers['X-Webhook-Signature'] = signature;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Webhook delivery failed with status ${response.status}`);
    }

    console.log('✅ Webhook delivered successfully');
    return { success: true };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Webhook delivery failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Deliver webhook with retry logic
 */
export async function deliverWebhookWithRetry(
  webhookUrl: string,
  payload: WebhookPayload,
  webhookSecret?: string,
  maxRetries: number = 3
): Promise<{ success: boolean; error?: string; attempts: number }> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`📤 Webhook delivery attempt ${attempt}/${maxRetries}`);
    
    const result = await deliverWebhook(webhookUrl, payload, webhookSecret);
    
    if (result.success) {
      return { success: true, attempts: attempt };
    }

    lastError = result.error;

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
      console.log(`⏱️ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return { 
    success: false, 
    error: lastError || 'All retry attempts failed', 
    attempts: maxRetries 
  };
}

/**
 * Send payment order webhook to sender (bank)
 */
export async function sendOrderWebhookToSender(
  webhookUrl: string,
  orderData: {
    orderId: string;
    status: string;
    fromAmount: number;
    fromCurrency: string;
    toAmount: number;
    toCurrency: string;
    bankMarkup?: number;
    txHash?: string;
    txId?: string;
    networkUsed?: string;
    completedAt?: Date;
    reference?: string;
  },
  webhookSecret?: string
): Promise<void> {
  const eventMap: Record<string, string> = {
    'pending': 'payment.pending',
    'processing': 'payment.processing',
    'completed': 'payment.completed',
    'failed': 'payment.failed',
    'cancelled': 'payment.cancelled'
  };

  const payload: WebhookPayload = {
    event: eventMap[orderData.status] || 'payment.updated',
    orderId: orderData.orderId,
    status: orderData.status,
    fromAmount: orderData.fromAmount,
    fromCurrency: orderData.fromCurrency,
    toAmount: orderData.toAmount,
    toCurrency: orderData.toCurrency,
    bankMarkup: orderData.bankMarkup,
    txHash: orderData.txHash,
    txId: orderData.txId,
    networkUsed: orderData.networkUsed,
    completedAt: orderData.completedAt?.toISOString(),
    reference: orderData.reference || undefined,
    timestamp: new Date().toISOString()
  };

  await deliverWebhookWithRetry(webhookUrl, payload, webhookSecret);
}

/**
 * Send payment order webhook to PSP
 */
export async function sendOrderWebhookToPSP(
  webhookUrl: string,
  orderData: {
    orderId: string;
    status: string;
    toAmount: number;
    toCurrency: string;
    pspCommission?: number;
    receiveAddress: string;
    reference?: string;
  },
  webhookSecret?: string
): Promise<void> {
  const payload: WebhookPayload = {
    event: 'order.assigned',
    orderId: orderData.orderId,
    status: orderData.status,
    fromAmount: orderData.toAmount,
    fromCurrency: orderData.toCurrency,
    toAmount: orderData.toAmount,
    toCurrency: orderData.toCurrency,
    pspCommission: orderData.pspCommission,
    reference: orderData.reference,
    timestamp: new Date().toISOString()
  };

  await deliverWebhookWithRetry(webhookUrl, payload, webhookSecret);
}
