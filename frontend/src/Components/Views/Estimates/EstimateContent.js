import React, { useEffect, useState } from 'react';
import agent from '../../../agent';
import './EstimateContent.scss';

const boxStyle = {
  background: '#f7fafd',
  borderRadius: '12px',
  padding: '1.5rem 1rem',
  marginBottom: '1.5rem',
  boxShadow: '0 2px 12px rgba(40, 168, 226, 0.08)',
};

const sectionTitle = {
  fontWeight: 600,
  fontSize: '1rem',
  marginBottom: '1rem',
  color: '#555',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

const labelStyle = { fontWeight: 500, color: '#888', fontSize: '0.97em', marginBottom: 2 };
const valueStyle = { fontWeight: 400, color: '#222', fontSize: '1.05em', marginBottom: 8 };
const emptyStyle = { color: '#bbb', fontStyle: 'italic' };

const formatDate = (dateString) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Remove time for comparison
  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

function getField(val) {
  if (val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
    return <span className="estimate-content-empty">field is empty</span>;
  }
  return val;
}

// Editable Field Component
const EditableField = ({ 
  label, 
  value, 
  fieldKey, 
  fieldType = 'text', 
  options = [], 
  onSave, 
  isEditing, 
  onEditToggle,
  notEditable = false,
  boxEditing = false,
  isMultiSelect = false
}) => {
  const [editValue, setEditValue] = useState(value);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <div className="estimate-content-field-edit">
        <div className="estimate-content-label">{label}</div>
        <div className="estimate-content-edit-controls">
          {fieldType === 'select' ? (
            isMultiSelect ? (
              <select
                multiple
                value={Array.isArray(editValue) ? editValue : []}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setEditValue(selectedOptions);
                  if (boxEditing) {
                    onSave(fieldKey, selectedOptions);
                  }
                }}
                onKeyDown={handleKeyPress}
                className="estimate-content-edit-select"
                style={{ minHeight: '100px' }}
              >
                {options.map((option) => (
                  <option key={option.ID || option.value} value={option.ID || option.value}>
                    {option.VALUE || option.label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={editValue || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setEditValue(newValue);
                  if (boxEditing) {
                    onSave(fieldKey, newValue);
                  }
                }}
                onKeyDown={handleKeyPress}
                className="estimate-content-edit-select"
              >
                <option value="">Select...</option>
                {options.map((option) => (
                  <option key={option.ID || option.value} value={option.ID || option.value}>
                    {option.VALUE || option.label}
                  </option>
                ))}
              </select>
            )
          ) : fieldType === 'textarea' ? (
            <textarea
              value={editValue || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setEditValue(newValue);
                if (boxEditing) {
                  onSave(fieldKey, newValue);
                }
              }}
              onKeyDown={handleKeyPress}
              className="estimate-content-edit-textarea"
              rows={3}
            />
          ) : (
            <input
              type={fieldType}
              value={editValue || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setEditValue(newValue);
                if (boxEditing) {
                  onSave(fieldKey, newValue);
                }
              }}
              onKeyDown={handleKeyPress}
              className="estimate-content-edit-input"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="estimate-content-field">
      <div className="estimate-content-label">{label}</div>
      <div className="estimate-content-value">
        {getField(value)}
      </div>
    </div>
  );
};

// Editable Box Component
const EditableBox = ({ 
  title, 
  children, 
  isEditing, 
  onEditToggle, 
  onSaveAll, 
  isSaving = false,
  pendingChangesCount = 0,
  editingBox = null
}) => {
  return (
    <div className="estimate-content-box">
      <div className="estimate-content-box-header">
        {title && <div className="estimate-content-section-title">{title}</div>}
        <div className="estimate-content-box-actions">
          {isEditing ? (
            <>
              <button 
                onClick={onSaveAll} 
                disabled={isSaving}
                className="estimate-content-box-save"
              >
                {isSaving ? 'Saving...' : `Save${pendingChangesCount > 0 ? ` (${pendingChangesCount})` : ''}`}
              </button>
              <button 
                onClick={() => onEditToggle(false)}
                className="estimate-content-box-cancel"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={() => onEditToggle(true)}
              className="estimate-content-box-edit"
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

const EstimateContent = ({ estimateId }) => {
  const [estimateData, setEstimateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingBox, setEditingBox] = useState(null);
  const [savingField, setSavingField] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  function getEstimateById(estimateId) {
    setLoading(true);
    setError(null);
    // Mock API call - replace with actual API endpoint
    agent.Website.getEstimateById(estimateId)
      .then((response) => {
        if (response && response.isSuccess && response.data) {
          setEstimateData(response.data);
        } else {
          setError('No data found');
        }
      })
      .catch((err) => {
        setError(err.message || 'Error fetching estimate data');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (estimateId) {
      getEstimateById(estimateId);
    }
  }, [estimateId]);

  const handleFieldChange = (fieldKey, newValue) => {
    setPendingChanges(prev => ({
      ...prev,
      [fieldKey]: newValue
    }));
  };

  const handleBoxEditToggle = (boxKey, isEditing) => {
    if (isEditing) {
      setEditingBox(boxKey);
      setPendingChanges({});
    } else {
      setEditingBox(null);
      setPendingChanges({});
    }
  };

  const handleSaveAll = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      setEditingBox(null);
      return;
    }

    setSavingField(true);
    try {
      // Mock API call - replace with actual API endpoint
      const response = await agent.Website.updateEstimateFields(estimateId, pendingChanges);
      
      if (!response || !response.isSuccess) {
        throw new Error(response?.message || 'Failed to save changes');
      }
      
      setSaveMessage({ type: 'success', text: 'All changes saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
      
      setEditingBox(null);
      setPendingChanges({});
      getEstimateById(estimateId);
      
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save changes' });
      
      // Clear message after 5 seconds
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 5000);
    } finally {
      setSavingField(false);
    }
  };

  if (loading) return (
    <div className="estimate-content-loading">
      <div className="spinner"></div>
      <div className="estimate-content-loading-text">Loading estimate details...</div>
    </div>
  );
  
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  
  if (!estimateData) return (
    <div className="estimate-content-no-data">
      <div className="estimate-content-no-data-icon">📄</div>
      <div className="estimate-content-no-data-title">No Estimate Data</div>
      <div className="estimate-content-no-data-desc">We couldn't find any details for this estimate. Please check again later or contact support if you believe this is an error.</div>
    </div>
  );

  return (
    <div className="estimate-content-main">
      <div className="estimate-content-title-section">
        <h2 className="estimate-content-title">
          {estimateData.ESTIMATE_NUMBER || 'Estimate Details'}
        </h2>
      </div>
      
      {/* Save Message */}
      {saveMessage.text && (
        <div className={`estimate-content-message estimate-content-message-${saveMessage.type}`}>
          {saveMessage.text}
        </div>
      )}
      
      {/* CUSTOMER INFORMATION */}
      <EditableBox
        title="CUSTOMER INFORMATION"
        isEditing={editingBox === "customer"}
        onEditToggle={(isEditing) => handleBoxEditToggle("customer", isEditing)}
        onSaveAll={handleSaveAll}
        isSaving={savingField}
        pendingChangesCount={Object.keys(pendingChanges).length}
        editingBox={editingBox}
      >
        <EditableField
          label="Customer Name"
          value={`${estimateData.CUSTOMER_NAME || ''} ${estimateData.CUSTOMER_LAST_NAME || ''}`.trim()}
          fieldKey="CUSTOMER_NAME"
          fieldType="text"
          isEditing={editingBox === "customer"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "customer"}
        />
        <EditableField
          label="Email"
          value={estimateData.CUSTOMER_EMAIL || ""}
          fieldKey="CUSTOMER_EMAIL"
          fieldType="email"
          isEditing={editingBox === "customer"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "customer"}
        />
        <EditableField
          label="Phone"
          value={estimateData.CUSTOMER_PHONE || ""}
          fieldKey="CUSTOMER_PHONE"
          fieldType="tel"
          isEditing={editingBox === "customer"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "customer"}
        />
        <EditableField
          label="Address"
          value={estimateData.CUSTOMER_ADDRESS || ""}
          fieldKey="CUSTOMER_ADDRESS"
          fieldType="textarea"
          isEditing={editingBox === "customer"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "customer"}
        />
      </EditableBox>

      {/* ESTIMATE DETAILS */}
      <EditableBox
        title="ESTIMATE DETAILS"
        isEditing={editingBox === "details"}
        onEditToggle={(isEditing) => handleBoxEditToggle("details", isEditing)}
        onSaveAll={handleSaveAll}
        isSaving={savingField}
        pendingChangesCount={Object.keys(pendingChanges).length}
        editingBox={editingBox}
      >
        <EditableField
          label="Estimate Number"
          value={estimateData.ESTIMATE_NUMBER || ""}
          fieldKey="ESTIMATE_NUMBER"
          fieldType="text"
          isEditing={editingBox === "details"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "details"}
        />
        <EditableField
          label="Status"
          value={estimateData.STATUS || ""}
          fieldKey="STATUS"
          fieldType="select"
          options={estimateData.statusOptions || []}
          isEditing={editingBox === "details"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "details"}
        />
        <EditableField
          label="Total Amount"
          value={estimateData.TOTAL_AMOUNT ? `$${parseFloat(estimateData.TOTAL_AMOUNT).toFixed(2)}` : ""}
          fieldKey="TOTAL_AMOUNT"
          fieldType="number"
          isEditing={editingBox === "details"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "details"}
        />
        <EditableField
          label="Valid Until"
          value={estimateData.VALID_UNTIL ? formatDate(estimateData.VALID_UNTIL) : ""}
          fieldKey="VALID_UNTIL"
          fieldType="date"
          isEditing={editingBox === "details"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "details"}
        />
        <EditableField
          label="Project Description"
          value={estimateData.PROJECT_DESCRIPTION || ""}
          fieldKey="PROJECT_DESCRIPTION"
          fieldType="textarea"
          isEditing={editingBox === "details"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "details"}
        />
        <EditableField
          label="Notes"
          value={estimateData.NOTES || ""}
          fieldKey="NOTES"
          fieldType="textarea"
          isEditing={editingBox === "details"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "details"}
        />
      </EditableBox>

      {/* ESTIMATOR INFORMATION */}
      <EditableBox
        title="ESTIMATOR INFORMATION"
        isEditing={editingBox === "estimator"}
        onEditToggle={(isEditing) => handleBoxEditToggle("estimator", isEditing)}
        onSaveAll={handleSaveAll}
        isSaving={savingField}
        pendingChangesCount={Object.keys(pendingChanges).length}
        editingBox={editingBox}
      >
        <EditableField
          label="Estimator"
          value={estimateData.ESTIMATOR_NAME || ""}
          fieldKey="ESTIMATOR_ID"
          fieldType="select"
          options={estimateData.estimatorOptions || []}
          isEditing={editingBox === "estimator"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "estimator"}
        />
        <EditableField
          label="Created Date"
          value={estimateData.DATE_CREATE ? formatDate(estimateData.DATE_CREATE) : ""}
          fieldKey="DATE_CREATE"
          fieldType="date"
          isEditing={editingBox === "estimator"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "estimator"}
        />
      </EditableBox>
    </div>
  );
};

export default EstimateContent;
