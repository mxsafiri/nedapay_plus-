# Getting Your Paycrest API Key

## Current Situation

You have OAuth credentials in your `.env`:
```bash
PAYCREST_CLIENT_ID="82ce29cf-6bce-4f42-be1f-6acfa8932691"
PAYCREST_CLIENT_SECRET="l1giYebQv-nQ8h8s1ut-rSkvYMls03S9ecLon8FvHoA="
```

But Paycrest's sender API uses **simple API-Key authentication**, not OAuth.

## How to Get Your API Key

### Option 1: Dashboard (Recommended)
1. Go to: https://app.paycrest.io
2. Log in with your credentials
3. Navigate to: **Settings** → **API Keys** (or **Developer** section)
4. Look for a field like:
   - "API Key"
   - "Sender API Key"
   - "Your API Key"
5. Copy the key (it might look like: `pk_live_...` or a UUID format)

### Option 2: Check Your Account Email
- Check your email for Paycrest registration/welcome email
- They might have sent you an API key when you registered

### Option 3: Contact Paycrest Support
If you can't find the API key:
- Email: support@paycrest.io
- Telegram: https://t.me/+Stx-wLOdj49iNDM0
- Say: "I have CLIENT_ID and CLIENT_SECRET but need the API-Key for sender API calls"

## What to Add to .env

Once you have the API key, add this line to your `.env` file:

```bash
# Paycrest Sender API Key
PAYCREST_API_KEY="your_api_key_here"
```

**Note**: Keep your CLIENT_ID and CLIENT_SECRET - they might be used for provider/webhook features. Just add the API_KEY as well.

## Test After Adding

```bash
node test-paycrest-final.js
```

This will verify your API key works by testing:
- Getting Nigerian banks
- Getting exchange rates
- Getting supported tokens

## Common Locations for API Keys in Dashboards

Look for sections named:
- API Keys
- Developer Settings
- Integration
- API Credentials
- Security
- Account Settings

The API key is usually visible or has a "Show" or "Copy" button.
