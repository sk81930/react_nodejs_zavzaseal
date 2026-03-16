import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './SendApproval.scss';
import agent from '../../../agent';

const SendApproval = ({ estimate, mode = 'approval', clientEmail, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    sentTo: '',
    emailHeader: '',
    emailBody: '',
    cc: '',
    bcc: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video'
  ];

  // Auto-populate sentTo with customer email if available
  useEffect(() => {

    console.log('clientEmail', clientEmail);
    if (estimate && estimate.lead_data && estimate.lead_data.EMAIL) {
      setFormData(prev => ({
        ...prev,
        sentTo: estimate.lead_data.EMAIL
      }));
    }
  }, [estimate]);

  // Update form data when mode changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      sentTo: mode === 'client' ? clientEmail : '',
      emailHeader: mode === 'client' ? 'Estimate from Zavza Seal LLC' : 'Estimate Approval Request',
      emailBody: mode === 'client' ? 
        `<p>Dear Valued Customer,</p><br>
        <p>We are pleased to present your estimate for the requested work. Please review the attached estimate and let us know if you have any questions.</p>
       <br><p>Thank you for considering our services.</p>`: 
        ``
    }));
  }, [mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError('');
    }
  };


  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sentTo.trim()) {
      newErrors.sentTo = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.sentTo)) {
      newErrors.sentTo = 'Please enter a valid email address';
    }
    
    if (!formData.emailHeader.trim()) {
      newErrors.emailHeader = 'Email subject is required';
    }
    
    // Strip HTML tags for validation
    const emailBodyText = formData.emailBody.replace(/<[^>]*>/g, '').trim();
    if (!emailBodyText) {
      newErrors.emailBody = 'Email body is required';
    }
    
    // Validate CC emails if provided
    if (formData.cc.trim()) {
      const ccEmails = formData.cc.split(',').map(email => email.trim()).filter(email => email);
      const invalidCC = ccEmails.some(email => !/\S+@\S+\.\S+/.test(email));
      if (invalidCC) {
        newErrors.cc = 'Please enter valid email addresses separated by commas';
      }
    }
    
    // Validate BCC emails if provided
    if (formData.bcc.trim()) {
      const bccEmails = formData.bcc.split(',').map(email => email.trim()).filter(email => email);
      const invalidBCC = bccEmails.some(email => !/\S+@\S+\.\S+/.test(email));
      if (invalidBCC) {
        newErrors.bcc = 'Please enter valid email addresses separated by commas';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGeneralError('');
      return;
    }
    
    // Clear any previous general error
    setGeneralError('');
    
    setIsSubmitting(true);
    
    try {
      const emailData = {
        estimateId: estimate?.id,
        sentTo: formData.sentTo,
        emailHeader: formData.emailHeader,
        emailBody: formData.emailBody,
        cc: formData.cc.split(',').map(email => email.trim()).filter(email => email),
        bcc: formData.bcc.split(',').map(email => email.trim()).filter(email => email),
        mode: mode
      };
      
      console.log('Sending approval email:', emailData);
      
      // Call the actual API
      const response = await agent.estimates.sendEstimateEmail(emailData);
      console.log('Response:', response);

      if(response && response.data && response.data.email && response.data.email.success){
        onSuccess();
      }else{
        console.log('Error:', response?.message);
        setGeneralError('Failed to send approval email. Please try again.');
        //onError(errorMessage);
      }
      
      
      // onSuccess();
      
    } catch (error) {
      console.log('Error:', error?.message);
      const errorMessage = 'Failed to send approval email. Please try again.';
      setGeneralError(errorMessage);
      //onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="send-approval-overlay" style={{ display: 'flex' }}>
      <div className="send-approval-modal">
        <div className="send-approval-header">
          <h3>{mode === 'client' ? 'Send to Client' : 'Send for Approval'}</h3>
          <button 
            type="button" 
            className="send-approval-close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>
        
        {/* General Error Message */}
        {generalError && (
          <div className="send-approval-error-banner">
            <div className="send-approval-error-content">
              <span className="send-approval-error-icon">⚠️</span>
              <span className="send-approval-error-text">{generalError}</span>
              <button 
                type="button" 
                className="send-approval-error-close"
                onClick={() => setGeneralError('')}
                disabled={isSubmitting}
                title="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="send-approval-form">
          <div className="send-approval-content">
            
            {/* Recipient Email */}
            <div className="send-approval-field">
              <label>Send To *</label>
              <div className="send-approval-input-wrapper">
                <span className="send-approval-icon">📧</span>
                <input
                  type="email"
                  value={formData.sentTo}
                  onChange={(e) => handleInputChange('sentTo', e.target.value)}
                  className={errors.sentTo ? 'error' : ''}
                  placeholder="email@example.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.sentTo && <span className="error-message">{errors.sentTo}</span>}
            </div>

            {/* CC */}
            <div className="send-approval-field">
              <label>CC (Optional)</label>
              <div className="send-approval-input-wrapper">
                <span className="send-approval-icon">📋</span>
                <input
                  type="text"
                  value={formData.cc}
                  onChange={(e) => handleInputChange('cc', e.target.value)}
                  className={errors.cc ? 'error' : ''}
                  placeholder="cc1@example.com, cc2@example.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.cc && <span className="error-message">{errors.cc}</span>}
            </div>

            {/* BCC */}
            <div className="send-approval-field">
              <label>BCC (Optional)</label>
              <div className="send-approval-input-wrapper">
                <span className="send-approval-icon">👁️</span>
                <input
                  type="text"
                  value={formData.bcc}
                  onChange={(e) => handleInputChange('bcc', e.target.value)}
                  className={errors.bcc ? 'error' : ''}
                  placeholder="bcc1@example.com, bcc2@example.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.bcc && <span className="error-message">{errors.bcc}</span>}
            </div>

            {/* Email Subject */}
            <div className="send-approval-field">
              <label>Email Subject *</label>
              <div className="send-approval-input-wrapper">
                <span className="send-approval-icon">📝</span>
                <input
                  type="text"
                  value={formData.emailHeader}
                  onChange={(e) => handleInputChange('emailHeader', e.target.value)}
                  className={errors.emailHeader ? 'error' : ''}
                  placeholder={mode === 'client' ? 'Estimate from Zavza Seal LLC' : 'Estimate Approval Request'}
                  disabled={isSubmitting}
                />
              </div>
              {errors.emailHeader && <span className="error-message">{errors.emailHeader}</span>}
            </div>

            {/* Email Body */}
            <div className="send-approval-field">
              <label>Email Body *</label>
              <div className="send-approval-editor-container">
                <ReactQuill
                  theme="snow"
                  value={formData.emailBody}
                  onChange={(value) => handleInputChange('emailBody', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter your email message..."
                  readOnly={isSubmitting}
                  className={errors.emailBody ? 'error' : ''}
                />
              </div>
              {errors.emailBody && <span className="error-message">{errors.emailBody}</span>}
            </div>

            {/* Estimate Info */}
            {/* {estimate && (
              <div className="send-approval-estimate-info">
                <h4>Estimate Information</h4>
                <div className="send-approval-estimate-details">
                  <div className="send-approval-estimate-item">
                    <span className="label">Estimate #:</span>
                    <span className="value">E-000{estimate.id}</span>
                  </div>
                  <div className="send-approval-estimate-item">
                    <span className="label">Customer:</span>
                    <span className="value">{estimate.lead || 'N/A'}</span>
                  </div>
                  <div className="send-approval-estimate-item">
                    <span className="label">Issue Date:</span>
                    <span className="value">{estimate.issue_date ? new Date(estimate.issue_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )} */}

          </div>

          {/* Action Buttons */}
          <div className="send-approval-actions">
            <button 
              type="button" 
              className="send-approval-cancel" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="send-approval-send" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="send-approval-loading">⟳</span>
                  Sending...
                </>
              ) : (
                mode === 'client' ? '👤 Send to Client' : '📧 Send for Approval'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendApproval;
