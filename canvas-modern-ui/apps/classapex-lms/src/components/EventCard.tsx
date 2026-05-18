import React from 'react';
import clsx from 'clsx';

function CalendarSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="3.5" width="15" height="14" rx="2"/><path d="M2.5 6.5h15"/><path d="M6 2v3M14 2v3"/></svg>; }
function TimeSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>; }
function MapPinSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1a4.5 4.5 0 00-4.5 4.5c0 3 4.5 7.5 4.5 7.5s4.5-4.5 4.5-7.5A4.5 4.5 0 007 1z"/><circle cx="7" cy="5.5" r="1.5"/></svg>; }
function UserSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 13v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1"/><circle cx="8" cy="5" r="3"/></svg>; }
function TaskSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 9l2 2 4-4"/></svg>; }
function ChatSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10a8 8 0 1114.7 4.7L18 18l-3.3-1.3A8 8 0 012 10z"/></svg>; }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1.5l2.5 2.5L5 11.5H2.5V9L10 1.5z"/></svg>; }
function LaunchSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 3l-5 5M11 3H7.5M11 3v3.5"/><path d="M9 7v3.5a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-6a.5.5 0 01.5-.5H6"/></svg>; }

export interface EventCardProps {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  type: 'assignment' | 'exam' | 'lecture' | 'meeting' | 'deadline' | 'other';
  course?: { id: string; name: string; color?: string };
  attendees?: number;
  isAllDay?: boolean;
  isRecurring?: boolean;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  onClick?: () => void;
  onEdit?: () => void;
  onJoin?: () => void;
  className?: string;
  loading?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  id, title, description, startDate, endDate, location, type, course, attendees,
  isAllDay = false, isRecurring = false, status = 'upcoming', priority = 'medium',
  onClick, onEdit, onJoin, className, loading = false
}) => {
  const getEventIcon = () => {
    switch (type) {
      case 'assignment': return <TaskSvg />;
      case 'exam': return <TaskSvg />;
      case 'lecture': return <UserSvg />;
      case 'meeting': return <ChatSvg />;
      case 'deadline': return <TimeSvg />;
      default: return <CalendarSvg />;
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    if (isAllDay) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getDuration = (): string => {
    if (!endDate || isAllDay) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return diffHours > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffMinutes}m`;
  };

  if (loading) {
    return (
      <div className={clsx('cx-event-card', className)}>
        <div className="cx-shimmer" style={{ width: 4, height: 40, borderRadius: 4 }} />
        <div style={{ flex: 1 }}>
          <div className="cx-shimmer" style={{ width: '60%', marginBottom: 4 }} />
          <div className="cx-shimmer" style={{ width: '40%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('cx-event-card', className)} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}>
      <div className="cx-event-card__dot" style={{ background: type === 'exam' ? 'var(--cx-status-overdue-fg)' : type === 'assignment' ? 'var(--cx-status-announce-fg)' : type === 'lecture' ? 'var(--cx-status-discussion-fg)' : type === 'meeting' ? 'var(--cx-status-quiz-fg)' : type === 'deadline' ? 'var(--cx-status-assignment-fg)' : 'var(--cx-text-muted)' }} />
      <div className="cx-event-card__body">
        <div className="cx-event-card__title">{title}</div>
        <div className="cx-event-card__meta">
          <span><TimeSvg /> {formatTime(startDate)}{getDuration() && ` (${getDuration()})`}</span>
          {location && <span><MapPinSvg /> {location}</span>}
          {course && <span className="cx-badge cx-badge--info">{course.name}</span>}
          {status !== 'upcoming' && <span className={clsx('cx-badge', status === 'ongoing' ? 'cx-badge--success' : status === 'completed' ? 'cx-badge--neutral' : status === 'cancelled' ? 'cx-badge--danger' : 'cx-badge--info')}>{status}</span>}
          {priority !== 'medium' && <span className={clsx('cx-badge', priority === 'high' ? 'cx-badge--danger' : 'cx-badge--success')}>{priority}</span>}
          {isRecurring && <span className="cx-badge cx-badge--info">Recurring</span>}
          {attendees && <span><UserSvg /> {attendees}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {onJoin && status === 'ongoing' && (
          <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={e => { e.stopPropagation(); onJoin(); }}>
            <LaunchSvg /> Join
          </button>
        )}
        {onEdit && (
          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={e => { e.stopPropagation(); onEdit(); }}>
            <EditSvg />
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
