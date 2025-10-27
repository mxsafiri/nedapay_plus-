-- EMERGENCY CLEANUP: Remove orphaned provider API keys
-- Run this in Supabase SQL Editor

-- Step 1: Find your provider profile ID and check for keys
-- Replace 'YOUR_EMAIL_HERE' with your actual provider email
SELECT 
  u.id as user_id,
  u.email,
  u.scope,
  pp.id as provider_profile_id,
  pp.trading_name,
  (SELECT COUNT(*) 
   FROM public.api_keys ak 
   WHERE ak.provider_profile_api_key = pp.id) as api_key_count
FROM public.users u
JOIN public.provider_profiles pp ON u.id = pp.user_provider_profile
WHERE u.scope = 'provider'
ORDER BY u.created_at DESC;

-- Step 2: View the orphaned keys (if any)
-- Replace 'YOUR_PROVIDER_PROFILE_ID' with the ID from Step 1
SELECT 
  ak.id as key_id,
  ak.provider_profile_api_key,
  ak.is_test,
  ak.created_at,
  LENGTH(ak.secret) as has_secret,
  pp.trading_name
FROM public.api_keys ak
LEFT JOIN public.provider_profiles pp ON ak.provider_profile_api_key = pp.id
WHERE ak.provider_profile_api_key = 'YOUR_PROVIDER_PROFILE_ID';

-- Step 3: DELETE the orphaned keys
-- Replace 'YOUR_PROVIDER_PROFILE_ID' with the ID from Step 1
DELETE FROM public.api_keys 
WHERE provider_profile_api_key = 'YOUR_PROVIDER_PROFILE_ID';

-- Step 4: Verify deletion (should return 0 rows)
SELECT COUNT(*) as remaining_keys
FROM public.api_keys 
WHERE provider_profile_api_key = 'YOUR_PROVIDER_PROFILE_ID';

-- Alternative: If you want to delete ALL provider keys (nuclear option)
-- DELETE FROM public.api_keys WHERE provider_profile_api_key IS NOT NULL;

-- After cleanup, you should be able to create API keys via the UI
