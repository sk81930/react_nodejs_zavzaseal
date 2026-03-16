import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import { CalendarToday } from "@mui/icons-material";
import { TextField, IconButton } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import dayjs from "dayjs";
import { FaRegClock } from "react-icons/fa";
import { CiCircleInfo } from "react-icons/ci";
import { OPEN_PROFILE_MODAL } from "../../../constants/actionTypes";

export const openProfileModal = (userId) => ({
  type: OPEN_PROFILE_MODAL,
  payload: { userId },
});

const RightComponent = ({
  taskData,
  status,
  setStatus,
  priority,
  setPriority,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ============================
     SAFE DATE NORMALIZER
  ============================ */

  const normalizeDate = (value) => {
    if (!value) return null;
    if (dayjs.isDayjs(value)) return value;
    if (typeof value === "string") return dayjs(value);
    return null;
  };

  const normalizedStartDate = useMemo(
    () => normalizeDate(startDate),
    [startDate]
  );

  const normalizedEndDate = useMemo(
    () => normalizeDate(endDate),
    [endDate]
  );

  /* ============================
     LOAD TASK DATA
  ============================ */

  useEffect(() => {
    if (!taskData) return;

    setStatus(taskData.status || "In-Progress");
    setPriority(taskData.priority || "High");

    setStartDate(
      taskData.start_date ? dayjs(taskData.start_date) : null
    );

    setEndDate(
      taskData.end_date ? dayjs(taskData.end_date) : null
    );
  }, [taskData, setStatus, setPriority, setStartDate, setEndDate]);

  /* ============================
     DATE PICKER CONTROL
  ============================ */

  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  const handleClose = () => {
    setStartDatePickerOpen(false);
    setEndDatePickerOpen(false);
  };

  const disableEndDate = normalizedStartDate
    ? (date) => date.isBefore(normalizedStartDate, "day")
    : () => false;

  /* ============================
     STATUS + PRIORITY COLORS
  ============================ */

  const statusIconColors = {
    "In-Progress": "#e29500",
    Pending: "#bd0202",
    Complete: "#087609",
  };

  const statusColors = {
    "In-Progress": "#fff4d6",
    Pending: "#ffd6d6",
    Complete: "#a3f1a4",
  };

  const priorityIconColors = {
    High: "#bd0202",
    Medium: "#e29500",
    Low: "#087609",
  };

  const priorityColors = {
    High: "#ffd6d6",
    Medium: "#fff4d6",
    Low: "#a3f1a4",
  };

  /* ============================
     RENDER
  ============================ */

  return (
    <MDBContainer className="" style={{ maxWidth: "600px" }}>
      <MDBRow>
        <MDBCol size="12" className="main-right-frm">
          {/* START DATE */}
          <Form.Group controlId="startDate" className="form-gr">
            <Form.Label>Start Date</Form.Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div style={{ position: "relative" }}>
                <TextField
                  value={
                    normalizedStartDate
                      ? normalizedStartDate.format("DD/MM/YYYY")
                      : ""
                  }
                  onClick={() => setStartDatePickerOpen(true)}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <IconButton edge="start">
                        <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.6667 1.46154H12.6667V0.730769C12.6667 0.536957 12.5964 0.351083 12.4714 0.214037C12.3464 0.0769915 12.1768 0 12 0C11.8232 0 11.6536 0.0769915 11.5286 0.214037C11.4036 0.351083 11.3333 0.536957 11.3333 0.730769V1.46154H4.66667V0.730769C4.66667 0.536957 4.59643 0.351083 4.4714 0.214037C4.34638 0.0769915 4.17681 0 4 0C3.82319 0 3.65362 0.0769915 3.5286 0.214037C3.40357 0.351083 3.33333 0.536957 3.33333 0.730769V1.46154H1.33333C0.979711 1.46154 0.640573 1.61552 0.390524 1.88961C0.140476 2.1637 0 2.53545 0 2.92308V17.5385C0 17.9261 0.140476 18.2978 0.390524 18.5719C0.640573 18.846 0.979711 19 1.33333 19H14.6667C15.0203 19 15.3594 18.846 15.6095 18.5719C15.8595 18.2978 16 17.9261 16 17.5385V2.92308C16 2.53545 15.8595 2.1637 15.6095 1.88961C15.3594 1.61552 15.0203 1.46154 14.6667 1.46154ZM3.33333 2.92308V3.65385C3.33333 3.84766 3.40357 4.03353 3.5286 4.17058C3.65362 4.30762 3.82319 4.38462 4 4.38462C4.17681 4.38462 4.34638 4.30762 4.4714 4.17058C4.59643 4.03353 4.66667 3.84766 4.66667 3.65385V2.92308H11.3333V3.65385C11.3333 3.84766 11.4036 4.03353 11.5286 4.17058C11.6536 4.30762 11.8232 4.38462 12 4.38462C12.1768 4.38462 12.3464 4.30762 12.4714 4.17058C12.5964 4.03353 12.6667 3.84766 12.6667 3.65385V2.92308H14.6667V5.84615H1.33333V2.92308H3.33333ZM14.6667 17.5385H1.33333V7.30769H14.6667V17.5385Z" fill="#646464"/>
</svg>
                      </IconButton>
                    ),
                  }}
                  placeholder="Start Date"
                  fullWidth
                />

                <div style={{ display: "none" }}>
                  <MobileDatePicker
                    value={normalizedStartDate}
                    onChange={(newDate) => setStartDate(newDate)}
                    open={startDatePickerOpen}
                    onClose={handleClose}
                  />
                </div>
              </div>
            </LocalizationProvider>
          </Form.Group>

          {/* END DATE */}
          <Form.Group controlId="endDate" className="form-gr">
            <Form.Label>End Date</Form.Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div style={{ position: "relative" }}>
                <TextField
                  value={
                    normalizedEndDate
                      ? normalizedEndDate.format("DD/MM/YYYY")
                      : ""
                  }
                  onClick={() => setEndDatePickerOpen(true)}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <IconButton edge="start">
                        <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.6667 1.46154H12.6667V0.730769C12.6667 0.536957 12.5964 0.351083 12.4714 0.214037C12.3464 0.0769915 12.1768 0 12 0C11.8232 0 11.6536 0.0769915 11.5286 0.214037C11.4036 0.351083 11.3333 0.536957 11.3333 0.730769V1.46154H4.66667V0.730769C4.66667 0.536957 4.59643 0.351083 4.4714 0.214037C4.34638 0.0769915 4.17681 0 4 0C3.82319 0 3.65362 0.0769915 3.5286 0.214037C3.40357 0.351083 3.33333 0.536957 3.33333 0.730769V1.46154H1.33333C0.979711 1.46154 0.640573 1.61552 0.390524 1.88961C0.140476 2.1637 0 2.53545 0 2.92308V17.5385C0 17.9261 0.140476 18.2978 0.390524 18.5719C0.640573 18.846 0.979711 19 1.33333 19H14.6667C15.0203 19 15.3594 18.846 15.6095 18.5719C15.8595 18.2978 16 17.9261 16 17.5385V2.92308C16 2.53545 15.8595 2.1637 15.6095 1.88961C15.3594 1.61552 15.0203 1.46154 14.6667 1.46154ZM3.33333 2.92308V3.65385C3.33333 3.84766 3.40357 4.03353 3.5286 4.17058C3.65362 4.30762 3.82319 4.38462 4 4.38462C4.17681 4.38462 4.34638 4.30762 4.4714 4.17058C4.59643 4.03353 4.66667 3.84766 4.66667 3.65385V2.92308H11.3333V3.65385C11.3333 3.84766 11.4036 4.03353 11.5286 4.17058C11.6536 4.30762 11.8232 4.38462 12 4.38462C12.1768 4.38462 12.3464 4.30762 12.4714 4.17058C12.5964 4.03353 12.6667 3.84766 12.6667 3.65385V2.92308H14.6667V5.84615H1.33333V2.92308H3.33333ZM14.6667 17.5385H1.33333V7.30769H14.6667V17.5385Z" fill="#646464"/>
</svg>
                      </IconButton>
                    ),
                  }}
                  placeholder="End Date"
                  fullWidth
                />

                <div style={{ display: "none" }}>
                  <MobileDatePicker
                    value={normalizedEndDate}
                    onChange={(newDate) => setEndDate(newDate)}
                    open={endDatePickerOpen}
                    onClose={handleClose}
                    format="DD/MM/YYYY"
                    shouldDisableDate={disableEndDate}
                  />
                </div>
              </div>
            </LocalizationProvider>
          </Form.Group>

          {/* STATUS */}
          <Form.Group controlId="status" className="form-gr">
            <Form.Label>Status</Form.Label>
            <MDBDropdown>
              <MDBDropdownToggle
                color="light"
                style={{
                  backgroundColor: statusColors[status],
                  color: "#656363",
                }}
              >
                <FaRegClock
                  style={{ color: statusIconColors[status] }}
                />
                {" "} {status}
              </MDBDropdownToggle>

              <MDBDropdownMenu>
                <MDBDropdownItem link onClick={() => setStatus("In-Progress")}>
                  In-Progress
                </MDBDropdownItem>
                <MDBDropdownItem link onClick={() => setStatus("Pending")}>
                  Pending
                </MDBDropdownItem>
                <MDBDropdownItem link onClick={() => setStatus("Complete")}>
                  Complete
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </Form.Group>

          {/* PRIORITY */}
          <Form.Group controlId="priority" className="form-gr">
            <Form.Label>Priority</Form.Label>
            <MDBDropdown>
              <MDBDropdownToggle
                color="light"
                style={{
                  backgroundColor: priorityColors[priority],
                  color: "#656363",
                }}
              >
                <CiCircleInfo
                  style={{ color: priorityIconColors[priority] }}
                />
                {" "} {priority}
              </MDBDropdownToggle>

              <MDBDropdownMenu>
                <MDBDropdownItem link onClick={() => setPriority("High")}>
                  High
                </MDBDropdownItem>
                <MDBDropdownItem link onClick={() => setPriority("Medium")}>
                  Medium
                </MDBDropdownItem>
                <MDBDropdownItem link onClick={() => setPriority("Low")}>
                  Low
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </Form.Group>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default RightComponent;
