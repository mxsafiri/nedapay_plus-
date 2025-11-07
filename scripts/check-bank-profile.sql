-- Check if bank profiles were created properly
SELECT 
  u.email,
  u.scope,
  u.first_name,
  u.last_name,
  sp.id as profile_id,
  sp.markup_percentage,
  sp.test_balance,
  sp.is_active
FROM users u
LEFT JOIN sender_profiles sp ON u.id = sp.user_sender_profile
WHERE u.email IN ('test-bank@nmb.co.tz', 'test-bank@crdb.co.tz')
ORDER BY u.email;
