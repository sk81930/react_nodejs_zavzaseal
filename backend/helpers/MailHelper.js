const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const Setting = require('../models/Setting');

class MailHelper {
  constructor() {
    this.transporter = null;
    this.isInitializing = false;
    this.isVerified = false;
    this.verificationPromise = null;
    this.connectionRetries = 0;
    this.maxRetries = 3;
    this.currentTransportType = null; // 'general' | 'estimate'
    this.fromAddress = null;
    this.retries = 3;

    
  }

  async initializeTransporter(type = 'general') {
    try {
      // Read SMTP config from settings table depending on type
      const isEstimate = type === 'estimate';

      const hostKey = isEstimate ? 'estimates_smtp_host' : 'smtp_host';
      const portKey = isEstimate ? 'estimates_smtp_port' : 'smtp_port';
      const secureKey = isEstimate ? 'estimates_smtp_secure' : 'smtp_secure';
      const fromEmailKey = isEstimate ? 'estimates_smtp_from_email' : 'smtp_from_email';
      const userKey = isEstimate ? 'estimates_smtp_username' : 'smtp_username';
      const passKey = isEstimate ? 'estimates_smtp_password' : 'smtp_password';

      const [host, portVal, secureMode, fromEmail, user, pass] = await Promise.all([
        Setting.getSettingByKey(hostKey),
        Setting.getSettingByKey(portKey),
        Setting.getSettingByKey(secureKey),
        Setting.getSettingByKey(fromEmailKey),
        Setting.getSettingByKey(userKey),
        Setting.getSettingByKey(passKey)
      ]);

      if (!host || !portVal || !user || !pass) {
        throw new Error('Missing SMTP configuration in settings.');
      }

      const port = Number(portVal);
      const secureFlag = String(secureMode || '').toLowerCase(); // 'none' | 'ssl' | 'tls'
      const isSsl = secureFlag === 'ssl' || port === 465;
      const isTls = secureFlag === 'tls';

      const transportOptions = {
        host: host,
        port: port,
        secure: isSsl,
        auth: {
          user: user,
          pass: pass,
        },
        pool: true,
        maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS) || 5,
        maxMessages: Number(process.env.SMTP_MAX_MESSAGES) || 100,
        rateLimit: Number(process.env.SMTP_RATE_LIMIT) || 5,
      };

      if (isTls && !isSsl) {
        transportOptions.tls = { rejectUnauthorized: false };
      }

      this.transporter = nodemailer.createTransport(transportOptions);
      this.currentTransportType = type;

      this.fromAddress = fromEmail || user;
      this.retries = Number(process.env.SMTP_RETRIES) || 3;
      this.delayBetweenEmails = Number(process.env.SMTP_DELAY_BETWEEN_EMAILS) || 500;
    } catch (error) {
      console.log("error", error);
      this.transporter = null;
      this.currentTransportType = null;
      throw error;
    }
  }

  /**
   * Check if mail service is available
   * @returns {Promise<boolean>} - True if mail service is ready
   */
  async isMailServiceAvailable() {
    if (this.verificationPromise) {
      await this.verificationPromise;
    }
    return this.transporter !== null && this.isVerified;
  }

  /**
   * Close the transporter connection
   */
  async closeConnection() {
    if (this.transporter) {
      try {
        await this.transporter.close();
        console.log('SMTP connection closed');
      } catch (error) {
        console.log('Error closing SMTP connection:', error.message);
      }
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async sendMailWithRetry(mailOptions) {
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${mailOptions.to}: ${info.messageId}`);
        return info;
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt + 1} failed: ${error.message}`);
        if (error.responseCode === 421 && attempt < this.retries) {
          const delayTime = 1000 * (attempt + 1);
          console.log(`🔁 Retrying in ${delayTime}ms...`);
          await this.delay(delayTime);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Retry sending email with exponential backoff
   * @param {Function} emailFunction - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<Object>} - Result object
   */
  async retryWithBackoff(emailFunction, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await emailFunction();
      } catch (error) {
        console.log(`Email attempt ${attempt} failed:`, error.message);
        
        if (error.code === 'EPROTOCOL' && error.responseCode === 421) {
          // Too many connections error - shorter wait for higher throughput
          const waitTime = Math.min(1000 * attempt, 5000); // Max 5 second wait
          console.log(`Waiting ${waitTime}ms before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Don't close all connections, just retry with existing pool
          console.log('Retrying with existing connection pool...');
        } else if (attempt === maxRetries) {
          throw error;
        } else {
          // Other errors - shorter wait
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }

  /**
   * Send a simple text email
   * @param {Object} options - Email options
   * @param {string|Array} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content (optional)
   * @param {string|Array} options.cc - CC recipients (optional)
   * @param {string|Array} options.bcc - BCC recipients (optional)
   * @param {Array} options.attachments - File attachments (optional)
   * @returns {Promise<Object>} - Result object
   */
  async sendEmail(options) {
    try {
      const { type = 'general' } = options;

      if (!this.transporter || this.currentTransportType !== type) {
        await this.initializeTransporter(type);
      }

      // Wait for verification to complete if it's still in progress
      // if (this.verificationPromise) {
      //   await this.verificationPromise;
      // }

      if (!this.transporter) {
        return {
          success: false,
          error: 'Mail transporter not initialized or verification failed. Please check SMTP configuration.',
          message: 'Email service is not available'
        };
      }

      const {
        to,
        subject,
        text,
        html,
        cc,
        bcc,
        attachments = [],
        from = this.fromAddress || process.env.SMTP_FROM || process.env.SMTP_USER
      } = options;

      // Validate required fields
      if (!to || !subject || (!text && !html)) {
        throw new Error('Missing required email fields: to, subject, and text/html');
      }

      const mailOptions = {
        from: from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments
      };


      // console.log("mailOptions", mailOptions); 

      // return;

      // Add CC if provided
      if (cc && cc.length > 0) {
        mailOptions.cc = Array.isArray(cc) ? cc.join(', ') : cc;
      }

      // Add BCC if provided
      if (bcc && bcc.length > 0) {
        mailOptions.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc;
      }

     

      // Use retry logic for sending email
      const result = await this.sendMailWithRetry(mailOptions);

      console.log("result", result);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.log('Error sending email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email'
      };
    }
  }

  /**
   * Send email with template
   * @param {Object} options - Email options
   * @param {string} options.template - Template name or path
   * @param {Object} options.templateData - Data to populate template
   * @param {string|Array} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string|Array} options.cc - CC recipients (optional)
   * @param {string|Array} options.bcc - BCC recipients (optional)
   * @param {Array} options.attachments - File attachments (optional)
   * @returns {Promise<Object>} - Result object
   */
  async sendTemplateEmail(options) {
    try {
      const { template, templateData, ...emailOptions } = options;
      
      // Load and render template
      const templatePath = path.join(process.cwd(), 'templates', 'emails', `${template}.ejs`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
      }

      const ejs = require('ejs');
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const html = ejs.render(templateContent, templateData);

      return await this.sendEmail({
        ...emailOptions,
        html: html
      });

    } catch (error) {
      console.error('Error sending template email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send template email'
      };
    }
  }

  /**
   * Send estimate approval email
   * @param {Object} options - Email options
   * @param {string} options.estimateId - Estimate ID
   * @param {string|Array} options.sentTo - Recipient email(s)
   * @param {string} options.emailHeader - Email subject/header
   * @param {string} options.emailBody - Email body content
   * @param {string|Array} options.cc - CC recipients (optional)
   * @param {string|Array} options.bcc - BCC recipients (optional)
   * @param {string} options.mode - Email mode (approval, etc.)
   * @param {string} options.pdfPath - Path to PDF attachment (optional)
   * @returns {Promise<Object>} - Result object
   */
  async sendEstimateEmail(options) {
    try {
      const {
        estimateId,
        sentTo,
        emailHeader,
        emailBody,
        cc = [],
        bcc = [],
        mode = 'approval',
        pdfPath = null
      } = options;

      //console.log("options", options);

      // Prepare attachments
      const attachments = [];
      
      if (pdfPath && fs.existsSync(pdfPath)) {
        attachments.push({
          filename: `estimate_${estimateId}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf'
        });
      }

      // Clean up email arrays (remove empty strings)
      const cleanTo = Array.isArray(sentTo) ? sentTo.filter(email => email.trim()) : [sentTo].filter(email => email.trim());
      const cleanCc = Array.isArray(cc) ? cc.filter(email => email.trim()) : [cc].filter(email => email.trim());
      const cleanBcc = Array.isArray(bcc) ? bcc.filter(email => email.trim()) : [bcc].filter(email => email.trim());

      // Prepare email content
      const subject = emailHeader || `Estimate ${mode === 'approval' ? 'Approval' : 'Request'} - #${estimateId}`;
      
      // Convert HTML content to plain text if needed
      const plainText = this.htmlToPlainText(emailBody);
      
      // Create HTML version with better formatting
      const htmlContent = this.formatEmailBody(emailBody, mode, estimateId);

      return await this.sendEmail({
        to: cleanTo,
        subject: subject,
        text: plainText,
        html: htmlContent,
        cc: cleanCc.length > 0 ? cleanCc : undefined,
        bcc: cleanBcc.length > 0 ? cleanBcc : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        type: 'estimate'
      });

    } catch (error) {
      //console.error('Error sending estimate email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send estimate email'
      };
    }
  }

  /**
   * Convert HTML to plain text
   * @param {string} html - HTML content
   * @returns {string} - Plain text content
   */
  htmlToPlainText(html) {
    if (!html) return '';
    
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Format email body with proper HTML structure
   * @param {string} content - Email content
   * @param {string} mode - Email mode
   * @param {string} estimateId - Estimate ID
   * @returns {string} - Formatted HTML content
   */
  formatEmailBody(content, mode, estimateId) {
    const headerColor = mode === 'approval' ? '#28a745' : '#007bff';
    const modeText = mode === 'approval' ? 'Approval' : 'Request';

    //const content_data = content.replaceAll("<br>", '<p>');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estimate ${modeText}</title>
        <style>
          .estimate-id { font-weight: bold; color: ${headerColor}; }
          p{
            font-variant-numeric: normal;
            font-variant-east-asian: normal;
            font-stretch: normal;
            line-height: normal;
            margin: 0px;
            padding: 0px;
          }
        </style>
      </head>
      <body>
        <div class="content">
          ${content}
          <br>
        </div>
        <div class="footer">
         <div style="color: #888;">
           <div>Warm regards,</div>
           <br>
           <img width="200" height="168" src="https://react.zavzaseal.com/backend/public/logo.jpg" alt="Zavza Seal Logo" style="display: block; margin: 10px 0;">
           <div><i><b>Steven Marsh</b></i></div>
           <div><b><i>Sales Representative / Project Estimator</i></b></div>
           <div><i>Zavza Seal LLC</i></div>
           <div><i><a href="http://www.zavzaseal.com/" style="color:#1155cc;" target="_blank">www.zavzaseal.com</a></i></div>
           <div><i>Office Number: (631)-980-1800</i></div>
           <div><i>Direct Number: <span style="color:#888;">(631) 337-5001</span></i></div>
         </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send bulk emails
   * @param {Array} emailList - Array of email options
   * @param {number} delay - Delay between emails in milliseconds (default: 1000)
   * @returns {Promise<Object>} - Result object with success/failure counts
   */
  async sendBulkEmails(emailList, delay = 1000) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < emailList.length; i++) {
      try {
        const result = await this.sendEmail(emailList[i]);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ index: i, error: result.error });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ index: i, error: error.message });
      }

      // Add delay between emails to avoid rate limiting
      if (i < emailList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return results;
  }

  /**
   * Check if mail helper is properly configured
   * @returns {Object} - Configuration status
   */
  isConfigured() {
    return {
      configured: !!this.transporter,
      hasCredentials: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      transporter: !!this.transporter
    };
  }

  /**
   * Test email configuration
   * @param {string} testEmail - Email address to send test to
   * @returns {Promise<Object>} - Result object
   */
  async testConfiguration(testEmail) {
    try {
      if (!this.transporter) {
        return {
          success: false,
          error: 'Mail transporter not initialized',
          message: 'Please check SMTP configuration'
        };
      }

      return await this.sendEmail({
        to: testEmail,
        subject: 'Test Email - Mail Configuration',
        text: 'This is a test email to verify mail configuration.',
        html: '<h3>Test Email</h3><p>This is a test email to verify mail configuration.</p>'
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to send test email'
      };
    }
  }
}

// Singleton pattern to prevent multiple instances
let mailHelperInstance = null;

class MailHelperSingleton {
  static getInstance() {
    if (!mailHelperInstance) {
      mailHelperInstance = new MailHelper();
    }
    return mailHelperInstance;
  }
}

module.exports = MailHelperSingleton;
