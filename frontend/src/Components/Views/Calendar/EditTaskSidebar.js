import React, { Fragment, useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./EditTaskSidebar.scss";
import NotesComponent from "./NotesComponent";
import RightComponent from "./RightComponent";
import CommentsComponent from "./CommentsComponent";
import { GoLink } from "react-icons/go";
import agent from '../../../agent';
import moment from 'moment';
import SideModal from '../../Layouts/SideModal';
import { LOADER_SHOW } from '../../../constants/actionTypes';

export const callLoaderShow = (type) => ({
  type: LOADER_SHOW,
  payload: { type }
});

const EditTaskSidebar = ({
  currentUser,
  isOpen,
  setIsOpen,
  event,
  crewMembers,
  setLoadEvent
}) => {

  const navigate = useNavigate();
  const [taskData, setTaskData] = useState(null);
  const [notesData, setNotesData] = useState(null);
  const [commentsData, setCommentsData] = useState(null);

  const [status, setStatus] = useState("In-Progress");
  const [priority, setPriority] = useState("High");
  const [selectedCrewMembers, setSelectedCrewMembers] = useState([]);

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

  /* ================================
     RESET MODAL WHEN OPENED
  ================================= */

  useEffect(() => {
    if (isOpen) {
      setTaskData(null);
      setStatus("In-Progress");
      setPriority("High");
      setSelectedCrewMembers([]);
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

  /* ================================
     LOAD TASK DATA
  ================================= */

  

  const getTaskById = async (taskId) => {
    try {
      const response = await agent.Auth.getTaskById(taskId);

      if (response?.data?.id) {
        const data = response.data;

        setTaskData(data);

        // 🔥 Load DATE fields properly
        setStartDate(data.start_date ? moment(data.start_date) : null);
        setEndDate(data.end_date ? moment(data.end_date) : null);

        if (data.products) {
          const paidProducts = data.products
            .filter(product => product.status === "paid")
            .map(product => product.id.toString());
          setCheckedProducts(paidProducts);
        }
      }
    } catch (error) {
      setTaskData(null);
    }
  };

  const getNotes = async (taskId) => {
    try {
      const response = await agent.Auth.getNotes(taskId);
      setNotesData(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setNotesData([]);
    }
  };

  const getComments = async (taskId) => {
    try {
      const response = await agent.Auth.getComments(taskId);
      setCommentsData(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setCommentsData([]);
    }
  };

  useEffect(() => {
    if (event?.id) {
      getTaskById(event.id);
      getNotes(event.id);
      getComments(event.id);
    } else {
      setIsOpen(false);
    }
  }, [event]);

  /* ================================
     SUBMIT EDIT
  ================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // if (selectedCrewMembers.length === 0) {
    //   setErrorMsg("Please assign at least 1 crew member");
    //   return;
    // }

    const formDataNew = new FormData();

    const start_date = startDate ? startDate.format("YYYY-MM-DD") : null;
    const end_date = endDate ? endDate.format("YYYY-MM-DD") : null;

    formDataNew.append("status", status);
    formDataNew.append("priority", priority);
    formDataNew.append("start_date", start_date);
    formDataNew.append("end_date", end_date);

    if (commentText) {
      formDataNew.append("commentText", commentText);
    }

    selectedCrewMembers.forEach(member => {
      formDataNew.append("crew_members[]", member.value);
    });

    formDataNew.append("noteText", noteText);

    files.forEach(file => {
      formDataNew.append("noteFiles[]", file);
    });

    images.forEach(image => {
      formDataNew.append("noteImages[]", image);
    });

    checkedProducts.forEach(product => {
      formDataNew.append("checkedProduct[]", product);
    });

    dispatch(callLoaderShow(true));

    try {
      const editData = await agent.Auth.editTask(formDataNew, taskData.id);

      dispatch(callLoaderShow(false));

      if (editData?.isSuccess) {
        setSuccessMsg(editData.message);
        await getNotes(taskData.id);
        await getComments(taskData.id);
        setLoadEvent(true);
      }

    } catch (error) {
      dispatch(callLoaderShow(false));
      setErrorMsg(error.message);
    }
  };

  /* ================================
     COMPONENT PARAMS
  ================================= */

  const rightCompParams = {
    status, setStatus,
    priority, setPriority,
    selectedCrewMembers, setSelectedCrewMembers,
    startDate, setStartDate,
    endDate, setEndDate,
    handleSubmit,
    currentUser
  };

  const notesCompParams = {
    noteText, setNoteText,
    files, setFiles,
    images, setImages,
    notesData,
    currentUser
  };

  const commentCompParams = {
    commentText, setCommentText,
    taskData,
    commentsData,
    currentUser
  };

  const lead = taskData?.lead_data;
  const leadFullName = lead?.full_name || "";
  const leadDisplayId = lead?.lead_id || "";
  const leadAddress = lead?.address || "";
  const leadJson = lead?.lead_json_data || {};
  const leadPhone = leadJson?.PHONE?.length > 0 ? leadJson.PHONE[0].VALUE : "";
  const leadEmail = leadJson?.EMAIL?.length > 0 ? leadJson.EMAIL[0].VALUE : "";
  const estimateRef = lead?.estimate_id || "";
  const assignedCrew = taskData?.crew_members || [];

  /* ================================
     RENDER
  ================================= */

  return (
    <SideModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      showButton={true}
      handleSubmit={handleSubmit}
      classDef="editTaskContainer"
    >
      <div className="taskContiner">

        <div className="taskContinerInner left-task-content">

          {taskData && (
            <Fragment>

              {/* Header */}
              <div className="taskgridBox tasktop-box mb-3">
                <div className="header">
                  <div className="headerInner d-flex justify-content-between align-items-center">
                    <h2>
                      {leadFullName}
                      {leadDisplayId && (
                        <span className="ms-2 text-muted">#{leadDisplayId}</span>
                      )}
                    </h2>
                    <GoLink style={{ fontSize: "23px" }} />
                  </div>

                  <div className="headerInnerBottom">
                    <p className="fw-normal text-muted">
                      <span className="startdate">{
                        taskData?.start_date
                          ? moment(taskData.start_date).format("DD MMMM YYYY")
                          : "N/A"
                      }</span>
                      <span className="mx-2">|</span>
                      <span className="enddate">{
                        taskData?.end_date
                          ? moment(taskData.end_date).format("DD MMMM YYYY")
                          : "N/A"
                      }</span>
                    </p>

                    {estimateRef && (
                      <div className="text-muted small">
                        Estimate: E-000{estimateRef}
                      </div>
                    )}

                    {leadAddress && (
                      <div className="address-bar mt-4 mb-2">
                        <span className="text-muted small">Address:</span>
                        <div className="info-txt">{leadAddress}</div>
                      </div>
                    )}
                    {leadPhone && (
                      <div className="phone-bar my-2">
                        <span className="text-muted small">Phone Number:</span>
                        <div className="info-txt">{leadPhone}</div>
                      </div>
                    )}

                    {leadEmail && (
                      <div className="email-bar mt-2 mb-4">
                        <span className="text-muted small">Email Address</span>
                        <div className="info-txt">{leadEmail}</div>
                      </div>
                    )}
                    <span className="d-none">
                      by {taskData?.user_first_name} {taskData?.user_last_name}
                    </span>
                  </div>
                </div>

                <div className="notes-section">
                  <NotesComponent {...notesCompParams} />
                </div>
              </div>

              <div className="taskgridBox comments-box">
                <div className="comments-section">
                  <CommentsComponent {...commentCompParams} />
                </div>
              </div>

            </Fragment>
          )}

        </div>

        <div className="taskContinerInner right-task-content">
          <div className="taskgridringh">
            <RightComponent
              crewMembers={crewMembers}
              taskData={taskData}
              {...rightCompParams}
            />
            {assignedCrew.length > 0 && (
            <div className="assigned-crew-box">
              <h4 className="assigned-crew-title">Assigned Crew Members</h4>
              <div className="assigned-crew-main">
                <div className="assigned-crew-top">
                  <div className="assigned-crew-mini-avatars">
                    {assignedCrew.slice(0, 3).map((member, idx) => {
                      const firstName = member?.first_name || member?.user?.first_name || "";
                      const lastName = member?.last_name || member?.user?.last_name || "";
                      const fullName = `${firstName} ${lastName}`.trim() || member?.name || "Crew Member";
                      const imagePath = member?.profile_image || member?.user?.profile_image;
                      const imageUrl = imagePath ? `${process.env.REACT_APP_BACKEND}${imagePath}` : "";

                      return (
                        <div className="assigned-crew-mini-avatar" key={`${fullName}-mini-${idx}`}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={fullName} />
                          ) : (
                            <span>{fullName[0] ? fullName[0].toUpperCase() : "?"}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {currentUser?.role !== "crew" && (
                  <button
                    type="button"
                    className="view-all-btn"
                    onClick={() =>
                      navigate("/crew", {
                        state: {
                          projectId: taskData?.id,
                          managerId: currentUser?.id
                        }
                      })
                    }
                  >
                    View all
                  </button>
                )}
                  
                </div>

                <div className="assigned-crew-list">
                  {assignedCrew.slice(0, 5).map((member, idx) => {
                    const firstName = member?.first_name || member?.user?.first_name || "";
                    const lastName = member?.last_name || member?.user?.last_name || "";
                    const fullName = `${firstName} ${lastName}`.trim() || member?.name || "Crew Member";
                    const crewId = member?.employee_id || member?.crew_id || member?.id || "N/A";
                    const imagePath = member?.profile_image || member?.user?.profile_image;
                    const imageUrl = imagePath ? `${process.env.REACT_APP_BACKEND}${imagePath}` : "";

                    return (
                      <div className="assigned-crew-item" key={`${crewId}-${idx}`}>
                        <div className="assigned-crew-avatar">
                          {imageUrl ? (
                            <img src={imageUrl} alt={fullName} />
                          ) : (
                            <span>{fullName[0] ? fullName[0].toUpperCase() : "?"}</span>
                          )}
                        </div>
                        <div className="assigned-crew-meta">
                          <p className="assigned-crew-name">{fullName}</p>
                          <p className="assigned-crew-id">ID: FR-{crewId}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            )}
            {errorMsg && (
              <div className="alert alert-danger">{errorMsg}</div>
            )}

            {successMsg && (
              <div className="alert alert-success">{successMsg}</div>
            )}
          </div>
        </div>

      </div>
    </SideModal>
  );
};

export default EditTaskSidebar;