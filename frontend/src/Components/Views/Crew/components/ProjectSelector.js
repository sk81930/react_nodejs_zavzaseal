import React, { useState, useEffect } from "react";

const ProjectSelector = ({
  projects = [],
  selectedProject,
  setSelectedProject,
  onSearchChange,
  isLoading = false
}) => {
  const [search, setSearch] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // When selectedProject changes externally
  useEffect(() => {
    if (!selectedProject) return;

    const project = projects.find(p => p.id === selectedProject);
    if (project) {
      const label = `${project.name} #${project.leadId}`;
      setSearch(label);
      setSelectedItem(project);
    }
  }, [selectedProject, projects]);

  // Filter projects
  useEffect(() => {
    if (!search || selectedItem) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project =>
      `${project.name} ${project.address || ""} ${project.leadId || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    setFilteredProjects(filtered);
  }, [search, projects, selectedItem]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setSelectedItem(null);
    setSelectedProject(null);
    setShowDropdown(true);

    if (typeof onSearchChange === "function") {
      onSearchChange(value);
    }
  };

  const handleSelect = (project) => {
    setSelectedProject(project.id);
    setSelectedItem(project);
    setSearch(`${project.name} #${project.leadId}`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSearch("");
    setSelectedItem(null);
    setSelectedProject(null);
    setShowDropdown(false);
  };

  return (
    <div className="project-selector-wrapper">
      <label className="form-label fw-bold">
        Choose Project (Task)
      </label>

      <div className="project-selector-input-wrapper">
        <span className="icon">📁</span>

        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => !selectedItem && setShowDropdown(true)}
          placeholder="Search project..."
          autoComplete="off"
          readOnly={!!selectedItem}
        />

        {isLoading && !selectedItem && (
          <span className="loading">⟳</span>
        )}

        {selectedItem && (
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && !selectedItem && (
        <div className="project-selector-dropdown">
          {filteredProjects.length === 0 ? (
            <div className="empty-item">
              No projects found
            </div>
          ) : (
            filteredProjects.map(project => (
              <div
                key={project.id}
                className="project-item"
                onClick={() => handleSelect(project)}
              >
                <div className="project-name">
                  {project.name}
                </div>
                <div className="project-sub">
                  {project.address || "No address"}
                </div>
                <div className="project-sub">
                  Lead #{project.leadId}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
