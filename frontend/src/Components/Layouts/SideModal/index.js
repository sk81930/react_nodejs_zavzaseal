import React, { Fragment, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, ListGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./sideModal.scss";
import { IoCloseOutline } from "react-icons/io5";
import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { GoLink } from "react-icons/go";
import agent from '../../../agent';
import moment from 'moment';

import { CiEdit } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";

const SideModal = ({isOpen,setIsOpen,onHide,setOnHide,showButton,classDef,handleSubmit,handleCloseDispatch,children}) => {
  
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async (e) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      if (typeof handleCloseDispatch === "function") { 
        handleCloseDispatch()
      }
    }, 500);
  }
  
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false); // Reset closing state when modal is opened
    }
  }, [isOpen]);
  useEffect(() => {
    if(onHide){
      setOnHide(false);
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        if (typeof handleCloseDispatch === "function") { 
          handleCloseDispatch()
        }
      }, 500);

    }
    
  }, [onHide]);
  return (
    <>
      <Modal
        show={isOpen} 
        onHide={handleClose}
        dialogClassName={`side-modal ${classDef} ${isClosing ? "closing" : ""}`} // Apply closing animation class
        animation={false}
      >
        <Modal.Header className="p-1 w-7 d-flex justify-content-center">
          <Button type="button" variant="link" className="custom-close-btn" onClick={handleClose}>
            <IoCloseOutline style={{ fontSize: "26px" }} />
          </Button>
        </Modal.Header>
        <Modal.Body>
           {children}
        </Modal.Body>
        {(showButton) && (
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Save
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
};

export default SideModal;
