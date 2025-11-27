-- Switch Base to Priority 1 (Primary Network)
-- Use this when Thunes adds stablecoin settlement support on Base
-- This makes Base the primary network, Hedera becomes fallback

BEGIN;

-- Update Base Sepolia to priority 1 (primary)
UPDATE networks 
SET priority = 1
WHERE identifier = 'base-sepolia';

-- Update Hedera to priority 2 (fallback)
UPDATE networks 
SET priority = 2
WHERE identifier = 'hedera-testnet';

-- For mainnet:
UPDATE networks 
SET priority = 1
WHERE identifier = 'base';

UPDATE networks 
SET priority = 2
WHERE identifier = 'hedera-mainnet';

COMMIT;

-- Verification
SELECT '✅ Network priorities updated for Thunes integration' as status;
SELECT 
  identifier,
  network_type,
  priority,
  is_enabled,
  CASE 
    WHEN priority = 1 THEN '🥇 PRIMARY (Thunes-compatible)'
    WHEN priority = 2 THEN '🥈 FALLBACK'
    ELSE '🥉 BACKUP'
  END as role
FROM networks 
WHERE is_enabled = true
ORDER BY priority ASC;

SELECT '';
SELECT '📊 Cost Impact Analysis:';
SELECT '-----------------------------------';
SELECT 'Before: Hedera primary ($0.0001/tx)';
SELECT 'After:  Base primary (~$0.03/tx)';
SELECT 'Reason: Thunes has 130 countries on Base';
SELECT 'Benefit: Direct settlement to global corridors';
