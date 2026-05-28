import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';
import { useRole } from '../contexts/RoleContext';
import LogoLoader from '../components/LogoLoader'

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function SettingsSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }

interface ExternalTool {
  id: number;
  name: string;
  description: string;
  url: string;
  domain: string;
  privacy_level: string;
  consumer_key: string;
  created_at: string;
  course_navigation?: any;
  editor_button?: any;
  resource_selection?: any;
}

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

export default function ExternalToolsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { showToast, showConfirm } = useNotification();
  const { role } = useRole();
  const isTeacher = role === 'teacher' || role === 'admin';
  const [activeTab, setActiveTab] = useState<'tools' | 'keys' | 'scorm'>('tools');

  // Add App state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolUrl, setNewToolUrl] = useState('');
  const [newToolConsumerKey, setNewToolConsumerKey] = useState('');
  const [newToolSharedSecret, setNewToolSharedSecret] = useState('');
  const [newToolPrivacyLevel, setNewToolPrivacyLevel] = useState('anonymous');
  const [placements, setPlacements] = useState({
    course_navigation: true,
    editor_button: false,
    assignment_selection: false,
  });
  const [addingTool, setAddingTool] = useState(false);
  const [deletingToolId, setDeletingToolId] = useState<number | null>(null);

  // Edit placements state
  const [editingTool, setEditingTool] = useState<ExternalTool | null>(null);
  const [editPlacements, setEditPlacements] = useState({
    course_navigation: false,
    editor_button: false,
    assignment_selection: false,
  });
  const [savingPlacements, setSavingPlacements] = useState(false);

  // Developer Keys state
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEmail, setNewKeyEmail] = useState('');
  const [newKeyRedirectUri, setNewKeyRedirectUri] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [togglingKeyId, setTogglingKeyId] = useState<number | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<number | null>(null);

  // Fetch course tools
  const {
    data: toolsData,
    isLoading: toolsLoading,
    refetch: refetchTools
  } = useCanvasQuery<ExternalTool[]>(
    courseId ? `/api/v1/courses/${courseId}/external_tools` : '',
    { per_page: 50 } as any
  );
  const tools = Array.isArray(toolsData) ? toolsData : [];

  // Fetch developer keys
  const {
    data: keysData,
    isLoading: keysLoading,
    refetch: refetchKeys
  } = useCanvasQuery<DeveloperKey[]>(
    '/api/v1/accounts/1/developer_keys'
  );
  const developerKeys = Array.isArray(keysData) ? keysData : [];

  const handleLaunchLti = useCallback((tool: ExternalTool) => {
    if (courseId) {
      navigate(`/courses/${courseId}/lti?tool_id=${tool.id}`);
    }
  }, [courseId, navigate]);

  const handleAddTool = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName || !newToolUrl || !courseId) return;

    setAddingTool(true);
    try {
      const body: any = {
        name: newToolName,
        url: newToolUrl,
        consumer_key: newToolConsumerKey,
        shared_secret: newToolSharedSecret,
        privacy_level: newToolPrivacyLevel,
      }
      if (placements.course_navigation) {
        body.course_navigation = { enabled: true, text: newToolName }
      }
      if (placements.editor_button) {
        body.editor_button = { enabled: true, text: newToolName, icon_url: '' }
      }
      if (placements.assignment_selection) {
        body.resource_selection = { enabled: true, text: newToolName }
      }
      await canvasFetch(`/api/v1/courses/${courseId}/external_tools`, {
        method: 'POST',
        body,
      });
      showToast({ title: 'Tool Added', message: `${newToolName} has been configured.`, type: 'success' });
      setShowAddModal(false);
      setNewToolName('');
      setNewToolUrl('');
      setNewToolConsumerKey('');
      setNewToolSharedSecret('');
      setNewToolPrivacyLevel('anonymous');
      refetchTools();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to add external tool.', type: 'error' });
    } finally {
      setAddingTool(false);
    }
  }, [courseId, newToolName, newToolUrl, newToolConsumerKey, newToolSharedSecret, newToolPrivacyLevel, showToast, refetchTools]);

  const handleDeleteTool = useCallback(async (tool: ExternalTool) => {
    if (!courseId) return;
    const confirmed = await showConfirm({
      title: 'Delete External Tool',
      message: `Are you sure you want to remove ${tool.name}?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    setDeletingToolId(tool.id);
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/external_tools/${tool.id}`, {
        method: 'DELETE'
      });
      showToast({ title: 'Deleted', message: `${tool.name} has been removed.`, type: 'success' });
      refetchTools();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to delete tool.', type: 'error' });
    } finally {
      setDeletingToolId(null);
    }
  }, [courseId, showConfirm, showToast, refetchTools]);

  const handleAddKey = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyEmail) return;

    setSavingKey(true);
    try {
      await canvasFetch('/api/v1/accounts/1/developer_keys', {
        method: 'POST',
        body: {
          developer_key: {
            name: newKeyName,
            email: newKeyEmail,
            redirect_uri: newKeyRedirectUri || window.location.origin,
            tool_configuration: {}
          }
        }
      });
      showToast({ title: 'Key Created', message: 'Developer key successfully generated.', type: 'success' });
      setNewKeyName('');
      setNewKeyEmail('');
      setNewKeyRedirectUri('');
      refetchKeys();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to create developer key.', type: 'error' });
    } finally {
      setSavingKey(false);
    }
  }, [newKeyName, newKeyEmail, newKeyRedirectUri, showToast, refetchKeys]);

  const handleToggleKey = useCallback(async (key: DeveloperKey) => {
    const nextState = key.workflow_state === 'active' ? 'inactive' : 'active';
    setTogglingKeyId(key.id);
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
      refetchKeys();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to update developer key.', type: 'error' });
    } finally {
      setTogglingKeyId(null);
    }
  }, [showToast, refetchKeys]);

  const handleSavePlacements = useCallback(async () => {
    if (!editingTool || !courseId) return;
    setSavingPlacements(true);
    try {
      const body: any = {};
      if (editPlacements.course_navigation) {
        body.course_navigation = { enabled: true, text: editingTool.name };
      } else {
        body.course_navigation = { enabled: false };
      }
      if (editPlacements.editor_button) {
        body.editor_button = { enabled: true, text: editingTool.name };
      } else {
        body.editor_button = { enabled: false };
      }
      if (editPlacements.assignment_selection) {
        body.resource_selection = { enabled: true, text: editingTool.name };
      } else {
        body.resource_selection = { enabled: false };
      }
      await canvasFetch(`/api/v1/courses/${courseId}/external_tools/${editingTool.id}`, {
        method: 'PUT',
        body,
      });
      showToast({ title: 'Placements updated', type: 'success' });
      setEditingTool(null);
      refetchTools();
    } catch (err: any) {
      showToast({ title: 'Update failed', message: err.message || 'Failed to update placements.', type: 'error' });
    } finally {
      setSavingPlacements(false);
    }
  }, [courseId, editingTool, editPlacements, showToast, refetchTools]);

  const handleDeleteKey = useCallback(async (keyId: number) => {
    const confirmed = await showConfirm({
      title: 'Delete Developer Key',
      message: 'Are you sure you want to delete this developer key? This will break any integrations using it.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    setDeletingKeyId(keyId);
    try {
      await canvasFetch(`/api/v1/accounts/1/developer_keys/${keyId}`, {
        method: 'DELETE'
      });
      showToast({ title: 'Deleted', message: 'Developer key successfully deleted.', type: 'success' });
      refetchKeys();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to delete developer key.', type: 'error' });
    } finally {
      setDeletingKeyId(null);
    }
  }, [showConfirm, showToast, refetchKeys]);

  return (
    <div className="cx-page">
      {/* Page Header */}
      <div className="cx-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="cx-page__title">LTI Integrations &amp; SCORM Hub</h1>
          <p className="cx-page__subtitle">Manage third-party tools, SCORM player modules, and LTI developer keys.</p>
        </div>
        {isTeacher && (
          <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowAddModal(true)}>
            <PlusSvg /> Add LTI App
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--cx-border-subtle)', marginBottom: 20, gap: 8 }}>
        <button
          className={`cx-btn cx-btn--sm ${activeTab === 'tools' ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
          onClick={() => setActiveTab('tools')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          🔑 Course Tools
        </button>
        <button
          className={`cx-btn cx-btn--sm ${activeTab === 'keys' ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
          onClick={() => setActiveTab('keys')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          🔐 Developer Keys (Admin)
        </button>
        <button
          className={`cx-btn cx-btn--sm ${activeTab === 'scorm' ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
          onClick={() => setActiveTab('scorm')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          💿 SCORM Player
        </button>
      </div>

      {/* ── Tab 1: Course Tools ── */}
      {activeTab === 'tools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {toolsLoading ? (
            <LogoLoader />
          ) : tools.length === 0 ? (
            <div className="cx-empty">
              <SettingsSvg />
              <h3>No External Tools</h3>
              <p>No LTI apps are currently configured for this course.</p>
            </div>
          ) : (
            <div className="cx-table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>App Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Domain</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Privacy</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)', width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map(tool => (
                    <tr key={tool.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{tool.name}</div>
                        {tool.description && <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)', marginTop: 4 }}>{tool.description}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--cx-text-primary)' }}>{tool.domain}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="cx-badge cx-badge--neutral" style={{ textTransform: 'capitalize' }}>{tool.privacy_level}</span>
                      </td>
                      <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleLaunchLti(tool)}>
                          🚀 Launch App
                        </button>
                        {isTeacher && (
                          <>
                            <button
                              className="cx-btn cx-btn--ghost cx-btn--sm"
                              onClick={() => {
                                setEditingTool(tool);
                                setEditPlacements({
                                  course_navigation: !!tool.course_navigation,
                                  editor_button: !!tool.editor_button,
                                  assignment_selection: !!tool.resource_selection,
                                });
                              }}
                            >
                              Edit Placements
                            </button>
                            <button
                              className="cx-btn cx-btn--secondary cx-btn--sm"
                              onClick={() => handleDeleteTool(tool)}
                              disabled={deletingToolId === tool.id}
                            >
                              {deletingToolId === tool.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Developer Keys ── */}
      {activeTab === 'keys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Create Developer Key Form */}
          <form className="cx-card" onSubmit={handleAddKey} style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Key/App Name</label>
              <input
                type="text"
                className="cx-grading__comment-input"
                placeholder="e.g. Gradescope LTI v1.3"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Developer Email</label>
              <input
                type="email"
                className="cx-grading__comment-input"
                placeholder="developer@gradescope.com"
                value={newKeyEmail}
                onChange={e => setNewKeyEmail(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Redirect URI</label>
              <input
                type="url"
                className="cx-grading__comment-input"
                placeholder={window.location.origin}
                value={newKeyRedirectUri}
                onChange={e => setNewKeyRedirectUri(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
              />
            </div>
            <button className="cx-btn cx-btn--primary" type="submit" style={{ height: '36px' }} disabled={savingKey}>
              {savingKey ? 'Creating...' : 'Create Developer Key'}
            </button>
          </form>

          {/* Developer Keys Table */}
          {keysLoading ? (
            <LogoLoader />
          ) : (
            <div className="cx-table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--cx-border-subtle)' }}>App Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--cx-border-subtle)' }}>Contact</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--cx-border-subtle)' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--cx-border-subtle)', width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {developerKeys.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--cx-text-secondary)' }}>
                        No developer keys found.
                      </td>
                    </tr>
                  ) : (
                    developerKeys.map(key => (
                      <tr key={key.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{key.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', fontFamily: 'var(--cm-font-family-mono, monospace)', marginTop: 2 }}>
                            Client ID: {key.id}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--cx-text-secondary)' }}>{key.email || '-'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`cx-badge ${key.workflow_state === 'active' ? 'cx-badge--success' : 'cx-badge--neutral'}`}>
                            {key.workflow_state}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                          {isTeacher && (
                            <>
                              <button
                                className="cx-btn cx-btn--ghost cx-btn--sm"
                                onClick={() => handleToggleKey(key)}
                                disabled={togglingKeyId === key.id}
                              >
                                {togglingKeyId === key.id ? '...' : 'Toggle'}
                              </button>
                              <button
                                className="cx-btn cx-btn--ghost cx-btn--sm"
                                onClick={() => handleDeleteKey(key.id)}
                                disabled={deletingKeyId === key.id}
                                style={{ color: 'var(--cx-color-danger)' }}
                              >
                                {deletingKeyId === key.id ? '...' : 'Delete'}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: SCORM Player ── */}
      {activeTab === 'scorm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {toolsLoading ? (
            <LogoLoader />
          ) : (() => {
            const scormTool = tools.find(
              (t) =>
                t.name.toLowerCase().includes('scorm') ||
                t.url.toLowerCase().includes('scorm')
            );
            if (scormTool) {
              return (
                <div className="cx-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--cx-text-primary)', margin: '0 0 12px 0' }}>
                    SCORM Tool Detected
                  </h3>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 4 }}>
                      {scormTool.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', fontFamily: 'var(--cm-font-family-mono, monospace)' }}>
                      {scormTool.url}
                    </div>
                  </div>
                  <button
                    className="cx-btn cx-btn--primary"
                    onClick={() => window.open(scormTool.url, '_blank', 'noopener,noreferrer')}
                  >
                    Launch SCORM Manager
                  </button>
                </div>
              );
            }
            return (
              <div className="cx-empty">
                <SettingsSvg />
                <h3>No SCORM LTI tool detected.</h3>
                <p>Install a SCORM provider (e.g., SCORM Cloud) from the LTI Tools tab.</p>
                <button
                  className="cx-btn cx-btn--primary cx-btn--sm"
                  onClick={() => setActiveTab('tools')}
                  style={{ marginTop: 12 }}
                >
                  Go to LTI Tools
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Edit Placements Modal */}
      {editingTool && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="cx-card" style={{ background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-default)', width: '100%', maxWidth: '480px', padding: 24, borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
              Edit Placements — {editingTool.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem', marginBottom: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={editPlacements.course_navigation} onChange={e => setEditPlacements(prev => ({ ...prev, course_navigation: e.target.checked }))} />
                Course Left Navigation Tab
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={editPlacements.editor_button} onChange={e => setEditPlacements(prev => ({ ...prev, editor_button: e.target.checked }))} />
                Rich Text Editor Button
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={editPlacements.assignment_selection} onChange={e => setEditPlacements(prev => ({ ...prev, assignment_selection: e.target.checked }))} />
                Assignment Tool Selection
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="cx-btn cx-btn--ghost" type="button" onClick={() => setEditingTool(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSavePlacements} disabled={savingPlacements}>
                {savingPlacements ? 'Saving...' : 'Save Placements'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add App Placement settings Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <form className="cx-card" onSubmit={handleAddTool} style={{ background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-default)', width: '100%', maxWidth: '480px', padding: 24, borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
              Configure External LTI App
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>App Name</label>
                <input
                  type="text"
                  className="cx-grading__comment-input"
                  placeholder="e.g. Gradescope Connect"
                  value={newToolName}
                  onChange={e => setNewToolName(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>LTI Launch URL</label>
                <input
                  type="url"
                  className="cx-grading__comment-input"
                  placeholder="https://gradescope.com/lti/launch"
                  value={newToolUrl}
                  onChange={e => setNewToolUrl(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Consumer Key</label>
                <input
                  type="text"
                  className="cx-grading__comment-input"
                  placeholder="e.g. canvas-lti-key"
                  value={newToolConsumerKey}
                  onChange={e => setNewToolConsumerKey(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Shared Secret</label>
                <input
                  type="text"
                  className="cx-grading__comment-input"
                  placeholder="e.g. secret123"
                  value={newToolSharedSecret}
                  onChange={e => setNewToolSharedSecret(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Privacy Level</label>
                <select
                  className="cx-grading__comment-input"
                  value={newToolPrivacyLevel}
                  onChange={e => setNewToolPrivacyLevel(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                >
                  <option value="anonymous">Anonymous</option>
                  <option value="name_only">Name Only</option>
                  <option value="public">Public</option>
                </select>
              </div>

              {/* Tool Placement checkboxes */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Tool Placements Rendering Selection</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={placements.course_navigation}
                      onChange={e => setPlacements(prev => ({ ...prev, course_navigation: e.target.checked }))}
                    />
                    Course Left Navigation Tab
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={placements.editor_button}
                      onChange={e => setPlacements(prev => ({ ...prev, editor_button: e.target.checked }))}
                    />
                    Rich Text Editor Button Icon
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={placements.assignment_selection}
                      onChange={e => setPlacements(prev => ({ ...prev, assignment_selection: e.target.checked }))}
                    />
                    Assignment Tool Selection Placement
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="cx-btn cx-btn--ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" type="submit" disabled={addingTool}>
                {addingTool ? 'Saving...' : 'Configure Tool'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
