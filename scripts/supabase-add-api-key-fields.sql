-- =====================================================
-- Supabase Migration: Add API Key Management Fields
-- =====================================================
-- Run this in Supabase SQL Editor Dashboard
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- =====================================================

-- Add key_name for descriptive API key identification
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS key_name VARCHAR(255);

-- Add is_active for enable/disable functionality
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add created_at timestamp
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ(6) DEFAULT NOW();

-- Add last_used_at for usage tracking
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ(6);

-- Add request_count for rate limiting
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS request_count BIGINT DEFAULT 0;

-- Add last_request_reset_at for monthly reset tracking
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS last_request_reset_at TIMESTAMPTZ(6) DEFAULT NOW();

-- Update existing keys to be active by default
UPDATE public.api_keys 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Verify the new columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'api_keys' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
