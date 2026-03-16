import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import agent from '../../../agent';
import './CreateTemplatePage.scss';

function CreateTemplatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Fetch template data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchTemplateData();
    }
  }, [isEditMode, id]);

  const fetchTemplateData = async () => {
    setInitialLoading(true);
    setError(null);
    
    try {

      const response = await agent.estimates.getTemplateById(id);
      
      
      if (response && response.isSuccess && response.data && response.data.template && response.data.template.id) {
        const template = response.data.template;
        setTemplateName(template.template_name || '');
        setTemplateContent(template.template_content || '');
      } else {
        setError('Failed to load template data');
        navigate('/estimates/templates');
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError('Failed to load template data');
      navigate('/estimates/templates');
    } finally {
      setInitialLoading(false);
    }
  };

  // Quill editor configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video'
  ];

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    if (!templateContent.trim()) {
      setError('Template content is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare template data for API in the correct format
      const templateData = {
        template_name: templateName.trim(),
        template_content: templateContent,
        status: 1 // 1 = active, 0 = inactive
      };

      let response;
      
      if (isEditMode) {
        // Update existing template
        response = await agent.estimates.updateEstimateTemplate(id, templateData);
        console.log('Template update response:', response);
      } else {
        // Create new template
        response = await agent.estimates.createEstimateTemplate(templateData);
        console.log('Template creation response:', response);
      }

      if (response && response.isSuccess) {
        setSuccessMsg(isEditMode ? 'Template updated successfully!' : 'Template created successfully!');
        setTimeout(() => {
          navigate('/estimates/templates');
        }, 2000);
      } else {
        setError(response?.message || `Failed to ${isEditMode ? 'update' : 'create'} template. Please try again.`);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} template:`, err);

      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else if (err.message) {
        // Handle the specific case where err.message is an object with nested message
        if (typeof err.message === 'object' && err.message.message) {
          if (err.message.message.includes('duplicate key value violates unique constraint')) {
            setError('A template with this name already exists. Please choose a different name.');
          } else {
            setError(err.message.message);
          }
        } else if (typeof err.message === 'string' && err.message.includes('duplicate key value violates unique constraint')) {
          setError('A template with this name already exists. Please choose a different name.');
        } else {
          setError(err.message);
        }
      } else {
        setError(`Failed to ${isEditMode ? 'update' : 'create'} template. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/estimates/templates');
  };

  if (initialLoading) {
    return (
      <div className="create-template-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading template...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="create-template-container">
      <div className="create-template-header">
        <h2>{isEditMode ? 'Edit Template' : 'Create New Template'}</h2>
        <div className="header-actions">
          <button 
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn-save"
            onClick={handleSaveTemplate}
            disabled={loading || !templateName.trim() || !templateContent.trim()}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Template' : 'Save Template')}
          </button>
        </div>
      </div>

      {successMsg && <div className="success-message">{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="create-template-form">
        <div className="form-group">
          <label htmlFor="templateName">Template Name *</label>
          <input
            type="text"
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
            className="form-control"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="templateContent">Template Content *</label>
          <div className="quill-editor-container">
            <ReactQuill
              theme="snow"
              value={templateContent}
              onChange={setTemplateContent}
              modules={modules}
              formats={formats}
              placeholder="Enter your template content here..."
              readOnly={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Preview</label>
          <div className="content-preview">
            <div 
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: templateContent || '<p>Preview will appear here...</p>' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTemplatePage;
