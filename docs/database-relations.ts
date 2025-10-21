/**
 * Database Schema Relations and Structure
 * 
 * This file provides a comprehensive overview of all database tables,
 * their relationships, and constraints for the NEDA Integration Dashboard.
 * 
 * Generated from: database-schema.md
 * Last updated: 2025-09-29
 * 
 * This schema supports a full onramp/offramp payment processing system with:
 * - Multi-currency support
 * - Provider and sender management
 * - Payment order processing
 * - Liquidity provisioning
 * - Webhook integrations
 * - Comprehensive transaction logging
 */

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export enum BusinessType {
  SENDER = 'sender',
  PROVIDER = 'provider'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum TransactionType {
  ONRAMP = 'onramp',
  OFFRAMP = 'offramp'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum InstitutionType {
  BANK = 'bank',
  MOBILE_MONEY = 'mobile_money'
}

export enum ValidationStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export enum LockPaymentOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CANCELLED = 'cancelled',
  FULFILLED = 'fulfilled',
  VALIDATED = 'validated',
  SETTLED = 'settled',
  REFUNDED = 'refunded'
}

export enum PaymentOrderStatus {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  PENDING = 'pending',
  VALIDATED = 'validated',
  EXPIRED = 'expired',
  SETTLED = 'settled',
  REFUNDED = 'refunded'
}

export enum ReceiveAddressStatus {
  UNUSED = 'unused',
  USED = 'used',
  EXPIRED = 'expired'
}

export enum ProvisionMode {
  MANUAL = 'manual',
  AUTO = 'auto'
}

export enum VisibilityMode {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

export enum ConversionRateType {
  FIXED = 'fixed',
  FLOATING = 'floating'
}

export enum TransactionLogStatus {
  ORDER_INITIATED = 'order_initiated',
  CRYPTO_DEPOSITED = 'crypto_deposited',
  ORDER_CREATED = 'order_created',
  ORDER_PROCESSING = 'order_processing',
  ORDER_FULFILLED = 'order_fulfilled',
  ORDER_VALIDATED = 'order_validated',
  ORDER_SETTLED = 'order_settled',
  ORDER_REFUNDED = 'order_refunded',
  GAS_PREFUNDED = 'gas_prefunded',
  GATEWAY_APPROVED = 'gateway_approved'
}

export enum WebhookRetryStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export enum VerificationTokenScope {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  KYB_VERIFICATION = 'kyb_verification',
  API_KEY_ACTIVATION = 'api_key_activation'
}

// ============================================================================
// TABLE INTERFACES
// ============================================================================

/**
 * Supabase Auth Users Table (auth.users)
 * Built-in authentication table provided by Supabase Auth
 */
export interface AuthUser {
  id: string; // uuid, PRIMARY KEY
  aud?: string;
  role?: string;
  email: string; // UNIQUE, NOT NULL
  encrypted_password?: string;
  email_confirmed_at?: Date;
  invited_at?: Date;
  confirmation_token?: string;
  confirmation_sent_at?: Date;
  recovery_token?: string;
  recovery_sent_at?: Date;
  email_change_token_new?: string;
  email_change?: string;
  email_change_sent_at?: Date;
  last_sign_in_at?: Date;
  raw_app_meta_data?: Record<string, any>;
  raw_user_meta_data?: UserMetadata;
  is_super_admin?: boolean;
  created_at: Date; // NOT NULL
  updated_at: Date; // NOT NULL
  phone?: string;
  phone_confirmed_at?: Date;
  phone_change?: string;
  phone_change_token?: string;
  phone_change_sent_at?: Date;
  confirmed_at?: Date;
  email_change_token_current?: string;
  email_change_confirm_status?: number;
  banned_until?: Date;
  reauthentication_token?: string;
  reauthentication_sent_at?: Date;
  is_sso_user: boolean; // NOT NULL, DEFAULT false
  deleted_at?: Date;
  is_anonymous: boolean; // NOT NULL, DEFAULT false
}

/**
 * Custom User Metadata stored in auth.users.raw_user_meta_data
 */
export interface UserMetadata {
  display_name: string; // Required: first + last name
  first_name: string; // Required
  last_name: string; // Required
  business_type: BusinessType; // Required: 'sender' or 'provider'
}

/**
 * User Profiles Table (public.user_profiles)
 * Extended user profile information
 */
export interface UserProfile {
  id: string; // uuid, PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE
  business_type: BusinessType; // NOT NULL, CHECK constraint
  company_name?: string; // varchar(255)
  website?: string; // varchar(255)
  phone?: string; // varchar(20)
  address?: string; // text
  country?: string; // varchar(100)
  verification_status: VerificationStatus; // DEFAULT 'pending', CHECK constraint
  api_key?: string; // varchar(255), UNIQUE
  api_secret?: string; // varchar(255), hashed
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * API Keys Table (public.api_keys)
 * API key management for developers
 */
export interface ApiKey {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  user_id: string; // uuid, NOT NULL, REFERENCES user_profiles(id) ON DELETE CASCADE
  key_name: string; // varchar(100), NOT NULL
  api_key: string; // varchar(255), UNIQUE, NOT NULL
  api_secret_hash: string; // varchar(255), NOT NULL
  permissions: Record<string, any>; // jsonb, DEFAULT '{}'
  is_active: boolean; // DEFAULT true
  last_used_at?: Date;
  expires_at?: Date;
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Transactions Table (public.transactions)
 * Transaction records for onramp/offramp operations
 */
export interface Transaction {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  user_id: string; // uuid, NOT NULL, REFERENCES user_profiles(id)
  transaction_type: TransactionType; // NOT NULL, CHECK constraint
  status: TransactionStatus; // NOT NULL, DEFAULT 'pending'
  amount: number; // decimal(20,8), NOT NULL, CHECK (amount > 0)
  currency: string; // varchar(10), NOT NULL (USD, EUR, etc.)
  crypto_currency: string; // varchar(20), NOT NULL (BTC, ETH, etc.)
  crypto_amount?: number; // decimal(20,8)
  exchange_rate?: number; // decimal(20,8)
  fees: number; // decimal(20,8), DEFAULT 0
  external_transaction_id?: string; // varchar(255)
  provider_name?: string; // varchar(100)
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
  completed_at?: Date;
}

/**
 * Audit Logs Table (public.audit_logs)
 * Audit trail for important system events
 */
export interface AuditLog {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  user_id?: string; // uuid, REFERENCES user_profiles(id)
  action: string; // varchar(100), NOT NULL
  resource_type?: string; // varchar(50)
  resource_id?: string; // varchar(255)
  details: Record<string, any>; // jsonb, DEFAULT '{}'
  ip_address?: string; // inet
  user_agent?: string; // text
  created_at: Date; // DEFAULT NOW()
}

/**
 * Fiat Currencies Table (public.fiat_currencies)
 * Supported fiat currencies for the platform
 */
export interface FiatCurrency {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  code: string; // varchar(10), UNIQUE, NOT NULL
  short_name: string; // varchar(20), UNIQUE, NOT NULL
  decimals: number; // integer, DEFAULT 2
  symbol: string; // varchar(10), NOT NULL
  name: string; // varchar(100), NOT NULL
  market_rate: number; // decimal(20,8), NOT NULL
  is_enabled: boolean; // DEFAULT false
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Institutions Table (public.institutions)
 * Banks and mobile money providers
 */
export interface Institution {
  code: string; // varchar(50), PRIMARY KEY
  name: string; // varchar(255), NOT NULL
  type: InstitutionType; // DEFAULT 'bank'
  fiat_currency_id?: string; // uuid, FOREIGN KEY
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Networks Table (public.networks)
 * Blockchain networks supported by the platform
 */
export interface Network {
  chain_id: bigint; // PRIMARY KEY
  identifier: string; // varchar(50), UNIQUE, NOT NULL
  rpc_endpoint: string; // varchar(255), NOT NULL
  gateway_contract_address: string; // varchar(60), DEFAULT ''
  block_time: number; // decimal(10,2), NOT NULL
  is_testnet: boolean; // NOT NULL
  bundler_url?: string; // varchar(255)
  paymaster_url?: string; // varchar(255)
  fee: number; // decimal(20,8), NOT NULL
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Tokens Table (public.tokens)
 * Cryptocurrency tokens supported on various networks
 */
export interface Token {
  id: string; // varchar(50), PRIMARY KEY
  symbol: string; // varchar(10), NOT NULL
  contract_address: string; // varchar(60), NOT NULL
  decimals: number; // smallint, NOT NULL
  is_enabled: boolean; // DEFAULT false
  base_currency: string; // varchar(10), DEFAULT 'USD'
  network_id: bigint; // FOREIGN KEY, NOT NULL
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Linked Addresses Table (public.linked_addresses)
 * Crypto addresses linked to traditional payment accounts
 */
export interface LinkedAddress {
  address: string; // varchar(60), PRIMARY KEY
  salt?: Buffer; // bytea
  institution: string; // varchar(50), NOT NULL
  account_identifier: string; // varchar(100), NOT NULL
  account_name: string; // varchar(255), NOT NULL
  metadata?: Record<string, any>; // jsonb
  owner_address: string; // varchar(60), UNIQUE, NOT NULL
  last_indexed_block?: bigint;
  tx_hash?: string; // varchar(70)
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Receive Addresses Table (public.receive_addresses)
 * Generated addresses for receiving crypto payments
 */
export interface ReceiveAddress {
  address: string; // varchar(60), PRIMARY KEY
  salt?: Buffer; // bytea
  status: ReceiveAddressStatus; // DEFAULT 'unused'
  last_indexed_block?: bigint;
  last_used?: Date;
  tx_hash?: string; // varchar(70)
  valid_until?: Date;
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Provider Profiles Table (public.provider_profiles)
 * Liquidity provider profiles
 */
export interface ProviderProfile {
  id: string; // varchar(50), PRIMARY KEY
  user_id: string; // uuid, UNIQUE, FOREIGN KEY, NOT NULL
  trading_name?: string; // varchar(80)
  host_identifier?: string; // varchar(100)
  provision_mode: ProvisionMode; // DEFAULT 'auto'
  is_active: boolean; // DEFAULT false
  is_kyb_verified: boolean; // DEFAULT false
  visibility_mode: VisibilityMode; // DEFAULT 'public'
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Provider Currencies Table (public.provider_currencies)
 * Provider currency balances and availability
 */
export interface ProviderCurrency {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  provider_id: string; // varchar(50), FOREIGN KEY, NOT NULL
  currency_id: string; // uuid, FOREIGN KEY, NOT NULL
  available_balance: number; // decimal(20,8), NOT NULL
  total_balance: number; // decimal(20,8), NOT NULL
  reserved_balance: number; // decimal(20,8), NOT NULL
  is_available: boolean; // DEFAULT true
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Provider Ratings Table (public.provider_ratings)
 * Provider trust scores and ratings
 */
export interface ProviderRating {
  id: string; // varchar(50), PRIMARY KEY
  provider_profile_id: string; // varchar(50), UNIQUE, FOREIGN KEY, NOT NULL
  trust_score: number; // decimal(5,2), NOT NULL
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Provision Buckets Table (public.provision_buckets)
 * Liquidity provision buckets for different currencies
 */
export interface ProvisionBucket {
  id: string; // varchar(50), PRIMARY KEY
  currency_id: string; // uuid, FOREIGN KEY, NOT NULL
  min_amount: number; // decimal(20,8), NOT NULL
  max_amount: number; // decimal(20,8), NOT NULL
  created_at: Date; // DEFAULT NOW()
}

/**
 * Sender Profiles Table (public.sender_profiles)
 * Merchant/sender profiles
 */
export interface SenderProfile {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  user_id: string; // uuid, UNIQUE, FOREIGN KEY, NOT NULL
  webhook_url?: string; // varchar(255)
  domain_whitelist: string[]; // text[], DEFAULT '{}'
  provider_id?: string; // varchar(50)
  is_partner: boolean; // DEFAULT false
  is_active: boolean; // DEFAULT false
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Sender Order Tokens Table (public.sender_order_tokens)
 * Sender token configurations
 */
export interface SenderOrderToken {
  id: string; // varchar(50), PRIMARY KEY
  sender_id: string; // uuid, FOREIGN KEY, NOT NULL
  token_id: string; // varchar(50), FOREIGN KEY, NOT NULL
  fee_percent: number; // decimal(5,4), NOT NULL
  fee_address: string; // varchar(60), NOT NULL
  refund_address: string; // varchar(60), NOT NULL
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Provider Order Tokens Table (public.provider_order_tokens)
 * Provider token configurations
 */
export interface ProviderOrderToken {
  id: string; // varchar(50), PRIMARY KEY
  provider_id: string; // varchar(50), FOREIGN KEY, NOT NULL
  token_id: string; // varchar(50), FOREIGN KEY, NOT NULL
  currency_id: string; // uuid, FOREIGN KEY, NOT NULL
  network: string; // varchar(50), NOT NULL
  fixed_conversion_rate: number; // decimal(20,8), NOT NULL
  floating_conversion_rate: number; // decimal(20,8), NOT NULL
  conversion_rate_type: ConversionRateType; // NOT NULL
  max_order_amount: number; // decimal(20,8), NOT NULL
  min_order_amount: number; // decimal(20,8), NOT NULL
  rate_slippage: number; // decimal(5,4), NOT NULL
  address?: string; // varchar(60)
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Payment Orders Table (public.payment_orders)
 * Main payment order records
 */
export interface PaymentOrder {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  sender_profile_id?: string; // uuid, FOREIGN KEY
  token_id: string; // varchar(50), FOREIGN KEY, NOT NULL
  linked_address_id?: string; // varchar(60), FOREIGN KEY
  receive_address_id?: string; // varchar(60), UNIQUE, FOREIGN KEY
  payment_webhook_id?: string; // uuid, UNIQUE, FOREIGN KEY
  api_key_id?: string; // uuid, FOREIGN KEY
  amount: number; // decimal(20,8), NOT NULL
  amount_paid: number; // decimal(20,8), NOT NULL
  amount_returned: number; // decimal(20,8), NOT NULL
  percent_settled: number; // decimal(5,4), NOT NULL
  sender_fee: number; // decimal(20,8), NOT NULL
  network_fee: number; // decimal(20,8), NOT NULL
  rate: number; // decimal(20,8), NOT NULL
  tx_hash?: string; // varchar(70)
  block_number: bigint; // DEFAULT 0
  from_address?: string; // varchar(60)
  return_address?: string; // varchar(60)
  receive_address_text: string; // varchar(60), NOT NULL
  fee_percent: number; // decimal(5,4), NOT NULL
  fee_address?: string; // varchar(60)
  gateway_id?: string; // varchar(70)
  message_hash?: string; // varchar(400)
  reference?: string; // varchar(70)
  status: PaymentOrderStatus; // DEFAULT 'initiated'
  amount_in_usd: number; // decimal(20,8), NOT NULL
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Payment Order Recipients Table (public.payment_order_recipients)
 * Payment order recipient information
 */
export interface PaymentOrderRecipient {
  id: string; // varchar(50), PRIMARY KEY
  payment_order_id: string; // uuid, UNIQUE, FOREIGN KEY, NOT NULL
  institution: string; // varchar(50), NOT NULL
  account_identifier: string; // varchar(100), NOT NULL
  account_name: string; // varchar(255), NOT NULL
  memo?: string; // text
  provider_id?: string; // varchar(50)
  metadata?: Record<string, any>; // jsonb
}

/**
 * Lock Payment Orders Table (public.lock_payment_orders)
 * Lock payment orders for escrow-style transactions
 */
export interface LockPaymentOrder {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  token_id: string; // varchar(50), FOREIGN KEY, NOT NULL
  provision_bucket_id?: string; // varchar(50), FOREIGN KEY
  provider_id?: string; // varchar(50), FOREIGN KEY
  gateway_id: string; // varchar(70), NOT NULL
  amount: number; // decimal(20,8), NOT NULL
  protocol_fee: number; // decimal(20,8), NOT NULL
  rate: number; // decimal(20,8), NOT NULL
  order_percent: number; // decimal(5,4), NOT NULL
  sender?: string; // varchar(60)
  tx_hash?: string; // varchar(70)
  status: LockPaymentOrderStatus; // DEFAULT 'pending'
  block_number: bigint; // NOT NULL
  institution: string; // varchar(50), NOT NULL
  account_identifier: string; // varchar(100), NOT NULL
  account_name: string; // varchar(255), NOT NULL
  memo?: string; // text
  metadata?: Record<string, any>; // jsonb
  cancellation_count: number; // DEFAULT 0
  cancellation_reasons: string[]; // text[], DEFAULT '{}'
  message_hash?: string; // varchar(400)
  amount_in_usd: number; // decimal(20,8), NOT NULL
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Lock Order Fulfillments Table (public.lock_order_fulfillments)
 * Fulfillment records for lock orders
 */
export interface LockOrderFulfillment {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  order_id: string; // uuid, FOREIGN KEY, NOT NULL
  tx_id?: string; // varchar(70)
  psp?: string; // varchar(100)
  validation_status: ValidationStatus; // DEFAULT 'pending'
  validation_error?: string; // text
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Payment Webhooks Table (public.payment_webhooks)
 * Webhook configurations for payment notifications
 */
export interface PaymentWebhook {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  network_id?: bigint; // FOREIGN KEY
  webhook_id: string; // varchar(100), NOT NULL
  webhook_secret: string; // varchar(100), NOT NULL
  callback_url: string; // varchar(255), NOT NULL
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Webhook Retry Attempts Table (public.webhook_retry_attempts)
 * Webhook retry attempt tracking
 */
export interface WebhookRetryAttempt {
  id: string; // varchar(50), PRIMARY KEY
  attempt_number: number; // integer, NOT NULL
  next_retry_time: Date; // DEFAULT NOW()
  payload: Record<string, any>; // jsonb, NOT NULL
  signature?: string; // varchar(255)
  webhook_url: string; // varchar(255), NOT NULL
  status: WebhookRetryStatus; // DEFAULT 'failed'
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

/**
 * Transaction Logs Table (public.transaction_logs)
 * Detailed transaction logging
 */
export interface TransactionLog {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  payment_order_id?: string; // uuid, FOREIGN KEY
  lock_payment_order_id?: string; // uuid, FOREIGN KEY
  gateway_id?: string; // varchar(70)
  status: TransactionLogStatus; // DEFAULT 'order_initiated'
  network?: string; // varchar(50)
  tx_hash?: string; // varchar(70)
  metadata: Record<string, any>; // jsonb, NOT NULL
  created_at: Date; // DEFAULT NOW()
}

/**
 * Verification Tokens Table (public.verification_tokens)
 * Token verification for various processes
 */
export interface VerificationToken {
  id: string; // uuid, PRIMARY KEY, DEFAULT gen_random_uuid()
  owner_id: string; // uuid, FOREIGN KEY, NOT NULL
  token: string; // varchar(255), NOT NULL
  scope: VerificationTokenScope; // NOT NULL
  expiry_at: Date; // NOT NULL
  created_at: Date; // DEFAULT NOW()
  updated_at: Date; // DEFAULT NOW()
}

// ============================================================================
// RELATIONSHIPS AND CONSTRAINTS
// ============================================================================

/**
 * Database Relationships Map
 * Defines all foreign key relationships between tables
 */
export const DATABASE_RELATIONSHIPS = {
  // auth.users (1) -> user_profiles (1)
  AUTH_USER_TO_PROFILE: {
    parentTable: 'auth.users',
    parentKey: 'id',
    childTable: 'public.user_profiles',
    childKey: 'id',
    relationship: '1:1',
    onDelete: 'CASCADE',
    description: 'Each auth user has exactly one profile'
  },

  // user_profiles (1) -> api_keys (many)
  PROFILE_TO_API_KEYS: {
    parentTable: 'public.user_profiles',
    parentKey: 'id',
    childTable: 'public.api_keys',
    childKey: 'user_id',
    relationship: '1:many',
    onDelete: 'CASCADE',
    description: 'Each user profile can have multiple API keys'
  },

  // user_profiles (1) -> transactions (many)
  PROFILE_TO_TRANSACTIONS: {
    parentTable: 'public.user_profiles',
    parentKey: 'id',
    childTable: 'public.transactions',
    childKey: 'user_id',
    relationship: '1:many',
    onDelete: 'RESTRICT', // Transactions should not be deleted when user is deleted
    description: 'Each user profile can have multiple transactions'
  },

  // user_profiles (1) -> audit_logs (many)
  PROFILE_TO_AUDIT_LOGS: {
    parentTable: 'public.user_profiles',
    parentKey: 'id',
    childTable: 'public.audit_logs',
    childKey: 'user_id',
    relationship: '1:many',
    onDelete: 'SET NULL', // Audit logs should remain even if user is deleted
    description: 'Each user profile can have multiple audit log entries'
  }
} as const;

/**
 * Database Indexes for Performance
 */
export const DATABASE_INDEXES = {
  // User Profiles Indexes
  USER_PROFILES: [
    'idx_user_profiles_business_type',
    'idx_user_profiles_verification_status',
    'idx_user_profiles_created_at'
  ],

  // API Keys Indexes
  API_KEYS: [
    'idx_api_keys_user_id',
    'idx_api_keys_is_active',
    'idx_api_keys_expires_at'
  ],

  // Transactions Indexes
  TRANSACTIONS: [
    'idx_transactions_user_id',
    'idx_transactions_status',
    'idx_transactions_type',
    'idx_transactions_created_at',
    'idx_transactions_currency'
  ],

  // Audit Logs Indexes
  AUDIT_LOGS: [
    'idx_audit_logs_user_id',
    'idx_audit_logs_action',
    'idx_audit_logs_created_at'
  ]
} as const;

/**
 * Row Level Security (RLS) Policies Summary
 */
export const RLS_POLICIES = {
  USER_PROFILES: {
    description: 'Users can only view and update their own profile. Admins can view all profiles.',
    policies: ['own_profile_access', 'admin_full_access']
  },
  
  API_KEYS: {
    description: 'Users can only manage their own API keys. Admins can view all API keys.',
    policies: ['own_api_keys_access', 'admin_view_access']
  },
  
  TRANSACTIONS: {
    description: 'Users can only view their own transactions. Admins can view all transactions.',
    policies: ['own_transactions_access', 'admin_view_access']
  },
  
  AUDIT_LOGS: {
    description: 'Users can only view their own audit logs. Admins can view all audit logs.',
    policies: ['own_audit_logs_access', 'admin_view_access']
  }
} as const;

/**
 * Database Triggers
 */
export const DATABASE_TRIGGERS = {
  UPDATED_AT_TRIGGERS: [
    'update_user_profiles_updated_at',
    'update_api_keys_updated_at',
    'update_transactions_updated_at'
  ],
  
  TRIGGER_FUNCTION: 'update_updated_at_column()',
  
  description: 'Automatically updates the updated_at timestamp when records are modified'
} as const;

// ============================================================================
// UTILITY TYPES AND HELPERS
// ============================================================================

/**
 * Complete database schema type combining all tables
 */
export interface DatabaseSchema {
  auth: {
    users: AuthUser;
  };
  public: {
    user_profiles: UserProfile;
    api_keys: ApiKey;
    transactions: Transaction;
    audit_logs: AuditLog;
    fiat_currencies: FiatCurrency;
    institutions: Institution;
    networks: Network;
    tokens: Token;
    linked_addresses: LinkedAddress;
    receive_addresses: ReceiveAddress;
    provider_profiles: ProviderProfile;
    provider_currencies: ProviderCurrency;
    provider_ratings: ProviderRating;
    provision_buckets: ProvisionBucket;
    sender_profiles: SenderProfile;
    sender_order_tokens: SenderOrderToken;
    provider_order_tokens: ProviderOrderToken;
    payment_orders: PaymentOrder;
    payment_order_recipients: PaymentOrderRecipient;
    lock_payment_orders: LockPaymentOrder;
    lock_order_fulfillments: LockOrderFulfillment;
    payment_webhooks: PaymentWebhook;
    webhook_retry_attempts: WebhookRetryAttempt;
    transaction_logs: TransactionLog;
    verification_tokens: VerificationToken;
  };
}

/**
 * Table names as constants for type safety
 */
export const TABLE_NAMES = {
  AUTH_USERS: 'auth.users',
  USER_PROFILES: 'public.user_profiles',
  API_KEYS: 'public.api_keys',
  TRANSACTIONS: 'public.transactions',
  AUDIT_LOGS: 'public.audit_logs',
  FIAT_CURRENCIES: 'public.fiat_currencies',
  INSTITUTIONS: 'public.institutions',
  NETWORKS: 'public.networks',
  TOKENS: 'public.tokens',
  LINKED_ADDRESSES: 'public.linked_addresses',
  RECEIVE_ADDRESSES: 'public.receive_addresses',
  PROVIDER_PROFILES: 'public.provider_profiles',
  PROVIDER_CURRENCIES: 'public.provider_currencies',
  PROVIDER_RATINGS: 'public.provider_ratings',
  PROVISION_BUCKETS: 'public.provision_buckets',
  SENDER_PROFILES: 'public.sender_profiles',
  SENDER_ORDER_TOKENS: 'public.sender_order_tokens',
  PROVIDER_ORDER_TOKENS: 'public.provider_order_tokens',
  PAYMENT_ORDERS: 'public.payment_orders',
  PAYMENT_ORDER_RECIPIENTS: 'public.payment_order_recipients',
  LOCK_PAYMENT_ORDERS: 'public.lock_payment_orders',
  LOCK_ORDER_FULFILLMENTS: 'public.lock_order_fulfillments',
  PAYMENT_WEBHOOKS: 'public.payment_webhooks',
  WEBHOOK_RETRY_ATTEMPTS: 'public.webhook_retry_attempts',
  TRANSACTION_LOGS: 'public.transaction_logs',
  VERIFICATION_TOKENS: 'public.verification_tokens'
} as const;

/**
 * Helper type to get table type by name
 */
export type TableType<T extends keyof typeof TABLE_NAMES> = 
  T extends 'AUTH_USERS' ? AuthUser :
  T extends 'USER_PROFILES' ? UserProfile :
  T extends 'API_KEYS' ? ApiKey :
  T extends 'TRANSACTIONS' ? Transaction :
  T extends 'AUDIT_LOGS' ? AuditLog :
  never;

/**
 * Security considerations and best practices
 */
export const SECURITY_NOTES = {
  API_SECRETS: 'All API secrets should be hashed using bcrypt or similar',
  API_KEY_GENERATION: 'API keys should be generated using cryptographically secure random generators',
  DATA_ENCRYPTION: 'Sensitive data should be encrypted at rest',
  SSL_TLS: 'All database connections should use SSL/TLS',
  AUDIT_REVIEWS: 'Regular security audits should be performed on the audit_logs table'
} as const;

/**
 * Migration and setup notes
 */
export const MIGRATION_NOTES = {
  BUSINESS_TYPE_POPULATION: 'The business_type field will be populated from the sign-up form',
  DISPLAY_NAME_FORMAT: 'The display_name in auth.users metadata will be set to first_name + " " + last_name',
  EXISTING_USERS: 'Existing users (if any) will need to have their business_type set manually or through a migration script',
  API_KEY_GENERATION: 'API keys should be generated automatically upon profile creation for verified users'
} as const;

export default {
  BusinessType,
  VerificationStatus,
  TransactionType,
  TransactionStatus,
  InstitutionType,
  ValidationStatus,
  LockPaymentOrderStatus,
  PaymentOrderStatus,
  ReceiveAddressStatus,
  ProvisionMode,
  VisibilityMode,
  ConversionRateType,
  TransactionLogStatus,
  WebhookRetryStatus,
  VerificationTokenScope,
  DATABASE_RELATIONSHIPS,
  DATABASE_INDEXES,
  RLS_POLICIES,
  DATABASE_TRIGGERS,
  TABLE_NAMES,
  SECURITY_NOTES,
  MIGRATION_NOTES
};
