-- Add missing fields to api_keys table for proper key management
-- Run this migration to enable:
-- - Descriptive key names
-- - Active/Inactive status
-- - Creation timestamp tracking
-- - Last used timestamp tracking
-- - Request counting for usage limits

-- Add key_name for descriptive API key identification
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS key_name VARCHAR(255);

-- Add is_active for enable/disable functionality
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add created_at timestamp
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ(6) DEFAULT NOW();

-- Add last_used_at for usage tracking
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ(6);

-- Add request_count for rate limiting
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS request_count BIGINT DEFAULT 0;

-- Add last_request_reset_at for monthly reset tracking
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS last_request_reset_at TIMESTAMPTZ(6) DEFAULT NOW();

-- Update existing keys to be active by default
UPDATE api_keys 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Add index for faster lookups by active status
CREATE INDEX IF NOT EXISTS idx_api_keys_active 
ON api_keys(is_active) WHERE is_active = TRUE;

-- Add index for faster lookups by last used
CREATE INDEX IF NOT EXISTS idx_api_keys_last_used 
ON api_keys(last_used_at);

COMMENT ON COLUMN api_keys.key_name IS 'User-provided descriptive name for the API key';
COMMENT ON COLUMN api_keys.is_active IS 'Whether the key is currently active and can be used';
COMMENT ON COLUMN api_keys.created_at IS 'Timestamp when the API key was created';
COMMENT ON COLUMN api_keys.last_used_at IS 'Timestamp when the API key was last used';
COMMENT ON COLUMN api_keys.request_count IS 'Number of requests made with this key in current billing period';
COMMENT ON COLUMN api_keys.last_request_reset_at IS 'Timestamp when request_count was last reset (monthly)';
