import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

// Create transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
};

// Send password reset email
export async function sendPasswordResetEmail(email, resetCode, userName) {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️  Email not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = getTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'ATS Portal'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Code - ATS Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .code-box {
              background: white;
              border: 2px solid #667eea;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #6b7280;
              font-size: 12px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || 'there'},</p>
              <p>We received a request to reset your password for your ATS Portal account.</p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Your reset code is:</p>
                <div class="code">${resetCode}</div>
              </div>
              
              <p>Enter this code on the password reset page to continue. This code will expire in <strong>1 hour</strong>.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </div>
              
              <p>Best regards,<br>ATS Portal Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${userName || 'there'},

We received a request to reset your password for your ATS Portal account.

Your password reset code is: ${resetCode}

Enter this code on the password reset page to continue. This code will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
ATS Portal Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Send welcome email (optional)
export async function sendWelcomeEmail(email, userName) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = getTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'ATS Portal'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to ATS Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ATS Portal!</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Thank you for signing up with ATS Portal. Your account has been successfully created.</p>
              <p>You can now log in and start managing your recruitment process efficiently.</p>
              <p>Best regards,<br>ATS Portal Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}
