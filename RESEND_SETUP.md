# Resend Email Setup - Quick Start

## Why Resend?

Since your schema is shared with the aggregator node and you can't use Supabase Auth, **Resend** is the perfect solution:

✅ **Free tier**: 100 emails/day, 3,000/month  
✅ **Simple API**: Just one function call  
✅ **Built for Next.js**: Recommended by Supabase for custom emails  
✅ **Great deliverability**: High inbox placement  
✅ **No infrastructure**: No SMTP setup needed  

## Setup (5 minutes)

### Step 1: Install Resend ✅

Already done! The package is installed.

### Step 2: Get Your API Key

1. **Go to Resend**: https://resend.com
2. **Sign up** (free account)
3. **Go to API Keys**: https://resend.com/api-keys
4. **Create API Key**:
   - Click "Create API Key"
   - Name it: "NedaPay Development"
   - Permission: "Sending access"
   - Click "Add"
5. **Copy the key** (starts with `re_`)

### Step 3: Add to .env.local

```bash
# Add this to your .env.local file
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 4: Test It!

```bash
# Restart your dev server
npm run dev
```

Then try signing up at http://localhost:3000/auth/sign-up

## What Happens Now

When a user signs up:

1. ✅ User created in `public.users` table (Prisma)
2. ✅ Verification token created in `public.verification_tokens` (Prisma)
3. ✅ **Email sent via Resend** with verification link
4. ✅ User receives beautiful HTML email

## Email Template

The email includes:
- Welcome message with user's first name
- Big "Verify Email Address" button
- Copy-paste link as backup
- 24-hour expiration warning
- Professional NedaPay branding

## Development vs Production

### Development (Current Setup)

**From address**: `onboarding@resend.dev`
- ✅ Works immediately
- ✅ No domain verification needed
- ⚠️ Emails only sent to your verified email address

### Production (After Domain Verification)

**From address**: `onboarding@yourdomain.com`
- ✅ Send to any email address
- ✅ Better deliverability
- ✅ Professional branding

## Verify Your Domain (For Production)

When you're ready to go live:

1. **Go to Resend Dashboard** → **Domains**
2. **Click "Add Domain"**
3. **Enter your domain** (e.g., `nedapay.com`)
4. **Add DNS records** Resend provides:
   ```
   Type: TXT
   Name: @
   Value: [Resend provides this]
   
   Type: CNAME
   Name: resend._domainkey
   Value: [Resend provides this]
   ```
5. **Wait for verification** (usually 5-10 minutes)
6. **Update email.ts**:
   ```typescript
   from: 'NedaPay <onboarding@yourdomain.com>'
   ```

## Testing

### Test Email Sending

1. Sign up with your email address
2. Check your inbox (and spam folder)
3. Click the verification link
4. Check server logs for:
   ```
   Sending verification email to: your@email.com
   Verification email sent successfully
   ```

### View Sent Emails

Go to Resend Dashboard → **Emails** to see:
- All sent emails
- Delivery status
- Open rates (if tracking enabled)
- Click rates

## Email Functions Available

### 1. Verification Email (Already Implemented)

```typescript
import { sendVerificationEmail } from '@/lib/email';

await sendVerificationEmail(
  'user@example.com',
  'https://yoursite.com/verify?token=xxx',
  'John'
);
```

### 2. Password Reset Email (Ready to Use)

```typescript
import { sendPasswordResetEmail } from '@/lib/email';

await sendPasswordResetEmail(
  'user@example.com',
  'https://yoursite.com/reset?token=xxx',
  'John'
);
```

## Customizing Emails

Edit `/lib/email.ts` to customize:

- **Email design**: Modify the HTML
- **From address**: Change after domain verification
- **Subject lines**: Update the subject
- **Content**: Add more information

## Pricing

### Free Tier
- 100 emails/day
- 3,000 emails/month
- Perfect for development and small apps

### Paid Plans (When You Scale)
- $20/month: 50,000 emails
- $80/month: 100,000 emails
- Enterprise: Custom pricing

## Troubleshooting

### Email not received?

1. **Check spam folder**
2. **Verify API key** in `.env.local`
3. **Check Resend dashboard** for delivery status
4. **Check server logs** for errors

### "Invalid API key" error?

- Make sure you copied the full key (starts with `re_`)
- Check for extra spaces in `.env.local`
- Restart dev server after adding the key

### Emails going to spam?

For development with `@resend.dev`:
- This is normal, it's a shared domain
- Verify your domain for production to fix this

## Best Practices

1. **Don't fail signup if email fails**
   - User is created successfully
   - They can request a new verification email

2. **Log email errors**
   - Check server logs for issues
   - Monitor Resend dashboard

3. **Use environment variables**
   - Never hardcode API keys
   - Different keys for dev/staging/production

4. **Test before production**
   - Send test emails to yourself
   - Check all email links work
   - Verify formatting on mobile

## Next Steps

1. ✅ Get Resend API key
2. ✅ Add to `.env.local`
3. ✅ Restart dev server
4. ✅ Test sign-up flow
5. ✅ Check your email
6. ⏳ Verify domain (when ready for production)

## Support

- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Status Page**: https://status.resend.com

## Summary

You now have a complete email system that:
- ✅ Works with your existing `public.users` schema
- ✅ Doesn't require Supabase Auth
- ✅ Sends beautiful HTML emails
- ✅ Is production-ready
- ✅ Costs nothing to start

**Just add your Resend API key and you're done!** 🎉
