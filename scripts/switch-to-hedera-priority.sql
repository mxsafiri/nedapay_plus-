-- Switch Hedera to Priority 1 (Primary Network)
-- Use this for maximum cost savings when Thunes not required
-- This makes Hedera the primary network, Base becomes fallback

BEGIN;

-- Update Hedera to priority 1 (primary)
UPDATE networks 
SET priority = 1
WHERE identifier = 'hedera-testnet';

-- Update Base Sepolia to priority 2 (fallback)
UPDATE networks 
SET priority = 2
WHERE identifier = 'base-sepolia';

-- For mainnet:
UPDATE networks 
SET priority = 1
WHERE identifier = 'hedera-mainnet';

UPDATE networks 
SET priority = 2
WHERE identifier = 'base';

COMMIT;

-- Verification
SELECT '✅ Network priorities updated for cost optimization' as status;
SELECT 
  identifier,
  network_type,
  priority,
  is_enabled,
  CASE 
    WHEN priority = 1 THEN '🥇 PRIMARY (Ultra-low cost)'
    WHEN priority = 2 THEN '🥈 FALLBACK'
    ELSE '🥉 BACKUP'
  END as role
FROM networks 
WHERE is_enabled = true
ORDER BY priority ASC;

SELECT '';
SELECT '📊 Cost Impact Analysis:';
SELECT '-----------------------------------';
SELECT 'Hedera primary: $0.0001/tx (99.67% cheaper)';
SELECT 'Base fallback: ~$0.03/tx (when Hedera unavailable)';
SELECT 'Annual savings (100K tx/month): $35,880/year';
