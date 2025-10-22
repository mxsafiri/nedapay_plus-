/**
 * NedaPay Node.js SDK
 * Official SDK for integrating NedaPay payment infrastructure
 * 
 * @example
 * ```typescript
 * import { NedaPay } from '@nedapay/node';
 * 
 * const nedapay = new NedaPay('sk_live_...');
 * 
 * const order = await nedapay.paymentOrders.create({
 *   fromCurrency: 'TZS',
 *   toCurrency: 'CNY',
 *   amount: 50000,
 *   recipientDetails: {
 *     name: 'Beijing Co',
 *     accountNumber: '6214****1234'
 *   }
 * });
 * ```
 */

export interface NedaPayConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface RecipientDetails {
  name: string;
  accountNumber: string;
  bankCode?: string;
  address?: string;
}

export interface CreatePaymentOrderRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  recipientDetails: RecipientDetails;
  reference?: string;
  webhookUrl?: string;
}

export interface PaymentOrder {
  orderId: string;
  status: string;
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  exchangeRate: number;
  bankMarkup: number;
  estimatedCompletion: string;
  createdAt: string;
  reference?: string;
  txHash?: string;
}

export interface ListPaymentOrdersRequest {
  limit?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
}

export class NedaPayError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'NedaPayError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class PaymentOrders {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(apiKey: string, baseUrl: string, timeout: number) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Create a new payment order
   */
  async create(data: CreatePaymentOrderRequest): Promise<PaymentOrder> {
    const response = await this.request('POST', '/api/v1/payment-orders', data);
    return response;
  }

  /**
   * List payment orders
   */
  async list(params?: ListPaymentOrdersRequest): Promise<{ orders: PaymentOrder[]; count: number }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `/api/v1/payment-orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await this.request('GET', url);
  }

  /**
   * Get a specific payment order by ID
   */
  async retrieve(orderId: string): Promise<{ order: PaymentOrder }> {
    return await this.request('GET', `/api/v1/payment-orders/${orderId}`);
  }

  /**
   * Update payment order status (PSP only)
   */
  async update(orderId: string, data: {
    status: 'processing' | 'completed' | 'failed';
    txHash?: string;
    txId?: string;
    networkUsed?: string;
  }): Promise<{ order: PaymentOrder; message: string }> {
    return await this.request('PATCH', `/api/v1/payment-orders/${orderId}`, data);
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'NedaPay-NodeSDK/1.0.0'
        },
        signal: controller.signal
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseUrl}${path}`, options);

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new NedaPayError(
          data.error || 'Request failed',
          response.status,
          data.code,
          data.details
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof NedaPayError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new NedaPayError('Request timeout', 408);
      }

      throw new NedaPayError(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  }
}

export class NedaPay {
  public paymentOrders: PaymentOrders;
  private config: Required<NedaPayConfig>;

  constructor(apiKey: string, config?: Partial<NedaPayConfig>) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    if (!apiKey.startsWith('sk_')) {
      console.warn('Warning: API key should start with "sk_test_" or "sk_live_"');
    }

    this.config = {
      apiKey,
      baseUrl: config?.baseUrl || 'https://api.nedapay.com',
      timeout: config?.timeout || 30000
    };

    this.paymentOrders = new PaymentOrders(
      this.config.apiKey,
      this.config.baseUrl,
      this.config.timeout
    );
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const crypto = require('crypto');
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')}`;
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export default NedaPay;
