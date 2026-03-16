import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import './LeadCost.scss';
import agent from '../../../agent';

const LeadCost = () => {
  const [dateRange, setDateRange] = useState([
    moment().subtract(14, 'days').toDate(),
    moment().toDate()
  ]);
  const [source, setSource] = useState({ value: '', label: 'Select Source' });
  const [amount, setAmount] = useState('');
  const [sourceOptions, setSourceOptions] = useState(
    [
      { value: '', label: 'Select Source' },
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
  const [loadingSources, setLoadingSources] = useState(false);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const fetchSources = async () => {
      setLoadingSources(true);
      setError(null);
      try {
        // Fetch with default params to get all sources
        const response = await agent.Website.getSources();
        const sources = response?.data?.sources || [];
        // setSourceOptions([
        //   { value: '', label: 'Select Source' },
        //   ...sources.map(s => ({ value: s.STATUS_ID, label: s.NAME }))
        // ]);
      } catch (err) {
        setError('Failed to load sources');
        setSourceOptions([{ value: '', label: 'Select Source' }]);
      } finally {
        setLoadingSources(false);
      }
    };
    fetchSources();
    // eslint-disable-next-line
  }, []);

  const handleAdd = async () => {
    setSubmitLoading(true);
    setSubmitSuccess(null);
    setSubmitError(null);
    try {
      const payload = {
        source_id: source.value,
        amount: Number(amount),
        start_date: moment(startDate).format('YYYY-MM-DD'),
        end_date: moment(endDate).format('YYYY-MM-DD'),
      };
      const response = await agent.Website.addExpenses(payload);
      if (response && response.isSuccess && response.data && response.data.id) {
        setSubmitSuccess('Expense cost added successfully.');
        setSource({ value: '', label: 'Select Source' });
        setAmount('');
      } else if (response && response.isSuccess && response.data && response.data.expanse_id) {
        // Expense with overlapping date range already exists
        const confirmOverride = window.confirm('Expense with overlapping date range already exists. Do you want to override the existing data?');
        
        if (confirmOverride) {
          // Send data with existing expense ID to override
          const overridePayload = {
            ...payload,
            expanse_id: response.data.expanse_id
          };
          
          try {
            const overrideResponse = await agent.Website.addExpenses(overridePayload);
            if (overrideResponse && overrideResponse.isSuccess && overrideResponse.data && overrideResponse.data.id) {
              setSubmitSuccess('Expense cost updated successfully.');
              setSource({ value: '', label: 'Select Source' });
              setAmount('');
            } else {
              setSubmitError(overrideResponse && overrideResponse.message ? overrideResponse.message : 'Failed to update expense cost.');
            }
          } catch (overrideErr) {
            setSubmitError(overrideErr?.response?.body?.message || overrideErr.message || 'Failed to update expense cost.');
          }
        } else {
          // User cancelled the override
          setSubmitError('Operation cancelled. Expense with overlapping date range already exists.');
        }
      } else {
        setSubmitError(response && response.message ? response.message : 'Failed to add Expense cost.');
      }
    } catch (err) {
      setSubmitError(err?.response?.body?.message || err.message || 'Failed to add lead cost.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="lead-cost-page">
      <div className="lead-cost-card">
        <h2 className="lead-cost-title">Add Cost</h2>
        {error && <div className="error-message">{error}</div>}
        {submitSuccess && <div className="success-message">{submitSuccess}</div>}
        {submitError && <div className="error-message">{submitError}</div>}
        <div className="lead-cost-form-group">
          <label className="lead-cost-label">Date Range</label>
          <DateRangePicker
            initialSettings={{
              startDate: startDate,
              endDate: endDate,
              timePicker: false,
              maxDate: moment(),
              locale: { format: 'MM/DD/YYYY' },
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
            <input
              type="text"
              className="form-control lead-cost-input"
              value={
                startDate && endDate
                  ? `${moment(startDate).format('MM/DD/YYYY')} - ${moment(endDate).format('MM/DD/YYYY')}`
                  : ''
              }
              readOnly
            />
          </DateRangePicker>
        </div>
        <div className="lead-cost-form-group">
          <label className="lead-cost-label">Source</label>
          <Select
            classNamePrefix="lead-cost-select"
            options={sourceOptions}
            value={source}
            onChange={setSource}
            isLoading={loadingSources}
            isDisabled={loadingSources}
            placeholder={loadingSources ? 'Loading...' : 'Select Source'}
          />
        </div>
        <div className="lead-cost-form-group">
          <label className="lead-cost-label">Amount</label>
          <input
            type="number"
            className="form-control lead-cost-input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter Amount"
          />
        </div>
        <button className="btn btn-primary lead-cost-add-btn" onClick={handleAdd} disabled={!source.value || !amount || loadingSources || submitLoading}>
          {submitLoading ? 'Submitting...' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default LeadCost; 