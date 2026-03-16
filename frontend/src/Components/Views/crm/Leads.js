import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import './LeadData.scss';
import agent from '../../../agent';
import { useLocation } from 'react-router-dom';
import SideModal from '../../Layouts/SideModal';
import LeadContent from './leadContent';

function get_dropdown_field(val,fieldname,fields) {
  if (!val || !fields || !fields[fieldname]) return "";

  const field = fields[fieldname];
  const selectedId = val;
  if (field && Array.isArray(field.items) && selectedId) {
    const found = field.items.find(item => String(item.ID) === String(selectedId));
    return  found ? found.VALUE : "";
  }
  return "";

}


function Leads() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState({ value: '', label: 'All Sources' });
  const [website, setWebsite] = useState({ value: 'all', label: 'All Websites' });
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([{ value: '', label: 'All Sources' }]);
  const [websiteOptions, setWebsiteOptions] = useState([{ value: 'all', label: 'All Websites' }]);
  const [leadType, setLeadType] = useState({ value: '', label: 'All Lead Types' });
  const [leadTypeOptions, setLeadTypeOptions] = useState([{ value: '', label: 'All Lead Types' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const didSetSourceFromQuery = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Format date as Today, Yesterday, or MM/DD/YYYY
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

  const getLeadData = async (currentPageData = 1) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const queryParams = {
        search: search,
        source: source.value,
        website: website.value,
        leadType: leadType.value,
        page: currentPageData,
        limit: pageSize,
        sortField,
        sortOrder
      };
      const response = await agent.Website.getLeadsData(
        queryParams.search,
        queryParams.source,
        queryParams.website,
        queryParams.leadType,
        queryParams.page,
        queryParams.limit,
        queryParams.sortField,
        queryParams.sortOrder
      );
      if (
        response &&
        response.isSuccess &&
        response.data &&
        response.data.dealsData &&
        Array.isArray(response.data.dealsData.leads)
      ) {
        let fields = response.data.dealsData.fields;
        const mapped = response.data.dealsData.leads.map(d => {
          // Modify or add data as needed

          let lead_json_data = d.lead_json_data;
          const fullName = `${d.NAME || ""} ${d.LAST_NAME || ""}`.trim();
          const title = d.TITLE ? d.TITLE.trim() : "--";
          const source = d.source_name || "--";
          const createdAt = formatDate(d.DATE_CREATE); 
          const phone_number = (lead_json_data.UF_CRM_1669989873114)?lead_json_data.UF_CRM_1669989873114:'';
          
          let estimator = get_dropdown_field(lead_json_data.UF_CRM_1671573088,"UF_CRM_1671573088",fields);

          const appointment_status = get_dropdown_field(lead_json_data.UF_CRM_1671573749,"UF_CRM_1671573749",fields);
          const project_description = get_dropdown_field(lead_json_data.UF_CRM_1672946127,"UF_CRM_1672946127",fields);
          const promocode = (lead_json_data.UF_CRM_1672946127)?lead_json_data.UF_CRM_1674584966279:'';
          const financial_program_old = get_dropdown_field(lead_json_data.UF_CRM_1679479220,"UF_CRM_1679479220",fields);
          const financial_program = get_dropdown_field(lead_json_data.UF_CRM_1682351561,"UF_CRM_1682351561",fields);
          const other_project_desc = (lead_json_data.UF_CRM_1693388917)?lead_json_data.UF_CRM_1693388917:'';
          const call_source = (lead_json_data.UF_CRM_1702674637)?lead_json_data.UF_CRM_1702674637:'';


        
          return {
            id: d.id,
            title,       // modified title
            source,      // fallback if null
            fullName,   
            phone_number,
            estimator,
            appointment_status,
            project_description,
            promocode,
            financial_program_old,
            financial_program,
            other_project_desc,
            call_source,
            createdAt
          };
        });
        setTableData(mapped);
        const pagination = response.data.dealsData.pagination || {};
        setTotalCount(pagination.totalCount || mapped.length);
        setTotalPages(pagination.totalPages || 1);
        setCurrentPage(pagination.currentPage || 1);
        setPageSize(pagination.pagesize || 10);
        const sources = response.data.dealsData.sources || [];
        setSourceOptions([
          { value: '', label: 'All Sources' },
          ...sources.map(s => ({ value: s.STATUS_ID, label: s.NAME }))
        ]);
        const websites = response.data.dealsData.websites || [];
        setWebsiteOptions([
          { value: 'all', label: 'All Websites' },
          ...websites.map(w => ({ value: w.ID, label: w.VALUE }))
        ]);
        const leadTypes = response.data.dealsData.leadTypes || [];
        setLeadTypeOptions([
          { value: '', label: 'All Lead Types' },
          ...leadTypes.map(t => ({ value: t.lead_type, label: t.lead_type }))
        ]);
        setSuccessMsg(response.message || null);
      } else {
        setTableData([]);
        //setSourceOptions([{ value: '', label: 'Select source' }]);
       // setWebsiteOptions([{ value: 'all', label: 'all website' }]);
        setErrorMsg(response && response.message ? response.message : 'No data found');
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      setTableData([]);
      //setSourceOptions([{ value: '', label: 'Select source' }]);
    //  setWebsiteOptions([{ value: 'all', label: 'all website' }]);
      setTotalCount(0);
      setTotalPages(1);
      if (error.response && error.response.body && error.response.body.message) {
        setErrorMsg(error.response.body.message);
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    getLeadData(currentPage);
    // eslint-disable-next-line
  }, [currentPage, pageSize, sortField, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
    getLeadData(1);
  }, [search, source, website, leadType]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sourceParam = params.get('source');
    if (!didSetSourceFromQuery.current && sourceParam) {
      const match = sourceOptions.find(opt => (opt.value || '').toLowerCase() === sourceParam.toLowerCase());
      if (match) {
        setSource(match);
        didSetSourceFromQuery.current = true;
      }
    }
  }, [location.search, sourceOptions]);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }
    if (startPage > 1) {
      pageNumbers.unshift(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
      pageNumbers.unshift(
        <button key={1} onClick={() => setCurrentPage(1)} className={currentPage === 1 ? 'active' : ''}>1</button>
      );
    }
    if (endPage < totalPages) {
      pageNumbers.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
      pageNumbers.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={currentPage === totalPages ? 'active' : ''}>{totalPages}</button>
      );
    }
    return pageNumbers;
  };

  const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="lead-data-container">
      {successMsg && <div className="success-message">{successMsg}</div>}
      {errorMsg && <div className="error-message">{errorMsg}</div>}
      <div className="lead-data-header">
        <input
          className="lead-data-search"
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="lead-data-filters">
          <Select
            className="lead-data-select"
            options={sourceOptions}
            value={source}
            onChange={setSource}
            styles={{
              container: (provided) => ({ ...provided, width: '30%' }),
            }}
          />
          <Select
            className="lead-data-select"
            options={websiteOptions}
            value={website}
            onChange={setWebsite}
            styles={{
              container: (provided) => ({ ...provided, width: '30%' }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
          <Select
            className="lead-data-select"
            options={leadTypeOptions}
            value={leadType}
            onChange={setLeadType}
            styles={{
              container: (provided) => ({ ...provided, width: '20%' })
            }}
          />
        </div>
      </div>
      <div className="lead-data-table-wrapper">
        {loading && (
          <div className="lead-data-loading">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        )}
        <table className="lead-data-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th  style={{minWidth: '190px'}}>Source</th>
              <th>Full name</th>
              <th>Created</th>
              <th>Phone number (CRM-form on the website)</th>
              <th>Estimator</th>
              <th>Appointment status</th>
              <th>Project description</th>
              <th>Promocode</th>
              <th>Financial program (NG/PP) (old)</th>
              <th>Financial program (NG/PP/HRT)</th>
              <th>Other project description</th>
              <th>Call Source</th>
              
            </tr>
          </thead>
          <tbody>
            {(tableData || []).map((row) => (
              <tr key={row.id}>
                <td data-label="Lead">
                  <div>
                    <button
                      type="button"
                      style={{
                        color: '#007bff', 
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        textAlign: 'left'
                      }}
                      onClick={() => {
                        setSelectedLead(row);
                        setIsModalOpen(true);
                      }}
                    >
                      {row.title}
                    </button>
                  </div>
                </td>
                <td data-label="source" >{row.source}</td>
                <td data-label="fullName" >{row.fullName}</td>
                <td data-label="Created" >{row.createdAt}</td>
                <td data-label="phone_number" >{row.phone_number}</td>
                <td data-label="estimator" >{row.estimator}</td>
                <td data-label="appointment_status" >{row.appointment_status}</td>
                <td data-label="project_description" >{row.project_description}</td>
                <td data-label="promocode" >{row.promocode}</td>
                <td data-label="financial_program_old" >{row.financial_program_old}</td>
                <td data-label="financial_program" >{row.financial_program}</td>
                <td data-label="other_project_desc" >{row.other_project_desc}</td>
                <td data-label="call_source" >{row.call_source}</td>
              </tr>
            ))}
            {(tableData || []).length === 0 && (
              <tr>
                <td colSpan="4" className="no-data-row">No data found</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination-info">
          {totalCount > 0 ? `Showing ${startIdx}–${endIdx} of ${totalCount}` : 'No results'}
        </div>
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
            <div className="pagination-pages">
              {renderPageNumbers()}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>
      {/* Lead Details Modal */}
      <SideModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        showButton={false}
        classDef="lead-details-modal"
      >
        <LeadContent leadId={selectedLead && selectedLead.id} />
      </SideModal>
    </div>
  );
}

export default Leads; 