-- Setup NEDAplus as Internal Liquidity Provider
-- This allows NEDAplus to fulfill orders directly and capture PSP commission

BEGIN;

-- =====================================================
-- STEP 1: Create Liquidity Management Tables
-- =====================================================

-- Track internal liquidity reserves per currency
CREATE TABLE IF NOT EXISTS liquidity_reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency VARCHAR(3) NOT NULL,
  total_amount DECIMAL(20, 2) NOT NULL DEFAULT 0,
  available_amount DECIMAL(20, 2) NOT NULL DEFAULT 0,
  reserved_amount DECIMAL(20, 2) NOT NULL DEFAULT 0,
  provider_type VARCHAR(50), -- 'bank', 'mobile_money', 'crypto', 'thunes_api'
  provider_details JSONB,
  minimum_threshold DECIMAL(20, 2) DEFAULT 10000, -- Alert when below this
  optimal_balance DECIMAL(20, 2) DEFAULT 100000, -- Target rebalance amount
  last_rebalanced_at TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(currency)
);

-- Track all liquidity movements
CREATE TABLE IF NOT EXISTS liquidity_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserve_id UUID REFERENCES liquidity_reserves(id),
  transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'reserve', 'release', 'rebalance'
  amount DECIMAL(20, 2) NOT NULL,
  balance_before DECIMAL(20, 2),
  balance_after DECIMAL(20, 2),
  payment_order_id VARCHAR REFERENCES payment_orders(id),
  notes TEXT,
  executed_by VARCHAR, -- User/system that executed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Track liquidity alerts and notifications
CREATE TABLE IF NOT EXISTS liquidity_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency VARCHAR(3) NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- 'low_balance', 'rebalance_needed', 'high_demand', 'critical'
  threshold_amount DECIMAL(20, 2),
  current_amount DECIMAL(20, 2),
  recommended_action TEXT,
  severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'critical'
  notified_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Initial Liquidity Setup (Examples)
-- =====================================================

-- Add supported currencies with initial reserves
-- Adjust amounts based on your actual capital

-- Chinese Yuan (CNY)
INSERT INTO liquidity_reserves (
  currency, 
  total_amount, 
  available_amount, 
  provider_type, 
  provider_details,
  minimum_threshold,
  optimal_balance
) VALUES (
  'CNY', 
  1000000, -- ¥1M initial reserve (adjust as needed)
  1000000, 
  'bank', 
  '{
    "bank": "ICBC Beijing",
    "account": "6214********1234",
    "swift": "ICBKCNBJ",
    "contact": "treasury@nedaplus.com"
  }'::jsonb,
  100000,  -- Alert when below ¥100K
  1000000  -- Rebalance to ¥1M
) ON CONFLICT (currency) DO NOTHING;

-- Kenyan Shilling (KES)
INSERT INTO liquidity_reserves (
  currency, 
  total_amount, 
  available_amount, 
  provider_type, 
  provider_details,
  minimum_threshold,
  optimal_balance
) VALUES (
  'KES', 
  5000000, -- 5M KES initial reserve
  5000000, 
  'bank', 
  '{
    "bank": "Equity Bank Kenya",
    "account": "0123456789",
    "swift": "EQBLKENA",
    "mpesa": "+254700000000"
  }'::jsonb,
  500000,
  5000000
) ON CONFLICT (currency) DO NOTHING;

-- Nigerian Naira (NGN)
INSERT INTO liquidity_reserves (
  currency, 
  total_amount, 
  available_amount, 
  provider_type, 
  provider_details,
  minimum_threshold,
  optimal_balance
) VALUES (
  'NGN', 
  50000000, -- ₦50M initial reserve
  50000000, 
  'mobile_money', 
  '{
    "provider": "Flutterwave",
    "account": "merchant@nedaplus.com",
    "api_key_ref": "flutterwave_prod"
  }'::jsonb,
  5000000,
  50000000
) ON CONFLICT (currency) DO NOTHING;

-- US Dollar (USDC on blockchain)
INSERT INTO liquidity_reserves (
  currency, 
  total_amount, 
  available_amount, 
  provider_type, 
  provider_details,
  minimum_threshold,
  optimal_balance
) VALUES (
  'USD', 
  100000, -- $100K USDC reserve
  100000, 
  'crypto', 
  '{
    "network": "base-sepolia",
    "wallet": "0x742d35Cc6634C0532925a3b844c5e",
    "token": "USDC",
    "contract": "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  }'::jsonb,
  10000,
  100000
) ON CONFLICT (currency) DO NOTHING;

-- Thunes API Coverage (For corridors without direct liquidity)
INSERT INTO liquidity_reserves (
  currency, 
  total_amount, 
  available_amount, 
  provider_type, 
  provider_details,
  minimum_threshold,
  optimal_balance
) VALUES (
  'THUNES_NETWORK', 
  999999999, -- Unlimited via API
  999999999, 
  'thunes_api', 
  '{
    "api_url": "https://api.thunes.com",
    "coverage": "130 countries",
    "note": "Fallback for currencies without direct liquidity"
  }'::jsonb,
  0,
  999999999
) ON CONFLICT (currency) DO NOTHING;

-- =====================================================
-- STEP 3: Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_liquidity_reserves_currency 
  ON liquidity_reserves(currency);

CREATE INDEX IF NOT EXISTS idx_liquidity_transactions_reserve 
  ON liquidity_transactions(reserve_id);

CREATE INDEX IF NOT EXISTS idx_liquidity_transactions_order 
  ON liquidity_transactions(payment_order_id);

CREATE INDEX IF NOT EXISTS idx_liquidity_alerts_unresolved 
  ON liquidity_alerts(currency, resolved_at) 
  WHERE resolved_at IS NULL;

-- =====================================================
-- STEP 4: Create Helper Functions
-- =====================================================

-- Function: Reserve liquidity for pending order
CREATE OR REPLACE FUNCTION reserve_liquidity(
  p_currency VARCHAR(3),
  p_amount DECIMAL(20, 2),
  p_order_id VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_reserve_id UUID;
  v_available DECIMAL(20, 2);
BEGIN
  -- Get reserve ID and current available amount
  SELECT id, available_amount INTO v_reserve_id, v_available
  FROM liquidity_reserves
  WHERE currency = p_currency
  FOR UPDATE;

  IF v_reserve_id IS NULL THEN
    RAISE NOTICE 'No liquidity reserve found for currency: %', p_currency;
    RETURN FALSE;
  END IF;

  IF v_available < p_amount THEN
    RAISE NOTICE 'Insufficient liquidity. Available: %, Needed: %', v_available, p_amount;
    RETURN FALSE;
  END IF;

  -- Update reserves
  UPDATE liquidity_reserves
  SET 
    available_amount = available_amount - p_amount,
    reserved_amount = reserved_amount + p_amount,
    last_updated = NOW()
  WHERE id = v_reserve_id;

  -- Log transaction
  INSERT INTO liquidity_transactions (
    reserve_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    payment_order_id,
    notes
  ) VALUES (
    v_reserve_id,
    'reserve',
    p_amount,
    v_available,
    v_available - p_amount,
    p_order_id,
    'Reserved for payment order'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Release reserved liquidity (on order completion)
CREATE OR REPLACE FUNCTION release_liquidity(
  p_currency VARCHAR(3),
  p_amount DECIMAL(20, 2),
  p_order_id VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_reserve_id UUID;
BEGIN
  SELECT id INTO v_reserve_id
  FROM liquidity_reserves
  WHERE currency = p_currency
  FOR UPDATE;

  IF v_reserve_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update reserves (move from reserved to withdrawn)
  UPDATE liquidity_reserves
  SET 
    reserved_amount = reserved_amount - p_amount,
    total_amount = total_amount - p_amount,
    last_updated = NOW()
  WHERE id = v_reserve_id;

  -- Log transaction
  INSERT INTO liquidity_transactions (
    reserve_id,
    transaction_type,
    amount,
    payment_order_id,
    notes
  ) VALUES (
    v_reserve_id,
    'withdrawal',
    p_amount,
    p_order_id,
    'Released for order fulfillment'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if sufficient liquidity available
CREATE OR REPLACE FUNCTION check_liquidity_available(
  p_currency VARCHAR(3),
  p_amount DECIMAL(20, 2)
) RETURNS BOOLEAN AS $$
DECLARE
  v_available DECIMAL(20, 2);
BEGIN
  SELECT available_amount INTO v_available
  FROM liquidity_reserves
  WHERE currency = p_currency;

  RETURN v_available IS NOT NULL AND v_available >= p_amount;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 5: Verification
-- =====================================================

-- Show created tables
SELECT '✅ Liquidity Management Tables Created' as status;
SELECT tablename 
FROM pg_tables 
WHERE tablename LIKE 'liquidity_%' 
ORDER BY tablename;

-- Show initial reserves
SELECT '' as blank;
SELECT '💰 Initial Liquidity Reserves:' as status;
SELECT 
  currency,
  total_amount,
  available_amount,
  provider_type,
  CASE 
    WHEN provider_type = 'thunes_api' THEN '🌐 API Coverage'
    WHEN provider_type = 'crypto' THEN '⛓️ Blockchain'
    WHEN provider_type = 'bank' THEN '🏦 Bank Account'
    ELSE '💳 ' || provider_type
  END as type_icon
FROM liquidity_reserves
ORDER BY 
  CASE currency
    WHEN 'USD' THEN 1
    WHEN 'CNY' THEN 2
    WHEN 'KES' THEN 3
    WHEN 'NGN' THEN 4
    ELSE 5
  END;

-- Show helper functions
SELECT '' as blank;
SELECT '🛠️ Helper Functions Created:' as status;
SELECT proname as function_name
FROM pg_proc
WHERE proname LIKE '%liquidity%'
ORDER BY proname;

COMMIT;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Check if we can fulfill an order
SELECT check_liquidity_available('CNY', 50000); -- Check ¥50K available

-- Reserve liquidity for an order
SELECT reserve_liquidity('CNY', 50000, 'order-123-456');

-- Release after fulfillment
SELECT release_liquidity('CNY', 50000, 'order-123-456');

-- View current status
SELECT 
  currency,
  total_amount as total,
  available_amount as available,
  reserved_amount as reserved,
  ROUND((available_amount::DECIMAL / NULLIF(total_amount, 0)) * 100, 1) as utilization_pct
FROM liquidity_reserves
WHERE provider_type != 'thunes_api'
ORDER BY currency;
