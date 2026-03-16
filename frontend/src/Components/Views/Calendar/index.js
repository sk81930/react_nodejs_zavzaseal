import React, { Fragment, useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useLocation,useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import AddTaskModal from './AddTaskModal';
import EditTaskSidebar from './EditTaskSidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Calendar.scss';
import { MDBCard, MDBCardBody, MDBBtn, MDBContainer } from 'mdb-react-ui-kit';
//import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import {
  ADD_TASK, 
  GET_TASKS,
  GET_CREW_MEMBER,
  CLEAR_FLASH_MESSAGE
} from '../../../constants/actionTypes';
import agent from '../../../agent';
import moment from 'moment';
import { Tooltip } from 'react-tooltip';

const mapStateToProps = (state) => ({
  ...state,
  currentUser: state.auth.currentUser,
  crewMembers: state.auth.crewMembers,
  addTaskSuccess: state.auth.addTaskSuccess,
  addTaskError: state.auth.addTaskError,
});

const mapDispatchToProps = (dispatch) => ({
  getCrewMembers: () =>
    dispatch({
      type: GET_CREW_MEMBER,
      payload: agent.Auth.getCrewMembers(),
    }),
  addTask: (data) =>
    dispatch({
      type: ADD_TASK,
      payload: agent.Auth.addTask(data),
    }),
  clearFlash: () =>
    dispatch({
      type: CLEAR_FLASH_MESSAGE,
    }),
});

const Calendar = (props) => {
  const navigate = useNavigate();
  const {
    getCrewMembers,
    crewMembers,
    addTask,
    addTaskError,
    addTaskSuccess,
    clearFlash,
    currentUser
  } = props;

  const location = useLocation();
  const calendarRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loadEvent, setLoadEvent] = useState(false);
  const [eventStartDate, setEventStartDate] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [calendarTitle, setCalendarTitle] = useState('');
  const [isWeekView, setIsWeekView] = useState(false);
  const [viewKey, setViewKey] = useState('');
  const labeledMonthsRef = useRef(new Set());
  const viewKeyRef = useRef('');

  /* ============================
     BODY BG FIX
  ============================ */

  useEffect(() => {
    if (location.pathname === '/calendars') {
      document.body.style.backgroundColor = '#fff';
    }
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [location]);

  /* ============================
     FETCH TASKS
  ============================ */

  const getTasks = async () => {
    try {
      const tasks = await agent.Auth.getTasks();

      if (tasks?.data) {
        const taskEvents = tasks.data.map((task) => {
          const leadName =
            task.lead_data?.full_name ||
            task.lead_data?.name ||
            task.title ||
            "Untitled";

          const leadId = task.lead_data?.lead_id
            ? `#${task.lead_data.lead_id}`
            : "";

          const address = task.lead_data?.address || "";

          return {
            id: task.id,
            title: `${leadName} ${leadId}`,
            start: task.start_date,
            end: moment(task.end_date)
              .add(1, 'day')
              .format('YYYY-MM-DD'),
            allDay: true,
            color: task.color || '#2EA7DF',
            borderRadius: '8px',
            extendedProps: {
              leadName,
              leadId,
              address,
            },
          };
        });

        setEvents(taskEvents);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  /* ============================
     HANDLERS
  ============================ */

  const handleDateClick = (arg) => {
    setEventStartDate(arg.dateStr);
    setModalOpen(true);
  };

  const handleAddEvent = (newEvent) => {
    addTask(newEvent);
    setModalOpen(false);
  };

  const handleEventClick = async (info) => {
    try {
      const taskId = Number(info.event.id); // ensure number
      // Fetch task details including crew
      const res = await agent.Auth.getTaskById(taskId);
  
      const crewMembersAssigned =
        res?.isSuccess &&
        res?.data?.crew_members &&
        res.data.crew_members.length > 0;
  
      if (!crewMembersAssigned) {
        // 🚀 Redirect to crew page with project pre-selected
        navigate("/crew", {
          state: { projectId: taskId }
        });
        return;
      }
  
      // Otherwise open edit sidebar
      setSelectedEvent(info.event);
      setEditModalOpen(true);
  
    } catch (error) {
      console.error("Failed to check crew assignment:", error);
    }
  };

  /* ============================
     TOOLTIP
  ============================ */

  const handleEventTooltip = (info) => {
    const { leadName, leadId, address } =
      info.event.extendedProps;

    return `
      <div style="text-align:left; line-height:1.4;">
        <strong>${leadName} ${leadId}</strong><br/>
        <small>${address || ""}</small><br/><br/>
        <small>
          ${moment(info.event.start).format('DD MMM YYYY')}
          -
          ${moment(info.event.end)
            .subtract(1, 'day')
            .format('DD MMM YYYY')}
        </small>
      </div>
    `;
  };

  const renderEventContent = (info) => {
    const { leadName, leadId, address } =
      info.event.extendedProps;

    return (
      <div
        className="main-event-title"
        data-tooltip-id="event-tooltip"
        data-tooltip-html={handleEventTooltip(info)}
        style={{
          backgroundColor: info.backgroundColor,
          color: '#fff',
          borderRadius: '8px',
          padding: '8px',
        }}
      >
        <div style={{ fontWeight: 600 }}>
          {leadName} {leadId}
        </div>
        {address && (
          <div style={{ fontSize: '11px', opacity: 0.9 }}>
            {address}
          </div>
        )}
      </div>
    );
  };

  /* ============================
     LOAD DATA
  ============================ */

  useEffect(() => {
    getTasks();
    getCrewMembers();
  }, [loadEvent]);

  useEffect(() => {
    if (loadEvent) {
      setEvents([]);
      setLoadEvent(false);
    }
  }, [loadEvent]);

  useEffect(() => {
    if (currentUser?.role) {
      setUserRoles(currentUser.role.split(','));
    }
  }, [currentUser]);

  /* ============================
     RENDER
  ============================ */

  return (
  <Fragment>
    <MDBContainer fluid className="calendar-container py-3 px-2 px-md-0">
      <MDBCard className="top-calendar-card">
        <MDBCardBody className="flex-column flex-md-row card-body d-flex align-items-start align-md-items-center justify-content-between py-2 px-3">
          <p className="mb-0 d-flex align-items-center gap-2">
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8125 1.4375H13.6562V0.71875C13.6562 0.528126 13.5805 0.345309 13.4457 0.210517C13.3109 0.0757252 13.1281 0 12.9375 0C12.7469 0 12.5641 0.0757252 12.4293 0.210517C12.2945 0.345309 12.2188 0.528126 12.2188 0.71875V1.4375H5.03125V0.71875C5.03125 0.528126 4.95552 0.345309 4.82073 0.210517C4.68594 0.0757252 4.50312 0 4.3125 0C4.12188 0 3.93906 0.0757252 3.80427 0.210517C3.66948 0.345309 3.59375 0.528126 3.59375 0.71875V1.4375H1.4375C1.05625 1.4375 0.690617 1.58895 0.421034 1.85853C0.15145 2.12812 0 2.49375 0 2.875V17.25C0 17.6312 0.15145 17.9969 0.421034 18.2665C0.690617 18.536 1.05625 18.6875 1.4375 18.6875H15.8125C16.1937 18.6875 16.5594 18.536 16.829 18.2665C17.0985 17.9969 17.25 17.6312 17.25 17.25V2.875C17.25 2.49375 17.0985 2.12812 16.829 1.85853C16.5594 1.58895 16.1937 1.4375 15.8125 1.4375ZM3.59375 2.875V3.59375C3.59375 3.78437 3.66948 3.96719 3.80427 4.10198C3.93906 4.23677 4.12188 4.3125 4.3125 4.3125C4.50312 4.3125 4.68594 4.23677 4.82073 4.10198C4.95552 3.96719 5.03125 3.78437 5.03125 3.59375V2.875H12.2188V3.59375C12.2188 3.78437 12.2945 3.96719 12.4293 4.10198C12.5641 4.23677 12.7469 4.3125 12.9375 4.3125C13.1281 4.3125 13.3109 4.23677 13.4457 4.10198C13.5805 3.96719 13.6562 3.78437 13.6562 3.59375V2.875H15.8125V5.75H1.4375V2.875H3.59375ZM15.8125 17.25H1.4375V7.1875H15.8125V17.25ZM9.70312 10.4219C9.70312 10.6351 9.63989 10.8436 9.52143 11.0208C9.40296 11.1981 9.23458 11.3363 9.03758 11.4179C8.84058 11.4995 8.6238 11.5209 8.41467 11.4793C8.20553 11.4377 8.01343 11.335 7.86265 11.1842C7.71187 11.0334 7.60919 10.8413 7.56759 10.6322C7.52599 10.4231 7.54734 10.2063 7.62894 10.0093C7.71054 9.81229 7.84873 9.64391 8.02603 9.52545C8.20332 9.40698 8.41177 9.34375 8.625 9.34375C8.91094 9.34375 9.18516 9.45734 9.38735 9.65952C9.58954 9.86171 9.70312 10.1359 9.70312 10.4219ZM13.6562 10.4219C13.6562 10.6351 13.593 10.8436 13.4746 11.0208C13.3561 11.1981 13.1877 11.3363 12.9907 11.4179C12.7937 11.4995 12.5769 11.5209 12.3678 11.4793C12.1587 11.4377 11.9666 11.335 11.8158 11.1842C11.665 11.0334 11.5623 10.8413 11.5207 10.6322C11.4791 10.4231 11.5005 10.2063 11.5821 10.0093C11.6637 9.81229 11.8019 9.64391 11.9792 9.52545C12.1564 9.40698 12.3649 9.34375 12.5781 9.34375C12.8641 9.34375 13.1383 9.45734 13.3405 9.65952C13.5427 9.86171 13.6562 10.1359 13.6562 10.4219ZM5.75 14.0156C5.75 14.2289 5.68677 14.4373 5.5683 14.6146C5.44984 14.7919 5.28146 14.9301 5.08446 15.0117C4.88745 15.0933 4.67068 15.1146 4.46154 15.073C4.25241 15.0314 4.0603 14.9288 3.90953 14.778C3.75875 14.6272 3.65607 14.4351 3.61447 14.226C3.57287 14.0168 3.59422 13.8 3.67582 13.603C3.75742 13.406 3.8956 13.2377 4.0729 13.1192C4.2502 13.0007 4.45864 12.9375 4.67188 12.9375C4.95781 12.9375 5.23204 13.0511 5.43422 13.2533C5.63641 13.4555 5.75 13.7297 5.75 14.0156ZM9.70312 14.0156C9.70312 14.2289 9.63989 14.4373 9.52143 14.6146C9.40296 14.7919 9.23458 14.9301 9.03758 15.0117C8.84058 15.0933 8.6238 15.1146 8.41467 15.073C8.20553 15.0314 8.01343 14.9288 7.86265 14.778C7.71187 14.6272 7.60919 14.4351 7.56759 14.226C7.52599 14.0168 7.54734 13.8 7.62894 13.603C7.71054 13.406 7.84873 13.2377 8.02603 13.1192C8.20332 13.0007 8.41177 12.9375 8.625 12.9375C8.91094 12.9375 9.18516 13.0511 9.38735 13.2533C9.58954 13.4555 9.70312 13.7297 9.70312 14.0156ZM13.6562 14.0156C13.6562 14.2289 13.593 14.4373 13.4746 14.6146C13.3561 14.7919 13.1877 14.9301 12.9907 15.0117C12.7937 15.0933 12.5769 15.1146 12.3678 15.073C12.1587 15.0314 11.9666 14.9288 11.8158 14.778C11.665 14.6272 11.5623 14.4351 11.5207 14.226C11.4791 14.0168 11.5005 13.8 11.5821 13.603C11.6637 13.406 11.8019 13.2377 11.9792 13.1192C12.1564 13.0007 12.3649 12.9375 12.5781 12.9375C12.8641 12.9375 13.1383 13.0511 13.3405 13.2533C13.5427 13.4555 13.6562 13.7297 13.6562 14.0156Z" fill="#04161F"/></svg>
            <span>Calendar</span>
          </p>          
        </MDBCardBody>
      </MDBCard>

      <section className="pb-4">
        <MDBCard className="calendar-card">
          <MDBCardBody>
            <div className="calendar-toolbar">
              <div className="calendar-toolbar-left">
                <div className="calendar-bttons">
                  <MDBBtn size="sm" color="light" className="calendar-nav-btn" onClick={() => calendarRef.current?.getApi()?.prev()}>
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.94971 0.353546L0.707066 4.59619L4.94971 8.83883" stroke="#646464" stroke-opacity="0.866667"/></svg>
                  </MDBBtn>
                  <span className="sep">|</span>
                  <MDBBtn size="sm" color="light" className="calendar-nav-btn" onClick={() => calendarRef.current?.getApi()?.next()}>
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.353516 8.83884L4.59616 4.5962L0.353515 0.353555" stroke="#646464" stroke-opacity="0.866667"/></svg>
                  </MDBBtn>
                </div>
                <MDBBtn size="sm" color="light" className="calendar-today-btn" onClick={() => calendarRef.current?.getApi()?.today()}>
                  Today
                </MDBBtn>
                <MDBBtn
                  size="sm"
                  color="light"
                  className={`calendar-week-btn ${isWeekView ? 'active' : ''}`}
                  onClick={() => {
                    const api = calendarRef.current?.getApi();
                    if (!api) return;
                    if (api.view.type === 'dayGridWeek') {
                      api.changeView('dayGridMonth');
                      setIsWeekView(false);
                    } else {
                      api.today();
                      api.changeView('dayGridWeek');
                      setIsWeekView(true);
                    }
                  }}
                >
                  This Week
                </MDBBtn>
              </div>
              <div className="calendar-toolbar-title">{calendarTitle}</div>
              <div className="calendar-toolbar-right">
                {(userRoles.includes("super_admin") || userRoles.includes("admin")) && (
                  <MDBBtn size="sm" color="primary" className="calendar-add-btn" onClick={() => setModalOpen(true)}>
                    <FaPlus />
                    <span>Add Task</span>
                  </MDBBtn>
                )}
              </div>
            </div>

            <div className="calendar-div position-relative">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable
                editable
                navLinks
                dayCellContent={(arg) => {
                  if (viewKeyRef.current !== viewKey) {
                    labeledMonthsRef.current = new Set();
                    viewKeyRef.current = viewKey;
                  }

                  const monthKey = `${arg.date.getFullYear()}-${arg.date.getMonth()}`;
                  const showMonth = !labeledMonthsRef.current.has(monthKey);
                  if (showMonth) {
                    labeledMonthsRef.current.add(monthKey);
                  }
                  const monthLabel = arg.date.toLocaleString('en-US', { month: 'short' });
                  return (
                    <div className="fc-day-number-custom">
                      {showMonth && <span className="fc-day-month">{monthLabel}</span>}
                      <span className="fc-day-number">{arg.dayNumberText}</span>
                    </div>
                  );
                }}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                events={events}
                eventContent={renderEventContent}
                headerToolbar={false}
                datesSet={(arg) => {
                  setCalendarTitle(arg.view.title.toUpperCase());
                  setIsWeekView(arg.view.type === 'dayGridWeek');
                  setViewKey(`${arg.startStr}_${arg.endStr}`);
                }}
              />

              <Tooltip id="event-tooltip" />
            </div>

            <AddTaskModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onAddEvent={handleAddEvent}
              crewMembers={crewMembers}
              addTaskError={addTaskError}
              addTaskSuccess={addTaskSuccess}
              setLoadEvent={setLoadEvent}
              clearFlash={clearFlash}
              currentUser={currentUser}
              eventStartDate={eventStartDate}
            />

            <EditTaskSidebar
              setIsOpen={setEditModalOpen}
              isOpen={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              event={selectedEvent}
              crewMembers={crewMembers}
              addTaskError={addTaskError}
              addTaskSuccess={addTaskSuccess}
              clearFlash={clearFlash}
              setLoadEvent={setLoadEvent}
              currentUser={currentUser}
            />
          </MDBCardBody>
        </MDBCard>
      </section>
    </MDBContainer>
  </Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Calendar);
