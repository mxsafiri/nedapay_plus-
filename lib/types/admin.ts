// Admin Database Types for NEDA Integration Dashboard
// Comprehensive types for all tables in the payment processing system

// Import existing types for consistency
import type { 
  User, 
  ApiKey
} from './database';

// Core System Types
export interface FiatCurrency {
  id: string;
  code: string;
  short_name: string;
  decimals: number;
  symbol: string;
  name: string;
  market_rate: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  code: string;
  name: string;
  type: 'bank' | 'mobile_money' | 'card' | 'wallet';
  fiat_currency_id: string;
  created_at: string;
  updated_at: string;
}

export interface Network {
  chain_id: number;
  identifier: string;
  rpc_endpoint: string;
  gateway_contract_address: string;
  block_time: number;
  is_testnet: boolean;
  bundler_url?: string;
  paymaster_url?: string;
  fee: number;
  created_at: string;
  updated_at: string;
}

export interface Token {
  id: string;
  symbol: string;
  contract_address: string;
  decimals: number;
  is_enabled: boolean;
  base_currency: string;
  network_id: number;
  created_at: string;
  updated_at: string;
}

// Address Management Types
export interface LinkedAddress {
  address: string;
  salt?: Uint8Array;
  institution: string;
  account_identifier: string;
  account_name: string;
  metadata?: Record<string, unknown>;
  owner_address: string;
  last_indexed_block?: number;
  tx_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiveAddress {
  address: string;
  salt?: Uint8Array;
  status: 'unused' | 'pending' | 'used' | 'expired';
  last_indexed_block?: number;
  last_used?: string;
  tx_hash?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

// Provider Management Types
export interface ProviderProfile {
  id: string;
  user_id: string;
  trading_name?: string;
  host_identifier?: string;
  provision_mode: 'auto' | 'manual';
  is_active: boolean;
  is_kyb_verified: boolean;
  visibility_mode: 'public' | 'private' | 'whitelist';
  updated_at: string;
}

export interface ProviderCurrency {
  id: string;
  provider_id: string;
  currency_id: string;
  available_balance: number;
  total_balance: number;
  reserved_balance: number;
  is_available: boolean;
  updated_at: string;
}

export interface ProviderRating {
  id: string;
  provider_profile_id: string;
  trust_score: number;
  created_at: string;
  updated_at: string;
}

export interface ProvisionBucket {
  id: string;
  currency_id: string;
  min_amount: number;
  max_amount: number;
  created_at: string;
}

export interface ProvisionBucketProvider {
  provision_bucket_id: string;
  provider_profile_id: string;
}

export interface ProviderOrderToken {
  id: string;
  provider_id: string;
  token_id: string;
  currency_id: string;
  network: string;
  fixed_conversion_rate: number;
  floating_conversion_rate: number;
  conversion_rate_type: 'fixed' | 'floating';
  max_order_amount: number;
  min_order_amount: number;
  rate_slippage: number;
  address?: string;
  created_at: string;
  updated_at: string;
}

// Sender Management Types
export interface SenderProfile {
  id: string;
  user_id: string;
  webhook_url?: string;
  domain_whitelist: string[];
  provider_id?: string;
  is_partner: boolean;
  is_active: boolean;
  updated_at: string;
}

export interface SenderOrderToken {
  id: string;
  sender_id: string;
  token_id: string;
  fee_percent: number;
  fee_address: string;
  refund_address: string;
  created_at: string;
  updated_at: string;
}

// Payment Order Types
export interface PaymentOrder {
  id: string;
  sender_profile_id?: string;
  token_id: string;
  linked_address_id?: string;
  receive_address_id?: string;
  payment_webhook_id?: string;
  api_key_id?: string;
  amount: number;
  amount_paid: number;
  amount_returned: number;
  percent_settled: number;
  sender_fee: number;
  network_fee: number;
  rate: number;
  tx_hash?: string;
  block_number: number;
  from_address?: string;
  return_address?: string;
  receive_address_text: string;
  fee_percent: number;
  fee_address?: string;
  gateway_id?: string;
  message_hash?: string;
  reference?: string;
  status: 'initiated' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount_in_usd: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentOrderRecipient {
  id: string;
  payment_order_id: string;
  institution: string;
  account_identifier: string;
  account_name: string;
  memo?: string;
  provider_id?: string;
  metadata?: Record<string, unknown>;
}

export interface LockPaymentOrder {
  id: string;
  token_id: string;
  provision_bucket_id?: string;
  provider_id?: string;
  gateway_id: string;
  amount: number;
  protocol_fee: number;
  rate: number;
  order_percent: number;
  sender?: string;
  tx_hash?: string;
  status: 'pending' | 'locked' | 'fulfilled' | 'cancelled' | 'expired';
  block_number: number;
  institution: string;
  account_identifier: string;
  account_name: string;
  memo?: string;
  metadata?: Record<string, unknown>;
  cancellation_count: number;
  cancellation_reasons: string[];
  message_hash?: string;
  amount_in_usd: number;
  created_at: string;
  updated_at: string;
}

export interface LockOrderFulfillment {
  id: string;
  order_id: string;
  tx_id?: string;
  psp?: string;
  validation_status: 'pending' | 'validated' | 'failed';
  validation_error?: string;
  created_at: string;
  updated_at: string;
}

// Webhook Types
export interface PaymentWebhook {
  id: string;
  network_id?: number;
  webhook_id: string;
  webhook_secret: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookRetryAttempt {
  id: string;
  attempt_number: number;
  next_retry_time: string;
  payload: Record<string, unknown>;
  signature?: string;
  webhook_url: string;
  status: 'pending' | 'success' | 'failed' | 'max_retries_reached';
  created_at: string;
  updated_at: string;
}

// Logging Types
export interface TransactionLog {
  id: string;
  payment_order_id?: string;
  lock_payment_order_id?: string;
  gateway_id?: string;
  status: 'order_initiated' | 'payment_received' | 'processing' | 'completed' | 'failed';
  network?: string;
  tx_hash?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface VerificationToken {
  id: string;
  owner_id: string;
  token: string;
  scope: 'email_verification' | 'password_reset' | 'kyb_verification';
  expiry_at: string;
  created_at: string;
  updated_at: string;
}

// Admin Dashboard Statistics
export interface AdminDashboardStats {
  total_users: number;
  verified_users: number;
  pending_verification: number;
  total_providers: number;
  active_providers: number;
  total_senders: number;
  active_senders: number;
  total_payment_orders: number;
  completed_orders: number;
  pending_orders: number;
  failed_orders: number;
  total_volume_usd: number;
  monthly_volume_usd: number;
  total_transactions: number;
  monthly_transactions: number;
  active_tokens: number;
  active_currencies: number;
  webhook_success_rate: number;
}

// Admin Action Types
export interface AdminAction {
  type: 'grant_sender_profile' | 'revoke_sender_profile' | 'grant_provider_profile' | 'revoke_provider_profile' | 'verify_user' | 'reject_user' | 'enable_token' | 'disable_token' | 'enable_currency' | 'disable_currency';
  user_id: string;
  admin_id: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

// Filter and Search Types
export interface AdminFilters {
  status?: string[];
  verification_status?: string[];
  business_type?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Combined Types with Relations
export interface UserWithProfiles {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  kyb_verification_status: 'not_started' | 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
  sender_profiles?: SenderProfile[];
  provider_profiles?: ProviderProfile[];
  api_keys: ApiKey[];
}

export interface ProviderWithDetails {
  id: string;
  user_id: string;
  trading_name?: string;
  host_identifier?: string;
  provision_mode: 'auto' | 'manual';
  is_active: boolean;
  is_kyb_verified: boolean;
  visibility_mode: 'public' | 'private' | 'whitelist';
  updated_at: string;
  user_profile: User;
  provider_currencies: ProviderCurrency[];
  provider_ratings: ProviderRating[];
  order_tokens: ProviderOrderToken[];
}

export interface SenderWithDetails {
  id: string;
  user_id: string;
  webhook_url?: string;
  domain_whitelist: string[];
  provider_id?: string;
  is_partner: boolean;
  is_active: boolean;
  updated_at: string;
  user_profile: User;
  order_tokens: SenderOrderToken[];
  payment_orders: PaymentOrder[];
}

// Re-export existing types for consistency
export type { 
  User, 
  ApiKey, 
  UserInsert,
  UserUpdate,
  ApiKeyInsert,
  ApiKeyUpdate,
  TransactionLogInsert,
  TransactionLogUpdate
} from './database';

// Admin-specific utility types
export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  created_at: string;
  last_login: string;
}

export interface AdminSession {
  user: AdminUser;
  expires_at: string;
  permissions: string[];
}
