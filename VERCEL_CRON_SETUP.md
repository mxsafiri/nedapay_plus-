# ⏰ Vercel Cron - 24/7 Demo Bot Setup

## 🎯 What This Does

Your demo will now work **24/7** even when your computer is off!

**Before:** Demo bot only works when `npm run demo:bot` is running locally  
**After:** Vercel runs the bot automatically every minute in the cloud

---

## ✅ What I Just Set Up

### 1. **Created Serverless Cron Endpoint**
`app/api/cron/process-demo-orders/route.ts`

**What it does:**
- ✅ Runs every 60 seconds automatically
- ✅ Finds pending demo orders
- ✅ Assigns PSP (processing status)
- ✅ Waits 30+ seconds
- ✅ Completes order (completed status)
- ✅ Updates revenue for bank & PSP

### 2. **Configured Vercel Cron**
`vercel.json`

```json
{
  "crons": [{
    "path": "/api/cron/process-demo-orders",
    "schedule": "* * * * *"  // Every minute
  }]
}
```

---

## 🚀 How to Deploy

### Step 1: Add Environment Variable (Optional)
For security, add to Vercel dashboard:
```
CRON_SECRET=your_random_secret_here
```

Or skip this - it works without it in production.

### Step 2: Deploy to Vercel
```bash
# Make sure you're logged in
vercel login

# Deploy
vercel --prod
```

### Step 3: Verify Cron is Active
After deployment, Vercel automatically:
- ✅ Detects the cron configuration
- ✅ Registers the schedule
- ✅ Starts running every minute

Check in Vercel dashboard:
- Go to your project
- Click "Cron Jobs" tab
- You'll see: `/api/cron/process-demo-orders` running every minute

---

## 🎬 Demo Flow (After Deployment)

### **Client Experience:**
1. Clicks "Run Demo" button
2. Order created: Status = `pending`
3. **Within 60 seconds:** Cron runs → Status = `processing`
4. **30-60 seconds later:** Cron runs again → Status = `completed`
5. ✨ Total time: 60-120 seconds

**No local bot needed!** Works 24/7 from the cloud.

---

## 🔍 How It Works

### **Cron Schedule:**
```
* * * * *  = Every minute
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

### **Processing Logic:**
```
Minute 1: 
  - Find pending orders
  - Assign PSP
  - Status: pending → processing

Minute 2-3:
  - Check if 30+ seconds elapsed
  - Complete orders
  - Status: processing → completed
```

---

## 🛡️ Safety (Same as Local Bot)

The cron job has the **exact same safety filter**:

```typescript
where: {
  is_test_mode: true,  // ⚠️ DEMO ONLY
}
```

**It will NEVER:**
- ❌ Touch live orders (`is_test_mode: false`)
- ❌ Process real customer transactions
- ❌ Interfere with production PSP fulfillment

---

## 📊 Monitoring

### **View Cron Logs in Vercel:**
1. Go to your project dashboard
2. Click "Logs" tab
3. Filter by `/api/cron/process-demo-orders`

**You'll see:**
```
🤖 Vercel Cron: Processing demo orders...
📊 Found 2 pending demo orders
🔄 Assigned order abc-123 to Thunes Test
✅ Completed order xyz-789
   Bank Markup: $4.90
   PSP Commission: $7.35
```

### **Manual Test:**
You can manually trigger the cron:
```bash
curl -X POST https://your-domain.vercel.app/api/cron/process-demo-orders
```

---

## 🎯 Benefits

### **For You:**
- ✅ No need to keep computer on
- ✅ No manual bot management
- ✅ Works 24/7 automatically
- ✅ Scales infinitely (Vercel handles it)

### **For Your Clients:**
- ✅ Demo always works
- ✅ Fast completion (60-120s)
- ✅ Professional experience
- ✅ Can test anytime, anywhere

### **For Sales:**
- ✅ Share demo URL confidently
- ✅ No "please wait for me to start bot"
- ✅ Works in different timezones
- ✅ Never misses a prospect demo

---

## 🔧 Alternative Schedules

If you want faster or slower demos, edit `vercel.json`:

### **Every 30 seconds** (faster demos):
```json
"schedule": "*/30 * * * * *"
```
Result: Orders complete in 30-60 seconds

### **Every 5 minutes** (slower, less resource usage):
```json
"schedule": "*/5 * * * *"
```
Result: Orders complete in 5-10 minutes

### **Business hours only** (9 AM - 5 PM):
```json
"schedule": "* 9-17 * * *"
```
Result: Only processes during work hours

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Verify `.env` has all required variables
- [ ] Test cron endpoint locally: `curl http://localhost:3000/api/cron/process-demo-orders`
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Verify cron appears in Vercel dashboard
- [ ] Test demo order creation
- [ ] Confirm order completes within 2 minutes
- [ ] Check Vercel logs for errors

---

## 🆚 Local Bot vs Vercel Cron

| Feature | Local Bot | Vercel Cron |
|---------|-----------|-------------|
| **Availability** | Only when computer on | 24/7 |
| **Setup** | `npm run demo:bot` | One-time deploy |
| **Maintenance** | Manual restart | Automatic |
| **Speed** | 30-90 seconds | 60-120 seconds |
| **Cost** | Free (uses your CPU) | Free (Vercel hobby tier) |
| **Best For** | Local development | Production demos |

---

## 🚀 Quick Deploy Commands

```bash
# 1. Commit changes
git add vercel.json app/api/cron/
git commit -m "Add Vercel cron for 24/7 demo bot"

# 2. Deploy to Vercel
vercel --prod

# 3. Verify deployment
vercel logs --follow
```

---

## ✅ You're Ready!

Once deployed:
- ✅ Demo works 24/7
- ✅ Client can test anytime
- ✅ No computer needs to be on
- ✅ Professional, scalable setup

**Send demo credentials to your client with confidence!** 🎉

---

## 📞 Support

**Test the cron:**
```bash
curl https://your-app.vercel.app/api/cron/process-demo-orders
```

**Check if cron is running:**
- Visit Vercel dashboard → Your project → Cron Jobs

**Common issues:**
- Cron not appearing? Redeploy: `vercel --prod`
- Orders not completing? Check logs in Vercel dashboard
- Slow processing? Adjust schedule in `vercel.json`

---

**Built with ❤️ for always-on demos**  
**Updated:** November 18, 2025
