import React, { useEffect, useState } from 'react';
import agent from '../../../agent';
import './leadContent.scss';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';

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
    return <span className="lead-content-empty">field is empty</span>;
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



  if(fieldKey === "source_name"){
   // console.log(options);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <div className="lead-content-field-edit">
        <div className="lead-content-label">{label}</div>
        <div className="lead-content-edit-controls">
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
                className="lead-content-edit-select"
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
                className="lead-content-edit-select"
              >
                <option value="">Select...</option>
                {(()=>{
                  if(fieldKey === "SOURCE_ID"){
                    return options.map((option) => (
                      <option key={option.id} value={option.STATUS_ID}>
                        {option.NAME}
                      </option>
                    ))
                  }
                  return options.map((option) => (
                    <option key={option.ID || option.value} value={option.ID || option.value}>
                      {option.VALUE || option.label}
                    </option>
                  ))
                })()}
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
              className="lead-content-edit-textarea"
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
              className="lead-content-edit-input"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lead-content-field">
      <div className="lead-content-label">{label}</div>
      <div className="lead-content-value">
        {getField(value)}
      </div>
    </div>
  );
};

// Editable Multi-Select Field Component
const EditableMultiSelectField = ({ 
  label, 
  value, 
  fieldKey, 
  options = [], 
  onSave, 
  isEditing, 
  onEditToggle,
  notEditable = false,
  boxEditing = false
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Convert options to react-select format
  const selectOptions = options.map(option => ({
    value: option.ID || option.value,
    label: option.VALUE || option.label
  }));

  // Update selectedOptions when value prop changes
  useEffect(() => {
    if (value) {
      // Handle both single value and array of values
      const idsArray = Array.isArray(value) ? value : [value];
      const selected = selectOptions.filter(option => 
        idsArray.some(id => String(option.value) === String(id))
      );
      setSelectedOptions(selected);
    } else {
      setSelectedOptions([]);
    }
  }, [value, options]);

  const handleChange = (selected) => {
    setSelectedOptions(selected || []);
    if (boxEditing) {
      const selectedValues = selected ? selected.map(option => option.value) : [];
      onSave(fieldKey, selectedValues);
    }
  };

  if (isEditing) {
    return (
      <div className="lead-content-field-edit">
        <div className="lead-content-label">{label}</div>
        <div className="lead-content-edit-controls">
          <Select
            isMulti
            value={selectedOptions}
            onChange={handleChange}
            options={selectOptions}
            className="lead-content-edit-multiselect"
            classNamePrefix="select"
            placeholder="Select options..."
            isClearable={true}
            isSearchable={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="lead-content-field">
      <div className="lead-content-label">{label}</div>
      <div className="lead-content-value">
        {selectedOptions.length > 0 ? (
          selectedOptions.map(option => option.label).join(', ')
        ) : (
          <span className="lead-content-empty">field is empty</span>
        )}
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
    <div className="lead-content-box">
      <div className="lead-content-box-header">
        {title && <div className="lead-content-section-title">{title}</div>}
        <div className="lead-content-box-actions">
          {isEditing ? (
            <>
              <button 
                onClick={onSaveAll} 
                disabled={isSaving}
                className="lead-content-box-save"
              >
                {isSaving ? 'Saving...' : `Save${pendingChangesCount > 0 ? ` (${pendingChangesCount})` : ''}`}
              </button>
              <button 
                onClick={() => onEditToggle(false)}
                className="lead-content-box-cancel"
              >
                Cancel
              </button>
            </>
          ) : (
            editingBox !== "source" && editingBox !== "form" && editingBox !== "estimator" && editingBox !== "title" ? (
            <button 
              onClick={() => onEditToggle(true)}
              className="lead-content-box-edit"
            >
              ✏️ Edit
            </button>
            ) : (
              <></>
            )
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

// Editable Phone List Component
const PHONE_TYPES = [
  { value: 'WORK', label: 'Work Phone' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'FAX', label: 'Fax' },
  { value: 'HOME', label: 'Home' },
  { value: 'PAGER', label: 'Pager' },
  { value: 'MAILING', label: 'SMS Marketing' },
  { value: 'OTHER', label: 'Other' },
];

function parseCountryCodeAndNumber(value) {
  if (!value) return { code: '', number: '' };
  const match = value.match(/^(\+\d+)(.*)$/);
  if (match) {
    return { code: match[1], number: match[2].replace(/^[\s-]*/, '') };
  }
  return { code: '', number: value };
}

const EditablePhoneList = ({ value = [], onChange, fields }) => {

  console.log(fields);
  console.log(value);

  const [phoneTypes, setPhoneTypes] = useState(null);
  const [phones, setPhones] = useState(
    value.length > 0
      ? value.map((p) => ({
          ...p,
          number: p.VALUE || '',
          type: p.VALUE_TYPE || 'WORK',
        }))
      : [
          { number: '', type: 'WORK' },
        ]
  );

  useEffect(() => {
    // Convert current phones to the format expected by API
    const currentPhones = phones.map((p) => {
      // Ensure phone number has plus sign when sending to API
      const phoneValue = p.number || '';
      const formattedPhone = phoneValue.startsWith('+') ? phoneValue : `+${phoneValue}`;
      
      return {
        VALUE: formattedPhone,
        VALUE_TYPE: p.type,
      };
    });

    // Convert original value to same format for comparison
    const originalPhones = value.map((p) => ({
      VALUE: p.VALUE || '',
      VALUE_TYPE: p.VALUE_TYPE || 'WORK',
    }));

    // Only call onChange if there are actual changes
    const hasChanges = JSON.stringify(currentPhones) !== JSON.stringify(originalPhones);
    
    if (hasChanges) {
      onChange(currentPhones);
    }
    // eslint-disable-next-line
  }, [phones]);

  const handleChange = (idx, field, val) => {
    setPhones((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    );
  };

  const handleAdd = () => {
    setPhones((prev) => [...prev, { number: '', type: 'WORK' }]);
  };

  const handleRemove = (idx) => {
    setPhones((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ marginBottom: 8 }}>
      {phones.map((p, idx) => (
        <div className="lead-content-phone-item" key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 15, gap: "16px" }}>
          <div style={{ width: "30%" }}>
            <PhoneInput
              country={'us'}
              value={p.number}
              onChange={phone => handleChange(idx, 'number', phone)}
              style={{ width: "100%" }}
            />
          </div>
          {/* Type dropdown */}
          <div style={{ width: "40%", display: "flex", alignItems: "center", gap: "16px" }}>
          <select
            value={p.type}
            onChange={(e) => handleChange(idx, 'type', e.target.value)}
            className="lead-content-phone-type"
          >
            {PHONE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          
          {/* Remove button */}
          {phones.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              style={{ color: '#c00', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
              title="Remove"
            >
              ×
            </button>
          )}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        style={{ color: '#007bff', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', marginTop: 2 }}
      >
        Add
      </button>
    </div>
  );
};

const LeadContent = ({ leadId }) => {
  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingBox, setEditingBox] = useState(null);
  const [savingField, setSavingField] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  function getLeadById( leadId ){
      setLoading(true);
      setError(null);
      agent.Website.getLeadById(leadId)
        .then((response) => {
          if (response && response.isSuccess && response.data) {
            setLeadData(response.data);
          } else {
            setError('No data found');
          }
        })
        .catch((err) => {
          setError(err.message || 'Error fetching lead data');
        })
        .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (leadId) {
      getLeadById(leadId);
    }
  }, [leadId]);

  const handleFieldChange = (fieldKey, newValue) => {
    // Simple: just store the change in pendingChanges
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
      // Update the local state first for immediate UI feedback
      const updatedData = { ...leadData };

      const org_lead_id = leadData.lead_id;

      
      
      // Make API call to save all changes at once
      const response = await agent.Website.updateLeadFields(org_lead_id, pendingChanges);
      
      if (!response || !response.isSuccess) {
        throw new Error(response?.message || 'Failed to save changes');
      }
      
      //console.log('Saving all changes:', actualFields);
      
      setSaveMessage({ type: 'success', text: 'All changes saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
      
      setEditingBox(null);
      setPendingChanges({});
      getLeadById(leadId);
      
    } catch (error) {
      console.error('Error saving changes:', error);
      // Revert the local state change on error
      setLeadData(leadData);
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save changes' });
      
      // Clear message after 5 seconds
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 5000);
    } finally {
      setSavingField(false);
    }
  };

  if (loading) return (
    <div className="lead-content-loading">
      <div className="spinner"></div>
      <div className="lead-content-loading-text">Loading lead details...</div>
    </div>
  );
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!leadData || !leadData.lead_json_data) return (
    <div className="lead-content-no-data">
      <div className="lead-content-no-data-icon">🗂️</div>
      <div className="lead-content-no-data-title">No Lead Data</div>
      <div className="lead-content-no-data-desc">We couldn't find any details for this lead. Please check again later or contact support if you believe this is an error.</div>
    </div>
  );

  const d = leadData.lead_json_data;
 

  return (
    <div className="lead-content-main">
      <div className="lead-content-title-section">
        {editingBox === "title" ? (
          <div className="lead-content-title-edit">
            <input
              type="text"
              value={pendingChanges.TITLE !== undefined ? pendingChanges.TITLE : (d.TITLE || '')}
              onChange={(e) => handleFieldChange('TITLE', e.target.value)}
              className="lead-content-title-input"
              placeholder="Enter lead title..."
            />
            <div className="lead-content-title-actions">
              <button 
                onClick={handleSaveAll} 
                disabled={savingField}
                className="lead-content-box-save"
              >
                {savingField ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={() => handleBoxEditToggle("title", false)}
                className="lead-content-box-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="lead-content-title-display">
            <h2 className="lead-content-title">
              {pendingChanges.TITLE !== undefined ? pendingChanges.TITLE : (d.TITLE || 'Lead Details')}
            </h2>
            <button 
              onClick={() => handleBoxEditToggle("title", true)}
              className="lead-content-title-edit-btn"
              title="Edit title"
            >
              ✏️
            </button>
          </div>
        )}
      </div>
      
      {/* Save Message */}
      {saveMessage.text && (
        <div className={`lead-content-message lead-content-message-${saveMessage.type}`}>
          {saveMessage.text}
        </div>
      )}
      
      
      {/* SOURCE AND COST */}
      <EditableBox
        title="SOURCE AND COST"
        isEditing={editingBox === "source"}
        onEditToggle={(isEditing) => handleBoxEditToggle("source", isEditing)}
        onSaveAll={handleSaveAll}
        isSaving={savingField}
        pendingChangesCount={Object.keys(pendingChanges).length}
        editingBox={editingBox}
        
      >
        {(d.SOURCE_ID && d.SOURCE_ID !== "") || (editingBox === "source") ? (
          <>
            <EditableField
              label="Source"
              value={(() => {
                const selectedId = d.SOURCE_ID;
                
                if (leadData.sources && Array.isArray(leadData.sources) && selectedId) {
                  const found = leadData.sources.find(item => String(item.STATUS_ID) === String(selectedId));
                  if(editingBox === "source"){ 
                    return found ? found.STATUS_ID : "";
                  }
                  return found ? found.NAME : "";
                }
                return "";
              })()}
              fieldKey="SOURCE_ID"
              fieldType="select"
              isEditing={editingBox === "source"}
              options={leadData.sources || []}
              onSave={handleFieldChange}
              boxEditing={editingBox === "source"}
            />
          </>
        ) : (
          <></>
        )}
        <EditableField
          label="Full Name"
          value={`${leadData.NAME || ''} ${leadData.LAST_NAME || ''}`.trim()}
          fieldKey="NAME"
          fieldType="text"
          isEditing={editingBox === "source"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "source"}
        />
        {/* <EditableField
          label="Lead Type"
          value={leadData.type || ""}
          fieldKey="type"
          fieldType="text"
          notEditable={true}
          boxEditing={editingBox === "source"}
        /> */}
        
        <EditableField
          label="Lead Date"
          value={(() => {
            if (!d.UF_CRM_1672141384) return "";
            // For display: format as MM/DD/YYYY
            if (editingBox !== "source") {
              const dateParts = d.UF_CRM_1672141384.split('T')[0].split('-');
              const pad = n => n < 10 ? '0' + n : n;
              return `${pad(parseInt(dateParts[1]))}/${pad(parseInt(dateParts[2]))}/${dateParts[0]}`;
            }
            // For editing: use YYYY-MM-DD format for date input
            return d.UF_CRM_1672141384.split('T')[0];
          })()}
          fieldKey="UF_CRM_1672141384"
          fieldType="date"
          isEditing={editingBox === "source"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "source"}
        />
      </EditableBox>

      {/* FORM SUBMISSION DETAILS */}
      <EditableBox
        title="FORM SUBMISSION DETAILS"
        isEditing={editingBox === "form"}
        onEditToggle={(isEditing) => handleBoxEditToggle("form", isEditing)}
        onSaveAll={handleSaveAll}
        isSaving={savingField}
        pendingChangesCount={Object.keys(pendingChanges).length}
        editingBox={editingBox}
      >
        <EditableField
          label="Referrer domain"
          value={d.UF_CRM_1709039182 || d.website_domain || ""}
          fieldKey="UF_CRM_1709039182"
          fieldType="text"
          isEditing={editingBox === "form"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "form"}
        />
        
        <EditableField
          label="Page of form submission"
          value={d.UF_CRM_1709039197 || d.website || ""}
          fieldKey="UF_CRM_1709039197"
          fieldType="text"
          isEditing={editingBox === "form"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "form"}
        />
        
        <EditableField
          label="Previous page URL"
          value={d.UF_CRM_1709039208 || ""}
          fieldKey="UF_CRM_1709039208"
          fieldType="text"
          isEditing={editingBox === "form"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "form"}
        />
        
        <EditableField
          label="IP Address"
          value={d.UF_CRM_1709039219 || ""}
          fieldKey="UF_CRM_1709039219"
          fieldType="text"
          isEditing={editingBox === "form"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "form"}
        />
        
        <EditableField
          label="Address"
          value={d.ADDRESS || ""}
          fieldKey="ADDRESS"
          fieldType="text"
          isEditing={editingBox === "form"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "form"}
        />
        
        <EditableField
          label="City"
          value={d.UF_CRM_1631295564 || ""}
          fieldKey="UF_CRM_1631295564"
          fieldType="text"
          isEditing={editingBox === "form"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "form"}
        />
        
        <EditableField
          label="State"
          value={d.UF_CRM_1631295727 || ""}
          fieldKey="UF_CRM_1631295727"
          fieldType="text"
          isEditing={editingBox === "form"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "form"}
        />
        
        <EditableField
          label="ZIP Code"
          value={d.UF_CRM_1631295577 || ""}
          fieldKey="UF_CRM_1631295577"
          fieldType="text"
          isEditing={editingBox === "form"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "form"}
        />
        {/* Phone section: editable or read-only */}
        <div className="lead-content-field">
          <div className="lead-content-label">Phone</div>
          {editingBox === "form" ? (
            <EditablePhoneList
              value={Array.isArray(d.PHONE) ? d.PHONE : []}
              onChange={(phones) => handleFieldChange('PHONE', phones)}
              fields={leadData.fields.PHONE}
            />
          ) : (
            Array.isArray(d.PHONE) && d.PHONE.length > 0 && (
              d.PHONE.map((phone, idx) => {
                // Add plus to phone number if it doesn't exist
                const phoneValue = phone.VALUE || '';
                const formattedPhone = phoneValue.startsWith('+') ? phoneValue : `+${phoneValue}`;
                
                return (
                  <div key={phone.ID || idx} className="lead-content-value">
                    <a href={`tel:${formattedPhone}`} className="lead-content-phone-link">{getField(formattedPhone)}</a>
                    {phone.VALUE_TYPE && (
                      <span style={{color:'#bbb', fontSize:'0.9em', marginLeft:8}}>
                        {phone.VALUE_TYPE.charAt(0).toUpperCase() + phone.VALUE_TYPE.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
        <EditableField
          label="Comments"
          value={leadData.COMMENTS || ""}
          fieldKey="COMMENTS"
          fieldType="textarea"
          isEditing={editingBox === "form"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "form"}
        />
      </EditableBox>

      {/* ESTIMATOR */}
      <EditableBox
        title="ESTIMATOR"
        isEditing={editingBox === "estimator"}
        onEditToggle={(isEditing) => handleBoxEditToggle("estimator", isEditing)}
        onSaveAll={handleSaveAll}
        isSaving={savingField}
        pendingChangesCount={Object.keys(pendingChanges).length}
        editingBox={editingBox}
      >
        <EditableField
          label="Estimator"
          value={(() => {
            const field = leadData.fields && leadData.fields.UF_CRM_1671573088;
            const selectedId = d.UF_CRM_1671573088;
            if (field && Array.isArray(field.items) && selectedId) {
              const found = field.items.find(item => String(item.ID) === String(selectedId));
              if(editingBox === "source" || editingBox === "estimator" || editingBox === "form" ){ 
                return found ? found.ID : "";
              }
              return found ? found.VALUE : "";
            }
            return "";
          })()}
          fieldKey="UF_CRM_1671573088"
          fieldType="select"
          options={leadData.fields?.UF_CRM_1671573088?.items || []}
          isEditing={editingBox === "estimator"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "estimator"}
        />
        
        <EditableField
          label="Appointment Date/Time"
          value={d['UF_CRM_1671573599'] ? (() => {
            const val = d['UF_CRM_1671573599'];
            const date = new Date(val);
            if (!isNaN(date.getTime())) {
              if (editingBox === "estimator") {
                // For editing: format as YYYY-MM-DDTHH:mm for datetime-local input
                const pad = n => n < 10 ? '0' + n : n;
                return date.getFullYear() + '-' + 
                       pad(date.getMonth() + 1) + '-' + 
                       pad(date.getDate()) + 'T' + 
                       pad(date.getHours()) + ':' + 
                       pad(date.getMinutes());
              } else {
                // For display: format as MM/DD/YYYY HH:MM:SS AM/PM
                const pad = n => n < 10 ? '0' + n : n;
                let hours = date.getHours();
                const ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12;
                const formatted =
                  pad(date.getMonth() + 1) + '/' +
                  pad(date.getDate()) + '/' +
                  date.getFullYear() + ' ' +
                  pad(hours) + ':' +
                  pad(date.getMinutes()) + ':' +
                  pad(date.getSeconds()) + ' ' +
                  ampm + '';
                return formatted;
              }
            }
            return val;
          })() : ""}
          fieldKey="UF_CRM_1671573599"
          fieldType="datetime-local"
          isEditing={editingBox === "estimator"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "estimator"}
        />
        
        <EditableField
          label="Project description"
          value={(() => {
            const field = leadData.fields && leadData.fields.UF_CRM_1672946127;
            const selectedId = d.UF_CRM_1672946127;
            if (field && Array.isArray(field.items) && selectedId) {
              const found = field.items.find(item => String(item.ID) === String(selectedId));
              if(editingBox === "source" || editingBox === "estimator" || editingBox === "form" ){ 
                return found ? found.ID : "";
              }
              return found ? found.VALUE : "";
              //return found ? found.VALUE : "";
            }
            return "";
          })()}
          fieldKey="UF_CRM_1672946127"
          fieldType="select"
          options={leadData.fields?.UF_CRM_1672946127?.items || []}
          isEditing={editingBox === "estimator"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "estimator"}
        />
        
        <EditableField
          label="Other Project description"
          value={d['UF_CRM_1693388917'] || ""}
          fieldKey="UF_CRM_1693388917"
          fieldType="textarea"
          isEditing={editingBox === "estimator"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "estimator"}
        />
        
        <EditableMultiSelectField
          label="Financial program (NG/PP/HRT)"
          value={d.UF_CRM_1682351561}
          fieldKey="UF_CRM_1682351561"
          options={leadData.fields?.UF_CRM_1682351561?.items || []}
          isEditing={editingBox === "estimator"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "estimator"}
        />
        
        <EditableField
          label="New text"
          value={d['UF_CRM_LEAD_1708612888272'] || ""}
          fieldKey="UF_CRM_LEAD_1708612888272"
          fieldType="textarea"
          isEditing={editingBox === "estimator"}
          onSave={handleFieldChange}
          boxEditing={editingBox === "estimator"}
        />
      </EditableBox>
    </div>
  );
};

export default LeadContent; 