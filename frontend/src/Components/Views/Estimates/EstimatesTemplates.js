import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import agent from '../../../agent';
import './EstimatesTemplates.scss';

function EstimatesTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await agent.estimates.getEstimateTemplates();
      
      if (response && response.isSuccess && response.data && response.data.templates && Array.isArray(response.data.templates) && response.data.templates.length > 0) {
        setTemplates(response.data.templates);
      } else {
        setError('Failed to load templates');
        setTemplates([]);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (templateId) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      // Prepare data in API format
      const updatedTemplateData = {
        template_name: template.template_name,
        template_content: template.template_content,
        status: !template.status ? 1 : 0 // Convert boolean to status (1 = active, 0 = inactive)
      };

      const response = await agent.estimates.updateEstimateTemplate(templateId, updatedTemplateData);
      
      if (response && response.isSuccess) {
        setTemplates(prev => 
          prev.map(t => 
            t.id === templateId 
              ? { ...t, status: !t.status }
              : t
          )
        );
        setSuccessMsg('Template status updated successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setError('Failed to update template status');
      }
    } catch (err) {
      console.error('Error updating template:', err);
      setError('Failed to update template status');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await agent.estimates.deleteEstimateTemplate(templateId);
        
        if (response && response.isSuccess) {
          setTemplates(prev => prev.filter(template => template.id !== templateId));
          setSuccessMsg('Template deleted successfully!');
          setTimeout(() => setSuccessMsg(null), 3000);
        } else {
          setError('Failed to delete template');
        }
      } catch (err) {
        console.error('Error deleting template:', err);
        setError('Failed to delete template');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const handleRefresh = () => {
    fetchTemplates();
  };

  const handleViewTemplate = (template) => {
    // Open template in a modal or new window for viewing
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    newWindow.document.write(`
      <html>
        <head>
          <title>Template: ${template.template_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .template-header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
            .template-content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="template-header">
            <h1>${template.template_name}</h1>
          </div>
          <div class="template-content">
            ${template.template_content}
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  const handleEditTemplate = (templateId) => {
    navigate(`/estimates/templates/edit/${templateId}`);
  };

  if (loading) {
    return (
      <div className="templates-loading">
        <div className="spinner"></div>
        <span>Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="estimates-templates-container">
      {successMsg && <div className="success-message">{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="templates-header">
        <h3>Estimate Templates</h3>
        <div className="header-actions">
          <button 
            className="btn-refresh"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh Templates"
          >
            🔄 Refresh
          </button>
          <button 
            className="btn-create-template"
            onClick={() => navigate('/estimates/templates/create')}
          >
            + Create New Template
          </button>
        </div>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className={`template-card ${template.isActive ? 'active' : 'inactive'}`}>
            <div className="template-card-header">
              <h4>{template.template_name}</h4>
              <div className="template-status">
                <span className={`status-badge ${template.status ? 'active' : 'inactive'}`}>
                  {template.status ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
              <div className="template-card-body">
                <div 
                  className="template-content"
                  dangerouslySetInnerHTML={{ __html: template.template_content }}
                />
              </div>
            
            <div className="template-card-actions">
              <button 
                className="btn-view"
                onClick={() => handleViewTemplate(template)}
                title="View Template"
              >
                👁️ View
              </button>
              <button 
                className="btn-edit"
                onClick={() => handleEditTemplate(template.id)}
                title="Edit Template"
              >
                ✏️ Edit
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteTemplate(template.id)}
                title="Delete Template"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="no-templates">
          <div className="no-templates-icon">📄</div>
          <h4>No Templates Found</h4>
          <p>Create your first estimate template to get started.</p>
          <button 
            className="btn-create-template"
            onClick={() => navigate('/estimates/templates/create')}
          >
            + Create New Template
          </button>
        </div>
      )}
    </div>
  );
}

export default EstimatesTemplates;
