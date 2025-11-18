# 🚀 Deployment Checklist

## Pre-Deployment Steps

### 1. ✅ Environment Variables
Make sure these are set in Vercel:

**Required:**
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

**Hedera (if using):**
```
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302...
HEDERA_NETWORK=testnet
```

**Optional (for webhooks/external services):**
```
THUNES_API_KEY=...
WEBHOOK_SECRET=...
```

### 2. ✅ Build Test
```bash
npm run build
```
✅ Build successful!

### 3. ✅ Database Seeding
After deployment, run:
```bash
npm run demo:seed
```

---

## Deployment Commands

### Option 1: Deploy to Production
```bash
vercel --prod
```

### Option 2: Deploy to Preview
```bash
vercel
```

---

## Post-Deployment Steps

### 1. Verify Environment Variables
Go to Vercel Dashboard → Project → Settings → Environment Variables

### 2. Run Database Seeder
```bash
# Connect to production and seed
vercel env pull .env.production.local
npm run demo:seed
```

### 3. Test Demo Accounts
- Login: `demo@crdbbank.co.tz` / `Demo2025!`
- Click "Run Demo" button
- Verify order creation

### 4. Start Virtual Bot (Optional)
For production auto-fulfillment:
```bash
# Run on a server or serverless function
npm run demo:bot
```

---

## Demo Features to Test

✅ Login with demo accounts
✅ View populated dashboard
✅ Click "Run Demo" button
✅ See recipient information
✅ Check settlement details
✅ Verify revenue breakdown

---

## Production URLs

After deployment, you'll get:
- **Production**: https://nedapay-plus.vercel.app
- **Preview**: https://nedapay-plus-xxx.vercel.app

---

## Rollback (if needed)

```bash
vercel rollback
```

---

## Important Notes

⚠️ **Database Connection**: Make sure DIRECT_URL is set for serverless functions
⚠️ **Demo Bot**: May need separate hosting for long-running process
⚠️ **Environment**: Test on preview first before production
⚠️ **Seeder**: Run once after first deployment

---

## Support

If deployment fails:
1. Check Vercel logs: `vercel logs`
2. Verify environment variables
3. Check build output
4. Test locally first: `npm run build && npm start`
