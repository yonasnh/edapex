import React, { useState, useMemo } from 'react';
import clsx from 'clsx';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: string;
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'info', title: 'Assignment Due Tomorrow', message: 'Programming Assignment 1 for CS101 is due tomorrow at 11:59 PM', timestamp: '2024-01-20T10:00:00Z', read: false, category: 'Assignment' },
  { id: '2', type: 'success', title: 'Grade Posted', message: 'Your grade for Math Quiz 3 has been posted: 95/100', timestamp: '2024-01-19T14:30:00Z', read: false, category: 'Grade' },
  { id: '3', type: 'warning', title: 'Course Update', message: 'The schedule for Web Development has been updated', timestamp: '2024-01-18T09:00:00Z', read: true, category: 'Course' },
  { id: '4', type: 'info', title: 'New Discussion Post', message: 'A new post has been added to the CS101 discussion forum', timestamp: '2024-01-17T16:45:00Z', read: true, category: 'Discussion' },
  { id: '5', type: 'danger', title: 'Missing Assignment', message: 'Lab Report 1 was due yesterday and has not been submitted', timestamp: '2024-01-16T23:59:00Z', read: false, category: 'Assignment' },
  { id: '6', type: 'success', title: 'Registration Confirmed', message: 'You have been registered for Physics Fundamentals (PHY101)', timestamp: '2024-01-15T11:20:00Z', read: true, category: 'Registration' },
  { id: '7', type: 'info', title: 'New Course Materials', message: 'Week 4 lecture slides and readings have been posted for ENG201', timestamp: '2024-01-14T08:00:00Z', read: false, category: 'Course' },
  { id: '8', type: 'warning', title: 'System Maintenance', message: 'Canvas will be down for maintenance on Saturday from 2-4 AM', timestamp: '2024-01-13T15:00:00Z', read: true, category: 'System' },
];

function BellSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a6 6 0 00-6 6c0 3-1 5-2 6h16c-1-1-2-3-2-6a6 6 0 00-6-6z"/><path d="M8 16a2 2 0 004 0"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8l3 3 5-6"/></svg>; }
function InfoSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 6v4"/><circle cx="8" cy="4.5" r="0.5" fill="currentColor"/></svg>; }
function CheckCircleSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function AlertSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a6 6 0 100 12A6 6 0 008 2z"/><path d="M8 5v3"/><circle cx="8" cy="10.5" r="0.5" fill="currentColor"/></svg>; }
function DangerSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/></svg>; }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }

const NotificationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = useMemo(() => {
    let filtered = [...mockNotifications];
    if (filterCategory !== 'all') filtered = filtered.filter(n => n.category === filterCategory);
    if (showUnreadOnly) filtered = filtered.filter(n => !n.read);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }
    return filtered;
  }, [searchTerm, filterCategory, showUnreadOnly]);

  const stats = useMemo(() => ({
    total: mockNotifications.length,
    unread: mockNotifications.filter(n => !n.read).length,
    categories: [...new Set(mockNotifications.map(n => n.category))],
  }), []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleSvg />;
      case 'warning': return <AlertSvg />;
      case 'danger': return <DangerSvg />;
      default: return <InfoSvg />;
    }
  };

  const getIconClass = (type: string) => {
    switch (type) {
      case 'success': return 'cx-notification-item__icon--success';
      case 'warning': return 'cx-notification-item__icon--warning';
      case 'danger': return 'cx-notification-item__icon--danger';
      default: return 'cx-notification-item__icon--info';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffDays > 7) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  const markAllRead = () => {};
  const handleClearFilters = () => { setSearchTerm(''); setFilterCategory('all'); setShowUnreadOnly(false); };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Notifications</h1>
          <p className="cx-page__subtitle">Stay updated with course activity and system announcements</p>
        </div>
        {stats.unread > 0 && (
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={markAllRead}><CheckSvg /> Mark All Read</button>
        )}
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Notifications', value: stats.total, icon: <BellSvg /> },
          { label: 'Unread', value: stats.unread, icon: <AlertSvg />, trend: stats.unread > 0 ? 'decrease' as const : 'neutral' as const },
          { label: 'Categories', value: stats.categories.length, icon: <InfoSvg /> },
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
        <select className="cx-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {stats.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="cx-toggle">
          <input type="checkbox" checked={showUnreadOnly} onChange={e => setShowUnreadOnly(e.target.checked)} />
          <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
          <span className="cx-toggle__label">Unread only</span>
        </label>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="cx-empty">
          <BellSvg />
          <h3>No notifications</h3>
          <p>You're all caught up! Check back later for new updates.</p>
          <button className="cx-btn cx-btn--secondary" onClick={handleClearFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className="cx-notification-list">
          {filteredNotifications.map(n => (
            <div key={n.id} className={clsx('cx-notification-item', !n.read && 'cx-notification-item--unread')}>
              <div className={clsx('cx-notification-item__icon', getIconClass(n.type))}>
                {getIcon(n.type)}
              </div>
              <div className="cx-notification-item__body">
                <div className="cx-notification-item__title">{n.title}</div>
                <div className="cx-notification-item__message">{n.message}</div>
                <div className="cx-notification-item__time">{formatTime(n.timestamp)}</div>
              </div>
              <div>
                <span className="cx-badge cx-badge--neutral">{n.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
