import React, { useState } from 'react';
import { useCanvasQuery, useCanvasMutation } from '../../hooks/useCanvasQuery';

function BellSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a6 6 0 00-6 6v3.5l-2 2.5v1h16v-1l-2-2.5V8a6 6 0 00-6-6zM8.5 17a1.5 1.5 0 103 0h-3z"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }

interface AccountNotification {
  id: number;
  subject: string;
  message: string;
  start_at: string;
  end_at: string;
  icon: string;
  roles: string[];
}

export default function AccountNotificationsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [icon, setIcon] = useState('warning');

  const { data: notifications, isLoading, refetch } = useCanvasQuery<AccountNotification[]>(
    '/api/v1/accounts/1/account_notifications',
    {} as any
  );

  const { mutate, isLoading: isSaving } = useCanvasMutation(
    '/api/v1/accounts/1/account_notifications',
    'POST'
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutate({
      account_notification: {
        subject,
        message,
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        icon,
      }
    });
    setIsCreating(false);
    refetch();
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Global Notifications</h1>
          <p className="cx-page__subtitle">Broadcast messages to all users in this account.</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setIsCreating(true)}>
          <PlusSvg /> New Notification
        </button>
      </div>

      {isCreating && (
        <div className="cx-card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3>Create Notification</h3>
            <div>
              <label className="cx-label">Subject</label>
              <input required className="cx-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="System Maintenance" />
            </div>
            <div>
              <label className="cx-label">Message</label>
              <textarea required className="cx-input" value={message} onChange={e => setMessage(e.target.value)} rows={3} />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="cx-label">Start Date</label>
                <input required type="datetime-local" className="cx-input" value={startAt} onChange={e => setStartAt(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="cx-label">End Date</label>
                <input required type="datetime-local" className="cx-input" value={endAt} onChange={e => setEndAt(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="cx-label">Icon Type</label>
                <select className="cx-input" value={icon} onChange={e => setIcon(e.target.value)}>
                  <option value="warning">Warning</option>
                  <option value="information">Information</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="cx-btn cx-btn--ghost" onClick={() => setIsCreating(false)}>Cancel</button>
              <button type="submit" className="cx-btn cx-btn--primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="cx-loading"><div className="cx-loading__spinner" /></div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="cx-empty">
          <BellSvg />
          <h3>No Active Notifications</h3>
          <p>There are no global announcements running currently.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {notifications.map(n => (
            <div key={n.id} className="cx-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ padding: 12, background: 'var(--cx-bg-surface-raised)', borderRadius: 8 }}>
                <BellSvg />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>{n.subject}</h4>
                  <span className="cx-badge cx-badge--neutral">{n.icon}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--cx-text-secondary)' }}>{n.message}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 12 }}>
                  Active: {new Date(n.start_at).toLocaleString()} – {new Date(n.end_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
