-- Check RLS policies and data access for admin dashboard
-- Run this in Supabase SQL Editor to diagnose access issues

-- 1. Check if RLS is enabled on user_profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'user_profiles';

-- 2. List all RLS policies on user_profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 3. Count total users in user_profiles (bypassing RLS with service role)
SELECT 
    'Total users in user_profiles' as info,
    COUNT(*) as count,
    COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified,
    COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected
FROM public.user_profiles;

-- 4. Show sample user data
SELECT 
    id,
    business_type,
    company_name,
    verification_status,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check if current user can read user_profiles
-- This simulates what the authenticated user sees
SELECT 
    'Accessible users for current session' as info,
    COUNT(*) as count
FROM public.user_profiles;

-- 6. Temporary fix: Disable RLS on user_profiles for testing (ONLY FOR DEBUGGING)
-- Uncomment to temporarily disable RLS and test if that's the issue:
/*
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
*/

-- 7. Better fix: Add policy to allow authenticated users to read all user_profiles
-- Uncomment to add a policy that allows admins to read all profiles:
/*
CREATE POLICY "Allow authenticated users to read all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);
*/

-- 8. Check if the authenticated user has the right role
SELECT 
    current_user as current_database_user,
    session_user,
    current_role;
