import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreateEstimate.scss';
import agent from '../../../agent';
import SendApproval from './SendApproval';
import Exhibit from './Exhibit';

const List = Quill.import('formats/list');
const Inline = Quill.import('blots/inline');

// All supported list styles
const LIST_STYLES = {
  'decimal': { type: 'ordered', style: 'decimal' },
  'lower-alpha': { type: 'ordered', style: 'lower-alpha' },
  'upper-alpha': { type: 'ordered', style: 'upper-alpha' },
  'lower-roman': { type: 'ordered', style: 'lower-roman' },
  'upper-roman': { type: 'ordered', style: 'upper-roman' },
  'disc': { type: 'bullet', style: 'disc' },
  'circle': { type: 'bullet', style: 'circle' },
  'square': { type: 'bullet', style: 'square' },
  'arrow': { type: 'bullet', style: 'arrow' },
  'tick': { type: 'bullet', style: 'tick' }
};

class ExtendedList extends List {
  static create(value) {
    // Check if it's a custom list style
    if (LIST_STYLES[value]) {
      const config = LIST_STYLES[value];
      const node = super.create(config.type);
      node.setAttribute('data-list', value);
      node.style.listStyleType = config.style;
      return node;
    }
    return super.create(value);
  }

  static formats(domNode) {
    const domFormat = domNode.getAttribute('data-list');
    if (domFormat && LIST_STYLES[domFormat]) {
      const config = LIST_STYLES[domFormat];
      domNode.style.listStyleType = config.style;
      return domFormat;
    }
    return super.formats(domNode);
  }
}

// Custom Size format for pixel values
class CustomSize extends Inline {
  static blotName = 'size';
  static tagName = 'span';
  
  static create(value) {
    const node = super.create();
    if (value && typeof value === 'string' && value.endsWith('px')) {
      node.style.fontSize = value;
    }
    return node;
  }
  
  static formats(node) {
    const fontSize = node.style.fontSize;
    if (fontSize && typeof fontSize === 'string' && fontSize.endsWith('px')) {
      return fontSize;
    }
    return undefined;
  }
}

Quill.register(ExtendedList, true);
Quill.register(CustomSize, true);


const CreateEstimate = ({ onClose, currentUser, onSuccess, editEstimate = null }) => {
  const [formData, setFormData] = useState({
    lead: '',
    leadId: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    quoteNumber: '',
    title: '',
    summary: '',
    disclaimer: `Please read the job scope and all the information in the estimate and addendum (hereinafter jointly "Estimate" thoroughly to make sure it meets your expectations. We pride ourselves on preparing very detailed and complete estimates so you do not have to make assumptions. If it's not in the Estimate, then it's not part of the scope of work and it will not be done. If there's missing information, omissions,and/or contradictions with what you expect and/or what you were told by the estimator or anyone else,please let us know and do NOT sign the Estimate.

This Estimate, once signed by you, is a legal document. It's final, it's complete, and it's the only information and job scope you should rely on. Any revisions and modifications to the Estimate must be done ONLY in writing. You should not rely on any verbal statements or promises. If you do not understand any part of the Estimate, do not sign it until you have a full understanding of the Estimate and all the documents submitted to you.

Unless clearly specified, this Estimate does not include removal of debris, soil, nor any object from the work area. Nor does it include patching, sanding, taping, painting, finishing work, or reinstallations of any kind (whether the objects, materials, and/or surfaces were initially removed by Zavza Seal or anyone else).

If you need such services and they are not part of the scope of work, please let us know in advance so we can add them to the Estimate and ensure we send the right construction crew to your location. If additional work is needed during or after the construction, it will be priced separately.

Signing this document finalizes this sale in accordance with the itemized project description. You may cancel this transaction any time prior to midnight three calendar days after you signed this Estimate. This Estimate is valid for 14 days and may be withdrawn at any time.`,
    warranty: `We hereby warrant that all labor and materials furnished and work performed by Zavza Seal LLC for {{customer_name}} at {{customer_address}}  will be free from defects due to defective materials or workmanship for a period of {{year_warranty}} from the date of completion. Should any defect develop in the materials furnished or work performed due to improper materials or workmanship, we shall fix the defect at no expense to the owner. Our liability shall only be limited to OUR WORK and OUR MATERIALS. This Warranty is only valid and applies to the specific surfaces we worked on and should not be interpreted as a warranty for other areas or other surfaces we did not work on. Our liability shall be limited to the cost of fixing the defect, but not to any incidental or related damages as a result of the defect. Nothing in the above shall be deemed to apply to work that has been abused or neglected by the owner or other people.`,
    warrantyYear: '0',
    addressImage: null,
    terms: ''
  });

  const [items, setItems] = useState([
    { id: 1, item: 'item 1', description: '', qty: '1', price: '', account: 'Services', taxRate: 'Tax Exempt', amount: '', galleryImages: [], isValid: true }
  ]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // PDF and Xero loading states
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isSendingToXero, setIsSendingToXero] = useState(false);
  
  // Lead search states
  const [leadSearch, setLeadSearch] = useState('');
  const [leadSuggestions, setLeadSuggestions] = useState([]);
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [isSearchingLeads, setIsSearchingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadSearchTimeout, setLeadSearchTimeout] = useState(null);
  const [warrantyCursorPosition, setWarrantyCursorPosition] = useState(0);
  
  // Template-related states
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateSearchTimeout, setTemplateSearchTimeout] = useState(null);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(!!editEstimate);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const [editEstimateNumber, setEditEstimateNumber] = useState('');
  const [editXeroQuoteNumber, setEditXeroQuoteNumber] = useState('');

  const [viewPDF, setViewPDF] = useState(false);
  
  // Send for approval states
  const [showSendApproval, setShowSendApproval] = useState(false);
  const [isSendingApproval, setIsSendingApproval] = useState(false);
  
  // Send to client states
  const [showSendToClient, setShowSendToClient] = useState(false);
  const [isSendingToClient, setIsSendingToClient] = useState(false);

  const [clientEmail, setClientEmail] = useState('');
  
  // Exhibits state
  const [exhibits, setExhibits] = useState([
    { 
      id: 1,
      name: '',
      images: [], 
      textareas: [{ id: 1, title: 'Text Area 1', content: '' }],
      isValid: false 
    }
  ]);
  
  // Refs for ReactQuill components
  const quillRefs = useRef({});


  const accountOptions = [
    { value: 'Sales', label: 'Sales' },
    { value: 'Services', label: 'Services' },
    { value: 'Products', label: 'Products' }
  ];

  const taxRateOptions = [
    { value: 'Tax Exempt', label: 'Tax Exempt' },
    { value: 'Tax on Sales', label: 'Tax on Sales' },
    { value: 'Tax on Purchases', label: 'Tax on Purchases' }
  ];

  const warrantyYearOptions = [
    { value: '0', label: 'No warranty' },
    { value: '5', label: 'Five (5) years' },
    { value: '10', label: 'Ten (10) years' },
    { value: '20', label: 'Twenty (20) years' },
    { value: '30', label: 'Thirty (30) years' },
    { value: '40', label: 'Forty (40) years' }
  ];

  const warrantyVariables = [
    { key: '{{customer_name}}', label: 'Customer Name', description: 'Insert customer name' },
    { key: '{{customer_address}}', label: 'Customer Address', description: 'Insert customer address' },
    { key: '{{year_warranty}}', label: 'Warranty Years', description: 'Insert warranty period' },
  ];

  // Quill editor configuration (matching CreateTemplatePage)
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ size: ['2px', '3px', '5px', '6px', '7px', '8px', '9px', '10px', '11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px', '21px', '22px', '23px', '24px', '25px', '26px', '27px', '28px', '29px', '30px', '31px', '32px', '33px', '34px', '35px', '36px', '37px', '38px', '39px', '40px'] }],
        // [{ list: 'ordered' }, { list: 'bullet' }, 'listStyle'],
        ['listStyle'],
        [{ align: [] }],
        ['clean']
      ],
      handlers: {
        listStyle() {
          const quill = this.quill;
          const currentFormat = quill.getFormat();
          // Map standard list types to our custom styles
          let currentListStyle = currentFormat.list;
          if (currentListStyle === 'ordered') {
            currentListStyle = 'decimal';
          } else if (currentListStyle === 'bullet') {
            currentListStyle = 'disc';
          } else if (!currentListStyle) {
            currentListStyle = null;
          }
          
          // Create dropdown menu
          const toolbar = quill.getModule('toolbar');
          const container = toolbar.container;
          const button = container.querySelector('.ql-listStyle');
          
          if (!button) return;
          
          // Remove existing dropdown if present
          const existingDropdown = document.querySelector('.quill-list-style-dropdown');
          if (existingDropdown) {
            existingDropdown.remove();
            return;
          }
          
          // Create dropdown
          const dropdown = document.createElement('div');
          dropdown.className = 'quill-list-style-dropdown';
          
          // Close dropdown when clicking outside
          const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && e.target !== button && !button.contains(e.target)) {
              dropdown.remove();
              document.removeEventListener('click', closeDropdown);
            }
          };
          
          const orderedStyles = [
            { value: 'decimal', label: '1. 2. 3.', name: 'Decimal' },
            { value: 'lower-alpha', label: 'a. b. c.', name: 'Lower Alpha' },
            { value: 'upper-alpha', label: 'A. B. C.', name: 'Upper Alpha' },
            { value: 'lower-roman', label: 'i. ii. iii.', name: 'Lower Roman' },
            { value: 'upper-roman', label: 'I. II. III.', name: 'Upper Roman' }
          ];

          const unorderedStyles = [
            { value: 'disc', label: '• • •', name: 'Disc' },
            { value: 'circle', label: '○ ○ ○', name: 'Circle' },
            { value: 'square', label: '■ ■ ■', name: 'Square' },
            { value: 'arrow', label: '→ → →', name: 'Arrow' },
            { value: 'tick', label: '✓ ✓ ✓', name: 'Tick' }
          ];

          // Add ordered list section
          const orderedHeader = document.createElement('div');
          orderedHeader.className = 'quill-list-style-header';
          orderedHeader.textContent = 'Ordered Lists';
          dropdown.appendChild(orderedHeader);

          orderedStyles.forEach(style => {
            const option = document.createElement('div');
            option.className = 'quill-list-style-option';
            if (currentListStyle === style.value) {
              option.classList.add('active');
            }
            
            const label = document.createElement('span');
            label.className = 'quill-list-style-label';
            label.textContent = style.label;
            
            const name = document.createElement('span');
            name.className = 'quill-list-style-name';
            name.textContent = style.name;
            
            option.appendChild(label);
            option.appendChild(name);
            
            option.addEventListener('click', (e) => {
              e.stopPropagation();
              const isActive = currentListStyle === style.value;
              quill.format('list', isActive ? false : style.value);
              dropdown.remove();
              document.removeEventListener('click', closeDropdown);
            });
            
            dropdown.appendChild(option);
          });

          // Add separator
          const separator = document.createElement('div');
          separator.className = 'quill-list-style-separator';
          dropdown.appendChild(separator);

          // Add unordered list section
          const unorderedHeader = document.createElement('div');
          unorderedHeader.className = 'quill-list-style-header';
          unorderedHeader.textContent = 'Unordered Lists';
          dropdown.appendChild(unorderedHeader);

          unorderedStyles.forEach(style => {
            const option = document.createElement('div');
            option.className = 'quill-list-style-option';
            if (currentListStyle === style.value) {
              option.classList.add('active');
            }
            
            const label = document.createElement('span');
            label.className = 'quill-list-style-label';
            label.textContent = style.label;
            
            const name = document.createElement('span');
            name.className = 'quill-list-style-name';
            name.textContent = style.name;
            
            option.appendChild(label);
            option.appendChild(name);
            
            option.addEventListener('click', (e) => {
              e.stopPropagation();
              const isActive = currentListStyle === style.value;
              quill.format('list', isActive ? false : style.value);
              dropdown.remove();
              document.removeEventListener('click', closeDropdown);
            });
            
            dropdown.appendChild(option);
          });
          
          // Position dropdown
          const buttonRect = button.getBoundingClientRect();
          dropdown.style.position = 'fixed';
          dropdown.style.top = `${buttonRect.bottom + 5}px`;
          dropdown.style.left = `${buttonRect.left}px`;
          dropdown.style.zIndex = '10000';
          
          document.body.appendChild(dropdown);
          
          setTimeout(() => {
            document.addEventListener('click', closeDropdown);
          }, 0);
        }
      }
    }
  }), []);

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

  // Custom ReactQuill component with stable refs to prevent re-renders
  const QuillEditor = React.memo(({ itemId, value, onChange, placeholder }) => {
    const quillRef = useRef(null);
    const isUpdatingRef = useRef(false);
    const lastValueRef = useRef(value);
    
    useEffect(() => {
      if (quillRef.current) {
        quillRefs.current[itemId] = quillRef.current;
      }
    }, [itemId]);

    const handleQuillChange = useCallback((content) => {
      // Prevent infinite loops and unnecessary updates
      if (isUpdatingRef.current || lastValueRef.current === content) return;
      
      lastValueRef.current = content;
      onChange(content);
    }, [onChange]);

    // Only update editor content when value changes externally (not from typing)
    useEffect(() => {
      if (quillRef.current && quillRef.current.getEditor && value !== lastValueRef.current) {
        const editor = quillRef.current.getEditor();
        if (editor) {
          const currentContent = editor.root.innerHTML;
          if (currentContent !== (value || '')) {
            isUpdatingRef.current = true;
            editor.root.innerHTML = value || '';
            lastValueRef.current = value;
            isUpdatingRef.current = false;
          }
        }
      }
    }, [value]);

    return (
      <div className="quill-editor-container">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ''}
          onChange={handleQuillChange}
          modules={quillModules}
          formats={quillFormats}
          placeholder={placeholder}
          readOnly={false}
        />
      </div>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.itemId === nextProps.itemId &&
      prevProps.value === nextProps.value &&
      prevProps.placeholder === nextProps.placeholder
    );
  });

  // State for API error handling
  const [apiError, setApiError] = useState(null);
  const [estimateApiError, setEstimateApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load estimate data for editing
  const loadEstimateData = async (estimateId) => {
    if (!estimateId) return;
    
    setLoadingEstimate(true);
    setApiError(null);
    
    try {
      const response = await agent.estimates.getEstimateById(estimateId);
      
      if (response && response.isSuccess && response.data && response.data.estimate) {
        const estimate = response.data.estimate;
        
        // Populate form data
        setFormData(prev => ({
          ...prev,
          lead: estimate.lead || '',
          leadId: estimate.leadId || estimate.lead_id || '',
          issueDate: estimate.issue_date ? estimate.issue_date.split('T')[0] : new Date().toISOString().split('T')[0],
          expiryDate: estimate.expiry_date ? estimate.expiry_date.split('T')[0] : '',
          quoteNumber: estimate.quote_number || '',
          title: estimate.title || '',
          summary: estimate.summary || '',
          // disclaimer: estimate.disclaimer || prev.disclaimer,
          // warranty: estimate.warranty || prev.warranty,
          disclaimer: estimate.disclaimer || '',
          warranty: estimate.warranty || '',
          warrantyYear: estimate.warranty_year || '0',
          addressImage: estimate?.address_image?.path ? process.env.REACT_APP_BACKEND + estimate.address_image.path : null,
          terms: estimate.terms || ''
        }));

        if(estimate.pdf_path && estimate.pdf_path !== ""){
          setViewPDF(true);
        }
        if(estimate.lead_data && estimate.lead_data.lead_json_data && estimate.lead_data.lead_json_data.EMAIL && Array.isArray(estimate.lead_data.lead_json_data.EMAIL) && estimate.lead_data.lead_json_data.EMAIL.length > 0) {
          setClientEmail(estimate.lead_data.lead_json_data.EMAIL[0].VALUE);
        }

        
          
          // Create subtitle: First Name - Last Name - Address
        const firstName = estimate.lead_data.NAME || '';
        const lastName = estimate.lead_data.LAST_NAME || '';
        const lead_name  = firstName + ' ' + lastName + ' #' + estimate.lead_id;
        const estimate_name  = firstName + ' ' + lastName + ' #E-000' + estimate.id;


        setEditEstimateNumber(estimate_name);

        if (estimate.quote_number) {
          setEditXeroQuoteNumber('XERO QUOTE #' + estimate.quote_number);
        }

        
        // Set lead search state
        setLeadSearch(lead_name);
        if (estimate.lead) {
          setSelectedLead({
            id: estimate.leadId || estimate.lead_id || 'existing',
            leadId: estimate.leadId || estimate.lead_id || '',
            name: estimate.lead,
            subtitle: '',
            email: '',
            phone: ''
          });
        }
        
        // Populate items if they exist
        if (estimate.items && Array.isArray(estimate.items)) {
          const mappedItems = estimate.items.map((item, index) => ({
            id: item.id || index + 1,
            item: item.item || '',
            description: item.description || '',
            qty: item.qty || '',
            price: item.price || '',
            account: item.account || 'Services',
            taxRate: item.taxRate || 'Tax Exempt',
            amount: item.amount || '',
            galleryImages: item.gallery_images ? item.gallery_images.map((img, index) => ({
              id: `existing_${item.id}_${index}`, // Unique ID for existing images
              name: img.filename,
              type: img.type,
              size: img.size,
              path: process.env.REACT_APP_BACKEND + img.path,
              preview: process.env.REACT_APP_BACKEND + img.path,
              isExisting: true, // Flag to identify existing images
              originalPath: img.path, // Store original path for API calls
              file: null // No file object for existing images
            })) : [],
            isValid: validateItem({ item: item.item || '' })
          }));
          setItems(mappedItems);
        }

        if (estimate.exhibitItems && Array.isArray(estimate.exhibitItems) && estimate.exhibitItems.length > 0) {  
          const mappedExhibitItems = estimate.exhibitItems.map((exhibitItem, index) => ({
            id: exhibitItem.id || index + 1,
            name: exhibitItem.name || '',
            images: exhibitItem.gallery_images ? exhibitItem.gallery_images.map((img, index) => ({
              id: `existing_${exhibitItem.id}_${index}`, // Unique ID for existing images
              name: img.filename,
              type: img.type,
              size: img.size,
              path: process.env.REACT_APP_BACKEND + img.path,
              preview: process.env.REACT_APP_BACKEND + img.path,
              isExisting: true, // Flag to identify existing images
              originalPath: img.path, // Store original path for API calls
              file: null // No file object for existing images
            })) : [],
            textareas: exhibitItem.textareas ? exhibitItem.textareas.map((textarea, index) => ({
              id: `existing_${exhibitItem.id}_${index}`, // Unique ID for existing images
              content: textarea.content,
              title: textarea.title,
              isExisting: true // Flag to identify existing images
            })) : [],
            isValid: validateItem({ item: exhibitItem.item || '' })
          }));
          console.log(JSON.stringify(mappedExhibitItems, null, 2));
          setExhibits(mappedExhibitItems);
        }
        
      } else {
        setApiError('Failed to load estimate data');
      }
    } catch (error) {
      console.error('Error loading estimate:', error);
      setApiError('Failed to load estimate data. Please try again.');
    } finally {
      setLoadingEstimate(false);
    }
  };

  // Template functions
  const fetchTemplates = async (searchQuery = '') => {
    setLoadingTemplates(true);
    try {
      const response = await agent.estimates.getEstimateTemplates(searchQuery);
      if (response && response.isSuccess && response.data && response.data.templates) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleImportTemplate = (itemId) => {
    setSelectedItemId(itemId);
    setShowTemplateModal(true);
    setTemplateSearch(''); // Reset search when opening modal
    fetchTemplates(); // Always fetch templates when opening modal
  };

  const handleTemplateSelect = (template) => {
    if (selectedItemId) {
      setItems(prev => prev.map(item => {
        if (item.id === selectedItemId) {
          return {
            ...item,
            description: template.template_content || ''
          };
        }
        return item;
      }));
    }
    setShowTemplateModal(false);
    setSelectedItemId(null);
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setSelectedItemId(null);
    setTemplateSearch(''); // Clear search when closing modal
  };

  // Template search functionality
  const handleTemplateSearch = (value) => {
    setTemplateSearch(value);
    
    // Clear existing timeout
    if (templateSearchTimeout) {
      clearTimeout(templateSearchTimeout);
    }
    
    // Search templates with debounce
    const timeoutId = setTimeout(() => {
      fetchTemplates(value);
    }, 300);
    
    setTemplateSearchTimeout(timeoutId);
  };

  // Lead search functionality
  const searchLeads = async (query) => {
    if (!query || query.length < 2) {
      setLeadSuggestions([]);
      setShowLeadDropdown(false);
      return;
    }

    if (!currentUser || !currentUser.id) {
      console.error('No current user found');
      setApiError('User not authenticated');
      return;
    }

    setIsSearchingLeads(true);
    setApiError(null);
    
    try {
      const response = await agent.estimates.getLeadsBySearch(query);
      
      if (response && response.isSuccess && response.data && response.data.leads && Array.isArray(response.data.leads)) {
        // Map the API response to match our expected format
        const mappedLeads = response.data.leads.map(lead => {
          // Extract address from lead_json_data
          let address = '';
          if (lead.lead_json_data && lead.lead_json_data.UF_CRM_LEAD_1708606658714) {
            address = lead.lead_json_data.UF_CRM_LEAD_1708606658714;
          }else if (lead.lead_json_data && lead.lead_json_data.ADDRESS) {
            address = lead.lead_json_data.ADDRESS;
          }
          
          // Create subtitle: First Name - Last Name - Address
          const firstName = lead.NAME || '';
          const lastName = lead.LAST_NAME || '';
          const name  = firstName + ' ' + lastName + ' #' + lead.lead_id;
          
          return {
            id: lead.id,
            leadId: lead.lead_id, // Use lead_id if available, fallback to id
            name: name,
            subtitle: address || 'No address',
            address: address,
            email: '', // Not available in this data structure
            phone: lead.phone || (lead.lead_json_data && lead.lead_json_data.PHONE && lead.lead_json_data.PHONE[0] ? lead.lead_json_data.PHONE[0].VALUE : ''),
            leadData: lead // Store full lead data for reference
          };
        });

        //console.log(JSON.stringify(mappedLeads, null, 2));
        
        setLeadSuggestions(mappedLeads);
        setShowLeadDropdown(true);
      } else {
        setLeadSuggestions([]);
        setShowLeadDropdown(true);
      }
    } catch (error) {
      console.error('Error searching leads:', error);
      setApiError('Failed to search leads. Please try again.');
      setLeadSuggestions([]);
      setShowLeadDropdown(true);
    } finally {
      setIsSearchingLeads(false);
    }
  };

  const handleLeadSearch = (value) => {
    setLeadSearch(value);
    setFormData(prev => ({
      ...prev,
      lead: value
    }));
    
    // Clear selected lead if user is typing
    if (selectedLead) {
      setSelectedLead(null);
    }
    
    // Search leads with debounce
    if (leadSearchTimeout) {
      clearTimeout(leadSearchTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      searchLeads(value);
    }, 300);
    
    setLeadSearchTimeout(timeoutId);
  };

  const handleLeadSelect = (lead) => {
    setErrors({});
    if(lead && lead.address === ""){
      setSelectedLead(null);
      setLeadSearch('');
      setFormData(prev => ({
        ...prev,
        lead: '',
        leadId: '',
      }));
      setShowLeadDropdown(false);
      setLeadSuggestions([]);
      setErrors(prev => ({
        ...prev,
        lead: 'Warning: This lead has no address. Please add an address before proceeding.'
      }));
      return;
    }
    setSelectedLead(lead);
    setLeadSearch(lead.name);
    setFormData(prev => ({
      ...prev,
      lead: lead.name,
      leadId: lead.leadId
    }));
    setShowLeadDropdown(false);
    setLeadSuggestions([]);
  };

  const handleCreateNewLead = () => {
    if (leadSearch.trim()) {
      // Create new lead with the search term
      const newLead = {
        id: 'new',
        leadId: '',
        name: leadSearch.trim(),
        subtitle: '',
        email: '',
        phone: ''
      };
      handleLeadSelect(newLead);
    }
  };

  const handleClearLead = () => {
    setSelectedLead(null);
    setLeadSearch('');
    setFormData(prev => ({
      ...prev,
      lead: '',
      leadId: '',
    }));
    setShowLeadDropdown(false);
    setLeadSuggestions([]);
    setApiError(null);
  };

  const handleAddressImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        addressImage: file
      }));
    }
  };

  const handleWarrantyTextChange = (e) => {
    setWarrantyCursorPosition(e.target.selectionStart);
    handleInputChange('warranty', e.target.value);
  };

  const handleWarrantyCursorChange = (e) => {
    setWarrantyCursorPosition(e.target.selectionStart);
  };

  const handleInsertVariable = (variable) => {
    const currentWarranty = formData.warranty;
    const cursorPos = warrantyCursorPosition;
    const newWarranty = currentWarranty.substring(0, cursorPos) + variable.key + currentWarranty.substring(cursorPos);
    
    setFormData(prev => ({
      ...prev,
      warranty: newWarranty
    }));
    
    // Update cursor position after the inserted variable
    setWarrantyCursorPosition(cursorPos + variable.key.length);
    
    // Focus and set cursor position in textarea
    setTimeout(() => {
      const textarea = document.getElementById('warranty-textarea');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(cursorPos + variable.key.length, cursorPos + variable.key.length);
      }
    }, 0);
  };

  const handleDownloadPDF = async () => {
    if (!editEstimate || !editEstimate.id) {
      alert('Please save the estimate first before downloading PDF');
      return;
    }

    try {
      setIsDownloadingPDF(true);
      
      // Use agent API to download PDF
      const response = await agent.estimates.downloadEstimatePDF(editEstimate.id);
      
      // Create a blob from the response and trigger download
      if (response && response.isSuccess && response.data?.outputPath) {

        setSuccessMessage('PDF successfully generated!');
        setEstimateApiError(null);
        await loadEstimateData(editEstimate.id);
        // const blob = new Blob([response.data.outputPath], { type: 'application/pdf' });
        // const url = window.URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = `estimate_${editEstimate.id}_${Date.now()}.pdf`;
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        // window.URL.revokeObjectURL(url);
      }
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleViewPDF = async () => {
    if (!editEstimate || !editEstimate.id) {
      alert('Please save the estimate first before viewing PDF');
      return;
    }

    try {
      setIsDownloadingPDF(true);
      
      // Use agent API to get PDF
      const response = await agent.estimates.viewEstimatePDF(editEstimate.id);
      
      // Create a blob from the response and open in new tab
      if (response && response.data?.pdf && response.data.pdf !== "") {
        window.open(response.data.pdf, '_blank');
      }
      
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Failed to view PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleSendToXero = async () => {
    if (!editEstimate || !editEstimate.id) {
      alert('Please save the estimate first before sending to Xero');
      return;
    }

    try {
      setIsSendingToXero(true);
      const response = await agent.estimates.sendEstimateToXero(editEstimate.id);

     // console.log('✅ Response:', JSON.stringify(response, null, 2));
      
      if (response &&  response.data && response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }else if (response && response?.data?.quote?.QuoteID) {
        // Successfully sent to Xero, refresh estimate data
        await loadEstimateData(editEstimate.id);
        setSuccessMessage('Estimate successfully sent to Xero!');
        setEstimateApiError(null);
      } else {
        setEstimateApiError('Xero integration failed: No Quote ID received.');
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error('Error sending to Xero:', error);
      setEstimateApiError(error.message || 'Xero integration failed.');
      setSuccessMessage(null);
    } finally {
      setIsSendingToXero(false);
    }
  };


  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLeadDropdown && !event.target.closest('.create-estimate-lead-wrapper')) {
        setShowLeadDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLeadDropdown]);

  // Suppress findDOMNode warnings from third-party libraries
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && args[0].includes && args[0].includes('findDOMNode is deprecated')) {
        return; // Suppress this specific warning
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (leadSearchTimeout) {
        clearTimeout(leadSearchTimeout);
      }
      if (templateSearchTimeout) {
        clearTimeout(templateSearchTimeout);
      }
    };
  }, [leadSearchTimeout, templateSearchTimeout]);

  // Reset edit mode when editEstimate prop changes
  useEffect(() => {
    if (editEstimate && editEstimate.id) {
      setIsEditMode(true);
      loadEstimateData(editEstimate.id);
    } else {
      setIsEditMode(false);
      // Reset form data to default when switching to create mode
      setFormData({
        lead: '',
        leadId: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        quoteNumber: '',
        title: '',
        summary: '',
        disclaimer: `Please read the job scope and all the information in the estimate and addendum (hereinafter jointly "Estimate" thoroughly to make sure it meets your expectations. We pride ourselves on preparing very detailed and complete estimates so you do not have to make assumptions. If it's not in the Estimate, then it's not part of the scope of work and it will not be done. If there's missing information, omissions,and/or contradictions with what you expect and/or what you were told by the estimator or anyone else,please let us know and do NOT sign the Estimate.

This Estimate, once signed by you, is a legal document. It's final, it's complete, and it's the only information and job scope you should rely on. Any revisions and modifications to the Estimate must be done ONLY in writing. You should not rely on any verbal statements or promises. If you do not understand any part of the Estimate, do not sign it until you have a full understanding of the Estimate and all the documents submitted to you.

Unless clearly specified, this Estimate does not include removal of debris, soil, nor any object from the work area. Nor does it include patching, sanding, taping, painting, finishing work, or reinstallations of any kind (whether the objects, materials, and/or surfaces were initially removed by Zavza Seal or anyone else).

If you need such services and they are not part of the scope of work, please let us know in advance so we can add them to the Estimate and ensure we send the right construction crew to your location. If additional work is needed during or after the construction, it will be priced separately.

Signing this document finalizes this sale in accordance with the itemized project description. You may cancel this transaction any time prior to midnight three calendar days after you signed this Estimate. This Estimate is valid for 14 days and may be withdrawn at any time.`,
        warranty: `We hereby warrant that all labor and materials furnished and work performed by Zavza Seal LLC for {{customer_name}} at {{customer_address}}  will be free from defects due to defective materials or workmanship for a period of {{year_warranty}} from the date of completion. Should any defect develop in the materials furnished or work performed due to improper materials or workmanship, we shall fix the defect at no expense to the owner. Our liability shall only be limited to OUR WORK and OUR MATERIALS. This Warranty is only valid and applies to the specific surfaces we worked on and should not be interpreted as a warranty for other areas or other surfaces we did not work on. Our liability shall be limited to the cost of fixing the defect, but not to any incidental or related damages as a result of the defect. Nothing in the above shall be deemed to apply to work that has been abused or neglected by the owner or other people.`,
        warrantyYear: '0',
        addressImage: null,
        terms: ''
      });
      setItems([
        { id: 1, item: 'item 1', description: '', qty: '1', price: '', account: 'Services', taxRate: 'Tax Exempt', amount: '', galleryImages: [], isValid: true }
      ]);
      setExhibits([
        { 
          id: 1,
          name: '',
          images: [], 
          textareas: [{ id: 1, title: 'Text Area 1', content: '' }],
          isValid: false 
        }
      ]);
      setLeadSearch('');
      setSelectedLead(null);
      setApiError(null);
      setTemplateSearch(''); // Reset template search
    }
  }, [editEstimate]);

  // Cleanup gallery images and exhibit images on unmount
  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.galleryImages) {
          item.galleryImages.forEach(image => {
            // Only revoke URLs for new images (not existing ones)
            if (!image.isExisting && image.preview) {
              URL.revokeObjectURL(image.preview);
            }
          });
        }
      });
      
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
  }, []);

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-dismiss estimate API error after 8 seconds
  useEffect(() => {
    if (estimateApiError) {
      const timer = setTimeout(() => {
        setEstimateApiError(null);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [estimateApiError]);

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
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null);
    }
    
    // Clear estimate API error when user makes changes
    if (estimateApiError) {
      setEstimateApiError(null);
    }
  };

  const handleItemChange = useCallback((itemId, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        // Only update if the value actually changed
        if (item[field] === value) {
          return item;
        }
        
        const updatedItem = { ...item, [field]: value };
        
        // Calculate amount if qty and price are provided
        if (field === 'qty' || field === 'price') {
          const qty = field === 'qty' ? (parseFloat(value) || (value === '' ? 1 : 0)) : (parseFloat(item.qty) || (item.qty === '' ? 1 : 0));
          const price = field === 'price' ? parseFloat(value) || 0 : parseFloat(item.price) || 0;
          
          // If price is negative, treat it as a discount
          const amount = qty * price;
          
          updatedItem.amount = amount.toFixed(2);
        }
        
        // Validate item
        updatedItem.isValid = validateItem(updatedItem);
        
        return updatedItem;
      }
      return item;
    }));
  }, []);

  // Separate handler for editor changes to avoid interference
  const handleItemEditorChange = useCallback((itemId, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        // Only update if the value actually changed
        if (item.description === value) {
          return item;
        }
        
        const updatedItem = { ...item, description: value };
        
        // Validate item
        updatedItem.isValid = validateItem(updatedItem);
        
        return updatedItem;
      }
      return item;
    }));
  }, []);

  // Stable editor change handler that doesn't cause re-renders
  const handleEditorChange = useCallback((itemId) => {
    return (value) => {
      // Direct update without causing re-render of the editor
      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          // Only update if the value actually changed
          if (item.description === value) {
            return item;
          }
          
          const updatedItem = { ...item, description: value };
          
          // Validate item
          updatedItem.isValid = validateItem(updatedItem);
          
          return updatedItem;
        }
        return item;
      }));
    };
  }, []);

  // Insert "----newBox----" + newline into description editor at cursor (or end)
  const handleInsertNewBox = useCallback((itemId) => {
    const rq = quillRefs.current[itemId];
    if (!rq || !rq.getEditor) return;
    const quill = rq.getEditor();
    const index = quill.getLength(); // always insert at end
    const text = '----newBox----\n\n'; // newline after marker, then blank line for new text
    quill.insertText(index, text);
    quill.setSelection(index + text.length);
  }, []);

  const handleGalleryImageAdd = (itemId, files) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newImages = Array.from(files).map((file, index) => ({
          id: `new_${itemId}_${Date.now()}_${index}`, // Unique ID for new images
          file: file,
          preview: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size,
          path: null, // No path for new images
          isExisting: false, // Flag to identify new images
          originalPath: null // No original path for new images
        }));
        
        return {
          ...item,
          galleryImages: [...item.galleryImages, ...newImages]
        };
      }
      return item;
    }));
  };

  const handleGalleryImageRemove = (itemId, imageId) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const imageToRemove = item.galleryImages.find(img => img.id === imageId);
        if (imageToRemove) {
          // Only revoke URL for new images (File objects)
          if (!imageToRemove.isExisting && imageToRemove.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
          }
        }
        
        return {
          ...item,
          galleryImages: item.galleryImages.filter(img => img.id !== imageId)
        };
      }
      return item;
    }));
  };

  const validateItem = (item) => {
    // No validation required - item name is optional
    return true;
  };

  const addItem = () => {
    const maxId = items.length > 0 ? Math.max(...items.map(item => item.id)) : 0;
    const newId = maxId + 1;
    setItems(prev => [...prev, {
      id: newId,
      item: '',
      description: '',
      qty: '1',
      price: '',
      account: '',
      taxRate: '',
      amount: '',
      galleryImages: [],
      isValid: true
    }]);
  };

  const removeItem = (itemId) => {
    setItems(prev => {
      const itemToRemove = prev.find(item => item.id === itemId);
      if (itemToRemove && itemToRemove.galleryImages) {
        // Clean up object URLs for new images only to prevent memory leaks
        itemToRemove.galleryImages.forEach(image => {
          if (!image.isExisting && image.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });
      }
      return prev.filter(item => item.id !== itemId);
    });
  };

  const calculateTotals = () => {
    // Calculate subtotal including all prices (positive and negative)
    const subtotal_discounted = items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || (item.qty === '' ? 1 : 0);
      const price = parseFloat(item.price) || 0;
      return sum + (qty * price);
    }, 0);
    
    // Calculate total discount from negative prices (for display purposes)
    const totalDiscount = items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || (item.qty === '' ? 1 : 0);
      const price = parseFloat(item.price) || 0;
      if (price < 0) {
        return sum + Math.abs(qty * price); // Convert negative to positive for discount display
      }
      return sum;
    }, 0);
    
    // Total is the same as subtotal since discounts are already included in negative prices
    const total = subtotal_discounted;

    const subtotal = subtotal_discounted + totalDiscount;
    
    return {
      subtotal: subtotal.toFixed(2),
      discount: totalDiscount.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const getInvalidItemsCount = () => {
    return items.filter(item => !item.isValid).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {

      // Validate form
      const newErrors = {};
      
      if (!formData.lead.trim()) {
        newErrors.lead = 'Lead is required';
      }

      if (!formData.leadId) {
        newErrors.leadId = 'Lead is required';
      }

      
      // if (!formData.issueDate) {
      //   newErrors.issueDate = 'Issue date is required';
      // }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }
      
      // Prepare estimate data for API using FormData
      const formDataToSend = new FormData();
      
      // Add basic form data
      Object.keys(formData).forEach(key => {
        if (key !== 'addressImage' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add address image if exists
      if (formData.addressImage) {
        formDataToSend.append('addressImage', formData.addressImage);
      }
      
      // Add totals
      const totals = calculateTotals();
      formDataToSend.append('totals', JSON.stringify(totals));
      
      // Add items data (item name is optional, so include all items)
      const validItems = items;
      const itemsData = validItems.map(item => {
        // Separate existing and new images
        const existingImages = item.galleryImages.filter(img => img.isExisting);
        const newImages = item.galleryImages.filter(img => !img.isExisting);
        
        return {
          ...item,
          galleryImages: existingImages
        };
      });
      formDataToSend.append('items', JSON.stringify(itemsData));
      
      // Add new gallery images as separate files
      validItems.forEach((item, itemIndex) => {
        const newImages = item.galleryImages.filter(img => !img.isExisting);
        newImages.forEach((image, imageIndex) => {
          if (image.file) {
            formDataToSend.append(`galleryImages_${itemIndex}_${imageIndex}`, image.file);
          }
        });
      });
      
      // Add exhibits data
      const validExhibits = exhibits.filter(exhibit => 
        exhibit.images.length > 0 || 
        exhibit.textareas.some(textarea => textarea.content.trim() !== '') ||
        (exhibit.name && exhibit.name.trim() !== '')
      );
      
      if (validExhibits.length > 0) {
        const exhibitsData = validExhibits.map(exhibit => {
          // Separate existing and new images
          const existingImages = exhibit.images.filter(img => img.isExisting);
          
          return {
            id: exhibit.id,
            name: exhibit.name ? exhibit.name.trim() : '',
            images: existingImages,
            textareas: exhibit.textareas
              .filter(textarea => textarea.content.trim() !== '')
              .map(textarea => ({
                id: textarea.id,
                title: textarea.title || '',
                content: textarea.content
              }))
          };
        });
        
        formDataToSend.append('exhibits', JSON.stringify(exhibitsData));
        
        // Add new exhibit images as separate files
        validExhibits.forEach((exhibit, exhibitIndex) => {
          const newImages = exhibit.images.filter(img => !img.isExisting);
          newImages.forEach((image, imageIndex) => {
            if (image.file) {
              formDataToSend.append(`exhibitImages_${exhibitIndex}_${imageIndex}`, image.file);
            }
          });
        });
      }
      
      console.log(isEditMode ? 'Updating estimate with FormData...' : 'Creating estimate with FormData...');
      
      
      // Send to API via agent
      let response;
      if (isEditMode && editEstimate && editEstimate.id) {
        // Update existing estimate
        formDataToSend.append('id', editEstimate.id);
        response = await agent.estimates.updateEstimate(editEstimate.id, formDataToSend);
      } else {
        // Create new estimate
        response = await agent.estimates.createEstimate(formDataToSend);
      }
      
      if (response && response.isSuccess) {
        console.log(isEditMode ? 'Estimate updated successfully:' : 'Estimate created successfully:', response.data);
        // Call onSuccess callback to refresh estimates list
        if (onSuccess) {
          onSuccess();
        }
        // Close modal on success
        onClose();
      } else {
        console.error(isEditMode ? 'Failed to update estimate:' : 'Failed to create estimate:', response?.message || 'Unknown error');
       // setApiError(response?.message || (isEditMode ? 'Failed to update estimate. Please try again.' : 'Failed to create estimate. Please try again.'));
      }
      
    } catch (error) {
      console.error('Error creating estimate:', error);
      //setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();
  const invalidItemsCount = getInvalidItemsCount();
  

  // Show loading state while fetching estimate data
  if (loadingEstimate) {
    return (
      <div className="create-estimate">
        <div className="create-estimate-header">
          <h2>Edit Estimate</h2>
          <button className="create-estimate-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="create-estimate-loading-container">
          <div className="create-estimate-loading">
            <span className="create-estimate-loading">⟳</span>
            <span>Loading estimate data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for edit mode when API fails
  if (isEditMode && apiError) {
    return (
      <div className="create-estimate">
        <div className="create-estimate-header">
          <h2>Edit Estimate</h2>
          <button className="create-estimate-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="create-estimate-error-container">
          <div className="create-estimate-error-content">
            <span className="error-icon">⚠️</span>
            <h3>Failed to Load Estimate</h3>
            <p>{apiError}</p>
            <div className="create-estimate-error-actions">
              <button 
                type="button" 
                className="create-estimate-retry-btn"
                onClick={() => editEstimate && loadEstimateData(editEstimate.id)}
              >
                Retry Loading
              </button>
              <button 
                type="button" 
                className="create-estimate-cancel-btn"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-estimate">
      <div className="create-estimate-header">
        {isEditMode ? (
          <div className="edit-estimate-title">
            <span className="edit-text">Edit Estimate</span>
            <span className="separator">|</span>
            <span className="customer-info">
              {editEstimateNumber}
            </span>
            {editXeroQuoteNumber && (
              <>
                <span className="separator">|</span>
                <span className="xero-quote">{editXeroQuoteNumber}</span>
              </>
            )}
          </div>
        ) : (
          <h2>Create Estimate</h2>
        )}
        <div className="create-estimate-header-actions">
          {isEditMode && (
            <>
              {viewPDF && (
                <button 
                  type="button" 
                  className="create-estimate-download-pdf"
                  onClick={handleViewPDF}
                  disabled={isSubmitting || loadingEstimate || isDownloadingPDF || isSendingToXero}
                  title="View PDF in new tab"
                >
                  {isDownloadingPDF ? (
                    <>
                      <span className="create-estimate-loading">⟳</span>
                      Loading PDF...
                    </>
                  ) : (
                    '👁️ View PDF'
                  )}
                </button>
              )}
              <button 
                type="button" 
                className="create-estimate-download-pdf"
                onClick={handleDownloadPDF}
                disabled={isSubmitting || loadingEstimate || isDownloadingPDF || isSendingToXero}
                title="Download PDF"
              >
                {isDownloadingPDF ? (
                  <>
                    <span className="create-estimate-loading">⟳</span>
                    Generating PDF...
                  </>
                ) : (
                  '📄 Generate PDF'
                )}
              </button>
              <button 
                type="button" 
                className="create-estimate-send-xero"
                onClick={handleSendToXero}
                disabled={isSubmitting || loadingEstimate || isDownloadingPDF || isSendingToXero}
                title="Send to Xero"
              >
                {isSendingToXero ? (
                  <>
                    <span className="create-estimate-loading">⟳</span>
                    Sending to Xero...
                  </>
                ) : (
                  '📊 Send to Xero'
                )}
              </button>
              <button 
                type="button" 
                className="create-estimate-send-approval"
                onClick={() => setShowSendApproval(true)}
                disabled={isSubmitting || loadingEstimate || isDownloadingPDF || isSendingToXero || isSendingApproval || isSendingToClient}
                title="Send for Approval"
              >
                {isSendingApproval ? (
                  <>
                    <span className="create-estimate-loading">⟳</span>
                    Sending for Approval...
                  </>
                ) : (
                  '📧 Send for Approval'
                )}
              </button>
              <button 
                type="button" 
                className="create-estimate-send-client"
                onClick={() => setShowSendToClient(true)}
                disabled={isSubmitting || loadingEstimate || isDownloadingPDF || isSendingToXero || isSendingApproval || isSendingToClient}
                title="Send to Client"
              >
                {isSendingToClient ? (
                  <>
                    <span className="create-estimate-loading">⟳</span>
                    Sending to Client...
                  </>
                ) : (
                  '👤 Send to Client'
                )}
              </button>
            </>
          )}
          <button className="create-estimate-close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-estimate-form">

        {/* Success message */}
        {successMessage && (
          <div className="create-estimate-success-message">
            <span className="success-icon">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {apiError && (
          <div className="create-estimate-error-message">
            <span className="error-icon">⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* Estimate API Error message */}
        {estimateApiError && (
          <div className="create-estimate-error-message">
            <span className="error-icon">⚠️</span>
            <span>{estimateApiError}</span>
          </div>
        )}
        
        {/* Edit mode notice when no data loaded */}
        {isEditMode && !loadingEstimate && !apiError && (
          <div className="create-estimate-edit-notice">
            <span className="edit-icon">✏️</span>
            <span>You are editing an existing estimate. Make your changes and click "Update Estimate" to save.</span>
          </div>
        )}

        

        

        {/* Estimate Details Section */}
        <div className="create-estimate-section">
          <h3 className="create-estimate-section-title">Estimate Details</h3>
          <div className="create-estimate-grid">
            
            <div className="create-estimate-field">
              <label>Lead Customer Name And ID</label>
              <div className="create-estimate-lead-wrapper">
                <div className="create-estimate-input-wrapper">
                  <span className="create-estimate-icon">👤</span>
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => handleLeadSearch(e.target.value)}
                    onFocus={() => !selectedLead && leadSearch.length >= 2 && setShowLeadDropdown(true)}
                    className={errors.lead ? 'error' : ''}
                    placeholder={selectedLead ? "Lead selected" : "Select lead"}
                    autoComplete="off"
                    readOnly={!!selectedLead}
                  />
                  {isSearchingLeads && !selectedLead && (
                    <span className="create-estimate-loading">⟳</span>
                  )}
                  {selectedLead && (
                    <button
                      type="button"
                      className="create-estimate-clear-lead"
                      onClick={handleClearLead}
                      title="Clear selected lead"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* Lead Dropdown */}
                {showLeadDropdown && !selectedLead && (
                  <div className="create-estimate-lead-dropdown">
                    {apiError ? (
                      <div className="create-estimate-error-item">
                        <span className="error-icon">⚠️</span>
                        <span>{apiError}</span>
                      </div>
                    ) : leadSuggestions.length > 0 ? (
                      leadSuggestions.map((lead) => (
                        <div
                          key={lead.id}
                          className="create-estimate-lead-item"
                          onClick={() => handleLeadSelect(lead)}
                        >
                          <span className="create-estimate-lead-icon">👤</span>
                          <div className="create-estimate-lead-info">
                            <div className="create-estimate-lead-name">{lead.name}</div>
                            {lead.subtitle && (
                              <div className="create-estimate-lead-subtitle">{lead.subtitle}</div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : leadSearch.length >= 2 && !isSearchingLeads ? (
                      <div
                        className="create-estimate-create-lead"
                        onClick={handleCreateNewLead}

                        style={{
                          display: 'none'
                        }}
                      >
                        <span className="create-estimate-create-icon">+</span>
                        <span>Create '{leadSearch}' as a new lead</span>
                      </div>
                    ) : leadSearch.length >= 2 && isSearchingLeads ? (
                      <div className="create-estimate-loading-item">
                        <span className="create-estimate-loading">⟳</span>
                        <span>Searching leads...</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              {errors.lead && <span className="error-message">{errors.lead}</span>}
            </div>
            <div className="create-estimate-field">
              <label>Warranty Period</label>
              <div className="create-estimate-input-wrapper">
                <span className="create-estimate-icon">⏰</span>
                <select
                  value={formData.warrantyYear}
                  onChange={(e) => handleInputChange('warrantyYear', e.target.value)}
                >
                  {warrantyYearOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* <div className="create-estimate-field hidden-mobile" style={{visibility: 'hidden'}}>
              <label></label>
              <div className="create-estimate-input-wrapper">
              </div>
            </div> */}

            {/* <div className="create-estimate-field" style={{display: 'none'}}>
              <label>Issue date</label>
              <div className="create-estimate-input-wrapper">
                <span className="create-estimate-icon">📅</span>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  className={errors.issueDate ? 'error' : ''}
                />
              </div>
              {errors.issueDate && <span className="error-message">{errors.issueDate}</span>}
            </div> */}

            {/* <div className="create-estimate-field">
              <label>Expiry date</label>
              <div className="create-estimate-input-wrapper">
                <span className="create-estimate-icon">📅</span>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              </div>
            </div>

            <div className="create-estimate-field">
              <label>Quote number</label>
              <div className="create-estimate-input-wrapper">
                <input
                  type="text"
                  value={formData.quoteNumber}
                  onChange={(e) => handleInputChange('quoteNumber', e.target.value)}
                  readOnly
                  disabled
                />
              </div>
            </div> */}

          </div>

          {/* <button type="button" className="create-estimate-add-title">
            + Add a title & summary
          </button> */}
        </div>

        {/* Basic Information Section */}
        <div className="create-estimate-section">
          <h3 className="create-estimate-section-title">Basic Information</h3>
          
          <div className="create-estimate-basic-info">
            {/* Disclaimer */}
            <div className="create-estimate-field create-estimate-field-half">
              <label>Disclaimer</label>
              <textarea
                value={formData.disclaimer}
                onChange={(e) => handleInputChange('disclaimer', e.target.value)}
                placeholder="Enter disclaimer text..."
                rows="8"
                className="create-estimate-textarea"
              />
              {/* Address Image */}
              <div className="create-estimate-field create-estimate-field-half mt-4">
                <label>Address Image</label>
                <div className="create-estimate-file-upload">
                  <input
                    type="file"
                    id="addressImage"
                    accept="image/*"
                    onChange={handleAddressImageChange}
                    className="create-estimate-file-input"
                  />
                  <label htmlFor="addressImage" className="create-estimate-file-label">
                    <span className="create-estimate-icon">📷</span>
                    {formData.addressImage ? 
                      (typeof formData.addressImage === 'string' ? 'Address image loaded' : formData.addressImage.name) : 
                      'Choose address image'
                    }
                  </label>
                  {formData.addressImage && (
                    <div className="create-estimate-address-image-preview">
                      <img 
                        src={typeof formData.addressImage === 'string' ? formData.addressImage : URL.createObjectURL(formData.addressImage)} 
                        alt="Address preview" 
                        className="create-estimate-address-preview-img"
                      />
                      <button
                        type="button"
                        className="create-estimate-remove-address-image"
                        onClick={() => handleInputChange('addressImage', null)}
                        title="Remove address image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Warranty */}
            <div className="create-estimate-field create-estimate-field-half">
              <label>Warranty</label>
              <textarea
                id="warranty-textarea"
                value={formData.warranty}
                onChange={handleWarrantyTextChange}
                onSelect={handleWarrantyCursorChange}
                onKeyUp={handleWarrantyCursorChange}
                onMouseUp={handleWarrantyCursorChange}
                placeholder="Enter warranty text..."
                rows="8"
                className="create-estimate-textarea"
              />
              
              {/* Warranty Variables */}
              <div className="create-estimate-variables">
                <label className="create-estimate-variables-label">Insert Variables:</label>
                <div className="create-estimate-variables-grid">
                  {warrantyVariables.map((variable) => (
                    <button
                      key={variable.key}
                      type="button"
                      className="create-estimate-variable-btn"
                      onClick={() => handleInsertVariable(variable)}
                      title={variable.description}
                    >
                      <span className="create-estimate-variable-key">{variable.key}</span>
                      <span className="create-estimate-variable-label">{variable.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Warranty Year Selection */}
            

            
          </div>
        </div>

        {/* Items Table Section */}
        <div className="create-estimate-section">
         

          <div className="create-estimate-table-wrapper">
            <table className="create-estimate-table">
              <thead>
                <tr>
                  <th style={{display: 'none'}}>Item</th>
                  <th>Description</th>
                  <th>Qty.</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} >
                    <td data-label="Item" style={{display: 'none'}}>
                      <div className="create-estimate-item-cell">
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => handleItemChange(item.id, 'item', e.target.value)}
                          className={!item.isValid ? 'error' : ''}
                          placeholder="Item"
                        />
                        {!item.isValid && <span className="error-text">Invalid item</span>}
                      </div>
                    </td>
                    <td data-label="Description">
                      <div className="create-estimate-description-cell">
                        <div className="create-estimate-description-editor">
                          <div className="quill-editor-container">
                            <ReactQuill
                              ref={(el) => { if (el) quillRefs.current[item.id] = el; }}
                              theme="snow"
                              value={item.description}
                              onChange={handleEditorChange(item.id)}
                              modules={quillModules}
                              formats={quillFormats}
                              placeholder="Enter description..."
                              readOnly={false}
                            />
                          </div>
                          <button
                            type="button"
                            className="create-estimate-add-newbox-btn"
                            onClick={() => handleInsertNewBox(item.id)}
                            title="Insert ----newBox---- and start new line"
                          >
                            + newBox
                          </button>
                        </div>
                        
                        {/* Gallery Images Section */}
                        <div className="create-estimate-gallery-section">
                          <div className="create-estimate-gallery-header">
                            <label className="create-estimate-gallery-label">Gallery Images</label>
                            <input
                              type="file"
                              id={`gallery-${item.id}`}
                              multiple
                              accept="image/*"
                              onChange={(e) => handleGalleryImageAdd(item.id, e.target.files)}
                              className="create-estimate-gallery-input"
                            />
                            <label htmlFor={`gallery-${item.id}`} className="create-estimate-gallery-upload-btn">
                              📷 Add Images
                            </label>
                          </div>
                          
                          {item.galleryImages.length > 0 && (
                            <div className="create-estimate-gallery-preview">
                              {item.galleryImages.map((image) => (
                                <div key={image.id} className="create-estimate-gallery-item">
                                  <img
                                    src={image.preview}
                                    alt={image.name}
                                    className="create-estimate-gallery-image"
                                  />
                                  <button
                                    type="button"
                                    className="create-estimate-gallery-remove"
                                    onClick={() => handleGalleryImageRemove(item.id, image.id)}
                                    title="Remove image"
                                  >
                                    ✕
                                  </button>
                                  <span className="create-estimate-gallery-name">{image.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          className="create-estimate-import-template-btn"
                          onClick={() => handleImportTemplate(item.id)}
                          title="Import template"
                        >
                          📄 Import Template
                        </button>
                      </div>
                    </td>
                    <td data-label="Qty">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td data-label="Price">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                        placeholder="0.00 (use negative for discount)"
                        step="0.01"
                      />
                    </td>
                    <td data-label="Amount">
                      <div className="create-estimate-amount-cell">
                        <span>{item.amount || '0.00'}</span>
                        <button
                          type="button"
                          className="create-estimate-remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="create-estimate-add-row" onClick={addItem}>
            Add row
          </button>

          {invalidItemsCount > 0 && (
            <div className="create-estimate-error-message">
              <span className="error-icon">⚠️</span>
              {invalidItemsCount} of the table cells have invalid data entered
            </div>
          )}

          
        </div>

        {/* Summary Section */}
        <div className="create-estimate-section">
          <div className="create-estimate-summary">
            <div className="create-estimate-summary-item">
              <span>Subtotal</span>
              <span>{totals.subtotal}</span>
            </div>
            <div className="create-estimate-summary-item">
              <span>Total discount</span>
              <span>{(totals.discount) ? '-' + totals.discount : '0.00'}</span>
            </div>
            <div className="create-estimate-summary-total">
              <span>Total</span>
              <span>{totals.total}</span>
            </div>
          </div>
        </div>

        {/* Exhibits Section */}
        <div className="create-estimate-section">
          <h3 className="create-estimate-section-title">Exhibits</h3>
          <Exhibit 
            exhibits={exhibits} 
            setExhibits={setExhibits}
          />
        </div>

        {/* Terms Section */}
        <div className="create-estimate-section">
          <h3 className="create-estimate-section-title">Terms</h3>
          <div className="create-estimate-field">
            <textarea
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              placeholder="Add any terms..."
              rows="6"
              className="create-estimate-textarea"
            />
          </div>
        </div>

        

        {/* Action Buttons */}
        <div className="create-estimate-actions">
          <div className="create-estimate-submit-buttons">
            <button type="button" className="create-estimate-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-estimate-save" disabled={isSubmitting || loadingEstimate}>
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Estimate' : 'Create Estimate')}
            </button>
          </div>
        </div>
      </form>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="create-estimate-template-modal-overlay">
          <div className="create-estimate-template-modal">
            <div className="create-estimate-template-modal-header">
              <h3>Select Template</h3>
              <button
                type="button"
                className="create-estimate-template-close"
                onClick={closeTemplateModal}
              >
                ✕
              </button>
            </div>
            
            {/* Template Search */}
            <div className="create-estimate-template-search">
              <div className="create-estimate-input-wrapper">
                <span className="create-estimate-icon">🔍</span>
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => handleTemplateSearch(e.target.value)}
                  placeholder="Search templates by name..."
                  className="create-estimate-template-search-input"
                />
                {loadingTemplates && (
                  <span className="create-estimate-loading">⟳</span>
                )}
              </div>
            </div>
            
            <div className="create-estimate-template-modal-content">
              {loadingTemplates ? (
                <div className="create-estimate-template-loading">
                  <span className="create-estimate-loading">⟳</span>
                  <span>Loading templates...</span>
                </div>
              ) : templates.length > 0 ? (
                <div className="create-estimate-template-list">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="create-estimate-template-item"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="create-estimate-template-name">
                        {template.template_name}
                      </div>
                      <div 
                        className="create-estimate-template-preview"
                        dangerouslySetInnerHTML={{ 
                          __html: template.template_content ? 
                            template.template_content.substring(0, 100) + '...' : 
                            'No content' 
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="create-estimate-template-empty">
                  <span>
                    {templateSearch.trim() ? 
                      `No templates found matching "${templateSearch}"` : 
                      'No templates available'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send for Approval Modal */}
      {showSendApproval && (
        <SendApproval
          estimate={editEstimate}
          clientEmail={clientEmail}
          mode="approval"
          onClose={() => setShowSendApproval(false)}
          onSuccess={() => {
            setShowSendApproval(false);
            setSuccessMessage('Estimate sent for approval successfully!');
          }}
          onError={(error) => {
            setEstimateApiError(error);
          }}
        />
      )}

      {/* Send to Client Modal */}
      {showSendToClient && (
        <SendApproval
          estimate={editEstimate}
          clientEmail={clientEmail}
          mode="client"
          onClose={() => setShowSendToClient(false)}
          onSuccess={() => {
            setShowSendToClient(false);
            setSuccessMessage('Estimate sent to client successfully!');
          }}
          onError={(error) => {
            setEstimateApiError(error);
          }}
        />
      )}
    </div>
  );
};

export default CreateEstimate;
