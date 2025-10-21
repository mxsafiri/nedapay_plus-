-- Debug script to check user_profiles vs auth.users
-- Run this in your Supabase SQL Editor to diagnose the issue

-- 1. Check how many users exist in auth.users
SELECT 'Total users in auth.users:' as info, COUNT(*) as count
FROM auth.users;

-- 2. Check how many users exist in user_profiles
SELECT 'Total users in user_profiles:' as info, COUNT(*) as count
FROM public.user_profiles;

-- 3. Find users in auth.users but NOT in user_profiles
SELECT 
    'Users missing from user_profiles:' as info,
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'business_type' as business_type,
    au.raw_user_meta_data->>'display_name' as display_name
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 4. Check if the trigger exists
SELECT 
    'Trigger status:' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Check if the function exists
SELECT 
    'Function status:' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 6. Manually create missing user_profiles (RUN THIS IF USERS ARE MISSING)
-- Uncomment the lines below to fix missing profiles:

/*
INSERT INTO public.user_profiles (id, business_type, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'business_type', 'sender')::text,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/

-- 7. Check RLS policies on user_profiles
SELECT 
    'RLS Policies on user_profiles:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_profiles';
