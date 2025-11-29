import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  firstName: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'NedaPay <no-reply@nedapay.xyz>', // Change to your domain after verification
      to: [email],
      subject: 'Verify your NedaPay account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                color: white; 
                padding: 40px 30px; 
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content { 
                padding: 40px 30px;
              }
              .content p {
                margin: 0 0 16px 0;
                color: #52525b;
              }
              .button { 
                display: inline-block; 
                background: #3b82f6;
                color: white !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                margin: 24px 0;
                font-weight: 600;
                transition: background 0.2s;
              }
              .button:hover {
                background: #2563eb;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .link-text {
                word-break: break-all;
                color: #3b82f6;
                font-size: 14px;
                background: #f4f4f5;
                padding: 12px;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer { 
                text-align: center;
                padding: 30px;
                color: #71717a;
                font-size: 14px;
                border-top: 1px solid #e4e4e7;
              }
              .warning {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px 16px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .warning p {
                margin: 0;
                color: #92400e;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to NedaPay! 🎉</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${firstName}</strong>,</p>
                <p>Thank you for signing up for NedaPay. We're excited to have you join our platform for seamless cross-border payment infrastructure!</p>
                <p>To complete your registration and verify your email address, please click the button below:</p>
                
                <div class="button-container">
                  <a href="${verificationLink}" class="button">Verify Email Address</a>
                </div>
                
                <p style="text-align: center; color: #71717a; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <div class="link-text">${verificationLink}</div>
                
                <div class="warning">
                  <p><strong>⏰ This link will expire in 24 hours.</strong></p>
                </div>
                
                <p>Once verified, you'll be able to:</p>
                <ul style="color: #52525b; margin: 16px 0;">
                  <li>Access your developer dashboard</li>
                  <li>Generate API keys</li>
                  <li>Start integrating payment solutions</li>
                  <li>Manage your transactions</li>
                </ul>
                
                <p>If you didn't create an account with NedaPay, you can safely ignore this email.</p>
                
                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>The NedaPay Team</strong>
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} NedaPay. All rights reserved.</p>
                <p style="margin-top: 8px; font-size: 12px;">
                  This is an automated message, please do not reply to this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error };
    }

    console.log('Verification email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  firstName: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'NedaPay <no-reply@nedapay.xyz>',
      to: [email],
      subject: 'Reset your NedaPay password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                color: white; 
                padding: 40px 30px; 
                text-align: center;
              }
              .content { padding: 40px 30px; }
              .button { 
                display: inline-block; 
                background: #3b82f6;
                color: white !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                margin: 24px 0;
                font-weight: 600;
              }
              .button-container { text-align: center; margin: 30px 0; }
              .footer { 
                text-align: center;
                padding: 30px;
                color: #71717a;
                font-size: 14px;
                border-top: 1px solid #e4e4e7;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${firstName}</strong>,</p>
                <p>We received a request to reset your NedaPay account password.</p>
                <div class="button-container">
                  <a href="${resetLink}" class="button">Reset Password</a>
                </div>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
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
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}

export async function sendAdminKYBNotification(
  userEmail: string,
  userName: string,
  userRole: string,
  adminPortalUrl: string
) {
  try {
    const adminEmails = [
      'victor@nedapay.xyz',
      'baraka@nedapay.xyz',
      'machuche@nedapay.xyz'
    ];

    const { data, error } = await resend.emails.send({
      from: 'NedaPay <no-reply@nedapay.xyz>',
      to: adminEmails,
      subject: `🔔 New KYB Submission: ${userName} (${userRole})`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
                color: white; 
                padding: 40px 30px; 
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content { 
                padding: 40px 30px;
              }
              .content p {
                margin: 0 0 16px 0;
                color: #52525b;
              }
              .user-card {
                background: #f4f4f5;
                border-left: 4px solid #3b82f6;
                padding: 20px;
                margin: 24px 0;
                border-radius: 8px;
              }
              .user-card p {
                margin: 8px 0;
              }
              .user-card strong {
                color: #18181b;
              }
              .button { 
                display: inline-block; 
                background: #ea580c;
                color: white !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                margin: 24px 0;
                font-weight: 600;
                transition: background 0.2s;
              }
              .button:hover {
                background: #c2410c;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .alert {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 16px 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .alert p {
                margin: 0;
                color: #92400e;
                font-weight: 500;
              }
              .checklist {
                background: #f0fdf4;
                border: 1px solid #86efac;
                padding: 20px;
                margin: 24px 0;
                border-radius: 8px;
              }
              .checklist h3 {
                margin: 0 0 16px 0;
                color: #166534;
                font-size: 16px;
              }
              .checklist ul {
                margin: 0;
                padding-left: 20px;
                color: #166534;
              }
              .checklist li {
                margin: 8px 0;
              }
              .footer { 
                text-align: center;
                padding: 30px;
                color: #71717a;
                font-size: 14px;
                border-top: 1px solid #e4e4e7;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 New KYB Submission</h1>
              </div>
              <div class="content">
                <p><strong>Admin Team</strong>,</p>
                <p>A new user has submitted their KYB verification documents and is awaiting approval to access live APIs.</p>
                
                <div class="user-card">
                  <p><strong>👤 Name:</strong> ${userName}</p>
                  <p><strong>📧 Email:</strong> ${userEmail}</p>
                  <p><strong>🏢 Role:</strong> ${userRole === 'sender' ? 'Bank/Sender' : userRole === 'provider' ? 'PSP/Provider' : userRole}</p>
                  <p><strong>📅 Submitted:</strong> ${new Date().toLocaleString('en-US', { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })}</p>
                </div>

                <div class="alert">
                  <p>⏰ <strong>Action Required:</strong> Please review and verify the KYB documents in the admin portal.</p>
                </div>

                <div class="checklist">
                  <h3>📄 Documents to Review:</h3>
                  <ul>
                    <li>✓ Certificate of Incorporation</li>
                    <li>✓ Business License</li>
                    <li>✓ Shareholder Declaration</li>
                    <li>✓ AML Policy</li>
                    <li>✓ Data Protection Policy</li>
                  </ul>
                </div>

                <div class="button-container">
                  <a href="${adminPortalUrl}" class="button">Review in Admin Portal</a>
                </div>
                
                <p style="margin-top: 30px; color: #71717a; font-size: 14px;">
                  <strong>Next Steps:</strong><br>
                  1. Click the button above to access the admin portal<br>
                  2. Review all 5 compliance documents<br>
                  3. Approve or reject the KYB submission<br>
                  4. User will be notified of the decision
                </p>
                
                <p style="margin-top: 30px; color: #52525b;">
                  <strong>Note:</strong> Users cannot generate API keys or create payment orders until their KYB is approved.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} NedaPay Admin Portal</p>
                <p style="margin-top: 8px; font-size: 12px;">
                  This is an automated admin notification.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending admin KYB notification:', error);
      return { success: false, error };
    }

    console.log('Admin KYB notification sent successfully to:', adminEmails);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send admin KYB notification:', error);
    return { success: false, error };
  }
}
