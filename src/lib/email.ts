import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const authFromEmail = process.env.EMAIL_FROM_AUTH || 'HoardSpace Auth <auth@hoardspace.in>';
const generalFromEmail = process.env.EMAIL_FROM_GENERAL || 'HoardSpace <hello@hoardspace.in>';

let resendClient: Resend | null = null;

// Initialize Resend client only if API key is provided
if (resendApiKey) {
    resendClient = new Resend(resendApiKey);
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
}

/**
 * Send email via Resend
 * Falls back to console logging in development if Resend is not configured
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
        // If Resend is not configured, log to console (development mode)
        if (!resendClient) {
            console.log(`[MOCK EMAIL] From: ${options.from || generalFromEmail}`);
            console.log(`[MOCK EMAIL] To: ${options.to}`);
            console.log(`[MOCK EMAIL] Subject: ${options.subject}`);
            console.log(`[MOCK EMAIL] Body: ${options.text || options.html}`);

            if (process.env.NODE_ENV === 'production') {
                console.error('Resend API key not configured in production!');
                return { success: false, error: 'Email service not configured' };
            }

            return { success: true, messageId: 'mock-email-id' };
        }

        // Send real email via Resend
        const { data, error } = await resendClient.emails.send({
            from: options.from || generalFromEmail,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        if (error) {
            console.error('Failed to send email:', error);
            return { success: false, error: error.message };
        }

        console.log(`Email sent successfully to ${options.to}, ID: ${data?.id}`);

        return {
            success: true,
            messageId: data?.id
        };

    } catch (error: any) {
        console.error('Failed to send email:', error);
        return {
            success: false,
            error: error.message || 'Failed to send email'
        };
    }
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(email: string, otp: string): Promise<EmailResult> {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - HoardSpace</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #5b40e6 0%, #4834b8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">HoardSpace</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Outdoor Advertising Platform</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #5b40e6; margin-top: 0;">Verify Your Email Address</h2>
          
          <p style="font-size: 16px; color: #555;">Thank you for registering with HoardSpace! Please use the verification code below to complete your registration:</p>
          
          <div style="background: #f8f9fa; border: 2px dashed #5b40e6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <div style="font-size: 14px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</div>
            <div style="font-size: 36px; font-weight: bold; color: #5b40e6; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
          </div>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>⚠️ Security Notice:</strong> This code is valid for <strong>15 minutes</strong>. Never share this code with anyone. HoardSpace will never ask for your verification code.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #777; margin-top: 30px;">If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} HoardSpace. All rights reserved.<br>
            <a href="https://hoardspace.com" style="color: #5b40e6; text-decoration: none;">Visit our website</a>
          </p>
        </div>
      </body>
    </html>
  `;

    const text = `
Your HoardSpace verification code is: ${otp}

This code is valid for 15 minutes. Never share this code with anyone.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} HoardSpace. All rights reserved.
  `;

    return sendEmail({
        to: email,
        subject: 'Verify Your Email - HoardSpace',
        html,
        text,
        from: authFromEmail,
    });
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HoardSpace</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #5b40e6 0%, #4834b8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HoardSpace! 🎉</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #5b40e6; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="font-size: 16px; color: #555;">Your email has been successfully verified. Welcome to HoardSpace - India's leading outdoor advertising platform!</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #5b40e6; margin-top: 0;">Get Started:</h3>
            <ul style="color: #555; padding-left: 20px;">
              <li>Browse thousands of premium hoarding locations</li>
              <li>List your advertising spaces and reach more clients</li>
              <li>Manage bookings and payments seamlessly</li>
              <li>Track your campaigns in real-time</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://hoardspace.in/profile" style="display: inline-block; background: #5b40e6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Complete Your Profile</a>
          </div>
          
          <p style="font-size: 14px; color: #777; margin-top: 30px;">Need help? Our support team is here for you at <a href="mailto:support@hoardspace.com" style="color: #5b40e6;">support@hoardspace.com</a></p>
        </div>
        
        <div style="text-align: center; padding: 20px;">
          <p style="margin: 0; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} HoardSpace. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: 'Welcome to HoardSpace! 🎉',
        html,
        from: generalFromEmail,
    });
}
