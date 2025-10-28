# 🛠️ Manual Test Account Setup Guide

**Quick guide to create test accounts for demo and testing**

---

## Option 1: Create Via UI (Recommended)

### Step 1: Create Test Bank Account

1. **Register as Bank:**
   - Go to: `/signup`
   - Select: "Bank/Sender"
   - Email: `test-bank@crdb.co.tz`
   - Password: `TestBank123!`
   - Complete onboarding

2. **Complete Bank Profile:**
   - Business Name: CRDB Bank Tanzania (Test)
   - Trading Name: CRDB Test
   - Upload test documents
   - Wait for KYB approval (or manually approve via admin)

3. **Generate API Key:**
   - Go to Settings → API
   - Click "Generate API Key"
   - Copy and save: `test_crdb_bank_api_key_sandbox_2024`

---

### Step 2: Create Test PSP Account

1. **Register as PSP:**
   - Go to: `/signup`
   - Select: "Payment Service Provider"
   - Email: `test-psp@mpesa.com`
   - Password: `TestPSP123!`
   - Complete onboarding

2. **Complete PSP Onboarding (5 Steps):**
   
   **Step 1 - Business Details:**
   - Business Name: M-Pesa Tanzania Payment Services (Test)
   - Trading Name: M-Pesa Test
   - Email: test-psp@mpesa.com
   - Phone: +255754999888

   **Step 2 - KYB & Countries:**
   - Upload test documents
   - Select: Tanzania, Kenya, Uganda, Rwanda
   - Submit

   **Step 3 - Fiat Fulfillment Methods:** ⭐
   - ✅ Enable M-Pesa
     - Provider: Vodacom
     - Business Number: +255754999888
     - Business Name: M-Pesa Tanzania (Test)
     - Daily Limit: 50000
   - Continue

   **Step 4 - Treasury & Rates:**
   - Commission Rate: 0.3%
   - Hedera Wallet: `0.0.7099609`
   - Base Wallet: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
   - Continue

   **Step 5 - API Access:**
   - Generate API Key
   - Complete Setup

3. **Verify Setup:**
   - Dashboard shows: "Active"
   - Order queue is visible
   - Settlement wallet configured

---

### Step 3: Create Admin Account (If needed)

1. **Register as Admin:**
   - Email: `admin@nedapay.io`
   - Password: `AdminTest123!`
   - Manually set role to ADMIN in database

2. **Update Database:**
   ```sql
   UPDATE users 
   SET scope = 'ADMIN' 
   WHERE email = 'admin@nedapay.io';
   ```

---

## Option 2: Quick Database Insert

### SQL Script to Create Test Accounts

```sql
-- Note: You'll need to hash passwords using your app's hash function first
-- These are placeholder hashes - replace with actual hashed passwords

-- 1. Create Test Bank User & Profile
INSERT INTO users (id, email, password, scope, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test-bank@crdb.co.tz',
  'HASHED_PASSWORD_HERE', -- Hash: TestBank123!
  'BANK',
  NOW(),
  NOW()
);

-- Get the user ID
WITH bank_user AS (
  SELECT id FROM users WHERE email = 'test-bank@crdb.co.tz'
)
INSERT INTO sender_profiles (
  id,
  business_name,
  trading_name,
  user_sender_profile,
  markup_percentage,
  test_balance,
  is_kyb_verified,
  updated_at
)
SELECT
  gen_random_uuid(),
  'CRDB Bank Tanzania (Test)',
  'CRDB Test',
  id,
  0.002,
  100000,
  true,
  NOW()
FROM bank_user;

-- 2. Create Test PSP User & Profile
INSERT INTO users (id, email, password, scope, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test-psp@mpesa.com',
  'HASHED_PASSWORD_HERE', -- Hash: TestPSP123!
  'PSP',
  NOW(),
  NOW()
);

WITH psp_user AS (
  SELECT id FROM users WHERE email = 'test-psp@mpesa.com'
)
INSERT INTO provider_profiles (
  id,
  business_name,
  trading_name,
  user_provider_profile,
  commission_rate,
  test_balance,
  is_kyb_verified,
  is_active,
  is_available,
  supported_countries,
  treasury_accounts,
  fiat_infrastructure,
  updated_at
)
SELECT
  gen_random_uuid(),
  'M-Pesa Tanzania Payment Services (Test)',
  'M-Pesa Test',
  id,
  0.003,
  50000,
  true,
  true,
  true,
  '["TZ", "KE", "UG", "RW"]'::json,
  '{"hedera-testnet": "0.0.7099609", "base-sepolia": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}'::json,
  '{"mpesa": {"enabled": true, "provider": "vodacom", "businessNumber": "+255754999888", "businessName": "M-Pesa Tanzania (Test)", "dailyLimit": 50000}}'::json,
  NOW()
FROM psp_user;

-- 3. Create Admin User
INSERT INTO users (id, email, password, scope, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@nedapay.io',
  'HASHED_PASSWORD_HERE', -- Hash: AdminTest123!
  'ADMIN',
  NOW(),
  NOW()
);
```

---

## Option 3: Use Supabase Dashboard

If using Supabase:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click "Table Editor"

2. **Create Users:**
   - Go to `users` table
   - Click "Insert row"
   - Fill in details manually
   - Copy UUID for profiles

3. **Create Profiles:**
   - Go to `sender_profiles` or `provider_profiles`
   - Link to user via `user_sender_profile` or `user_provider_profile`
   - Set test data

4. **Update Status:**
   - Set `is_kyb_verified = true`
   - Set `is_active = true` (for PSPs)

---

## 🧪 Test Account Summary

Once created, you'll have:

### Test Banks (2):
1. **CRDB Test**
   - Email: `test-bank@crdb.co.tz`
   - Password: `TestBank123!`
   - Balance: $100,000
   - Can create orders ✅

2. **NMB Test**
   - Email: `test-bank@nmb.co.tz`
   - Password: `TestBank123!`
   - Balance: $100,000
   - Can create orders ✅

### Test PSPs (2):
1. **M-Pesa Test**
   - Email: `test-psp@mpesa.com`
   - Password: `TestPSP123!`
   - Method: M-Pesa ✅
   - Balance: $50,000
   - Settlements: Hedera + Base ✅

2. **Thunes Test**
   - Email: `test-psp@thunes.com`
   - Password: `TestPSP123!`
   - Method: Thunes API ✅
   - Balance: $50,000
   - Settlements: Hedera + Base ✅

### Admin:
- Email: `admin@nedapay.io`
- Password: `AdminTest123!`
- Access: Full platform ✅

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Banks can log in
- [ ] Banks see dashboard
- [ ] Banks have API keys
- [ ] PSPs can log in
- [ ] PSPs see order queue
- [ ] PSPs have fiat methods configured
- [ ] PSPs have settlement wallets
- [ ] Admin can access `/backstage`
- [ ] Admin can see all users
- [ ] KYB status is approved for all

---

## 🚀 Next Steps

1. **Share credentials** with initial users (use `TEST_CREDENTIALS.md`)
2. **Create test order** using bank API
3. **Fulfill order** as PSP
4. **Monitor settlement** in admin panel
5. **Verify USDC** on blockchain explorer

---

## 📝 Notes

### Password Hashing:
```typescript
// Use your app's password hash function
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash('TestBank123!', 10);
```

### API Keys:
Generate via:
- UI: Settings → API → Generate
- Database: Insert into `api_keys` table
- Format: `test_[entity]_[random]`

### Test Mode:
All accounts should have:
- `is_test: true` in api_keys
- `test_balance` set for testing
- KYB pre-approved for faster testing

---

**Choose the method that works best for you! Option 1 (UI) is recommended for beginners.** 🎯
