import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import './WebsiteData.scss';
import { WEBSITE_DATA } from '../../../constants/actionTypes';
import agent from '../../../agent';
import moment from 'moment';
import { Link } from 'react-router-dom';

const mapStateToProps = (state) => ({
  ...state,
  websiteData: state.auth.websiteData,
});

const mapDispatchToProps = (dispatch) => ({
});

// WebsiteData component for website leads reporting, matching the provided UI image
function WebsiteData() {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState({ value: '', label: 'All Sources' });
  const [website, setWebsite] = useState({ value: 'all', label: 'All Websites' });
  const [dateRange, setDateRange] = useState([
    moment().subtract(14, 'days').toDate(),
    moment().toDate()
  ]);
  const [startDate, endDate] = dateRange;
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [sourceOptions, setSourceOptions] = useState(
    [
      { value: '', label: 'All Sources' },
      { value: 'FaceBook Ads', label: 'FaceBook Ads' },
      { value: 'Google Ads', label: 'Google Ads' },
      { value: 'GLSA', label: 'GLSA' },
      { value: 'Referral', label: 'Referral' },
      { value: 'SEO', label: 'SEO' },
      { value: 'Social Media', label: 'Social Media' },
      { value: 'Thumbtack', label: 'Thumbtack' },
      { value: 'Yelp', label: 'Yelp' },
    ]
  );
  const [websiteOptions, setWebsiteOptions] = useState([{ value: 'all', label: 'All Websites' }]);
  const [leadType, setLeadType] = useState({ value: '', label: 'All Lead Types' });
  const [leadTypeOptions, setLeadTypeOptions] = useState([{ value: '', label: 'All Lead Types' }]);

  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const getWebsiteData = async () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const queryParams = {
        search: search,
        source: source.value,
        website: website.value,
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        leadType: leadType.value
      };

      let allsources = []
      sourceOptions.forEach(s => {
        if (s.value) {
          allsources.push(s.value)
        }
      })
      allsources = allsources.join(',')

      
      const response = await agent.Website.getWebsiteData(
        queryParams.search,
        queryParams.source,
        queryParams.website,
        queryParams.startDate,
        queryParams.endDate,
        queryParams.leadType,
        allsources
      );

      console.log(JSON.stringify(response, null, 2));
      if (
        response &&
        response.isSuccess &&
        response.data &&
        response.data.leadsData &&
        Array.isArray(response.data.leadsData.leads)
      ) {
        // Table data
        const mapped = response.data.leadsData.leads.map(d => {
          const totalLeads = Number(d.total_leads);
          const cost = Number(d.total_expenses);
          const appointments = Number(d.appointments_sum);
          return {
            name: d.source_name,
            source_id: d.SOURCE_ID,
            totalLeads,
            appointments,
            cost,
            costPerLead: totalLeads > 0 ? (cost / totalLeads) : null,
            costPerAppointment: appointments > 0 ? (cost / appointments) : null,
            totalCost: cost,
          };
        });
        setTableData(mapped);

        // Source select
        const sources = response.data.leadsData.sources || [];
        // setSourceOptions([
        //   { value: '', label: 'All Sources' },
        //   ...sources.map(s => ({ value: s.STATUS_ID || s.source || s.value || '', label: s.NAME || s.source || s.label || '' }))
        // ]);

        // Website select
        const websites = response.data.leadsData.websites || [];
        setWebsiteOptions([
          { value: 'all', label: 'All Websites' },
          ...websites.map(w => ({ value: w.ID || w, label: w.VALUE }))
        ]);

        // Lead type select
        const leadTypes = response.data.leadsData.leadTypes || [];
        setLeadTypeOptions([
          { value: '', label: 'All Lead Types' },
          ...leadTypes.map(t => ({ value: t.lead_type || t.value || t, label: t.lead_type || t.label || t }))
        ]);

        setSuccessMsg(response.message || null);
      } else {
        setTableData([]);
        setErrorMsg(response && response.message ? response.message : 'No data found');
      }
    } catch (error) {
      setTableData([]);
      if (error.response && error.response.body && error.response.body.message) {
        setErrorMsg(error.response.body.message);
      } else {
        setErrorMsg(error.message);
      }
    }
  };

  useEffect(() => {
    getWebsiteData();
    // eslint-disable-next-line
  }, [search, source, website, dateRange, leadType]);

  // Grand total calculations
  const grandTotal = {
    totalLeads: (tableData || []).reduce((sum, r) => sum + r.totalLeads, 0),
    appointments: (tableData || []).reduce((sum, r) => sum + r.appointments, 0),
    totalCost: (tableData || []).reduce((sum, r) => sum + (r.cost || 0), 0),
    costPerLead: (tableData || []).reduce((sum, r) => sum + (r.costPerLead || 0), 0),
    costPerAppointment: (tableData || []).reduce((sum, r) => sum + (r.costPerAppointment || 0), 0),
  };

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="website-data-container">
      {successMsg && <div className="success-message">{successMsg}</div>}
      {errorMsg && <div className="error-message">{errorMsg}</div>}
      <div className="website-data-header">
        <input
          className="website-data-search"
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="website-data-filters">
          <Select
            className="website-data-select"
            options={sourceOptions}
            value={source}
            onChange={setSource}
            placeholder="All Sources"
          />
          <Select
            className="website-data-select"
            options={websiteOptions}
            value={website}
            onChange={setWebsite}
            placeholder="All Websites"
          />
          <Select
            className="website-data-select"
            options={leadTypeOptions}
            value={leadType}
            onChange={setLeadType}
            placeholder="All Lead Types"
          />
          <DateRangePicker
            initialSettings={{
              startDate: startDate,
              endDate: endDate,
              timePicker: false,
              maxDate: moment(),
              locale: {
                format: 'MM/DD/YYYY'
              },
              ranges: {
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Previous Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()]
              }
            }}
            onApply={(event, picker) => {
              setDateRange([picker.startDate.toDate(), picker.endDate.toDate()]);
            }}
          >
            <div className="website-data-datepicker-wrapper">
              <input
                type="text"
                className="website-data-datepicker"
                value={
                  startDate && endDate
                    ? `${moment(startDate).format('MM/DD/YYYY')} - ${moment(endDate).format('MM/DD/YYYY')}`
                    : ''
                }
                readOnly
              />
              <span className="calendar-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#28a8e2" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1zm10 4H7H5v14h14V6h-2zm-7 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
              </span>
            </div>
          </DateRangePicker>
        </div>
      </div>
      <div className="website-data-table-wrapper">
        <table className="website-data-table">
          <thead>
            <tr>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('name')}>
                Source {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('totalLeads')}>
                Leads {sortField === 'totalLeads' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('appointments')}>
                Appointments {sortField === 'appointments' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('costPerLead')}>
                Cost Per Lead {sortField === 'costPerLead' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('costPerAppointment')}>
                Cost Per Appointment {sortField === 'costPerAppointment' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{cursor: 'pointer'}} onClick={() => handleSort('totalCost')}>
                Total Cost {sortField === 'totalCost' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {[...(tableData || [])]
              .sort((a, b) => {
                if (!sortField) return 0;
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Handle null/undefined: always sort them to the bottom
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                // If both are numbers, compare numerically
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                  return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }

                // Otherwise, compare as strings
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
              })
              .map((row, idx) => (
                <tr key={`${row.source_id}-${idx}`}>
                  <td className="website-logo-cell" data-label="Source">
                    {/* <Link to={`/crm?source=${encodeURIComponent(row.source_id)}`}>{row.name}</Link> */}
                    {row.name}
                  </td>
                  <td data-label="Leads">{row.totalLeads}</td>
                  <td data-label="Appointments">{row.appointments}</td>
                  <td data-label="Cost Per Lead">{row.costPerLead !== null && row.costPerLead > 0 ? `$${Number.isInteger(row.costPerLead) ? row.costPerLead.toLocaleString() : row.costPerLead.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '')}` : '--'}</td>
                  <td data-label="Cost Per Appointment">{row.costPerAppointment !== null  && row.costPerAppointment > 0 ? `$${Number.isInteger(row.costPerAppointment) ? row.costPerAppointment.toLocaleString() : row.costPerAppointment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '')}` : '--'}</td>
                  <td data-label="Total Cost">{row.totalCost !== null  && row.totalCost > 0 ? <span className="cost-badge">{Number.isInteger(row.totalCost) ? `$${row.totalCost.toLocaleString()}` : `$${row.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '')}`}</span> : '--'}</td>
                </tr>
              ))}
            {(tableData || []).length === 0 && (
              <tr>
                <td colSpan="6" className="no-data-row">No data found</td>
              </tr>
            )}
            {(tableData || []).length > 0 && (
              <tr className="grand-total-row">
                <td data-label="Source">Grand Total</td>
                <td data-label="Leads">{grandTotal.totalLeads}</td>
                <td data-label="Appointments">{grandTotal.appointments}</td>
                <td data-label="Cost Per Lead">{grandTotal.costPerLead !== 0 ? `$${Number.isInteger(grandTotal.costPerLead) ? grandTotal.costPerLead.toLocaleString() : grandTotal.costPerLead.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '')}` : '--'}</td>
                <td data-label="Cost Per Appointment">{grandTotal.costPerAppointment !== 0 ? `$${Number.isInteger(grandTotal.costPerAppointment) ? grandTotal.costPerAppointment.toLocaleString() : grandTotal.costPerAppointment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '')}` : '--'}</td>
                <td data-label="Total Cost">{grandTotal.totalCost > 0 ? <span className="cost-badge">{Number.isInteger(grandTotal.totalCost) ? `$${grandTotal.totalCost.toLocaleString()}` : `$${grandTotal.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '')}`}</span> : '--'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(WebsiteData); 