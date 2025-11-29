-- Migration: Add Paycrest Integration Fields
-- Adds fields to support Paycrest off-ramp functionality

BEGIN;

-- Add Paycrest tracking fields to payment_orders
ALTER TABLE payment_orders
ADD COLUMN IF NOT EXISTS paycrest_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paycrest_valid_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fulfillment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Create index for faster Paycrest order lookups
CREATE INDEX IF NOT EXISTS idx_payment_orders_paycrest_order_id 
ON payment_orders(paycrest_order_id);

-- Create index for fulfillment method filtering
CREATE INDEX IF NOT EXISTS idx_payment_orders_fulfillment_method 
ON payment_orders(fulfillment_method);

COMMIT;

-- Verification
SELECT 'Paycrest integration fields added successfully!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payment_orders' 
AND column_name IN ('paycrest_order_id', 'paycrest_valid_until', 'fulfillment_method', 'failure_reason');
