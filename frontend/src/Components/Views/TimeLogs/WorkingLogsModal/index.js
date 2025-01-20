import React, { Fragment, useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBTabs, MDBTabsItem, MDBTabsLink, MDBTable, MDBTableHead, MDBTableBody, MDBSpinner
} from 'mdb-react-ui-kit';
import { Modal, Button, Form, Row, Col, ListGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./WorkingLogsModal.scss";
import agent from '../../../../agent';
import SideModal from '../../../Layouts/SideModal';
import { OPEN_PROFILE_MODAL, CLOSE_PROFILE_MODAL } from '../../../../constants/actionTypes';
import { IoIosTimer, IoIosArrowForward } from "react-icons/io";

import moment from 'moment';

import DateRangePicker from 'react-bootstrap-daterangepicker';
// you will also need the css that comes with bootstrap-daterangepicker
import 'bootstrap-daterangepicker/daterangepicker.css';

import DateWiseLogsModal from '../DateWiseLogsModal';


export const closeProfileModal = () => ({
  type: CLOSE_PROFILE_MODAL,
});

const WorkingLogsModal = ({isOpen, setIsOpen,onHide, setOnHide, logsUserId, handleSubmit = null,children}) => {

  const dispatch = useDispatch();
  const ModalUserId = useSelector((state) => state.auth.ModalUserId);

  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(false);
  
  const [isClosing, setIsClosing] = useState(false);
  const [userLogs, setUserLogs] = useState(null);
  const [totalHours, setTotalHours] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateChanged, setDateChanged] = useState(false);


  const [isOpenDateWise, setIsOpenDateWise] = useState(false);
  const [onHideDateWise, setOnHideDateWise] = useState(false);


  const [logDate, setLogDate] = useState(false);

  const getLogsByUserId = async (user_id, type="", start_date="2024-01-01 00:00:00", end_date="2026-01-01 23:59:59") => {


    try {
      setDateChanged(false);

      // Assuming agent.Auth.editTask handles FormData
      const userDataResponse = await agent.Auth.getLogsByUserId(user_id,type,start_date,end_date);

      if(userDataResponse && userDataResponse.data && userDataResponse.data.userLogs && userDataResponse.data.userLogs.length > 0){
        setUserLogs(userDataResponse.data.userLogs)
        setTotalHours(userDataResponse.data.grand_total_hours)
      }else{
        setUserLogs(null);
      }

    } catch (error) {
       setUserLogs(null);
    }

  }

  useEffect(() => {
    if(logsUserId && activeTab){
      setUserLogs(null);
      setTotalHours(null)
      if(activeTab == "date_range" && startDate && endDate){

        getLogsByUserId(logsUserId, activeTab, startDate, endDate);

      }else{
        getLogsByUserId(logsUserId, activeTab)
      }
      
    }
  }, [logsUserId, activeTab, dateChanged]);

  useEffect(() => {
    if(userLogs){
    }
  }, [userLogs]);



  const workingPattern = (pattern) => {
    setActiveTab(pattern);
  };
  const handleDateRangeChange = (start, end, label) => {

    if (start && end) {
      setStartDate(start.format('YYYY-MM-DD 00:00:00'));
      setEndDate(end.format('YYYY-MM-DD 23:59:59'));
      setActiveTab("date_range");
      setDateChanged(true)
    }
  };

  const handleShowDateWiseLog = (log_date) => {
    setIsOpenDateWise(true);
    setLogDate(log_date);
  };
 
  return (
    <>
      {(isOpenDateWise) && (
        <DateWiseLogsModal isOpenDateWise={isOpenDateWise} setIsOpenDateWise={setIsOpenDateWise} onHideDateWise={onHideDateWise} setOnHideDateWise={setOnHideDateWise} logsUserId={logsUserId} logDate={logDate} />
      )}  
      <SideModal isOpen={isOpen} setIsOpen={setIsOpen} onHide={onHide} setOnHide={setOnHide} showButton={false}   classDef="WorkingLogsModal" >
         
           <Fragment>
              <div className="px-3 py-3">
                <MDBRow className="m-0 d-flex align-items-start">
                  <MDBCol size="12" className="p-0 bg-white rounded-3 shadow-md px-3 py-3">
                    <div className="modal-headers d-flex flex-column">
                      <div className="border-bottom border-1 border-0 pb-2 mb-3 d-flex justify-content-between align-items-center flex-wrap">
                        <h3 className="text-2xl font-bold">User working patterns</h3>
                        <div className="timelog_overviewk d-flex align-items-center justify-content-between" id="timelog_tab">
                          {(totalHours) && (<b id="totalTimeWorked"><IoIosTimer /> Total Time Worked: {totalHours}</b>)}
                        </div>
                      </div>

                      <div className="timelog_tab">
                        <MDBTabs className="mb-3 border-bottom" activetab={activeTab}>
                          <MDBTabsItem>
                            <MDBTabsLink onClick={() => workingPattern('today')} active={activeTab === 'today'}>Today</MDBTabsLink>
                          </MDBTabsItem>
                          <MDBTabsItem>
                            <MDBTabsLink onClick={() => workingPattern('yesterday')} active={activeTab === 'yesterday'}>Yesterday</MDBTabsLink>
                          </MDBTabsItem>
                          <MDBTabsItem>
                            <MDBTabsLink onClick={() => workingPattern('7days')} active={activeTab === '7days'}>Past 7 Days</MDBTabsLink>
                          </MDBTabsItem>
                          <MDBTabsItem>
                            <MDBTabsLink onClick={() => workingPattern('30days')} active={activeTab === '30days'}>Past 30 Days</MDBTabsLink>
                          </MDBTabsItem>
                          <MDBTabsItem>
                            <DateRangePicker
                              initialSettings={{ }}
                              onCallback={handleDateRangeChange}
                            >
                               <MDBTabsLink  active={activeTab === 'date_range'}>Date Range</MDBTabsLink>
                            </DateRangePicker>
                          </MDBTabsItem>
                        </MDBTabs>
                      </div>

                      <div className="tab-content">
                        <div className="tab-pane fade show active">
                          <div className="contact_info_wrap timelog_data_info border-1 position-relative">
                            {loading && (
                              <div className="spinner_wrap table_spinner justify-content-center align-items-center opacity-40 bg-black w-100 position-absolute top-0 left-0 bottom-0 right-0 z-30" id="spinner">
                                <MDBSpinner role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </MDBSpinner>
                              </div>
                            )}
                            <MDBTable className="table align-middle mb-0 bg-white">
                              <MDBTableHead className="bg-light">
                                <tr>
                                  <th className="px-3 py-2">Date</th>
                                  <th className="px-1 py-2">Time Worked</th>
                                  <th className="px-1 py-2">Start Time</th>
                                  <th className="px-1 py-2">End Time</th>
                                </tr>
                              </MDBTableHead>
                              <MDBTableBody>
                                {(userLogs && userLogs.length > 0)? (
                                  <Fragment>
                                    {userLogs.map((log, index) => (
                                      <tr key={index} onClick={() => handleShowDateWiseLog(log.date)}>
                                        <td className="px-3 py-2 d-flex align-items-center"><IoIosArrowForward /> {log.date}</td>
                                        <td className="px-1 py-2">{log.total_hours}</td>
                                        <td className="px-1 py-2">{moment(log.start_time).format("HH:mm")}</td>
                                        <td className="px-1 py-2">{(log.empty_end_time == true)?'--':log.end_time}</td>
                                      </tr>
                                    ))}
                                  </Fragment>
                                ):(
                                  <tr>
                                     <td colSpan="4" className="text-center">No logs</td>
                                  </tr>
                                )}
                              </MDBTableBody>
                            </MDBTable>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MDBCol>
                </MDBRow>
              </div>
           </Fragment>
         
      </SideModal>
    </>
  );
};

export default WorkingLogsModal;
