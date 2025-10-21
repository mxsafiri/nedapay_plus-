# Admin Panel - Email Verification Management

## Overview

The admin panel now includes comprehensive user management with the ability to view users and resend verification emails to those who haven't verified their email addresses.

## Features

### 1. User List with Email Status

View all users with their:
- ✅ Name and email
- ✅ Scope (sender/provider/both)
- ✅ Email verification status
- ✅ KYB verification status
- ✅ Registration date

### 2. Resend Verification Email

For users who haven't verified their email, admins can:
- Click the **Mail icon** button to resend verification email
- System automatically:
  - Deletes old verification tokens
  - Creates a new token (24-hour expiry)
  - Sends a fresh verification email via Resend
  - Shows success/error toast notification

### 3. Filters

Filter users by:
- **Search**: Name or email
- **Scope**: All / Sender / Provider / Both
- **Email Status**: All / Verified / Not Verified

### 4. User Details

Click the **Eye icon** to view detailed user information:
- Full name and email
- Scope and verification statuses
- Early access status
- Creation and update timestamps
- Quick action to resend verification email

## API Endpoints Created

### GET `/api/admin/users`

Fetch all users with filters.

**Query Parameters:**
- `search` - Search by name or email
- `scope` - Filter by scope (sender/provider/both)
- `is_verified` - Filter by email verification (true/false)

**Response:**
```json
{
  "success": true,
  "users": [...],
  "count": 10
}
```

### POST `/api/admin/users/resend-verification`

Resend verification email to a user.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "verificationLink": "..." // Only in development
}
```

## How It Works

### When Admin Clicks "Resend Email":

1. **Validate User**
   - Check if user exists
   - Check if email is already verified
   - Return error if already verified

2. **Clean Old Tokens**
   - Delete all old verification tokens for this user
   - Prevents token accumulation

3. **Create New Token**
   - Generate new UUID token
   - Set 24-hour expiration
   - Store in `verification_tokens` table

4. **Send Email**
   - Use Resend API to send verification email
   - Include verification link
   - Show beautiful HTML template

5. **Notify Admin**
   - Show success toast
   - Log verification link in development
   - User receives email immediately

## Use Cases

### Scenario 1: User Didn't Receive Email

**Problem:** User signed up but never received verification email

**Solution:**
1. Admin goes to `/protected/admin/users`
2. Finds the user (search by email)
3. Sees "Not Verified" badge
4. Clicks Mail icon button
5. New verification email sent instantly

### Scenario 2: Verification Link Expired

**Problem:** User's verification link expired (24 hours passed)

**Solution:**
1. User contacts support
2. Admin searches for user in admin panel
3. Clicks "Resend Verification Email"
4. User gets fresh link valid for 24 hours

### Scenario 3: Email Went to Spam

**Problem:** Verification email went to spam folder

**Solution:**
1. Admin resends verification email
2. Instructs user to check spam folder
3. User can whitelist sender for future emails

## Security

### Admin Authentication Required

- Only authenticated admins can access `/protected/admin/users`
- Admin authentication handled by layout
- Non-admins are redirected

### Rate Limiting (Recommended)

Consider adding rate limiting to prevent abuse:
```typescript
// Example: Limit to 5 resends per user per hour
const recentResends = await prisma.verification_tokens.count({
  where: {
    user_verification_token: userId,
    created_at: {
      gte: new Date(Date.now() - 60 * 60 * 1000)
    }
  }
});

if (recentResends >= 5) {
  return NextResponse.json(
    { error: 'Too many verification emails sent. Please try again later.' },
    { status: 429 }
  );
}
```

## Testing

### Test Resend Functionality

1. **Create a test user** (not verified)
2. **Go to admin panel**: http://localhost:3000/protected/admin/users
3. **Find the user** in the list
4. **Click Mail icon** next to unverified user
5. **Check:**
   - Toast notification appears
   - Email received (check inbox/spam)
   - Verification link works
   - Console shows link in development

### Test Filters

1. **Search by email**: Type user's email
2. **Filter by scope**: Select "Sender" or "Provider"
3. **Filter by verification**: Select "Not Verified"
4. **Verify results** update in real-time

## UI Components

### Badges

- **Email Verified**: Green badge with checkmark
- **Not Verified**: Gray badge with alert icon
- **KYB Status**: Color-coded by status
- **Scope**: Blue (Sender), Purple (Provider), Indigo (Both)

### Buttons

- **Eye Icon**: View user details
- **Mail Icon**: Resend verification (only for unverified)
- **Spinning Icon**: Shows while sending email

### Loading States

- Table shows "Loading users..." while fetching
- Button shows spinning icon while sending
- Disabled state prevents double-clicks

## Database Schema

### Tables Used

**`users`**
- Stores user information
- `is_email_verified` boolean field
- `email` for sending verification

**`verification_tokens`**
- Stores verification tokens
- `user_verification_token` links to user
- `scope` = 'email_verification'
- `expiry_at` for 24-hour expiration

## Email Template

The verification email includes:
- Welcome message with user's first name
- Big "Verify Email Address" button
- Copy-paste link as backup
- 24-hour expiration warning
- Professional NedaPay branding
- Responsive design (mobile-friendly)

## Troubleshooting

### Issue: "User email is already verified"

**Cause:** Trying to resend to verified user

**Solution:** This is expected behavior - no action needed

### Issue: "Failed to send verification email"

**Possible Causes:**
1. Resend API key not set
2. Resend API key invalid
3. Network error

**Solution:**
1. Check `.env.local` has `RESEND_API_KEY`
2. Verify API key is correct
3. Check Resend dashboard for errors

### Issue: User not receiving emails

**Possible Causes:**
1. Email in spam folder
2. Invalid email address
3. Resend domain not verified (production)

**Solution:**
1. Ask user to check spam
2. Verify email address is correct
3. Verify domain in Resend dashboard

## Future Enhancements

### Planned Features

1. **Bulk Actions**
   - Resend to multiple users at once
   - Export user list to CSV

2. **Email History**
   - Track when verification emails were sent
   - Show delivery status from Resend

3. **Manual Verification**
   - Allow admin to manually verify user
   - Add reason/notes for manual verification

4. **User Notifications**
   - Send custom emails to users
   - Notify users of account changes

5. **Analytics**
   - Track verification rates
   - Monitor email delivery success

## Summary

The admin panel now provides complete control over user email verification:

✅ **View all users** with verification status  
✅ **Filter and search** to find specific users  
✅ **Resend verification emails** with one click  
✅ **View detailed user information**  
✅ **Real-time updates** with loading states  
✅ **Error handling** with helpful messages  

This ensures no user is stuck without email verification, improving user experience and reducing support burden!
