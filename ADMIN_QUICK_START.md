# Admin Panel - Quick Start Guide

## 🚀 You're Absolutely Right!

Yes, using the **Supabase Service Role Key** for admin operations is the correct and secure approach. This bypasses RLS policies while keeping your data secure.

## ✅ What's Been Implemented

### 1. Service Role Client
- Created `/lib/supabase/admin.ts` with `createAdminClient()`
- Uses service role key to bypass RLS policies
- Only used server-side, never exposed to client

### 2. Admin Operations
- Updated `/lib/database/admin-operations.ts` to use admin client
- All database queries now use service role key
- Proper error handling and logging added

### 3. Admin Authentication
- Admin layout checks for admin role via `isUserAdmin()`
- Currently allows all authenticated users (for development)
- Easy to restrict in production

## 🔧 Setup Steps

### Step 1: Add Service Role Key & Admin Password

Add to `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ADMIN_ACCESS_PASSWORD=your_strong_password_here
```

**Get service role key from:** Supabase Dashboard → Settings → API → service_role key

**Generate strong password:**
```bash
openssl rand -base64 32
```

### Step 2: Make a User Admin (Optional)

Run this SQL in Supabase SQL Editor:
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "is_admin": true}'::jsonb
WHERE email = 'your-email@example.com';
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Access Admin Panel

1. Navigate to: `http://localhost:3000/protected/admin`
2. You'll be redirected to password entry page
3. Enter your `ADMIN_ACCESS_PASSWORD`
4. Access granted for 24 hours

## 🎯 Why This Approach is Correct

### ✅ Pros:
1. **Secure**: Service role key only used server-side
2. **Clean**: No need to modify RLS policies
3. **Flexible**: Admin can access all data without policy conflicts
4. **Standard**: This is the recommended Supabase pattern
5. **Maintainable**: RLS policies remain intact for regular users

### ❌ Alternative (Not Recommended):
- Modifying RLS policies to allow admin access
- Creates security risks
- Makes policies complex
- Harder to maintain

## 📊 What the Admin Panel Shows

Once service role key is configured, you'll see:
- **Total Users**: Count from `user_profiles` table
- **Providers**: Active and total provider profiles
- **Senders**: Active and total sender profiles  
- **Payment Orders**: All orders with status breakdown
- **System Health**: Tokens, currencies, webhook status

## 🔒 Security Notes

1. **Never commit** `.env.local` to version control
2. **Service role key** has full database access
3. **Only use** on server-side (Next.js server components/API routes)
4. **Rotate keys** periodically in production
5. **Monitor** admin actions via audit logs

## 🐛 Troubleshooting

### "Total users is 0"
**Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and restart server

### "Missing Supabase environment variables"
**Solution**: Check `.env.local` has all required variables (see `.env.example`)

### Can't access admin panel
**Solution**: Grant admin role to your user (see Step 2)

## 📝 Production Checklist

Before deploying to production:

- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to production environment
- [ ] Enable admin role check in `/app/protected/admin/layout.tsx`
- [ ] Grant admin role only to trusted users
- [ ] Set up monitoring for admin actions
- [ ] Review audit logs regularly
- [ ] Rotate service role key periodically

## 📚 Additional Resources

- Full setup guide: `ADMIN_SETUP.md`
- Environment variables: `.env.example`
- SQL debug scripts: `sql/check_rls_policies.sql`

## ✨ You're All Set!

The admin panel is now configured to use the service role key approach. Just add your key to `.env.local` and you'll see all your users and data in the dashboard!
