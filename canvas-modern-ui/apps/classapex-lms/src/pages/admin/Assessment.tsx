import React, { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }

const mockQuestionBanks = [
  { id: '1', name: 'General Math 101', questionCount: 45, lastUpdated: '2025-01-10' },
  { id: '2', name: 'Intro to History', questionCount: 120, lastUpdated: '2025-02-14' }
];

const mockOutcomes = [
  { id: '1', name: 'Critical Thinking', description: 'Students will demonstrate critical thinking skills.', type: 'Global' },
  { id: '2', name: 'Quantitative Reasoning', description: 'Students will analyze numerical data.', type: 'Global' }
];

const AdminAssessmentPage: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'banks' | 'outcomes'>('banks');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Institutional Assessment</h1>
          <p className="cx-page__subtitle">Manage global question banks, outcomes, and rubrics.</p>
        </div>
      </div>

      <div className="cx-tabs" style={{ marginBottom: 24, borderBottom: '1px solid var(--cx-border-subtle)' }}>
        <button className={`cx-tab ${activeTab === 'banks' ? 'cx-tab--active' : ''}`} onClick={() => setActiveTab('banks')}>Question Banks</button>
        <button className={`cx-tab ${activeTab === 'outcomes' ? 'cx-tab--active' : ''}`} onClick={() => setActiveTab('outcomes')}>Outcomes & Rubrics</button>
      </div>

      <div className="cx-section">
        <div className="cx-toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="cx-search">
            <SearchSvg />
            <input type="search" className="cx-search__input" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => showToast({ title: 'Not Implemented', message: 'Creation functionality coming soon.', type: 'info' })}>
            <PlusSvg /> Add {activeTab === 'banks' ? 'Question Bank' : 'Outcome'}
          </button>
        </div>

        {activeTab === 'banks' && (
          <div className="cx-table-container">
            <table className="cx-table">
              <thead>
                <tr>
                  <th>Bank Name</th>
                  <th>Questions</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockQuestionBanks.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())).map(bank => (
                  <tr key={bank.id}>
                    <td style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{bank.name}</td>
                    <td>{bank.questionCount}</td>
                    <td>{bank.lastUpdated}</td>
                    <td><button className="cx-btn cx-btn--ghost cx-btn--sm">Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'outcomes' && (
          <div className="cx-table-container">
            <table className="cx-table">
              <thead>
                <tr>
                  <th>Outcome Name</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockOutcomes.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase())).map(outcome => (
                  <tr key={outcome.id}>
                    <td style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{outcome.name}</td>
                    <td style={{ color: 'var(--cx-text-secondary)' }}>{outcome.description}</td>
                    <td><span className="cx-badge cx-badge--info">{outcome.type}</span></td>
                    <td><button className="cx-btn cx-btn--ghost cx-btn--sm">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssessmentPage;
