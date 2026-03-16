# Mail Setup Guide

## Installation

First, install the required nodemailer package:

```bash
npm install nodemailer
```

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# SMTP Configuration for Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Custom SMTP
```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_username
SMTP_PASS=your_password
```

## Usage Examples

### Basic Email
```javascript
const MailHelperSingleton = require('./helpers/MailHelper');
const mailHelper = MailHelperSingleton.getInstance();

// Send simple email
const result = await mailHelper.sendEmail({
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'This is a test email',
  html: '<h1>This is a test email</h1>'
});
```

### Estimate Email
```javascript
// Send estimate email with PDF attachment
const result = await mailHelper.sendEstimateEmail({
  estimateId: '123',
  sentTo: 'client@example.com',
  emailHeader: 'Estimate Approval Request',
  emailBody: 'Please review and approve the attached estimate.',
  cc: ['manager@example.com'],
  bcc: ['admin@example.com'],
  mode: 'approval',
  pdfPath: '/path/to/estimate.pdf'
});
```

### Template Email
```javascript
// Send email using template
const result = await mailHelper.sendTemplateEmail({
  template: 'welcome',
  templateData: { name: 'John', company: 'ABC Corp' },
  to: 'john@example.com',
  subject: 'Welcome to our service'
});
```

## Features

- ✅ Simple text and HTML emails
- ✅ Email templates with EJS
- ✅ File attachments (PDFs, images, etc.)
- ✅ CC and BCC support
- ✅ Bulk email sending
- ✅ Estimate-specific email formatting
- ✅ Error handling and logging
- ✅ SMTP configuration validation
- ✅ Test email functionality

## Testing

Test your email configuration:

```javascript
const MailHelperSingleton = require('./helpers/MailHelper');
const mailHelper = MailHelperSingleton.getInstance();

// Test configuration
const result = await mailHelper.testConfiguration('test@example.com');
console.log(result);
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check your email and password
   - For Gmail, use App Password instead of regular password
   - Ensure 2FA is enabled

2. **Connection Timeout**
   - Check SMTP host and port
   - Verify firewall settings
   - Try different port (465 for SSL, 587 for TLS)

3. **Email Not Received**
   - Check spam folder
   - Verify recipient email address
   - Check email provider's sending limits

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed SMTP logs in the console.
