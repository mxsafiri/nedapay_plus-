-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.api_keys (
  id uuid NOT NULL,
  secret character varying NOT NULL,
  provider_profile_api_key character varying,
  sender_profile_api_key uuid,
  CONSTRAINT api_keys_pkey PRIMARY KEY (id),
  CONSTRAINT api_keys_provider_profiles_api_key FOREIGN KEY (provider_profile_api_key) REFERENCES public.provider_profiles(id),
  CONSTRAINT api_keys_sender_profiles_api_key FOREIGN KEY (sender_profile_api_key) REFERENCES public.sender_profiles(id)
);
CREATE TABLE public.atlas_schema_revisions (
  version character varying NOT NULL,
  description character varying NOT NULL,
  type bigint NOT NULL DEFAULT 2,
  applied bigint NOT NULL DEFAULT 0,
  total bigint NOT NULL DEFAULT 0,
  executed_at timestamp with time zone NOT NULL,
  execution_time bigint NOT NULL,
  error text,
  error_stmt text,
  hash character varying NOT NULL,
  partial_hashes jsonb,
  operator_version character varying NOT NULL,
  CONSTRAINT atlas_schema_revisions_pkey PRIMARY KEY (version)
);
CREATE TABLE public.beneficial_owners (
  id uuid NOT NULL,
  full_name character varying NOT NULL,
  residential_address character varying NOT NULL,
  proof_of_residential_address_url character varying NOT NULL,
  government_issued_id_url character varying NOT NULL,
  date_of_birth character varying NOT NULL,
  ownership_percentage double precision NOT NULL,
  government_issued_id_type character varying,
  kyb_profile_beneficial_owners uuid NOT NULL,
  CONSTRAINT beneficial_owners_pkey PRIMARY KEY (id),
  CONSTRAINT beneficial_owners_kyb_profiles_beneficial_owners FOREIGN KEY (kyb_profile_beneficial_owners) REFERENCES public.kyb_profiles(id)
);
CREATE TABLE public.ent_types (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  type character varying NOT NULL,
  CONSTRAINT ent_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fiat_currencies (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  code character varying NOT NULL,
  short_name character varying NOT NULL,
  decimals bigint NOT NULL DEFAULT 2,
  symbol character varying NOT NULL,
  name character varying NOT NULL,
  market_rate double precision NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  CONSTRAINT fiat_currencies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fiat_currency_providers (
  fiat_currency_id uuid NOT NULL,
  provider_profile_id character varying NOT NULL,
  CONSTRAINT fiat_currency_providers_pkey PRIMARY KEY (provider_profile_id, fiat_currency_id),
  CONSTRAINT fiat_currency_providers_provider_profile_id_fkey FOREIGN KEY (provider_profile_id) REFERENCES public.provider_profiles(id),
  CONSTRAINT fiat_currency_providers_fiat_currency_id_fkey FOREIGN KEY (fiat_currency_id) REFERENCES public.fiat_currencies(id)
);
CREATE TABLE public.identity_verification_requests (
  id uuid NOT NULL,
  wallet_address character varying NOT NULL,
  wallet_signature character varying NOT NULL,
  platform character varying NOT NULL,
  platform_ref character varying NOT NULL,
  verification_url character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  fee_reclaimed boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL,
  last_url_created_at timestamp with time zone NOT NULL,
  CONSTRAINT identity_verification_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.institutions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  code character varying NOT NULL,
  name character varying NOT NULL,
  type character varying NOT NULL DEFAULT 'bank'::character varying,
  fiat_currency_institutions uuid,
  CONSTRAINT institutions_pkey PRIMARY KEY (id),
  CONSTRAINT institutions_fiat_currencies_institutions FOREIGN KEY (fiat_currency_institutions) REFERENCES public.fiat_currencies(id)
);
CREATE TABLE public.kyb_profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  mobile_number character varying NOT NULL,
  company_name character varying NOT NULL,
  registered_business_address character varying NOT NULL,
  certificate_of_incorporation_url character varying NOT NULL,
  articles_of_incorporation_url character varying NOT NULL,
  business_license_url character varying,
  proof_of_business_address_url character varying NOT NULL,
  aml_policy_url character varying,
  kyc_policy_url character varying,
  kyb_rejection_comment character varying,
  user_kyb_profile uuid,
  CONSTRAINT kyb_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT kyb_profiles_users_kyb_profile FOREIGN KEY (user_kyb_profile) REFERENCES public.users(id)
);
CREATE TABLE public.linked_addresses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  address character varying NOT NULL,
  salt bytea,
  institution character varying NOT NULL,
  account_identifier character varying NOT NULL,
  account_name character varying NOT NULL,
  owner_address character varying NOT NULL,
  last_indexed_block bigint,
  tx_hash character varying,
  sender_profile_linked_address uuid,
  metadata jsonb,
  CONSTRAINT linked_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT linked_addresses_sender_profiles_linked_address FOREIGN KEY (sender_profile_linked_address) REFERENCES public.sender_profiles(id)
);
CREATE TABLE public.lock_order_fulfillments (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  tx_id character varying,
  validation_status character varying NOT NULL DEFAULT 'pending'::character varying,
  validation_error character varying,
  lock_payment_order_fulfillments uuid NOT NULL,
  psp character varying,
  CONSTRAINT lock_order_fulfillments_pkey PRIMARY KEY (id),
  CONSTRAINT lock_order_fulfillments_lock_payment_orders_fulfillments FOREIGN KEY (lock_payment_order_fulfillments) REFERENCES public.lock_payment_orders(id)
);
CREATE TABLE public.lock_payment_orders (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  amount double precision NOT NULL,
  rate double precision NOT NULL,
  order_percent double precision NOT NULL,
  tx_hash character varying,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  block_number bigint NOT NULL,
  institution character varying NOT NULL,
  account_identifier character varying NOT NULL,
  account_name character varying NOT NULL,
  memo character varying,
  cancellation_count bigint NOT NULL DEFAULT 0,
  cancellation_reasons jsonb NOT NULL,
  provider_profile_assigned_orders character varying,
  provision_bucket_lock_payment_orders bigint,
  token_lock_payment_orders bigint NOT NULL,
  gateway_id character varying NOT NULL,
  protocol_fee double precision NOT NULL,
  sender character varying,
  metadata jsonb,
  message_hash character varying,
  amount_in_usd double precision NOT NULL,
  CONSTRAINT lock_payment_orders_pkey PRIMARY KEY (id),
  CONSTRAINT lock_payment_orders_provider_profiles_assigned_orders FOREIGN KEY (provider_profile_assigned_orders) REFERENCES public.provider_profiles(id),
  CONSTRAINT lock_payment_orders_provision_buckets_lock_payment_orders FOREIGN KEY (provision_bucket_lock_payment_orders) REFERENCES public.provision_buckets(id),
  CONSTRAINT lock_payment_orders_tokens_lock_payment_orders FOREIGN KEY (token_lock_payment_orders) REFERENCES public.tokens(id)
);
CREATE TABLE public.networks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  chain_id bigint NOT NULL,
  identifier character varying NOT NULL,
  rpc_endpoint character varying NOT NULL,
  is_testnet boolean NOT NULL,
  fee double precision NOT NULL,
  chain_id_hex character varying,
  gateway_contract_address character varying NOT NULL DEFAULT ''::character varying,
  bundler_url character varying,
  paymaster_url character varying,
  block_time double precision NOT NULL,
  CONSTRAINT networks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_order_recipients (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  institution character varying NOT NULL,
  account_identifier character varying NOT NULL,
  account_name character varying NOT NULL,
  memo character varying,
  provider_id character varying,
  payment_order_recipient uuid NOT NULL,
  metadata jsonb,
  CONSTRAINT payment_order_recipients_pkey PRIMARY KEY (id),
  CONSTRAINT payment_order_recipients_payment_orders_recipient FOREIGN KEY (payment_order_recipient) REFERENCES public.payment_orders(id)
);
CREATE TABLE public.payment_orders (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  amount double precision NOT NULL,
  amount_paid double precision NOT NULL,
  amount_returned double precision NOT NULL,
  sender_fee double precision NOT NULL,
  rate double precision NOT NULL,
  tx_hash character varying,
  receive_address_text character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'initiated'::character varying,
  api_key_payment_orders uuid,
  sender_profile_payment_orders uuid,
  token_payment_orders bigint NOT NULL,
  from_address character varying,
  network_fee double precision NOT NULL,
  fee_percent double precision NOT NULL,
  fee_address character varying,
  percent_settled double precision NOT NULL,
  protocol_fee double precision NOT NULL,
  gateway_id character varying,
  block_number bigint NOT NULL DEFAULT 0,
  return_address character varying,
  linked_address_payment_orders bigint,
  reference character varying,
  message_hash character varying,
  amount_in_usd double precision NOT NULL,
  CONSTRAINT payment_orders_pkey PRIMARY KEY (id),
  CONSTRAINT payment_orders_api_keys_payment_orders FOREIGN KEY (api_key_payment_orders) REFERENCES public.api_keys(id),
  CONSTRAINT payment_orders_linked_addresses_payment_orders FOREIGN KEY (linked_address_payment_orders) REFERENCES public.linked_addresses(id),
  CONSTRAINT payment_orders_sender_profiles_payment_orders FOREIGN KEY (sender_profile_payment_orders) REFERENCES public.sender_profiles(id),
  CONSTRAINT payment_orders_tokens_payment_orders FOREIGN KEY (token_payment_orders) REFERENCES public.tokens(id)
);
CREATE TABLE public.payment_webhooks (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  webhook_id character varying NOT NULL,
  webhook_secret character varying NOT NULL,
  callback_url character varying NOT NULL,
  network_payment_webhook bigint,
  payment_order_payment_webhook uuid,
  CONSTRAINT payment_webhooks_pkey PRIMARY KEY (id),
  CONSTRAINT payment_webhooks_networks_payment_webhook FOREIGN KEY (network_payment_webhook) REFERENCES public.networks(id),
  CONSTRAINT payment_webhooks_payment_orders_payment_webhook FOREIGN KEY (payment_order_payment_webhook) REFERENCES public.payment_orders(id)
);
CREATE TABLE public.provider_currencies (
  id uuid NOT NULL,
  available_balance double precision NOT NULL,
  total_balance double precision NOT NULL,
  reserved_balance double precision NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL,
  fiat_currency_provider_currencies uuid NOT NULL,
  provider_profile_provider_currencies character varying NOT NULL,
  CONSTRAINT provider_currencies_pkey PRIMARY KEY (id),
  CONSTRAINT provider_currencies_fiat_currencies_provider_currencies FOREIGN KEY (fiat_currency_provider_currencies) REFERENCES public.fiat_currencies(id),
  CONSTRAINT provider_currencies_provider_profiles_provider_currencies FOREIGN KEY (provider_profile_provider_currencies) REFERENCES public.provider_profiles(id)
);
CREATE TABLE public.provider_order_tokens (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  fixed_conversion_rate double precision NOT NULL,
  floating_conversion_rate double precision NOT NULL,
  conversion_rate_type character varying NOT NULL,
  max_order_amount double precision NOT NULL,
  min_order_amount double precision NOT NULL,
  provider_profile_order_tokens character varying NOT NULL,
  address character varying,
  network character varying NOT NULL,
  fiat_currency_provider_order_tokens uuid NOT NULL,
  token_provider_order_tokens bigint NOT NULL,
  rate_slippage double precision NOT NULL,
  CONSTRAINT provider_order_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT provider_order_tokens_fiat_currencies_provider_order_tokens FOREIGN KEY (fiat_currency_provider_order_tokens) REFERENCES public.fiat_currencies(id),
  CONSTRAINT provider_order_tokens_provider_profiles_order_tokens FOREIGN KEY (provider_profile_order_tokens) REFERENCES public.provider_profiles(id),
  CONSTRAINT provider_order_tokens_tokens_provider_order_tokens FOREIGN KEY (token_provider_order_tokens) REFERENCES public.tokens(id)
);
CREATE TABLE public.provider_profiles (
  id character varying NOT NULL,
  trading_name character varying,
  host_identifier character varying,
  provision_mode character varying NOT NULL DEFAULT 'auto'::character varying,
  is_active boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL,
  visibility_mode character varying NOT NULL DEFAULT 'public'::character varying,
  address text,
  mobile_number character varying,
  date_of_birth timestamp with time zone,
  business_name character varying,
  identity_document_type character varying,
  identity_document character varying,
  business_document character varying,
  user_provider_profile uuid NOT NULL,
  is_kyb_verified boolean NOT NULL DEFAULT false,
  CONSTRAINT provider_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT provider_profiles_users_provider_profile FOREIGN KEY (user_provider_profile) REFERENCES public.users(id)
);
CREATE TABLE public.provider_ratings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  trust_score double precision NOT NULL,
  provider_profile_provider_rating character varying NOT NULL,
  CONSTRAINT provider_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT provider_ratings_provider_profiles_provider_rating FOREIGN KEY (provider_profile_provider_rating) REFERENCES public.provider_profiles(id)
);
CREATE TABLE public.provision_bucket_provider_profiles (
  provision_bucket_id bigint NOT NULL,
  provider_profile_id character varying NOT NULL,
  CONSTRAINT provision_bucket_provider_profiles_pkey PRIMARY KEY (provision_bucket_id, provider_profile_id),
  CONSTRAINT provision_bucket_provider_profiles_provision_bucket_id FOREIGN KEY (provision_bucket_id) REFERENCES public.provision_buckets(id),
  CONSTRAINT provision_bucket_provider_profiles_provider_profile_id FOREIGN KEY (provider_profile_id) REFERENCES public.provider_profiles(id)
);
CREATE TABLE public.provision_buckets (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  min_amount double precision NOT NULL,
  max_amount double precision NOT NULL,
  created_at timestamp with time zone NOT NULL,
  fiat_currency_provision_buckets uuid NOT NULL,
  CONSTRAINT provision_buckets_pkey PRIMARY KEY (id),
  CONSTRAINT provision_buckets_fiat_currencies_provision_buckets FOREIGN KEY (fiat_currency_provision_buckets) REFERENCES public.fiat_currencies(id)
);
CREATE TABLE public.receive_addresses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  address character varying NOT NULL,
  salt bytea,
  status character varying NOT NULL DEFAULT 'unused'::character varying,
  last_indexed_block bigint,
  last_used timestamp with time zone,
  valid_until timestamp with time zone,
  payment_order_receive_address uuid,
  tx_hash character varying,
  CONSTRAINT receive_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT receive_addresses_payment_orders_receive_address FOREIGN KEY (payment_order_receive_address) REFERENCES public.payment_orders(id)
);
CREATE TABLE public.sender_order_tokens (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  fee_percent double precision NOT NULL,
  fee_address character varying NOT NULL,
  refund_address character varying NOT NULL,
  sender_profile_order_tokens uuid NOT NULL,
  token_sender_order_tokens bigint NOT NULL,
  CONSTRAINT sender_order_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT sender_order_tokens_sender_profiles_order_tokens FOREIGN KEY (sender_profile_order_tokens) REFERENCES public.sender_profiles(id),
  CONSTRAINT sender_order_tokens_tokens_sender_order_tokens FOREIGN KEY (token_sender_order_tokens) REFERENCES public.tokens(id)
);
CREATE TABLE public.sender_profiles (
  id uuid NOT NULL,
  webhook_url character varying,
  domain_whitelist jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL,
  user_sender_profile uuid NOT NULL,
  is_partner boolean NOT NULL DEFAULT false,
  provider_id character varying,
  CONSTRAINT sender_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT sender_profiles_users_sender_profile FOREIGN KEY (user_sender_profile) REFERENCES public.users(id)
);
CREATE TABLE public.tokens (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  symbol character varying NOT NULL,
  contract_address character varying NOT NULL,
  decimals smallint NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  network_tokens bigint NOT NULL,
  base_currency character varying NOT NULL DEFAULT 'USD'::character varying,
  CONSTRAINT tokens_pkey PRIMARY KEY (id),
  CONSTRAINT tokens_networks_tokens FOREIGN KEY (network_tokens) REFERENCES public.networks(id)
);
CREATE TABLE public.transaction_logs (
  created_at timestamp with time zone NOT NULL,
  gateway_id character varying,
  status character varying NOT NULL DEFAULT 'order_initiated'::character varying,
  network character varying,
  tx_hash character varying,
  metadata jsonb NOT NULL,
  id uuid NOT NULL,
  lock_payment_order_transactions uuid,
  payment_order_transactions uuid,
  CONSTRAINT transaction_logs_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_logs_lock_payment_orders_transactions FOREIGN KEY (lock_payment_order_transactions) REFERENCES public.lock_payment_orders(id),
  CONSTRAINT transaction_logs_payment_orders_transactions FOREIGN KEY (payment_order_transactions) REFERENCES public.payment_orders(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  email character varying NOT NULL,
  password character varying NOT NULL,
  scope character varying NOT NULL,
  is_email_verified boolean NOT NULL DEFAULT false,
  has_early_access boolean NOT NULL DEFAULT false,
  kyb_verification_status character varying NOT NULL DEFAULT 'not_started'::character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.verification_tokens (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  token character varying NOT NULL,
  scope character varying NOT NULL,
  expiry_at timestamp with time zone NOT NULL,
  user_verification_token uuid NOT NULL,
  CONSTRAINT verification_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT verification_tokens_users_verification_token FOREIGN KEY (user_verification_token) REFERENCES public.users(id)
);
CREATE TABLE public.webhook_retry_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  attempt_number bigint NOT NULL,
  next_retry_time timestamp with time zone NOT NULL,
  payload jsonb NOT NULL,
  signature character varying,
  webhook_url character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'failed'::character varying,
  CONSTRAINT webhook_retry_attempts_pkey PRIMARY KEY (id)
);