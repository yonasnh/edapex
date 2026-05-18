import React, { memo, forwardRef } from 'react'
import { DiscussionTopic, User } from '@schoolapex/core'
import clsx from 'clsx'

const ChatIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const PinIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M12 2l-4 6h8z" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const LockedIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const TimeIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

interface DiscussionCardProps {
  discussion: DiscussionTopic
  currentUser: User
  variant?: 'dashboard' | 'course' | 'compact'
  showUnreadCount?: boolean
  showLastReply?: boolean
  showQuickActions?: boolean
  onReply?: (discussionId: string) => Promise<void>
  onMarkAsRead?: (discussionId: string) => Promise<void>
  onClick?: (discussion: DiscussionTopic) => void
  className?: string
  'data-testid'?: string
}

export const DiscussionCard = memo(
  forwardRef<HTMLDivElement, DiscussionCardProps>(
    (
      {
        discussion,
        currentUser,
        variant = 'dashboard',
        showUnreadCount = true,
        showLastReply = true,
        showQuickActions = true,
        onReply,
        onMarkAsRead,
        onClick,
        className,
        'data-testid': testId,
        ...props
      },
      ref
    ) => {
      const navigateToDiscussions = (_courseId: string) => {
        window.location.href = `/courses/${_courseId}/discussions`
      }

      const handleCardClick = () => {
        if (onClick) {
          onClick(discussion)
        } else {
          navigateToDiscussions('1')
        }
      }

      const handleReplyClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
          if (onReply) {
            await onReply(discussion.id)
          }
        } catch (error) {
          console.error('Reply action failed:', error)
        }
      }

      const handleMarkAsReadClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
          if (onMarkAsRead) {
            await onMarkAsRead(discussion.id)
          }
        } catch (error) {
          console.error('Mark as read action failed:', error)
        }
      }

      const getLastReplyInfo = () => {
        if (!discussion.last_reply_at) return null

        const lastReplyDate = new Date(discussion.last_reply_at)
        const now = new Date()
        const diffInHours = (now.getTime() - lastReplyDate.getTime()) / (1000 * 60 * 60)

        let timeAgo: string
        if (diffInHours < 1) {
          timeAgo = 'Just now'
        } else if (diffInHours < 24) {
          timeAgo = `${Math.floor(diffInHours)}h ago`
        } else if (diffInHours < 168) {
          timeAgo = `${Math.floor(diffInHours / 24)}d ago`
        } else {
          timeAgo = lastReplyDate.toLocaleDateString()
        }

        return {
          timeAgo,
          fullDate: lastReplyDate.toLocaleString()
        }
      }

      const getDiscussionTypeIcon = () => {
        switch (discussion.discussion_type) {
          case 'threaded':
            return <ChatIcon size={16} />
          case 'flat':
            return <ChatIcon size={16} />
          default:
            return <ChatIcon size={16} />
        }
      }

      const lastReplyInfo = getLastReplyInfo()
      const isCompact = variant === 'compact'
      const hasUnreadPosts = discussion.unread_count > 0
      const canReply = discussion.permissions.reply && !discussion.locked
      const isLocked = discussion.locked || discussion.locked_for_user

      return (
        <div
          ref={ref}
          className={clsx(
            'cx-card',
            'discussion-card',
            `discussion-card--${variant}`,
            {
              'discussion-card--unread': hasUnreadPosts,
              'discussion-card--pinned': discussion.pinned,
              'discussion-card--locked': isLocked,
              'discussion-card--announcement': discussion.is_announcement,
              'discussion-card--clickable': !!onClick || variant !== 'compact',
              'discussion-card--compact': isCompact,
            },
            className
          )}
          onClick={handleCardClick}
          data-testid={testId}
          role="article"
          aria-label={`Discussion: ${discussion.title}`}
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleCardClick()
            }
          }}
          {...props}
        >
          <div className="discussion-card__header">
            <div className="discussion-card__title-section">
              <div className="discussion-card__title-row">
                {discussion.pinned && (
                  <PinIcon size={16} className="discussion-card__pin-icon" />
                )}
                {isLocked && (
                  <LockedIcon size={16} className="discussion-card__lock-icon" />
                )}
                <h3 className="discussion-card__title" title={discussion.title}>
                  {discussion.title}
                </h3>
              </div>
              
              {discussion.user_name && (
                <span className="discussion-card__author">
                  by {discussion.user_name}
                </span>
              )}
            </div>
            
            <div className="discussion-card__badges">
              {discussion.is_announcement && (
                <span className="cx-badge cx-badge--info cx-badge--sm">
                  Announcement
                </span>
              )}
              
              {discussion.assignment_id && (
                <span className="cx-badge cx-badge--info cx-badge--sm">
                  Graded
                </span>
              )}
              
              {showUnreadCount && hasUnreadPosts && (
                <span className="cx-badge cx-badge--danger cx-badge--sm">
                  {discussion.unread_count} unread
                </span>
              )}
              
              {discussion.pinned && (
                <span className="cx-badge cx-badge--warning cx-badge--sm">
                  Pinned
                </span>
              )}
            </div>
          </div>

          {!isCompact && (
            <>
              {discussion.message && (
                <div className="discussion-card__message">
                  <p className="discussion-card__message-text">
                    {discussion.message.length > 150
                      ? `${discussion.message.substring(0, 150)}...`
                      : discussion.message}
                  </p>
                </div>
              )}

              <div className="discussion-card__stats">
                <div className="discussion-card__stat">
                  {getDiscussionTypeIcon()}
                  <span className="discussion-card__stat-value">
                    {discussion.discussion_subentry_count} replies
                  </span>
                </div>

                {showLastReply && lastReplyInfo && (
                  <div className="discussion-card__stat">
                    <TimeIcon size={16} />
                    <span 
                      className="discussion-card__stat-value"
                      title={lastReplyInfo.fullDate}
                    >
                      Last reply {lastReplyInfo.timeAgo}
                    </span>
                  </div>
                )}

                {discussion.require_initial_post && (
                  <div className="discussion-card__stat">
                    <span className="discussion-card__stat-label">
                      Initial post required
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {showQuickActions && !isCompact && (
            <div className="discussion-card__actions">
              {canReply && onReply && (
                <button
                  className="cx-btn cx-btn--primary cx-btn--sm"
                  onClick={handleReplyClick}
                  aria-label={`Reply to ${discussion.title}`}
                >
                  Reply
                </button>
              )}

              {hasUnreadPosts && onMarkAsRead && (
                <button
                  className="cx-btn cx-btn--secondary cx-btn--sm"
                  onClick={handleMarkAsReadClick}
                  aria-label={`Mark ${discussion.title} as read`}
                >
                  Mark as Read
                </button>
              )}

              {variant === 'dashboard' && (
                <button
                  className="cx-btn cx-btn--ghost cx-btn--sm"
                  onClick={handleCardClick}
                  aria-label={`View ${discussion.title}`}
                >
                  View
                </button>
              )}
            </div>
          )}

          <div className="sr-only">
            Discussion {discussion.title}.
            {discussion.user_name && ` Posted by ${discussion.user_name}.`}
            {discussion.is_announcement && ' This is an announcement.'}
            {discussion.pinned && ' This discussion is pinned.'}
            {isLocked && ' This discussion is locked.'}
            {hasUnreadPosts && ` ${discussion.unread_count} unread replies.`}
            {discussion.discussion_subentry_count > 0 && 
              ` Total ${discussion.discussion_subentry_count} replies.`}
            {lastReplyInfo && ` Last reply ${lastReplyInfo.timeAgo}.`}
          </div>
        </div>
      )
    }
  )
)

DiscussionCard.displayName = 'DiscussionCard'