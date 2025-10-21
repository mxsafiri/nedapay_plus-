# Prisma Setup Guide for Supabase

## Overview

We'll use **Prisma** for type-safe database operations and **Supabase SDK** only for auth and realtime features.

## Step 1: Install Prisma

```bash
npm install prisma @prisma/client
npm install -D prisma
```

## Step 2: Get Your Database Connection String

### From Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string**
5. Select **URI** tab
6. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Important Notes:
- Replace `[YOUR-PASSWORD]` with your actual database password
- This is different from your Supabase project password
- You set this password when you created the project

## Step 3: Update .env.local

Add these to your `.env.local` file:

```bash
# Database Connection (for Prisma)
DATABASE_URL="postgresql://postgres:MjuPjLWfGuy6Klo6@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:MjuPjLWfGuy6Klo6@db.xxxxx.supabase.co:5432/postgres"

# Existing Supabase Config (keep these)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Why Two URLs?

- **DATABASE_URL**: Uses connection pooling (pgbouncer) for serverless functions
- **DIRECT_URL**: Direct connection for migrations and introspection

## Step 4: Initialize Prisma

```bash
# Initialize Prisma (this creates prisma/schema.prisma)
npx prisma init
```

## Step 5: Pull Schema from Supabase

This will introspect your Supabase database and generate the Prisma schema:

```bash
# Pull the schema from your database
npx prisma db pull

# Generate Prisma Client
npx prisma generate
```

### What This Does:

1. Connects to your Supabase database
2. Reads all tables, columns, relationships
3. Generates `schema.prisma` with all your models
4. Creates TypeScript types for type-safe queries

## Step 6: Update schema.prisma

After pulling, your `schema.prisma` should look like:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  schemas   = ["public", "auth"]
}

// Your models will be here after db pull
model users {
  id                     String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  created_at             DateTime @db.Timestamptz(6)
  updated_at             DateTime @db.Timestamptz(6)
  first_name             String   @db.VarChar
  last_name              String   @db.VarChar
  email                  String   @unique @db.VarChar
  password               String   @db.VarChar
  scope                  String   @db.VarChar
  is_email_verified      Boolean  @default(false)
  has_early_access       Boolean  @default(false)
  kyb_verification_status String  @default("not_started") @db.VarChar

  @@schema("public")
}

// More models...
```

## Step 7: Create Prisma Client Instance

Create `/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Step 8: Update Sign-up API Route

Replace Supabase SDK calls with Prisma:

```typescript
import { prisma } from '@/lib/prisma';

// Instead of:
// const { data, error } = await supabase.from('users').insert(...)

// Use:
const newUser = await prisma.users.create({
  data: {
    id: crypto.randomUUID(),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    scope: scope,
    is_email_verified: false,
    has_early_access: true,
    kyb_verification_status: 'not_started',
    created_at: new Date(),
    updated_at: new Date()
  }
});
```

## Step 9: Add Prisma Scripts to package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "prisma:pull": "prisma db pull",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push"
  }
}
```

## Common Commands

```bash
# Pull latest schema from database
npm run prisma:pull

# Generate Prisma Client after schema changes
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Push schema changes to database (be careful!)
npm run prisma:push
```

## Architecture

### Use Prisma For:
✅ Database queries (CRUD operations)
✅ Type-safe data access
✅ Complex queries with joins
✅ Transactions
✅ Data validation

### Use Supabase SDK For:
✅ Authentication (sign in, sign up, sessions)
✅ Realtime subscriptions
✅ Storage (file uploads)
✅ Edge functions

## Benefits

1. **Type Safety**: Full TypeScript support with autocomplete
2. **Better DX**: Intuitive API for database operations
3. **Performance**: Optimized queries
4. **Migrations**: Track schema changes
5. **No RLS Issues**: Direct database access with proper validation

## Troubleshooting

### Error: "Can't reach database server"

**Solution**: Check your DATABASE_URL and DIRECT_URL in `.env.local`

### Error: "Password authentication failed"

**Solution**: 
1. Go to Supabase Dashboard → Settings → Database
2. Reset your database password
3. Update the connection strings in `.env.local`

### Error: "Schema not found"

**Solution**: Make sure you've run the SQL migrations in Supabase first

### Prisma Client not found

**Solution**: Run `npx prisma generate`

## Next Steps

1. Install Prisma: `npm install prisma @prisma/client`
2. Get your database connection string from Supabase
3. Add DATABASE_URL and DIRECT_URL to `.env.local`
4. Run `npx prisma db pull`
5. Run `npx prisma generate`
6. Create `/lib/prisma.ts`
7. Update API routes to use Prisma
8. Test sign-up flow

## Example: Complete Sign-up with Prisma

```typescript
// /app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, businessTypes } = await request.json();
    
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Create user
    const newUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        scope: businessTypes.includes('both') ? 'both' : businessTypes[0],
        is_email_verified: false,
        has_early_access: true,
        kyb_verification_status: 'not_started',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    return NextResponse.json({ success: true, userId: newUser.id });
  } catch (error) {
    console.error('Sign-up error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
```

This approach gives you the best of both worlds: Prisma's type safety for database operations and Supabase's powerful auth and realtime features!
