-- Simple migration: Add only Paycrest fields to payment_orders
-- Run this directly on your Supabase database

-- Add Paycrest tracking fields
ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS paycrest_order_id VARCHAR;

ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS paycrest_valid_until TIMESTAMPTZ;

ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Create index for faster Paycrest order lookups
CREATE INDEX IF NOT EXISTS idx_payment_orders_paycrest_order_id 
ON payment_orders(paycrest_order_id)
WHERE paycrest_order_id IS NOT NULL;

-- Verify
SELECT 'Paycrest fields added successfully!' as status;
