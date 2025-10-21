# Backstage Admin Access - Setup Guide

## Overview

The admin panel is now accessible via a hidden `/backstage` URL with password authentication. This keeps the admin interface completely separate from the regular user dashboard.

## Key Features

✅ **Hidden URL**: Admin panel accessible only at `/backstage`  
✅ **Password Protected**: Requires admin password to access  
✅ **Secure Sessions**: HTTP-only cookies with 8-hour expiration  
✅ **No Client Exposure**: Admin login button not visible in user dashboard  
✅ **Logout Functionality**: Secure logout that clears session  

## Setup

### 1. Set Admin Password

Add a strong password to your `.env.local`:

```bash
# Generate a strong password
openssl rand -base64 32

# Add to .env.local
ADMIN_ACCESS_PASSWORD=your_generated_strong_password
```

### 2. Access Admin Panel

**URL**: `https://yourdomain.com/backstage`  
**Development**: `http://localhost:3000/backstage`

### 3. Login

1. Navigate to `/backstage`
2. Enter the admin password
3. Click "Access Admin Panel"
4. Redirected to `/protected/admin`

## Security Architecture

### Authentication Flow

```
1. User visits /backstage
   ↓
2. Enters admin password
   ↓
3. Server validates against ADMIN_ACCESS_PASSWORD
   ↓
4. Sets HTTP-only cookie: admin_session=authenticated
   ↓
5. Redirects to /protected/admin
   ↓
6. Admin layout checks for valid cookie
   ↓
7. If valid: Show admin panel
   If invalid: Redirect to /backstage
```

### Session Management

**Cookie Details:**
- **Name**: `admin_session`
- **Value**: `authenticated`
- **HttpOnly**: `true` (not accessible via JavaScript)
- **Secure**: `true` in production (HTTPS only)
- **SameSite**: `lax`
- **Max Age**: 8 hours (28,800 seconds)
- **Path**: `/` (entire site)

### Security Features

1. **HTTP-Only Cookies**
   - Cannot be accessed by JavaScript
   - Prevents XSS attacks

2. **Secure Flag in Production**
   - Cookie only sent over HTTPS
   - Prevents man-in-the-middle attacks

3. **Server-Side Validation**
   - Password never sent to client
   - Validation happens on server

4. **Session Expiration**
   - Automatic logout after 8 hours
   - Prevents indefinite access

5. **No Client-Side Storage**
   - No localStorage or sessionStorage used
   - All session data in HTTP-only cookies

## Files Created

### 1. `/app/backstage/page.tsx`
- Login page UI
- Password input with show/hide
- Form submission to API

### 2. `/app/api/admin/auth/login/route.ts`
- Validates admin password
- Sets secure session cookie
- Logs authentication attempts

### 3. `/app/api/admin/auth/logout/route.ts`
- Clears session cookie
- Logs out admin user

### 4. `/app/protected/admin/layout.tsx` (Updated)
- Checks for valid admin session
- Redirects to `/backstage` if not authenticated
- Renders admin sidebar when authenticated

### 5. `/components/admin/sidebar.tsx` (Updated)
- Added logout button
- Calls logout API
- Redirects to `/backstage`

## Usage

### Accessing Admin Panel

**Step 1**: Go to backstage URL
```
http://localhost:3000/backstage
```

**Step 2**: Enter admin password
```
The password from ADMIN_ACCESS_PASSWORD in .env.local
```

**Step 3**: Access granted
```
Redirected to http://localhost:3000/protected/admin
```

### Logging Out

**Option 1**: Click logout button in sidebar
- Located at bottom of admin sidebar
- "Logout from Admin" button
- Redirects to `/backstage`

**Option 2**: Session expires automatically
- After 8 hours of inactivity
- Must re-authenticate at `/backstage`

### Direct URL Access

If someone tries to access `/protected/admin` directly:
- **Without session**: Redirected to `/backstage`
- **With valid session**: Access granted

## Environment Variables

### Required in `.env.local`

```bash
# Admin password for /backstage access
ADMIN_ACCESS_PASSWORD=your_strong_password_here
```

### Generate Strong Password

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Use a trusted password generator
```

## Production Deployment

### 1. Set Environment Variable

In your production environment (Vercel, Netlify, etc.):

```bash
ADMIN_ACCESS_PASSWORD=your_production_password
```

### 2. Use Strong Password

Requirements:
- ✅ At least 32 characters
- ✅ Mix of letters, numbers, symbols
- ✅ Generated randomly
- ✅ Stored securely (password manager)

### 3. HTTPS Only

The secure flag ensures cookies only sent over HTTPS:
```typescript
secure: process.env.NODE_ENV === 'production'
```

### 4. Share Password Securely

**DO NOT:**
- ❌ Send via email
- ❌ Post in Slack/Teams
- ❌ Commit to Git
- ❌ Store in plain text

**DO:**
- ✅ Use password manager (1Password, LastPass)
- ✅ Share via encrypted channel
- ✅ Rotate regularly
- ✅ Use different passwords for dev/staging/prod

## Monitoring

### Login Attempts

All login attempts are logged:

```typescript
// Successful login
console.log('Successful admin login at:', new Date().toISOString());

// Failed login
console.warn('Failed admin login attempt at:', new Date().toISOString());
```

### Check Logs

**Development**: Check terminal where `npm run dev` is running

**Production**: Check your hosting platform's logs
- Vercel: Dashboard → Logs
- Netlify: Dashboard → Functions → Logs
- AWS: CloudWatch Logs

## Troubleshooting

### Issue: "Invalid password"

**Cause**: Wrong password entered

**Solution**:
1. Check `.env.local` for correct password
2. Ensure no extra spaces
3. Restart dev server after changing `.env.local`

### Issue: "Admin authentication not configured"

**Cause**: `ADMIN_ACCESS_PASSWORD` not set

**Solution**:
1. Add `ADMIN_ACCESS_PASSWORD` to `.env.local`
2. Restart dev server
3. Try logging in again

### Issue: Redirected to /backstage immediately

**Cause**: Session cookie expired or invalid

**Solution**:
1. This is expected behavior
2. Re-enter admin password
3. Session valid for 8 hours

### Issue: Can't access admin panel

**Possible Causes**:
1. Wrong password
2. Environment variable not set
3. Server not restarted after env change
4. Cookie blocked by browser

**Solution**:
1. Verify password in `.env.local`
2. Restart dev server
3. Clear browser cookies
4. Try incognito mode

## Best Practices

### 1. Password Management

- ✅ Use unique password for each environment
- ✅ Store in password manager
- ✅ Rotate every 90 days
- ✅ Never share via insecure channels

### 2. Access Control

- ✅ Limit who knows the backstage URL
- ✅ Use VPN for production access
- ✅ Monitor login attempts
- ✅ Implement rate limiting (future enhancement)

### 3. Session Management

- ✅ Logout when done
- ✅ Don't leave sessions open
- ✅ Use private/incognito for shared computers
- ✅ Clear cookies on public computers

### 4. Monitoring

- ✅ Review login logs regularly
- ✅ Set up alerts for failed attempts
- ✅ Track admin actions (future: audit log)
- ✅ Monitor for suspicious activity

## Future Enhancements

### Planned Features

1. **Rate Limiting**
   - Limit login attempts
   - Block after 5 failed attempts
   - Temporary lockout

2. **Two-Factor Authentication**
   - TOTP (Google Authenticator)
   - SMS verification
   - Email verification

3. **Multiple Admin Users**
   - User-specific credentials
   - Role-based permissions
   - Activity tracking per user

4. **Audit Logging**
   - Track all admin actions
   - Who did what and when
   - Compliance reporting

5. **IP Whitelisting**
   - Restrict access by IP
   - VPN-only access
   - Geo-blocking

## Comparison: Before vs After

### Before
- ❌ Admin link visible in user dashboard
- ❌ Anyone could find admin panel
- ❌ No password protection
- ❌ Security through obscurity

### After
- ✅ Hidden `/backstage` URL
- ✅ Password protected
- ✅ Secure session management
- ✅ No exposure in user interface
- ✅ Proper authentication flow

## Testing

### Test Login Flow

1. **Clear cookies**
   ```
   Browser DevTools → Application → Cookies → Clear
   ```

2. **Try accessing admin directly**
   ```
   http://localhost:3000/protected/admin
   → Should redirect to /backstage
   ```

3. **Login with wrong password**
   ```
   Enter wrong password
   → Should show "Invalid password" error
   ```

4. **Login with correct password**
   ```
   Enter correct password
   → Should redirect to /protected/admin
   → Should show admin panel
   ```

5. **Test logout**
   ```
   Click "Logout from Admin"
   → Should redirect to /backstage
   → Should clear session cookie
   ```

6. **Test session persistence**
   ```
   Login successfully
   Navigate to different admin pages
   → Should stay logged in
   Refresh page
   → Should still be logged in
   ```

## Summary

The admin panel is now:

✅ **Hidden**: Only accessible at `/backstage`  
✅ **Secure**: Password protected with HTTP-only cookies  
✅ **Isolated**: Completely separate from user dashboard  
✅ **Professional**: Clean login UI with proper UX  
✅ **Monitored**: All login attempts logged  
✅ **Manageable**: Easy logout and session management  

**Access URL**: `https://yourdomain.com/backstage`  
**Session Duration**: 8 hours  
**Security**: Production-ready with HTTPS and HTTP-only cookies  

No admin buttons or links are visible in the regular user interface!
