-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key_name character varying NOT NULL,
  api_key character varying NOT NULL UNIQUE,
  api_secret_hash character varying NOT NULL,
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT api_keys_pkey PRIMARY KEY (id),
  CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action character varying NOT NULL,
  resource_type character varying,
  resource_id character varying,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.fiat_currencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying NOT NULL UNIQUE,
  short_name character varying NOT NULL UNIQUE,
  decimals integer DEFAULT 2,
  symbol character varying NOT NULL,
  name character varying NOT NULL,
  market_rate numeric NOT NULL,
  is_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fiat_currencies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.institutions (
  code character varying NOT NULL,
  name character varying NOT NULL,
  type USER-DEFINED DEFAULT 'bank'::institution_type,
  fiat_currency_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institutions_pkey PRIMARY KEY (code),
  CONSTRAINT institutions_fiat_currency_id_fkey FOREIGN KEY (fiat_currency_id) REFERENCES public.fiat_currencies(id)
);
CREATE TABLE public.linked_addresses (
  address character varying NOT NULL,
  salt bytea,
  institution character varying NOT NULL,
  account_identifier character varying NOT NULL,
  account_name character varying NOT NULL,
  metadata jsonb,
  owner_address character varying NOT NULL UNIQUE,
  last_indexed_block bigint,
  tx_hash character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT linked_addresses_pkey PRIMARY KEY (address)
);
CREATE TABLE public.lock_order_fulfillments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  tx_id character varying,
  psp character varying,
  validation_status USER-DEFINED DEFAULT 'pending'::validation_status,
  validation_error text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lock_order_fulfillments_pkey PRIMARY KEY (id),
  CONSTRAINT lock_order_fulfillments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.lock_payment_orders(id)
);
CREATE TABLE public.lock_payment_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  token_id character varying NOT NULL,
  provision_bucket_id character varying,
  provider_id character varying,
  gateway_id character varying NOT NULL,
  amount numeric NOT NULL,
  protocol_fee numeric NOT NULL,
  rate numeric NOT NULL,
  order_percent numeric NOT NULL,
  sender character varying,
  tx_hash character varying,
  status USER-DEFINED DEFAULT 'pending'::lock_payment_order_status,
  block_number bigint NOT NULL,
  institution character varying NOT NULL,
  account_identifier character varying NOT NULL,
  account_name character varying NOT NULL,
  memo text,
  metadata jsonb,
  cancellation_count integer DEFAULT 0,
  cancellation_reasons ARRAY DEFAULT '{}'::text[],
  message_hash character varying,
  amount_in_usd numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lock_payment_orders_pkey PRIMARY KEY (id),
  CONSTRAINT lock_payment_orders_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id),
  CONSTRAINT lock_payment_orders_provision_bucket_id_fkey FOREIGN KEY (provision_bucket_id) REFERENCES public.provision_buckets(id),
  CONSTRAINT lock_payment_orders_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id)
);
CREATE TABLE public.networks (
  chain_id bigint NOT NULL,
  identifier character varying NOT NULL UNIQUE,
  rpc_endpoint character varying NOT NULL,
  gateway_contract_address character varying DEFAULT ''::character varying,
  block_time numeric NOT NULL,
  is_testnet boolean NOT NULL,
  bundler_url character varying,
  paymaster_url character varying,
  fee numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT networks_pkey PRIMARY KEY (chain_id)
);
CREATE TABLE public.payment_order_recipients (
  id character varying NOT NULL,
  payment_order_id uuid NOT NULL UNIQUE,
  institution character varying NOT NULL,
  account_identifier character varying NOT NULL,
  account_name character varying NOT NULL,
  memo text,
  provider_id character varying,
  metadata jsonb,
  CONSTRAINT payment_order_recipients_pkey PRIMARY KEY (id),
  CONSTRAINT payment_order_recipients_payment_order_id_fkey FOREIGN KEY (payment_order_id) REFERENCES public.payment_orders(id)
);
CREATE TABLE public.payment_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_profile_id uuid,
  token_id character varying NOT NULL,
  linked_address_id character varying,
  receive_address_id character varying UNIQUE,
  payment_webhook_id uuid UNIQUE,
  api_key_id uuid,
  amount numeric NOT NULL,
  amount_paid numeric NOT NULL,
  amount_returned numeric NOT NULL,
  percent_settled numeric NOT NULL,
  sender_fee numeric NOT NULL,
  network_fee numeric NOT NULL,
  rate numeric NOT NULL,
  tx_hash character varying,
  block_number bigint DEFAULT 0,
  from_address character varying,
  return_address character varying,
  receive_address_text character varying NOT NULL,
  fee_percent numeric NOT NULL,
  fee_address character varying,
  gateway_id character varying,
  message_hash character varying,
  reference character varying,
  status USER-DEFINED DEFAULT 'initiated'::payment_order_status,
  amount_in_usd numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_orders_pkey PRIMARY KEY (id),
  CONSTRAINT payment_orders_sender_profile_id_fkey FOREIGN KEY (sender_profile_id) REFERENCES public.sender_profiles(id),
  CONSTRAINT payment_orders_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id),
  CONSTRAINT payment_orders_linked_address_id_fkey FOREIGN KEY (linked_address_id) REFERENCES public.linked_addresses(address),
  CONSTRAINT payment_orders_receive_address_id_fkey FOREIGN KEY (receive_address_id) REFERENCES public.receive_addresses(address),
  CONSTRAINT payment_orders_payment_webhook_id_fkey FOREIGN KEY (payment_webhook_id) REFERENCES public.payment_webhooks(id),
  CONSTRAINT payment_orders_api_key_id_fkey FOREIGN KEY (api_key_id) REFERENCES public.api_keys(id)
);
CREATE TABLE public.payment_webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  network_id bigint,
  webhook_id character varying NOT NULL,
  webhook_secret character varying NOT NULL,
  callback_url character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_webhooks_pkey PRIMARY KEY (id),
  CONSTRAINT payment_webhooks_network_id_fkey FOREIGN KEY (network_id) REFERENCES public.networks(chain_id)
);
CREATE TABLE public.provider_currencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id character varying NOT NULL,
  currency_id uuid NOT NULL,
  available_balance numeric NOT NULL,
  total_balance numeric NOT NULL,
  reserved_balance numeric NOT NULL,
  is_available boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT provider_currencies_pkey PRIMARY KEY (id),
  CONSTRAINT provider_currencies_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id),
  CONSTRAINT provider_currencies_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.fiat_currencies(id)
);
CREATE TABLE public.provider_order_tokens (
  id character varying NOT NULL,
  provider_id character varying NOT NULL,
  token_id character varying NOT NULL,
  currency_id uuid NOT NULL,
  network character varying NOT NULL,
  fixed_conversion_rate numeric NOT NULL,
  floating_conversion_rate numeric NOT NULL,
  conversion_rate_type USER-DEFINED NOT NULL,
  max_order_amount numeric NOT NULL,
  min_order_amount numeric NOT NULL,
  rate_slippage numeric NOT NULL,
  address character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT provider_order_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT provider_order_tokens_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id),
  CONSTRAINT provider_order_tokens_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id),
  CONSTRAINT provider_order_tokens_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.fiat_currencies(id)
);
CREATE TABLE public.provider_profiles (
  id character varying NOT NULL,
  user_id uuid NOT NULL UNIQUE,
  trading_name character varying,
  host_identifier character varying,
  provision_mode USER-DEFINED DEFAULT 'auto'::provision_mode,
  is_active boolean DEFAULT false,
  is_kyb_verified boolean DEFAULT false,
  visibility_mode USER-DEFINED DEFAULT 'public'::visibility_mode,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT provider_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT provider_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.provider_ratings (
  id character varying NOT NULL,
  provider_profile_id character varying NOT NULL UNIQUE,
  trust_score numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT provider_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT provider_ratings_provider_profile_id_fkey FOREIGN KEY (provider_profile_id) REFERENCES public.provider_profiles(id)
);
CREATE TABLE public.provision_bucket_providers (
  provision_bucket_id character varying NOT NULL,
  provider_profile_id character varying NOT NULL,
  CONSTRAINT provision_bucket_providers_pkey PRIMARY KEY (provision_bucket_id, provider_profile_id),
  CONSTRAINT provision_bucket_providers_provision_bucket_id_fkey FOREIGN KEY (provision_bucket_id) REFERENCES public.provision_buckets(id),
  CONSTRAINT provision_bucket_providers_provider_profile_id_fkey FOREIGN KEY (provider_profile_id) REFERENCES public.provider_profiles(id)
);
CREATE TABLE public.provision_buckets (
  id character varying NOT NULL,
  currency_id uuid NOT NULL,
  min_amount numeric NOT NULL,
  max_amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT provision_buckets_pkey PRIMARY KEY (id),
  CONSTRAINT provision_buckets_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.fiat_currencies(id)
);
CREATE TABLE public.receive_addresses (
  address character varying NOT NULL,
  salt bytea,
  status USER-DEFINED DEFAULT 'unused'::receive_address_status,
  last_indexed_block bigint,
  last_used timestamp with time zone,
  tx_hash character varying,
  valid_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT receive_addresses_pkey PRIMARY KEY (address)
);
CREATE TABLE public.sender_order_tokens (
  id character varying NOT NULL,
  sender_id uuid NOT NULL,
  token_id character varying NOT NULL,
  fee_percent numeric NOT NULL,
  fee_address character varying NOT NULL,
  refund_address character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sender_order_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT sender_order_tokens_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id),
  CONSTRAINT sender_order_tokens_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.sender_profiles(id)
);
CREATE TABLE public.sender_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  webhook_url character varying,
  domain_whitelist ARRAY DEFAULT '{}'::text[],
  provider_id character varying,
  is_partner boolean DEFAULT false,
  is_active boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sender_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT sender_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.tokens (
  id character varying NOT NULL,
  symbol character varying NOT NULL,
  contract_address character varying NOT NULL,
  decimals smallint NOT NULL,
  is_enabled boolean DEFAULT false,
  base_currency character varying DEFAULT 'USD'::character varying,
  network_id bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tokens_pkey PRIMARY KEY (id),
  CONSTRAINT tokens_network_id_fkey FOREIGN KEY (network_id) REFERENCES public.networks(chain_id)
);
CREATE TABLE public.transaction_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_order_id uuid,
  lock_payment_order_id uuid,
  gateway_id character varying,
  status USER-DEFINED DEFAULT 'order_initiated'::transaction_log_status,
  network character varying,
  tx_hash character varying,
  metadata jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transaction_logs_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_logs_payment_order_id_fkey FOREIGN KEY (payment_order_id) REFERENCES public.payment_orders(id),
  CONSTRAINT transaction_logs_lock_payment_order_id_fkey FOREIGN KEY (lock_payment_order_id) REFERENCES public.lock_payment_orders(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_type character varying NOT NULL CHECK (transaction_type::text = ANY (ARRAY['onramp'::character varying, 'offramp'::character varying]::text[])),
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  currency character varying NOT NULL,
  crypto_currency character varying NOT NULL,
  crypto_amount numeric,
  exchange_rate numeric,
  fees numeric DEFAULT 0,
  external_transaction_id character varying,
  provider_name character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  business_type character varying NOT NULL CHECK (business_type::text = ANY (ARRAY['sender'::character varying, 'provider'::character varying]::text[])),
  company_name character varying,
  website character varying,
  phone character varying,
  address text,
  country character varying,
  verification_status character varying DEFAULT 'pending'::character varying CHECK (verification_status::text = ANY (ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying]::text[])),
  api_key character varying UNIQUE,
  api_secret character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.verification_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  token character varying NOT NULL,
  scope USER-DEFINED NOT NULL,
  expiry_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT verification_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT verification_tokens_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.webhook_retry_attempts (
  id character varying NOT NULL,
  attempt_number integer NOT NULL,
  next_retry_time timestamp with time zone DEFAULT now(),
  payload jsonb NOT NULL,
  signature character varying,
  webhook_url character varying NOT NULL,
  status USER-DEFINED DEFAULT 'failed'::webhook_retry_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT webhook_retry_attempts_pkey PRIMARY KEY (id)
);