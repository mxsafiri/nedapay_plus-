-- =====================================================
-- NedaPay Test Accounts Setup
-- Run this in your PostgreSQL database
-- =====================================================

-- IMPORTANT: Replace 'HASH_PASSWORD_HERE' with actual hashed passwords
-- Use your app's password hashing (bcrypt) to hash: TestBank123! and TestPSP123!
-- Or use pgcrypto: crypt('TestBank123!', gen_salt('bf'))

-- =====================================================
-- 1. TEST BANK: CRDB Bank
-- =====================================================

-- Create user
INSERT INTO users (id, first_name, last_name, email, password, scope, is_email_verified, kyb_verification_status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'CRDB',
  'Test Bank',
  'test-bank@crdb.co.tz',
  crypt('TestBank123!', gen_salt('bf')), -- This will hash the password
  'BANK',
  true, -- Email verified for testing
  'approved', -- KYB approved
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create sender profile
INSERT INTO sender_profiles (
  id,
  user_sender_profile,
  markup_percentage,
  monthly_earnings,
  total_earnings,
  test_balance,
  is_active,
  domain_whitelist,
  updated_at
)
SELECT
  gen_random_uuid(),
  id,
  0.002, -- 0.2% markup
  0,
  0,
  100000, -- $100k test balance
  true, -- Active
  '[]'::json, -- Empty whitelist
  NOW()
FROM users 
WHERE email = 'test-bank@crdb.co.tz'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. TEST BANK: NMB Bank
-- =====================================================

INSERT INTO users (id, first_name, last_name, email, password, scope, is_email_verified, kyb_verification_status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'NMB',
  'Test Bank',
  'test-bank@nmb.co.tz',
  crypt('TestBank123!', gen_salt('bf')),
  'BANK',
  true,
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO sender_profiles (
  id,
  user_sender_profile,
  markup_percentage,
  monthly_earnings,
  total_earnings,
  test_balance,
  is_active,
  domain_whitelist,
  updated_at
)
SELECT
  gen_random_uuid(),
  id,
  0.002,
  0,
  0,
  100000,
  true,
  '[]'::json,
  NOW()
FROM users 
WHERE email = 'test-bank@nmb.co.tz'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. TEST PSP: M-Pesa Tanzania
-- =====================================================

INSERT INTO users (id, first_name, last_name, email, password, scope, is_email_verified, kyb_verification_status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'M-Pesa',
  'Test Provider',
  'test-psp@mpesa.com',
  crypt('TestPSP123!', gen_salt('bf')),
  'PSP',
  true,
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO provider_profiles (
  id,
  trading_name,
  user_provider_profile,
  commission_rate,
  monthly_commissions,
  total_commissions,
  fulfillment_count,
  is_kyb_verified,
  is_active,
  is_available,
  supported_countries,
  treasury_accounts,
  fiat_infrastructure,
  test_balance,
  pending_settlement_amount,
  total_settlements,
  updated_at
)
SELECT
  gen_random_uuid(),
  'M-Pesa Test',
  id,
  0.003, -- 0.3% commission
  0,
  0,
  0,
  true, -- Pre-approved
  true, -- Active
  true, -- Available
  '["TZ", "KE", "UG", "RW"]'::json, -- Supported countries
  '{"hedera-testnet": "0.0.7099609", "base-sepolia": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}'::json, -- Settlement wallets
  '{"mpesa": {"enabled": true, "provider": "vodacom", "businessNumber": "+255754999888", "businessName": "M-Pesa Tanzania (Test)", "dailyLimit": 50000}, "thunes": {"enabled": false}, "bank": {"enabled": false}}'::json, -- Fiat methods
  50000, -- $50k test balance
  0, -- Pending settlement
  0, -- Total settlements
  NOW()
FROM users 
WHERE email = 'test-psp@mpesa.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. TEST PSP: Thunes Payment Services
-- =====================================================

INSERT INTO users (id, first_name, last_name, email, password, scope, is_email_verified, kyb_verification_status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Thunes',
  'Test Provider',
  'test-psp@thunes.com',
  crypt('TestPSP123!', gen_salt('bf')),
  'PSP',
  true,
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO provider_profiles (
  id,
  trading_name,
  user_provider_profile,
  commission_rate,
  monthly_commissions,
  total_commissions,
  fulfillment_count,
  is_kyb_verified,
  is_active,
  is_available,
  supported_countries,
  treasury_accounts,
  fiat_infrastructure,
  test_balance,
  pending_settlement_amount,
  total_settlements,
  updated_at
)
SELECT
  gen_random_uuid(),
  'Thunes Test',
  id,
  0.003,
  0,
  0,
  0,
  true,
  true,
  true,
  '["TZ", "KE", "UG", "RW"]'::json,
  '{"hedera-testnet": "0.0.7099610", "base-sepolia": "0x842d35Cc6634C0532925a3b844Bc454e4438f55f"}'::json,
  '{"mpesa": {"enabled": false}, "thunes": {"enabled": true, "accountId": "test-thunes-account", "apiKey": "test_thunes_api_key_sandbox", "environment": "sandbox", "verified": true}, "bank": {"enabled": false}}'::json,
  50000,
  0,
  0,
  NOW()
FROM users 
WHERE email = 'test-psp@thunes.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check created accounts
SELECT 
  email,
  scope,
  created_at
FROM users
WHERE email IN (
  'test-bank@crdb.co.tz',
  'test-bank@nmb.co.tz', 
  'test-psp@mpesa.com',
  'test-psp@thunes.com'
)
ORDER BY scope, email;

-- Check profiles
SELECT 
  u.email,
  u.scope,
  u.first_name || ' ' || u.last_name as name,
  u.kyb_verification_status,
  COALESCE(sp.test_balance, pp.test_balance) as balance,
  COALESCE(sp.is_active::text, pp.is_active::text) as is_active
FROM users u
LEFT JOIN sender_profiles sp ON u.id = sp.user_sender_profile
LEFT JOIN provider_profiles pp ON u.id = pp.user_provider_profile
WHERE u.email IN (
  'test-bank@crdb.co.tz',
  'test-bank@nmb.co.tz',
  'test-psp@mpesa.com',
  'test-psp@thunes.com'
)
ORDER BY u.scope, u.email;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Test credentials are now ready!
-- See TEST_CREDENTIALS.md for login details
-- =====================================================
