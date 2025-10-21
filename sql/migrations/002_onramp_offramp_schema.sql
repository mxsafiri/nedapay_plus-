-- Migration: 002_onramp_offramp_schema.sql
-- Description: Add comprehensive onramp/offramp payment processing tables
-- Date: 2025-09-29
-- Dependencies: 001_initial_schema.sql

-- Create custom enum types
CREATE TYPE institution_type AS ENUM ('bank', 'mobile_money');
CREATE TYPE validation_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE lock_payment_order_status AS ENUM ('pending', 'processing', 'cancelled', 'fulfilled', 'validated', 'settled', 'refunded');
CREATE TYPE payment_order_status AS ENUM ('initiated', 'processing', 'pending', 'validated', 'expired', 'settled', 'refunded');
CREATE TYPE receive_address_status AS ENUM ('unused', 'used', 'expired');
CREATE TYPE provision_mode AS ENUM ('manual', 'auto');
CREATE TYPE visibility_mode AS ENUM ('private', 'public');
CREATE TYPE conversion_rate_type AS ENUM ('fixed', 'floating');
CREATE TYPE transaction_log_status AS ENUM ('order_initiated', 'crypto_deposited', 'order_created', 'order_processing', 'order_fulfilled', 'order_validated', 'order_settled', 'order_refunded', 'gas_prefunded', 'gateway_approved');
CREATE TYPE webhook_retry_status AS ENUM ('success', 'failed', 'expired');
CREATE TYPE verification_token_scope AS ENUM ('email_verification', 'password_reset', 'kyb_verification', 'api_key_activation');

-- ============================================================================
-- CORE CURRENCY AND NETWORK TABLES
-- ============================================================================

-- Create fiat_currencies table
CREATE TABLE IF NOT EXISTS public.fiat_currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    short_name VARCHAR(20) UNIQUE NOT NULL,
    decimals INTEGER DEFAULT 2,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    market_rate DECIMAL(20,8) NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create institutions table
CREATE TABLE IF NOT EXISTS public.institutions (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type institution_type DEFAULT 'bank',
    fiat_currency_id UUID REFERENCES public.fiat_currencies(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create networks table
CREATE TABLE IF NOT EXISTS public.networks (
    chain_id BIGINT PRIMARY KEY,
    identifier VARCHAR(50) UNIQUE NOT NULL,
    rpc_endpoint VARCHAR(255) NOT NULL,
    gateway_contract_address VARCHAR(60) DEFAULT '',
    block_time DECIMAL(10,2) NOT NULL,
    is_testnet BOOLEAN NOT NULL,
    bundler_url VARCHAR(255),
    paymaster_url VARCHAR(255),
    fee DECIMAL(20,8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS public.tokens (
    id VARCHAR(50) PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    contract_address VARCHAR(60) NOT NULL,
    decimals SMALLINT NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    base_currency VARCHAR(10) DEFAULT 'USD',
    network_id BIGINT NOT NULL REFERENCES public.networks(chain_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ADDRESS MANAGEMENT TABLES
-- ============================================================================

-- Create linked_addresses table
CREATE TABLE IF NOT EXISTS public.linked_addresses (
    address VARCHAR(60) PRIMARY KEY,
    salt BYTEA,
    institution VARCHAR(50) NOT NULL,
    account_identifier VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    metadata JSONB,
    owner_address VARCHAR(60) UNIQUE NOT NULL,
    last_indexed_block BIGINT,
    tx_hash VARCHAR(70),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create receive_addresses table
CREATE TABLE IF NOT EXISTS public.receive_addresses (
    address VARCHAR(60) PRIMARY KEY,
    salt BYTEA,
    status receive_address_status DEFAULT 'unused',
    last_indexed_block BIGINT,
    last_used TIMESTAMPTZ,
    tx_hash VARCHAR(70),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROVIDER MANAGEMENT TABLES
-- ============================================================================

-- Create provider_profiles table
CREATE TABLE IF NOT EXISTS public.provider_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id),
    trading_name VARCHAR(80),
    host_identifier VARCHAR(100),
    provision_mode provision_mode DEFAULT 'auto',
    is_active BOOLEAN DEFAULT false,
    is_kyb_verified BOOLEAN DEFAULT false,
    visibility_mode visibility_mode DEFAULT 'public',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create provider_currencies table
CREATE TABLE IF NOT EXISTS public.provider_currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(50) NOT NULL REFERENCES public.provider_profiles(id),
    currency_id UUID NOT NULL REFERENCES public.fiat_currencies(id),
    available_balance DECIMAL(20,8) NOT NULL,
    total_balance DECIMAL(20,8) NOT NULL,
    reserved_balance DECIMAL(20,8) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id, currency_id)
);

-- Create provider_ratings table
CREATE TABLE IF NOT EXISTS public.provider_ratings (
    id VARCHAR(50) PRIMARY KEY,
    provider_profile_id VARCHAR(50) UNIQUE NOT NULL REFERENCES public.provider_profiles(id),
    trust_score DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create provision_buckets table
CREATE TABLE IF NOT EXISTS public.provision_buckets (
    id VARCHAR(50) PRIMARY KEY,
    currency_id UUID NOT NULL REFERENCES public.fiat_currencies(id),
    min_amount DECIMAL(20,8) NOT NULL,
    max_amount DECIMAL(20,8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create provision_bucket_providers junction table
CREATE TABLE IF NOT EXISTS public.provision_bucket_providers (
    provision_bucket_id VARCHAR(50) NOT NULL REFERENCES public.provision_buckets(id),
    provider_profile_id VARCHAR(50) NOT NULL REFERENCES public.provider_profiles(id),
    PRIMARY KEY (provision_bucket_id, provider_profile_id)
);

-- ============================================================================
-- SENDER MANAGEMENT TABLES
-- ============================================================================

-- Create sender_profiles table
CREATE TABLE IF NOT EXISTS public.sender_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id),
    webhook_url VARCHAR(255),
    domain_whitelist TEXT[] DEFAULT '{}',
    provider_id VARCHAR(50),
    is_partner BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sender_order_tokens table
CREATE TABLE IF NOT EXISTS public.sender_order_tokens (
    id VARCHAR(50) PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES public.sender_profiles(id),
    token_id VARCHAR(50) NOT NULL REFERENCES public.tokens(id),
    fee_percent DECIMAL(5,4) NOT NULL,
    fee_address VARCHAR(60) NOT NULL,
    refund_address VARCHAR(60) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sender_id, token_id)
);

-- Create provider_order_tokens table
CREATE TABLE IF NOT EXISTS public.provider_order_tokens (
    id VARCHAR(50) PRIMARY KEY,
    provider_id VARCHAR(50) NOT NULL REFERENCES public.provider_profiles(id),
    token_id VARCHAR(50) NOT NULL REFERENCES public.tokens(id),
    currency_id UUID NOT NULL REFERENCES public.fiat_currencies(id),
    network VARCHAR(50) NOT NULL,
    fixed_conversion_rate DECIMAL(20,8) NOT NULL,
    floating_conversion_rate DECIMAL(20,8) NOT NULL,
    conversion_rate_type conversion_rate_type NOT NULL,
    max_order_amount DECIMAL(20,8) NOT NULL,
    min_order_amount DECIMAL(20,8) NOT NULL,
    rate_slippage DECIMAL(5,4) NOT NULL,
    address VARCHAR(60),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id, token_id, currency_id, network)
);

-- ============================================================================
-- WEBHOOK MANAGEMENT TABLES
-- ============================================================================

-- Create payment_webhooks table
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id BIGINT REFERENCES public.networks(chain_id),
    webhook_id VARCHAR(100) NOT NULL,
    webhook_secret VARCHAR(100) NOT NULL,
    callback_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webhook_retry_attempts table
CREATE TABLE IF NOT EXISTS public.webhook_retry_attempts (
    id VARCHAR(50) PRIMARY KEY,
    attempt_number INTEGER NOT NULL,
    next_retry_time TIMESTAMPTZ DEFAULT NOW(),
    payload JSONB NOT NULL,
    signature VARCHAR(255),
    webhook_url VARCHAR(255) NOT NULL,
    status webhook_retry_status DEFAULT 'failed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PAYMENT PROCESSING TABLES
-- ============================================================================

-- Create payment_orders table
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_profile_id UUID REFERENCES public.sender_profiles(id),
    token_id VARCHAR(50) NOT NULL REFERENCES public.tokens(id),
    linked_address_id VARCHAR(60) REFERENCES public.linked_addresses(address),
    receive_address_id VARCHAR(60) UNIQUE REFERENCES public.receive_addresses(address),
    payment_webhook_id UUID UNIQUE REFERENCES public.payment_webhooks(id),
    api_key_id UUID REFERENCES public.api_keys(id),
    amount DECIMAL(20,8) NOT NULL,
    amount_paid DECIMAL(20,8) NOT NULL,
    amount_returned DECIMAL(20,8) NOT NULL,
    percent_settled DECIMAL(5,4) NOT NULL,
    sender_fee DECIMAL(20,8) NOT NULL,
    network_fee DECIMAL(20,8) NOT NULL,
    rate DECIMAL(20,8) NOT NULL,
    tx_hash VARCHAR(70),
    block_number BIGINT DEFAULT 0,
    from_address VARCHAR(60),
    return_address VARCHAR(60),
    receive_address_text VARCHAR(60) NOT NULL,
    fee_percent DECIMAL(5,4) NOT NULL,
    fee_address VARCHAR(60),
    gateway_id VARCHAR(70),
    message_hash VARCHAR(400),
    reference VARCHAR(70),
    status payment_order_status DEFAULT 'initiated',
    amount_in_usd DECIMAL(20,8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_order_recipients table
CREATE TABLE IF NOT EXISTS public.payment_order_recipients (
    id VARCHAR(50) PRIMARY KEY,
    payment_order_id UUID UNIQUE NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
    institution VARCHAR(50) NOT NULL,
    account_identifier VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    memo TEXT,
    provider_id VARCHAR(50),
    metadata JSONB
);

-- Create lock_payment_orders table
CREATE TABLE IF NOT EXISTS public.lock_payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id VARCHAR(50) NOT NULL REFERENCES public.tokens(id),
    provision_bucket_id VARCHAR(50) REFERENCES public.provision_buckets(id),
    provider_id VARCHAR(50) REFERENCES public.provider_profiles(id),
    gateway_id VARCHAR(70) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    protocol_fee DECIMAL(20,8) NOT NULL,
    rate DECIMAL(20,8) NOT NULL,
    order_percent DECIMAL(5,4) NOT NULL,
    sender VARCHAR(60),
    tx_hash VARCHAR(70),
    status lock_payment_order_status DEFAULT 'pending',
    block_number BIGINT NOT NULL,
    institution VARCHAR(50) NOT NULL,
    account_identifier VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    memo TEXT,
    metadata JSONB,
    cancellation_count INTEGER DEFAULT 0,
    cancellation_reasons TEXT[] DEFAULT '{}',
    message_hash VARCHAR(400),
    amount_in_usd DECIMAL(20,8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gateway_id, rate, tx_hash, block_number, institution, account_identifier, account_name, memo, token_id)
);

-- Create lock_order_fulfillments table
CREATE TABLE IF NOT EXISTS public.lock_order_fulfillments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.lock_payment_orders(id),
    tx_id VARCHAR(70),
    psp VARCHAR(100),
    validation_status validation_status DEFAULT 'pending',
    validation_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LOGGING AND VERIFICATION TABLES
-- ============================================================================

-- Create transaction_logs table
CREATE TABLE IF NOT EXISTS public.transaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_order_id UUID REFERENCES public.payment_orders(id),
    lock_payment_order_id UUID REFERENCES public.lock_payment_orders(id),
    gateway_id VARCHAR(70),
    status transaction_log_status DEFAULT 'order_initiated',
    network VARCHAR(50),
    tx_hash VARCHAR(70),
    metadata JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS public.verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.user_profiles(id),
    token VARCHAR(255) NOT NULL,
    scope verification_token_scope NOT NULL,
    expiry_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Fiat currencies indexes
CREATE INDEX IF NOT EXISTS idx_fiat_currencies_code ON public.fiat_currencies(code);
CREATE INDEX IF NOT EXISTS idx_fiat_currencies_is_enabled ON public.fiat_currencies(is_enabled);

-- Institutions indexes
CREATE INDEX IF NOT EXISTS idx_institutions_type ON public.institutions(type);
CREATE INDEX IF NOT EXISTS idx_institutions_fiat_currency_id ON public.institutions(fiat_currency_id);

-- Networks indexes
CREATE INDEX IF NOT EXISTS idx_networks_identifier ON public.networks(identifier);
CREATE INDEX IF NOT EXISTS idx_networks_is_testnet ON public.networks(is_testnet);

-- Tokens indexes
CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON public.tokens(symbol);
CREATE INDEX IF NOT EXISTS idx_tokens_network_id ON public.tokens(network_id);
CREATE INDEX IF NOT EXISTS idx_tokens_is_enabled ON public.tokens(is_enabled);

-- Linked addresses indexes
CREATE INDEX IF NOT EXISTS idx_linked_addresses_institution ON public.linked_addresses(institution);
CREATE INDEX IF NOT EXISTS idx_linked_addresses_owner_address ON public.linked_addresses(owner_address);

-- Receive addresses indexes
CREATE INDEX IF NOT EXISTS idx_receive_addresses_status ON public.receive_addresses(status);
CREATE INDEX IF NOT EXISTS idx_receive_addresses_valid_until ON public.receive_addresses(valid_until);

-- Provider profiles indexes
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON public.provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_is_active ON public.provider_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_is_kyb_verified ON public.provider_profiles(is_kyb_verified);

-- Provider currencies indexes
CREATE INDEX IF NOT EXISTS idx_provider_currencies_provider_id ON public.provider_currencies(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_currencies_currency_id ON public.provider_currencies(currency_id);
CREATE INDEX IF NOT EXISTS idx_provider_currencies_is_available ON public.provider_currencies(is_available);

-- Sender profiles indexes
CREATE INDEX IF NOT EXISTS idx_sender_profiles_user_id ON public.sender_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sender_profiles_is_active ON public.sender_profiles(is_active);

-- Payment orders indexes
CREATE INDEX IF NOT EXISTS idx_payment_orders_sender_profile_id ON public.payment_orders(sender_profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_token_id ON public.payment_orders(token_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON public.payment_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_orders_gateway_id ON public.payment_orders(gateway_id);

-- Lock payment orders indexes
CREATE INDEX IF NOT EXISTS idx_lock_payment_orders_token_id ON public.lock_payment_orders(token_id);
CREATE INDEX IF NOT EXISTS idx_lock_payment_orders_provider_id ON public.lock_payment_orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_lock_payment_orders_status ON public.lock_payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_lock_payment_orders_created_at ON public.lock_payment_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_lock_payment_orders_gateway_id ON public.lock_payment_orders(gateway_id);

-- Transaction logs indexes
CREATE INDEX IF NOT EXISTS idx_transaction_logs_payment_order_id ON public.transaction_logs(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_lock_payment_order_id ON public.transaction_logs(lock_payment_order_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_status ON public.transaction_logs(status);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON public.transaction_logs(created_at);

-- Verification tokens indexes
CREATE INDEX IF NOT EXISTS idx_verification_tokens_owner_id ON public.verification_tokens(owner_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_scope ON public.verification_tokens(scope);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expiry_at ON public.verification_tokens(expiry_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT COLUMNS
-- ============================================================================

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_fiat_currencies_updated_at 
    BEFORE UPDATE ON public.fiat_currencies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at 
    BEFORE UPDATE ON public.institutions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_networks_updated_at 
    BEFORE UPDATE ON public.networks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tokens_updated_at 
    BEFORE UPDATE ON public.tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linked_addresses_updated_at 
    BEFORE UPDATE ON public.linked_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receive_addresses_updated_at 
    BEFORE UPDATE ON public.receive_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at 
    BEFORE UPDATE ON public.provider_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_currencies_updated_at 
    BEFORE UPDATE ON public.provider_currencies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_ratings_updated_at 
    BEFORE UPDATE ON public.provider_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sender_profiles_updated_at 
    BEFORE UPDATE ON public.sender_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sender_order_tokens_updated_at 
    BEFORE UPDATE ON public.sender_order_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_order_tokens_updated_at 
    BEFORE UPDATE ON public.provider_order_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_orders_updated_at 
    BEFORE UPDATE ON public.payment_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lock_payment_orders_updated_at 
    BEFORE UPDATE ON public.lock_payment_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lock_order_fulfillments_updated_at 
    BEFORE UPDATE ON public.lock_order_fulfillments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_webhooks_updated_at 
    BEFORE UPDATE ON public.payment_webhooks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_retry_attempts_updated_at 
    BEFORE UPDATE ON public.webhook_retry_attempts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_tokens_updated_at 
    BEFORE UPDATE ON public.verification_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.fiat_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receive_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provision_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sender_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sender_order_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_order_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_order_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lock_payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lock_order_fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_retry_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for core tables (public read access)
CREATE POLICY "Public read access for fiat currencies" ON public.fiat_currencies
    FOR SELECT USING (is_enabled = true);

CREATE POLICY "Public read access for institutions" ON public.institutions
    FOR SELECT USING (true);

CREATE POLICY "Public read access for networks" ON public.networks
    FOR SELECT USING (true);

CREATE POLICY "Public read access for tokens" ON public.tokens
    FOR SELECT USING (is_enabled = true);

-- Create RLS policies for user-specific tables
CREATE POLICY "Users can view own provider profile" ON public.provider_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own provider profile" ON public.provider_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sender profile" ON public.sender_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sender profile" ON public.sender_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for payment orders
CREATE POLICY "Users can view own payment orders" ON public.payment_orders
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.sender_profiles WHERE id = sender_profile_id
        )
    );

CREATE POLICY "Users can create payment orders" ON public.payment_orders
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.sender_profiles WHERE id = sender_profile_id
        )
    );

-- Create RLS policies for transaction logs
CREATE POLICY "Users can view own transaction logs" ON public.transaction_logs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT sp.user_id FROM public.sender_profiles sp
            JOIN public.payment_orders po ON sp.id = po.sender_profile_id
            WHERE po.id = payment_order_id
        )
    );

-- Create RLS policies for verification tokens
CREATE POLICY "Users can view own verification tokens" ON public.verification_tokens
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage own verification tokens" ON public.verification_tokens
    FOR ALL USING (auth.uid() = owner_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read access to public data for anonymous users
GRANT SELECT ON public.fiat_currencies TO anon;
GRANT SELECT ON public.institutions TO anon;
GRANT SELECT ON public.networks TO anon;
GRANT SELECT ON public.tokens TO anon;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- Core tables
COMMENT ON TABLE public.fiat_currencies IS 'Supported fiat currencies for the platform';
COMMENT ON TABLE public.institutions IS 'Banks and mobile money providers';
COMMENT ON TABLE public.networks IS 'Blockchain networks supported by the platform';
COMMENT ON TABLE public.tokens IS 'Cryptocurrency tokens supported on various networks';

-- Address management
COMMENT ON TABLE public.linked_addresses IS 'Crypto addresses linked to traditional payment accounts';
COMMENT ON TABLE public.receive_addresses IS 'Generated addresses for receiving crypto payments';

-- Provider management
COMMENT ON TABLE public.provider_profiles IS 'Liquidity provider profiles';
COMMENT ON TABLE public.provider_currencies IS 'Provider currency balances and availability';
COMMENT ON TABLE public.provider_ratings IS 'Provider trust scores and ratings';
COMMENT ON TABLE public.provision_buckets IS 'Liquidity provision buckets for different currencies';

-- Sender management
COMMENT ON TABLE public.sender_profiles IS 'Merchant/sender profiles';
COMMENT ON TABLE public.sender_order_tokens IS 'Sender token configurations';
COMMENT ON TABLE public.provider_order_tokens IS 'Provider token configurations';

-- Payment processing
COMMENT ON TABLE public.payment_orders IS 'Main payment order records';
COMMENT ON TABLE public.payment_order_recipients IS 'Payment order recipient information';
COMMENT ON TABLE public.lock_payment_orders IS 'Lock payment orders for escrow-style transactions';
COMMENT ON TABLE public.lock_order_fulfillments IS 'Fulfillment records for lock orders';

-- Webhooks and integration
COMMENT ON TABLE public.payment_webhooks IS 'Webhook configurations for payment notifications';
COMMENT ON TABLE public.webhook_retry_attempts IS 'Webhook retry attempt tracking';

-- Logging and verification
COMMENT ON TABLE public.transaction_logs IS 'Detailed transaction logging';
COMMENT ON TABLE public.verification_tokens IS 'Token verification for various processes';

-- Column comments for key fields
COMMENT ON COLUMN public.provider_profiles.provision_mode IS 'How liquidity is provisioned: manual or auto';
COMMENT ON COLUMN public.provider_profiles.visibility_mode IS 'Provider visibility: private or public';
COMMENT ON COLUMN public.payment_orders.status IS 'Payment order status tracking';
COMMENT ON COLUMN public.lock_payment_orders.status IS 'Lock order status for escrow transactions';
COMMENT ON COLUMN public.transaction_logs.status IS 'Detailed transaction status for logging';

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - FOR DEVELOPMENT)
-- ============================================================================

-- Insert sample fiat currencies
INSERT INTO public.fiat_currencies (code, short_name, symbol, name, market_rate, is_enabled) VALUES
    ('USD', 'USD', '$', 'US Dollar', 1.00, true),
    ('EUR', 'EUR', '€', 'Euro', 0.85, true),
    ('GBP', 'GBP', '£', 'British Pound', 0.73, true),
    ('KES', 'KES', 'KSh', 'Kenyan Shilling', 150.00, true),
    ('NGN', 'NGN', '₦', 'Nigerian Naira', 800.00, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample networks
INSERT INTO public.networks (chain_id, identifier, rpc_endpoint, block_time, is_testnet, fee) VALUES
    (1, 'ethereum', 'https://mainnet.infura.io/v3/your-key', 12.0, false, 0.001),
    (137, 'polygon', 'https://polygon-rpc.com', 2.0, false, 0.0001),
    (11155111, 'sepolia', 'https://sepolia.infura.io/v3/your-key', 12.0, true, 0.001)
ON CONFLICT (chain_id) DO NOTHING;

-- Insert sample tokens
INSERT INTO public.tokens (id, symbol, contract_address, decimals, network_id, is_enabled) VALUES
    ('eth-mainnet', 'ETH', '0x0000000000000000000000000000000000000000', 18, 1, true),
    ('usdc-mainnet', 'USDC', '0xA0b86a33E6441E6C7D3E4C3C8C7C4C4C4C4C4C4C', 6, 1, true),
    ('matic-polygon', 'MATIC', '0x0000000000000000000000000000000000001010', 18, 137, true)
ON CONFLICT (id) DO NOTHING;
