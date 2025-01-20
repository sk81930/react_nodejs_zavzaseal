import React, { Fragment, useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn 
} from 'mdb-react-ui-kit';
import { Modal, Button, Form, Row, Col, ListGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./profileModal.scss";
import agent from '../../../agent';
import SideModal from '../SideModal';
import { OPEN_PROFILE_MODAL, CLOSE_PROFILE_MODAL } from '../../../constants/actionTypes';

export const closeProfileModal = () => ({
  type: CLOSE_PROFILE_MODAL,
});

const ProfileModal = ({handleSubmit = null,children}) => {

  const dispatch = useDispatch();
  const ModalUserId = useSelector((state) => state.auth.ModalUserId);
  
  const [onHide, setOnHide] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [userData, setUserData] = useState(null);

  const getUserById = async (user_id) => {

    try {
      // Assuming agent.Auth.editTask handles FormData
      const userDataResponse = await agent.Auth.getUserById(user_id);

      if(userDataResponse && userDataResponse.data && userDataResponse.data.user){
        setUserData(userDataResponse.data.user)
      }else{
        setUserData(null);
      }

    } catch (error) {
       setUserData(null);
    }

  }

  useEffect(() => {
    if(ModalUserId){
      getUserById(ModalUserId)
    }
  }, [ModalUserId]);

  const handleCloseDispatch = async (e) => {
    dispatch(closeProfileModal())
  }
 
  return (
    <>
      <SideModal isOpen={isOpen} setIsOpen={setIsOpen} onHide={onHide} setOnHide={setOnHide} showButton={false}  handleCloseDispatch={handleCloseDispatch} classDef="profileContainer" >
         {(userData) && (
           <Fragment>
            <div className="d-flex align-items-start mb-3" style={{ height: "100px", padding: "20px", paddingRight: "60px" }}>
              <MDBCol size='5' className="left_inner_wrap bg-white rounded-3 shadow-md px-0 py-3">
                  <h3 className="text-lg font-medium text-xs text-uppercase text-light admin_name p-1 pe-3  mb-2 position-relative">{userData.role}</h3>
                  <div className="img-div">
                    <img 
                      className="rounded-circle object-cover cursor-pointer mx-auto mt-lg-5 mt-3 img"
                      src={(userData.profile_image) ? process.env.REACT_APP_BACKEND+userData.profile_image : 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar.jpg'}
                      alt="avatar" 
                      width="200" height="200" />
                  </div>    
              </MDBCol>
              <MDBCol size='7' className="right_inner_wrap p-0 bg-white rounded-3 shadow-md px-3 py-3 ms-3">
                <h3 className="text-2xl font-bold border-bottom border-1 border-0 pb-2 mb-3">Contact information</h3>
                <div className="contact_info_wrap">
                    <MDBRow className="g-4 mb-4">
                      <MDBCol md="12">
                        <div className="form-group">
                          <b>First Name</b>
                          <p>{userData.first_name}</p>
                        </div>
                        <div className="form-group">
                          <b>Last Name</b>
                          <p>{userData.last_name}</p>
                        </div>
                        {(userData.address) && (
                          <div className="form-group">
                            <b>Address</b>
                            <p>{userData.address}</p>
                          </div>
                        )}
                        <div className="form-group">
                          <b>Email address</b>
                          <p>{userData.email}</p>
                        </div>
                        {(userData.contact_number) && (
                          <div className="form-group">
                            <b>Contact Number</b>
                            <p>{userData.contact_number}</p>
                          </div>
                        )}
                        {(userData.hourly_salary) && (
                        <div className="form-group">
                          <b>Hourly Salary</b>
                          <p>{userData.hourly_salary}</p>
                        </div>
                        )}
                       
                      </MDBCol>
                    </MDBRow>
                  </div>
              </MDBCol>
            </div>
           </Fragment>
         )}
      </SideModal>
    </>
  );
};

export default ProfileModal;
