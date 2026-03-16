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
import "./DateWiseLogsModal.scss";
import agent from '../../../../agent';
import SideModal from '../../../Layouts/SideModal';
import { OPEN_PROFILE_MODAL, CLOSE_PROFILE_MODAL } from '../../../../constants/actionTypes';
import { IoIosTimer, IoIosArrowForward } from "react-icons/io";

import moment from 'moment';

import DateRangePicker from 'react-bootstrap-daterangepicker';
// you will also need the css that comes with bootstrap-daterangepicker
import 'bootstrap-daterangepicker/daterangepicker.css';




export const closeProfileModal = () => ({
  type: CLOSE_PROFILE_MODAL,
});

const DateWiseLogsModal = ({isOpenDateWise, setIsOpenDateWise,onHideDateWise, setOnHideDateWise, logsUserId, logDate,  handleSubmit = null,children}) => {

 

  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(false);
  
  const [isClosing, setIsClosing] = useState(false);
  const [dateWiseLogs, setDateWiseLogs] = useState(null);
  const [userData, setUserData] = useState(null);


  const getDateWiseLogs = async (user_id, logDate) => {


    try {



      // Assuming agent.Auth.editTask handles FormData
      const dataResponse = await agent.Auth.getDateWiseLogs(user_id,logDate);

      if(dataResponse && dataResponse.data && dataResponse.data.userData  && dataResponse.data.userData.id){
        setUserData(dataResponse.data.userData)
      }else{
        setUserData(null);
      }


      if(dataResponse && dataResponse.data && dataResponse.data.logData  && dataResponse.data.logData.length > 0){
        setDateWiseLogs(dataResponse.data.logData)
      }else{
        setDateWiseLogs(null);
      }

    } catch (error) {
       setDateWiseLogs(null);
    }

  }

  useEffect(() => {
    if(logsUserId && logDate){

      getDateWiseLogs(logsUserId, logDate)
      
    }
  }, [logsUserId, logDate]);

 
  return (
    <>
      <SideModal isOpen={isOpenDateWise} setIsOpen={setIsOpenDateWise} onHide={onHideDateWise} setOnHide={setOnHideDateWise} showButton={false}  classDef="DateWiseLogsModal WorkingLogsModal" >
         
           <Fragment>
              <div className="px-2 py-3">
                <MDBRow className="m-0 d-flex align-items-start">
                  <MDBCol size="12" className="p-0 bg-white rounded-3 shadow-md px-3 py-3">
                    <div className="modal-headers d-flex flex-column">
                      <div className="pb-2 mb-3 d-flex justify-content-between align-items-center flex-wrap">
                          {(userData && userData.first_name) && (
                            <div className="d-flex align-items-center pt-0 pb-0 user-top">
                                <div className="user_img">
                                    {(userData && userData.profile_image) ? (
                                      <img  
                                          src={(userData.profile_image)? (process.env.REACT_APP_BACKEND+userData.profile_image): "https://via.placeholder.com/40"}  
                                          className="w-11 rounded-circle" alt="Profile" style={{ width: "40px", height: "40px", objectFit: "cover" }} 
                                      />
                                    ) : (
                                      <span className="w-11 rounded-circle profile-image-span">
                                        <span>{userData && userData.first_name ? userData.first_name[0].toUpperCase() : '?'}</span>
                                      </span>
                                    )}
                                    
                                    <Fragment></Fragment>
                                </div>
                                <div className="user_text px-3">
                                    <b className="text-sm mb-0">{userData.first_name} {userData.last_name}</b>
                                </div>
                            </div>
                          )}
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
                                  <th className="px-3 py-2">Start</th>
                                  <th className="px-1 py-2">End</th>
                                  <th className="px-1 py-2">Worked</th>
                                  <th className="px-1 py-2">Project</th>
                                </tr>
                              </MDBTableHead>
                              <MDBTableBody>
                                {(dateWiseLogs && dateWiseLogs.length > 0)? (
                                  <Fragment>
                                    {dateWiseLogs.map((log, index) => (
                                      <tr key={index}>
                                        <td className="px-3 py-2 d-flex align-items-center">{moment(log.check_in).format("YYYY-MM-DD HH:mm")}</td>
                                        <td className="px-1 py-2">{(log.empty_end_time == true)?'--':moment(log.check_out).format("YYYY-MM-DD HH:mm")}</td>
                                        <td className="px-1 py-2">{log.total_hours}</td>
                                        <td className="px-1 py-2">{log.project_name}</td>
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

export default DateWiseLogsModal;
