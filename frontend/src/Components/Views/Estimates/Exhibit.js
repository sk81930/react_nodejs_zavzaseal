import React, { useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Exhibit.scss';

const Exhibit = ({ onClose, onSuccess, editExhibit = null, exhibits, setExhibits }) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(!!editExhibit);

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


  // Handle image upload for a specific exhibit
  const handleImageAdd = (exhibitId, files) => {
    setExhibits(prev => prev.map(exhibit => {
      if (exhibit.id === exhibitId) {
        const newImages = Array.from(files).map((file, index) => ({
          id: `new_${exhibitId}_${Date.now()}_${index}`,
          file: file,
          preview: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size,
          isExisting: false
        }));
        
        return {
          ...exhibit,
          images: [...exhibit.images, ...newImages]
        };
      }
      return exhibit;
    }));
  };

  // Handle image removal for a specific exhibit
  const handleImageRemove = (exhibitId, imageId) => {
    setExhibits(prev => prev.map(exhibit => {
      if (exhibit.id === exhibitId) {
        const imageToRemove = exhibit.images.find(img => img.id === imageId);
        if (imageToRemove) {
          // Only revoke URL for new images (not existing ones)
          if (!imageToRemove.isExisting && imageToRemove.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
          }
        }
        
        return {
          ...exhibit,
          images: exhibit.images.filter(img => img.id !== imageId)
        };
      }
      return exhibit;
    }));
  };

  const handleExhibitNameChange = useCallback((exhibitId, value) => {
    setExhibits(prev => prev.map(exhibit => {
      if (exhibit.id === exhibitId) {
        return {
          ...exhibit,
          name: value
        };
      }
      return exhibit;
    }));
  }, [setExhibits]);

  // Handle textarea content change
  const handleTextareaChange = useCallback((exhibitId, textareaId, content) => {
    setExhibits(prev => prev.map(exhibit => {
      if (exhibit.id === exhibitId) {
        return {
          ...exhibit,
          textareas: exhibit.textareas.map(textarea => 
            textarea.id === textareaId 
              ? { ...textarea, content }
              : textarea
          )
        };
      }
      return exhibit;
    }));
  }, []);

  // Add new textarea to a specific exhibit
  const addTextarea = (exhibitId) => {
    setExhibits(prev => prev.map(exhibit => {
      if (exhibit.id === exhibitId) {
        // Find the highest numeric ID from existing textareas
        const numericIds = exhibit.textareas
          .map(t => {
            const id = typeof t.id === 'string' ? parseInt(t.id) : t.id;
            return isNaN(id) ? 0 : id;
          })
          .filter(id => id > 0);
        
        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const newTextareaId = maxId + 1;
        
        return {
          ...exhibit,
          textareas: [...exhibit.textareas, { id: newTextareaId, content: '' }]
        };
      }
      return exhibit;
    }));
  };

  // Remove textarea from a specific exhibit
  const removeTextarea = (exhibitId, textareaId) => {
    setExhibits(prev => prev.map(exhibit => {
      if (exhibit.id === exhibitId) {
        return {
          ...exhibit,
          textareas: exhibit.textareas.filter(textarea => textarea.id !== textareaId)
        };
      }
      return exhibit;
    }));
  };

  // Validate exhibit
  const validateExhibit = (exhibit) => {
    return exhibit.images.length > 0 || exhibit.textareas.some(textarea => textarea.content.trim() !== '');
  };

  // Add new exhibit
  const addExhibit = () => {
    const maxId = exhibits.length > 0 ? Math.max(...exhibits.map(exhibit => exhibit.id)) : 0;
    const newId = maxId + 1;
    setExhibits(prev => [...prev, {
      id: newId,
      name: '',
      images: [],
      textareas: [{ id: 1, content: '' }],
      isValid: false
    }]);
  };

  // Remove exhibit
  const removeExhibit = (exhibitId) => {
    setExhibits(prev => {
      const exhibitToRemove = prev.find(exhibit => exhibit.id === exhibitId);
      if (exhibitToRemove && exhibitToRemove.images) {
        // Clean up object URLs to prevent memory leaks
        exhibitToRemove.images.forEach(image => {
          if (!image.isExisting && image.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });
      }
      return prev.filter(exhibit => exhibit.id !== exhibitId);
    });
  };


  // Cleanup images on unmount
  React.useEffect(() => {
    return () => {
      exhibits.forEach(exhibit => {
        if (exhibit.images) {
          exhibit.images.forEach(image => {
            // Only revoke URLs for new images (not existing ones)
            if (!image.isExisting && image.preview) {
              URL.revokeObjectURL(image.preview);
            }
          });
        }
      });
    };
  }, [exhibits]);

  return (
    <div className="exhibits-content">
      {/* Error message */}
      {errors.exhibits && (
        <div className="exhibit-error-message">
          <span className="error-icon">⚠️</span>
          <span>{errors.exhibits}</span>
        </div>
      )}

      {/* Exhibits Section */}
      <div className="exhibit-section">
        
        {exhibits.map((exhibit, index) => (
          <div key={exhibit.id} className="exhibit-item">
            <div className="exhibit-item-header">
              <div className="exhibit-header-left">
                <h4>Exhibit {String.fromCharCode(65 + index)}</h4>
                <input
                  type="text"
                  value={exhibit.name || ''}
                  onChange={(e) => handleExhibitNameChange(exhibit.id, e.target.value)}
                  placeholder="Enter exhibit name"
                  className="exhibit-name-input"
                />
              </div>
              <button
                type="button"
                className="exhibit-remove-btn"
                onClick={() => removeExhibit(exhibit.id)}
                disabled={exhibits.length === 1}
              >
                🗑️ Remove Exhibit
              </button>
            </div>

            <div className="exhibit-content">
              {/* Image Column */}
              <div className="exhibit-image-column">
                <label className="exhibit-column-label">Images</label>
                <div className="exhibit-image-upload">
                  <input
                    type="file"
                    id={`exhibit-images-${exhibit.id}`}
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageAdd(exhibit.id, e.target.files)}
                    className="exhibit-file-input"
                  />
                  <label htmlFor={`exhibit-images-${exhibit.id}`} className="exhibit-file-label">
                    <span className="exhibit-icon">📷</span>
                    Add Images
                  </label>
                </div>
                
                {exhibit.images.length > 0 && (
                  <div className="exhibit-image-preview">
                    {exhibit.images.map((image) => (
                      <div key={image.id} className="exhibit-image-item">
                        <img
                          src={image.preview || image.path}
                          alt={image.name}
                          className="exhibit-image"
                        />
                        <button
                          type="button"
                          className="exhibit-image-remove"
                          onClick={() => handleImageRemove(exhibit.id, image.id)}
                          title="Remove image"
                        >
                          ✕
                        </button>
                        <span className="exhibit-image-name">{image.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Textarea Column */}
              <div className="exhibit-textarea-column">
                <label className="exhibit-column-label">Text Areas</label>
                
                {exhibit.textareas.map((textarea, index) => (
                  <div key={textarea.id} className="exhibit-textarea-item">
                    <div className="exhibit-textarea-header">
                      <label>Text Area {index + 1}</label>
                      <button
                        type="button"
                        className="exhibit-textarea-remove"
                        onClick={() => removeTextarea(exhibit.id, textarea.id)}
                        disabled={exhibit.textareas.length === 1}
                        title="Remove text area"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="quill-editor-container">
                      <ReactQuill
                        theme="snow"
                        value={textarea.content}
                        onChange={(content) => handleTextareaChange(exhibit.id, textarea.id, content)}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Enter description..."
                        readOnly={false}
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="exhibit-add-textarea"
                  onClick={() => addTextarea(exhibit.id)}
                >
                  + Add Text Area
                </button>
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="exhibit-add-item" onClick={addExhibit}>
          + Add Exhibit
        </button>
      </div>
    </div>
  );
};

export default Exhibit;
