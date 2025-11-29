-- =====================================================
-- Supabase Migration: Add KYB Compliance Documents
-- =====================================================
-- Run this in Supabase SQL Editor Dashboard
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- =====================================================

-- Add shareholder_declaration_url for ownership transparency
ALTER TABLE public.kyb_profiles 
ADD COLUMN IF NOT EXISTS shareholder_declaration_url VARCHAR;

-- Add data_protection_policy_url for GDPR/data compliance
ALTER TABLE public.kyb_profiles 
ADD COLUMN IF NOT EXISTS data_protection_policy_url VARCHAR;

-- Add comments for documentation
COMMENT ON COLUMN public.kyb_profiles.shareholder_declaration_url IS 'URL to shareholder declaration document for ownership verification';
COMMENT ON COLUMN public.kyb_profiles.data_protection_policy_url IS 'URL to data protection policy document for compliance';

-- Verify the new columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'kyb_profiles' 
  AND table_schema = 'public'
  AND column_name IN ('shareholder_declaration_url', 'data_protection_policy_url', 'aml_policy_url')
ORDER BY ordinal_position;
