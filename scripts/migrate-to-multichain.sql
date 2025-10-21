-- Migration: Add Multi-Chain Support (Hedera + EVM)
-- Safe migration that preserves existing Base Sepolia data

BEGIN;

-- Step 1: Add new columns to networks table
ALTER TABLE networks 
ADD COLUMN IF NOT EXISTS network_type VARCHAR DEFAULT 'evm',
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hedera_network_id VARCHAR,
ADD COLUMN IF NOT EXISTS mirror_node_url VARCHAR,
ADD COLUMN IF NOT EXISTS hedera_operator_id VARCHAR,
ADD COLUMN IF NOT EXISTS sdk_config JSONB;

-- Step 2: Make EVM-specific fields nullable
ALTER TABLE networks ALTER COLUMN chain_id DROP NOT NULL;
ALTER TABLE networks ALTER COLUMN rpc_endpoint DROP NOT NULL;

-- Step 3: Add new columns to tokens table
ALTER TABLE tokens
ADD COLUMN IF NOT EXISTS token_type VARCHAR DEFAULT 'erc20',
ADD COLUMN IF NOT EXISTS token_metadata JSONB;

-- Step 4: Add new columns to payment_orders table
ALTER TABLE payment_orders
ADD COLUMN IF NOT EXISTS tx_id VARCHAR,
ADD COLUMN IF NOT EXISTS network_used VARCHAR;

-- Step 5: Update existing Base Sepolia network
UPDATE networks 
SET network_type = 'evm', 
    priority = 2,
    is_enabled = true
WHERE identifier = 'base-sepolia';

-- Step 6: Update existing tokens as ERC-20
UPDATE tokens 
SET token_type = 'erc20'
WHERE token_type IS NULL;

COMMIT;

-- Verification queries
SELECT 'Networks after migration:' as status;
SELECT id, identifier, network_type, priority, is_enabled FROM networks;

SELECT 'Tokens after migration:' as status;
SELECT id, symbol, token_type FROM tokens LIMIT 5;
