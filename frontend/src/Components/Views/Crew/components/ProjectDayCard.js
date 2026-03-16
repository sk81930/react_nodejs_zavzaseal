import React from "react";
import moment from "moment";
import CrewListItem from "./CrewListItem";

const ProjectDayCard = ({
  date,
  crewMembers,
  assignedCrew,
  onBulkAssign,
  onRemoveCrew,
}) => {
  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>{moment(date).format("MMMM D | dddd")}</strong>
        </div>

        <div className="card-body">
          {assignedCrew.length === 0 && (
            <p className="text-muted">No crew assigned</p>
          )}

          {assignedCrew.map(crewId => {
            const crew = crewMembers.find(c => c.id === crewId);
            return (
              <CrewListItem
                key={crewId}
                crew={crew}
                onRemove={() => onRemoveCrew(date, crewId)}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ProjectDayCard;
