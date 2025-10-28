# 🚀 Quick Test Accounts Setup

Run this single command to create all test accounts!

## Option 1: Using psql (Recommended)

```bash
# If you have psql installed
psql $DATABASE_URL -f scripts/create-test-accounts.sql
```

## Option 2: Using Prisma

```bash
# Using Prisma's execute command
npx prisma db execute --file scripts/create-test-accounts.sql --schema prisma/schema.prisma
```

## Option 3: Using Supabase Dashboard

1. Go to your Supabase project
2. Click "SQL Editor"
3. Copy/paste contents of `scripts/create-test-accounts.sql`
4. Click "Run"

## Option 4: Using any PostgreSQL client

Copy the contents of `scripts/create-test-accounts.sql` and run it in:
- pgAdmin
- DBeaver
- DataGrip
- TablePlus
- Or any other PostgreSQL client

---

## What Gets Created

### 2 Test Banks:
- ✅ test-bank@crdb.co.tz / TestBank123!
- ✅ test-bank@nmb.co.tz / TestBank123!

### 2 Test PSPs:
- ✅ test-psp@mpesa.com / TestPSP123!
- ✅ test-psp@thunes.com / TestPSP123!

All accounts:
- ✅ KYB pre-approved
- ✅ Test balances loaded
- ✅ Fiat methods configured (PSPs)
- ✅ Settlement wallets configured (PSPs)
- ✅ Passwords properly hashed

---

## After Running

Test the accounts:
1. Go to `http://localhost:3000/auth/login`
2. Use any of the credentials above
3. ✅ Success!

### Admin Access:
- Go to `http://localhost:3000/backstage`
- Enter your admin password
- Access admin features at `/admin/settlements`, etc.

---

**That's it! Run the SQL and you're ready to demo! 🎉**
