-- Remove redundant admin account
-- Admin access is via /backstage password gate, not user accounts

DELETE FROM users WHERE email = 'admin@nedapay.io';

-- Verify deletion
SELECT 
  email,
  scope,
  created_at
FROM users
WHERE email = 'admin@nedapay.io';
-- Should return 0 rows
