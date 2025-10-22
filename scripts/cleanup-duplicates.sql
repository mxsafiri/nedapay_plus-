-- Cleanup duplicate receive_addresses before migration
-- This script keeps the oldest record for each duplicate address

BEGIN;

-- Step 1: Find and display duplicates
SELECT address, COUNT(*) as count 
FROM receive_addresses 
GROUP BY address 
HAVING COUNT(*) > 1;

-- Step 2: Delete duplicates, keeping only the oldest record
DELETE FROM receive_addresses
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY address ORDER BY created_at ASC) as rn
    FROM receive_addresses
  ) t
  WHERE rn > 1
);

-- Step 3: Verify no duplicates remain
SELECT address, COUNT(*) as count 
FROM receive_addresses 
GROUP BY address 
HAVING COUNT(*) > 1;

-- If the above query returns no results, the cleanup was successful
-- Uncomment the next line to commit changes:
-- COMMIT;

-- Or rollback if something looks wrong:
-- ROLLBACK;

COMMIT;
