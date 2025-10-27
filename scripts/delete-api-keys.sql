-- Emergency script to delete existing API keys for a user
-- Run this in your database if you have orphaned keys

-- For PROVIDER users (replace with actual provider_profile ID):
DELETE FROM public.api_keys 
WHERE provider_profile_api_key = 'YOUR_PROVIDER_PROFILE_ID_HERE';

-- For SENDER users (replace with actual sender_profile ID):
DELETE FROM public.api_keys 
WHERE sender_profile_api_key = 'YOUR_SENDER_PROFILE_ID_HERE';

-- To find your profile ID, run:
SELECT 
  u.id as user_id,
  u.email,
  sp.id as sender_profile_id,
  pp.id as provider_profile_id
FROM public.users u
LEFT JOIN public.sender_profiles sp ON u.id = sp.user_sender_profile
LEFT JOIN public.provider_profiles pp ON u.id = pp.user_provider_profile
WHERE u.email = 'YOUR_EMAIL_HERE';

-- Then check if keys exist:
SELECT 
  ak.id,
  ak.is_test,
  ak.sender_profile_api_key,
  ak.provider_profile_api_key,
  LENGTH(ak.secret) as secret_length
FROM public.api_keys ak
WHERE ak.provider_profile_api_key = 'YOUR_PROFILE_ID'
   OR ak.sender_profile_api_key = 'YOUR_PROFILE_ID';
