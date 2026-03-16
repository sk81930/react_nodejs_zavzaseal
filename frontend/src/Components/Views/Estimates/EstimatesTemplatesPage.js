import React from 'react';
import EstimatesTemplates from './EstimatesTemplates';
import './estimates.scss';
import './EstimatesTemplates.scss';

function EstimatesTemplatesPage() {
  return (
    <div className="estimates-container">
      <div className="estimates-content">
        <EstimatesTemplates />
      </div>
    </div>
  );
}

export default EstimatesTemplatesPage;
