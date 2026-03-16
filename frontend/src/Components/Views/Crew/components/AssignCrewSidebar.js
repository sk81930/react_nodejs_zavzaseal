import React, { useEffect, useState } from "react";
import moment from "moment";
import ProjectSelector from "./ProjectSelector";

const AssignCrewSidebar = ({
  projects,
  selectedProject,
  setSelectedProject,
  onProjectSearchChange,
  crewMembers,
  projectDays,
  onApply,
  onClose,
}) => {
  const [selectedCrew, setSelectedCrew] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [crewSearch, setCrewSearch] = useState("");
  const [selectAllCrew, setSelectAllCrew] = useState(false);

  // Handle crew search input change
  const handleCrewSearchChange = (e) => {
    const value = e.target.value;
    setCrewSearch(value);
  };

  // Reset days when project or its days change
  useEffect(() => {
    setSelectedDays(projectDays || []);
  }, [projectDays, selectedProject]);

  // Keep selected crew in sync with select-all
  useEffect(() => {
    if (selectAllCrew) {
      setSelectedCrew((crewMembers || []).map((c) => c.id));
    } else {
      // When "Select All" is turned off, clear all selections
      setSelectedCrew([]);
    }
  }, [selectAllCrew, crewMembers]);

  const toggleCrewMember = (id) => {
    setSelectedCrew((prev) => {
      const isSelected = prev.includes(id);
      const next = isSelected ? prev.filter((x) => x !== id) : [...prev, id];

      // If user manually unchecks any crew, turn off "Select All"
      if (selectAllCrew && isSelected) {
        setSelectAllCrew(false);
      }

      return next;
    });
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleApply = () => {
    if (!selectedProject || selectedCrew.length === 0 || selectedDays.length === 0) {
      return;
    }
    onApply(selectedCrew, selectedDays);
    onClose();
  };

  const filteredCrew = (crewMembers || []).filter((member) => {
    const name =
      member.name ||
      `${member.first_name || ""} ${member.last_name || ""}`.trim();
    return name.toLowerCase().includes(crewSearch.toLowerCase());
  });

  return (
    <div className="assign-crew-sidebar">
      <h4 className="mb-3">Assign Crew</h4>

      <div className="mb-4">
        <ProjectSelector
          projects={projects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          onSearchChange={onProjectSearchChange}
        />
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Crew Members</h5>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="selectAllCrew"
              checked={selectAllCrew}
              onChange={(e) => setSelectAllCrew(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="selectAllCrew">
              Select All
            </label>
          </div>
        </div>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Search crew..."
          value={crewSearch || ""}
          onChange={handleCrewSearchChange}
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
          {filteredCrew.map((member) => {
            const name =
              member.name ||
              `${member.first_name || ""} ${member.last_name || ""}`.trim();
            return (
              <div key={member.id} className="form-check mb-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`crew-${member.id}`}
                  checked={selectedCrew.includes(member.id)}
                  onChange={() => toggleCrewMember(member.id)}
                />
                <label
                  className="form-check-label"
                  htmlFor={`crew-${member.id}`}
                >
                  {name || "Unnamed"}
                </label>
              </div>
            );
          })}
          {filteredCrew.length === 0 && (
            <p className="text-muted mb-0">No crew members found.</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h5 className="mb-2">Select Days</h5>
        {(!projectDays || projectDays.length === 0) && (
          <p className="text-muted mb-0">
            Select a project to see its available days.
          </p>
        )}
        {projectDays && projectDays.length > 0 && (
          <>
            <div className="d-flex flex-wrap">
              {projectDays.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    className={`btn btn-sm me-2 mb-2 ${
                      active ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => toggleDay(day)}
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
                onClick={() => setSelectedDays(projectDays)}
              >
                Select all days
              </button>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => setSelectedDays([])}
              >
                Clear days
              </button>
            </div>
          </>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleApply}
          disabled={
            !selectedProject || selectedCrew.length === 0 || selectedDays.length === 0
          }
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default AssignCrewSidebar;


