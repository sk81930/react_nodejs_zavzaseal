import React, { useState } from 'react';
import Leads from './Leads';
import Deals from './Deals';
import './crm.scss';

const TABS = [
  { key: 'leads', label: 'Leads' },
  { key: 'deals', label: 'Deals' }
];

function CRM() {
  const [activeTab, setActiveTab] = useState('leads');

  return (
    <div className="crm-container">
      <div className="crm-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="crm-tab-content">
        {activeTab === 'leads' && <Leads />}
        {activeTab === 'deals' && <Deals />}
      </div>
    </div>
  );
}

export default CRM; 