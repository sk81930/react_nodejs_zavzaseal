import React, { useEffect, useState, Fragment } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import moment from "moment";
import agent from "../../../agent";
import { GET_CREW_MEMBER } from "../../../constants/actionTypes";
import Creatable from "react-select/creatable";
import { withAsyncPaginate } from "react-select-async-paginate";
import { components } from "react-select";

//SS//
import { Form, Modal, Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";


import ProjectDayCard from "./components/ProjectDayCard";

import "./crew.scss";



const mapStateToProps = (state) => ({
  crewMembers: state.auth.crewMembers,
});

const mapDispatchToProps = (dispatch) => ({
  getCrewMembers: () =>
    dispatch({
      type: GET_CREW_MEMBER,
      payload: agent.Auth.getCrewMembers(),
    }),
});

const Crew = ({ crewMembers, getCrewMembers }) => {
  const location = useLocation();
  console.log("Crew location.state:", location.state);

  const CreatableAsyncPaginate = withAsyncPaginate(Creatable);

  // Toggle to show/hide the "Projects with Assigned Crew" table
  // Set to true to show the table, false to hide it
  const SHOW_TASKS_TABLE = false;
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedProjectOption, setSelectedProjectOption] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDays, setProjectDays] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [projectAssignments, setProjectAssignments] = useState({});
  const [bulkCrew, setBulkCrew] = useState([]);
  const [bulkCrewSearch, setBulkCrewSearch] = useState("");
  const [bulkCrewSelectAll, setBulkCrewSelectAll] = useState(false);
  const [bulkDays, setBulkDays] = useState([]);
  const [tasksWithCrew, setTasksWithCrew] = useState([]); // All tasks with crew assignments from DB
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTasks, setExpandedTasks] = useState(new Set()); // Track which tasks have expanded days
  
  // ****** SS //
  const [showPopup, setShowPopup] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [showEditorPopup, setShowEditorPopup] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noteId, setNoteId] = useState(null);
  
  const handleSave = async () => {
	  if (!templateContent.trim()) {
		setError('Template content is required');
		return;
	   }
	   setLoading(true);
       setError(null);
	   
	   try {
		  const createtemplateData = {
			description: templateContent,
			task_id: selectedProject,
			type: 'notes',
		  };
		  let response;
		  
		  if (noteId) {
			  
			const updatetemplateData = {
				description: templateContent,
			};
			response = await agent.Auth.updateNote(selectedProject,updatetemplateData);
			
		  }else {
			response = await agent.Auth.createNote(createtemplateData);
			if(response.data.noteId){
				setNoteId(response.data.noteId);
			}
			
		  }
		  setShowEditorPopup(false);
		  console.log('Note creation response:', response);
		} catch (err) {
		   
	    }
		setLoading(false);
  };
  
  // Quill editor configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video'
  ];
  
  
  useEffect(() => {
	  if (!selectedProject) return;

	  const loadNote = async () => {
		try {
		  const res = await agent.Auth.getNotesByType(selectedProject);
		  if (res?.data) {
			  console.log(res.data);
			setTemplateContent(res.data.description || "");
            setNoteId(res.data.id || null);
		  } else {
			setTemplateContent("");
			setNoteId(null);
		  }
		} catch (err) {
		  console.error("Failed to load note", err);
		}
	  };

	  loadNote();
	}, [selectedProject]);
  
  // ****** SS  //
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    totalPages: 0,
    limit: 10,
  });
  const [flash, setFlash] = useState(null); // { type: "success" | "danger", message: string }

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(id);
  }, [flash]);

  // Keep bulk crew selection in sync with "Select all" toggle
  useEffect(() => {
    if (!crewMembers || crewMembers.length === 0) {
      setBulkCrew([]);
      setBulkCrewSelectAll(false);
      return;
    }

    if (!bulkCrewSelectAll) return;

    setBulkCrew(crewMembers.map((c) => c.id));
  }, [bulkCrewSelectAll, crewMembers]);

  // Custom Option component for project selector
  const CustomProjectOption = (props) => {
    const { data } = props;
    const clientName = data.clientName || data.label || "Untitled Project";
    const address = data.address || "No address";
    const leadId = data.leadId || "";
    
    // Format: "Name #ID" on first line, address on second line
    const displayName = leadId ? `${clientName} #${leadId}` : clientName;

    return (
      <components.Option {...props}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          padding: "12px 16px",
          cursor: "pointer"
        }}>
          <span style={{ 
            marginRight: "12px", 
            color: "#6c757d", 
            fontSize: "16px" 
          }}>📁</span>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: "600", 
              color: "#495057", 
              marginBottom: "4px" 
            }}>
              {displayName}
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#6c757d" 
            }}>
              {address}
            </div>
          </div>
        </div>
      </components.Option>
    );
  };

  // Custom ValueContainer to show selected project
  const CustomProjectContainer = ({ children, ...props }) => {
    return (
      <Fragment>
        <components.ValueContainer {...props}>
          {children}
        </components.ValueContainer>
      </Fragment>
    );
  };

  // Handle loading options for async paginate
  const handleLoadOptions = async (inputValue, loadedOptions, { page }) => {
    const limit = 20;
    try {
      const tasksResponse = await agent.Auth.getTasksData(
        inputValue || "", // search
        page || 1, // page
        limit // limit
      );

      if (
        tasksResponse &&
        tasksResponse.isSuccess &&
        tasksResponse.data &&
        tasksResponse.data.tasksData &&
        tasksResponse.data.tasksData.data &&
        Array.isArray(tasksResponse.data.tasksData.data)
      ) {
        const { data: tasks, pagination } = tasksResponse.data.tasksData;

        // Map tasks to options format
        const enrichedTasks = tasks.map((task) => {
          const clientName = task.lead_data?.full_name || task.title || "Untitled Task";
          const address = task.lead_data?.address || "No address";
          const leadId = task.lead_data?.lead_id || "";

          return {
            value: task.id,
            label: clientName,
            clientName: clientName,
            address: address,
            leadId: leadId,
            start_date: task.start_date,
            end_date: task.end_date,
            taskData: task
          };
        });

        const totalLoaded = loadedOptions.length + enrichedTasks.length;
        const hasMore = pagination && pagination.total > totalLoaded;

        return {
          options: enrichedTasks,
          hasMore: hasMore,
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
      console.error("Error fetching tasks:", error);

      return {
        options: [],
        hasMore: false,
        additional: {
          page: page || 1,
        },
      };
    }
  };
  

  // Note: Project data clearing is now handled in the loadProjectDetails useEffect


  useEffect(() => {
    getCrewMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.state?.projectId && !selectedProject && !selectedProjectOption) {
      // Fetch project details and set both selectedProject and selectedProjectOption
      const loadProjectForPreselect = async () => {
        try {
          const projectId = location.state.projectId;
          const res = await agent.Auth.getTaskById(projectId);
          
          if (res?.isSuccess && res.data) {
            const project = res.data;
            const clientName = project.lead_data?.full_name || project.title || "Untitled Task";
            const address = project.lead_data?.address || "No address";
            const leadId = project.lead_data?.lead_id || "";

            // Create option object for CreatableAsyncPaginate
            const option = {
              value: project.id,
              label: clientName,
              clientName: clientName,
              address: address,
              leadId: leadId,
              start_date: project.start_date,
              end_date: project.end_date,
              taskData: project
            };

            setSelectedProjectOption(option);
            setSelectedProject(project.id);
          }
        } catch (error) {
          console.error("Failed to load project for preselect:", error);
        }
      };

      loadProjectForPreselect();
    }
  }, [location.state, selectedProject, selectedProjectOption]);



  useEffect(() => {
    if (!selectedProject) {
      // Clear data when no project is selected
      setProjectDays([]);
      setAssignments({});
      return;
    }
  
    // Clear old data immediately when switching projects to prevent flickering
    setProjectDays([]);
    setAssignments({});
    setBulkCrew([]);
    setBulkDays([]);
    setBulkCrewSelectAll(false);
  
    // Fetch project details when selected
    const loadProjectDetails = async () => {
      const currentProjectId = selectedProject; // Capture the project ID
      
      try {
        setLoadingAssignments(true);
        const res = await agent.Auth.getTaskById(currentProjectId);
        
        // Check if we're still loading the same project (prevent race conditions)
        if (currentProjectId !== selectedProject) {
          return; // User switched projects, ignore this response
        }
        
        if (res?.isSuccess && res.data) {
          const project = res.data;
  
          let start, end;
  
          if (project.start_date) {
            start = moment(project.start_date, "YYYY-MM-DD HH:mm:ss").startOf("day");
            if (!start.isValid()) {
              start = moment(project.start_date).startOf("day");
            }
          } else {
            start = moment().startOf("day");
          }
  
          if (project.end_date) {
            end = moment(project.end_date, "YYYY-MM-DD HH:mm:ss").endOf("day");
            if (!end.isValid()) {
              end = moment(project.end_date).endOf("day");
            }
          } else {
            end = start.clone().endOf("day");
          }
  
          if (!start.isValid() || !end.isValid()) {
            setProjectDays([]);
            setAssignments({});
            return;
          }
  
          const days = [];
          const current = start.clone();
          const endDay = end.clone().startOf("day");
  
          while (current.isSameOrBefore(endDay, "day")) {
            days.push(current.format("YYYY-MM-DD"));
            current.add(1, "day");
          }
  
          setProjectDays(days);
  
          const byDate = {};
  
          if (
            res?.isSuccess &&
            res.data &&
            Array.isArray(res.data.crew_members)
          ) {
            res.data.crew_members.forEach((cm) => {
              const dateKey = cm.work_date
                ? moment(cm.work_date).format("YYYY-MM-DD")
                : days[0];
  
              if (!byDate[dateKey]) byDate[dateKey] = [];
              if (!byDate[dateKey].includes(cm.user_id)) {
                byDate[dateKey].push(cm.user_id);
              }
            });
          }
  
          const initial = {};
          days.forEach((d) => {
            initial[d] = byDate[d] || [];
          });
  
          // Double-check we're still on the same project before setting state
          if (currentProjectId === selectedProject) {
            setAssignments(initial);
            setProjectAssignments((prev) => ({
              ...prev,
              [currentProjectId]: initial,
            }));

            // Also update selectedProjectOption if it's not set or doesn't match
            if (!selectedProjectOption || selectedProjectOption.value !== currentProjectId) {
              const clientName = project.lead_data?.full_name || project.title || "Untitled Task";
              const address = project.lead_data?.address || "No address";
              const leadId = project.lead_data?.lead_id || "";

              const option = {
                value: project.id,
                label: clientName,
                clientName: clientName,
                address: address,
                leadId: leadId,
                start_date: project.start_date,
                end_date: project.end_date,
                taskData: project
              };

              setSelectedProjectOption(option);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load project details:", error);
        // Only clear if we're still on the same project
        if (currentProjectId === selectedProject) {
          setProjectDays([]);
          setAssignments({});
        }
      } finally {
        // Only update loading state if we're still on the same project
        if (currentProjectId === selectedProject) {
          setLoadingAssignments(false);
        }
      }
    };

    loadProjectDetails();
  }, [selectedProject]);
  

  // Handle project selection change
  useEffect(() => {
    if (selectedProjectOption) {
      setSelectedProject(selectedProjectOption.value);
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectOption]);

  const handleBulkApply = (crewIds, days) => {
    if (!selectedProject || !crewIds || !crewIds.length || !days || !days.length) {
      return;
    }

    // Build next assignments for this project
    const currentForProject = projectAssignments[selectedProject] || {};
    const nextForProject = { ...currentForProject };

    projectDays.forEach((day) => {
      const existing = new Set(currentForProject[day] || []);
      if (days.includes(day)) {
        crewIds.forEach((id) => existing.add(id));
      }
      nextForProject[day] = Array.from(existing);
    });

    setAssignments(nextForProject);
    setProjectAssignments((prev) => ({
      ...prev,
      [selectedProject]: nextForProject,
    }));

    // Persist to backend (task_crew_members with work_date)
    const payload = {
      assignments: Object.entries(nextForProject).map(([work_date, user_ids]) => ({
        work_date,
        user_ids,
      })),
    };

    agent.Auth
      .saveCrewAssignments(selectedProject, payload)
      .then(() => {
        setFlash({
          type: "success",
          message: "Crew assignments have been saved.",
        });
      })
      .catch((err) => {
        console.error("Failed to save crew assignments:", err);
        setFlash({
          type: "danger",
          message: "Failed to save crew assignments. Please try again.",
        });
      });
  };

  const removeCrew = (dateKey, crewId) => {
    if (!selectedProject) return;

    const updated = { ...assignments };
    updated[dateKey] = (updated[dateKey] || []).filter((id) => id !== crewId);
    setAssignments(updated);

    const updatedForProject = {
      ...(projectAssignments[selectedProject] || {}),
      [dateKey]: (projectAssignments[selectedProject]?.[dateKey] || []).filter(
        (id) => id !== crewId
      ),
    };

    setProjectAssignments((prev) => ({
      ...prev,
      [selectedProject]: updatedForProject,
    }));

    // Persist removal to backend
    const payload = {
      assignments: Object.entries(updatedForProject).map(
        ([work_date, user_ids]) => ({
          work_date,
          user_ids,
        })
      ),
    };

    agent.Auth.saveCrewAssignments(selectedProject, payload)
      .then(() => {
        setFlash({
          type: "success",
          message: "Crew member removed from this day.",
        });
      })
      .catch((err) => {
        console.error("Failed to remove crew assignment:", err);
        setFlash({
          type: "danger",
          message: "Failed to remove crew member. Please try again.",
        });
      });
  };

  return (
    <div className="crew-container crew container mt-4">
      <h3 className="mb-4">Crew Assignment</h3>

      {flash && (
        <div
          className={`alert alert-${flash.type} alert-dismissible fade show`}
          role="alert"
        >
          {flash.message}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setFlash(null)}
          />
        </div>
      )}

      {/* All tasks with crew assignments from database */}
      {/* To show this table, set SHOW_TASKS_TABLE = true at the top of the component */}
      {SHOW_TASKS_TABLE && (
      <div className="mb-4">
        <h5>Projects with Assigned Crew</h5>
        <div className="table-responsive">
          <table className="table table-sm align-middle table-hover">
            <thead>
              <tr>
                <th>Project</th>
                <th>Address</th>
                <th>Days with Crew</th>
                <th>Crew Members by Day</th>
              </tr>
            </thead>
            <tbody>
              {tasksWithCrew.length > 0 ? (
                tasksWithCrew.map((task) => {
                    const isExpanded = expandedTasks.has(task.taskId);
                    const daysToShow = isExpanded
                      ? task.daysWithCrew
                      : task.daysWithCrew.slice(0, 1);
                    const hasMoreDays = task.daysWithCrew.length > 1;

                    return (
                      <tr
                        key={task.taskId}
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          // Don't select project if clicking on "Show more" button
                          if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
                            return;
                          }
                          setSelectedProject(task.taskId);
                        }}
                      >
                        <td>
                          <strong>{task.name}</strong>
                          {task.leadId && (
                            <span className="text-muted"> (Lead #{task.leadId})</span>
                          )}
                        </td>
                        <td>{task.address || "No address"}</td>
                        <td>
                          <span className="badge bg-primary">
                            {task.daysWithCrew.length} day{task.daysWithCrew.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td>
                          <div style={{ maxWidth: "400px" }}>
                            {daysToShow.map((day) => {
                              const dayAssignments = task.assignments[day] || [];
                              return (
                                <div
                                  key={day}
                                  className="mb-2 p-2 border rounded"
                                  style={{ fontSize: "0.875rem" }}
                                >
                                  <strong className="text-primary">
                                    {moment(day).format("MMM D, YYYY (ddd)")}:
                                  </strong>
                                  <div className="mt-1">
                                    {dayAssignments.length > 0 ? (
                                      dayAssignments.map((cm, idx) => (
                                        <span key={cm.user_id} className="me-2">
                                          <span className="badge bg-secondary">{cm.name}</span>
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-muted">No crew</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {hasMoreDays && (
                              <button
                                type="button"
                                className="btn btn-sm btn-link p-0 mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedTasks((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(task.taskId)) {
                                      next.delete(task.taskId);
                                    } else {
                                      next.add(task.taskId);
                                    }
                                    return next;
                                  });
                                }}
                              >
                                {isExpanded ? "Show less" : `Show more (${task.daysWithCrew.length - 1} more day${task.daysWithCrew.length - 1 !== 1 ? "s" : ""})`}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={4} className="text-muted text-center py-4">
                    No projects have crew assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginationMeta.totalPages > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <span className="text-muted">
                Showing {(currentPage - 1) * paginationMeta.limit + 1} to{" "}
                {Math.min(currentPage * paginationMeta.limit, paginationMeta.total)} of{" "}
                {paginationMeta.total} projects
              </span>
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from(
                  { length: paginationMeta.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage >= paginationMeta.totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(paginationMeta.totalPages, prev + 1)
                      )
                    }
                    disabled={currentPage >= paginationMeta.totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
      )}
      {(loadingProjects || loadingTasks) && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading crew data...</p>
        </div>
      )}
      <Form.Group controlId="projectSelector" className="mb-4">
        <Form.Label className="fw-bold">
          Choose Project (Task)
        </Form.Label>
        <CreatableAsyncPaginate
          value={selectedProjectOption}
          onChange={setSelectedProjectOption}
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

      {/* Inline bulk assign panel */}
      {selectedProject && (
        <div className="card shadow-sm mt-4 mb-4">
          <div className="card-header">
            <strong>Bulk Assign Crew</strong>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Crew selection */}
              <div className="col-md-6 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Crew Members</h6>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="bulkSelectAllCrew"
                      checked={bulkCrewSelectAll}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setBulkCrewSelectAll(checked);
                        if (!checked) {
                          // Explicitly clear all selections when user unchecks
                          setBulkCrew([]);
                        } else if (crewMembers && crewMembers.length > 0) {
                          setBulkCrew(crewMembers.map((c) => c.id));
                        }
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="bulkSelectAllCrew"
                    >
                      Select all
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Search crew..."
                  value={bulkCrewSearch}
                  onChange={(e) => setBulkCrewSearch(e.target.value)}
                />
                <div
                  style={{
                    maxHeight: 220,
                    overflowY: "auto",
                    border: "1px solid #eee",
                    borderRadius: 6,
                    padding: 8,
                  }}
                >
                  {(crewMembers || [])
                    .filter((member) => {
                      const name =
                        member.name ||
                        `${member.first_name || ""} ${
                          member.last_name || ""
                        }`.trim();
                      return name
                        .toLowerCase()
                        .includes(bulkCrewSearch.toLowerCase());
                    })
                    .map((member) => {
                      const name =
                        member.name ||
                        `${member.first_name || ""} ${
                          member.last_name || ""
                        }`.trim();
                      return (
                        <div key={member.id} className="form-check mb-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`bulk-crew-${member.id}`}
                            checked={bulkCrew.includes(member.id)}
                            onChange={() =>
                              setBulkCrew((prev) => {
                                const isSelected = prev.includes(member.id);
                                const next = isSelected
                                  ? prev.filter((x) => x !== member.id)
                                  : [...prev, member.id];

                                // If user unchecks while "Select all" is active, turn it off
                                if (bulkCrewSelectAll && isSelected) {
                                  setBulkCrewSelectAll(false);
                                }

                                return next;
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`bulk-crew-${member.id}`}
                          >
                            {name || "Unnamed"}
                          </label>
                        </div>
                      );
                    })}
                  {(!crewMembers || crewMembers.length === 0) && (
                    <p className="text-muted mb-0">No crew members found.</p>
                  )}
                </div>
              </div>

              {/* Day selection */}
              <div className="col-md-6 mb-3">
                <h6 className="mb-2">Select Days</h6>
                {projectDays.length === 0 && (
                  <p className="text-muted mb-0">
                    No days available for this project.
                  </p>
                )}
                {projectDays.length > 0 && (
                  <>
                    <div className="d-flex flex-wrap">
                      {projectDays.map((day) => {
                        const active = bulkDays.includes(day);
                        return (
                          <button
                            type="button"
                            key={day}
                            className={`btn btn-sm me-2 mb-2 ${
                              active ? "btn-primary" : "btn-outline-secondary"
                            }`}
                            onClick={() =>
                              setBulkDays((prev) =>
                                prev.includes(day)
                                  ? prev.filter((d) => d !== day)
                                  : [...prev, day]
                              )
                            }
                          >
                            {moment(day).format("MMM D")}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-link p-0 me-3"
                        onClick={() => setBulkDays(projectDays)}
                      >
                        Select all days
                      </button>
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={() => setBulkDays([])}
                      >
                        Clear days
                      </button>
                    </div>
                  </>
                )}
				
				<div className="mt-2">
					<Button variant="primary" onClick={() => setShowEditorPopup(true)}>
				  {noteId ? "Edit Note" : "Add Note"}
					</Button>
				</div>
			  
			  
              </div>
			  
			  
            </div>
			
			

			<Modal show={showEditorPopup} onHide={() => setShowEditorPopup(false)} size="lg" dialogClassName="note-editor-modal">
				  <Modal.Header closeButton>
					<Modal.Title>{noteId ? "Edit Note" : "Add Note"}</Modal.Title>
				  </Modal.Header>
				  
				  {error && <div className="error-message">{error}</div>}
				  
				  
				  <Modal.Body style={{ height: "500px" }}>
					<ReactQuill
					  theme="snow"
					  value={templateContent}
					  onChange={setTemplateContent}
					  modules={modules}
					  formats={formats}
					  style={{ height: "400px" }}
					/>
					
					
				  </Modal.Body>

				  <Modal.Footer>
					<Button variant="secondary" onClick={() => setShowEditorPopup(false)}>
					  Cancel
					</Button>

					<Button variant="primary" onClick={handleSave}>
					  {noteId ? "Update" : "Save"}
					</Button>
				  </Modal.Footer>
			</Modal>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => {
                  if (!selectedProject) return;

                  const cleared = {};
                  projectDays.forEach((day) => {
                    cleared[day] = [];
                  });

                  setAssignments(cleared);
                  setProjectAssignments((prev) => ({
                    ...prev,
                    [selectedProject]: cleared,
                  }));

                  // Persist clear operation to backend
                  const payload = {
                    assignments: projectDays.map((d) => ({
                      work_date: d,
                      user_ids: [],
                    })),
                  };

                  agent.Auth
                    .saveCrewAssignments(selectedProject, payload)
                    .then(() => {
                      setFlash({
                        type: "success",
                        message: "Crew cleared from all project days.",
                      });
                    })
                    .catch((err) => {
                      console.error("Failed to clear crew assignments:", err);
                      setFlash({
                        type: "danger",
                        message:
                          "Failed to clear crew assignments. Please try again.",
                      });
                    });

                  setBulkCrew([]);
                  setBulkDays([]);
                  setBulkCrewSelectAll(false);
                }}
                disabled={!selectedProject}
              >
                Clear crew from all days
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleBulkApply(bulkCrew, bulkDays)}
                disabled={
                  !selectedProject || bulkCrew.length === 0 || bulkDays.length === 0
                }
              >
                Assign selected crew to selected days
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row mt-4">
        {projectDays.map((day) => (
          <ProjectDayCard
            key={day}
            date={day}
            crewMembers={crewMembers}
            assignedCrew={assignments[day] || []}
            onBulkAssign={(d) => setBulkDays([d])}
            onRemoveCrew={removeCrew}
          />
        ))}
      </div>
	  
	 {selectedProject && (
	  <div className="card shadow-sm mt-4 mb-4">
        
			<div className="card-header">
				  <strong>Notes</strong>
				</div>
				
				<div className="card-body">
				  {!noteId && (
					<p className="text-muted">No note added</p>
				  )}
				  
				 <div
				  className="text-muted"
				  dangerouslySetInnerHTML={{ __html: templateContent }}
				></div>

				  
				</div>
				
				
		
		
      </div>
	  
	 )}
	  
	  
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Crew);
