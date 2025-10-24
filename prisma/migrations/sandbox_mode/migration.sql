-- Add sandbox/test mode support to NedaPay platform

-- Add is_test flag to api_keys table
ALTER TABLE "public"."api_keys" 
ADD COLUMN IF NOT EXISTS "is_test" BOOLEAN NOT NULL DEFAULT false;

-- Add is_test_mode flag to payment_orders table
ALTER TABLE "public"."payment_orders" 
ADD COLUMN IF NOT EXISTS "is_test_mode" BOOLEAN NOT NULL DEFAULT false;

-- Add test_balance to sender_profiles table
ALTER TABLE "public"."sender_profiles" 
ADD COLUMN IF NOT EXISTS "test_balance" DOUBLE PRECISION NOT NULL DEFAULT 10000;

-- Add test_balance to provider_profiles table
ALTER TABLE "public"."provider_profiles" 
ADD COLUMN IF NOT EXISTS "test_balance" DOUBLE PRECISION NOT NULL DEFAULT 50000;

-- Create index for faster test mode queries
CREATE INDEX IF NOT EXISTS "idx_payment_orders_test_mode" ON "public"."payment_orders"("is_test_mode");
CREATE INDEX IF NOT EXISTS "idx_api_keys_test" ON "public"."api_keys"("is_test");

-- Add comments for documentation
COMMENT ON COLUMN "public"."api_keys"."is_test" IS 'Indicates if this is a test API key (np_test_) vs live (np_live_)';
COMMENT ON COLUMN "public"."payment_orders"."is_test_mode" IS 'Indicates if this payment order was created in test/sandbox mode';
COMMENT ON COLUMN "public"."sender_profiles"."test_balance" IS 'Virtual balance for testing ($10,000 USD equivalent)';
COMMENT ON COLUMN "public"."provider_profiles"."test_balance" IS 'Virtual balance for testing ($50,000 USD equivalent for PSPs)';
