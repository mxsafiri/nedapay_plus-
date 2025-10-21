# Admin Panel Setup Guide

## Overview
The admin panel uses **Supabase Service Role Key** to bypass RLS policies and access all database tables. This is the secure and recommended approach for admin operations.

## Prerequisites
- Supabase project set up
- Database migrations applied
- Service Role Key from Supabase dashboard

## Step 1: Add Service Role Key to Environment Variables

Add the following to your `.env.local` file:

```bash
# Supabase Service Role Key (KEEP THIS SECRET!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### How to Get Your Service Role Key:
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Under **Project API keys**, find the **service_role** key
4. Copy it and add to `.env.local`

⚠️ **IMPORTANT**: Never commit the service role key to version control!

## Step 2: Grant Admin Access to Users

To make a user an admin, you need to update their metadata in Supabase:

### Option A: Using Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click on the user you want to make admin
3. Scroll to **User Metadata** section
4. Add the following JSON:
```json
{
  "role": "admin",
  "is_admin": true
}
```
5. Click **Save**

### Option B: Using SQL
Run this in your Supabase SQL Editor:

```sql
-- Make a user admin by email
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "is_admin": true}'::jsonb
WHERE email = 'admin@example.com';
```

## Step 3: Access the Admin Panel

1. Start your development server:
```bash
npm run dev
```

2. Log in with an admin user account

3. Navigate to: `http://localhost:3000/protected/admin`

## Security Features

### 1. Service Role Key Usage
- Admin operations use `createAdminClient()` which bypasses RLS
- Regular users use `createClient()` which respects RLS policies
- Service role key is only used server-side, never exposed to client

### 2. Admin Authentication
- Users must be authenticated to access admin panel
- Admin role is checked via `isUserAdmin()` function
- Non-admin users are redirected (can be enabled in production)

### 3. Environment Protection
```bash
# .env.local (NEVER commit this file)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ← Keep secret!
```

## Admin Capabilities

The admin panel provides full control over:

### User Management
- View all users and their profiles
- Verify/reject user accounts
- Grant/revoke sender profiles
- Grant/revoke provider profiles

### Provider Management
- View provider profiles and liquidity
- Monitor KYB verification status
- Track provider ratings and trust scores
- Manage provider configurations

### Sender Management
- View sender profiles
- Monitor webhook configurations
- Manage domain whitelists
- Track partner status

### System Monitoring
- Dashboard with key metrics
- Payment order tracking
- Transaction logs
- Audit trail
- System health indicators

## Production Deployment

### 1. Enable Admin Role Check
In `/app/protected/admin/layout.tsx`, uncomment:
```typescript
if (!hasAdminAccess) {
  redirect('/protected');  // ← Uncomment this line
}
```

### 2. Secure Environment Variables
Ensure your production environment has:
- `SUPABASE_SERVICE_ROLE_KEY` set securely
- Never expose service role key in client-side code
- Use environment variable management (Vercel, Railway, etc.)

### 3. Monitor Admin Actions
All admin actions are logged to `audit_logs` table:
```sql
SELECT * FROM audit_logs 
WHERE resource_type = 'admin_action' 
ORDER BY created_at DESC;
```

## Troubleshooting

### Issue: "Total users is 0" in dashboard

**Cause**: Service role key not configured or RLS blocking access

**Solution**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
2. Restart your development server
3. Check browser console for errors
4. Verify database has users: `SELECT COUNT(*) FROM user_profiles;`

### Issue: "Missing Supabase environment variables"

**Cause**: Service role key not found

**Solution**:
1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
2. Restart server: `npm run dev`

### Issue: User can't access admin panel

**Cause**: User doesn't have admin role

**Solution**:
1. Grant admin role using SQL or Dashboard (see Step 2)
2. User must log out and log back in
3. Check `isUserAdmin()` function is working

## File Structure

```
lib/
├── supabase/
│   ├── admin.ts          # Service role client
│   ├── server.ts         # Regular server client
│   └── client.ts         # Client-side client
├── database/
│   └── admin-operations.ts  # Admin CRUD operations
└── types/
    └── admin.ts          # Admin type definitions

app/
└── protected/
    └── admin/
        ├── layout.tsx    # Admin layout with auth
        ├── page.tsx      # Dashboard
        ├── users/        # User management
        ├── providers/    # Provider management
        └── senders/      # Sender management

components/
└── admin/
    ├── sidebar.tsx       # Navigation
    ├── dashboard.tsx     # Overview stats
    └── ...              # Management components
```

## Best Practices

1. **Never expose service role key** in client-side code
2. **Always use admin client** for admin operations
3. **Log all admin actions** for audit trail
4. **Restrict admin access** in production
5. **Monitor admin activity** regularly
6. **Rotate service role key** periodically
7. **Use environment variables** for all secrets

## Support

For issues or questions:
1. Check console logs for errors
2. Verify environment variables are set
3. Check Supabase dashboard for API status
4. Review audit logs for admin actions
