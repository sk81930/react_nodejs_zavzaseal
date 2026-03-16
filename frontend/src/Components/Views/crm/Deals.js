import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import './LeadData.scss';
import agent from '../../../agent';
import { useLocation } from 'react-router-dom';
import SideModal from '../../Layouts/SideModal';
import DealContent from './dealContent';

function Deals() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState({ value: '', label: 'All Sources' });
  const [website, setWebsite] = useState({ value: 'all', label: 'All Websites' });
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([{ value: '', label: 'All Sources' }]);
  const [websiteOptions, setWebsiteOptions] = useState([{ value: 'all', label: 'All Websites' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const didSetSourceFromQuery = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Format date as Today, Yesterday, or MM/DD/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  // Format amount as USD currency
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "$0.00";
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  };

  const getDealsData = async (currentPageData = 1) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);
    try {
     
      // Use the correct getDealsData signature for sorting
      const response = await agent.Website.getDealsData(
        search,
        source.value,
        website.value,
        '', // leadType (not used for deals, so empty string)
        currentPageData,
        pageSize,
        sortField,
        sortOrder
      );
      if (
        response &&
        response.isSuccess &&
        response.data &&
        response.data.dealsData &&
        Array.isArray(response.data.dealsData.deals)
      ) {
        const mapped = response.data.dealsData.deals.map(d => ({
          id: d.id,
          title: d.title || d.TITLE || '--',
          source: d.source_name || d.source || '--',
          fullName: `${d.NAME || d.name || ''} ${d.LAST_NAME || d.last_name || ''}`.trim(),
          amount: d.opportunity || '0.00',
          createdAt: formatDate(d.begin_date)
        }));
        setTableData(mapped);
        const pagination = response.data.dealsData.pagination || {};
        setTotalCount(pagination.totalCount || mapped.length);
        setTotalPages(pagination.totalPages || 1);
        setCurrentPage(pagination.currentPage || 1);
        setPageSize(pagination.pagesize || 10);
        const sources = response.data.dealsData.sources || [];
        setSourceOptions([
          { value: '', label: 'All Sources' },
          ...sources.map(s => ({ value: s.STATUS_ID || s.source, label: s.NAME || s.source }))
        ]);
        const websites = response.data.dealsData.websites || [];
        setWebsiteOptions([
          { value: 'all', label: 'All websites' },
          ...websites.map(w => ({ value: w, label: w }))
        ]);
        setSuccessMsg(response.message || null);
      } else {
        setTableData([]);
        setErrorMsg(response && response.message ? response.message : 'No data found');
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      setTableData([]);
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
    getDealsData(currentPage);
  }, [currentPage, pageSize, sortField, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
    getDealsData(1);
  }, [search, source, website]);

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
          {/* <Select
            className="lead-data-select"
            options={websiteOptions}
            value={website}
            onChange={setWebsite}
            styles={{
              container: (provided) => ({ ...provided, width: '30%' }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          /> */}
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
              <th style={{width: '40%', cursor: 'pointer'}} onClick={() => handleSort('title')}>
                Deal {sortField === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{width: '30%', cursor: 'pointer'}} onClick={() => handleSort('opportunity')}>
                Amount {sortField === 'opportunity' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{width: '30%', cursor: 'pointer'}} onClick={() => handleSort('begin_date')}>
                Created {sortField === 'begin_date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {(tableData || []).map((row) => (
              <tr key={row.id}>
                <td data-label="Deal" style={{width: '30%'}}>
                  <div>
                    <a
                      href="#"
                      style={{color: '#007bff', textDecoration: 'underline', cursor: 'pointer'}}
                      onClick={() => {
                        setSelectedDeal(row);
                        setIsModalOpen(true);
                      }}
                    >
                      {row.title}
                    </a>
                    <div style={{fontSize: '0.9em', color: '#888'}}>{row.source}</div>
                  </div>
                </td>
                <td data-label="opportunity" style={{width: '20%'}}>
                  {row.amount !== null
                    ? `$${Number.isInteger(Number(row.amount))
                        ? Number(row.amount).toLocaleString()
                        : Number(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '')}`
                    : '--'}
                </td>
                <td data-label="begin_date" style={{width: '30%'}}>{row.createdAt}</td>
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
      {/* Deal Details Modal */}
      <SideModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        showButton={false}
        classDef="lead-details-modal"
      >
        <DealContent dealId={selectedDeal && selectedDeal.id} />
      </SideModal>
    </div>
  );
}

export default Deals; 