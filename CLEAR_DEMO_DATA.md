# Clear Demo Data Guide

## 🐛 The Problem

Your dashboard is showing inflated numbers because there's demo/seed data in the database:
- **$33,680,746.97** Total Volume (!!!)
- **190 Payment Orders**
- **81.1% Success Rate**

This is from running `npm run demo:seed` which creates 500+ fake transactions for demos.

---

## ✅ The Solution

Run the cleanup script to remove all demo data and show only **real production numbers**:

```bash
npm run demo:clear
```

---

## 📋 What The Script Does

### 1. **Identifies Demo Users**
Finds all users with emails like:
- `demo@crdbbank.co.tz`
- `demo@nmbbank.co.tz`
- `demo@mufindibank.co.tz`
- `demo@thunes.com`
- `demo@mpesa.co.tz`
- `demo@tigopesamobility.com`
- Any email matching `demo@*` pattern

### 2. **Shows Current State**
```
📊 Current database state:
  Users: 8
  Payment Orders: 532
  Transaction Logs: 1,064
  API Keys: 6
  Sender Profiles: 3
  Provider Profiles: 3
```

### 3. **Deletes Demo Data** (in correct order)
```
🗑️  Deleting demo data...
  ✓ Deleted 532 payment orders (and related transaction logs)
  ✓ Deleted 6 API keys
  ✓ Deleted 6 KYB profiles
  ✓ Deleted 3 sender profiles
  ✓ Deleted 3 provider profiles
  ✓ Deleted 6 demo users
```

### 4. **Shows Clean State**
```
📊 Updated database state:
  Users: 2 (was 8)
  Payment Orders: 0 (was 532)
  Transaction Logs: 0 (was 1,064)
  API Keys: 1 (was 6)
  Sender Profiles: 0 (was 3)
  Provider Profiles: 0 (was 3)
```

### 5. **Summary of Real Data**
```
💡 No production orders yet. All demo data removed.
```

Or if you have real orders:
```
💰 Real production data:
  Payment Orders: 5
  Total Volume: $1,250.00
```

---

## 🚀 How To Run

### Step 1: Clear Demo Data
```bash
npm run demo:clear
```

### Step 2: Refresh Dashboard
Go to your dashboard and see the real numbers!

---

## 📊 Before & After

### Before (Demo Data):
```
Total Volume:    $33,680,746.97
Payment Orders:  190
Success Rate:    81.1%
Active Routes:   9+ networks
```

### After (Real Data):
```
Total Volume:    $0.00  (or real amount)
Payment Orders:  0      (or real count)
Success Rate:    0%     (or real rate)
Active Routes:   0      (or real networks)
```

---

## ⚠️ Important Notes

### **What Gets Deleted:**
- ✅ All demo users (email contains "demo@")
- ✅ All payment orders from demo users
- ✅ All transaction logs from demo orders
- ✅ All API keys from demo users
- ✅ All KYB profiles from demo users
- ✅ All sender/provider profiles from demo users

### **What Gets Preserved:**
- ✅ Real production users
- ✅ Real payment orders
- ✅ Real transaction logs
- ✅ Real API keys
- ✅ Real KYB profiles
- ✅ Real sender/provider profiles

### **Safe To Run:**
- ✅ Only removes demo data
- ✅ Production data is untouched
- ✅ Can re-seed if needed (`npm run demo:seed`)
- ✅ Shows detailed logs of what's being deleted

---

## 🔄 Re-Seeding Demo Data

If you need demo data again for testing:

```bash
npm run demo:seed
```

This creates:
- 3 Demo Banks
- 3 Demo PSPs  
- 500+ Historical Transactions
- Revenue Analytics Data

---

## 🧪 Testing

After clearing demo data, your dashboard should show:

### **Empty State** (if no production orders):
```
Total Volume:    $0.00
Payment Orders:  0
Success Rate:    N/A
```

### **Real Data** (if you have production orders):
```
Total Volume:    [Real amount from actual orders]
Payment Orders:  [Real count from actual orders]
Success Rate:    [Real rate from actual completed orders]
```

---

## 💡 FAQ

### Q: Will this delete real users?
**A:** No! Only users with `demo@` in their email are deleted.

### Q: Can I undo this?
**A:** No direct undo, but you can re-seed demo data with `npm run demo:seed`

### Q: What if I have production orders?
**A:** They're preserved! The script only removes demo user data.

### Q: How often should I run this?
**A:** Once when moving to production, or anytime you want to clear test data.

### Q: Does this affect API functionality?
**A:** No, it only cleans the database. APIs continue working normally.

---

## 📞 Need Help?

If the script fails or you see errors:

1. Check the console output for error messages
2. Verify database connection (`npm run db:status`)
3. Check if demo users exist (query users table)
4. Review logs for specific failure point

---

## 🎯 Command Reference

```bash
# Clear all demo data
npm run demo:clear

# Re-seed demo data
npm run demo:seed

# Check database status
npm run db:status

# Verify multichain setup
npm run db:verify
```

---

**Ready to clean up your production database?** 🧹

Run: `npm run demo:clear`
