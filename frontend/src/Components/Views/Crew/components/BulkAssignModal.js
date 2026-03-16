import React, { useState } from "react";

const BulkAssignModal = ({
  crewMembers,
  assignedCrew,
  toggleCrewAssign,
  assignWholeProject,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = (crewMembers || []).filter((member) =>
    (member.name || "")
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="crew-bulk-assign">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Assign Crew Members</h5>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search crew..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="row">
        {filtered.map((member) => (
          <div key={member.id} className="col-md-4 mb-2">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={assignedCrew.includes(member.id)}
                onChange={() => toggleCrewAssign(member.id)}
              />
              <label className="form-check-label">{member.name}</label>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-12">
            <p className="text-muted mb-0">No crew members found.</p>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={assignWholeProject}
        >
          Assign to Whole Project
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default BulkAssignModal;
