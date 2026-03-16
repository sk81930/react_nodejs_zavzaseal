import React, { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import Creatable from "react-select/creatable";
import { withAsyncPaginate, AsyncPaginate } from "react-select-async-paginate";
import Select, { components } from "react-select";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import agent from "../../../agent";
import { CalendarToday, AccessTime } from '@mui/icons-material';
import { TextField, IconButton } from '@mui/material';
import { FiUserPlus } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";

import moment from "moment";

import "bootstrap/dist/css/bootstrap.min.css";
import "./AddTaskModal.scss";

const AddTaskModal = ({ isOpen, onClose, onAddEvent, dealsData, crewMembers, addTaskError, addTaskSuccess, clearFlash, setLoadEvent, eventStartDate }) => {
const navigate = useNavigate();
  // Toggle to show/hide certain fields in task creation
  // Set to true to show fields, false to hide them
  const SHOW_FIRST_STEP = false;        // Controls the first step (option selection)
  const SHOW_NEW_TASK_OPTION = false;  // Controls "Set a New Task" button option
  const SHOW_TIME_FIELDS = false;      // Controls start_time and end_time fields
  const SHOW_CREW_ASSIGNMENT = false;   // Controls "Assign Crew Members" field
  const SHOW_PURCHASE = false;          // Controls "Purchase" section

  const CreatableAsyncPaginate = withAsyncPaginate(Creatable);

  // Start at step 2 if first step is hidden
  const [step, setStep] = useState(SHOW_FIRST_STEP ? 1 : 2);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [selectedCrewMembers, setSelectedCrewMembers] = useState([]);
  const [products, setProducts] = useState([{ id: Date.now(), name: "", price: "" }]);
  const [taskTitle, setTaskTitle] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [crewOptions, setCrewOptions] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#5bc0de");

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isFocused, setIsFocused] = useState(false);


  const [errors, setErrors] = useState({
    startDate: false,
    endDate: false,
    products: false,
    taskTitle: false,
    crewMembersError: false,
    endDateBeforeStartError: false,
  });

  const CheckboxOption = (props) => {
    return (
      <components.Option {...props}>
        <input type="checkbox" checked={props.isSelected} onChange={() => null} />
        <label style={{ marginLeft: "8px" }}>{props.label}</label>
      </components.Option>
    );
  };

  const CustomProjectOption = (props) => {
    const { data } = props;
    const clientName = data.clientName || data.label || "Untitled Project";
    const address = data.address || "No address";
    const leadId = data.leadId || "";
    
    // Format: "Name #ID" on first line, address on second line
    const displayName = leadId ? `${clientName} #${leadId}` : clientName;

    return (
      <components.Option {...props}>
        <div className="usermain">
          <span className="usericons me-3"><svg width="16" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.1159 17.8153C18.8306 15.5594 16.8235 13.8017 14.4178 12.825C15.6141 11.9278 16.4978 10.6768 16.9437 9.24944C17.3896 7.82205 17.3751 6.29055 16.9022 4.87188C16.4293 3.4532 15.522 2.21928 14.3089 1.3449C13.0957 0.470516 11.6382 0 10.1428 0C8.64739 0 7.18988 0.470516 5.97674 1.3449C4.7636 2.21928 3.85633 3.4532 3.38343 4.87188C2.91054 6.29055 2.89601 7.82205 3.34189 9.24944C3.78778 10.6768 4.67147 11.9278 5.8678 12.825C3.46211 13.8017 1.45503 15.5594 0.169678 17.8153C0.0900326 17.9434 0.0369494 18.0861 0.0135841 18.2351C-0.00978127 18.3841 -0.00295191 18.5363 0.0336663 18.6826C0.0702845 18.8289 0.135944 18.9663 0.226741 19.0868C0.317538 19.2072 0.43162 19.3081 0.562203 19.3835C0.692787 19.459 0.837207 19.5074 0.986877 19.5259C1.13655 19.5444 1.28841 19.5327 1.43345 19.4913C1.57848 19.45 1.71372 19.3799 1.83112 19.2852C1.94853 19.1906 2.0457 19.0733 2.11687 18.9403C3.81562 16.0041 6.81562 14.2528 10.1428 14.2528C13.47 14.2528 16.47 16.005 18.1687 18.9403C18.323 19.1883 18.5676 19.3666 18.8509 19.4375C19.1342 19.5084 19.434 19.4664 19.6869 19.3203C19.9397 19.1742 20.1259 18.9355 20.206 18.6546C20.286 18.3738 20.2537 18.0728 20.1159 17.8153ZM5.2678 7.12781C5.2678 6.16363 5.55372 5.2211 6.08939 4.41941C6.62506 3.61772 7.38643 2.99288 8.27722 2.6239C9.16801 2.25492 10.1482 2.15838 11.0939 2.34648C12.0395 2.53459 12.9082 2.99889 13.5899 3.68067C14.2717 4.36245 14.736 5.23109 14.9241 6.17675C15.1122 7.1224 15.0157 8.1026 14.6467 8.99339C14.2777 9.88418 13.6529 10.6456 12.8512 11.1812C12.0495 11.7169 11.107 12.0028 10.1428 12.0028C8.85033 12.0013 7.61122 11.4872 6.6973 10.5733C5.78338 9.6594 5.26929 8.42029 5.2678 7.12781Z" fill="#646464"></path></svg></span>
          <div style={{ flex: 1 }}>
            <div className="username">{displayName}</div>
            <div className="usertxt">{address}</div>
          </div>
        </div>
      </components.Option>
    );
  };

  const handleLoadOptions = async (inputValue, loadedOptions, { page }) => {
    const limit = 20;
    try {
      // Use getLeadsData from backend leads model
      const leadsResponse = await agent.Website.getLeadsData(
        inputValue || "", // search
        "", // source
        "all", // website
        "", // leadType
        page || 1, // page
        limit, // limit
        "", // sortField
        "DESC" // sortOrder
      );

      if (
        leadsResponse &&
        leadsResponse.isSuccess &&
        leadsResponse.data &&
        leadsResponse.data.dealsData &&
        leadsResponse.data.dealsData.leads &&
        Array.isArray(leadsResponse.data.dealsData.leads)
      ) {
        const { leads, pagination } = leadsResponse.data.dealsData;

        // Map leads to options format
        const enrichedLeads = leads.map((lead) => {
          // Extract address from lead_json_data
          let address = '';
          if (lead.lead_json_data && lead.lead_json_data.UF_CRM_LEAD_1708606658714) {
            address = lead.lead_json_data.UF_CRM_LEAD_1708606658714;
          } else if (lead.lead_json_data && lead.lead_json_data.ADDRESS) {
            address = lead.lead_json_data.ADDRESS;
          }
          
          const firstName = lead.NAME || '';
          const lastName = lead.LAST_NAME || '';
          const clientName = `${firstName} ${lastName}`.trim() || "Untitled Lead";
          const leadId = lead.lead_id || '';

          return {
            value: lead.id, // Use lead.id (database id) as value
            label: clientName,
            clientName: clientName,
            address: address || "No address",
            leadId: leadId,
            leadData: {
              id: lead.id,
              lead_id: lead.lead_id,
              deal_id: lead.deal_id,
              NAME: lead.NAME,
              LAST_NAME: lead.LAST_NAME,
              lead_json_data: lead.lead_json_data
            }
          };
        });

        return {
          options: enrichedLeads,
          hasMore: pagination && pagination.totalCount > (loadedOptions.length + leads.length),
          additional: {
            page: (page || 1) + 1,
          },
        };
      }

      return {
        options: [],
        hasMore: false,
        additional: {
          page: page || 1,
        },
      };
    } catch (error) {
      console.error("Error fetching leads:", error);

      return {
        options: [],
        hasMore: false,
        additional: {
          page: page || 1,
        },
      };
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep(SHOW_FIRST_STEP ? 1 : 2);
      setSelectedOption(null);
      setSelectedSearchOption(null);
      setSelectedCrewMembers([]);
      setProducts([{ id: Date.now(), name: "", price: "" }]);
      setTaskTitle("");
      setStartDate(null);
      setStartTime(null);
      setEndDate(null);
      setEndTime(null);
      setSelectedColor("#5bc0de");
      setErrors({
        startDate: false,
        endDate: false,
        taskTitle: false,
        crewMembersError: false,
        endDateBeforeStartError: false,
      });
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleAddProduct = () => {
    const newProduct = { id: Date.now(), name: "", price: "" };
    setProducts([...products, newProduct]);
  };

  const handleRemoveProduct = (id) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
  };

  const handleInputChange = (id, field, value) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
  };

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
  };

  const handleAddTask = () => {

    clearFlash();
    setErrorMsg(null);
    setSuccessMsg(null);
    // Reset errors
    setErrors({
      startDate: false,
      endDate: false,
      products: false,
    });

    // Validation
    let formIsValid = true;


    let task_title = null;
    let lead_id = null;
    let deal_id = null;

    if(selectedSearchOption && selectedSearchOption.value){
        // Now using leads, so value is lead.id (database id)
        lead_id = selectedSearchOption.value;
        // Get deal_id from lead data - need to fetch deal.id from deals table using lead.deal_id
        const leadDealId = selectedSearchOption.leadData?.deal_id || null;
        if (leadDealId) {
          // If lead has deal_id, we'll let backend fetch the deal.id from deals table
          // For now, pass null and let backend handle it
          deal_id = null; // Backend will fetch deal.id from lead.deal_id
        }
        // Use client name with lead ID as title
        task_title = selectedSearchOption.clientName || selectedSearchOption.label || "Untitled Task";
    }

    if (!task_title) {
      setErrors((prevErrors) => ({ ...prevErrors, taskTitle: true }));
      formIsValid = false;
    }
    

    // Only validate time fields if they are shown
    if (SHOW_TIME_FIELDS) {
      if (!startDate || !startTime) {
        setErrors((prevErrors) => ({ ...prevErrors, startDate: true }));
        formIsValid = false;
      }

      if (!endDate || !endTime) {
        setErrors((prevErrors) => ({ ...prevErrors, endDate: true }));
        formIsValid = false;
      }
    } else {
      // If time fields are hidden, only validate dates
      if (!startDate) {
        setErrors((prevErrors) => ({ ...prevErrors, startDate: true }));
        formIsValid = false;
      }

      if (!endDate) {
        setErrors((prevErrors) => ({ ...prevErrors, endDate: true }));
        formIsValid = false;
      }
    }

    // Only validate crew members if the field is shown
    if (SHOW_CREW_ASSIGNMENT) {
      if(!selectedCrewMembers || selectedCrewMembers.length <= 0){
        setErrors((prevErrors) => ({ ...prevErrors, crewMembersError: true }));
        formIsValid = false;
      }
    }

    if (endDate && startDate && endDate.isBefore(startDate, 'day')) {

      setErrors((prevErrors) => ({ ...prevErrors, endDateBeforeStartError: true }));

      formIsValid = false;

    } else if (SHOW_TIME_FIELDS && endDate && startDate && endDate.isSame(startDate, 'day') && endTime && startTime && endTime.isBefore(startTime, 'minute')) {

      setErrors((prevErrors) => ({ ...prevErrors, endDateBeforeStartError: true }));

      formIsValid = false;

    }

    // if (products.some((product) => !product.name || !product.price)) {
    //   setErrors((prevErrors) => ({ ...prevErrors, products: true }));
    //   formIsValid = false;
    // }

    if (!formIsValid) {
      return; // Don't submit if form is invalid
    }
    
    // Extract date only (YYYY-MM-DD) since database uses start_date and end_date columns
    const start_date = startDate.format("YYYY-MM-DD");
    const end_date = endDate.format("YYYY-MM-DD");

    // Gather form data and submit if valid
    const taskData = {
      title: task_title,
      lead_id: lead_id,
      deal_id: deal_id, // Backend will fetch deal.id from lead.deal_id if lead_id is provided
      start_date: start_date,
      end_date: end_date,
      color: selectedColor,
      ...(SHOW_PURCHASE && { products }),
      ...(SHOW_CREW_ASSIGNMENT && { crewMembers: selectedCrewMembers.map((member) => member.value) }),
    };

    onAddEvent(taskData);
    
  };

  useEffect(() => {
    if (crewMembers) {
      const rows = crewMembers.map((item) => ({
        value: item.id,
        label: `${item.first_name} ${item.last_name}`,
      }));
      setCrewOptions(rows);
    }
  }, [crewMembers]);

  useEffect(() => {
    if (addTaskError) {
      setErrorMsg(addTaskError);
      clearFlash();
    }
  }, [addTaskError]);

  useEffect(() => {
    if (eventStartDate) {

     
      setStartDate(moment(eventStartDate));
    }
  }, [eventStartDate]);

  useEffect(() => {
    if (addTaskSuccess?.data?.taskId) {
  
      const newTaskId = addTaskSuccess.data.taskId;
  
      navigate("/crew", {
        state: { projectId: newTaskId }
      });
  
      clearFlash();
    }
  
  }, [addTaskSuccess]);


  const disableEndDate = startDate ? (date) => date.isBefore(startDate, 'day') : () => false;

  // Disable end time selection before start time, if the end date is the same as the start date

  const disableEndTime = endDate && startDate && endDate.isSame(startDate, 'day')

    ? (time) => time.isBefore(startTime, 'minute')

    : () => false;

   const todayDate = dayjs().startOf('day').format('YYYY-MM-DD');

  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [startTimePickerOpen, setStartTimePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [endTimePickerOpen, setEndTimePickerOpen] = useState(false);
  //const [menuOpen, setMenuOpen] = useState(false);
  const handleStartDatePickerOpen = () => {
    setStartDatePickerOpen(true);
  };
  const handleEndDatePickerOpen = () => {
    setEndDatePickerOpen(true);
  };
  const handleStartTimePickerOpen = () => {
    setStartTimePickerOpen(true);
  };
  const handleEndTimePickerOpen = () => {
    setEndTimePickerOpen(true);
  };
  const setStartDateFunc = (strt_date) => {
    setStartDate(strt_date);
    setStartDatePickerOpen(false);
  };
  const setEndDateFunc = (newDate) => {
    setEndDate(newDate)
    setEndDatePickerOpen(false);
  };
  const setStartTimeFunc = (newTime) => {
    setStartTime(newTime);
    setStartTimePickerOpen(false);
  };
  const setEndTimeFunc = (newTime) => {
    setEndTime(newTime);
    setEndTimePickerOpen(false);
  };

  const handleClose = () => {
    setStartDatePickerOpen(false);
    setEndDatePickerOpen(false);
    setStartTimePickerOpen(false);
    setEndTimePickerOpen(false);
  };

  const CustomValueContainer = ({ children, ...props }) => {
    const selectedCount = selectedCrewMembers.length;
    return (
      <Fragment>
        <components.ValueContainer {...props} className="select-cont">
          <FiUserPlus style={{ marginRight: 8, fontSize: "20px", color: "#4f4f4f"}} /> {/* Fixed icon */}
          {selectedCount > 2
            ? `${selectedCount} members selected`  // Show the count when items are selected
            : children  // Show default value container (placeholder) when nothing is selected
          }
        </components.ValueContainer>
      </Fragment>
    );
  };

  const CustomProjectContainer = ({ children, ...props }) => {
    const selectedValue = props.getValue();
    const displayValue = selectedValue && selectedValue.length > 0 ? selectedValue[0] : null;
    
    // Format: "Name #ID" when selected
    const displayName = displayValue 
      ? (displayValue.leadId 
          ? `${displayValue.clientName || displayValue.label} #${displayValue.leadId}` 
          : displayValue.clientName || displayValue.label)
      : null;
    
    return (
      <Fragment>
        <components.ValueContainer {...props} className="select-cont">
          <span style={{ marginRight: 8 }}><svg width="16" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.1159 17.8153C18.8306 15.5594 16.8235 13.8017 14.4178 12.825C15.6141 11.9278 16.4978 10.6768 16.9437 9.24944C17.3896 7.82205 17.3751 6.29055 16.9022 4.87188C16.4293 3.4532 15.522 2.21928 14.3089 1.3449C13.0957 0.470516 11.6382 0 10.1428 0C8.64739 0 7.18988 0.470516 5.97674 1.3449C4.7636 2.21928 3.85633 3.4532 3.38343 4.87188C2.91054 6.29055 2.89601 7.82205 3.34189 9.24944C3.78778 10.6768 4.67147 11.9278 5.8678 12.825C3.46211 13.8017 1.45503 15.5594 0.169678 17.8153C0.0900326 17.9434 0.0369494 18.0861 0.0135841 18.2351C-0.00978127 18.3841 -0.00295191 18.5363 0.0336663 18.6826C0.0702845 18.8289 0.135944 18.9663 0.226741 19.0868C0.317538 19.2072 0.43162 19.3081 0.562203 19.3835C0.692787 19.459 0.837207 19.5074 0.986877 19.5259C1.13655 19.5444 1.28841 19.5327 1.43345 19.4913C1.57848 19.45 1.71372 19.3799 1.83112 19.2852C1.94853 19.1906 2.0457 19.0733 2.11687 18.9403C3.81562 16.0041 6.81562 14.2528 10.1428 14.2528C13.47 14.2528 16.47 16.005 18.1687 18.9403C18.323 19.1883 18.5676 19.3666 18.8509 19.4375C19.1342 19.5084 19.434 19.4664 19.6869 19.3203C19.9397 19.1742 20.1259 18.9355 20.206 18.6546C20.286 18.3738 20.2537 18.0728 20.1159 17.8153ZM5.2678 7.12781C5.2678 6.16363 5.55372 5.2211 6.08939 4.41941C6.62506 3.61772 7.38643 2.99288 8.27722 2.6239C9.16801 2.25492 10.1482 2.15838 11.0939 2.34648C12.0395 2.53459 12.9082 2.99889 13.5899 3.68067C14.2717 4.36245 14.736 5.23109 14.9241 6.17675C15.1122 7.1224 15.0157 8.1026 14.6467 8.99339C14.2777 9.88418 13.6529 10.6456 12.8512 11.1812C12.0495 11.7169 11.107 12.0028 10.1428 12.0028C8.85033 12.0013 7.61122 11.4872 6.6973 10.5733C5.78338 9.6594 5.26929 8.42029 5.2678 7.12781Z" fill="#646464"/>
</svg>
</span>
          {displayValue ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ fontWeight: "600", color: "#495057" }}>
                {displayName}
              </span>
              {displayValue.address && (
                <span style={{ fontSize: "12px", color: "#6c757d" }}>
                  {displayValue.address}
                </span>
              )}
            </div>
          ) : (
            children
          )}
        </components.ValueContainer>
      </Fragment>
    );
  };

  return (
    <Fragment>
      <Modal className={(step === 1 && SHOW_FIRST_STEP)?'add-task modal-step-1':'add-task'} show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add a Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {/* Error Message Banner */}
          {errorMsg ? 
              <div className="alert alert-danger" role="alert">{errorMsg}</div>
          : <Fragment /> }
          {successMsg ? 
            <div className="alert alert-success" role="alert">{successMsg}</div>
          : <Fragment /> }

          {(errors.startDate || errors.endDate || errors.taskTitle || errors.crewMembersError || errors.endDateBeforeStartError) && (
            <div className="alert alert-danger">
              Please fix the following errors:
              {errors.taskTitle && <div>Choose Project field required</div>}
              {errors.startDate && <div>Start Date and Time are required</div>}
              {errors.endDate && <div>End Date and Time are required</div>}
              {errors.crewMembersError && <div>Please select at least 1 crew member</div>}
              {errors.endDateBeforeStartError && <div>End Date and Time must be after Start Date and Time</div>}
            </div>
          )}

          {step === 1 && SHOW_FIRST_STEP && (
            <div className="modal-step">
              <div className="button-group d-flex justify-content-between mt-3">
                {SHOW_NEW_TASK_OPTION && (
                <Button
                  variant="outline-primary"
                  className={`option-btn ${selectedOption === "new" ? "active" : ""}`}
                  onClick={() => handleOptionSelect("new")}
                >
                  Set a New Task
                </Button>
                )}
                <Button
                  variant="outline-primary"
                  className={`option-btn ${selectedOption === "project" ? "active" : ""}`}
                  onClick={() => setStep(2)}
                  style={!SHOW_NEW_TASK_OPTION ? { width: "100%" } : {}}
                >
                  Choose From Project
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="modal-step">
              <Form.Group controlId="search" className="mb-3">
                <Form.Label>
                  <h4 className="text-base font-semibold capitalize project-h4">Choose from project</h4>
                </Form.Label>                
                <CreatableAsyncPaginate
                  className="project-select"
                  classNamePrefix="project-select"
                  value={selectedSearchOption}
                  onChange={setSelectedSearchOption}
                  loadOptions={handleLoadOptions}
                  additional={{
                    page: 0,
                  }}
                  placeholder="Search project..."
                  components={{ 
                    ValueContainer: CustomProjectContainer,
                    Option: CustomProjectOption
                  }}
                />
              </Form.Group>

              {/* Start Date and End Date in one line */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <Form.Group controlId="startDate">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div style={{ position: 'relative' }}>
                        <TextField
                          value={startDate?startDate.format("DD/MM/YYYY"):''}
                          onClick={handleStartDatePickerOpen}  
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <IconButton onClick={handleStartDatePickerOpen} edge="start">
                                <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.6667 1.46154H12.6667V0.730769C12.6667 0.536957 12.5964 0.351083 12.4714 0.214037C12.3464 0.0769915 12.1768 0 12 0C11.8232 0 11.6536 0.0769915 11.5286 0.214037C11.4036 0.351083 11.3333 0.536957 11.3333 0.730769V1.46154H4.66667V0.730769C4.66667 0.536957 4.59643 0.351083 4.4714 0.214037C4.34638 0.0769915 4.17681 0 4 0C3.82319 0 3.65362 0.0769915 3.5286 0.214037C3.40357 0.351083 3.33333 0.536957 3.33333 0.730769V1.46154H1.33333C0.979711 1.46154 0.640573 1.61552 0.390524 1.88961C0.140476 2.1637 0 2.53545 0 2.92308V17.5385C0 17.9261 0.140476 18.2978 0.390524 18.5719C0.640573 18.846 0.979711 19 1.33333 19H14.6667C15.0203 19 15.3594 18.846 15.6095 18.5719C15.8595 18.2978 16 17.9261 16 17.5385V2.92308C16 2.53545 15.8595 2.1637 15.6095 1.88961C15.3594 1.61552 15.0203 1.46154 14.6667 1.46154ZM3.33333 2.92308V3.65385C3.33333 3.84766 3.40357 4.03353 3.5286 4.17058C3.65362 4.30762 3.82319 4.38462 4 4.38462C4.17681 4.38462 4.34638 4.30762 4.4714 4.17058C4.59643 4.03353 4.66667 3.84766 4.66667 3.65385V2.92308H11.3333V3.65385C11.3333 3.84766 11.4036 4.03353 11.5286 4.17058C11.6536 4.30762 11.8232 4.38462 12 4.38462C12.1768 4.38462 12.3464 4.30762 12.4714 4.17058C12.5964 4.03353 12.6667 3.84766 12.6667 3.65385V2.92308H14.6667V5.84615H1.33333V2.92308H3.33333ZM14.6667 17.5385H1.33333V7.30769H14.6667V17.5385Z" fill="#646464"/>
</svg>
                              </IconButton>
                            ),
                          }}
                          placeholder="Start Date"
                          fullWidth
                        />
                        <div style={{display:"none"}}>
                          <MobileDatePicker
                            onChange={setStartDateFunc}
                            open={startDatePickerOpen}
                            onClose={handleClose}
                            minDate={dayjs(todayDate)}
                            onAccept={() => handleClose()}
                          />
                        </div>
                      </div>
                    </LocalizationProvider>
                  </Form.Group>
                  {SHOW_TIME_FIELDS && (
                  <Form.Group controlId="startTime" className="mt-2">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div style={{ position: 'relative' }}>
                        <TextField
                          value={startTime?startTime.format("hh:mm A"):''}
                          onClick={handleStartTimePickerOpen}  
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <IconButton onClick={handleStartTimePickerOpen} edge="start">
                                <AccessTime />
                              </IconButton>
                            ),
                          }}
                          placeholder="Start Time"
                          fullWidth
                        />
                        <div style={{display:"none"}}>
                          <MobileTimePicker
                            onChange={setStartTimeFunc}
                            open={startTimePickerOpen}
                            onClose={handleClose}
                          />
                        </div>
                      </div>
                    </LocalizationProvider>
                  </Form.Group>
                  )}
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="endDate">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div style={{ position: 'relative' }}>
                        <TextField
                          value={endDate?endDate.format("DD/MM/YYYY"):''}
                          onClick={handleEndDatePickerOpen}  
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <IconButton onClick={handleEndDatePickerOpen} edge="start">
                                <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.6667 1.46154H12.6667V0.730769C12.6667 0.536957 12.5964 0.351083 12.4714 0.214037C12.3464 0.0769915 12.1768 0 12 0C11.8232 0 11.6536 0.0769915 11.5286 0.214037C11.4036 0.351083 11.3333 0.536957 11.3333 0.730769V1.46154H4.66667V0.730769C4.66667 0.536957 4.59643 0.351083 4.4714 0.214037C4.34638 0.0769915 4.17681 0 4 0C3.82319 0 3.65362 0.0769915 3.5286 0.214037C3.40357 0.351083 3.33333 0.536957 3.33333 0.730769V1.46154H1.33333C0.979711 1.46154 0.640573 1.61552 0.390524 1.88961C0.140476 2.1637 0 2.53545 0 2.92308V17.5385C0 17.9261 0.140476 18.2978 0.390524 18.5719C0.640573 18.846 0.979711 19 1.33333 19H14.6667C15.0203 19 15.3594 18.846 15.6095 18.5719C15.8595 18.2978 16 17.9261 16 17.5385V2.92308C16 2.53545 15.8595 2.1637 15.6095 1.88961C15.3594 1.61552 15.0203 1.46154 14.6667 1.46154ZM3.33333 2.92308V3.65385C3.33333 3.84766 3.40357 4.03353 3.5286 4.17058C3.65362 4.30762 3.82319 4.38462 4 4.38462C4.17681 4.38462 4.34638 4.30762 4.4714 4.17058C4.59643 4.03353 4.66667 3.84766 4.66667 3.65385V2.92308H11.3333V3.65385C11.3333 3.84766 11.4036 4.03353 11.5286 4.17058C11.6536 4.30762 11.8232 4.38462 12 4.38462C12.1768 4.38462 12.3464 4.30762 12.4714 4.17058C12.5964 4.03353 12.6667 3.84766 12.6667 3.65385V2.92308H14.6667V5.84615H1.33333V2.92308H3.33333ZM14.6667 17.5385H1.33333V7.30769H14.6667V17.5385Z" fill="#646464"/>
</svg>
                              </IconButton>
                            ),
                          }}
                          placeholder="End Date"
                          fullWidth
                        />
                        <div style={{display:"none"}}>
                          <MobileDatePicker
                            onChange={setEndDateFunc}
                            open={endDatePickerOpen}
                            onClose={handleClose}
                            minDate={dayjs(todayDate)}
                            shouldDisableDate={disableEndDate}
                          />
                        </div>
                      </div>
                    </LocalizationProvider>
                  </Form.Group>
                  {SHOW_TIME_FIELDS && (
                  <Form.Group controlId="endTime" className="mt-2">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div style={{ position: 'relative' }}>
                        <TextField
                          value={endTime?endTime.format("hh:mm A"):''}
                          onClick={handleEndTimePickerOpen}  
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <IconButton onClick={handleEndTimePickerOpen} edge="start">
                                <AccessTime />
                              </IconButton>
                            ),
                          }}
                          placeholder="End Time"
                          fullWidth
                        />
                        <div style={{display:"none"}}>
                          <MobileTimePicker
                            onChange={setEndTimeFunc}
                            open={endTimePickerOpen}
                            onClose={handleClose}
                            shouldDisableTime={disableEndTime}
                          />
                        </div>
                      </div>
                    </LocalizationProvider>
                  </Form.Group>
                  )}
                </div>
              </div>

              {/* Assign Crew */}
              {SHOW_CREW_ASSIGNMENT && (
              <Form.Group controlId="assignCrew" className="mb-3 assign_crew">
                <Select
                  options={crewOptions}
                  isMulti
                  closeMenuOnSelect={true}
                  hideSelectedOptions={false}
                  components={{ Option: CheckboxOption, ValueContainer: CustomValueContainer}}
                  onChange={(selected) => setSelectedCrewMembers(selected || [])}
                  value={selectedCrewMembers}
                  placeholder={isFocused || selectedCrewMembers.length > 0 ? "" : "Assign Crew Members"}  
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </Form.Group>
              )}
              <Form.Group className="color_wraps d-flex flex-row-reverse justify-content-end align-items-center mb-1" controlId="chooseColor">
                <Form.Label className="mb-0">Choose Color</Form.Label>
                <Form.Control className=" border-0 p-0 shadow-0"
                  type="color" 
                  value={selectedColor}
                  onChange={handleColorChange}
                />
              </Form.Group>
              {/* Products Section */}
              {SHOW_PURCHASE && (
              <Form.Group controlId="products mb-3">
                <Form.Label>Purchase</Form.Label>
                {products.map((product, index) => (
                  <div key={product.id} className="d-flex align-items-center mb-2 product_wrap">
                    <Form.Control
                      type="text"
                      placeholder="Product Name"
                      value={product.name}
                      onChange={(e) => handleInputChange(product.id, "name", e.target.value)}
                      className="me-2"
                    />
                    <Form.Control
                      type="number"
                      placeholder="Price"
                      value={product.price}
                      onChange={(e) => handleInputChange(product.id, "price", e.target.value)}
                      className="me-2"
                    />
                    {products.length > 1 && (
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveProduct(product.id)}
                        style={{ height: "38px", display: "flex", justifyContent:"center", alignItems:"center" }}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                {errors.products && <div className="text-danger">All products must have a name and price</div>}
                <Button
                  variant="light"
                  onClick={handleAddProduct}
                  className="w-100"
                  style={{ border: "1px solid #ccc", fontWeight: "bold" }}
                >
                  Add More Products +
                </Button>
              </Form.Group>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          {step === 1 && SHOW_FIRST_STEP && (
            <Fragment>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                disabled={!selectedOption}
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </Fragment>
          )}
          {step === 2 && (
            <Fragment>
              {SHOW_FIRST_STEP && (
              <Button variant="secondary" onClick={() => setStep(1)}>
                Prev
              </Button>
              )}
              <Button
                variant="primary"
                onClick={handleAddTask}
              >
                Save
              </Button>
            </Fragment>
          )}
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default AddTaskModal;
