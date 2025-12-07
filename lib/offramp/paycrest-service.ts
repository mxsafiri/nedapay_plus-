/**
 * Paycrest Off-Ramp Service
 * Handles USDC/USDT → Fiat conversions via Paycrest API
 * 
 * Use Cases:
 * - Crypto exchanges offering fiat withdrawals
 * - Web3 companies paying contractors
 * - DeFi platforms enabling fiat off-ramps
 * - Stablecoin remittance services
 */

import axios, { AxiosError } from 'axios';

const PAYCREST_API_BASE = 'https://api.paycrest.io/v1';

export interface PaycrestOrderRequest {
  amount: string;                    // USDC amount (e.g., "100.50")
  token: 'USDC' | 'USDT';           // Stablecoin type
  network: 'base';                   // Blockchain network
  rate: string;                      // Exchange rate from getRate()
  recipient: {
    institution: string;             // Bank code (e.g., "GTB", "CRDB")
    accountIdentifier: string;       // Account number or mobile money number
    accountName: string;             // Account holder name
    currency: string;                // Destination currency (e.g., "NGN", "TZS")
    memo?: string;                   // Optional payment reference
  };
  reference: string;                 // Your internal order ID
  returnAddress: string;             // Refund address if order fails
}

export interface PaycrestOrder {
  id: string;                        // Paycrest order ID
  amount: string;                    // USDC amount
  token: string;                     // Token type
  network: string;                   // Network used
  receiveAddress: string;            // Where to send USDC on Base
  validUntil: string;                // Order expiry timestamp
  senderFee: number;                 // Paycrest sender fee in USDC
  transactionFee: number;            // Network transaction fee
  rate: string;                      // Exchange rate applied
  expectedPayout: string;            // Expected fiat amount to recipient
  status: string;                    // Order status
  reference: string;                 // Your reference
}

export interface PaycrestRate {
  rate: string;                      // Exchange rate (e.g., "1580.50" for 1 USDC = 1580.50 NGN)
  token: string;
  currency: string;
  amount: string;
  estimatedPayout: string;           // Estimated fiat amount
  fees: {
    senderFee: number;
    transactionFee: number;
  };
}

export interface PaycrestInstitution {
  code: string;                      // Bank code
  name: string;                      // Bank name
  type: 'bank' | 'mobile_money';    // Institution type
  currency: string;                  // Currency supported
  country: string;                   // Country code
}

export class PaycrestService {
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    // Support both naming conventions
    this.clientSecret = process.env.PAYCREST_CLIENT_SECRET || process.env.PAYCREST_API_KEY!;
    this.baseUrl = PAYCREST_API_BASE;
    
    if (!this.clientSecret) {
      throw new Error('PAYCREST_CLIENT_SECRET not configured in environment variables. Get your client secret from app.paycrest.io dashboard.');
    }

    console.log(`✅ Paycrest initialized with API base: ${this.baseUrl}`);
  }

  /**
   * Get real-time exchange rate for token → fiat conversion
   */
  async getRate(
    token: 'USDC' | 'USDT',
    amount: string,
    toCurrency: string
  ): Promise<PaycrestRate> {
    try {
      console.log(`📊 Fetching Paycrest rate: ${amount} ${token} → ${toCurrency}`);

      const response = await axios.get(
        `${this.baseUrl}/rates/${token}/${amount}/${toCurrency}?network=base`,
        {
          headers: {
            'API-Key': this.clientSecret,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`📊 Paycrest rate response:`, JSON.stringify(response.data, null, 2));
      
      // Handle different response structures
      const rate = response.data?.data || response.data;
      
      if (!rate || !rate.rate) {
        throw new Error(`Invalid rate response from Paycrest: ${JSON.stringify(response.data)}`);
      }
      
      console.log(`💱 Rate: 1 ${token} = ${rate.rate} ${toCurrency}`);
      console.log(`💰 Estimated payout: ${rate.estimatedPayout || 'N/A'} ${toCurrency}`);

      return rate;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      console.error('❌ Paycrest rate fetch error:', axiosError.response?.data || axiosError.message);
      throw new Error(
        `Failed to get exchange rate: ${axiosError.response?.data?.message || axiosError.message}`
      );
    }
  }

  /**
   * Create off-ramp order
   * This returns the address where you should send USDC on Base chain
   */
  async createOrder(request: PaycrestOrderRequest): Promise<PaycrestOrder> {
    try {
      console.log(`📤 Creating Paycrest order:`, {
        amount: request.amount,
        token: request.token,
        network: request.network,
        toCurrency: request.recipient.currency,
        reference: request.reference
      });

      const response = await axios.post(
        `${this.baseUrl}/sender/orders`,
        request,
        {
          headers: {
            'API-Key': this.clientSecret,
            'Content-Type': 'application/json'
          }
        }
      );

      const order = response.data.data;
      
      console.log(`✅ Paycrest order created: ${order.id}`);
      console.log(`📍 Send USDC to: ${order.receiveAddress}`);
      console.log(`⏰ Valid until: ${order.validUntil}`);
      console.log(`💵 Expected payout: ${order.expectedPayout} ${request.recipient.currency}`);

      return order;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      console.error('❌ Paycrest order creation error:', axiosError.response?.data || axiosError.message);
      throw new Error(
        `Failed to create Paycrest order: ${axiosError.response?.data?.message || axiosError.message}`
      );
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(paycrestOrderId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/sender/orders/${paycrestOrderId}`,
        {
          headers: {
            'API-Key': this.clientSecret
          }
        }
      );

      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      console.error('❌ Paycrest status fetch error:', axiosError.response?.data || axiosError.message);
      throw new Error(
        `Failed to get order status: ${axiosError.response?.data?.message || axiosError.message}`
      );
    }
  }

  /**
   * Get list of orders (with optional filtering)
   */
  async listOrders(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await axios.get(
        `${this.baseUrl}/sender/orders?${params.toString()}`,
        {
          headers: {
            'API-Key': this.clientSecret
          }
        }
      );

      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      console.error('❌ Paycrest list orders error:', axiosError.message);
      return [];
    }
  }

  /**
   * Get supported institutions (banks/mobile money) for a currency
   */
  async getSupportedInstitutions(currency: string): Promise<PaycrestInstitution[]> {
    try {
      console.log(`🏦 Fetching institutions for ${currency}`);

      const response = await axios.get(
        `${this.baseUrl}/institutions/${currency.toUpperCase()}`,
        {
          headers: {
            'API-Key': this.clientSecret
          }
        }
      );

      const institutions = response.data.data;
      console.log(`✅ Found ${institutions.length} institutions for ${currency}`);
      
      return institutions;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      console.error('❌ Paycrest institutions fetch error:', axiosError.message);
      return [];
    }
  }

  /**
   * Check if currency is supported by Paycrest
   */
  isCurrencySupported(currency: string): boolean {
    const supported = [
      'NGN',  // Nigeria
      'KES',  // Kenya
      'UGX',  // Uganda
      'TZS',  // Tanzania
      'GHS',  // Ghana
      'MWK',  // Malawi
      'XOF',  // West African CFA (8 countries)
      'INR',  // India
      'BRL'   // Brazil
    ];
    
    return supported.includes(currency.toUpperCase());
  }

  /**
   * Get list of all supported currencies
   */
  getSupportedCurrencies(): string[] {
    return [
      'NGN', 'KES', 'UGX', 'TZS', 'GHS', 'MWK', 'XOF', 'INR', 'BRL'
    ];
  }

  /**
   * Validate recipient details before creating order
   */
  validateRecipient(recipient: PaycrestOrderRequest['recipient']): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!recipient.institution) errors.push('Institution/bank code is required');
    if (!recipient.accountIdentifier) errors.push('Account number/identifier is required');
    if (!recipient.accountName) errors.push('Account name is required');
    if (!recipient.currency) errors.push('Currency is required');

    if (recipient.currency && !this.isCurrencySupported(recipient.currency)) {
      errors.push(`Currency ${recipient.currency} is not supported`);
    }

    if (recipient.accountIdentifier && recipient.accountIdentifier.length < 5) {
      errors.push('Account identifier is too short');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get order validation/fulfillment timeline
   */
  getExpectedTimeline(): string {
    return '1-2 minutes for validation and fulfillment';
  }
}

/**
 * Singleton instance
 */
let paycrestServiceInstance: PaycrestService | null = null;

export function getPaycrestService(): PaycrestService {
  if (!paycrestServiceInstance) {
    paycrestServiceInstance = new PaycrestService();
  }
  return paycrestServiceInstance;
}
