import React from 'react';
import EstimatesList from './EstimatesList';
import './estimates.scss';

function Estimates() {
  return (
    <div className="estimates-container">
      <div className="estimates-header">
        <h2>Estimate List</h2>
      </div>
      <div className="estimates-content">
        <EstimatesList />
      </div>
    </div>
  );
}

export default Estimates;
