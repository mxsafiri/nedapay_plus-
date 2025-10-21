# Database Schema Documentation

## Overview
This document outlines the database schema for the NEDA Integration Dashboard, a comprehensive onramp and offramp rails API dashboard for developers. The schema supports full payment processing, provider management, liquidity provisioning, and transaction tracking.

## Supabase Auth Schema

### auth.users (Built-in Supabase Table)
The main authentication table provided by Supabase Auth.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key, user identifier | PRIMARY KEY, NOT NULL |
| aud | varchar | Audience claim | |
| role | varchar | User role | |
| email | varchar | User email address | UNIQUE, NOT NULL |
| encrypted_password | varchar | Encrypted password | |
| email_confirmed_at | timestamptz | Email confirmation timestamp | |
| invited_at | timestamptz | User invitation timestamp | |
| confirmation_token | varchar | Email confirmation token | |
| confirmation_sent_at | timestamptz | Confirmation email sent timestamp | |
| recovery_token | varchar | Password recovery token | |
| recovery_sent_at | timestamptz | Recovery email sent timestamp | |
| email_change_token_new | varchar | New email change token | |
| email_change | varchar | New email address during change | |
| email_change_sent_at | timestamptz | Email change notification sent timestamp | |
| last_sign_in_at | timestamptz | Last successful sign-in timestamp | |
| raw_app_meta_data | jsonb | Application metadata | |
| raw_user_meta_data | jsonb | User metadata (custom fields) | |
| is_super_admin | boolean | Super admin flag | |
| created_at | timestamptz | Account creation timestamp | NOT NULL |
| updated_at | timestamptz | Last update timestamp | NOT NULL |
| phone | text | Phone number | |
| phone_confirmed_at | timestamptz | Phone confirmation timestamp | |
| phone_change | text | New phone number during change | |
| phone_change_token | varchar | Phone change token | |
| phone_change_sent_at | timestamptz | Phone change notification sent timestamp | |
| confirmed_at | timestamptz | Account confirmation timestamp | |
| email_change_token_current | varchar | Current email change token | |
| email_change_confirm_status | smallint | Email change confirmation status | |
| banned_until | timestamptz | Account ban expiration | |
| reauthentication_token | varchar | Reauthentication token | |
| reauthentication_sent_at | timestamptz | Reauthentication sent timestamp | |
| is_sso_user | boolean | SSO user flag | NOT NULL, DEFAULT false |
| deleted_at | timestamptz | Soft delete timestamp | |
| is_anonymous | boolean | Anonymous user flag | NOT NULL, DEFAULT false |

### Custom User Metadata Fields
These fields are stored in the `raw_user_meta_data` jsonb column:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| display_name | string | Full name (first + last) | Yes |
| first_name | string | User's first name | Yes |
| last_name | string | User's last name | Yes |
| business_type | string | Type of business: "sender" or "provider" | Yes |

## Custom Tables

### public.user_profiles
Extended user profile information beyond what's stored in auth.users.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key, references auth.users.id | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE |
| business_type | varchar(20) | Type of business: 'sender' or 'provider' | NOT NULL, CHECK (business_type IN ('sender', 'provider')) |
| company_name | varchar(255) | Company/organization name | |
| website | varchar(255) | Company website URL | |
| phone | varchar(20) | Business phone number | |
| address | text | Business address | |
| country | varchar(100) | Country of operation | |
| verification_status | varchar(20) | Account verification status | DEFAULT 'pending', CHECK (verification_status IN ('pending', 'verified', 'rejected')) |
| api_key | varchar(255) | API key for dashboard access | UNIQUE |
| api_secret | varchar(255) | API secret (hashed) | |
| created_at | timestamptz | Profile creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.api_keys
API key management for developers.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | References user_profiles.id | NOT NULL, REFERENCES user_profiles(id) ON DELETE CASCADE |
| key_name | varchar(100) | Descriptive name for the API key | NOT NULL |
| api_key | varchar(255) | The actual API key | UNIQUE, NOT NULL |
| api_secret_hash | varchar(255) | Hashed API secret | NOT NULL |
| permissions | jsonb | API permissions and scopes | DEFAULT '{}' |
| is_active | boolean | Whether the key is active | DEFAULT true |
| last_used_at | timestamptz | Last usage timestamp | |
| expires_at | timestamptz | Key expiration timestamp | |
| created_at | timestamptz | Key creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.transactions
Transaction records for onramp/offramp operations.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | References user_profiles.id | NOT NULL, REFERENCES user_profiles(id) |
| transaction_type | varchar(20) | 'onramp' or 'offramp' | NOT NULL, CHECK (transaction_type IN ('onramp', 'offramp')) |
| status | varchar(20) | Transaction status | NOT NULL, DEFAULT 'pending' |
| amount | decimal(20,8) | Transaction amount | NOT NULL, CHECK (amount > 0) |
| currency | varchar(10) | Currency code (USD, EUR, etc.) | NOT NULL |
| crypto_currency | varchar(20) | Cryptocurrency code (BTC, ETH, etc.) | NOT NULL |
| crypto_amount | decimal(20,8) | Cryptocurrency amount | |
| exchange_rate | decimal(20,8) | Exchange rate at time of transaction | |
| fees | decimal(20,8) | Transaction fees | DEFAULT 0 |
| external_transaction_id | varchar(255) | External provider transaction ID | |
| provider_name | varchar(100) | Payment provider name | |
| created_at | timestamptz | Transaction creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |
| completed_at | timestamptz | Transaction completion timestamp | |

### public.audit_logs
Audit trail for important system events.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | References user_profiles.id | REFERENCES user_profiles(id) |
| action | varchar(100) | Action performed | NOT NULL |
| resource_type | varchar(50) | Type of resource affected | |
| resource_id | varchar(255) | ID of the affected resource | |
| details | jsonb | Additional details about the action | DEFAULT '{}' |
| ip_address | inet | IP address of the user | |
| user_agent | text | User agent string | |
| created_at | timestamptz | Log entry timestamp | DEFAULT NOW() |

## Indexes

### Performance Indexes
```sql
-- User profiles
CREATE INDEX idx_user_profiles_business_type ON public.user_profiles(business_type);
CREATE INDEX idx_user_profiles_verification_status ON public.user_profiles(verification_status);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

-- API keys
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON public.api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON public.api_keys(expires_at);

-- Transactions
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_currency ON public.transactions(currency);

-- Audit logs
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
```

## Row Level Security (RLS) Policies

### user_profiles
- Users can only view and update their own profile
- Admins can view all profiles

### api_keys
- Users can only manage their own API keys
- Admins can view all API keys

### transactions
- Users can only view their own transactions
- Admins can view all transactions

### audit_logs
- Users can only view their own audit logs
- Admins can view all audit logs

## Triggers

### Updated At Triggers
Automatically update the `updated_at` timestamp when records are modified:

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Data Migration Notes

1. The `business_type` field will be populated from the sign-up form
2. The `display_name` in auth.users metadata will be set to `first_name + " " + last_name`
3. Existing users (if any) will need to have their business_type set manually or through a migration script
4. API keys should be generated automatically upon profile creation for verified users

## Core Payment Processing Tables

### public.fiat_currencies
Supported fiat currencies for the platform.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PRIMARY KEY, DEFAULT gen_random_uuid() |
| code | varchar(10) | Currency code (USD, EUR, etc.) | UNIQUE, NOT NULL |
| short_name | varchar(20) | Short display name | UNIQUE, NOT NULL |
| decimals | integer | Number of decimal places | DEFAULT 2 |
| symbol | varchar(10) | Currency symbol | NOT NULL |
| name | varchar(100) | Full currency name | NOT NULL |
| market_rate | decimal(20,8) | Current market rate | NOT NULL |
| is_enabled | boolean | Whether currency is active | DEFAULT false |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.institutions
Banks and mobile money providers.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| code | varchar(50) | Institution code | PRIMARY KEY |
| name | varchar(255) | Institution name | NOT NULL |
| type | institution_type | Type: bank or mobile_money | DEFAULT 'bank' |
| fiat_currency_id | uuid | References fiat_currencies.id | FOREIGN KEY |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.networks
Blockchain networks supported by the platform.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| chain_id | bigint | Blockchain chain ID | PRIMARY KEY |
| identifier | varchar(50) | Network identifier | UNIQUE, NOT NULL |
| rpc_endpoint | varchar(255) | RPC endpoint URL | NOT NULL |
| gateway_contract_address | varchar(60) | Gateway contract address | DEFAULT '' |
| block_time | decimal(10,2) | Average block time | NOT NULL |
| is_testnet | boolean | Whether it's a testnet | NOT NULL |
| bundler_url | varchar(255) | Bundler URL | |
| paymaster_url | varchar(255) | Paymaster URL | |
| fee | decimal(20,8) | Network fee | NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.tokens
Cryptocurrency tokens supported on various networks.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | varchar(50) | Token identifier | PRIMARY KEY |
| symbol | varchar(10) | Token symbol | NOT NULL |
| contract_address | varchar(60) | Smart contract address | NOT NULL |
| decimals | smallint | Token decimals | NOT NULL |
| is_enabled | boolean | Whether token is active | DEFAULT false |
| base_currency | varchar(10) | Base currency for pricing | DEFAULT 'USD' |
| network_id | bigint | References networks.chain_id | FOREIGN KEY, NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.linked_addresses
Crypto addresses linked to traditional payment accounts.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| address | varchar(60) | Crypto address | PRIMARY KEY |
| salt | bytea | Salt for address generation | |
| institution | varchar(50) | Institution code | NOT NULL |
| account_identifier | varchar(100) | Account identifier | NOT NULL |
| account_name | varchar(255) | Account holder name | NOT NULL |
| metadata | jsonb | Additional metadata | |
| owner_address | varchar(60) | Owner's crypto address | UNIQUE, NOT NULL |
| last_indexed_block | bigint | Last indexed block number | |
| tx_hash | varchar(70) | Transaction hash | |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.receive_addresses
Generated addresses for receiving crypto payments.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| address | varchar(60) | Receive address | PRIMARY KEY |
| salt | bytea | Salt for address generation | |
| status | receive_address_status | Address status | DEFAULT 'unused' |
| last_indexed_block | bigint | Last indexed block number | |
| last_used | timestamptz | Last usage timestamp | |
| tx_hash | varchar(70) | Transaction hash | |
| valid_until | timestamptz | Address expiration | |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

## Provider Management Tables

### public.provider_profiles
Liquidity provider profiles.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | varchar(50) | Provider identifier | PRIMARY KEY |
| user_id | uuid | References user_profiles.id | UNIQUE, FOREIGN KEY, NOT NULL |
| trading_name | varchar(80) | Trading name | |
| host_identifier | varchar(100) | Host identifier | |
| provision_mode | provision_mode | Provisioning mode | DEFAULT 'auto' |
| is_active | boolean | Whether provider is active | DEFAULT false |
| is_kyb_verified | boolean | KYB verification status | DEFAULT false |
| visibility_mode | visibility_mode | Visibility setting | DEFAULT 'public' |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.provider_currencies
Provider currency balances and availability.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PRIMARY KEY, DEFAULT gen_random_uuid() |
| provider_id | varchar(50) | References provider_profiles.id | FOREIGN KEY, NOT NULL |
| currency_id | uuid | References fiat_currencies.id | FOREIGN KEY, NOT NULL |
| available_balance | decimal(20,8) | Available balance | NOT NULL |
| total_balance | decimal(20,8) | Total balance | NOT NULL |
| reserved_balance | decimal(20,8) | Reserved balance | NOT NULL |
| is_available | boolean | Whether currency is available | DEFAULT true |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.provider_ratings
Provider trust scores and ratings.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | varchar(50) | Rating identifier | PRIMARY KEY |
| provider_profile_id | varchar(50) | References provider_profiles.id | UNIQUE, FOREIGN KEY, NOT NULL |
| trust_score | decimal(5,2) | Trust score | NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.provision_buckets
Liquidity provision buckets for different currencies.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | varchar(50) | Bucket identifier | PRIMARY KEY |
| currency_id | uuid | References fiat_currencies.id | FOREIGN KEY, NOT NULL |
| min_amount | decimal(20,8) | Minimum amount | NOT NULL |
| max_amount | decimal(20,8) | Maximum amount | NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |

### public.provision_bucket_providers
Many-to-many relationship between buckets and providers.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| provision_bucket_id | varchar(50) | References provision_buckets.id | FOREIGN KEY, NOT NULL |
| provider_profile_id | varchar(50) | References provider_profiles.id | FOREIGN KEY, NOT NULL |

## Sender Management Tables

### public.sender_profiles
Merchant/sender profiles.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Sender identifier | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | References user_profiles.id | UNIQUE, FOREIGN KEY, NOT NULL |
| webhook_url | varchar(255) | Webhook URL | |
| domain_whitelist | text[] | Whitelisted domains | DEFAULT '{}' |
| provider_id | varchar(50) | Preferred provider | |
| is_partner | boolean | Partner status | DEFAULT false |
| is_active | boolean | Whether sender is active | DEFAULT false |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.sender_order_tokens
Sender token configurations.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | varchar(50) | Configuration identifier | PRIMARY KEY |
| sender_id | uuid | References sender_profiles.id | FOREIGN KEY, NOT NULL |
| token_id | varchar(50) | References tokens.id | FOREIGN KEY, NOT NULL |
| fee_percent | decimal(5,4) | Fee percentage | NOT NULL |
| fee_address | varchar(60) | Fee collection address | NOT NULL |
| refund_address | varchar(60) | Refund address | NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.provider_order_tokens
Provider token configurations.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | varchar(50) | Configuration identifier | PRIMARY KEY |
| provider_id | varchar(50) | References provider_profiles.id | FOREIGN KEY, NOT NULL |
| token_id | varchar(50) | References tokens.id | FOREIGN KEY, NOT NULL |
| currency_id | uuid | References fiat_currencies.id | FOREIGN KEY, NOT NULL |
| network | varchar(50) | Network identifier | NOT NULL |
| fixed_conversion_rate | decimal(20,8) | Fixed conversion rate | NOT NULL |
| floating_conversion_rate | decimal(20,8) | Floating conversion rate | NOT NULL |
| conversion_rate_type | conversion_rate_type | Rate type | NOT NULL |
| max_order_amount | decimal(20,8) | Maximum order amount | NOT NULL |
| min_order_amount | decimal(20,8) | Minimum order amount | NOT NULL |
| rate_slippage | decimal(5,4) | Rate slippage tolerance | NOT NULL |
| address | varchar(60) | Provider address | |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

## Payment Processing Tables

### public.payment_orders
Main payment order records.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Order identifier | PRIMARY KEY, DEFAULT gen_random_uuid() |
| sender_profile_id | uuid | References sender_profiles.id | FOREIGN KEY |
| token_id | varchar(50) | References tokens.id | FOREIGN KEY, NOT NULL |
| linked_address_id | varchar(60) | References linked_addresses.address | FOREIGN KEY |
| receive_address_id | varchar(60) | References receive_addresses.address | UNIQUE, FOREIGN KEY |
| payment_webhook_id | uuid | References payment_webhooks.id | UNIQUE, FOREIGN KEY |
| api_key_id | uuid | References api_keys.id | FOREIGN KEY |
| amount | decimal(20,8) | Order amount | NOT NULL |
| amount_paid | decimal(20,8) | Amount paid | NOT NULL |
| amount_returned | decimal(20,8) | Amount returned | NOT NULL |
| percent_settled | decimal(5,4) | Settlement percentage | NOT NULL |
| sender_fee | decimal(20,8) | Sender fee | NOT NULL |
| network_fee | decimal(20,8) | Network fee | NOT NULL |
| rate | decimal(20,8) | Exchange rate | NOT NULL |
| tx_hash | varchar(70) | Transaction hash | |
| block_number | bigint | Block number | DEFAULT 0 |
| from_address | varchar(60) | Sender address | |
| return_address | varchar(60) | Return address | |
| receive_address_text | varchar(60) | Receive address | NOT NULL |
| fee_percent | decimal(5,4) | Fee percentage | NOT NULL |
| fee_address | varchar(60) | Fee address | |
| gateway_id | varchar(70) | Gateway identifier | |
| message_hash | varchar(400) | Message hash | |
| reference | varchar(70) | Reference | |
| status | payment_order_status | Order status | DEFAULT 'initiated' |
| amount_in_usd | decimal(20,8) | USD equivalent | NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.payment_order_recipients
Payment order recipient information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | varchar(50) | Recipient identifier | PRIMARY KEY |
| payment_order_id | uuid | References payment_orders.id | UNIQUE, FOREIGN KEY, NOT NULL |
| institution | varchar(50) | Institution code | NOT NULL |
| account_identifier | varchar(100) | Account identifier | NOT NULL |
| account_name | varchar(255) | Account holder name | NOT NULL |
| memo | text | Payment memo | |
| provider_id | varchar(50) | Provider identifier | |
| metadata | jsonb | Additional metadata | |

### public.lock_payment_orders
Lock payment orders for escrow-style transactions.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Lock order identifier | PRIMARY KEY, DEFAULT gen_random_uuid() |
| token_id | varchar(50) | References tokens.id | FOREIGN KEY, NOT NULL |
| provision_bucket_id | varchar(50) | References provision_buckets.id | FOREIGN KEY |
| provider_id | varchar(50) | References provider_profiles.id | FOREIGN KEY |
| gateway_id | varchar(70) | Gateway identifier | NOT NULL |
| amount | decimal(20,8) | Lock amount | NOT NULL |
| protocol_fee | decimal(20,8) | Protocol fee | NOT NULL |
| rate | decimal(20,8) | Exchange rate | NOT NULL |
| order_percent | decimal(5,4) | Order percentage | NOT NULL |
| sender | varchar(60) | Sender address | |
| tx_hash | varchar(70) | Transaction hash | |
| status | lock_payment_order_status | Lock order status | DEFAULT 'pending' |
| block_number | bigint | Block number | NOT NULL |
| institution | varchar(50) | Institution code | NOT NULL |
| account_identifier | varchar(100) | Account identifier | NOT NULL |
| account_name | varchar(255) | Account holder name | NOT NULL |
| memo | text | Payment memo | |
| metadata | jsonb | Additional metadata | |
| cancellation_count | integer | Cancellation count | DEFAULT 0 |
| cancellation_reasons | text[] | Cancellation reasons | DEFAULT '{}' |
| message_hash | varchar(400) | Message hash | |
| amount_in_usd | decimal(20,8) | USD equivalent | NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.lock_order_fulfillments
Fulfillment records for lock orders.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Fulfillment identifier | PRIMARY KEY, DEFAULT gen_random_uuid() |
| order_id | uuid | References lock_payment_orders.id | FOREIGN KEY, NOT NULL |
| tx_id | varchar(70) | Transaction ID | |
| psp | varchar(100) | Payment service provider | |
| validation_status | validation_status | Validation status | DEFAULT 'pending' |
| validation_error | text | Validation error message | |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

## Webhook and Integration Tables

### public.payment_webhooks
Webhook configurations for payment notifications.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Webhook identifier | PRIMARY KEY, DEFAULT gen_random_uuid() |
| network_id | bigint | References networks.chain_id | FOREIGN KEY |
| webhook_id | varchar(100) | External webhook ID | NOT NULL |
| webhook_secret | varchar(100) | Webhook secret | NOT NULL |
| callback_url | varchar(255) | Callback URL | NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

### public.webhook_retry_attempts
Webhook retry attempt tracking.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | varchar(50) | Retry identifier | PRIMARY KEY |
| attempt_number | integer | Attempt number | NOT NULL |
| next_retry_time | timestamptz | Next retry time | DEFAULT NOW() |
| payload | jsonb | Webhook payload | NOT NULL |
| signature | varchar(255) | Webhook signature | |
| webhook_url | varchar(255) | Webhook URL | NOT NULL |
| status | webhook_retry_status | Retry status | DEFAULT 'failed' |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

## Logging and Verification Tables

### public.transaction_logs
Detailed transaction logging.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Log identifier | PRIMARY KEY, DEFAULT gen_random_uuid() |
| payment_order_id | uuid | References payment_orders.id | FOREIGN KEY |
| lock_payment_order_id | uuid | References lock_payment_orders.id | FOREIGN KEY |
| gateway_id | varchar(70) | Gateway identifier | |
| status | transaction_log_status | Transaction status | DEFAULT 'order_initiated' |
| network | varchar(50) | Network identifier | |
| tx_hash | varchar(70) | Transaction hash | |
| metadata | jsonb | Transaction metadata | NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |

### public.verification_tokens
Token verification for various processes.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Token identifier | PRIMARY KEY, DEFAULT gen_random_uuid() |
| owner_id | uuid | References user_profiles.id | FOREIGN KEY, NOT NULL |
| token | varchar(255) | Verification token | NOT NULL |
| scope | verification_token_scope | Token scope | NOT NULL |
| expiry_at | timestamptz | Token expiration | NOT NULL |
| created_at | timestamptz | Creation timestamp | DEFAULT NOW() |
| updated_at | timestamptz | Last update timestamp | DEFAULT NOW() |

## Enums

### institution_type
- `bank`
- `mobile_money`

### validation_status
- `pending`
- `success`
- `failed`

### lock_payment_order_status
- `pending`
- `processing`
- `cancelled`
- `fulfilled`
- `validated`
- `settled`
- `refunded`

### payment_order_status
- `initiated`
- `processing`
- `pending`
- `validated`
- `expired`
- `settled`
- `refunded`

### receive_address_status
- `unused`
- `used`
- `expired`

### provision_mode
- `manual`
- `auto`

### visibility_mode
- `private`
- `public`

### conversion_rate_type
- `fixed`
- `floating`

### transaction_log_status
- `order_initiated`
- `crypto_deposited`
- `order_created`
- `order_processing`
- `order_fulfilled`
- `order_validated`
- `order_settled`
- `order_refunded`
- `gas_prefunded`
- `gateway_approved`

### webhook_retry_status
- `success`
- `failed`
- `expired`

### verification_token_scope
- `email_verification`
- `password_reset`
- `kyb_verification`
- `api_key_activation`

## Security Considerations

1. All API secrets should be hashed using bcrypt or similar
2. API keys should be generated using cryptographically secure random generators
3. Sensitive data should be encrypted at rest
4. All database connections should use SSL/TLS
5. Regular security audits should be performed on the audit_logs table
6. Provider balances and sensitive financial data should have additional encryption
7. Webhook secrets should be cryptographically secure
8. Transaction logs should be immutable once created
