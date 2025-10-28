-- Migration: Add settlement tracking
-- Date: 2025-10-28
-- Description: Track USDC settlements separately from fiat fulfillment

-- Add settlement fields to payment_orders
ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS settlement_tx_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS settlement_network VARCHAR(50),
ADD COLUMN IF NOT EXISTS settlement_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS fulfillment_method VARCHAR(100),
ADD COLUMN IF NOT EXISTS fulfillment_proof_url TEXT;

-- Create index for finding unsettled orders
CREATE INDEX IF NOT EXISTS idx_settlement_status 
  ON payment_orders(settlement_status, status) 
  WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_settled_at 
  ON payment_orders(settled_at) 
  WHERE settled_at IS NOT NULL;

-- Add fiat infrastructure to provider profiles
ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS fiat_infrastructure JSONB;

-- Comments for clarity
COMMENT ON COLUMN payment_orders.tx_hash IS 'Fiat fulfillment proof (M-Pesa ref, Thunes TX ID, bank ref)';
COMMENT ON COLUMN payment_orders.settlement_tx_hash IS 'USDC settlement blockchain transaction hash';
COMMENT ON COLUMN payment_orders.network_used IS 'Fiat fulfillment method (mpesa, thunes, bank)';
COMMENT ON COLUMN payment_orders.settlement_network IS 'Blockchain network used for settlement (hedera-mainnet, base)';
COMMENT ON COLUMN payment_orders.fulfillment_method IS 'Detailed fulfillment method (mpesa_vodacom, thunes_api, bank_crdb)';
COMMENT ON COLUMN provider_profiles.fiat_infrastructure IS 'Provider fiat fulfillment methods config (M-Pesa, Thunes, banks)';

-- Create settlement batch tracking table
CREATE TABLE IF NOT EXISTS settlement_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_date DATE NOT NULL,
  provider_id VARCHAR NOT NULL REFERENCES provider_profiles(id),
  order_ids JSONB NOT NULL,
  total_order_value DECIMAL(18,2) NOT NULL,
  total_commission DECIMAL(18,2) NOT NULL,
  settlement_amount DECIMAL(18,2) NOT NULL,
  usdc_amount DECIMAL(18,8) NOT NULL,
  settlement_tx_hash VARCHAR(255),
  settlement_network VARCHAR(50),
  blockchain_fee DECIMAL(18,8),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

CREATE INDEX idx_settlement_batches_provider ON settlement_batches(provider_id, batch_date);
CREATE INDEX idx_settlement_batches_status ON settlement_batches(status, batch_date);

-- Track settlement retries
CREATE TABLE IF NOT EXISTS settlement_retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES payment_orders(id),
  batch_id UUID REFERENCES settlement_batches(id),
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_settlement_retry_queue_next_retry ON settlement_retry_queue(next_retry_at) 
  WHERE resolved_at IS NULL;

-- Add settlement stats to provider_profiles
ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS total_settlements DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_settlement_amount DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_settlement_date DATE;

-- Function to update pending settlement amount
CREATE OR REPLACE FUNCTION update_provider_pending_settlement()
RETURNS TRIGGER AS $$
BEGIN
  -- When order completed but not settled, add to pending
  IF NEW.status = 'completed' AND NEW.settlement_status = 'pending' THEN
    UPDATE provider_profiles 
    SET pending_settlement_amount = pending_settlement_amount + (NEW.amount_paid + NEW.psp_commission)
    WHERE id = NEW.assigned_psp_id;
  END IF;
  
  -- When order settled, remove from pending and add to total
  IF NEW.settlement_status = 'completed' AND OLD.settlement_status != 'completed' THEN
    UPDATE provider_profiles 
    SET 
      pending_settlement_amount = pending_settlement_amount - (NEW.amount_paid + NEW.psp_commission),
      total_settlements = total_settlements + (NEW.amount_paid + NEW.psp_commission),
      last_settlement_date = CURRENT_DATE
    WHERE id = NEW.assigned_psp_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_pending_settlement ON payment_orders;
CREATE TRIGGER trigger_update_pending_settlement
  AFTER UPDATE ON payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_pending_settlement();

-- Backfill pending settlements for existing orders
UPDATE provider_profiles p
SET pending_settlement_amount = (
  SELECT COALESCE(SUM(po.amount_paid + po.psp_commission), 0)
  FROM payment_orders po
  WHERE po.assigned_psp_id = p.id
    AND po.status = 'completed'
    AND po.settlement_status = 'pending'
);

COMMENT ON TABLE settlement_batches IS 'Batch settlements to providers in USDC';
COMMENT ON TABLE settlement_retry_queue IS 'Failed settlements awaiting retry';
