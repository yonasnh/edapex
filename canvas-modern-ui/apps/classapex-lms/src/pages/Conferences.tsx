import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function CalendarSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5"/><path d="M1.5 5.5h11"/><path d="M4.5 1v3M9.5 1v3"/></svg>; }

interface Conference {
  id: number;
  title: string;
  conference_type: string;
  duration?: number;
  status: 'active' | 'concluded' | 'ready';
  started_at?: string;
  user_settings?: { join_url?: string };
  join_url?: string;
}

export default function ConferencesPage() {
  const { courseId } = useParams();
  const { showToast, showConfirm } = useNotification();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('60');
  const [creating, setCreating] = useState(false);

  // Fetch active/concluded web conferences in the course
  const { data: rawConferences, isLoading, isError, refetch } = useCanvasQuery<{ conferences: Conference[] } | Conference[]>(
    `/api/v1/courses/${courseId}/conferences`
  );

  // Canvas API can return { conferences: [...] } or direct array depending on version/context
  const conferencesList = Array.isArray(rawConferences) 
    ? rawConferences 
    : (rawConferences?.conferences || []);

  const handleCreateConference = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/conferences`, {
        method: 'POST',
        body: {
          web_conference: {
            title: newTitle,
            duration: Number(newDuration),
            conference_type: 'BigBlueButton'
          }
        }
      });
      showToast({ title: 'Success', message: 'Web conference created.', type: 'success' });
      setShowAddModal(false);
      setNewTitle('');
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to create conference.', type: 'error' });
    } finally {
      setCreating(false);
    }
  }, [courseId, newTitle, newDuration, showToast, refetch]);

  const handleJoin = useCallback((conf: Conference) => {
    const url = conf.join_url || conf.user_settings?.join_url;
    if (url) {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        showToast({ title: 'Popup Blocked', message: 'Please allow popups to join the conference.', type: 'warning' });
      }
    } else {
      showToast({ title: 'Join Error', message: 'No launch URL available for this conference.', type: 'error' });
    }
  }, [showToast]);

  const handleEnd = useCallback(async (confId: number) => {
    const confirmed = await showConfirm({
      title: 'End Conference',
      message: 'Are you sure you want to end this conference? Participants will be disconnected.',
      confirmLabel: 'End Conference',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/conferences/${confId}/close`, {
        method: 'PUT'
      });
      showToast({ title: 'Conference Closed', message: 'The conference has been concluded.', type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to close conference.', type: 'error' });
    }
  }, [courseId, showConfirm, showToast, refetch]);

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
        <div className="cx-notification cx-notification--danger">Failed to load conferences list.</div>
      </div>
    );
  }

  const activeConfs = conferencesList.filter(c => c.status !== 'concluded');
  const concludedConfs = conferencesList.filter(c => c.status === 'concluded');

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Conferences</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--cx-text-secondary)', margin: '4px 0 0' }}>Virtual classrooms and office hours powered by BigBlueButton.</p>
        </div>
        <button className="cx-btn cx-btn--primary" onClick={() => setShowAddModal(true)}><PlusSvg /> Conference</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 16 }}>New Conferences</h3>
          <div style={{ background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
            {activeConfs.map((conf) => (
              <div key={conf.id} style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--cx-text-primary)' }}>{conf.title}</h4>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarSvg /> {conf.started_at ? new Date(conf.started_at).toLocaleString() : 'Ready to start'}
                    </span>
                    {conf.duration && <span>Duration: {conf.duration} min</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="cx-badge cx-badge--success" style={{ animation: 'pulse 2s infinite' }}>
                    {conf.status === 'active' ? 'In Progress' : 'Ready'}
                  </span>
                  <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => handleJoin(conf)}>Join</button>
                  <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => handleEnd(conf.id)}>End</button>
                </div>
              </div>
            ))}
            {activeConfs.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>
                There are no active conferences.
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 16 }}>Concluded Conferences</h3>
          <div style={{ background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
            {concludedConfs.map((conf) => (
              <div key={conf.id} style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--cx-text-primary)' }}>{conf.title}</h4>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
                    <span>Concluded: {conf.started_at ? new Date(conf.started_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
            {concludedConfs.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>
                No concluded conferences found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showAddModal && (
        <div className="cx-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Create Web Conference</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateConference}>
              <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>Conference Title</label>
                  <input 
                    type="text" 
                    className="cx-search__input" 
                    style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    placeholder="e.g. Weekly Q&A Session" 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>Duration (Minutes)</label>
                  <select 
                    className="cx-select" 
                    style={{ width: '100%' }} 
                    value={newDuration} 
                    onChange={e => setNewDuration(e.target.value)}
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>
              </div>
              <div className="cx-modal__footer">
                <button type="button" className="cx-btn cx-btn--secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="cx-btn cx-btn--primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
