import React, { Fragment, useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { Modal, Button, Form, Row, Col, ListGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EditTaskSidebar.scss";
import NotesComponent from "./NotesComponent";
import RightComponent from "./RightComponent";
import CommentsComponent from "./CommentsComponent";
import { IoCloseOutline } from "react-icons/io5";
import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { GoLink } from "react-icons/go";
import agent from '../../../agent';
import moment from 'moment';
import SideModal from '../../Layouts/SideModal';

import { CiEdit } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";

import { LOADER_SHOW } from '../../../constants/actionTypes';

export const callLoaderShow = (type) => ({
  type: LOADER_SHOW,
  payload: {
    type
  }
});

const EditTaskSidebar = ({ currentUser, isOpen, setIsOpen, onClose, event, dealsData, crewMembers, addTaskError, addTaskSuccess, clearFlash, setLoadEvent }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [taskData, setTaskData] = useState(null);
  const [notesData, setNotesData] = useState(null);
  const [commentsData, setCommentsData] = useState(null);

  const [onHide, setOnHide] = useState(false);

  const [status, setStatus] = useState("In-Progress");
  const [priority, setPriority] = useState("High");
  const [selectedCrewMembers, setSelectedCrewMembers] = useState([]);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [noteText, setNoteText] = useState("");
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [checkedProducts, setCheckedProducts] = useState([]);

  const [commentText, setCommentText] = useState("");

  const dispatch = useDispatch();

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    setCheckedProducts((prevChecked) => {
      if (checked) {
        // Add product to checkedProducts
        return [...prevChecked, value];
      } else {
        // Remove product from checkedProducts
        return prevChecked.filter((id) => id !== value);
      }
    });
  };


  

  useEffect(() => {
    if (isOpen) {
      // Reset all states when modal opens
      setTaskData(null);
      setStatus("In-Progress");
      setPriority("High");
      setSelectedCrewMembers([]);
      setDropdownOpen(false);
      setStartDate(null);
      setEndDate(null);
      setNoteText("");
      setFiles([]);
      setImages([]);
      setErrorMsg(null);
      setSuccessMsg(null);
      setCheckedProducts([]);
      setCommentText("");
    }
  }, [isOpen]);
  useEffect(() => {
    if (successMsg) {

      setLoadEvent(true);
      
      setTimeout(function(){
        setSuccessMsg(null);
        setOnHide(true);
      },2000)
      
    }
  }, [successMsg]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formDataNew = new FormData();

    // Append non-file data to FormData
    formDataNew.append("status", status);
    formDataNew.append("priority", priority);
    formDataNew.append("start_datetime", startDate ? startDate.toISOString() : null);
    formDataNew.append("end_datetime", endDate ? endDate.toISOString() : null);


    if(commentText != ""){
       formDataNew.append("commentText", commentText);
    }

    if(selectedCrewMembers.length === 0){
       setErrorMsg("Please assign at least 1 crew member");
       return;
    }

    
    // Append crew members as individual fields in FormData
    selectedCrewMembers.forEach(member => {
      formDataNew.append("crew_members[]", member.value); // Using '[]' to append as an array
    });

    // Append noteText and files/images
    formDataNew.append("noteText", noteText);

    // Check and append files (files should be an array)
    if (files && files.length > 0) {
      files.forEach(file => {
        formDataNew.append("noteFiles[]", file); // Append each file individually
      });
    }

    // Check and append images (images should be an array)
    if (images && images.length > 0) {
      images.forEach(image => {
        formDataNew.append("noteImages[]", image); // Append each image individually
      });
    }

    checkedProducts.forEach(checkedProduct => {
      formDataNew.append("checkedProduct[]", checkedProduct); // Using '[]' to append as an array
    });

    dispatch(callLoaderShow(true))

    try {
      // Assuming agent.Auth.editTask handles FormData
      const editData = await agent.Auth.editTask(formDataNew, taskData.id);
      dispatch(callLoaderShow(false))

      if(editData && editData.isSuccess){

          setSuccessMsg(editData.message);
          
      }

    } catch (error) {
      dispatch(callLoaderShow(false))
      if (error.response && error.response.body && error.response.body.message) {
          setErrorMsg(error.response.body.message);
      }else{
        setErrorMsg(error.message);
      }
      
      // Handle error, maybe show a message to the user
    }
  };

  const getTaskById = async (taskId) => {
    try {
      const taskResponse = await agent.Auth.getTaskById(taskId);

      if (taskResponse && taskResponse.data && taskResponse.data.id) {
        setTaskData(taskResponse.data);
      } else {
        setTaskData(null);
      }
    } catch (error) {
     // console.log(error.message);
      setTaskData(null);
    }
  };
  const getNotes = async (taskId) => {
    try {
      const notesResponse = await agent.Auth.getNotes(taskId);


      if (notesResponse && notesResponse.data && notesResponse.data.length > 0) {
        setNotesData(notesResponse.data);
      } else {
        setNotesData([]);
      }
    } catch (error) {
     // console.log(error.message);
      setNotesData([]);
    }
  };
  const getComments = async (taskId) => {
    try {
      const commentsResponse = await agent.Auth.getComments(taskId);

     // console.log(commentsResponse)
      if (commentsResponse && commentsResponse.data && commentsResponse.data.length > 0) {
        setCommentsData(commentsResponse.data);
      } else {
        setCommentsData([]);
      }
    } catch (error) {
      //console.log(error.message);
      setCommentsData([]);
    }
  };



  useEffect(() => {
    if (event && event.id) {
      //console.log(currentUser)
      getTaskById(event.id);
      getNotes(event.id);
      getComments(event.id);
    } else {
      setIsOpen(false);
    }
  }, [event]);

  useEffect(() => {
    if (taskData && taskData.id) {
      const paidProducts = taskData.products
        .filter(product => product.status === "paid")
        .map(product => product.id.toString()); // Assuming you want the IDs as strings

      // Set the checked products state
      setCheckedProducts(paidProducts);
    }
  }, [taskData]);

  const formatDateTime = (dateTime) => {
    return moment(dateTime).format("YYYY-MM-DDTHH:mm");
  };



  const rightCompParams = {
    status, setStatus,
    priority, setPriority,
    selectedCrewMembers, setSelectedCrewMembers,
    dropdownOpen, setDropdownOpen,
    startDate, setStartDate,
    endDate, setEndDate,
    handleSubmit,
    currentUser
  }

  const notesCompParams = {
    noteText, setNoteText,
    files, setFiles,
    images, setImages,
    notesData,
    currentUser
  }
  const commentCompParams = {
    commentText, setCommentText,
    taskData,
    commentsData,
    currentUser
  }

  return (
    <>
      <SideModal isOpen={isOpen} setIsOpen={setIsOpen} onHide={onHide} setOnHide={setOnHide} showButton={true} handleSubmit={handleSubmit} classDef="editTaskContainer" >
          <div className="taskContiner">
            <div className="taskContinerInner left-task-content">
              <MDBContainer>
                <div className="card-container">
                  {/* Header Section */}
                  <div className="header">
                    <div className="headerInner d-flex justify-content-space-between align-items-center">
                      <h2>{taskData?.title || "Task Title"}</h2>
                      <GoLink style={{ fontSize: "23px" }} />
                    </div>
                    <div className="headerInnerBottom">
                      <p>{taskData ? moment(taskData.start_datetime).format("DD MMMM YYYY") : "N/A"}</p>
                      <span>by {taskData ? taskData.user_first_name + " " + taskData.user_last_name : "Unknown"}</span>
                    </div>
                  </div>

                  <div className="notes-section">
                    <NotesComponent {...notesCompParams}/>
                  </div>


                  <div className="purchases-section mt-5">
                    <h4>Purchases:</h4>
                      {taskData?.products?.map((product) => (
                        <div key={product.id} className="form-group">
                          <input
                            type="checkbox"
                            id={product.product_name}
                            name="product_paid"
                            value={product.id}
                            onChange={handleCheckboxChange}
                            checked={checkedProducts.includes(product.id.toString())} // Step 4: Make the checkbox controlled
                          />
                          <label htmlFor={product.product_name} className="text-sm ms-1 mt-1">
                            {product.product_name}
                          </label>
                        </div>
                      ))}
                  </div>
                  {/* Comments Section */}
                  <div className="comments-section mt-5">
                    <h4>Comments</h4>
                    <CommentsComponent {...commentCompParams}/>
                  </div>

                </div>
              </MDBContainer>
            </div>
            <div className="taskContinerInner right-task-content">
              <RightComponent crewMembers={crewMembers} taskData={taskData} {...rightCompParams} />
              {/* Error Message Banner */}
              {errorMsg ? 
                  <div className="alert alert-danger" role="alert">{errorMsg}</div>
              : <Fragment /> }
              {successMsg ? 
                <div className="alert alert-success" role="alert">{successMsg}</div>
              : <Fragment /> }
            </div>
          </div>
      </SideModal>
    </>
  );
};

export default EditTaskSidebar;
