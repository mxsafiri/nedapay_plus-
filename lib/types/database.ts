// Database Types for NEDA Integration Dashboard
// Generated from database schema - keep in sync with migrations

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      api_keys: {
        Row: ApiKey;
        Insert: ApiKeyInsert;
        Update: ApiKeyUpdate;
      };
      provider_profiles: {
        Row: ProviderProfile;
        Insert: ProviderProfileInsert;
        Update: ProviderProfileUpdate;
      };
      sender_profiles: {
        Row: SenderProfile;
        Insert: SenderProfileInsert;
        Update: SenderProfileUpdate;
      };
      payment_orders: {
        Row: PaymentOrder;
        Insert: PaymentOrderInsert;
        Update: PaymentOrderUpdate;
      };
      lock_payment_orders: {
        Row: LockPaymentOrder;
        Insert: LockPaymentOrderInsert;
        Update: LockPaymentOrderUpdate;
      };
      fiat_currencies: {
        Row: FiatCurrency;
        Insert: FiatCurrencyInsert;
        Update: FiatCurrencyUpdate;
      };
      tokens: {
        Row: Token;
        Insert: TokenInsert;
        Update: TokenUpdate;
      };
      networks: {
        Row: Network;
        Insert: NetworkInsert;
        Update: NetworkUpdate;
      };
      institutions: {
        Row: Institution;
        Insert: InstitutionInsert;
        Update: InstitutionUpdate;
      };
      transaction_logs: {
        Row: TransactionLog;
        Insert: TransactionLogInsert;
        Update: TransactionLogUpdate;
      };
      payment_webhooks: {
        Row: PaymentWebhook;
        Insert: PaymentWebhookInsert;
        Update: PaymentWebhookUpdate;
      };
      webhook_retry_attempts: {
        Row: WebhookRetryAttempt;
        Insert: WebhookRetryAttemptInsert;
        Update: WebhookRetryAttemptUpdate;
      };
      verification_tokens: {
        Row: VerificationToken;
        Insert: VerificationTokenInsert;
        Update: VerificationTokenUpdate;
      };
      kyb_profiles: {
        Row: KybProfile;
        Insert: KybProfileInsert;
        Update: KybProfileUpdate;
      };
      beneficial_owners: {
        Row: BeneficialOwner;
        Insert: BeneficialOwnerInsert;
        Update: BeneficialOwnerUpdate;
      };
      linked_addresses: {
        Row: LinkedAddress;
        Insert: LinkedAddressInsert;
        Update: LinkedAddressUpdate;
      };
      receive_addresses: {
        Row: ReceiveAddress;
        Insert: ReceiveAddressInsert;
        Update: ReceiveAddressUpdate;
      };
      provider_currencies: {
        Row: ProviderCurrency;
        Insert: ProviderCurrencyInsert;
        Update: ProviderCurrencyUpdate;
      };
      provider_ratings: {
        Row: ProviderRating;
        Insert: ProviderRatingInsert;
        Update: ProviderRatingUpdate;
      };
      provision_buckets: {
        Row: ProvisionBucket;
        Insert: ProvisionBucketInsert;
        Update: ProvisionBucketUpdate;
      };
      provider_order_tokens: {
        Row: ProviderOrderToken;
        Insert: ProviderOrderTokenInsert;
        Update: ProviderOrderTokenUpdate;
      };
      sender_order_tokens: {
        Row: SenderOrderToken;
        Insert: SenderOrderTokenInsert;
        Update: SenderOrderTokenUpdate;
      };
      payment_order_recipients: {
        Row: PaymentOrderRecipient;
        Insert: PaymentOrderRecipientInsert;
        Update: PaymentOrderRecipientUpdate;
      };
      lock_order_fulfillments: {
        Row: LockOrderFulfillment;
        Insert: LockOrderFulfillmentInsert;
        Update: LockOrderFulfillmentUpdate;
      };
      identity_verification_requests: {
        Row: IdentityVerificationRequest;
        Insert: IdentityVerificationRequestInsert;
        Update: IdentityVerificationRequestUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      kyb_verification_status: 'not_started' | 'pending' | 'verified' | 'rejected';
      payment_order_status: 'initiated' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
      lock_payment_order_status: 'pending' | 'locked' | 'fulfilled' | 'cancelled' | 'expired';
      provision_mode: 'auto' | 'manual';
      visibility_mode: 'public' | 'private' | 'whitelist';
      conversion_rate_type: 'fixed' | 'floating';
      validation_status: 'pending' | 'validated' | 'failed';
      receive_address_status: 'unused' | 'pending' | 'used' | 'expired';
      transaction_log_status: 'order_initiated' | 'payment_received' | 'processing' | 'completed' | 'failed';
      webhook_retry_status: 'pending' | 'success' | 'failed' | 'max_retries_reached';
      verification_token_scope: 'email_verification' | 'password_reset' | 'kyb_verification';
      identity_verification_status: 'pending' | 'verified' | 'rejected';
      institution_type: 'bank' | 'mobile_money' | 'card' | 'wallet';
    };
  };
}

// User Types (Core auth users table)
export interface User {
  id: string; // UUID
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  scope: string;
  is_email_verified: boolean;
  has_early_access: boolean;
  kyb_verification_status: 'not_started' | 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  scope: string;
  is_email_verified?: boolean;
  has_early_access?: boolean;
  kyb_verification_status?: 'not_started' | 'pending' | 'verified' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  scope?: string;
  is_email_verified?: boolean;
  has_early_access?: boolean;
  kyb_verification_status?: 'not_started' | 'pending' | 'verified' | 'rejected';
  updated_at?: string;
}

// Provider Profile Types
export interface ProviderProfile {
  id: string; // Custom string ID
  user_provider_profile: string; // UUID references users.id
  trading_name?: string;
  host_identifier?: string;
  provision_mode: 'auto' | 'manual';
  is_active: boolean;
  is_available: boolean;
  is_kyb_verified: boolean;
  visibility_mode: 'public' | 'private' | 'whitelist';
  address?: string;
  mobile_number?: string;
  date_of_birth?: string;
  business_name?: string;
  identity_document_type?: string;
  identity_document?: string;
  business_document?: string;
  updated_at: string;
}

export interface ProviderProfileInsert {
  id: string;
  user_provider_profile: string;
  trading_name?: string;
  host_identifier?: string;
  provision_mode?: 'auto' | 'manual';
  is_active?: boolean;
  is_available?: boolean;
  is_kyb_verified?: boolean;
  visibility_mode?: 'public' | 'private' | 'whitelist';
  address?: string;
  mobile_number?: string;
  date_of_birth?: string;
  business_name?: string;
  identity_document_type?: string;
  identity_document?: string;
  business_document?: string;
  updated_at?: string;
}

export interface ProviderProfileUpdate {
  trading_name?: string;
  host_identifier?: string;
  provision_mode?: 'auto' | 'manual';
  is_active?: boolean;
  is_available?: boolean;
  is_kyb_verified?: boolean;
  visibility_mode?: 'public' | 'private' | 'whitelist';
  address?: string;
  mobile_number?: string;
  date_of_birth?: string;
  business_name?: string;
  identity_document_type?: string;
  identity_document?: string;
  business_document?: string;
  updated_at?: string;
}

// Sender Profile Types
export interface SenderProfile {
  id: string; // UUID
  user_sender_profile: string; // UUID references users.id
  webhook_url?: string;
  domain_whitelist: string[]; // JSON array
  provider_id?: string;
  is_partner: boolean;
  is_active: boolean;
  updated_at: string;
}

export interface SenderProfileInsert {
  id?: string;
  user_sender_profile: string;
  webhook_url?: string;
  domain_whitelist?: string[];
  provider_id?: string;
  is_partner?: boolean;
  is_active?: boolean;
  updated_at?: string;
}

export interface SenderProfileUpdate {
  webhook_url?: string;
  domain_whitelist?: string[];
  provider_id?: string;
  is_partner?: boolean;
  is_active?: boolean;
  updated_at?: string;
}

// API Key Types
export interface ApiKey {
  id: string; // UUID
  secret: string;
  provider_profile_api_key?: string; // References provider_profiles.id
  sender_profile_api_key?: string; // UUID references sender_profiles.id
}

export interface ApiKeyInsert {
  id?: string;
  secret: string;
  provider_profile_api_key?: string;
  sender_profile_api_key?: string;
}

export interface ApiKeyUpdate {
  secret?: string;
  provider_profile_api_key?: string;
  sender_profile_api_key?: string;
}

// Payment Order Types
export interface PaymentOrder {
  id: string; // UUID
  amount: number;
  amount_paid: number;
  amount_returned: number;
  sender_fee: number;
  rate: number;
  tx_hash?: string;
  receive_address_text: string;
  status: 'initiated' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  api_key_payment_orders?: string; // UUID references api_keys.id
  sender_profile_payment_orders?: string; // UUID references sender_profiles.id
  token_payment_orders: number; // References tokens.id
  from_address?: string;
  network_fee: number;
  fee_percent: number;
  fee_address?: string;
  percent_settled: number;
  protocol_fee: number;
  gateway_id?: string;
  block_number: number;
  return_address?: string;
  linked_address_payment_orders?: number; // References linked_addresses.id
  reference?: string;
  message_hash?: string;
  amount_in_usd: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentOrderInsert {
  id?: string;
  amount: number;
  amount_paid?: number;
  amount_returned?: number;
  sender_fee?: number;
  rate: number;
  tx_hash?: string;
  receive_address_text: string;
  status?: 'initiated' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  api_key_payment_orders?: string;
  sender_profile_payment_orders?: string;
  token_payment_orders: number;
  from_address?: string;
  network_fee?: number;
  fee_percent?: number;
  fee_address?: string;
  percent_settled?: number;
  protocol_fee?: number;
  gateway_id?: string;
  block_number?: number;
  return_address?: string;
  linked_address_payment_orders?: number;
  reference?: string;
  message_hash?: string;
  amount_in_usd?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentOrderUpdate {
  amount?: number;
  amount_paid?: number;
  amount_returned?: number;
  sender_fee?: number;
  rate?: number;
  tx_hash?: string;
  receive_address_text?: string;
  status?: 'initiated' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  api_key_payment_orders?: string;
  sender_profile_payment_orders?: string;
  token_payment_orders?: number;
  from_address?: string;
  network_fee?: number;
  fee_percent?: number;
  fee_address?: string;
  percent_settled?: number;
  protocol_fee?: number;
  gateway_id?: string;
  block_number?: number;
  return_address?: string;
  linked_address_payment_orders?: number;
  reference?: string;
  message_hash?: string;
  amount_in_usd?: number;
  updated_at?: string;
}

// Lock Payment Order Types
export interface LockPaymentOrder {
  id: string; // UUID
  amount: number;
  rate: number;
  order_percent: number;
  tx_hash?: string;
  status: 'pending' | 'locked' | 'fulfilled' | 'cancelled' | 'expired';
  block_number: number;
  institution: string;
  account_identifier: string;
  account_name: string;
  memo?: string;
  cancellation_count: number;
  cancellation_reasons: string[]; // JSON array
  provider_profile_assigned_orders?: string; // References provider_profiles.id
  provision_bucket_lock_payment_orders?: number; // References provision_buckets.id
  token_lock_payment_orders: number; // References tokens.id
  gateway_id: string;
  protocol_fee: number;
  sender?: string;
  metadata?: Record<string, unknown>; // JSON
  message_hash?: string;
  amount_in_usd: number;
  created_at: string;
  updated_at: string;
}

export interface LockPaymentOrderInsert {
  id?: string;
  amount: number;
  rate: number;
  order_percent: number;
  tx_hash?: string;
  status?: 'pending' | 'locked' | 'fulfilled' | 'cancelled' | 'expired';
  block_number: number;
  institution: string;
  account_identifier: string;
  account_name: string;
  memo?: string;
  cancellation_count?: number;
  cancellation_reasons?: string[];
  provider_profile_assigned_orders?: string;
  provision_bucket_lock_payment_orders?: number;
  token_lock_payment_orders: number;
  gateway_id: string;
  protocol_fee: number;
  sender?: string;
  metadata?: Record<string, unknown>;
  message_hash?: string;
  amount_in_usd: number;
  created_at?: string;
  updated_at?: string;
}

export interface LockPaymentOrderUpdate {
  amount?: number;
  rate?: number;
  order_percent?: number;
  tx_hash?: string;
  status?: 'pending' | 'locked' | 'fulfilled' | 'cancelled' | 'expired';
  block_number?: number;
  institution?: string;
  account_identifier?: string;
  account_name?: string;
  memo?: string;
  cancellation_count?: number;
  cancellation_reasons?: string[];
  provider_profile_assigned_orders?: string;
  provision_bucket_lock_payment_orders?: number;
  token_lock_payment_orders?: number;
  gateway_id?: string;
  protocol_fee?: number;
  sender?: string;
  metadata?: Record<string, unknown>;
  message_hash?: string;
  amount_in_usd?: number;
  updated_at?: string;
}

// Transaction Log Types (replaces old audit logs for transactions)
export interface TransactionLog {
  id: string; // UUID
  gateway_id?: string;
  status: 'order_initiated' | 'payment_received' | 'processing' | 'completed' | 'failed';
  network?: string;
  tx_hash?: string;
  metadata: Record<string, unknown>; // JSON
  lock_payment_order_transactions?: string; // UUID references lock_payment_orders.id
  payment_order_transactions?: string; // UUID references payment_orders.id
  created_at: string;
}

export interface TransactionLogInsert {
  id?: string;
  gateway_id?: string;
  status?: 'order_initiated' | 'payment_received' | 'processing' | 'completed' | 'failed';
  network?: string;
  tx_hash?: string;
  metadata?: Record<string, unknown>;
  lock_payment_order_transactions?: string;
  payment_order_transactions?: string;
  created_at?: string;
}

export interface TransactionLogUpdate {
  gateway_id?: string;
  status?: 'order_initiated' | 'payment_received' | 'processing' | 'completed' | 'failed';
  network?: string;
  tx_hash?: string;
  metadata?: Record<string, unknown>;
  lock_payment_order_transactions?: string;
  payment_order_transactions?: string;
}

// Fiat Currency Types
export interface FiatCurrency {
  id: string; // UUID
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

export interface FiatCurrencyInsert {
  id?: string;
  code: string;
  short_name: string;
  decimals?: number;
  symbol: string;
  name: string;
  market_rate: number;
  is_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FiatCurrencyUpdate {
  code?: string;
  short_name?: string;
  decimals?: number;
  symbol?: string;
  name?: string;
  market_rate?: number;
  is_enabled?: boolean;
  updated_at?: string;
}

// Token Types
export interface Token {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  symbol: string;
  contract_address: string;
  decimals: number;
  is_enabled: boolean;
  network_tokens: number; // References networks.id
  base_currency: string;
  created_at: string;
  updated_at: string;
}

export interface TokenInsert {
  symbol: string;
  contract_address: string;
  decimals: number;
  is_enabled?: boolean;
  network_tokens: number;
  base_currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TokenUpdate {
  symbol?: string;
  contract_address?: string;
  decimals?: number;
  is_enabled?: boolean;
  network_tokens?: number;
  base_currency?: string;
  updated_at?: string;
}

// Network Types
export interface Network {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  chain_id: number;
  identifier: string;
  rpc_endpoint: string;
  is_testnet: boolean;
  fee: number;
  chain_id_hex?: string;
  gateway_contract_address: string;
  bundler_url?: string;
  paymaster_url?: string;
  block_time: number;
  created_at: string;
  updated_at: string;
}

export interface NetworkInsert {
  chain_id: number;
  identifier: string;
  rpc_endpoint: string;
  is_testnet: boolean;
  fee: number;
  chain_id_hex?: string;
  gateway_contract_address?: string;
  bundler_url?: string;
  paymaster_url?: string;
  block_time: number;
  created_at?: string;
  updated_at?: string;
}

export interface NetworkUpdate {
  chain_id?: number;
  identifier?: string;
  rpc_endpoint?: string;
  is_testnet?: boolean;
  fee?: number;
  chain_id_hex?: string;
  gateway_contract_address?: string;
  bundler_url?: string;
  paymaster_url?: string;
  block_time?: number;
  updated_at?: string;
}

// Institution Types
export interface Institution {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  code: string;
  name: string;
  type: 'bank' | 'mobile_money' | 'card' | 'wallet';
  fiat_currency_institutions?: string; // UUID references fiat_currencies.id
  created_at: string;
  updated_at: string;
}

export interface InstitutionInsert {
  code: string;
  name: string;
  type?: 'bank' | 'mobile_money' | 'card' | 'wallet';
  fiat_currency_institutions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InstitutionUpdate {
  code?: string;
  name?: string;
  type?: 'bank' | 'mobile_money' | 'card' | 'wallet';
  fiat_currency_institutions?: string;
  updated_at?: string;
}

// Payment Webhook Types
export interface PaymentWebhook {
  id: string; // UUID
  webhook_id: string;
  webhook_secret: string;
  callback_url: string;
  network_payment_webhook?: number; // References networks.id
  payment_order_payment_webhook?: string; // UUID references payment_orders.id
  created_at: string;
  updated_at: string;
}

export interface PaymentWebhookInsert {
  id?: string;
  webhook_id: string;
  webhook_secret: string;
  callback_url: string;
  network_payment_webhook?: number;
  payment_order_payment_webhook?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentWebhookUpdate {
  webhook_id?: string;
  webhook_secret?: string;
  callback_url?: string;
  network_payment_webhook?: number;
  payment_order_payment_webhook?: string;
  updated_at?: string;
}

// Webhook Retry Attempt Types
export interface WebhookRetryAttempt {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  attempt_number: number;
  next_retry_time: string;
  payload: Record<string, unknown>; // JSON
  signature?: string;
  webhook_url: string;
  status: 'pending' | 'success' | 'failed' | 'max_retries_reached';
  created_at: string;
  updated_at: string;
}

export interface WebhookRetryAttemptInsert {
  attempt_number: number;
  next_retry_time: string;
  payload: Record<string, unknown>;
  signature?: string;
  webhook_url: string;
  status?: 'pending' | 'success' | 'failed' | 'max_retries_reached';
  created_at?: string;
  updated_at?: string;
}

export interface WebhookRetryAttemptUpdate {
  attempt_number?: number;
  next_retry_time?: string;
  payload?: Record<string, unknown>;
  signature?: string;
  webhook_url?: string;
  status?: 'pending' | 'success' | 'failed' | 'max_retries_reached';
  updated_at?: string;
}

// Verification Token Types
export interface VerificationToken {
  id: string; // UUID
  token: string;
  scope: 'email_verification' | 'password_reset' | 'kyb_verification';
  expiry_at: string;
  user_verification_token: string; // UUID references users.id
  created_at: string;
  updated_at: string;
}

export interface VerificationTokenInsert {
  id?: string;
  token: string;
  scope: 'email_verification' | 'password_reset' | 'kyb_verification';
  expiry_at: string;
  user_verification_token: string;
  created_at?: string;
  updated_at?: string;
}

export interface VerificationTokenUpdate {
  token?: string;
  scope?: 'email_verification' | 'password_reset' | 'kyb_verification';
  expiry_at?: string;
  user_verification_token?: string;
  updated_at?: string;
}

// KYB Profile Types
export interface KybProfile {
  id: string; // UUID
  mobile_number: string;
  company_name: string;
  registered_business_address: string;
  certificate_of_incorporation_url: string;
  articles_of_incorporation_url: string;
  business_license_url?: string;
  proof_of_business_address_url: string;
  aml_policy_url?: string;
  kyc_policy_url?: string;
  kyb_rejection_comment?: string;
  user_kyb_profile?: string; // UUID references users.id
  created_at: string;
  updated_at: string;
}

export interface KybProfileInsert {
  id?: string;
  mobile_number: string;
  company_name: string;
  registered_business_address: string;
  certificate_of_incorporation_url: string;
  articles_of_incorporation_url: string;
  business_license_url?: string;
  proof_of_business_address_url: string;
  aml_policy_url?: string;
  kyc_policy_url?: string;
  kyb_rejection_comment?: string;
  user_kyb_profile?: string;
  created_at?: string;
  updated_at?: string;
}

export interface KybProfileUpdate {
  mobile_number?: string;
  company_name?: string;
  registered_business_address?: string;
  certificate_of_incorporation_url?: string;
  articles_of_incorporation_url?: string;
  business_license_url?: string;
  proof_of_business_address_url?: string;
  aml_policy_url?: string;
  kyc_policy_url?: string;
  kyb_rejection_comment?: string;
  user_kyb_profile?: string;
  updated_at?: string;
}

// Beneficial Owner Types
export interface BeneficialOwner {
  id: string; // UUID
  full_name: string;
  residential_address: string;
  proof_of_residential_address_url: string;
  government_issued_id_url: string;
  date_of_birth: string;
  ownership_percentage: number;
  government_issued_id_type?: string;
  kyb_profile_beneficial_owners: string; // UUID references kyb_profiles.id
}

export interface BeneficialOwnerInsert {
  id?: string;
  full_name: string;
  residential_address: string;
  proof_of_residential_address_url: string;
  government_issued_id_url: string;
  date_of_birth: string;
  ownership_percentage: number;
  government_issued_id_type?: string;
  kyb_profile_beneficial_owners: string;
}

export interface BeneficialOwnerUpdate {
  full_name?: string;
  residential_address?: string;
  proof_of_residential_address_url?: string;
  government_issued_id_url?: string;
  date_of_birth?: string;
  ownership_percentage?: number;
  government_issued_id_type?: string;
  kyb_profile_beneficial_owners?: string;
}

// Linked Address Types
export interface LinkedAddress {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  address: string;
  salt?: Uint8Array;
  institution: string;
  account_identifier: string;
  account_name: string;
  owner_address: string;
  last_indexed_block?: number;
  tx_hash?: string;
  sender_profile_linked_address?: string; // UUID references sender_profiles.id
  metadata?: Record<string, unknown>; // JSON
  created_at: string;
  updated_at: string;
}

export interface LinkedAddressInsert {
  address: string;
  salt?: Uint8Array;
  institution: string;
  account_identifier: string;
  account_name: string;
  owner_address: string;
  last_indexed_block?: number;
  tx_hash?: string;
  sender_profile_linked_address?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface LinkedAddressUpdate {
  address?: string;
  salt?: Uint8Array;
  institution?: string;
  account_identifier?: string;
  account_name?: string;
  owner_address?: string;
  last_indexed_block?: number;
  tx_hash?: string;
  sender_profile_linked_address?: string;
  metadata?: Record<string, unknown>;
  updated_at?: string;
}

// Receive Address Types
export interface ReceiveAddress {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  address: string;
  salt?: Uint8Array;
  status: 'unused' | 'pending' | 'used' | 'expired';
  last_indexed_block?: number;
  last_used?: string;
  valid_until?: string;
  payment_order_receive_address?: string; // UUID references payment_orders.id
  tx_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiveAddressInsert {
  address: string;
  salt?: Uint8Array;
  status?: 'unused' | 'pending' | 'used' | 'expired';
  last_indexed_block?: number;
  last_used?: string;
  valid_until?: string;
  payment_order_receive_address?: string;
  tx_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReceiveAddressUpdate {
  address?: string;
  salt?: Uint8Array;
  status?: 'unused' | 'pending' | 'used' | 'expired';
  last_indexed_block?: number;
  last_used?: string;
  valid_until?: string;
  payment_order_receive_address?: string;
  tx_hash?: string;
  updated_at?: string;
}

// Provider Currency Types
export interface ProviderCurrency {
  id: string; // UUID
  available_balance: number;
  total_balance: number;
  reserved_balance: number;
  is_available: boolean;
  fiat_currency_provider_currencies: string; // UUID references fiat_currencies.id
  provider_profile_provider_currencies: string; // References provider_profiles.id
  updated_at: string;
}

export interface ProviderCurrencyInsert {
  id?: string;
  available_balance: number;
  total_balance: number;
  reserved_balance: number;
  is_available?: boolean;
  fiat_currency_provider_currencies: string;
  provider_profile_provider_currencies: string;
  updated_at?: string;
}

export interface ProviderCurrencyUpdate {
  available_balance?: number;
  total_balance?: number;
  reserved_balance?: number;
  is_available?: boolean;
  fiat_currency_provider_currencies?: string;
  provider_profile_provider_currencies?: string;
  updated_at?: string;
}

// Provider Rating Types
export interface ProviderRating {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  trust_score: number;
  provider_profile_provider_rating: string; // References provider_profiles.id
  created_at: string;
  updated_at: string;
}

export interface ProviderRatingInsert {
  trust_score: number;
  provider_profile_provider_rating: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderRatingUpdate {
  trust_score?: number;
  provider_profile_provider_rating?: string;
  updated_at?: string;
}

// Provision Bucket Types
export interface ProvisionBucket {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  min_amount: number;
  max_amount: number;
  fiat_currency_provision_buckets: string; // UUID references fiat_currencies.id
  created_at: string;
}

export interface ProvisionBucketInsert {
  min_amount: number;
  max_amount: number;
  fiat_currency_provision_buckets: string;
  created_at?: string;
}

export interface ProvisionBucketUpdate {
  min_amount?: number;
  max_amount?: number;
  fiat_currency_provision_buckets?: string;
}

// Provider Order Token Types
export interface ProviderOrderToken {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  fixed_conversion_rate: number;
  floating_conversion_rate: number;
  conversion_rate_type: 'fixed' | 'floating';
  max_order_amount: number;
  min_order_amount: number;
  provider_profile_order_tokens: string; // References provider_profiles.id
  address?: string;
  network: string;
  fiat_currency_provider_order_tokens: string; // UUID references fiat_currencies.id
  token_provider_order_tokens: number; // References tokens.id
  rate_slippage: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderOrderTokenInsert {
  fixed_conversion_rate: number;
  floating_conversion_rate: number;
  conversion_rate_type: 'fixed' | 'floating';
  max_order_amount: number;
  min_order_amount: number;
  provider_profile_order_tokens: string;
  address?: string;
  network: string;
  fiat_currency_provider_order_tokens: string;
  token_provider_order_tokens: number;
  rate_slippage: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderOrderTokenUpdate {
  fixed_conversion_rate?: number;
  floating_conversion_rate?: number;
  conversion_rate_type?: 'fixed' | 'floating';
  max_order_amount?: number;
  min_order_amount?: number;
  provider_profile_order_tokens?: string;
  address?: string;
  network?: string;
  fiat_currency_provider_order_tokens?: string;
  token_provider_order_tokens?: number;
  rate_slippage?: number;
  updated_at?: string;
}

// Sender Order Token Types
export interface SenderOrderToken {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  fee_percent: number;
  fee_address: string;
  refund_address: string;
  sender_profile_order_tokens: string; // UUID references sender_profiles.id
  token_sender_order_tokens: number; // References tokens.id
  created_at: string;
  updated_at: string;
}

export interface SenderOrderTokenInsert {
  fee_percent: number;
  fee_address: string;
  refund_address: string;
  sender_profile_order_tokens: string;
  token_sender_order_tokens: number;
  created_at?: string;
  updated_at?: string;
}

export interface SenderOrderTokenUpdate {
  fee_percent?: number;
  fee_address?: string;
  refund_address?: string;
  sender_profile_order_tokens?: string;
  token_sender_order_tokens?: number;
  updated_at?: string;
}

// Payment Order Recipient Types
export interface PaymentOrderRecipient {
  id: number; // BIGINT GENERATED ALWAYS AS IDENTITY
  institution: string;
  account_identifier: string;
  account_name: string;
  memo?: string;
  provider_id?: string;
  payment_order_recipient: string; // UUID references payment_orders.id
  metadata?: Record<string, unknown>; // JSON
}

export interface PaymentOrderRecipientInsert {
  institution: string;
  account_identifier: string;
  account_name: string;
  memo?: string;
  provider_id?: string;
  payment_order_recipient: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentOrderRecipientUpdate {
  institution?: string;
  account_identifier?: string;
  account_name?: string;
  memo?: string;
  provider_id?: string;
  payment_order_recipient?: string;
  metadata?: Record<string, unknown>;
}

// Lock Order Fulfillment Types
export interface LockOrderFulfillment {
  id: string; // UUID
  tx_id?: string;
  validation_status: 'pending' | 'validated' | 'failed';
  validation_error?: string;
  lock_payment_order_fulfillments: string; // UUID references lock_payment_orders.id
  psp?: string;
  created_at: string;
  updated_at: string;
}

export interface LockOrderFulfillmentInsert {
  id?: string;
  tx_id?: string;
  validation_status?: 'pending' | 'validated' | 'failed';
  validation_error?: string;
  lock_payment_order_fulfillments: string;
  psp?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LockOrderFulfillmentUpdate {
  tx_id?: string;
  validation_status?: 'pending' | 'validated' | 'failed';
  validation_error?: string;
  lock_payment_order_fulfillments?: string;
  psp?: string;
  updated_at?: string;
}

// Identity Verification Request Types
export interface IdentityVerificationRequest {
  id: string; // UUID
  wallet_address: string;
  wallet_signature: string;
  platform: string;
  platform_ref: string;
  verification_url: string;
  status: 'pending' | 'verified' | 'rejected';
  fee_reclaimed: boolean;
  last_url_created_at: string;
  updated_at: string;
}

export interface IdentityVerificationRequestInsert {
  id?: string;
  wallet_address: string;
  wallet_signature: string;
  platform: string;
  platform_ref: string;
  verification_url: string;
  status?: 'pending' | 'verified' | 'rejected';
  fee_reclaimed?: boolean;
  last_url_created_at: string;
  updated_at?: string;
}

export interface IdentityVerificationRequestUpdate {
  wallet_address?: string;
  wallet_signature?: string;
  platform?: string;
  platform_ref?: string;
  verification_url?: string;
  status?: 'pending' | 'verified' | 'rejected';
  fee_reclaimed?: boolean;
  last_url_created_at?: string;
  updated_at?: string;
}

// Auth User Metadata Types (stored in auth.users.raw_user_meta_data)
export interface UserMetadata {
  display_name: string; // Full name (first + last)
  first_name: string;
  last_name: string;
  role?: 'admin' | 'user';
}

// Utility Types
export type KybVerificationStatus = 'not_started' | 'pending' | 'verified' | 'rejected';
export type PaymentOrderStatus = 'initiated' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type LockPaymentOrderStatus = 'pending' | 'locked' | 'fulfilled' | 'cancelled' | 'expired';
export type ProvisionMode = 'auto' | 'manual';
export type VisibilityMode = 'public' | 'private' | 'whitelist';
export type ConversionRateType = 'fixed' | 'floating';
export type ValidationStatus = 'pending' | 'validated' | 'failed';
export type ReceiveAddressStatus = 'unused' | 'pending' | 'used' | 'expired';
export type TransactionLogStatus = 'order_initiated' | 'payment_received' | 'processing' | 'completed' | 'failed';
export type WebhookRetryStatus = 'pending' | 'success' | 'failed' | 'max_retries_reached';
export type VerificationTokenScope = 'email_verification' | 'password_reset' | 'kyb_verification';
export type IdentityVerificationStatus = 'pending' | 'verified' | 'rejected';
export type InstitutionType = 'bank' | 'mobile_money' | 'card' | 'wallet';

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Dashboard Statistics Types
export interface DashboardStats {
  total_payment_orders: number;
  total_volume: number;
  pending_orders: number;
  completed_orders: number;
  failed_orders: number;
  monthly_volume: number;
  monthly_orders: number;
  total_lock_orders: number;
  active_providers: number;
  active_senders: number;
}

// API Key Permissions
export interface ApiKeyPermissions {
  transactions: {
    read: boolean;
    write: boolean;
  };
  profile: {
    read: boolean;
    write: boolean;
  };
  api_keys: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  webhooks: {
    read: boolean;
    write: boolean;
  };
}

// Payment Order Filters
export interface PaymentOrderFilters {
  status?: PaymentOrderStatus[];
  token_id?: number[];
  sender_id?: string[];
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  gateway_id?: string[];
}

// Form Types for Sign Up
export interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  consentChecked: boolean;
}

// Supabase Client Types
export type SupabaseClient = import('@supabase/supabase-js').SupabaseClient<Database>;

// Export the main Database type as default
export default Database;
