# Email Service Setup Guide

## Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the steps to enable it

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "ATS Portal" as the name
4. Click "Generate"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Paste app password (no spaces)
EMAIL_FROM_NAME=ATS Portal
```

### Step 4: Test
1. Restart your backend server
2. Try "Forgot Password" feature
3. Check your email inbox

---

## Other Email Providers

### Microsoft Outlook / Office 365
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password  # Generate at: https://login.yahoo.com/account/security
```

### SendGrid (Recommended for Production)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com  # Change region as needed
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
```

---

## Development Mode (No Email)

If you don't configure email:
- Reset codes will be shown in console and toast
- Perfect for local development
- No emails will be sent

---

## Production Deployment

### Environment Variables
Set these on your hosting platform:
- Heroku: Settings → Config Vars
- Vercel: Settings → Environment Variables
- AWS: Use AWS Systems Manager Parameter Store
- Azure: Application Settings

### Security Tips
1. Never commit `.env` file to git
2. Use strong app passwords
3. Rotate passwords regularly
4. Use SendGrid/AWS SES for production (better deliverability)

---

## Troubleshooting

### "Email service not configured"
- Check `.env` file has `EMAIL_USER` and `EMAIL_PASSWORD`
- Restart backend server after updating `.env`

### "Authentication failed"
- Gmail: Make sure you're using App Password, not regular password
- Verify 2FA is enabled for Gmail

### "Connection timeout"
- Check firewall settings
- Verify SMTP port (587) is not blocked
- Try port 465 with `secure: true`

### Emails going to spam
- Use SendGrid or AWS SES in production
- Add SPF/DKIM records to your domain
- Use verified sender email

---

## Testing Checklist

- [ ] Set up email credentials in `.env`
- [ ] Restart backend server
- [ ] Test forgot password flow
- [ ] Check email arrives in inbox
- [ ] Verify reset code works
- [ ] Test password reset completes successfully
