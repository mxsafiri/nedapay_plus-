# 🔒 Virtual PSP Bot - Safety & Isolation

## ✅ SAFE FOR PRODUCTION

The Virtual PSP Bot is **completely isolated** from live transactions and will **NEVER touch real orders**.

---

## 🛡️ Safety Mechanisms

### 1. **Test Mode Filter** 
```typescript
where: {
  is_test_mode: true,  // ⚠️ ONLY processes demo/test orders
}
```

**How it works:**
- Bot ONLY processes orders where `is_test_mode: true`
- Live orders have `is_test_mode: false` (default)
- Impossible for bot to touch production orders

### 2. **Demo Order Creation**
All demo orders are automatically marked:
```typescript
is_test_mode: true,  // Set by /api/demo/trigger
```

### 3. **Database Isolation**
```
Demo Orders (is_test_mode: true)
  ✅ Processed by Virtual PSP Bot
  ✅ Auto-completed in 30-90 seconds
  ✅ Safe for presentations

Live Orders (is_test_mode: false)
  ⛔ NEVER touched by bot
  ✅ Requires manual PSP fulfillment
  ✅ Production-grade processing
```

---

## 📊 What Gets Processed

### ✅ **Processed by Bot:**
- Orders from "Run Demo" button
- Orders created via `POST /api/demo/trigger`
- Orders from demo accounts (`demo@*.com`)
- All orders with `is_test_mode: true`

### ⛔ **NEVER Processed by Bot:**
- Real bank API orders
- Production PSP fulfillments
- Any order with `is_test_mode: false`
- Orders from non-demo accounts

---

## 🎯 Production Usage

### **Safe to Run 24/7**
The bot can run continuously in production:
```bash
npm run demo:bot  # Safe to run alongside live platform
```

**It will:**
- ✅ Only auto-complete demo orders
- ✅ Allow prospects to test instantly
- ✅ Provide impressive sales demos
- ✅ Never interfere with real transactions

**It will NOT:**
- ❌ Touch live customer orders
- ❌ Process real bank transactions
- ❌ Interfere with PSP fulfillment
- ❌ Affect production revenue

---

## 🔍 How to Verify

### Check Order Status:
```sql
-- Demo orders (bot will process)
SELECT * FROM payment_orders WHERE is_test_mode = true;

-- Live orders (bot ignores)
SELECT * FROM payment_orders WHERE is_test_mode = false;
```

### Check Bot Logs:
```
🔄 [Processing] Order: abc-123...
   PSP: Thunes Test
   is_test_mode: true  ← Confirms demo-only
```

---

## 🚀 Deployment Options

### **Option 1: Always-On Bot (Recommended)**
Deploy bot as background service:
- Vercel Cron Job (runs every minute)
- Railway/Render background worker
- Docker container on your server

**Benefits:**
- ✅ Client demos work 24/7
- ✅ No manual intervention needed
- ✅ Impressive "instant" demos

### **Option 2: On-Demand Bot**
Start bot only during demos:
```bash
npm run demo:bot  # Start before demo
Ctrl+C            # Stop after demo
```

**Benefits:**
- ✅ Complete control
- ✅ Lower resource usage
- ✅ Manual verification

### **Option 3: Manual Fulfillment**
Don't run bot at all:
- Demo orders stay pending
- Manually complete via admin panel
- Good for controlled environments

---

## 📝 For Your Client

### Email Template:
```
The demo uses a Virtual PSP Bot that automatically completes 
test orders in 30-90 seconds.

IMPORTANT SAFETY NOTE:
- Bot ONLY processes demo/test transactions
- Your real customer orders are NEVER touched
- Production transactions require manual PSP approval
- Complete isolation via database flags

This gives you impressive demos while maintaining 
production-grade security for real transactions.
```

---

## 🎉 Summary

### **You Can Safely:**
- ✅ Run bot in production alongside live orders
- ✅ Leave bot running 24/7 for client demos
- ✅ Share demo credentials with prospects
- ✅ Process unlimited demo orders

### **Bot Will NEVER:**
- ❌ Touch real customer transactions
- ❌ Auto-complete live orders
- ❌ Interfere with PSP fulfillment
- ❌ Affect production revenue

---

## 🔧 Code Reference

**Bot Filter:** `scripts/virtual-psp-bot.ts:246`
```typescript
is_test_mode: true, // ⚠️ DEMO ONLY - Never touches live orders
```

**Demo Creation:** `app/api/demo/trigger/route.ts:111`
```typescript
is_test_mode: true,  // All demo orders marked
```

**Database Schema:** `prisma/schema.prisma:300`
```typescript
is_test_mode: Boolean @default(false)  // Isolate test transactions
```

---

**Built with ❤️ for safe, impressive demos**  
**Updated:** November 18, 2025
