import React, { Fragment, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, ListGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
const Loader = ({}) => {
 

  return (
    <>
      <div className="loader-main">
        <div className="loader-transparent d-flex vh-100 align-items-center justify-content-center" style={{ color: '#2b8ebf'}}>
            <div className="spinner-grow" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
        </div>
      </div>  
    </>
  );
};

export default Loader;
