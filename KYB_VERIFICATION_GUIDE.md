# KYB Verification Guide

## Problem Fixed
Users who were verified by admin still saw "KYB verification required" banner in API Keys page.

## Root Causes Fixed
1. ✅ **Wrong API endpoint** - Page was calling `/api/kyb/status` (doesn't exist)
2. ✅ **No auto-refresh** - Status didn't update when user returned to page
3. ✅ **Stale state** - Page used cached status even after admin verified

## Solution Deployed
1. **Correct endpoint**: Now calls `/api/kyb/upload` (GET method)
2. **Auto-refresh**: Status refreshes when user switches back to tab
3. **Better logging**: Console logs for debugging

## How To Verify User (Admin Panel)

### Option 1: Using Admin UI (Recommended)
1. Go to Admin Panel → User Management
2. Find the user (e.g., "peepstudio2")
3. Click on user to view details
4. Scroll to KYB Compliance section
5. Click "Approve KYB" button
6. User's status changes to `verified`

### Option 2: Using API (Direct)
```bash
curl -X POST https://your-domain.com/api/admin/users/verify-kyb \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "status": "verified",
    "reason": "All documents verified"
  }'
```

### Option 3: Direct Database (Emergency Only)
```sql
-- Check current status
SELECT id, email, kyb_verification_status 
FROM users 
WHERE email = 'user@example.com';

-- Update to verified
UPDATE users 
SET kyb_verification_status = 'verified',
    updated_at = NOW()
WHERE email = 'user@example.com';
```

## Verification Statuses
- `not_started` - User hasn't submitted KYB documents
- `pending` - Documents submitted, awaiting admin review
- `verified` - Admin approved, user can create API keys ✅
- `rejected` - Admin rejected, user must resubmit

## Testing The Fix

### For User "peepstudio2"
1. Admin verifies user in admin panel
2. User goes to Settings → API Keys
3. Page loads → Status fetched from `/api/kyb/upload`
4. If status is `verified`:
   - ✅ Green banner: "KYB Verified"
   - ✅ "Create API Key" button enabled
   - ✅ No blocking message

### Auto-Refresh Test
1. User opens Settings page
2. Keep page open
3. Admin verifies in another tab
4. User switches back to Settings tab
5. Status auto-refreshes (visibility change event)
6. Banner updates automatically

## Debugging

### Check Console Logs
Open browser console in Settings page:
```
KYB Status Response: { status: "verified", profile: {...}, hasDocuments: true }
```

### If Status Still Shows Wrong
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Browser settings → Clear cache
3. **Check database**: Run SQL query to verify status
4. **Check API response**: Network tab → `/api/kyb/upload` → Preview

### Common Issues
| Issue | Cause | Fix |
|-------|-------|-----|
| Status stuck on "pending" | Database not updated | Run admin verify endpoint |
| Banner still shows red | Cache issue | Hard refresh page |
| "Create API Key" disabled | kybStatus prop not passed | Check component props |
| No status update on tab switch | Listener not working | Check console for errors |

## How It Works Now

### Flow Diagram
```
User Opens Settings
        ↓
Fetch KYB Status (/api/kyb/upload GET)
        ↓
    Database Query
        ↓
Return { status: "verified" }
        ↓
    Update UI State
        ↓
✅ Green Banner + Enabled Button

[User switches tabs]
        ↓
Admin Verifies User
        ↓
[User returns to Settings]
        ↓
Visibility Change Event Fires
        ↓
Auto-Refresh KYB Status
        ↓
✅ Updated Status Displayed
```

## Production URL
https://nedapay-plus-5dqxhxr0i-vmuhagachi-gmailcoms-projects.vercel.app

## Next Steps
1. ✅ User should refresh their Settings page
2. ✅ Status will auto-update from database
3. ✅ If verified, they can create API keys
4. ✅ If still pending, admin needs to verify in admin panel

## Notes
- Status is stored in `users.kyb_verification_status` column
- API endpoint: `/api/kyb/upload` (GET method returns status)
- Admin endpoint: `/api/admin/users/verify-kyb` (POST method updates status)
- Auto-refresh happens on tab focus (visibilitychange event)
