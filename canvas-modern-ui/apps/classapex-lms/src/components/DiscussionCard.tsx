import React from 'react';
import clsx from 'clsx';

function UserSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 17v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1"/><circle cx="10" cy="6" r="3"/></svg>; }
function PinSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M9.5 1.5L6 5 3 3l-1 1 3 3-2 3 2 2 3-2 3 3 1-1-2-3 3.5-3.5a1.5 1.5 0 000-2l-1-1a1.5 1.5 0 00-2 0z"/></svg>; }
function LockSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3.5" y="6" width="7" height="6" rx="1"/><path d="M5 6V4a2 2 0 014 0v2"/></svg>; }
function CheckSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M4.5 7l2 2 3-3.5"/></svg>; }
function TimeSvg() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 3.5v3l2 1.5"/></svg>; }
function ReplySvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8l5-5v3c4 0 6 2 7 5-2-2-4-3-7-3v3L2 8z"/></svg>; }
function HeartSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 12C3.5 9.5 1 7.3 1 5a3.5 3.5 0 016-2A3.5 3.5 0 0113 5c0 2.3-2.5 4.5-6 7z"/></svg>; }
function EyeSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z"/><circle cx="7" cy="7" r="1.5"/></svg>; }
function HeartFillSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 12C3.5 9.5 1 7.3 1 5a3.5 3.5 0 016-2A3.5 3.5 0 0113 5c0 2.3-2.5 4.5-6 7z"/></svg>; }

export interface DiscussionCardProps {
  id: string;
  title: string;
  content: string;
  author: { id: string; name: string; avatar?: string; role?: 'student' | 'teacher' | 'ta' | 'admin' };
  course?: { id: string; name: string; color?: string };
  createdAt: string;
  lastReplyAt?: string;
  replyCount: number;
  viewCount: number;
  likeCount: number;
  isLiked?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  isResolved?: boolean;
  isUnread?: boolean;
  tags?: string[];
  onClick?: () => void;
  onLike?: () => void;
  onReply?: () => void;
  className?: string;
  loading?: boolean;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({
  id, title, content, author, course, createdAt, lastReplyAt, replyCount, viewCount, likeCount,
  isLiked = false, isPinned = false, isLocked = false, isResolved = false, isUnread = false,
  tags = [], onClick, onLike, onReply, className, loading = false
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffDays > 7) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  const truncateContent = (text: string, maxLength = 150): string =>
    text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '...';

  if (loading) {
    return (
      <div className={clsx('cx-discussion-card', className)}>
        <div className="cx-discussion-card__header">
          <div className="cx-shimmer" style={{ width: 24, height: 24, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="cx-shimmer" style={{ width: '50%', marginBottom: 4 }} />
            <div className="cx-shimmer" style={{ width: '30%' }} />
          </div>
        </div>
        <div className="cx-shimmer" style={{ width: '90%', marginBottom: 6 }} />
        <div className="cx-shimmer" style={{ width: '60%' }} />
      </div>
    );
  }

  return (
    <div className={clsx('cx-discussion-card', className)} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}>
      <div className="cx-discussion-card__header">
        <div className="cx-discussion-card__titles">
          {isPinned && <span className="cx-discussion-card__pin"><PinSvg /></span>}
          {isLocked && <span className="cx-discussion-card__lock"><LockSvg /></span>}
          {isResolved && <span className="cx-discussion-card__resolved"><CheckSvg /></span>}
          <h3 className={clsx('cx-discussion-card__title', isUnread && 'cx-discussion-card__title--unread')}>{title}</h3>
          {isUnread && <span className="cx-discussion-card__unread-dot" />}
        </div>
      </div>

      <div className="cx-discussion-card__meta">
        <span className="cx-discussion-card__author">{author.name}</span>
        {author.role && <span className={clsx('cx-badge', author.role === 'teacher' ? 'cx-badge--info' : author.role === 'admin' ? 'cx-badge--danger' : 'cx-badge--neutral')}>{author.role}</span>}
        {course && <span className="cx-badge cx-badge--neutral">{course.name}</span>}
        <span><TimeSvg /> {formatDate(createdAt)}</span>
        {lastReplyAt && <span>• Last reply {formatDate(lastReplyAt)}</span>}
      </div>

      <p className="cx-discussion-card__excerpt">{truncateContent(content)}</p>

      {tags.length > 0 && (
        <div className="cx-group-card__tags" style={{ marginBottom: 8 }}>
          {tags.slice(0, 3).map((tag, i) => <span key={i} className="cx-badge cx-badge--neutral">{tag}</span>)}
          {tags.length > 3 && <span className="cx-group-card__more-tags">+{tags.length - 3} more</span>}
        </div>
      )}

      <div className="cx-discussion-card__footer">
        <div className="cx-discussion-card__stats" style={{ display: 'flex', gap: 16 }}>
          <span><ReplySvg /> {replyCount}</span>
          <span><EyeSvg /> {viewCount}</span>
          <span>{isLiked ? <HeartFillSvg /> : <HeartSvg />} {likeCount}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {onLike && (
            <button className={clsx('cx-btn cx-btn--ghost cx-btn--sm', isLiked && 'cx-discussion-card__action--liked')}
              onClick={e => { e.stopPropagation(); onLike(); }}>
              <HeartSvg /> {isLiked ? 'Liked' : 'Like'}
            </button>
          )}
          {onReply && !isLocked && (
            <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={e => { e.stopPropagation(); onReply(); }}>
              <ReplySvg /> Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;
