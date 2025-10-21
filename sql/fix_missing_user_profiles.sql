-- Fix script: Create missing user_profiles for existing auth.users
-- This will sync auth.users with user_profiles table

-- Step 1: Create user_profiles for any auth.users that don't have them
INSERT INTO public.user_profiles (
    id, 
    business_type,
    company_name,
    verification_status,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'business_type', 'sender')::text as business_type,
    au.raw_user_meta_data->>'display_name' as company_name,
    'pending' as verification_status,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
  AND au.email_confirmed_at IS NOT NULL  -- Only confirmed users
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify the fix
SELECT 
    'After fix - Users in auth.users:' as status,
    COUNT(*) as count
FROM auth.users
WHERE email_confirmed_at IS NOT NULL

UNION ALL

SELECT 
    'After fix - Users in user_profiles:' as status,
    COUNT(*) as count
FROM public.user_profiles;

-- Step 3: Show the synced users
SELECT 
    up.id,
    au.email,
    up.business_type,
    up.company_name,
    up.verification_status,
    up.created_at
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC;
