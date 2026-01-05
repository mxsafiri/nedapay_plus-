-- Migration: Add document notes column to kyb_profiles
-- This allows users to add explanatory notes for each uploaded document

ALTER TABLE public.kyb_profiles
ADD COLUMN IF NOT EXISTS document_notes JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.kyb_profiles.document_notes IS 'JSON object containing notes for each document type, e.g., {"incorporation": "Trade Registration Certificate - equivalent in Tanzania", "license": "Using Tax Certificate"}';
