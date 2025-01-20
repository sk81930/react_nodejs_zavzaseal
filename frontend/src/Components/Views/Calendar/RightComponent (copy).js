import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdb-react-ui-kit";
import { Button, Form } from "react-bootstrap";
import Select, { components } from "react-select";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

import SideModal from '../../Layouts/SideModal';
import { OPEN_PROFILE_MODAL } from '../../../constants/actionTypes';

export const openProfileModal = (userId) => ({
  type: OPEN_PROFILE_MODAL,
  payload: {
    userId
  }
});


const RightComponent = ({ crewMembers, taskData, status, setStatus, priority, setPriority, selectedCrewMembers, setSelectedCrewMembers, dropdownOpen, setDropdownOpen,startDate, setStartDate, endDate, setEndDate, handleSubmit  }) => {

  const [crewOptions, setCrewOptions] = useState([]);

  const dispatch = useDispatch();

  // Set the status and priority from taskData
  useEffect(() => {
      if (taskData) {
        setStatus(taskData.status || "In-Progress");
        setPriority(taskData.priority || "High");
        setStartDate(taskData.start_datetime ? dayjs(taskData.start_datetime) : null);  // Use dayjs to parse the date
        setEndDate(taskData.end_datetime ? dayjs(taskData.end_datetime) : null);  // Use dayjs to parse the date
        if (taskData.crew_members) {
          const rows = taskData.crew_members.map((item) => ({
            value: item.user_id,
            label: `${item.first_name} ${item.last_name}`,
            profile_image: item.profile_image,  // Add profile image
          }));
          setSelectedCrewMembers(rows);  
        }
      }
  }, [taskData]);

  useEffect(() => {
    if (crewMembers) {
      const rows = crewMembers.map((item) => ({
        value: item.id,
        label: `${item.first_name} ${item.last_name}`,
        profile_image: item.profile_image,
      }));
      setCrewOptions(rows);
    }
    console.log(crewMembers)
  }, [crewMembers]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
  };

  const statusColors = {
    "In-Progress": "#fff4d6",  // Yellow for In-Progress
    "Pending": "#ffd6d6",      // Orange for Pending
    "Complete": "#a3f1a4",     // Green for Complete
  };

  const priorityColors = {
    "High": "#ffd6d6",  // Yellow for High
    "Medium": "#fff4d6",  // Orange for Medium
    "Low": "#a3f1a4",  // Green for Low
  };

  const CheckboxOption = (props) => {
    return (
      <components.Option {...props}>
        <input type="checkbox" checked={props.isSelected} onChange={() => null} />
        <label style={{ marginLeft: "8px" }}>{props.label}</label>
      </components.Option>
    );
  };

  return (
    <MDBContainer className="p-4" style={{ maxWidth: "600px" }}>
      <MDBRow>
        <MDBCol size="12" className="main-right-frm">
          <h5 className="mb-4">Description</h5>
          <Form.Group controlId="startDate" className="form-gr">
            <Form.Label>Start Date</Form.Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={startDate}
                onChange={handleStartDateChange}
                renderInput={(params) => <input {...params} />}
                format="DD/MM/YYYY hh:mm a"
              />
            </LocalizationProvider>
          </Form.Group>
          <Form.Group controlId="endDate" className="form-gr">
            <Form.Label>End Date</Form.Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={endDate}
                onChange={handleEndDateChange}
                renderInput={(params) => <input {...params} />}
                format="DD/MM/YYYY hh:mm a"
              />
            </LocalizationProvider>
          </Form.Group>
          <Form.Group controlId="status" className="form-gr">
            <Form.Label>Status</Form.Label>
            <MDBDropdown>
              <MDBDropdownToggle color="light" style={{ backgroundColor: statusColors[status], color: "#656363" }}>
                {status}
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                <MDBDropdownItem link onClick={() => handleStatusChange("In-Progress")}>
                  In-Progress
                </MDBDropdownItem>
                <MDBDropdownItem link onClick={() => handleStatusChange("Pending")}>
                  Pending
                </MDBDropdownItem>
                <MDBDropdownItem link onClick={() => handleStatusChange("Complete")}>
                  Complete
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </Form.Group>
          <Form.Group controlId="priority" className="form-gr">
            <Form.Label>Priority</Form.Label>
            <MDBDropdown>
              <MDBDropdownToggle color="light" style={{ backgroundColor: priorityColors[priority], color: "#656363" }}>
                {priority}
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                <MDBDropdownItem link onClick={() => handlePriorityChange("High")}>
                  High
                </MDBDropdownItem>
                <MDBDropdownItem link onClick={() => handlePriorityChange("Medium")}>
                  Medium
                </MDBDropdownItem>
                <MDBDropdownItem link onClick={() => handlePriorityChange("Low")}>
                  Low
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </Form.Group>
        </MDBCol>
      </MDBRow>
      <MDBRow className="crewDiv">
        <h6 className="mt-4">Assigned Crew Members</h6>
        <div className="d-flex align-items-center crewDivInner">
          {selectedCrewMembers.map((member, index) => (
            <img
              key={index}
              src={(member.profile_image)? (process.env.REACT_APP_BACKEND+member.profile_image): "https://via.placeholder.com/40"} 
              alt={`member${index + 1}`}
              className="rounded-circle"
              onClick={() => dispatch(openProfileModal(member.value))}
            />
          ))}
          <div className="addMemberMain">
            <MDBDropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
              <MDBDropdownToggle color="light" tag="span">
                <span className="rounded-circle addMember">+</span>
                <span className="span">Add New Member</span>
              </MDBDropdownToggle>
              <MDBDropdownMenu>
                <MDBDropdownItem link onClick={(e) => e.preventDefault()}>
                  <Select
                    options={crewOptions}
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    components={{ Option: CheckboxOption }}
                    onChange={(selected) => setSelectedCrewMembers(selected || [])}
                    value={selectedCrewMembers}
                    placeholder="Select crew members..."
                  />
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </div>
        </div>
      </MDBRow>
    </MDBContainer>
  );
};

export default RightComponent;
