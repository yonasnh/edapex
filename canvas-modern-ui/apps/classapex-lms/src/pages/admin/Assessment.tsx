import React, { useState } from 'react';
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery';
import { useNotification } from '../../hooks/useNotification';

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M3 4v10a1 1 0 001 1h8a1 1 0 001-1V4M5 4V2a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>; }

interface QuestionBank {
  id: number;
  title: string;
  questions_count?: number;
  updated_at?: string;
}

interface Outcome {
  id: number;
  title: string;
  description?: string;
  vendor_guid?: string;
}

const AdminAssessmentPage: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'banks' | 'outcomes'>('banks');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch account question banks
  const { data: questionBanks, isLoading: loadingBanks, isError: banksError, refetch: refetchBanks } = useCanvasQuery<QuestionBank[]>(
    '/api/v1/accounts/1/question_banks'
  );

  // Fetch root outcomes / outcome groups
  const { data: outcomes, isLoading: loadingOutcomes, isError: outcomesError, refetch: refetchOutcomes } = useCanvasQuery<Outcome[]>(
    '/api/v1/accounts/1/outcome_groups'
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    try {
      if (activeTab === 'banks') {
        await canvasFetch('/api/v1/accounts/1/question_banks', {
          method: 'POST',
          body: { title: newName }
        });
        showToast({ title: 'Success', message: 'Question bank created.', type: 'success' });
        refetchBanks();
      } else {
        await canvasFetch('/api/v1/accounts/1/outcome_groups', {
          method: 'POST',
          body: {
            title: newName,
            description: newDesc
          }
        });
        showToast({ title: 'Success', message: 'Outcome group created.', type: 'success' });
        refetchOutcomes();
      }
      setShowAddModal(false);
      setNewName('');
      setNewDesc('');
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Creation failed.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBank = async (bankId: number) => {
    if (!confirm('Are you sure you want to delete this question bank?')) return;
    try {
      await canvasFetch(`/api/v1/accounts/1/question_banks/${bankId}`, {
        method: 'DELETE'
      });
      showToast({ title: 'Success', message: 'Question bank deleted.', type: 'success' });
      refetchBanks();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Delete failed.', type: 'error' });
    }
  };

  const banksList = questionBanks ?? [];
  const outcomesList = outcomes ?? [];

  const filteredBanks = banksList.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOutcomes = outcomesList.filter(o => o.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const loading = activeTab === 'banks' ? loadingBanks : loadingOutcomes;
  const error = activeTab === 'banks' ? banksError : outcomesError;

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
          <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowAddModal(true)}>
            <PlusSvg /> Add {activeTab === 'banks' ? 'Question Bank' : 'Outcome'}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="cx-loading-ring" /></div>
        ) : error ? (
          <div className="cx-notification cx-notification--danger">Failed to load assessments data.</div>
        ) : activeTab === 'banks' ? (
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
                {filteredBanks.map(bank => (
                  <tr key={bank.id}>
                    <td style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{bank.title}</td>
                    <td>{bank.questions_count ?? 0}</td>
                    <td>{bank.updated_at ? new Date(bank.updated_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteBank(bank.id)} style={{ color: 'var(--cx-color-danger)' }}><TrashSvg /></button>
                    </td>
                  </tr>
                ))}
                {filteredBanks.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--cx-text-tertiary)' }}>No question banks found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
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
                {filteredOutcomes.map(outcome => (
                  <tr key={outcome.id}>
                    <td style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{outcome.title}</td>
                    <td style={{ color: 'var(--cx-text-secondary)' }}>{outcome.description || 'No description provided.'}</td>
                    <td><span className="cx-badge cx-badge--info">Global</span></td>
                    <td><button className="cx-btn cx-btn--ghost cx-btn--sm">Edit</button></td>
                  </tr>
                ))}
                {filteredOutcomes.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--cx-text-tertiary)' }}>No learning outcomes found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="cx-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Create {activeTab === 'banks' ? 'Question Bank' : 'Learning Outcome'}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>Name / Title</label>
                  <input type="text" className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} value={newName} onChange={e => setNewName(e.target.value)} placeholder={`e.g. ${activeTab === 'banks' ? 'Final Exam Prep' : 'Critical Thinking'}`} required />
                </div>
                {activeTab === 'outcomes' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>Description</label>
                    <textarea className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)', minHeight: 80, resize: 'vertical' }} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe the outcome standard..." />
                  </div>
                )}
              </div>
              <div className="cx-modal__footer">
                <button type="button" className="cx-btn cx-btn--secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="cx-btn cx-btn--primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssessmentPage;
