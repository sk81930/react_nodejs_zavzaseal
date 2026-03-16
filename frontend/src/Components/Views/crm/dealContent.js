import React, { useEffect, useState } from 'react';
import agent from '../../../agent';
import './dealContent.scss';
import SideModal from '../../Layouts/SideModal';
import LeadContent from './leadContent';

const formatDate = (dateString) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "$0";
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
};

function getField(val) {
  if (val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
    return <span className="deal-content-empty">field is empty</span>;
  }
  return val;
}

const DealContent = ({ dealId }) => {
  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    if (dealId) {
      setLoading(true);
      setError(null);
      agent.Website.getDealById(dealId)
        .then((response) => {
          if (response && response.isSuccess && response.data) {
            setDealData(response.data);
          } else {
            setError('No data found');
          }
        })
        .catch((err) => {
          setError(err.message || 'Error fetching deal data');
        })
        .finally(() => setLoading(false));
    }
  }, [dealId]);

  if (loading) return (
    <div className="deal-content-loading">
      <div className="spinner"></div>
      <div className="deal-content-loading-text">Loading deal details...</div>
    </div>
  );
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!dealData || !dealData.deal_json_data) return (
    <div className="deal-content-no-data">
      <div className="deal-content-no-data-icon">🗂️</div>
      <div className="deal-content-no-data-title">No Deal Data</div>
      <div className="deal-content-no-data-desc">We couldn't find any details for this deal. Please check again later or contact support if you believe this is an error.</div>
    </div>
  );

  const d = dealData.deal_json_data;
  const leadData = dealData;
  const responsible = dealData.responsible_person || {
    name: 'Jeljie Dice',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    link: '#',
  };

  return (
    <div className="deal-content-main">
      <div className="deal-content-title-main">{getField(d.TITLE)}</div>
      {/* ABOUT DEAL */}
      <section className="deal-content-section">
        <div className="deal-content-section-title">ABOUT DEAL</div>
        <div className="deal-content-field"><div className="deal-content-label">Name</div><div className="deal-content-value">{getField(d.TITLE)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">Street</div><div className="deal-content-value">{getField(d.UF_CRM_1669816901654)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">City</div><div className="deal-content-value">{getField(d.UF_CRM_613BA1330A1F5)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">County</div><div className="deal-content-value">{getField(d.UF_CRM_6377E96C08DD6)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">ZIP Code</div><div className="deal-content-value">{getField(d.UF_CRM_613BA133148AF)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">Lead Date</div><div className="deal-content-value">{getField(formatDate(d.BEGINDATE))}</div></div>
        {leadData.lead_data && leadData.lead_data.id && (
          <>
            <div className="deal-content-label">Lead</div>
            <div className="deal-content-value">
              <a
                href="#"
                className="deal-content-link"
                onClick={e => {
                  e.preventDefault();
                  setIsLeadModalOpen(true);
                }}
              >
                {getField(leadData.lead_data.TITLE)}
              </a>
            </div>
            <SideModal
              isOpen={isLeadModalOpen}
              setIsOpen={setIsLeadModalOpen}
              showButton={false}
              classDef="lead-details-modal"
            >
              <LeadContent leadId={leadData.lead_data.id} />
            </SideModal>
          </>
        )}
      </section>

      {/* CONTRACT */}
      <section className="deal-content-section">
        <div className="deal-content-section-title">CONTRACT</div>
        <div className="deal-content-field">
          <div className="deal-content-label">Contract Price</div>
          <div className="deal-content-contract-price">{formatCurrency(d.OPPORTUNITY)}</div>
        </div>
        <div className="deal-content-field">
          <div className="deal-content-label">Payment Options</div>
          <div className="deal-content-value">
            {(() => {
              const field = dealData.fields && dealData.fields.UF_CRM_1669820454133;
              const selectedId = d.UF_CRM_1669820454133;
              if (field && Array.isArray(field.items) && selectedId) {
                const found = field.items.find(item => String(item.ID) === String(selectedId));
                return found ? found.VALUE : "";
              }
              return <span className="lead-content-empty">field is empty</span>;
            })()}
          </div>
        </div>
        <div className="deal-content-field"><div className="deal-content-label">Payment Request Date</div><div className="deal-content-value">{getField(d.UF_CRM_1669820504347)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">Project Start Date</div><div className="deal-content-value">{getField(d.UF_CRM_1672850660)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">Project Completion Date</div><div className="deal-content-value">{getField(d.UF_CRM_1672850693)}</div></div>
        <div className="deal-content-field">
          <div className="deal-content-label">Verified By</div>
          <div className="deal-content-value">
            {(() => {
              const field = dealData.fields && dealData.fields.UF_CRM_1669820695125;
              const selectedId = d.UF_CRM_1669820695125;
              if (field && Array.isArray(field.items) && selectedId) {
                const found = field.items.find(item => String(item.ID) === String(selectedId));
                return found ? found.VALUE : "";
              }
              return <span className="lead-content-empty">field is empty</span>;
            })()}
          </div>
        </div>
      </section>

      {/* PROJECT */}
      <section className="deal-content-section">
        <div className="deal-content-section-title">PROJECT</div>
        <div className="deal-content-field"><div className="deal-content-label">Project description</div><div className="deal-content-value">
          {(() => {
              const field = dealData.fields && dealData.fields.UF_CRM_1671105266136;
              const selectedId = d.UF_CRM_1671105266136;
              if (field && Array.isArray(field.items) && selectedId) {
                const found = field.items.find(item => String(item.ID) === String(selectedId));
                return found ? found.VALUE : "";
              }
              return <span className="lead-content-empty">field is empty</span>;
            })()}
        </div></div>
        <div className="deal-content-field"><div className="deal-content-label">Additional Project</div><div className="deal-content-value">{getField(d.UF_CRM_1669820833764)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">Additional Project Cost</div><div className="deal-content-value">{getField(d.UF_CRM_1669820880459)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">Discount</div>
          <div className="deal-content-value">
            {(() => {
              const field = dealData.fields && dealData.fields.UF_CRM_1669820994707;
              const selectedId = d.UF_CRM_1669820994707;
              if (field && Array.isArray(field.items) && selectedId) {
                const found = field.items.find(item => String(item.ID) === String(selectedId));
                return found ? found.VALUE : "";
              }
              return <span className="lead-content-empty">field is empty</span>;
            })()}
          </div>
        </div>
        <div className="deal-content-field"><div className="deal-content-label">Discount Due Date</div><div className="deal-content-value">{getField(d.UF_CRM_1669821030706)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">TOTAL PROJECT COST</div><div className="deal-content-value">{getField(d.UF_CRM_1669821164448)}</div></div>
        <div className="deal-content-field"><div className="deal-content-label">Approved By</div>
          <div className="deal-content-value">
            {(() => {
              const field = dealData.fields && dealData.fields.UF_CRM_1669821349204;
              const selectedId = d.UF_CRM_1669821349204;
              if (field && Array.isArray(field.items) && selectedId) {
                const found = field.items.find(item => String(item.ID) === String(selectedId));
                return found ? found.VALUE : "";
              }
              return <span className="lead-content-empty">field is empty</span>;
            })()}
          </div>
        </div>
      </section>

      {/* SEND EMAIL */}
      <section className="deal-content-section">
        <div className="deal-content-section-title">SEND EMAIL</div>
        <div className="deal-content-field">
          <div className="deal-content-label">Send Email</div>
          <div className="deal-content-value">
            {(() => {
              const field = dealData.fields && dealData.fields.UF_CRM_1724432233;
              const selectedId = d.UF_CRM_1724432233;
              if (field && Array.isArray(field.items) && selectedId) {
                const found = field.items.find(item => String(item.ID) === String(selectedId));
                return found ? found.VALUE : "";
              }
              return <span className="lead-content-empty">field is empty</span>;
            })()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DealContent; 