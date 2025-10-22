# 🔌 API Endpoints Summary - Onboarding Flow

**Status**: COMPLETED  
**Date**: October 21, 2025

---

## 📝 Overview

Created 6 API endpoints to support the complete B2B2C onboarding flow for Banks and PSPs.

---

## 🏦 Bank Onboarding Endpoints

### **1. `/api/sender-profile` - Bank Profile Management**

**Methods**: `GET`, `POST`

#### **POST - Create/Update Bank Profile**
**Purpose**: Step 1 of bank onboarding - create sender profile

**Request Body**:
```json
{
  "userId": "uuid",
  "bankName": "CRDB Bank",
  "country": "Tanzania",
  "contactName": "John Doe",
  "contactEmail": "john@crdb.co.tz",
  "contactPhone": "+255..."
}
```

**Response**:
```json
{
  "success": true,
  "senderProfile": { ... },
  "message": "Profile created"
}
```

**Features**:
- Creates new sender profile on first call
- Updates existing profile on subsequent calls
- Validates userId is required
- Returns 400 if validation fails
- Returns 500 on database errors

---

### **2. `/api/white-label/config` - Branding Configuration**

**Methods**: `GET`, `POST`

#### **POST - Save White-Label Config**
**Purpose**: Step 3 of bank onboarding - configure branding

**Request**: `multipart/form-data`
```javascript
{
  logo: File,              // PNG/JPG/SVG
  primaryColor: "#0066FF", // Hex color
  brandName: "CRDB Pay"    // Display name
}
```

**Response**:
```json
{
  "success": true,
  "config": {
    "brandName": "CRDB Pay",
    "primaryColor": "#0066FF",
    "logoUrl": "/uploads/logos/user-id/logo-xxx.png",
    "updatedAt": "2025-10-21T..."
  },
  "message": "White-label configuration saved successfully"
}
```

**Features**:
- Saves logo to `/public/uploads/logos/{userId}/`
- Stores config as JSON in `sender_profiles.white_label_config`
- Returns logo URL for immediate use
- GET endpoint returns current config

---

## 💸 PSP Onboarding Endpoints

### **3. `/api/provider-profile` - PSP Profile Management**

**Methods**: `GET`, `POST`, `PATCH`

#### **POST - Create PSP Profile**
**Purpose**: Step 1 of PSP onboarding

**Request Body**:
```json
{
  "pspName": "Thunes Ltd",
  "tradingName": "Thunes",
  "contactEmail": "contact@thunes.com",
  "contactPhone": "+1..."
}
```

**Response**:
```json
{
  "success": true,
  "providerProfile": {
    "id": "uuid",
    "business_name": "Thunes Ltd",
    "commission_rate": 0.003,  // 0.3% default
    "is_active": true
  },
  "message": "Profile created"
}
```

#### **PATCH - Update Specific Fields**
**Purpose**: Step 2 & 3 - update countries and treasury

**Request Body**:
```json
{
  "supportedCountries": ["CN", "IN", "KE"],
  "commissionRate": 0.003,
  "treasuryAccounts": {
    "CNY": {"bank": "ICBC", "account": "123456"},
    "KES": {"bank": "Equity", "account": "789012"}
  }
}
```

**Features**:
- Creates with defaults: `commission_rate: 0.003`, `is_active: true`
- PATCH allows partial updates (only changed fields)
- Validates commission rate (0-1 range)
- Authenticated via Supabase session

---

### **4. `/api/psp/configure-treasury` - Treasury Configuration**

**Methods**: `GET`, `POST`

#### **POST - Configure Treasury & Rates**
**Purpose**: Step 3 of PSP onboarding

**Request Body**:
```json
{
  "commissionRate": 0.003,  // 0.3%
  "treasuryConfig": {
    "CNY": {
      "bank": "Industrial and Commercial Bank of China",
      "account": "123456789",
      "swiftCode": "ICBKCNBJ",
      "currency": "CNY"
    },
    "KES": {
      "bank": "Equity Bank",
      "account": "987654321",
      "swiftCode": "EQBLKENA",
      "currency": "KES"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "providerProfile": {
    "commission_rate": 0.003,
    "treasury_accounts": { ... }
  },
  "message": "Treasury configuration saved successfully"
}
```

**Validation**:
- Commission rate: 0-1 (0% to 100%)
- Treasury config: must be valid JSON object
- Returns 404 if provider profile doesn't exist
- Returns 400 for validation errors

---

## 🔒 Shared Endpoints

### **5. `/api/kyb/upload` - KYB Document Upload**

**Methods**: `GET`, `POST`

#### **POST - Upload KYB Documents**
**Purpose**: Step 2 for both banks and PSPs

**Request**: `multipart/form-data`
```javascript
{
  incorporation: File,         // Certificate of incorporation
  license: File,              // Business license
  supportedCountries: string  // JSON array (PSPs only)
}
```

**Response**:
```json
{
  "success": true,
  "kybProfile": {
    "id": "uuid",
    "certificate_of_incorporation_url": "/uploads/kyb/user-id/incorporation-xxx.pdf",
    "business_license_url": "/uploads/kyb/user-id/license-xxx.pdf"
  },
  "documents": {
    "incorporation": true,
    "license": true
  },
  "message": "Documents uploaded successfully. KYB verification pending."
}
```

**Features**:
- Saves files to `/uploads/kyb/{userId}/`
- Creates or updates `kyb_profiles` record
- Updates `users.kyb_verification_status` to "pending"
- For PSPs: also saves `supported_countries` to `provider_profiles`
- Accepts PDF, JPG, JPEG, PNG files
- Creates KYB profile if doesn't exist
- Updates existing profile if already exists

#### **GET - Get KYB Status**
**Response**:
```json
{
  "status": "pending",  // "not_started", "pending", "approved", "rejected"
  "profile": { ... },
  "hasDocuments": true
}
```

---

### **6. `/api/generate-api-key` - API Key Generation**

**Methods**: `GET`, `POST`, `DELETE`

#### **POST - Generate API Key**
**Purpose**: Final step for both banks and PSPs

**Request Body** (optional):
```json
{
  "isTest": false,      // false = live key, true = test key
  "regenerate": false   // true = regenerate if exists
}
```

**Response**:
```json
{
  "success": true,
  "apiKey": "np_live_a1b2c3d4e5f6...",  // Only shown once!
  "keyId": "uuid",
  "type": "live",
  "message": "API key generated successfully...",
  "warning": "Store this key securely. It grants access to your account."
}
```

**Key Format**:
- Live: `np_live_xxxxxxxxxxxxxxxxxxxxxxxx` (48 chars)
- Test: `np_test_xxxxxxxxxxxxxxxxxxxxxxxx` (48 chars)
- Stored as SHA-256 hash in database

**Features**:
- Checks if user has profile (bank or PSP)
- Returns 409 if key exists and `regenerate` not set
- Deletes old key if `regenerate: true`
- Creates new key with secure random generation
- Returns plain key only once (never retrievable again)
- Hashes key with SHA-256 before storage

#### **GET - Check API Key Status**
**Response**:
```json
{
  "hasApiKey": true,
  "keyInfo": {
    "id": "uuid",
    "secret": "***"  // Never returns actual key
  }
}
```

#### **DELETE - Revoke API Key**
**Response**:
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## 🔐 Authentication

**All endpoints use Supabase authentication:**
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Authentication Flow**:
1. Client makes request with session cookie
2. Supabase validates session
3. Returns user object if valid
4. API uses `user.id` to fetch/update data

---

## 📊 Database Operations

### **Tables Modified**:
- `sender_profiles` - Bank data
- `provider_profiles` - PSP data
- `kyb_profiles` - KYB documents
- `api_keys` - API keys
- `users` - KYB status

### **File Storage**:
```
/uploads/
  ├── kyb/{userId}/
  │   ├── incorporation-{uuid}.pdf
  │   └── license-{uuid}.pdf
  └── logos/{userId}/
      └── logo-{uuid}.png
```

---

## 🧪 Testing Guide

### **Test Bank Onboarding**:
```bash
# Step 1: Create profile
curl -X POST http://localhost:3000/api/sender-profile \
  -H "Content-Type: application/json" \
  -d '{"userId": "...", "bankName": "Test Bank"}'

# Step 2: Upload KYB
curl -X POST http://localhost:3000/api/kyb/upload \
  -F "incorporation=@cert.pdf" \
  -F "license=@license.pdf"

# Step 3: Configure white-label
curl -X POST http://localhost:3000/api/white-label/config \
  -F "logo=@logo.png" \
  -F "brandName=TestBank" \
  -F "primaryColor=#0066FF"

# Step 4: Generate API key
curl -X POST http://localhost:3000/api/generate-api-key
```

### **Test PSP Onboarding**:
```bash
# Step 1: Create profile
curl -X POST http://localhost:3000/api/provider-profile \
  -H "Content-Type: application/json" \
  -d '{"pspName": "Test PSP"}'

# Step 2: Upload KYB + Countries
curl -X POST http://localhost:3000/api/kyb/upload \
  -F "incorporation=@cert.pdf" \
  -F "license=@license.pdf" \
  -F 'supportedCountries=["CN","KE"]'

# Step 3: Configure treasury
curl -X POST http://localhost:3000/api/psp/configure-treasury \
  -H "Content-Type: application/json" \
  -d '{"commissionRate": 0.003, "treasuryConfig": {...}}'

# Step 4: Generate API key
curl -X POST http://localhost:3000/api/generate-api-key
```

---

## ⚠️ Error Handling

### **Common Error Codes**:
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### **Error Response Format**:
```json
{
  "error": "Human-readable error message",
  "details": "Technical details (dev mode only)"
}
```

---

## ✅ Success Checklist

- ✅ All 6 endpoints created
- ✅ Authentication via Supabase
- ✅ File upload support (multipart/form-data)
- ✅ Database schema validated
- ✅ Error handling implemented
- ✅ Security: API keys hashed
- ✅ Security: Files saved outside public (except logos)
- ✅ Validation on all inputs
- ✅ GET/POST/PATCH/DELETE methods
- ✅ JSON responses standardized

---

## 🚀 Next Steps

1. **Test endpoints manually** with Postman/curl
2. **Test complete onboarding flow** in UI
3. **Add rate limiting** to prevent abuse
4. **Add file size limits** for uploads
5. **Add virus scanning** for uploaded files
6. **Add webhook support** for KYB approval
7. **Add API key usage tracking**

---

**All endpoints ready for testing!** 🎉
