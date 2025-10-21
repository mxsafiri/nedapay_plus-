# Email Setup Guide

## Why Emails Aren't Being Sent

Currently, the sign-up flow creates verification tokens but doesn't send emails. The verification link is only logged to the console.

**This is NOT a schema restriction** - the `public` schema can send emails just fine. We just haven't implemented the email sending service yet!

## Option 1: Resend (Recommended for Next.js)

Resend is the easiest and most modern email service for Next.js applications.

### Step 1: Install Resend

```bash
npm install resend
```

### Step 2: Get Resend API Key

1. Go to https://resend.com
2. Sign up for a free account
3. Go to **API Keys**
4. Create a new API key
5. Copy the key (starts with `re_`)

### Step 3: Add to .env.local

```bash
# Email Configuration
RESEND_API_KEY=re_your_api_key_here
```

### Step 4: Create Email Service

Create `/lib/email.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  firstName: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'NedaPay <onboarding@yourdomain.com>', // Change this to your domain
      to: [email],
      subject: 'Verify your NedaPay account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to NedaPay!</h1>
              </div>
              <div class="content">
                <p>Hi ${firstName},</p>
                <p>Thank you for signing up for NedaPay. We're excited to have you on board!</p>
                <p>To complete your registration and verify your email address, please click the button below:</p>
                <div style="text-align: center;">
                  <a href="${verificationLink}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account with NedaPay, you can safely ignore this email.</p>
                <p>Best regards,<br>The NedaPay Team</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} NedaPay. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
```

### Step 5: Update Sign-up API

Update `/app/api/auth/signup/route.ts`:

```typescript
import { sendVerificationEmail } from '@/lib/email';

// After creating verification token:
const verificationLink = `${request.nextUrl.origin}/auth/verify-email?token=${token}`;

// Send verification email
const emailResult = await sendVerificationEmail(
  newUser.email,
  verificationLink,
  newUser.first_name
);

if (!emailResult.success) {
  console.error('Failed to send verification email, but user was created');
  // Don't fail the signup - user can request a new email later
}

console.log('Sign-up successful for user:', newUser.email);
```

### Step 6: Domain Verification (Production)

For production, you need to verify your domain with Resend:

1. Go to Resend Dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides
5. Wait for verification (usually a few minutes)

**For development**, you can use:
- `onboarding@resend.dev` (Resend's test domain)
- Emails will only be sent to your verified email

## Option 2: SendGrid

If you prefer SendGrid:

### Install

```bash
npm install @sendgrid/mail
```

### Setup

```typescript
// /lib/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  firstName: string
) {
  const msg = {
    to: email,
    from: 'noreply@yourdomain.com',
    subject: 'Verify your NedaPay account',
    html: `...` // Same HTML as above
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error };
  }
}
```

## Option 3: Nodemailer (SMTP)

For custom SMTP servers:

### Install

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### Setup

```typescript
// /lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  firstName: string
) {
  try {
    await transporter.sendMail({
      from: '"NedaPay" <noreply@yourdomain.com>',
      to: email,
      subject: 'Verify your NedaPay account',
      html: `...` // Same HTML as above
    });
    return { success: true };
  } catch (error) {
    console.error('SMTP error:', error);
    return { success: false, error };
  }
}
```

## Testing Email Sending

### Development Testing

Use these services to test emails without sending real ones:

1. **Mailtrap** - https://mailtrap.io (fake SMTP server)
2. **Ethereal Email** - https://ethereal.email (temporary test accounts)
3. **Resend Test Mode** - Sends to your verified email only

### Example with Mailtrap

```bash
# .env.local
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASSWORD=your_mailtrap_password
```

## Email Templates

For better email templates, consider:

1. **React Email** - https://react.email
   ```bash
   npm install @react-email/components
   ```

2. **MJML** - https://mjml.io
   - Responsive email framework

3. **Email Template Builders**
   - Unlayer
   - Stripo
   - Bee Free

## Best Practices

1. **Always use environment variables** for API keys
2. **Don't fail signup if email fails** - let users request a new verification email
3. **Log email errors** for debugging
4. **Use transactional email services** (not Gmail/Outlook)
5. **Verify your domain** for better deliverability
6. **Include unsubscribe links** for marketing emails
7. **Test emails** before going to production

## Recommended: Resend

For this project, I recommend **Resend** because:

✅ Built for Next.js  
✅ Simple API  
✅ Free tier (100 emails/day)  
✅ Great deliverability  
✅ Easy domain verification  
✅ React Email integration  

## Quick Start (Resend)

```bash
# 1. Install
npm install resend

# 2. Get API key from https://resend.com

# 3. Add to .env.local
echo "RESEND_API_KEY=re_your_key" >> .env.local

# 4. Create /lib/email.ts (see above)

# 5. Update sign-up API to call sendVerificationEmail()

# 6. Test!
```

## Summary

**Emails aren't being sent because we haven't integrated an email service yet - NOT because of schema restrictions!**

The `public` schema can absolutely send emails. You just need to:
1. Choose an email service (Resend recommended)
2. Get an API key
3. Create an email service helper
4. Call it from your API routes

Would you like me to implement Resend email sending for you?
