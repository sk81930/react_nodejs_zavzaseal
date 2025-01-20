import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import AddTaskModal from './AddTaskModal'; // Import the modal component
import EditTaskSidebar from './EditTaskSidebar'; // Import the Edit Task Modal
import 'bootstrap/dist/css/bootstrap.min.css';
import './Calendar.scss'; // Custom SCSS for styling
import { ADD_TASK, GET_TASKS, GET_CREW_MEMBER, CLEAR_FLASH_MESSAGE } from '../../../constants/actionTypes';
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
  getCrewMembers: () => {
    dispatch({ type: GET_CREW_MEMBER, payload: agent.Auth.getCrewMembers() });
  },
  addTask: (data) => {
    dispatch({ type: ADD_TASK, payload: agent.Auth.addTask(data) });
  },
  clearFlash: () => {
    dispatch({ type: CLEAR_FLASH_MESSAGE });
  },
});

const Calendar = (props) => {
  const { getCrewMembers, crewMembers, addTask, addTaskError, addTaskSuccess, clearFlash, currentUser } = props;

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/calendars') {
      document.body.style.backgroundColor = '#fff'; 
    }
    return () => {
     document.body.style.backgroundColor = '';
    };
  }, [location]);

  const [events, setEvents] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);  // New state for edit modal
  const [selectedEvent, setSelectedEvent] = useState(null);  // Store the event being edited
  const [loadEvent, setLoadEvent] = useState(false);  // Store the event being edited

  const getTasks = async () => {
    try {
      const tasks = await agent.Auth.getTasks();
      if (tasks && tasks.data) {
        const taskEvents = tasks.data.map((task) => {
          return {
            id: task.id,
            title: task.title,
            start: moment.utc(task.start_datetime).local().format('YYYY-MM-DD HH:mm:ss'),
            end: moment.utc(task.end_datetime).local().format('YYYY-MM-DD HH:mm:ss'),
            color: task.color || '#5bc0de', // Default color
            description: task.description || 'No description available',
          };
        });
        setEvents(taskEvents); // Set the events in the state
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAddEvent = (newEvent) => {
    addTask(newEvent);
    setModalOpen(false); // Close the modal after saving the task
  };

  const handleEventTooltip = (info) => {
    const { event } = info;
    return `<div style={{ textAlign: 'center', lineHeight: '32px' }}>
        <strong>${event.title}</strong><br />
        <p style={{ fontSize: '10px' }}>
          ${moment(event.start).format('YYYY-MM-DD HH:mm')} - ${moment(event.end).format('YYYY-MM-DD HH:mm')}
        </p>
      </div>`;

  };


  const handleEventClick = (info) => {
    const { event } = info;
    setSelectedEvent(event); // Set the event to be edited
    setEditModalOpen(true); // Open the edit modal
  };


  const handleEditEvent = (updatedEvent) => {
    const updatedEvents = events.map((event) =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents); // Update the event in the state

    // Update event in the backend (you can make an API call here)
    addTask(updatedEvent); // Assuming the action updates the event

    setEditModalOpen(false); // Close the edit modal after saving
    setSelectedEvent(null); // Clear the selected event
  };

  const renderEventContent = (info) => {


     return(
      <div className="main-event-title" data-tooltip-id="event-tooltip" data-tooltip-html={handleEventTooltip(info)} style={{backgroundColor: info.backgroundColor,color: '#fff'}}>
        <span className="ev-title mx-2">{info.event.title}</span>
      </div>
  )
  };

  useEffect(() => {
    getTasks();
    getCrewMembers();
  }, [loadEvent]);
  useEffect(() => {
    if(loadEvent){
      setEvents([]);
      setLoadEvent(false);
    }
  }, [loadEvent]);

  return (
    <div className="calendar-container">
      <h2 className="mb-4 text-body font-semibold">Calendar</h2>
      <p className="mb-4 text-body">Several predefined events provide a visual representation of how the plugin appears.</p>
      <section className="pb-4">
          <div className="border rounded-3 position-relative p-4">
            <div className="calendar-div position-relative">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'addTaskButton',
                }}
                customButtons={{
                  addTaskButton: {
                    text: 'ADD A TASK',
                    click: () => setModalOpen(true),
                  },
                }}
                eventContent={renderEventContent}
                events={events}
                eventColor={(info) => info.event.extendedProps.color}
                eventClick={handleEventClick} // Add the event click handler
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
              />

              {/* Edit Task Modal */}
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
        </div>
      </section>      
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Calendar);
