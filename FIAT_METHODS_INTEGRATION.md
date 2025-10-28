# Fiat Fulfillment Methods - Integration Guide

## ✅ What We Built

### Components:
- ✅ `components/onboarding/fiat-fulfillment-methods.tsx` - Full UI component
- ✅ `app/api/provider-profile/fiat-methods/route.ts` - Save/load endpoint
- ✅ `app/api/fiat/thunes/test-connection/route.ts` - Test Thunes API

---

## 🔧 How to Integrate into PSP Onboarding

### Step 1: Import the Component

In `/app/(auth-pages)/onboarding/psp/page.tsx`, add the import:

```typescript
import { FiatFulfillmentMethods } from '@/components/onboarding/fiat-fulfillment-methods';
```

### Step 2: Add State for Fiat Methods

Add after the existing state declarations (around line 44):

```typescript
// Step 3: Fiat Fulfillment Methods (NEW!)
const [fiatMethods, setFiatMethods] = useState({
  mpesa: { enabled: false, provider: '', businessNumber: '', businessName: '', dailyLimit: '50000' },
  thunes: { enabled: false, accountId: '', apiKey: '', environment: 'sandbox' as const, connectionStatus: 'not_tested' as const },
  bank: { enabled: false, bankName: '', accountNumber: '', accountName: '', swiftCode: '' },
  other: { enabled: false, methodName: '', description: '' }
});
```

### Step 3: Update Total Steps

Change line 45 from:

```typescript
const totalSteps = 4;
```

To:

```typescript
const totalSteps = 5; // Added fiat methods step
```

### Step 4: Add Handler for Step 3

Add this new handler after `handleStep2Submit`:

```typescript
const handleStep3Submit = async (methods: any) => {
  setLoading(true);

  try {
    const response = await fetch('/api/provider-profile/fiat-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fiatMethods: methods }),
    });

    if (!response.ok) throw new Error('Failed to save fiat methods');

    setFiatMethods(methods);
    setCurrentStep(4); // Move to treasury setup
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to save fiat methods. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Step 5: Rename Existing Handlers

Rename the existing handlers:
- `handleStep3Submit` → `handleStep4Submit` (Treasury)
- `handleStep4Submit` → `handleStep5Submit` (Final/API Key)

And update their `setCurrentStep` calls accordingly.

### Step 6: Add Step 3 Rendering

In the render section, after Step 2 (around line 300+), add:

```typescript
{currentStep === 3 && (
  <FiatFulfillmentMethods
    onSubmit={handleStep3Submit}
    onBack={() => setCurrentStep(2)}
    loading={loading}
  />
)}
```

### Step 7: Update Subsequent Steps

Update the existing step renderings:
- Current Step 3 → becomes Step 4
- Current Step 4 → becomes Step 5

---

## 📊 Features Included

### M-Pesa Configuration:
- ✅ Provider selection (Vodacom/Airtel/Tigo)
- ✅ Business number
- ✅ Business name
- ✅ Daily limit

### Thunes API:
- ✅ Account ID
- ✅ API Key (password field)
- ✅ Environment (Sandbox/Production)
- ✅ Test connection button
- ✅ Connection status indicator

### Bank Transfer:
- ✅ Bank name
- ✅ Account number & name
- ✅ SWIFT code (optional)

### Validation:
- ✅ At least one method required
- ✅ Required fields per method
- ✅ Enable/disable switches

---

## 🎨 UI Elements

The component uses:
- Shadcn UI components (Card, Switch, Input, Select, Badge)
- Lucide icons (Smartphone, CreditCard, Building2, etc.)
- Proper form validation
- Loading states
- Connection testing for Thunes

---

## 💾 Data Storage

Fiat methods are saved to `provider_profiles.fiat_infrastructure` as JSON:

```json
{
  "mpesa": {
    "enabled": true,
    "provider": "vodacom",
    "businessNumber": "+255754123456",
    "businessName": "My Business Ltd",
    "dailyLimit": 50000
  },
  "thunes": {
    "enabled": true,
    "accountId": "thunes-12345",
    "apiKey": "encrypted_key_here",
    "environment": "sandbox",
    "verified": true
  },
  "bank": {
    "enabled": false
  }
}
```

---

## 🔒 Security Notes

### TODO for Production:
1. **Encrypt API Keys** - Thunes API keys should be encrypted before storing
2. **Validate Credentials** - Actually test Thunes connection against their API
3. **Rate Limiting** - Add rate limits to test-connection endpoint
4. **Audit Logging** - Log when fiat methods are changed

### Current Implementation:
- ⚠️ API keys stored in plain text (encryption needed)
- ✅ Password field for API key input
- ✅ Separate endpoint for testing connections
- ✅ Clean data structure

---

## 🧪 Testing the Component

### Manual Test:
1. Start dev server: `npm run dev`
2. Go to PSP onboarding
3. Complete Steps 1 & 2
4. On Step 3 (Fiat Methods):
   - Enable M-Pesa → Fill in details
   - Enable Thunes → Test connection
   - Enable Bank → Fill in details
5. Click "Continue to Treasury Setup"
6. Check database - `fiat_infrastructure` should be populated

### Database Check:
```sql
SELECT trading_name, fiat_infrastructure 
FROM provider_profiles 
WHERE fiat_infrastructure IS NOT NULL;
```

---

## 🎯 Next Steps

After integration:

1. **Test the full onboarding flow**
   - Complete all 5 steps
   - Verify data saves correctly
   - Check provider can see their methods

2. **Build Fulfillment UI**
   - Show configured methods in provider dashboard
   - Let provider select method when fulfilling orders
   - Track which method was used per order

3. **Add Method Management**
   - Edit existing methods
   - Add/remove methods after onboarding
   - Update API keys

4. **Implement Real Thunes Client**
   - Replace simulated test with real API call
   - Add proper error handling
   - Handle Thunes webhooks

---

## 📞 API Endpoints

### Save Fiat Methods:
```
POST /api/provider-profile/fiat-methods
Body: { fiatMethods: { mpesa: {...}, thunes: {...}, bank: {...} } }
```

### Load Fiat Methods:
```
GET /api/provider-profile/fiat-methods
Returns: { success: true, data: {...} }
```

### Test Thunes Connection:
```
POST /api/fiat/thunes/test-connection
Body: { accountId: "...", apiKey: "...", environment: "sandbox" }
```

---

## 🎉 Status

The Fiat Fulfillment Methods component is **COMPLETE** and ready to integrate!

**Files Created:**
- ✅ Component with full UI
- ✅ API endpoints for save/load
- ✅ Test connection endpoint
- ✅ Integration guide (this file)

**Ready to:**
- Integrate into onboarding
- Test with real providers
- Connect to real Thunes API

---

**Need help with integration? Follow the steps above or let me know!** 🚀
