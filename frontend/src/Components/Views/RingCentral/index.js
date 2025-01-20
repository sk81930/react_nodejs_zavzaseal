import React, { Fragment, useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { MDBContainer, MDBCard, MDBCardBody, MDBCardHeader, MDBBtn } from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import Select from 'react-select';
import DateRangePicker from 'react-bootstrap-daterangepicker'; 
import 'bootstrap-daterangepicker/daterangepicker.css';
import { LuChartNoAxesCombined } from "react-icons/lu";
import { CALL_LOGS, CALL_LOGS_TOKEN, CALL_LOGS_CHART_DATA_FIRST, CALL_LOGS_CHART_DATA_SECOND } from '../../../constants/actionTypes';
import agent from '../../../agent';
import missedCallIcon from "../../../assets/images/miss_call.svg";
import receiveCallIcon from "../../../assets/images/recieve_call.svg";
import pickCallIcon from "../../../assets/images/call_pick.svg";
import playBtn from "../../../assets/images/play_btn_1.png";
import AudioPopup from './AudioPopup';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import moment from 'moment';
import './CallLogsPage.scss';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);



const mapStateToProps = (state) => ({
  ...state,
  callLogsData: state.auth.callLogs,
  callLogsChartData1: state.auth.callLogsChartData1,
  callLogsChartData2: state.auth.callLogsChartData2,
  callLogsToken: state.auth.callLogsToken,
});

const mapDispatchToProps = (dispatch) => ({
  getCallLogsToken: () => {
    dispatch({ type: CALL_LOGS_TOKEN, payload: agent.Auth.getCallLogsToken() });
  },
  getCallLogs: (params) => {
    dispatch({ type: CALL_LOGS, payload: agent.Auth.getCallLogs(params) });
  },
  getCallLogsChartData1: (params) => {
    dispatch({ type: CALL_LOGS_CHART_DATA_FIRST, payload: agent.Auth.getCallLogsChartData(params) });
  },
  getCallLogsChartData2: (params) => {
    params = params+"&chart=2";
    dispatch({ type: CALL_LOGS_CHART_DATA_SECOND, payload: agent.Auth.getCallLogsChartData(params) });
  },
});

const formatDuration = (lengthInSeconds) => {
  // Calculate hours, minutes, and seconds
  const hours = Math.floor(lengthInSeconds / 3600);
  const minutes = Math.floor((lengthInSeconds % 3600) / 60);
  const seconds = lengthInSeconds % 60;

  // Format the output as HH:MM:SS
  return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};

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

const CallLogsPage = (props) => {
  const { getCallLogs, callLogsData, callLogsChartData1, callLogsChartData2, getCallLogsChartData1, getCallLogsChartData2, getCallLogsToken, callLogsToken } = props;

  const buildQueryString = () => {
    // Initialize an array to hold the query string components
    const queryParams = [];

    // Add call type filter if selected
    var clear_fl = false;
    if (selectedType.value && selectedType.value !== 'All') {
      queryParams.push(`type=${selectedType.value}`);
      clear_fl = true;
    }

    // Add receiving number filter if provided
    if (callReceivingNumber) {
      const callReceivingNumber2 = callReceivingNumber.replaceAll("+","");
      queryParams.push(`callReceivingNumber=${callReceivingNumber2}`);
      clear_fl = true;
    }

    // Add date range filters if selected
    if (dateRange1.startDate && dateRange1.endDate) {
      queryParams.push(`startDate=${moment(dateRange1.startDate).format('YYYY-MM-DD HH:mm')}`);
      queryParams.push(`endDate=${moment(dateRange1.endDate).format('YYYY-MM-DD HH:mm')}`);
      clear_fl = true;
    }

    if (dateRange2.startDate && dateRange2.endDate) {
      queryParams.push(`startDate2=${moment(dateRange2.startDate).format('YYYY-MM-DD HH:mm')}`);
      queryParams.push(`endDate2=${moment(dateRange2.endDate).format('YYYY-MM-DD HH:mm')}`);
      clear_fl = true;
    }

    queryParams.push(`pagesize=${perPage}`);
    queryParams.push(`page=${currentPage}`);

    if(clear_fl){
      setShowClearFilter(true)
    }

    // Return the query string
    return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  };

  const closePopup = () => {
    setShowPopup(false);
    setAudioSrc(null); // Reset audio source when closing the popup
  };

  const [totalRows, setTotalRows] = useState(0);
  let [currentPage, setCurrentPage] = useState(1);
  let [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showClearFilter, setShowClearFilter] = useState(false);

  const [callLogs, setCallLogs] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [showTable, setShowTable] = useState(true);
  const [selectedType, setSelectedType] = useState({ value: 'All', label: 'All Calls' });
  const [callReceivingNumber, setCallReceivingNumber] = useState('');

  const [ranges, setRanges] = useState({
    'Today': [moment().startOf('day'), moment().endOf('day')],
    'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
    'This Week': [moment().startOf('week'), moment().endOf('week')],
    'Last Week': [
      moment().subtract(1, 'week').startOf('week'),
      moment().subtract(1, 'week').endOf('week'),
    ],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment().subtract(1, 'month').startOf('month'),
      moment().subtract(1, 'month').endOf('month'),
    ],
    'Last 30 Days': [moment().subtract(30, 'days'), moment()],
  });


  const [dateRange1, setDateRange1] = useState({
    startDate: null,  
    endDate: null,    
    key: 'selection1',
  });

  const [dateRange2, setDateRange2] = useState({
    startDate: null,  
    endDate: null,    
    key: 'selection2',
  });

  const [audioSrc, setAudioSrc] = useState(null);
  const [token, setToken] = useState(null);
  const [showPopup, setShowPopup] = useState(true);

  const [showDatePicker1, setShowDatePicker1] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);
  const [showDatePickerInput2, setShowDatePickerInput2] = useState(false);

  const datePickerRef1 = useRef(null);
  const datePickerRef2 = useRef(null);

  const callTypeOptions = [
    { value: 'All', label: 'All Calls' },
    { value: 'Missed', label: 'Missed Calls' },
    { value: 'Call connected', label: 'Outgoing Calls' },
    { value: 'Accepted', label: 'Incoming Calls' },
  ];

  const columns = [
    {
      name: '#',
      selector: (_, index) => index + 1 + (currentPage - 1) * perPage,  
      sortable: true,
      width: '5%',
    },
    { name: 'Type', selector: (row) => { 
      if (row.result === 'Missed') {
        return <img 
          src={missedCallIcon}
          alt="Missed Call" 
          width="20" 
          height="20" 
          style={{width:"20px",height:"20px"}}
        />;
      } else if (row.recording === 'Inbound') {
        return <img 
          src={receiveCallIcon}
          alt="Inbound Call" 
          width="20" 
          height="20" 
          style={{width:"20px",height:"20px"}}
        />;
      } else if (row.recording === 'Outbound') {
        return <img 
          src={pickCallIcon}
          alt="Outbound Call" 
          width="20" 
          height="20" 
          style={{width:"20px",height:"20px"}}
        />;
      }
    }, sortable: true, width: '7%' },
    { name: 'From', selector: (row) => row.from, width: '11%' },
    { name: 'To', selector: (row) => row.to, width: '11%' },
    { name: 'Name', selector: (row) => row.name, width: '12%', className: 'column-name break-word' },
    { name: 'Date Time', selector: (row) => {
      //debugger;
      return moment.utc(row.date_time).format('DD MMM YYYY, hh:mm A')
    }, width: '12%', className: 'column-date break-word' },
    { name: 'Recording', selector: (row) => {
        if(row.recording_data){
          const decodedData = JSON.parse(row.recording_data);
          if(decodedData.contentUri){

            return <div className="playBtnMain"> <img 
                        src={playBtn}
                        alt="Inbound Call" 
                        width="20" 
                        height="20" 
                        style={{width:"30px",height:"30px",cursor:'pointer'}}
                        onClick={() => handleAudioPlay(decodedData)}
                      ></img>
                    </div>  

          }
        }
    }, width: '9%' },
    { name: 'Action', selector: (row) => row.action, width: '10%' },
    { name: 'Result', selector: (row) => row.result, width: '10%' },
    { name: 'Length', selector: (row) => {
      return  formatDuration(row.length);
    }, width: '10%' },
  ];

  const handleAudioPlay = (data) => {
    if(data.contentUri){
      var uri = data.contentUri;
      if (uri && token) {
        fetch(uri, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Authorization header with the token
          },
        })
        .then(response => {
          if (response.ok) {
            return response.blob(); // Get the audio content as a blob
          }
          getCallLogsToken();
          throw new Error('Failed to fetch audio');
        })
        .then(blob => {
          const audioUrl = URL.createObjectURL(blob); // Create a URL for the audio blob
          setAudioSrc(audioUrl); // Set the audio source
          setShowPopup(true);
        })
        .catch(error => {
          getCallLogsToken();
          console.error('Error fetching audio:', error);
        });
      }
    }  
  };

  const applyFilters = () => {
    setLoading(true);
    const queryString = buildQueryString();
    getCallLogs(queryString);
    setShowTable(true); 
  };
  const cancelFilters = () => {
    setSelectedType({ value: 'All', label: 'All Calls' });
    setDateRange1({
      startDate: null,  
      endDate: null,    
      key: 'selection1',
    })
    setDateRange2({
      startDate: null,  
      endDate: null,    
      key: 'selection2',
    })
    setCallReceivingNumber("");
    //applyFilters()
    setChartData2(null)
    setShowClearFilter(false)
  };

  useEffect(() => {
    const queryString = buildQueryString();
    getCallLogs(queryString);
    getCallLogsToken();
  }, [getCallLogs,currentPage,perPage,showClearFilter]);

  const handleClickOutside = (event) => {
    if (datePickerRef1.current && !datePickerRef1.current.contains(event.target)) {
      setShowDatePicker1(false);
    }
    if (datePickerRef2.current && !datePickerRef2.current.contains(event.target)) {
      setShowDatePicker2(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if(callLogsData && callLogsData.pagination){
      setTotalRows(callLogsData.pagination.totalCount);
      setCallLogs(callLogsData.callLogs);
      setLoading(false);
    }
  }, [callLogsData]);

  useEffect(() => {
    if(callLogsToken){
      setToken(callLogsToken);
    }
  }, [callLogsToken]);

  useEffect(() => {
    if(callLogsChartData1){
      const { labels, values } = callLogsChartData1;

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Calls',
            data: values,
            backgroundColor: chartColors,
          },
        ],
      });
    }
  }, [callLogsChartData1]);

  useEffect(() => {
    if(callLogsChartData2){
      const { labels, values } = callLogsChartData2;

      setChartData2({
        labels: labels,
        datasets: [
          {
            label: 'Calls',
            data: values,
            backgroundColor: chartColors,
          },
        ],
      });
    }
  }, [callLogsChartData2]);

  

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const chartDataHandle = () => {
    setShowTable(false)
    const queryString = buildQueryString();

    getCallLogsChartData1(queryString);
    if(showDatePickerInput2 && dateRange2.startDate && dateRange2.endDate){
      getCallLogsChartData2(queryString);
    }
  };

  useEffect(() => {
    if(!showTable){
      chartDataHandle();
    }
  }, [showTable,dateRange1,dateRange2]);


  const handleApply = (event, picker) => {
    picker.element.val(
      picker.startDate.format('MM/DD/YYYY') +
        ' - ' +
        picker.endDate.format('MM/DD/YYYY')
    );
  };
  const handleCancel = (event, picker) => {
    picker.element.val('');
  };

 

  return (
    <MDBContainer className="py-4">
      {showPopup && <AudioPopup audioSrc={audioSrc} closePopup={closePopup} />}
      {/* Filters Card */}
      <MDBCard className="mb-4">
        <MDBCardBody>
          <div className="call-filters-main">
            <div className="call-filters">
              <Select
                options={callTypeOptions}
                value={selectedType}
                onChange={(selectedOption) => setSelectedType(selectedOption)}
                className="filter-dropdown"
              />

              <input
                type="text"
                placeholder="Call Receiving Number"
                className="filter-input"
                value={callReceivingNumber}
                onChange={(e) => setCallReceivingNumber(e.target.value)}
              />

              {/* First Date Range Picker */}
              <div className="date-input-wrapper" ref={datePickerRef1}>
                <DateRangePicker

                      initialSettings={{ 
                        locale: { format: 'MM/DD/YYYY HH:mm' },
                        autoUpdateInput: false,
                        timePicker: true,
                        startDate: moment().startOf('hour').toDate(),
                        endDate: moment().startOf('hour').add(1, 'hour').toDate(),
                        ranges 
                      }}
                      onApply={(event, picker) => {
                        setDateRange1({
                          startDate: picker.startDate,
                          endDate: picker.endDate,
                          key: 'selection1',
                        });
                      }}
                  >
                  <input
                    type="text"
                    className="filter-input"
                    readOnly
                    value={dateRange1.startDate && dateRange1.endDate ? `${moment(dateRange1.startDate).format('MM/DD/YYYY HH:mm')} - ${moment(dateRange1.endDate).format('MM/DD/YYYY HH:mm')}` : ''}
                  />
                </DateRangePicker> 
              </div>

              {/* Second Date Range Picker for Comparison */}
              {showDatePickerInput2 && (
                  <div className="date-input-wrapper" ref={datePickerRef2}>
                    <DateRangePicker
                          initialSettings={{
                            locale: { format: 'MM/DD/YYYY HH:mm' },
                            autoUpdateInput: false,
                            timePicker: true,
                            startDate: moment().startOf('hour').toDate(),
                            endDate: moment().startOf('hour').add(1, 'hour').toDate(),
                            ranges 
                          }}
                          onApply={(event, picker) => {
                            setDateRange2({
                              startDate: picker.startDate,
                              endDate: picker.endDate,
                              key: 'selection2',
                            });
                          }}
                    >
                      <input
                        type="text"
                        className="filter-input"
                        readOnly
                        value={dateRange2.startDate && dateRange2.endDate ? `${moment(dateRange2.startDate).format('MM/DD/YYYY HH:mm')} - ${moment(dateRange2.endDate).format('MM/DD/YYYY HH:mm')}` : ''}
                      />
                    </DateRangePicker>
                  </div>
              )}
              <div className="compare-icon">
                 <div className="view_chart cursor-pointer" onClick={() => setShowDatePickerInput2(!showDatePickerInput2)}><img  src={require("../../../assets/images/left-and-right-arrows.png")} alt="compare" draggable="false" /></div>
              </div>

              <div className="chart-icon">
                <div className="view_chart cursor-pointer" onClick={chartDataHandle}><img  src={require("../../../assets/images/growth.png")} alt="compare" draggable="false" /></div>
              </div>
            </div>
            <div className="d-flex gap-3">
              <MDBBtn className="mt-3 btn-primary" onClick={applyFilters}>
                APPLY
              </MDBBtn>
              {showClearFilter && (
                <button className="mt-3 btn btn-secondary" onClick={cancelFilters}>
                  CLEAR FILTER
                </button>
              )}
            </div>
            
          </div>  
        </MDBCardBody>
      </MDBCard>

      {/* Table/Chart Card */}
      <MDBCard>
        <MDBCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{showTable ? 'Call Logs Table' : 'Call Distribution Chart'}</h5>
            <MDBBtn size="sm" onClick={() => setShowTable(!showTable)}>
              {showTable ? 'Show Chart' : 'Show Table'}
            </MDBBtn>
          </div>
        </MDBCardHeader>
        <MDBCardBody>
          {showTable ? (
            <DataTable
              columns={columns}
              data={callLogs}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerPageChange}
              progressPending={loading}
              highlightOnHover
            />
          ) : (
            <div className="d-flex justify-content-center">
              {(chartData && chartData.labels.length > 0) || (chartData2 && chartData2.labels.length > 0) ? (
                <Fragment>
                  {(chartData && chartData.labels.length > 0) && (
                    <div className="chart-1 w-50" style={{ borderRight: (chartData2 && chartData2.labels.length > 0)? '1px solid rgb(224, 224, 224)' : 'none'}}>
                      {(dateRange1.startDate && dateRange1.endDate)? (
                        <h3 className="mb-4 text-body font-semibold text-center compare_first_heading">
                          {`${moment(dateRange1.startDate).format('DD MMM YYYY')} To ${moment(dateRange1.endDate).format('DD MMM YYYY')}`}
                        </h3>
                      ): (
                        <h3 className="mb-4 text-body font-semibold text-center compare_first_heading">
                          All Call Logs Data
                        </h3>
                      )}
                      <div className="w-100 d-flex justify-content-center">
                        <div style={{width:"100%"}} >
                            <Doughnut data={chartData} />
                        </div> 
                      </div>
                      {chartData.labels && (
                        <div className="chartdata1-label">
                          {chartData.labels.map((label, index) => (
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
                              <span>{label}: {chartData.datasets[0].data[index]}</span> {/* Display count here */}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {(chartData2 && chartData2.labels.length > 0 && dateRange2.startDate && dateRange2.endDate) && (
                    <div className="chart-1 w-50">
                      {dateRange2.startDate && dateRange2.endDate && (
                        <h3 className="mb-4 text-body font-semibold text-center compare_first_heading">
                          {`${moment(dateRange2.startDate).format('DD MMM YYYY')} To ${moment(dateRange2.endDate).format('DD MMM YYYY')}`}
                        </h3>
                      )}
                      <div className="w-100 d-flex justify-content-center">
                        <div style={{width:"100%"}} >
                            <Doughnut data={chartData2} />
                        </div> 
                      </div>
                      {chartData.labels && (
                        <div className="chartdata1-label">
                          {chartData2.labels.map((label, index) => (
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
                              <span>{label}: {chartData2.datasets[0].data[index]}</span> {/* Display count here */}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Fragment>  

              ) : (
                <div className="p-3 text-body font-semibold text-center">
                  <p>No data available to display charts</p>
                </div>
              )}
            </div>
          )}
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(CallLogsPage);
