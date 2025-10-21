# Prisma Connection Pool Timeout - Fix Guide

## Problem

Error: `Timed out fetching a new connection from the connection pool`

This happens when:
1. Too many database connections are opened
2. Connections are not being released properly
3. Connection pool is exhausted

## Root Cause

When using Supabase with Prisma in serverless environments (like Vercel), each API route can create new Prisma client instances, exhausting the connection pool.

## Solution

### Step 1: Update DATABASE_URL with Connection Pooler

Supabase provides a connection pooler (PgBouncer) that manages connections efficiently.

**Get your connection pooler URL:**

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **Database**
3. Find **Connection Pooling** section
4. Copy the **Connection string** (Port 6543, not 5432)

**Format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 2: Add Connection Pool Parameters

Add these parameters to your `DATABASE_URL`:

```bash
# In .env.local
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10"

# Direct URL (for migrations, port 5432)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**Parameters Explained:**
- `pgbouncer=true` - Use PgBouncer connection pooling
- `connection_limit=1` - Limit connections per Prisma client (serverless)
- `pool_timeout=10` - Connection timeout in seconds

### Step 3: Verify Prisma Configuration

The Prisma client is already configured correctly in `/lib/prisma.ts`:

```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})
```

### Step 4: Restart Development Server

After updating `.env.local`:

```bash
# Stop the server (Ctrl+C)
# Restart
npm run dev
```

## Why This Happens

### Serverless Environment Issues

1. **Multiple Instances**: Each API route can create a new Prisma instance
2. **Cold Starts**: New instances don't share connection pools
3. **Connection Leaks**: Connections not properly closed

### Connection Pool Exhaustion

Default Supabase limits:
- **Free tier**: 60 connections
- **Pro tier**: 200 connections

With `connection_limit=13` (Prisma default), you can only have ~4-15 concurrent requests before exhausting the pool.

## Best Practices

### 1. Use Connection Pooler (PgBouncer)

✅ **Always use port 6543** (pooler) for `DATABASE_URL`  
✅ **Use port 5432** (direct) only for `DIRECT_URL` (migrations)

### 2. Limit Connections in Serverless

```bash
# Recommended for serverless (Vercel, Netlify)
connection_limit=1

# Recommended for traditional servers
connection_limit=10
```

### 3. Singleton Pattern

The Prisma client uses a singleton pattern (already implemented):

```typescript
// ✅ Good - Reuses same instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({...})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 4. Avoid Creating Multiple Clients

```typescript
// ❌ Bad - Creates new instance
const prisma = new PrismaClient()

// ✅ Good - Reuses singleton
import { prisma } from '@/lib/prisma'
```

## Troubleshooting

### Issue: Still getting timeout errors

**Check:**
1. Verify `DATABASE_URL` uses port **6543** (pooler)
2. Verify `pgbouncer=true` parameter is present
3. Restart dev server after changing `.env.local`
4. Check Supabase dashboard for active connections

**View active connections:**
```sql
SELECT count(*) FROM pg_stat_activity;
```

### Issue: Migrations failing

**Solution:** Use `DIRECT_URL` for migrations:

```bash
# In schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      # Pooler (6543)
  directUrl = env("DIRECT_URL")        # Direct (5432)
  schemas   = ["public"]
}
```

### Issue: Connection limit too low

**Increase for non-serverless:**

```bash
# For traditional servers
DATABASE_URL="...?pgbouncer=true&connection_limit=10&pool_timeout=20"
```

### Issue: Timeout in production

**Vercel/Netlify:**
- Each function instance gets its own connection
- Use `connection_limit=1` to prevent exhaustion
- Consider upgrading Supabase plan for more connections

## Monitoring

### Check Connection Usage

In Supabase Dashboard:
1. Go to **Database** → **Connection Pooling**
2. View active connections
3. Monitor connection pool usage

### Log Connection Issues

```typescript
// Add to prisma.ts for debugging
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
})
```

## Quick Fix Checklist

- [ ] Get connection pooler URL from Supabase (port 6543)
- [ ] Add `DATABASE_URL` to `.env.local` with pooler URL
- [ ] Add `DIRECT_URL` to `.env.local` with direct URL
- [ ] Verify `pgbouncer=true` parameter
- [ ] Add `connection_limit=1` for serverless
- [ ] Add `pool_timeout=10` parameter
- [ ] Restart development server
- [ ] Test API endpoints
- [ ] Monitor connection usage

## Example Configuration

### Development (.env.local)

```bash
# Connection Pooler (for queries)
DATABASE_URL="postgresql://postgres.abc123xyz:your_password@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10"

# Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres.abc123xyz:your_password@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

### Production (Vercel Environment Variables)

Same as development, but ensure:
- `connection_limit=1` for serverless
- Use production database credentials
- Keep credentials secret

## Additional Resources

- [Prisma Connection Pool](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Vercel + Prisma](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Summary

The connection pool timeout is fixed by:

1. ✅ Using Supabase connection pooler (port 6543)
2. ✅ Adding `pgbouncer=true` parameter
3. ✅ Setting `connection_limit=1` for serverless
4. ✅ Using singleton Prisma client pattern
5. ✅ Proper connection management

**After applying these fixes, your API routes should work without timeout errors!**
