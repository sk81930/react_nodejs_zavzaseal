const MailHelperSingleton = require('./helpers/MailHelper');

async function testEmailFix() {
  console.log('Testing SMTP connection fix...');
  
  // Get singleton instance
  const mailHelper = MailHelperSingleton.getInstance();
  
  // Test configuration
  const configStatus = mailHelper.isConfigured();
  console.log('Configuration status:', configStatus);
  
  if (!configStatus.configured) {
    console.log('❌ SMTP not configured. Please set environment variables:');
    console.log('SMTP_HOST=144.208.74.223');
    console.log('SMTP_PORT=465');
    console.log('SMTP_SECURE=true');
    console.log('SMTP_USER=crm@zavzaseal.com');
    console.log('SMTP_PASS=your_password');
    console.log('SMTP_FROM=crm@zavzaseal.com');
    return;
  }
  
  // Test sending email
  console.log('Sending test email...');
  const result = await mailHelper.sendEmail({
    to: 'virender@zavzaseal.com',
    subject: 'SMTP Connection Fix Test',
    text: 'This is a test email to verify the SMTP connection fix.',
    html: '<h3>SMTP Connection Fix Test</h3><p>This is a test email to verify the SMTP connection fix.</p>'
  });
  
  console.log('Email result:', result);
  
  if (result.success) {
    console.log('✅ Email sent successfully!');
  } else {
    console.log('❌ Email failed:', result.error);
  }
  
  // Close connection
  await mailHelper.closeConnection();
  console.log('Test completed.');
}

// Run the test
testEmailFix().catch(console.error);
