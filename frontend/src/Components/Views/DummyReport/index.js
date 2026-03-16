import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MDBContainer, 
  MDBCard, 
  MDBCardBody, 
  MDBCardHeader, 
  MDBBtn, 
  MDBIcon,
  MDBRow,
  MDBCol,
  MDBBadge
} from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import Select from 'react-select';
import DateRangePicker from 'react-bootstrap-daterangepicker'; 
import 'bootstrap-daterangepicker/daterangepicker.css';
import { LuChartNoAxesCombined } from "react-icons/lu";
import agent from '../../../agent';

import './DummyReport.scss';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import moment from 'moment';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const chartColors = [
  'rgba(63, 81, 181, 0.5)',
  'rgba(77, 182, 172, 0.5)',
  'rgba(66, 133, 244, 0.5)',
  'rgba(156, 39, 176, 0.5)',
  'rgba(233, 30, 99, 0.5)',
  'rgb(243 218 230)',
  'rgb(223 218 255)',
  'rgb(243 239 221)',
  'rgb(243 230 217)',
  'rgb(243 230 299)',
  'rgb(243 230 244)',
  'rgb(243 230 255)',
  'rgb(243 230 277)',
];

const DummyReport = () => {
  // Local state for report data
  const [reportData, setReportData] = useState(null);
  const [reportChartData1, setReportChartData1] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingChartData, setLoadingChartData] = useState(false);

  // State for multiple filter instances
  // State for API options
  const [projectTypeOptions, setProjectTypeOptions] = useState([
    { value: 'All', label: 'All Project Types' }
  ]);
  const [leadFunnelOptions, setLeadFunnelOptions] = useState([
    { value: 'All', label: 'All Lead Funnels' }
  ]);
  const [projectLocationOptions, setProjectLocationOptions] = useState([
    { value: 'All', label: 'All Locations' }
  ]);
  
  // Loading states for options
  const [loadingProjectTypes, setLoadingProjectTypes] = useState(false);
  const [loadingLeadFunnels, setLoadingLeadFunnels] = useState(false);
  const [loadingProjectLocations, setLoadingProjectLocations] = useState(false);
  
  // Error states for options
  const [errorProjectTypes, setErrorProjectTypes] = useState(null);
  const [errorLeadFunnels, setErrorLeadFunnels] = useState(null);
  const [errorProjectLocations, setErrorProjectLocations] = useState(null);
  const [newInstanceId, setNewInstanceId] = useState(1);
  const [changeFilter, setChangeFilter] = useState(null);

  const [filterInstances, setFilterInstances] = useState([
    {
      id: 1,
      name: 'Filter Instance 1',
      leadMonth: { value: moment().format('MMMM'), label: moment().format('MMMM') },
      projectType: { value: 'All', label: 'All Project Types' },
      leadFunnel: { value: 'All', label: 'All Lead Funnels' },
      projectLocation: { value: 'All', label: 'All Locations' },
      tags: { value: 'All', label: 'All Tags' },
      dateRange1: { 
        startDate: moment([moment().year(), moment().month()]).startOf('month').toDate(), 
        endDate: moment([moment().year(), moment().month()]).endOf('month').toDate(), 
        key: 'selection1' 
      },
      showTable: true,
      showChart: true, 
      chartData: null,
      chartLoading: false,
      currentPage: 1,
      perPage: 10,
      totalRows: 0,
      reports: [],
      loading: true
    }
  ]);





  const leadMonthOptions = [
    { value: 'All', label: 'Lead Month' },
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' },
  ];

  const tagOptions = [
    { value: 'All', label: 'All Tags' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Repeat Customer', label: 'Repeat Customer' },
    { value: 'ConEdison', label: 'ConEdison' },
    { value: 'PSEG', label: 'PSEG' },
  ];

  const columns = [
    {
      name: '#',
      selector: (_, index) => index + 1,  
      sortable: true,
      width: '8%',
    },
    { 
      name: 'Lead Date', 
      selector: (row) => {
        return row.lead_date ? moment.utc(row.lead_date).format('DD MMM YYYY') : 'N/A';
      }, 
      sortable: true, 
      width: '15%' 
    },
    { 
      name: 'Username', 
      selector: (row) => row.username || 'N/A', 
      sortable: true, 
      width: '18%' 
    },
    { 
      name: 'Address', 
      selector: (row) => row.address || 'N/A', 
      sortable: true, 
      width: '20%' 
    },
    { 
      name: 'Project Type', 
      selector: (row) => row.project_type || 'N/A', 
      sortable: true, 
      width: '15%' 
    },
    { 
      name: 'Lead Funnel', 
      selector: (row) => row.lead_funnel || 'N/A', 
      sortable: true, 
      width: '12%' 
    },
    { 
      name: 'Price', 
      selector: (row) => {
        const price = row.price || row.project_value || 0;
        return `$${parseFloat(price).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      }, 
      sortable: true, 
      width: '12%' 
    },
  ];

  // Add new filter instance
  const addFilterInstance = () => {
    const newId = Math.max(...filterInstances.map(f => f.id)) + 1;
    const selectedMonth = moment().format('MMMM');
    const selectedMonthIndex = moment().month();
    const currentYear = moment().year();
    
    const newInstance = {
      id: newId,
      name: `Filter Instance ${newId}`,
      leadMonth: { value: selectedMonth, label: selectedMonth },
      projectType: { value: 'All', label: 'All Project Types' },
      leadFunnel: { value: 'All', label: 'All Lead Funnels' },
      projectLocation: { value: 'All', label: 'All Locations' },
      tags: { value: 'All', label: 'All Tags' },
      dateRange1: { 
        startDate: moment([currentYear, selectedMonthIndex]).startOf('month').toDate(), 
        endDate: moment([currentYear, selectedMonthIndex]).endOf('month').toDate(), 
        key: `selection${newId}_1` 
      },
      showTable: true,
      showChart: true, // New property to control visibility of both chart and table
      chartData: null,
      chartLoading: false,
      currentPage: 1,
      perPage: 10,
      totalRows: 0,
      reports: [],
      loading: true
    };
    
    setFilterInstances([...filterInstances, newInstance]);

    setNewInstanceId(newId);
    
    // Auto-apply filter for the new instance immediately
    //applyFilters(newId);
    // Since default view is chart, also load chart data immediately after
    //chartDataHandle(newId);
  };

  // Remove filter instance
  const removeFilterInstance = (id) => {
    if (filterInstances.length > 1) {
      setFilterInstances(filterInstances.filter(f => f.id !== id));
    }
  };

  // Update specific filter instance
  const updateFilterInstance = (id, updates) => {
    setFilterInstances(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  // Handle filter change
  const handleFilterChange = (instanceId, updates) => {
    setChangeFilter(instanceId);
    
    // Handle synchronization between lead month and date range
    if (updates.leadMonth && updates.leadMonth.value !== 'All') {
      // When lead month changes, update date range to match that month
      const selectedMonth = updates.leadMonth.value;
      const currentYear = moment().year();
      const monthIndex = moment().month(selectedMonth).month();
      
      updates.dateRange1 = {
        startDate: moment([currentYear, monthIndex]).startOf('month').toDate(),
        endDate: moment([currentYear, monthIndex]).endOf('month').toDate(),
        key: `selection${instanceId}_1`
      };
    } else if (updates.dateRange1) {
      // When date range changes, update lead month to match the selected range
      const startDate = moment(updates.dateRange1.startDate);
      const endDate = moment(updates.dateRange1.endDate);
      
      // Check if the date range spans a single month
      if (startDate.month() === endDate.month() && startDate.year() === endDate.year()) {
        const monthName = startDate.format('MMMM');
        updates.leadMonth = { value: monthName, label: monthName };
      } else {
        // If date range spans multiple months, set lead month to 'All'
        updates.leadMonth = { value: 'All', label: 'Lead Month' };
      }
    }
    
    updateFilterInstance(instanceId, updates);
  };

  // Build query string for specific instance
  const buildQueryString = (instance) => {
    const queryParams = [];
    
    if (instance.leadMonth.value && instance.leadMonth.value !== 'All') {
      queryParams.push(`leadMonth=${instance.leadMonth.value}`);
    }

    if (instance.projectType.value && instance.projectType.value !== 'All') {
      queryParams.push(`projectType=${instance.projectType.value}`);
    }

    if (instance.leadFunnel.value && instance.leadFunnel.value !== 'All') {
      queryParams.push(`leadFunnel=${instance.leadFunnel.value}`);
    }

    if (instance.projectLocation.value && instance.projectLocation.value !== 'All') {
      queryParams.push(`projectLocation=${instance.projectLocation.value}`);
    }

    if (instance.tags.value && instance.tags.value !== 'All') {
      queryParams.push(`tags=${instance.tags.value}`);
    }

    if (instance.dateRange1.startDate && instance.dateRange1.endDate) {
      queryParams.push(`startDate=${moment(instance.dateRange1.startDate).format('YYYY-MM-DD')}`);
      queryParams.push(`endDate=${moment(instance.dateRange1.endDate).format('YYYY-MM-DD')}`);
    }

    queryParams.push(`pagesize=${instance.perPage}`);
    queryParams.push(`page=${instance.currentPage}`);

    return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  };



  const applyFilters = async (instanceId) => {
    const instance = filterInstances.find(f => f.id === instanceId);
    if (!instance) return;
 
    updateFilterInstance(instanceId, { loading: true });
    setLoadingReports(true);

    chartDataHandle(instanceId);
    
    try {
      const queryString = buildQueryString(instance);
      const response = await agent.Website.getReports(queryString);
      
      if (response && response.data) {

        setReportData(response);
        // Update the specific instance
        updateFilterInstance(instanceId, {
          totalRows: response.data?.pagination?.totalCount || 0,
          reports: response.data?.reports || [],
          loading: false,
          // Clear chart data when filters change
          //chartData: null,
          //expenseData: [],
          //yearData: [],
          //chartLoading: false
        });
        
        // If current view is chart mode, automatically load chart data
        const currentInstance = filterInstances.find(f => f.id === instanceId);
        // if (currentInstance && currentInstance.showChart) {
        //   chartDataHandle(instanceId);
        // }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      updateFilterInstance(instanceId, { loading: false });
    } finally {
      setLoadingReports(false);
      // Don't force table view, keep current view mode
    }
  };

  const chartDataHandle = async (instanceId) => {
    const instance = filterInstances.find(f => f.id === instanceId);
    if (!instance) return;

    updateFilterInstance(instanceId, { });
    
    try {
      const queryString = buildQueryString(instance);
      const response = await agent.Website.getReportsChartData(queryString);
      
      if (response && response.data) {
        setReportChartData1(response.data);

        //console.log("response.data", response.data);
        
        // Process expense data for chart
        if (response.data.expense_data && response.data.expense_data.length > 0) {
          const expenseData = response.data.expense_data;

          const labels = expenseData.map(item => item.source);
          const values = expenseData.map(item => parseFloat(item.roi) || 0);
          
          const chartData = {
            labels: labels,
            datasets: [
              {
                label: 'Expense Cost ($)',
                data: values,
                backgroundColor: chartColors.slice(0, labels.length),
              },
            ],
          };
          
          // Update the first instance for now
          // if (filterInstances.length > 0) {
          //   updateFilterInstance(filterInstances[0].id, { 
          //     chartData,
          //     yearData: reportChartData1.yearData || []
          //   });
          // }
          // const labels = expenseData.map(item => item.source);
          // const expenseValues = expenseData.map(item => parseFloat(item.expanse_cost) || 0);
          // const roiValues = expenseData.map(item => parseFloat(item.roi) || 0);
          // const appointmentValues = expenseData.map(item => parseFloat(item.appointments) || 0);
          // const jobsBookedValues = expenseData.map(item => parseFloat(item.jobs_booked) || 0);
          
          // const chartData = {
          //   labels: labels,
          //   datasets: [
          //     {
          //       label: 'Expense Cost ($)',
          //       data: expenseValues,
          //       backgroundColor: 'rgba(63, 81, 181, 0.8)',
          //       borderColor: 'rgba(63, 81, 181, 1)',
          //       borderWidth: 2,
          //       yAxisID: 'y'
          //     },
          //     {
          //       label: 'ROI ($)',
          //       data: roiValues,
          //       backgroundColor: 'rgba(77, 182, 172, 0.8)',
          //       borderColor: 'rgba(77, 182, 172, 1)',
          //       borderWidth: 2,
          //       yAxisID: 'y'
          //     },
          //     {
          //       label: 'Appointments',
          //       data: appointmentValues,
          //       backgroundColor: 'rgba(233, 30, 99, 0.8)',
          //       borderColor: 'rgba(233, 30, 99, 1)',
          //       borderWidth: 2,
          //       yAxisID: 'y1'
          //     },
          //     {
          //       label: 'Jobs Booked',
          //       data: jobsBookedValues,
          //       backgroundColor: 'rgba(156, 39, 176, 0.8)',
          //       borderColor: 'rgba(156, 39, 176, 1)',
          //       borderWidth: 2,
          //       yAxisID: 'y1'
          //     }
          //   ],
          // };
          
          // Update the specific instance with chart data, expense data, and year data
          updateFilterInstance(instanceId, { 
            chartData,
            expenseData: expenseData,
            yearData: response.data.yearData || [],
            chartLoading: false
          });
        } else {
          // No expense data available, clear chart data
          updateFilterInstance(instanceId, { 
            chartData: null,
            expenseData: [],
            yearData: [],
            chartLoading: false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Clear chart data on error
      updateFilterInstance(instanceId, { 
        chartData: null,
        expenseData: [],
        yearData: [],
        chartLoading: false 
      });
    }
  };

  const handlePageChange = (page, instanceId) => {
    updateFilterInstance(instanceId, { currentPage: page });
  };

  const handlePerPageChange = (newPerPage, page, instanceId) => {
    updateFilterInstance(instanceId, { perPage: newPerPage, currentPage: page });
  };





  // useEffect(() => {
  //   if(reportData){ 
  //     console.log(reportData);
  //     // Find which instance this data belongs to (you might need to implement a way to track this)
  //     // For now, we'll update the first instance
  //     if (filterInstances.length > 0) {
  //       updateFilterInstance(filterInstances[0].id, {
  //         totalRows: reportData.data?.pagination?.totalCount || 0,
  //         reports: reportData.data?.leads || reportData.data?.projects || [],
  //         loading: false
  //       });
  //     }
  //   }
  // }, [reportData]);

  // Direct API call function for filters data
  const fetchFiltersData = async () => {
    try {
      setLoadingProjectTypes(true);
      setLoadingLeadFunnels(true);
      setLoadingProjectLocations(true);
      
      // Clear any previous errors
      setErrorProjectTypes(null);
      setErrorLeadFunnels(null);
      setErrorProjectLocations(null);
      
      const response = await agent.Website.getReportFiltersData();

     // console.log(response);
      
      if (response && response?.data?.projectTypes && response?.data?.leadFunnels && response?.data?.projectLocations) {
        // Update project type options
        const projectTypeOptions = [
          { value: 'All', label: 'All Project Types' },
          ...response?.data?.projectTypes.map(type => ({
            value: type.project_type,
            label: type.project_type
          }))
        ];
        setProjectTypeOptions(projectTypeOptions);
        setLoadingProjectTypes(false);

        // Update lead funnel options
        const leadFunnelOptions = [
          { value: 'All', label: 'All Lead Funnels' },
          ...response?.data?.leadFunnels.map(funnel => ({
            value: funnel.lead_funnel,
            label: funnel.lead_funnel
          }))
        ];

        setLeadFunnelOptions(leadFunnelOptions);
        setLoadingLeadFunnels(false);

        // Update project location options
        const projectLocationOptions = [
          { value: 'All', label: 'All Locations' },
          ...response?.data?.projectLocations.map(location => ({
            value: location.address,
            label: location.address
          }))
        ];
        setProjectLocationOptions(projectLocationOptions);
        setLoadingProjectLocations(false);
      } else {
        throw new Error('Invalid response format from filters API');
      }
    } catch (error) {
      console.error('Error fetching filters data:', error);
      
      // Set error for all filters
      const errorMessage = error.message || 'Failed to fetch filters data';
      setErrorProjectTypes(errorMessage);
      setErrorLeadFunnels(errorMessage);
      setErrorProjectLocations(errorMessage);
      
      // Clear loading states
      setLoadingProjectTypes(false);
      setLoadingLeadFunnels(false);
      setLoadingProjectLocations(false);
    }
  };

  // Fetch options when component mounts
  useEffect(() => {
    fetchFiltersData();
  }, []);

  // Auto-apply filter when component mounts and filters are loaded
  useEffect(() => {
    if (!loadingProjectTypes && !loadingLeadFunnels && !loadingProjectLocations && newInstanceId && filterInstances.length > 0) {
      // Auto-apply filter for the first instance
      applyFilters(newInstanceId);
    }
  }, [loadingProjectTypes, loadingLeadFunnels, loadingProjectLocations, filterInstances.length, newInstanceId]);


  useEffect(() => {
    if(changeFilter){
      setChangeFilter(null);
      applyFilters(changeFilter);
    }
  }, [changeFilter]);






  // useEffect(() => {
  //   if(reportChartData1){
  //     // Process expense data for chart
  //     if (reportChartData1.expense_data && reportChartData1.expense_data.length > 0) {
  //       const labels = reportChartData1.expense_data.map(item => item.source);
  //       const values = reportChartData1.expense_data.map(item => parseFloat(item.expanse_cost) || 0);
        
  //       const chartData = {
  //         labels: labels,
  //         datasets: [
  //           {
  //             label: 'Expense Cost ($)',
  //             data: values,
  //             backgroundColor: chartColors.slice(0, labels.length),
  //           },
  //         ],
  //       };
        
  //       // Update the first instance for now
  //       if (filterInstances.length > 0) {
  //         updateFilterInstance(filterInstances[0].id, { 
  //           chartData,
  //           yearData: reportChartData1.yearData || []
  //         });
  //       }
  //     }
  //   }
  // }, [reportChartData1]);



  // Render filter instance with its data
  const renderFilterInstanceWithData = (instance) => (
    <div key={instance.id} className="filter-instance">
      {/* Filter Controls */}
      <MDBCard className="mb-3">
        <MDBCardHeader className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{instance.name}</h6>
          <div className="d-flex gap-2">
            <MDBBtn size="sm" color="danger" onClick={() => removeFilterInstance(instance.id)}>
              <MDBIcon fas icon="trash" />
            </MDBBtn>
          </div>
        </MDBCardHeader>
        <MDBCardBody>
          <div className="call-filters-main p-0">
            <div className="call-filters">
              <Select
                options={leadMonthOptions}
                value={instance.leadMonth}
                onChange={(selectedOption) => handleFilterChange(instance.id, { leadMonth: selectedOption })}
                className="filter-dropdown"
                placeholder="Select Lead Month"
              />

              <Select
                options={projectTypeOptions}
                value={instance.projectType}
                onChange={(selectedOption) => handleFilterChange(instance.id, { projectType: selectedOption })}
                className="filter-dropdown"
                placeholder="Select Project Type"
                isLoading={loadingProjectTypes}
                isDisabled={loadingProjectTypes}
              />

              <Select
                options={leadFunnelOptions}
                value={instance.leadFunnel}
                onChange={(selectedOption) => handleFilterChange(instance.id, { leadFunnel: selectedOption })}
                className="filter-dropdown"
                placeholder="Select Lead Funnel"
                isLoading={loadingLeadFunnels}
                isDisabled={loadingLeadFunnels}
              />

              <Select
                options={projectLocationOptions}
                value={instance.projectLocation}
                onChange={(selectedOption) => handleFilterChange(instance.id, { projectLocation: selectedOption })}
                className="filter-dropdown"
                placeholder="Select Project Location"
                isLoading={loadingProjectLocations}
                isDisabled={loadingProjectLocations}
                />
            

              <Select
                options={tagOptions}
                value={instance.tags}
                onChange={(selectedOption) => handleFilterChange(instance.id, { tags: selectedOption })}
                className="filter-dropdown"
                placeholder="Select Tags"
              />

              {/* Date Range Picker */}
              <div className="date-input-wrapper">
                <DateRangePicker
                  initialSettings={{ 
                    locale: { format: 'MM/DD/YYYY' },
                    autoUpdateInput: false,
                    timePicker: false,
                    startDate: moment().subtract(1, 'month').startOf('month').toDate(),
                    endDate: moment().subtract(1, 'month').endOf('month').toDate()
                  }}
                  onApply={(event, picker) => {
                    handleFilterChange(instance.id, {
                      dateRange1: {
                        startDate: picker.startDate,
                        endDate: picker.endDate,
                        key: `selection${instance.id}_1`,
                      }
                    });
                  }}
                >
                  <input
                    type="text"
                    className="filter-input"
                    readOnly
                    value={instance.dateRange1.startDate && instance.dateRange1.endDate ? 
                      `${moment(instance.dateRange1.startDate).format('MM/DD/YYYY')} - ${moment(instance.dateRange1.endDate).format('MM/DD/YYYY')}` : ''}
                    placeholder="Select Date Range"
                  />
                </DateRangePicker> 
              </div>

            </div>
            
            <div className="d-flex gap-3">
              <MDBBtn className="mt-3 btn-primary" onClick={() => applyFilters(instance.id)}>
                APPLY
              </MDBBtn>
            </div>
          </div>
        </MDBCardBody>
      </MDBCard>

      {/* Data Display for this instance */}
      <MDBCard>
        <MDBCardHeader>
          <div className="d-flex justify-content-between align-items-center show_table_btn">
            <h6 className="mb-0">{instance.name} - {instance.showTable ? 'View' : 'View'}</h6>
            <div className="d-flex gap-2">
              {/* Visibility Toggle Button */}
              <MDBBtn 
                size="sm" 
                color={instance.showChart ? "success" : "secondary"}
                onClick={() => {
                  updateFilterInstance(instance.id, { showChart: !instance.showChart });
                }}
                title={instance.showChart ? "Hide Chart" : "Show Chart"}
              >
                <MDBIcon fas icon={instance.showChart ? "eye" : "eye-slash"} />
                {instance.showChart ? ' Hide Chart' : ' Show Chart'}
              </MDBBtn>
              
              <MDBBtn 
                size="sm" 
                color={instance.showTable ? "success" : "secondary"}
                onClick={() => {
                  updateFilterInstance(instance.id, { showTable: !instance.showTable });
                }}
                title={instance.showTable ? "Hide Table" : "Show Table"}
              >
                <MDBIcon fas icon={instance.showTable ? "eye" : "eye-slash"} />
                {instance.showTable ? ' Hide Table' : ' Show Table'}
              </MDBBtn>
            </div>
          </div>
        </MDBCardHeader>
        <MDBCardBody>
          {instance.showChart ?  (
            <div className="d-flex justify-content-center">
              {instance.chartLoading ? (
                <div className="p-3 text-body font-semibold text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading chart data...</p>
                </div>
              ) : instance.chartData && instance.chartData.labels && instance.chartData.labels.length > 0 ? (
                <div className="chart-1 w-100">

                  {(instance.dateRange1.startDate && instance.dateRange1.endDate)? (
                    <h5 className="mb-4 text-body font-semibold text-center compare_first_heading">
                      {`${moment(instance.dateRange1.startDate).format('DD MMM YYYY')} To ${moment(instance.dateRange1.endDate).format('DD MMM YYYY')}`}
                    </h5>
                  ): (
                    <h5 className="mb-4 text-body font-semibold text-center compare_first_heading">
                      Marketing Expense Data by Source
                    </h5>
                  )}
                  <div className="d-flex justify-content-center">
                    {/* Only show chart when there are non-zero expense costs */}
                    {instance.expenseData && instance.expenseData.some(item => parseFloat(item.roi || 0) > 0) ? (
                      <>
                        <div className="w-100 d-flex justify-content-center" style={{width: "50%"}}>
                          <div className="d-flex justify-content-center" style={{width:"400px", height:"400px"}} >
                            <Doughnut data={instance.chartData} />
                          </div> 
                        </div>
                        {instance.chartData.labels && (
                          <div className="chartdata1-label" style={{width: "50%", marginLeft: "0px"}}>
                            {instance.chartData.labels.map((label, index) => (
                              <div key={index} className="d-flex align-items-center me-3">
                                <div
                                  className="color-box"
                                  style={{
                                    backgroundColor: chartColors[index],
                                    width: '15px',
                                    height: '15px',
                                    marginRight: '5px',
                                  }}
                                ></div>
                                <span>{label}: ${instance.chartData.datasets[0].data[index].toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-3">
                        {/* <p className="text-muted">Chart hidden - all expense costs are zero</p> */}
                      </div>
                    )}
                  </div>
                  
                  {/* Expense Data Table - Always show when data exists */}
                  {instance.expenseData && instance.expenseData.length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-3 text-center">Marketing Expense Details</h6>
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                          <thead className="table-dark">
                            <tr>
                              <th>Source</th>
                              <th>Expense($)</th>
                              <th>ROI ($)</th>
                              <th>Appointments</th>
                              <th>Jobs Booked</th>
                            </tr>
                          </thead>
                          <tbody>
                            {instance.expenseData.map((item, index) => (
                              <tr key={index}>
                                <td><strong>{item.source}</strong></td>
                                <td>${parseFloat(item.expanse_cost || 0).toLocaleString()}</td>
                                <td>${parseFloat(item.roi || 0).toLocaleString()}</td>
                                <td>{item.appointments || 0}</td>
                                <td>{item.jobs_booked || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Year Data Display - Always show when data exists */}
                  {instance.yearData && instance.yearData.length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-3 text-center">Number Of Projects By Month</h6>
                      <div className="row">
                        {instance.yearData.map((item, index) => (
                          <div key={index} className="col-md-3 col-sm-6 mb-3">
                            <div className="text-center p-3 border rounded">
                              <div className="h5 mb-1 text-primary">
                                {item.total_leads}
                              </div>
                              <div className="text-muted small">
                                {moment(item.month, 'YYYY-MM').format('MMM YYYY')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : !instance.chartLoading && (
                <div className="p-3 text-body font-semibold text-center">
                  {instance.expenseData && instance.expenseData.length > 0 && !instance.expenseData.some(item => parseFloat(item.expanse_cost || 0) > 0) ? (
                    <></>
                  ) : (
                    <></>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4">
              <MDBIcon fas icon="eye-slash" size="2x" className="text-muted mb-3" />
              <p className="text-muted">Chart is hidden. Click "Show Chart" to view the content.</p>
            </div>
          )}

          {instance.showTable ? (
            <DataTable
              columns={columns}
              data={instance.reports}
              // pagination
              // paginationServer
              // paginationTotalRows={instance.totalRows}
              // onChangePage={(page) => handlePageChange(page, instance.id)}
              // onChangeRowsPerPage={(newPerPage, page) => handlePerPageChange(newPerPage, page, instance.id)}
              progressPending={instance.loading}
              highlightOnHover
            /> 
          ) : (
            <div className="text-center p-4">
              <MDBIcon fas icon="eye-slash" size="2x" className="text-muted mb-3" />
              <p className="text-muted">Table is hidden. Click "Show Table" to view the content.</p>
            </div>
          )}
        </MDBCardBody>
      </MDBCard>
    </div>
  );

  return (
    <MDBContainer className="py-4 dummyreport_main_div roles_maincard">
      {/* Header */}
      <MDBCard className="mb-4">
        <MDBCardBody>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Dummy report data</h4>
          </div>
        </MDBCardBody>
      </MDBCard>

      {/* Filter Instances */}
      <div className="filter-instances-container">
        {filterInstances.map(instance => renderFilterInstanceWithData(instance))}
      </div>

      {/* Add New Instance Button at Bottom */}
      <div className="text-center mt-4 mb-4">
        <MDBBtn 
          color="success" 
          size="lg"
          className="rounded-circle"
          style={{ width: '60px', height: '60px' }}
          onClick={addFilterInstance}
        >
          <MDBIcon fas icon="plus" size="lg" />
        </MDBBtn>
        <div className="mt-2 text-muted">Add New Filter Instance</div>
      </div>
    </MDBContainer>
  );
};

export default DummyReport;
