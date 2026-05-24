import React, { useState, useCallback } from 'react';
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery';
import { useNotification } from '../../hooks/useNotification';

interface DeveloperKey {
  id: number;
  name: string;
  api_key?: string;
  email?: string;
  redirect_uri?: string;
  redirect_uris?: string;
  workflow_state: 'active' | 'inactive';
  created_at: string;
  vendor_code?: string;
  notes?: string;
}

function KeySvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 7a4 4 0 11-4-4v12l-2-2-2 2-2-2V8a4 4 0 0110-1z"/><circle cx="15" cy="5" r="1.5" fill="currentColor"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M3 4v10a1 1 0 001 1h8a1 1 0 001-1V4M5 4V2a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>; }

const DeveloperKeysPage: React.FC = () => {
  const { showToast, showConfirm } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', redirectUris: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch developer keys from the root account (1)
  const { data: rawKeys, isLoading, isError, refetch } = useCanvasQuery<DeveloperKey[]>(
    '/api/v1/accounts/1/developer_keys'
  );

  const keys = rawKeys ?? [];

  const filteredKeys = keys.filter(k => 
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(k.id).includes(searchTerm)
  );

  const toggleState = useCallback(async (key: DeveloperKey) => {
    const nextState = key.workflow_state === 'active' ? 'inactive' : 'active';
    setTogglingId(key.id);
    try {
      await canvasFetch(`/api/v1/accounts/1/developer_keys/${key.id}`, {
        method: 'PUT',
        body: {
          developer_key: {
            workflow_state: nextState
          }
        }
      });
      showToast({ title: 'Key Updated', message: `${key.name} is now ${nextState}.`, type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Update Failed', message: err.message || 'Could not toggle developer key.', type: 'error' });
    } finally {
      setTogglingId(null);
    }
  }, [showToast, refetch]);

  const handleAddKey = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.name.trim()) return;

    setSaving(true);
    try {
      await canvasFetch('/api/v1/accounts/1/developer_keys', {
        method: 'POST',
        body: {
          developer_key: {
            name: newKey.name,
            redirect_uris: newKey.redirectUris,
            email: newKey.email
          }
        }
      });
      showToast({ title: 'Key Created', message: 'Developer Key successfully generated.', type: 'success' });
      setShowAddModal(false);
      setNewKey({ name: '', redirectUris: '', email: '' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Creation Failed', message: err.message || 'Could not generate developer key.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }, [newKey, showToast, refetch]);

  const handleDeleteKey = useCallback(async (keyId: number) => {
    const confirmed = await showConfirm({
      title: 'Delete Developer Key',
      message: 'Are you sure you want to delete this developer key? This will break any integrations using it.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    setDeletingId(keyId);
    try {
      await canvasFetch(`/api/v1/accounts/1/developer_keys/${keyId}`, {
        method: 'DELETE'
      });
      showToast({ title: 'Deleted', message: 'Developer key successfully deleted.', type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Delete Failed', message: err.message || 'Could not delete developer key.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  }, [showConfirm, showToast, refetch]);

  if (isLoading) {
    return (
      <div className="cx-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div className="cx-loading-ring" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="cx-page">
        <div className="cx-notification cx-notification--danger">Failed to load developer keys list. Ensure your user has administrative privileges.</div>
      </div>
    );
  }

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
                <th>Redirect URIs</th>
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
                        {key.email ? `Contact: ${key.email}` : 'API Access'} • Created {new Date(key.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <label className="cx-toggle" style={{ opacity: togglingId === key.id ? 0.6 : 1 }}>
                        <input type="checkbox" checked={key.workflow_state === 'active'} onChange={() => toggleState(key)} disabled={togglingId === key.id} />
                        <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                        <span className="cx-toggle__label" style={{ fontSize: '0.75rem' }}>{togglingId === key.id ? '...' : (key.workflow_state === 'active' ? 'ON' : 'OFF')}</span>
                      </label>
                    </td>
                    <td><code style={{ fontSize: '0.75rem', background: 'var(--cx-bg-hover)', padding: '2px 6px', borderRadius: 4 }}>{key.id}</code></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.8125rem' }}>{key.redirect_uris || key.redirect_uri || 'None'}</span>
                    </td>
                    <td>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteKey(key.id)} disabled={deletingId === key.id} style={{ color: 'var(--cx-color-danger)' }}><TrashSvg /></button>
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
            <form onSubmit={handleAddKey}>
              <div className="cx-modal__body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>Key Name</label>
                    <input type="text" className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} value={newKey.name} onChange={e => setNewKey({...newKey, name: e.target.value})} placeholder="e.g. Zoom Integration" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>Owner Email</label>
                    <input type="email" className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} value={newKey.email} onChange={e => setNewKey({...newKey, email: e.target.value})} placeholder="e.g. admin@school.edu" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>Redirect URIs (Redirect URI)</label>
                    <textarea className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)', minHeight: 80, resize: 'vertical' }} value={newKey.redirectUris} onChange={e => setNewKey({...newKey, redirectUris: e.target.value})} placeholder="https://example.com/callback" />
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Specify the OAuth callback URL.</p>
                  </div>
                </div>
              </div>
              <div className="cx-modal__footer">
                <button type="button" className="cx-btn cx-btn--secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="cx-btn cx-btn--primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperKeysPage;
