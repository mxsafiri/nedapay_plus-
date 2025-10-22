# 🎯 One Role Per User - Simplified System

**Date**: October 21, 2025  
**Status**: ✅ IMPLEMENTED

---

## 📝 What Changed

We simplified the platform from **multi-role** to **single-role per user**.

---

## ❌ **Before (Confusing)**

### Signup:
- User could select **both** "Sender" and "Provider"
- Checkboxes allowed multiple selections
- Label said: "select one or both"

### Database:
- `users.role`: Single value (BANK or PSP) ⚠️
- `users.scope`: Could be "sender provider" ⚠️
- **Mismatch!** Role was single but scope was dual

### Settings:
- Had a fake "profile switcher" in localStorage
- Switched between Sender/Provider views
- Didn't actually create both profiles

---

## ✅ **After (Clear)**

### Signup:
- User selects **ONE** business type
- Radio buttons (single selection)
- Label says: "Type of business"
- Clearer UI with radio circles instead of checkboxes

### Database:
```typescript
// Single, consistent mapping
"sender" → BANK role → sender_profiles
"provider" → PSP role → provider_profiles
```

### Settings:
- No profile switcher
- Shows tabs based on your actual role:
  - **Banks** see: Profile, Trading, Server, API Keys
  - **PSPs** see: Profile, Provider, API Keys
- Role determined from `user.role` or `profile.role`

---

## 🔄 **User Flow**

### **Bank (Sender)**:
```
1. Sign up → Select "Sender" (radio button)
2. Get role: BANK
3. Settings shows: Trading, Server tabs
4. Can create sender_profile
```

### **PSP (Provider)**:
```
1. Sign up → Select "Provider" (radio button)
2. Get role: PSP
3. Settings shows: Provider tab
4. Can create provider_profile
```

---

## 📁 **Files Modified**

### **1. `/components/sign-up-form.tsx`**
**Changes:**
- `businessTypes` array → `businessType` single value
- Checkboxes → Radio buttons
- "select one or both" → "Type of business"
- Radio circles (rounded) instead of checkboxes (square)
- Only sends one business type to API

**Before:**
```typescript
const [businessTypes, setBusinessTypes] = useState<("sender" | "provider")[]>([]);
```

**After:**
```typescript
const [businessType, setBusinessType] = useState<"sender" | "provider" | null>(null);
```

---

### **2. `/app/api/auth/signup/route.ts`**
**Changes:**
- Simplified role mapping logic
- No more "if both selected" logic
- Direct 1:1 mapping

**Before:**
```typescript
let scope = 'sender';
if (businessTypes.includes('sender') && businessTypes.includes('provider')) {
  scope = 'sender provider';
} else if (businessTypes.includes('provider')) {
  scope = 'provider';
}

let role: 'BANK' | 'PSP' = 'BANK';
if (businessTypes.includes('provider')) {
  role = 'PSP';
}
```

**After:**
```typescript
const businessType = businessTypes[0]; // Get first (and only) selection
const scope = businessType; // 'sender' or 'provider'
const role: 'BANK' | 'PSP' = businessType === 'provider' ? 'PSP' : 'BANK';
```

---

### **3. `/components/settings/settings-page.tsx`**
**Changes:**
- Removed `currentProfile` state
- Removed localStorage profile switcher
- Removed dual-mode logic
- Role determined from user metadata

**Before:**
```typescript
const [currentProfile, setCurrentProfile] = useState<"sender" | "provider">("sender");

useEffect(() => {
  const savedProfile = localStorage.getItem("activeProfile");
  if (savedProfile) {
    setCurrentProfile(savedProfile);
  }
}, []);
```

**After:**
```typescript
const userRole = user.user_metadata?.role || profile?.role || 'sender';
const isSender = userRole === 'sender' || userRole === 'BANK';
const isProvider = userRole === 'provider' || userRole === 'PSP';
```

---

## 🎨 **UI Changes**

### **Signup Form:**

**Before:**
```
☑ Sender     (checkbox - can select both)
☑ Provider   (checkbox - can select both)
```

**After:**
```
◉ Sender     (radio - select one)
○ Provider   (radio - select one)
```

### **Settings Sidebar:**

**Bank User Sees:**
- Profile
- Trading ⭐
- Server ⭐
- API Keys
- Notifications
- Security

**PSP User Sees:**
- Profile
- Provider ⭐
- API Keys
- Notifications
- Security

---

## 💡 **Benefits**

### **1. Clarity**
- ✅ No confusion about "which profile am I using?"
- ✅ One role = one set of features
- ✅ Clear separation: Banks ≠ PSPs

### **2. Simplicity**
- ✅ Less code to maintain
- ✅ No localStorage syncing
- ✅ No dual-mode logic

### **3. Data Integrity**
- ✅ `users.role` matches `users.scope`
- ✅ One profile type per user
- ✅ Consistent database state

### **4. Real-World Alignment**
- ✅ Banks (CRDB, NMB) are not PSPs
- ✅ PSPs (Thunes, M-Pesa) are not banks
- ✅ Platform matches reality

---

## 🧪 **Testing**

### **Test as Bank:**
```bash
1. Sign up → Select "Sender" (radio)
2. Verify email
3. Login → Go to Settings
4. Should see: Trading, Server tabs
5. Should NOT see: Provider tab
```

### **Test as PSP:**
```bash
1. Sign up → Select "Provider" (radio)
2. Verify email
3. Login → Go to Settings
4. Should see: Provider tab
5. Should NOT see: Trading, Server tabs
```

---

## 🔒 **Database Consistency**

### **Old System (Broken)**:
```
User selects: Both
  ↓
users.scope: "sender provider" ✅
users.role: BANK ⚠️  (only one!)
  ↓
Mismatch! Which one are they really?
```

### **New System (Fixed)**:
```
User selects: Sender
  ↓
users.scope: "sender" ✅
users.role: BANK ✅
sender_profiles: created ✅
  ↓
Consistent!
```

---

## ✅ **Summary**

**Removed:**
- ❌ Multi-select checkboxes
- ❌ Dual-mode support
- ❌ Profile switcher
- ❌ localStorage syncing
- ❌ Confusing "select one or both" label

**Added:**
- ✅ Single-select radio buttons
- ✅ Clear role determination
- ✅ Simpler settings UI
- ✅ Consistent data model

**Result:**
- **Clearer UX**: Users know exactly what they are
- **Simpler code**: No dual-mode complexity
- **Better alignment**: Matches B2B2C reality
- **Data integrity**: Role and scope always match

---

**One role per user = Simple, clear, and maintainable!** 🎉
