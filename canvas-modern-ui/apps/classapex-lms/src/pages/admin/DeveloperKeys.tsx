import React, { useState } from 'react';
import clsx from 'clsx';
import { useNotification } from '../../hooks/useNotification';

// Mock data for Developer Keys since Canvas API might not expose this immediately without deep admin token
interface DeveloperKey {
  id: string;
  name: string;
  clientId: string;
  redirectUris: string;
  scopes: string[];
  workflowState: 'active' | 'inactive';
  isLti: boolean;
  createdAt: string;
}

const mockKeys: DeveloperKey[] = [
  { id: '1', name: 'Zoom LTI', clientId: '10000000000001', redirectUris: 'https://applications.zoom.us/lti/rich', scopes: [], workflowState: 'active', isLti: true, createdAt: '2025-01-10T08:00:00Z' },
  { id: '2', name: 'Student Analytics API', clientId: '10000000000002', redirectUris: 'https://analytics.university.edu/callback', scopes: ['url:GET|/api/v1/courses/:course_id/analytics/users'], workflowState: 'active', isLti: false, createdAt: '2025-02-15T09:30:00Z' },
  { id: '3', name: 'Legacy LMS Importer', clientId: '10000000000003', redirectUris: 'https://importer.university.edu/auth', scopes: [], workflowState: 'inactive', isLti: false, createdAt: '2024-11-05T14:20:00Z' },
];

function KeySvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 7a4 4 0 11-4-4v12l-2-2-2 2-2-2V8a4 4 0 0110-1z"/><circle cx="15" cy="5" r="1.5" fill="currentColor"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }

const DeveloperKeysPage: React.FC = () => {
  const { showToast } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [keys, setKeys] = useState<DeveloperKey[]>(mockKeys);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState<{name: string, isLti: boolean, redirectUris: string}>({ name: '', isLti: false, redirectUris: '' });

  const filteredKeys = keys.filter(k => k.name.toLowerCase().includes(searchTerm.toLowerCase()) || k.clientId.includes(searchTerm));

  const toggleState = (id: string) => {
    setKeys(prev => prev.map(k => {
      if (k.id === id) {
        const newState = k.workflowState === 'active' ? 'inactive' : 'active';
        showToast({ title: 'Key Updated', message: `${k.name} is now ${newState}.`, type: 'success' });
        return { ...k, workflowState: newState };
      }
      return k;
    }));
  };

  const handleAddKey = () => {
    if (!newKey.name) {
      showToast({ title: 'Validation Error', message: 'Key Name is required', type: 'error' });
      return;
    }
    const created: DeveloperKey = {
      id: Math.random().toString(),
      name: newKey.name,
      clientId: '10000' + Math.floor(Math.random() * 10000000),
      redirectUris: newKey.redirectUris,
      scopes: [],
      workflowState: 'active',
      isLti: newKey.isLti,
      createdAt: new Date().toISOString()
    };
    setKeys(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewKey({ name: '', isLti: false, redirectUris: '' });
    showToast({ title: 'Key Created', message: 'Developer Key successfully generated.', type: 'success' });
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Developer Keys</h1>
          <p className="cx-page__subtitle">Manage OAuth2 Developer Keys and LTI 1.3 Advantage registrations.</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowAddModal(true)}>
          <PlusSvg /> Add Developer Key
        </button>
      </div>

      <div className="cx-section">
        <div className="cx-toolbar">
          <div className="cx-search">
            <SearchSvg />
            <input type="search" className="cx-search__input" placeholder="Search by name or Client ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="cx-table-container">
          <table className="cx-table">
            <thead>
              <tr>
                <th>Key Name & Details</th>
                <th>State</th>
                <th>Client ID</th>
                <th>Enforced Scopes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                    <KeySvg />
                    <p style={{ marginTop: 8, color: 'var(--cx-text-secondary)' }}>No developer keys found.</p>
                  </td>
                </tr>
              ) : (
                filteredKeys.map(key => (
                  <tr key={key.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{key.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)' }}>
                        {key.isLti ? 'LTI 1.3 Tool' : 'API Access'} • Created {new Date(key.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <label className="cx-toggle">
                        <input type="checkbox" checked={key.workflowState === 'active'} onChange={() => toggleState(key.id)} />
                        <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                        <span className="cx-toggle__label" style={{ fontSize: '0.75rem' }}>{key.workflowState === 'active' ? 'ON' : 'OFF'}</span>
                      </label>
                    </td>
                    <td><code style={{ fontSize: '0.75rem', background: 'var(--cx-bg-hover)', padding: '2px 6px', borderRadius: 4 }}>{key.clientId}</code></td>
                    <td>
                      {key.scopes.length > 0 ? (
                        <span className="cx-badge cx-badge--info" style={{ fontSize: '0.625rem' }}>{key.scopes.length} Scopes</span>
                      ) : (
                        <span className="cx-badge cx-badge--warning" style={{ fontSize: '0.625rem' }}>Full Access</span>
                      )}
                    </td>
                    <td>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="cx-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Generate Developer Key</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>Key Name</label>
                  <input type="text" className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} value={newKey.name} onChange={e => setNewKey({...newKey, name: e.target.value})} placeholder="e.g. Student App" />
                </div>
                <div>
                  <label className="cx-toggle">
                    <input type="checkbox" checked={newKey.isLti} onChange={e => setNewKey({...newKey, isLti: e.target.checked})} />
                    <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    <span className="cx-toggle__label" style={{ fontSize: '0.875rem' }}>This is an LTI 1.3 Tool</span>
                  </label>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>Redirect URIs</label>
                  <textarea className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)', minHeight: 80, resize: 'vertical' }} value={newKey.redirectUris} onChange={e => setNewKey({...newKey, redirectUris: e.target.value})} placeholder="https://example.com/callback" />
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>One URI per line.</p>
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleAddKey}>Save Key</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperKeysPage;
