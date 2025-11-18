# 🌐 24/7 Demo Setup - Quick Guide

## 🎯 Goal
Make your demo work **even when your computer is off** so clients can test anytime.

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Deploy to Vercel
```bash
vercel login
vercel --prod
```

### Step 2: Share Demo URL
Send to clients:
```
🎬 NedaPay Plus Demo

URL: https://your-app.vercel.app
Email: demo@crdbbank.co.tz
Password: Demo2025!

Click "Run Demo" and watch it complete automatically!
```

### Step 3: Done! ✅
The Vercel cron job automatically:
- ✅ Processes demo orders every minute
- ✅ Completes them in 60-120 seconds
- ✅ Works 24/7 without your computer

---

## 🔍 What Happens

### **When Client Clicks "Run Demo":**
```
00:00 - Order created (status: pending)
00:30 - Cron runs → Assigns PSP (status: processing)
01:00 - Cron runs → Completes order (status: completed)
       ✨ Client sees success notification!
```

**Total time:** 60-120 seconds (fully automatic)

---

## 🛡️ Safety

The cron **ONLY** processes demo orders:
```typescript
where: {
  is_test_mode: true  // Your real orders are never touched
}
```

---

## 📊 Two Options

### **Option 1: Vercel Cron (Recommended)**
- ✅ Works 24/7
- ✅ No computer needed
- ✅ Professional setup
- ⏱️ 60-120 second completion

**Setup:** Just deploy to Vercel (already configured!)

### **Option 2: Local Bot**
- ✅ Faster (30-90 seconds)
- ✅ Full control
- ❌ Computer must be on
- ❌ Manual start: `npm run demo:bot`

**Use for:** Local development & testing

---

## 🚀 Deploy Now

```bash
# Commit the new cron configuration
git add vercel.json app/api/cron/
git commit -m "Enable 24/7 demo bot via Vercel cron"
git push

# Deploy to production
vercel --prod
```

---

## ✅ Verify It Works

### 1. Check Vercel Dashboard
- Go to your project
- Click "Cron Jobs" tab
- You should see: `/api/cron/process-demo-orders` running every minute

### 2. Test Demo
- Visit your deployed app
- Login: `demo@crdbbank.co.tz` / `Demo2025!`
- Click "Run Demo"
- Wait 60-120 seconds → Should auto-complete!

---

## 💡 Pro Tips

### For Faster Demos (30 seconds)
Edit `vercel.json`:
```json
"schedule": "*/30 * * * * *"
```

### For Manual Control
Keep local bot for development:
```bash
npm run demo:bot  # Use during local testing
```

### For Monitoring
Check Vercel logs:
```bash
vercel logs --follow
```

---

## 📞 For Your Client

**Email Template:**
```
Hi [Name],

Try our live demo anytime:

🔗 https://nedapay-plus.vercel.app
📧 demo@crdbbank.co.tz
🔐 Demo2025!

Just login and click "Run Demo" - it completes 
automatically in 60-120 seconds!

This shows how real transactions work on our 
platform. Feel free to test multiple times.

Best,
[Your Name]
```

---

## 🎉 That's It!

**You now have:**
- ✅ 24/7 working demo
- ✅ No computer needed
- ✅ Professional setup
- ✅ Safe for production

**Ready to impress clients!** 🚀

---

**See full details:** `VERCEL_CRON_SETUP.md`
