import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { WEBSITE_DATA } from '../../../constants/actionTypes';
import agent from '../../../agent';
import moment from 'moment';
import { useLocation } from 'react-router-dom';

const mapStateToProps = (state) => ({
  ...state,
  leadData: state.auth.leadData,
});

const mapDispatchToProps = (dispatch) => ({
});

// LeadData component for leads reporting, similar to WebsiteData but with pagination
function LeadData() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState({ value: '', label: 'All source' });
  const [website, setWebsite] = useState({ value: 'all', label: 'All website' });
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([{ value: '', label: 'All source' }]);
  const [websiteOptions, setWebsiteOptions] = useState([{ value: 'all', label: 'All website' }]);
  const [leadType, setLeadType] = useState({ value: '', label: 'All Lead Types' });
  const leadTypeOptions = [
    { value: '', label: 'All Lead Types' },
    { value: 'form_call', label: 'Form Call' },
    { value: 'form_submission', label: 'Form Submission' }
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [sortField, setSortField] = useState(''); // e.g., 'title', 'source', etc.
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const didSetSourceFromQuery = useRef(false);

  const getLeadData = async () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const queryParams = {
        search: search,
        source: source.value,
        website: website.value,
        leadType: leadType.value,
        page: currentPage,
        limit: pageSize,
        sortField,
        sortOrder
      };
      // TODO: Replace with actual agent.Lead.getLeadData API call
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

      console.log(JSON.stringify(response, null, 2));
      if (
        response &&
        response.isSuccess &&
        response.data &&
        response.data.dealsData &&
        Array.isArray(response.data.dealsData.leads)
      ) {
        // Table data
        const mapped = response.data.dealsData.leads.map(d => ({
          id: d.id,
          title: d.title,
          source: (d.source)?d.source:"--",
          website: (d.website)?d.website:"--",
          type: d.type || '--',
          opportunity: Number(d.opportunity),
          appointments: (d.appointments)?Number(d.appointments):"--",
          phone: d.phone || '--',
        }));
        setTableData(mapped);
        const pagination = response.data.dealsData.pagination || {};
        setTotalCount(pagination.totalCount || mapped.length);
        setTotalPages(pagination.totalPages || 1);
        setCurrentPage(pagination.currentPage || 1);
        setPageSize(pagination.pagesize || 10);

        // Source select (optional, if available)
        const sources = response.data.dealsData.sources || [];
        setSourceOptions([
          { value: '', label: 'Select source' },
          ...sources.map(s => ({ value: s.source, label: s.source }))
        ]);

        // Website select (optional, if available)
        const websites = response.data.dealsData.websites || [];
        setWebsiteOptions([
          { value: 'all', label: 'all website' },
          ...websites.map(w => ({ value: w.website, label: w.website }))
        ]);

        setSuccessMsg(response.message || null);
      } else {
        setTableData([]);
        setSourceOptions([{ value: '', label: 'Select source' }]);
        setWebsiteOptions([{ value: 'all', label: 'all website' }]);
        setErrorMsg(response && response.message ? response.message : 'No data found');
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      setTableData([]);
      setSourceOptions([{ value: '', label: 'Select source' }]);
      setWebsiteOptions([{ value: 'all', label: 'all website' }]);
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
    getLeadData();
    // eslint-disable-next-line
  }, [search, source, website, leadType, currentPage, pageSize, sortField, sortOrder]);

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

  // Pagination controls
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

  // Calculate current range for pagination info
  const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
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
          />
          <Select
            className="lead-data-select"
            options={websiteOptions}
            value={website}
            onChange={setWebsite}
          />
          <Select
            className="lead-data-select"
            options={leadTypeOptions}
            value={leadType}
            onChange={setLeadType}
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
              <th style={{width: '25%', cursor: 'pointer'}} onClick={() => handleSort('phone')}>
                Phone {sortField === 'phone' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{width: '15%', cursor: 'pointer'}} onClick={() => handleSort('source')}>
                Source {sortField === 'source' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{width: '18%', cursor: 'pointer'}} onClick={() => handleSort('website')}>
                Website {sortField === 'website' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{width: '15%', cursor: 'pointer'}} onClick={() => handleSort('type')}>
                Type {sortField === 'type' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{width: '15%', cursor: 'pointer'}} onClick={() => handleSort('appointments')}>
                Appointments {sortField === 'appointments' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {(tableData || []).map((row) => (
              <tr key={row.id}>
                <td data-label="Phone" style={{width: '25%'}}>{row.phone || '--'}</td>
                <td data-label="Source" style={{width: '15%'}}>{row.source}</td>
                <td data-label="Website" style={{width: '18%'}}>{row.website}</td>
                <td data-label="Type" style={{width: '15%'}}>{row.type || '--'}</td>
                <td data-label="Appointments" style={{width: '15%'}}>{row.appointments}</td>
              </tr>
            ))}
            {(tableData || []).length === 0 && (
              <tr>
                <td colSpan="5" className="no-data-row">No data found</td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination Info and Controls */}
        <div className="pagination-info">
          {totalCount > 0 ? `Showing ${startIdx}–${endIdx} of ${totalCount}` : 'No results'}
        </div>
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
            <div className="pagination-pages">
              {renderPageNumbers()}
            </div>
            {/* <span className="pagination-divider"></span> */}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            {/* <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
              {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size} / page</option>)}
            </select> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(LeadData); 