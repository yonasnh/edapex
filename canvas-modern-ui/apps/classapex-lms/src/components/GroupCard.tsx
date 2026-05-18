import React from 'react';
import clsx from 'clsx';

function GroupSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function UserSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 12v-1a2.5 2.5 0 00-2.5-2.5h-3A2.5 2.5 0 003 11v1"/><circle cx="7" cy="4" r="2.5"/></svg>; }
function ChatSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7a5.5 5.5 0 0110.2 3.2L12 12l-1.8-.8A5.5 5.5 0 011 7z"/></svg>; }
function TaskSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1" width="10" height="12" rx="1"/><path d="M5 7l2 2 3-4"/></svg>; }
function CalendarSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5"/><path d="M1.5 5.5h11"/><path d="M4.5 1v3M9.5 1v3"/></svg>; }
function MoreSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="11" cy="8" r="1"/></svg>; }
function JoinSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 9v3M8.5 10.5h3"/><path d="M11 11.5l-1-1"/><circle cx="6" cy="5" r="3"/><path d="M1 13c1-2 3-3 5-3"/></svg>; }
function LaunchSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L6 8M12 2H8.5M12 2v3.5"/><path d="M10 8v3a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h3"/></svg>; }

export interface GroupCardProps {
  id: string;
  name: string;
  description?: string;
  course?: { id: string; name: string; color?: string };
  memberCount: number;
  maxMembers?: number;
  isJoined?: boolean;
  isPublic?: boolean;
  role?: 'member' | 'leader' | 'admin';
  lastActivity?: string;
  upcomingEvents?: number;
  pendingTasks?: number;
  unreadMessages?: number;
  avatar?: string;
  tags?: string[];
  onClick?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onManage?: () => void;
  className?: string;
  loading?: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({
  id, name, description, course, memberCount, maxMembers, isJoined = false, isPublic = true, role,
  lastActivity, upcomingEvents = 0, pendingTasks = 0, unreadMessages = 0, avatar, tags = [],
  onClick, onJoin, onLeave, onManage, className, loading = false
}) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No recent activity';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffDays > 7) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Recently active';
  };

  const isFull = maxMembers ? memberCount >= maxMembers : false;
  const [menuOpen, setMenuOpen] = React.useState(false);

  if (loading) {
    return (
      <div className={clsx('cx-group-card', className)}>
        <div className="cx-group-card__header">
          <div className="cx-shimmer" style={{ width: 48, height: 48, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="cx-shimmer" style={{ width: '60%', marginBottom: 6 }} />
            <div className="cx-shimmer" style={{ width: '40%' }} />
          </div>
        </div>
        <div className="cx-shimmer" style={{ width: '100%', marginBottom: 8 }} />
        <div className="cx-shimmer" style={{ width: '80%' }} />
      </div>
    );
  }

  return (
    <div className={clsx('cx-group-card', className)} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}>
      <div className="cx-group-card__header">
        <div className="cx-group-card__avatar">
          {avatar ? <img src={avatar} alt={name} /> : <GroupSvg />}
        </div>
        <div className="cx-group-card__info">
          <h3 className="cx-group-card__name">{name}</h3>
          <div className="cx-group-card__membership">
            <UserSvg /> {memberCount}{maxMembers ? `/${maxMembers}` : ''} members
            {!isPublic && <span className="cx-badge cx-badge--neutral">Private</span>}
            {isJoined && role && <span className={clsx('cx-badge', role === 'leader' ? 'cx-badge--info' : role === 'admin' ? 'cx-badge--danger' : 'cx-badge--neutral')}>{role}</span>}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }} style={{ padding: '2px 4px' }}>
            <MoreSvg />
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 10, background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-03)', minWidth: 130, padding: '4px 0' }}
              onMouseLeave={() => setMenuOpen(false)}>
              {onClick && <MenuItem label="View Group" onClick={() => { setMenuOpen(false); onClick(); }} />}
              {isJoined && onLeave && <MenuItem label="Leave Group" onClick={() => { setMenuOpen(false); onLeave(); }} borderTop />}
              {(role === 'leader' || role === 'admin') && onManage && <MenuItem label="Manage Group" onClick={() => { setMenuOpen(false); onManage(); }} />}
            </div>
          )}
        </div>
      </div>

      <div className="cx-group-card__body">
        {description && <p className="cx-group-card__description">{description}</p>}
        {course && (
          <div className="cx-card__meta" style={{ marginTop: 0, marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: course.color || 'var(--cx-color-primary)' }} />
              {course.name}
            </span>
          </div>
        )}
        {tags.length > 0 && (
          <div className="cx-group-card__tags">
            {tags.slice(0, 3).map((tag, i) => <span key={i} className="cx-badge cx-badge--neutral">{tag}</span>)}
            {tags.length > 3 && <span className="cx-group-card__more-tags">+{tags.length - 3} more</span>}
          </div>
        )}
      </div>

      <div className="cx-group-card__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>
          <span>{formatDate(lastActivity)}</span>
          {isJoined && (
            <>
              {unreadMessages > 0 && <span><ChatSvg /> {unreadMessages}</span>}
              {pendingTasks > 0 && <span><TaskSvg /> {pendingTasks}</span>}
              {upcomingEvents > 0 && <span><CalendarSvg /> {upcomingEvents}</span>}
            </>
          )}
        </div>
        <div>
          {!isJoined && onJoin && !isFull && (
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={e => { e.stopPropagation(); onJoin(); }}><JoinSvg /> Join</button>
          )}
          {!isJoined && isFull && (
            <button className="cx-btn cx-btn--secondary cx-btn--sm" disabled>Group Full</button>
          )}
          {isJoined && onClick && (
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={e => { e.stopPropagation(); onClick(); }}><LaunchSvg /> Open</button>
          )}
        </div>
      </div>
    </div>
  );
};

function MenuItem({ icon, label, onClick, borderTop }: { icon?: React.ReactNode; label: string; onClick: () => void; borderTop?: boolean }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--cx-text-primary)', fontFamily: 'inherit', borderTop: borderTop ? '1px solid var(--cx-border-subtle)' : 'none' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cx-bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {icon} {label}
    </button>
  );
}

export default GroupCard;
