import React from "react";

const CrewListItem = ({ crew, onRemove }) => {
  if (!crew) return null;

  const displayName =
    crew.name ||
    `${crew.first_name || ""} ${crew.last_name || ""}`.trim() ||
    crew.email ||
    "Unnamed";

  return (
    <div className="d-flex justify-content-between align-items-center border rounded p-2 mb-2">
      <span>{displayName}</span>
      <button className="btn btn-sm btn-danger" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
};

export default CrewListItem;
