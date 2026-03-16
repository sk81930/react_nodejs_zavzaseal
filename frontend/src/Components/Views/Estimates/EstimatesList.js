import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
// import Select from 'react-select'; // Commented out - not currently used
import './EstimatesList.scss';
import agent from '../../../agent';
import { useLocation, useNavigate } from 'react-router-dom';
import SideModal from '../../Layouts/SideModal';
import EstimateContent from './EstimateContent';
import CreateEstimate from './CreateEstimate';

function get_dropdown_field(val, fieldname, fields) {
  if (!val || !fields || !fields[fieldname]) return "";

  const field = fields[fieldname];
  const selectedId = val;
  if (field && Array.isArray(field.items) && selectedId) {
    const found = field.items.find(item => String(item.ID) === String(selectedId));
    return found ? found.VALUE : "";
  }
  return "";
}

function EstimatesList({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState({ value: '', label: 'All Status' });
  const [customer, setCustomer] = useState({ value: 'all', label: 'All Customers' });
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [statusOptions, setStatusOptions] = useState([{ value: '', label: 'All Status' }]);
  const [customerOptions, setCustomerOptions] = useState([{ value: 'all', label: 'All Customers' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const getEstimatesData = async (currentPageData = 1) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const queryParams = {
        search: search,
        status: status.value,
        customer: customer.value,
        page: currentPageData,
        limit: pageSize,
        sortField,
        sortOrder
      };
      
      // Mock API call - replace with actual API endpoint
      const response = await agent.estimates.getEstimatesData(
        queryParams.search,
        queryParams.status,
        queryParams.customer,
        queryParams.page,
        queryParams.limit,
        queryParams.sortField,
        queryParams.sortOrder
      );
      

      
      if (response && response.isSuccess && response.data && response.data.estimates) {
        const mapped = response.data.estimates.data.map(d => {
          let customerName = d.lead || "--";
          if(d.lead_data && d.lead_data.NAME){
            customerName = d.lead_data.NAME;
            if(d.lead_data.LAST_NAME){
              customerName += " " + d.lead_data.LAST_NAME;
            }
          }
          if(d.lead_data.lead_id){
            customerName += " #" + d.lead_data.lead_id;
          }
          const estimateNumber = "E-000" + d.id || "--";
          const status = "Draft"; // Default status since it's not in the API response
          const totalAmount = d.totals && d.totals.total ? `$${parseFloat(d.totals.total).toFixed(2)}` : "--";
          const createdAt = formatDate(d.created_at);
          const validUntil = formatDate(d.expiry_date);
          const clientMailSent = d.client_mail_sent || false;
          
          return {
            id: d.id,
            estimateNumber,
            customerName,
            status,
            totalAmount,
            createdAt,
            validUntil,
            clientMailSent
          };
        });
        setTableData(mapped);
        const pagination = response.data.estimates.pagination || {};
        setTotalCount(pagination.totalCount || mapped.length);
        setTotalPages(pagination.totalPages || 1);
        setCurrentPage(parseInt(pagination.currentPage) || 1);
        setPageSize(pagination.pageSize || 30);
        
        // Set default status options since they're not in the API response
        setStatusOptions([
          { value: '', label: 'All Status' },
          { value: 'draft', label: 'Draft' },
          { value: 'sent', label: 'Sent' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'rejected', label: 'Rejected' }
        ]);
        
        // Set default customer options since they're not in the API response
        setCustomerOptions([
          { value: 'all', label: 'All Customers' },
          ...mapped.map((item, index) => ({ 
            value: item.customerName, 
            label: item.customerName 
          })).filter((item, index, self) => 
            index === self.findIndex(t => t.value === item.value)
          )
        ]);
        
       // setSuccessMsg(response.message || null);
      } else {
        setTableData([]);
        setErrorMsg(response && response.message ? response.message : 'No data found');
        setTotalCount(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      setTableData([]);
      setTotalCount(0);
      setTotalPages(1);
      setCurrentPage(1);
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
    getEstimatesData(currentPage);
    // eslint-disable-next-line
  }, [currentPage, pageSize, sortField, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
    getEstimatesData(1);
  }, [search, status, customer]);

  // Handle URL query parameters for success and error messages
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const successParam = urlParams.get('success');
    const errorParam = urlParams.get('error');

    if (successParam) {
      setSuccessMsg(decodeURIComponent(successParam));
      // Clear the success parameter from URL after showing the message
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('success');
      const newSearch = newSearchParams.toString();
      navigate(`${location.pathname}${newSearch ? '?' + newSearch : ''}`, { replace: true });
    }

    if (errorParam) {
      setErrorMsg(decodeURIComponent(errorParam));
      // Clear the error parameter from URL after showing the message
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('error');
      const newSearch = newSearchParams.toString();
      navigate(`${location.pathname}${newSearch ? '?' + newSearch : ''}`, { replace: true });
    }
  }, [location.search, navigate, location.pathname]);

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

  const handleEditEstimate = (estimate) => {
    console.log('Edit estimate:', estimate);
    setSelectedEstimate(estimate);
    setIsCreateModalOpen(true); // Reuse create modal for editing
  };

  const handleDeleteEstimate = async (estimate) => {
    if (window.confirm(`Are you sure you want to delete estimate ${estimate.estimateNumber}?`)) {
      try {
        setLoading(true);
        // TODO: Implement delete API call
        await agent.estimates.deleteEstimate(estimate.id);
        
        // For now, just show success message and refresh data
        setSuccessMsg(`Estimate ${estimate.estimateNumber} deleted successfully`);
        await getEstimatesData(currentPage);
      } catch (error) {
        setErrorMsg('Failed to delete estimate');
        console.error('Delete error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="estimates-list-container">
      {successMsg && <div className="success-message">{successMsg}</div>}
      {errorMsg && <div className="error-message">{errorMsg}</div>}
      <div className="estimates-list-header">
        <input
          className="estimates-list-search"
          type="text"
          placeholder="Search estimates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="estimates-list-filters">
          {/* <Select
            className="estimates-list-select"
            options={statusOptions}
            value={status}
            onChange={setStatus}
            styles={{
              container: (provided) => ({ ...provided, width: '30%' }),
            }}
          />
          <Select
            className="estimates-list-select"
            options={customerOptions}
            value={customer}
            onChange={setCustomer}
            styles={{
              container: (provided) => ({ ...provided, width: '30%' }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          /> */}
        </div>
        <button 
          className="estimates-list-create-btn"
          onClick={() => {
            setSelectedEstimate(null); // Clear any selected estimate
            setIsCreateModalOpen(true);
          }}
        >
          + Create Estimate
        </button>
      </div>
      <div className="estimates-list-table-wrapper">
        {loading && (
          <div className="estimates-list-loading">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        )}
        <table className="estimates-list-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('estimateNumber')}>
                Estimate #
                {sortField === 'estimateNumber' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('customerName')}>
                Lead Customer Name And ID
                {sortField === 'customerName' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              {/* <th onClick={() => handleSort('status')}>
                Status
                {sortField === 'status' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th> */}
              <th onClick={() => handleSort('totalAmount')}>
                Total Amount
                {sortField === 'totalAmount' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('createdAt')}>
                Created
                {sortField === 'createdAt' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th>Client Mail Sent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(tableData || []).map((row) => (
              <tr key={row.id}>
                <td data-label="Estimate #">
                  <div>
                    <button
                      type="button"
                      style={{
                        color: '#28a8e2', 
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        textAlign: 'left'
                      }}
                      onClick={() => handleEditEstimate(row)}
                    >
                      {row.estimateNumber}
                    </button>
                  </div>
                </td>
                <td data-label="Customer">{row.customerName}</td>
                {/* <td data-label="Status">
                  <span className={`status-badge status-${row.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {row.status}
                  </span>
                </td> */}
                <td data-label="Total Amount">{row.totalAmount}</td>
                <td data-label="Created">{row.createdAt}</td>
                <td data-label="Client Mail Sent">
                  <div className="client-mail-status">
                    {row.clientMailSent ? (
                      <span className="status-icon checked" title="Client mail sent">✅</span>
                    ) : (
                      <span className="status-icon unchecked" title="Client mail not sent">❌</span>
                    )}
                  </div>
                </td>
                <td data-label="Actions">
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditEstimate(row)}
                      title="Edit Estimate"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteEstimate(row)}
                      title="Delete Estimate"
                    >
                      🗑️
                    </button>

                    {/* <button 
                      className="btn-download"
                      title="Download PDF"
                    >
                      📄
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
            {(tableData || []).length === 0 && (
              <tr>
                <td colSpan="6" className="no-data-row">No estimates found</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination-info">
          {totalCount > 0 ? `Showing ${startIdx}–${endIdx} of ${totalCount}` : ''}
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
      {/* Estimate Details Modal */}
      <SideModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        showButton={false}
        classDef="estimate-details-modal"
      >
        <EstimateContent estimateId={selectedEstimate && selectedEstimate.id} />
      </SideModal>

      {/* Create/Edit Estimate Modal */}
      <SideModal
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
        showButton={false}
        classDef="create-estimate-modal"
      >
        <CreateEstimate 
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedEstimate(null);
          }} 
          currentUser={currentUser}
          onSuccess={() => getEstimatesData(currentPage)}
          editEstimate={selectedEstimate}
        />
      </SideModal>
    </div>
  );
}

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
});

export default connect(mapStateToProps)(EstimatesList);
