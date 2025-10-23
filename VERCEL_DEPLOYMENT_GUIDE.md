# 🚀 Vercel Deployment Guide - NedaPay Plus

## Prerequisites Checklist

Before deploying, make sure you have:
- ✅ GitHub account with repository access
- ✅ Vercel account (sign up at vercel.com)
- ✅ PostgreSQL database (Supabase/Railway/Neon)
- ✅ All environment variables ready

---

## 📦 Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

---

## 🔐 Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

---

## 🌐 Step 3: Initial Deployment

Navigate to your project:
```bash
cd /Users/victormuhagachi/CascadeProjects/nedapay_plus
```

Run deployment:
```bash
vercel
```

**Answer the prompts:**
```
? Set up and deploy "~/CascadeProjects/nedapay_plus"? [Y/n] Y
? Which scope? → Select your account
? Link to existing project? [y/N] N
? What's your project's name? nedapay-plus
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

Vercel will:
1. Detect Next.js automatically
2. Install dependencies
3. Build your project
4. Deploy to a preview URL

---

## 🔑 Step 4: Configure Environment Variables

### Option A: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Select your project: **nedapay-plus**
3. Click **Settings** → **Environment Variables**
4. Add each variable below:

### Required Environment Variables:

```bash
# Database (Supabase/PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/nedapay_plus

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420xxxxx

# Base/EVM Configuration (if using)
BASE_RPC_URL=https://sepolia.base.org
BASE_PRIVATE_KEY=0xxxxx

# Admin Configuration
ADMIN_PASSWORD=your-secure-admin-password
JWT_SECRET=your-jwt-secret-min-32-chars

# USDC Token Addresses
HEDERA_USDC_TOKEN_ID=0.0.456858
BASE_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# API Configuration
NEXT_PUBLIC_API_URL=https://nedapay-plus.vercel.app
NODE_ENV=production

# Optional: Webhook URLs
WEBHOOK_SECRET=your-webhook-secret

# Optional: Email/Notifications (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Option B: Via CLI

```bash
# Add environment variables one by one
vercel env add DATABASE_URL
# Paste value when prompted

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste value when prompted

# ... repeat for all variables
```

**Important Notes:**
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Other variables are server-side only (secure)
- Add to **Production**, **Preview**, and **Development** environments

---

## 🎯 Step 5: Deploy to Production

After setting environment variables:

```bash
vercel --prod
```

This will:
1. Build with production environment variables
2. Deploy to your production domain
3. Show your live URL

---

## 🌍 Step 6: Custom Domain (Optional)

### Add Your Domain:

```bash
vercel domains add nedapay.com
```

Or via dashboard:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

**DNS Configuration:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 📊 Step 7: Database Migration

After first deployment, run migrations:

### Option A: Via Vercel CLI
```bash
# Connect to production
vercel env pull .env.production

# Run migrations locally against production DB
npm run db:push
# or
npx prisma migrate deploy
```

### Option B: Via Database Provider Dashboard
- Use Supabase SQL Editor
- Or connect via pgAdmin/TablePlus

---

## ✅ Step 8: Verify Deployment

### Check Your Deployment:

1. **Visit your URL:**
   ```
   https://nedapay-plus.vercel.app
   ```

2. **Test Authentication:**
   - Visit `/auth/login`
   - Create test account
   - Login

3. **Test Admin Panel:**
   - Visit `/backstage`
   - Enter admin password
   - Check `/admin` dashboard

4. **Test API Routes:**
   ```bash
   # Health check
   curl https://nedapay-plus.vercel.app/api/networks/status
   
   # Check database connection
   curl https://nedapay-plus.vercel.app/api/admin/users
   ```

5. **Check Logs:**
   ```bash
   vercel logs --follow
   ```

---

## 🔄 Step 9: Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "feat: some feature"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds the project
# 3. Deploys to production
# 4. Notifies you via email
```

**Preview Deployments:**
- Every branch push gets a preview URL
- Test changes before merging to main
- Perfect for PSP testing!

---

## 🛠️ Common Commands

```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# View logs (follow mode)
vercel logs --follow

# List deployments
vercel ls

# Remove deployment
vercel rm deployment-url

# View environment variables
vercel env ls

# Pull environment to local
vercel env pull

# Link local project to Vercel
vercel link

# Check deployment status
vercel inspect
```

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Module not found"
```bash
# Solution: Clear cache and rebuild
vercel --force
```

**Error:** "Environment variable missing"
```bash
# Solution: Check all required vars are set
vercel env ls
```

### Database Connection Issues

**Error:** "Can't reach database server"
```bash
# Solution: Check DATABASE_URL and whitelist Vercel IPs
# Vercel uses dynamic IPs, so use connection pooling
# Supabase: Enable connection pooling
# Or use Prisma Data Proxy
```

### API Routes Timeout

**Error:** "Function execution timed out"
```bash
# Solution: Increase maxDuration in vercel.json
# Already set to 30s in your config
```

### Prisma Issues

**Error:** "PrismaClient initialization error"
```bash
# Solution: Generate Prisma client for production
# Add to package.json:
"vercel-build": "prisma generate && next build"
```

---

## 📈 Performance Optimization

### 1. Enable Edge Caching

Add to API routes that can be cached:
```typescript
export const runtime = 'edge';
export const revalidate = 60; // Cache for 60 seconds
```

### 2. Use Vercel KV for Redis (Optional)

For caching exchange rates, network status:
```bash
vercel kv create nedapay-cache
```

### 3. Monitor Performance

Dashboard → Analytics → Performance Insights

---

## 💰 Cost Estimation

### Free Tier (Hobby Plan):
- ✅ 100GB bandwidth/month
- ✅ 6,000 build minutes/month
- ✅ Unlimited API requests
- ✅ 100 serverless function executions/hour
- ✅ Good for testing & low traffic

### Expected Usage (with 100 PSPs):
- ~20GB bandwidth/month
- ~30 minutes build time/deployment
- ~50K API requests/month
- **Fits in FREE tier!** ✅

### When to Upgrade to Pro ($20/month):
- > 1TB bandwidth
- Need team collaboration
- Want SLA guarantees
- Need more concurrent builds
- Production-grade monitoring

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` to git
- ✅ Use different values for production
- ✅ Rotate secrets regularly
- ✅ Use strong JWT secrets (32+ chars)

### 2. Database Security
- ✅ Use SSL connections
- ✅ Enable connection pooling
- ✅ Whitelist Vercel IPs (if possible)
- ✅ Regular backups

### 3. API Security
- ✅ Rate limiting on sensitive endpoints
- ✅ Validate all inputs
- ✅ Use CORS properly
- ✅ Monitor for suspicious activity

---

## 📞 Support Resources

**Vercel Documentation:**
- https://vercel.com/docs

**Vercel Discord:**
- https://vercel.com/discord

**Vercel Status:**
- https://www.vercel-status.com/

**NedaPay Issues:**
- Check deployment logs: `vercel logs`
- Review build output in dashboard
- Test locally first: `npm run build`

---

## 🎉 You're Done!

Your NedaPay platform is now:
- ✅ Deployed on Vercel
- ✅ Accessible globally
- ✅ Auto-scaling
- ✅ HTTPS enabled
- ✅ Preview deployments active
- ✅ Production-ready!

**Next Steps:**
1. Share URL with PSPs for testing
2. Monitor logs and performance
3. Set up custom domain
4. Configure email notifications
5. Enable monitoring/alerts

**Your platform is LIVE!** 🚀

---

*Last Updated: October 2025*  
*Version: 1.0*  
*Platform: NedaPay Plus*
