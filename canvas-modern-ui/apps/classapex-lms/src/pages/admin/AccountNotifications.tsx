import React, { useState } from 'react';
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery';
import { useNotification } from '../../hooks/useNotification';
import LogoLoader from '../../components/LogoLoader'

function BellSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a6 6 0 00-6 6v3.5l-2 2.5v1h16v-1l-2-2.5V8a6 6 0 00-6-6zM8.5 17a1.5 1.5 0 103 0h-3z"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>; }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>; }

interface AccountNotification {
  id: number;
  subject: string;
  message: string;
  start_at: string;
  end_at: string;
  icon: string;
  roles: string[];
}

function formatDateTimeLocal(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const pad = (num: number) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function AccountNotificationsPage() {
  const { showConfirm, showToast } = useNotification();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [icon, setIcon] = useState('warning');
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  const { data: notifications, isLoading, refetch } = useCanvasQuery<AccountNotification[]>(
    '/api/v1/accounts/1/account_notifications',
    { include_all: true } as any
  );

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLocal(true);
    try {
      const payload = {
        account_notification: {
          subject,
          message,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          icon,
        }
      };

      if (editingId) {
        await canvasFetch(`/api/v1/accounts/1/account_notifications/${editingId}`, {
          method: 'PUT',
          body: payload
        });
      } else {
        await canvasFetch(`/api/v1/accounts/1/account_notifications`, {
          method: 'POST',
          body: payload
        });
      }

      resetForm();
      showToast({
        title: 'Notification Saved',
        message: 'The account notification was saved successfully.',
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to save announcement',
        message: err.message || 'An error occurred while saving the announcement.',
        type: 'error'
      });
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleEditClick = (n: AccountNotification) => {
    setEditingId(n.id);
    setSubject(n.subject);
    setMessage(n.message);
    setStartAt(formatDateTimeLocal(n.start_at));
    setEndAt(formatDateTimeLocal(n.end_at));
    setIcon(n.icon || 'warning');
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: number) => {
    const confirmed = await showConfirm({
      title: 'Delete Notification',
      message: 'Are you sure you want to permanently delete this notification for all users?',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      await canvasFetch(`/api/v1/accounts/1/account_notifications/${id}?remove=true`, {
        method: 'DELETE'
      });
      showToast({
        title: 'Notification Deleted',
        message: 'The notification was permanently deleted.',
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to delete notification',
        message: err.message || 'An error occurred while deleting the notification.',
        type: 'error'
      });
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setSubject('');
    setMessage('');
    setStartAt('');
    setEndAt('');
    setIcon('warning');
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Global Notifications</h1>
          <p className="cx-page__subtitle">Broadcast messages to all users in this account.</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => { resetForm(); setIsCreating(true); }}>
          <PlusSvg /> New Notification
        </button>
      </div>

      {isCreating && (
        <div className="cx-card" style={{ marginBottom: 24 }}>
          <div className="cx-card__body">
            <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
                {editingId ? 'Edit Notification' : 'Create Notification'}
              </h3>
              
              <div className="cx-input-group">
                <label className="cx-input-label">Subject</label>
                <div className="cx-input-wrapper cx-input-wrapper--md">
                  <input 
                    required 
                    className="cx-input" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                    placeholder="e.g. System Maintenance" 
                  />
                </div>
              </div>

              <div className="cx-input-group">
                <label className="cx-input-label">Message</label>
                <div className="cx-input-wrapper cx-textarea-wrapper">
                  <textarea 
                    required 
                    className="cx-input cx-textarea" 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    rows={3} 
                    placeholder="Enter the announcement message details..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div className="cx-input-group" style={{ flex: 1, minWidth: 200 }}>
                  <label className="cx-input-label">Start Date</label>
                  <div className="cx-input-wrapper cx-input-wrapper--md">
                    <input 
                      required 
                      type="datetime-local" 
                      className="cx-input" 
                      value={startAt} 
                      onChange={e => setStartAt(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="cx-input-group" style={{ flex: 1, minWidth: 200 }}>
                  <label className="cx-input-label">End Date</label>
                  <div className="cx-input-wrapper cx-input-wrapper--md">
                    <input 
                      required 
                      type="datetime-local" 
                      className="cx-input" 
                      value={endAt} 
                      onChange={e => setEndAt(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="cx-input-group" style={{ flex: 1, minWidth: 160 }}>
                  <label className="cx-input-label">Icon Type</label>
                  <select 
                    className="cx-select" 
                    style={{ width: '100%', height: '100%' }}
                    value={icon} 
                    onChange={e => setIcon(e.target.value)}
                  >
                    <option value="warning">Warning</option>
                    <option value="information">Information</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="cx-btn cx-btn--ghost" onClick={resetForm}>Cancel</button>
                <button type="submit" className="cx-btn cx-btn--primary" disabled={isSavingLocal}>
                  {isSavingLocal ? 'Saving...' : editingId ? 'Save Changes' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <LogoLoader />
      ) : !notifications || notifications.length === 0 ? (
        <div className="cx-empty">
          <BellSvg />
          <h3>No Active Notifications</h3>
          <p>There are no global announcements running currently.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {notifications.map(n => (
            <div key={n.id} className="cx-card">
              <div className="cx-card__body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ padding: 12, background: 'var(--cx-bg-surface-raised)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cx-text-secondary)' }}>
                  <BellSvg />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>{n.subject}</h4>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="cx-badge cx-badge--neutral">{n.icon}</span>
                      <button 
                        className="cx-btn cx-btn--ghost cx-btn--sm" 
                        onClick={() => handleEditClick(n)}
                        style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                        title="Edit"
                      >
                        <EditSvg /> Edit
                      </button>
                      <button 
                        className="cx-btn cx-btn--ghost cx-btn--sm" 
                        onClick={() => handleDeleteClick(n.id)}
                        style={{ padding: '4px 8px', color: 'var(--cx-color-danger)', display: 'flex', alignItems: 'center', gap: 4 }}
                        title="Delete"
                      >
                        <TrashSvg /> Delete
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: 'var(--cx-text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 12 }}>
                    Active: {new Date(n.start_at).toLocaleString()} – {new Date(n.end_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
