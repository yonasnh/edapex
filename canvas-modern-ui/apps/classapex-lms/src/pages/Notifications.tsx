import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';

interface StreamItem {
  id: number
  title: string
  message: string
  type: string
  read_state: boolean
  created_at: string
  html_url: string
  course_id?: number
}

interface CommChannel {
  id: number
  address: string
  type: string
  workflow_state: string
  position: number
}

interface NotificationPolicy {
  frequency: 'immediately' | 'daily' | 'weekly' | 'never'
  notification: string
  category: string
}

const NOTIFICATION_CATEGORIES = [
  'Due Date',
  'Grading',
  'Invitation',
  'Announcement',
  'Discussion',
  'Conversation',
  'Submission Comment',
  'Content',
  'Registration',
  'Reminder',
  'Other',
]

function BellSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a6 6 0 00-6 6c0 3-1 5-2 6h16c-1-1-2-3-2-6a6 6 0 00-6-6z"/><path d="M8 16a2 2 0 004 0"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8l3 3 5-6"/></svg>; }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function SettingsSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="1.5"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1L4 10M10 4l1.1-1.1"/></svg>; }

function getIconForType(type: string) {
  switch (type) {
    case 'Conversation':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    case 'Submission':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
    case 'DiscussionTopic':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    case 'Announcement':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11a8 8 0 11-16 0 8 8 0 0116 0z"/><path d="M21 21l-4.35-4.35"/></svg>
    case 'Conference':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
    case 'Collaboration':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
    default:
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  }
}

function getIconClass(type: string) {
  switch (type) {
    case 'Conversation': return 'cx-notification-item__icon--info'
    case 'Submission': return 'cx-notification-item__icon--success'
    case 'DiscussionTopic': return 'cx-notification-item__icon--info'
    case 'Announcement': return 'cx-notification-item__icon--warning'
    case 'Conference': return 'cx-notification-item__icon--info'
    case 'Collaboration': return 'cx-notification-item__icon--info'
    default: return 'cx-notification-item__icon--info'
  }
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  if (diffDays > 7) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMinutes > 0) return `${diffMinutes}m ago`
  return 'Just now'
}

function extractPath(url: string): string {
  try {
    if (url.startsWith('/')) return url
    const u = new URL(url)
    return u.pathname
  } catch {
    return '#'
  }
}

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stream' | 'preferences'>('stream')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const { showToast } = useNotification()

  const { data: streamData, isLoading, refetch } = useCanvasQuery<StreamItem[]>(
    '/api/v1/users/self/activity_stream',
    { per_page: 50 } as any
  )

  const items = useMemo(() => Array.isArray(streamData) ? streamData : [], [streamData])

  // Communication channels & notification policies
  const { data: channelsData, isLoading: channelsLoading } = useCanvasQuery<CommChannel[]>(
    '/api/v1/users/self/communication_channels',
    {} as any
  )

  const channels = useMemo(() => Array.isArray(channelsData) ? channelsData : [], [channelsData])

  const [policiesMap, setPoliciesMap] = useState<Record<number, NotificationPolicy[]>>({})
  const [savingPolicies, setSavingPolicies] = useState(false)

  const fetchPolicies = useCallback(async () => {
    if (channels.length === 0) return
    const map: Record<number, NotificationPolicy[]> = {}
    await Promise.all(channels.map(async (ch) => {
      try {
        const data = await canvasFetch(`/api/v1/users/self/communication_channels/${ch.id}/notification_policies`)
        if (Array.isArray(data)) {
          map[ch.id] = data as NotificationPolicy[]
        } else if (Array.isArray(data?.notification_policies)) {
          map[ch.id] = data.notification_policies as NotificationPolicy[]
        }
      } catch {
        map[ch.id] = []
      }
    }))
    setPoliciesMap(map)
  }, [channels])

  useEffect(() => {
    if (activeTab === 'preferences') {
      fetchPolicies()
    }
  }, [activeTab, fetchPolicies])

  const getCategoryFrequency = (channelId: number, category: string): string => {
    const policies = policiesMap[channelId] || []
    // Find the first policy matching this category
    const policy = policies.find(p => p.category === category)
    return policy?.frequency || 'never'
  }

  const handleFrequencyChange = async (channelId: number, category: string, frequency: string) => {
    setPoliciesMap(prev => ({
      ...prev,
      [channelId]: (prev[channelId] || []).map(p => p.category === category ? { ...p, frequency: frequency as any } : p)
    }))
  }

  const savePreferences = async () => {
    setSavingPolicies(true)
    try {
      await Promise.all(Object.entries(policiesMap).map(async ([channelId, policies]) => {
        const body: Record<string, string> = {}
        policies.forEach((p, idx) => {
          body[`notification_policies[${idx}][frequency]`] = p.frequency
          body[`notification_policies[${idx}][notification]`] = p.notification
        })
        await canvasFetch(`/api/v1/users/self/communication_channels/${channelId}/notification_policies`, {
          method: 'PUT',
          body,
        })
      }))
      showToast({ title: 'Preferences saved', type: 'success' })
      await fetchPolicies()
    } catch (err: any) {
      showToast({ title: 'Failed to save preferences', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setSavingPolicies(false)
    }
  }

  // Web Push API Integration (S22-06)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    const isPushSupported = 'Notification' in window && 'serviceWorker' in navigator
    setPushSupported(isPushSupported)
    if (isPushSupported) {
      setPushPermission(Notification.permission)
    }
  }, [])

  const requestPushPermission = async () => {
    if (!pushSupported) return
    try {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)
      if (permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('ClassApex Notifications Enabled!', {
            body: 'You will now receive real-time push updates for grades, announcements, and assignments.',
            icon: '/classapex_logo_transparent.png',
            badge: '/classapex_logo_transparent.png',
            vibrate: [100, 50, 100],
            data: '/notifications',
          } as any)
        })
      }
    } catch (err) {
      console.error('Failed to request notification permission:', err)
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      await canvasFetch(`/api/v1/users/self/activity_stream/${id}`, { method: 'DELETE' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Failed to mark as read', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const handleMarkAllRead = async () => {
    const unreadItems = items.filter(i => !i.read_state)
    if (unreadItems.length === 0) return
    try {
      await Promise.all(unreadItems.map(i => canvasFetch(`/api/v1/users/self/activity_stream/${i.id}`, { method: 'DELETE' })))
      refetch()
      showToast({ title: 'All notifications marked as read', type: 'success' })
    } catch (err: any) {
      showToast({ title: 'Failed to mark all as read', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const filtered = useMemo(() => {
    let result = [...items]
    if (filterType !== 'all') result = result.filter(n => n.type === filterType)
    if (showUnreadOnly) result = result.filter(n => !n.read_state)
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(n => (n.title || '').toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q))
    }
    return result
  }, [items, searchTerm, filterType, showUnreadOnly])

  const stats = useMemo(() => ({
    total: items.length,
    unread: items.filter(i => !i.read_state).length,
    types: [...new Set(items.map(i => i.type))],
  }), [items])

  const handleClearFilters = () => { setSearchTerm(''); setFilterType('all'); setShowUnreadOnly(false) }

  if (isLoading) {
    return (
      <div className="cx-page">
        <div className="cx-loading" role="status" aria-label="Loading notifications">
          <div className="cx-loading__spinner" />
          <span className="cx-loading__text">Loading notifications…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-tabs" style={{ marginBottom: 16 }}>
        <button className={clsx('cx-tab', activeTab === 'stream' && 'cx-tab--active')} onClick={() => setActiveTab('stream')}>Activity Stream</button>
        <button className={clsx('cx-tab', activeTab === 'preferences' && 'cx-tab--active')} onClick={() => setActiveTab('preferences')}>Preferences</button>
      </div>

      {activeTab === 'stream' && (
        <>
          {stats.unread > 0 && (
            <div className="cx-page__header" style={{ justifyContent: 'flex-end', paddingTop: 0 }}>
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleMarkAllRead}><CheckSvg /> Mark All Read</button>
            </div>
          )}

          {/* Push Notification Setup */}
          {pushSupported && (
            <div
              className="cx-card"
              style={{
                padding: '20px 24px',
                marginBottom: 24,
                background: pushPermission === 'granted'
                  ? 'linear-gradient(135deg, var(--cx-color-primary-subtle) 0%, var(--cx-bg-surface-raised) 100%)'
                  : 'linear-gradient(135deg, var(--cx-color-warning-subtle) 0%, var(--cx-bg-surface-raised) 100%)',
                border: pushPermission === 'granted' ? '1px solid var(--cx-color-primary-hover)' : '1px solid var(--cx-color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                borderRadius: 16
              }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1, minWidth: 280 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: pushPermission === 'granted' ? 'var(--cx-color-primary)' : 'var(--cx-color-warning-subtle)', color: pushPermission === 'granted' ? '#fff' : 'var(--cx-color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BellSvg />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
                    {pushPermission === 'granted' ? 'PWA Real-Time Push Active' : 'Enable Live Push Notifications'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', lineHeight: 1.4 }}>
                    {pushPermission === 'granted'
                      ? 'Your browser is subscribed to push alerts via PWA.'
                      : 'Receive direct updates on grades, announcements, and instructor feedback via the Web Push API.'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {pushPermission === 'granted' ? (
                  <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: 20, background: 'var(--cx-color-success-subtle)', color: 'var(--cx-color-success)', fontWeight: 600 }}>✓ Subscribed</span>
                ) : pushPermission === 'denied' ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--cx-color-danger)', fontWeight: 600 }}>Notifications Blocked</span>
                ) : (
                  <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={requestPushPermission} style={{ height: 36, whiteSpace: 'nowrap' }}>Enable Notifications</button>
                )}
              </div>
            </div>
          )}

          <div className="cx-stats-grid">
            {[
              { label: 'Total', value: stats.total, icon: <BellSvg /> },
              { label: 'Unread', value: stats.unread, icon: <BellSvg /> },
              { label: 'Types', value: stats.types.length, icon: <BellSvg /> },
            ].map((s, i) => (
              <div key={i} className="cx-stat-card">
                <div className="cx-stat-card__icon">{s.icon}</div>
                <div className="cx-stat-card__body">
                  <div className="cx-stat-card__label">{s.label}</div>
                  <div className="cx-stat-card__value">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="cx-toolbar">
            <div className="cx-search">
              <SearchSvg />
              <input type="search" className="cx-search__input" placeholder="Search notifications..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="cx-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {stats.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label className="cx-toggle">
              <input type="checkbox" checked={showUnreadOnly} onChange={e => setShowUnreadOnly(e.target.checked)} />
              <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
              <span className="cx-toggle__label">Unread only</span>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="cx-empty">
              <BellSvg />
              <h3>No notifications</h3>
              <p>You're all caught up! Check back later for new updates.</p>
              <button className="cx-btn cx-btn--secondary" onClick={handleClearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="cx-notification-list">
              {filtered.map(item => (
                <div key={item.id} className={clsx('cx-notification-item', !item.read_state && 'cx-notification-item--unread')}>
                  <div className={clsx('cx-notification-item__icon', getIconClass(item.type))}>
                    {getIconForType(item.type)}
                  </div>
                  <div className="cx-notification-item__body" style={{ flex: 1, minWidth: 0 }}>
                    <Link to={extractPath(item.html_url)} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="cx-notification-item__title">{item.title || 'Notification'}</div>
                      <div className="cx-notification-item__message" dangerouslySetInnerHTML={{ __html: item.message || '' }} />
                    </Link>
                    <div className="cx-notification-item__time">{formatTime(item.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span className="cx-badge cx-badge--neutral">{item.type}</span>
                    {!item.read_state && (
                      <button
                        className="cx-btn cx-btn--ghost cx-btn--sm"
                        onClick={() => handleMarkRead(item.id)}
                        title="Mark as read"
                      >
                        <CheckSvg />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'preferences' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 'var(--cx-text-lg)', color: 'var(--cx-text-primary)' }}>Notification Preferences</h2>
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={savePreferences} disabled={savingPolicies || channelsLoading}>
              {savingPolicies ? 'Saving…' : <><SettingsSvg /> Save Preferences</>}
            </button>
          </div>

          {channelsLoading ? (
            <div className="cx-loading" role="status" aria-label="Loading preferences">
              <div className="cx-loading__spinner" />
              <span className="cx-loading__text">Loading preferences…</span>
            </div>
          ) : channels.length === 0 ? (
            <div className="cx-empty">
              <BellSvg />
              <h3>No communication channels</h3>
              <p>Add an email or SMS channel to configure notification preferences.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--cx-radius-lg)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--cx-text-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--cx-bg-surface)' }}>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'left', fontWeight: 600, color: 'var(--cx-text-primary)', whiteSpace: 'nowrap' }}>Category</th>
                    {channels.map(ch => (
                      <th key={ch.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center', fontWeight: 600, color: 'var(--cx-text-primary)', whiteSpace: 'nowrap', minWidth: 140 }}>
                        <div>{ch.type}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--cx-text-tertiary)', fontWeight: 500 }}>{ch.address}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NOTIFICATION_CATEGORIES.map((category, idx) => (
                    <tr key={category} style={{ background: idx % 2 === 0 ? 'transparent' : 'var(--cx-bg-surface-sunken, rgba(0,0,0,0.02))' }}>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--cx-border-subtle)', fontWeight: 500, color: 'var(--cx-text-primary)', whiteSpace: 'nowrap' }}>
                        {category}
                      </td>
                      {channels.map(ch => {
                        const freq = getCategoryFrequency(ch.id, category)
                        return (
                          <td key={ch.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center' }}>
                            <select
                              className="cx-select"
                              style={{ fontSize: 'var(--cx-text-xs)', padding: '4px 8px', minWidth: 100 }}
                              value={freq}
                              onChange={e => handleFrequencyChange(ch.id, category, e.target.value)}
                            >
                              <option value="immediately">Immediately</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="never">Never</option>
                            </select>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage;
