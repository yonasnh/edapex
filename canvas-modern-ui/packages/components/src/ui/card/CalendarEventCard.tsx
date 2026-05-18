import React, { memo, forwardRef } from 'react'
import { CalendarEvent, User } from '@schoolapex/core'
import clsx from 'clsx'

const CalendarIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const TimeIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const LocationIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const RepeatIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

const GroupIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const tagColorMap: Record<string, string> = {
  purple: 'info',
  blue: 'info',
  red: 'danger',
  cyan: 'info',
  green: 'success',
  'warm-gray': 'warning',
}

interface CalendarEventCardProps {
  event: CalendarEvent
  currentUser: User
  variant?: 'dashboard' | 'calendar' | 'compact' | 'agenda'
  showContext?: boolean
  showDescription?: boolean
  showQuickActions?: boolean
  onJoin?: (eventId: string) => Promise<void>
  onEdit?: (eventId: string) => Promise<void>
  onDelete?: (eventId: string) => Promise<void>
  onClick?: (event: CalendarEvent) => void
  className?: string
  'data-testid'?: string
}

export const CalendarEventCard = memo(
  forwardRef<HTMLDivElement, CalendarEventCardProps>(
    (
      {
        event,
        currentUser,
        variant = 'dashboard',
        showContext = true,
        showDescription = true,
        showQuickActions = true,
        onJoin,
        onEdit,
        onDelete,
        onClick,
        className,
        'data-testid': testId,
        ...props
      },
      ref
    ) => {
      const navigateToCourse = (courseId: string) => {
        window.location.href = `/courses/${courseId}`
      }
      const navigateToAssignment = (courseId: string, assignmentId: string) => {
        window.location.href = `/courses/${courseId}/assignments/${assignmentId}`
      }

      const handleCardClick = () => {
        if (onClick) {
          onClick(event)
        } else if (event.event_type === 'assignment' && event.assignment) {
          const courseId = event.context_code.replace('course_', '')
          navigateToAssignment(courseId, event.assignment.id)
        } else if (event.context_code.startsWith('course_')) {
          const courseId = event.context_code.replace('course_', '')
          navigateToCourse(courseId)
        }
      }

      const handleJoinClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
          if (onJoin) {
            await onJoin(event.id)
          }
        } catch (error) {
          console.error('Join action failed:', error)
        }
      }

      const handleEditClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
          if (onEdit) {
            await onEdit(event.id)
          }
        } catch (error) {
          console.error('Edit action failed:', error)
        }
      }

      const handleDeleteClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this event?')) {
          try {
            if (onDelete) {
              await onDelete(event.id)
            }
          } catch (error) {
            console.error('Delete action failed:', error)
          }
        }
      }

      const getEventTypeInfo = () => {
        switch (event.event_type) {
          case 'assignment':
            return { icon: <CalendarIcon size={16} />, label: 'Assignment', color: 'purple' }
          case 'discussion_topic':
            return { icon: <GroupIcon size={16} />, label: 'Discussion', color: 'blue' }
          case 'quiz':
            return { icon: <CalendarIcon size={16} />, label: 'Quiz', color: 'red' }
          case 'announcement':
            return { icon: <CalendarIcon size={16} />, label: 'Announcement', color: 'cyan' }
          case 'appointment_group':
            return { icon: <CalendarIcon size={16} />, label: 'Appointment', color: 'green' }
          default:
            return { icon: <CalendarIcon size={16} />, label: 'Event', color: 'warm-gray' }
        }
      }

      const formatDateTime = () => {
        const startDate = new Date(event.start_at)
        const endDate = event.end_at ? new Date(event.end_at) : null
        const now = new Date()
        
        if (event.all_day) {
          return {
            date: startDate.toLocaleDateString(),
            time: 'All day',
            isToday: startDate.toDateString() === now.toDateString(),
            isPast: startDate < now,
            isUpcoming: startDate > now
          }
        }

        const timeOptions: Intl.DateTimeFormatOptions = { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }

        const timeStr = endDate 
          ? `${startDate.toLocaleTimeString([], timeOptions)} - ${endDate.toLocaleTimeString([], timeOptions)}`
          : startDate.toLocaleTimeString([], timeOptions)

        return {
          date: startDate.toLocaleDateString(),
          time: timeStr,
          isToday: startDate.toDateString() === now.toDateString(),
          isPast: (endDate || startDate) < now,
          isUpcoming: startDate > now
        }
      }

      const eventTypeInfo = getEventTypeInfo()
      const dateTimeInfo = formatDateTime()
      const isCompact = variant === 'compact'
      const isAgenda = variant === 'agenda'
      const canJoin = event.appointment_group_id && !event.reserved && event.available_slots && event.available_slots > 0
      const canEdit = event.user?.id === currentUser.id || currentUser.roles.includes('teacher')
      const canDelete = canEdit

      return (
        <div
          ref={ref}
          className={clsx(
            'cx-card',
            'calendar-event-card',
            `calendar-event-card--${variant}`,
            `calendar-event-card--${event.event_type}`,
            {
              'calendar-event-card--all-day': event.all_day,
              'calendar-event-card--past': dateTimeInfo.isPast,
              'calendar-event-card--today': dateTimeInfo.isToday,
              'calendar-event-card--upcoming': dateTimeInfo.isUpcoming,
              'calendar-event-card--recurring': !!event.rrule,
              'calendar-event-card--appointment': event.appointment_group_id,
              'calendar-event-card--reserved': event.reserved,
              'calendar-event-card--clickable': !!onClick || variant !== 'compact',
              'calendar-event-card--compact': isCompact,
              'calendar-event-card--agenda': isAgenda,
            },
            className
          )}
          onClick={handleCardClick}
          data-testid={testId}
          role="article"
          aria-label={`Event: ${event.title}`}
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleCardClick()
            }
          }}
          {...props}
        >
          <div className="calendar-event-card__header">
            <div className="calendar-event-card__title-section">
              <div className="calendar-event-card__title-row">
                {eventTypeInfo.icon}
                <h3 className="calendar-event-card__title" title={event.title}>
                  {event.title}
                </h3>
                {event.rrule && (
                  <RepeatIcon size={16} className="calendar-event-card__repeat-icon" />
                )}
              </div>
              
              {showContext && event.context_name && (
                <span className="calendar-event-card__context">
                  {event.context_name}
                </span>
              )}
            </div>
            
            <div className="calendar-event-card__badges">
              <span className={clsx('cx-badge', `cx-badge--${tagColorMap[eventTypeInfo.color] || 'info'}`, 'cx-badge--sm')}>
                {eventTypeInfo.label}
              </span>
              
              {event.all_day && (
                <span className="cx-badge cx-badge--warning cx-badge--sm">
                  All Day
                </span>
              )}
              
              {event.reserved && (
                <span className="cx-badge cx-badge--success cx-badge--sm">
                  Reserved
                </span>
              )}
              
              {dateTimeInfo.isToday && (
                <span className="cx-badge cx-badge--info cx-badge--sm">
                  Today
                </span>
              )}
            </div>
          </div>

          <div className="calendar-event-card__datetime">
            <div className="calendar-event-card__datetime-item">
              <CalendarIcon size={16} />
              <span className="calendar-event-card__date">{dateTimeInfo.date}</span>
            </div>
            
            <div className="calendar-event-card__datetime-item">
              <TimeIcon size={16} />
              <span className="calendar-event-card__time">{dateTimeInfo.time}</span>
            </div>
          </div>

          {event.location_name && (
            <div className="calendar-event-card__location">
              <LocationIcon size={16} />
              <span className="calendar-event-card__location-text">
                {event.location_name}
                {event.location_address && `, ${event.location_address}`}
              </span>
            </div>
          )}

          {!isCompact && showDescription && event.description && (
            <div className="calendar-event-card__description">
              <p className="calendar-event-card__description-text">
                {event.description.length > 120
                  ? `${event.description.substring(0, 120)}...`
                  : event.description}
              </p>
            </div>
          )}

          {event.appointment_group_id && (
            <div className="calendar-event-card__appointment-info">
              {event.available_slots !== undefined && (
                <span className="calendar-event-card__slots">
                  {event.available_slots} slots available
                </span>
              )}
              {event.participants_per_appointment && (
                <span className="calendar-event-card__participants">
                  {event.participants_per_appointment} participants per slot
                </span>
              )}
            </div>
          )}

          {showQuickActions && !isCompact && (
            <div className="calendar-event-card__actions">
              {canJoin && onJoin && (
                <button
                  className="cx-btn cx-btn--primary cx-btn--sm"
                  onClick={handleJoinClick}
                  aria-label={`Join ${event.title}`}
                >
                  Reserve Slot
                </button>
              )}

              {canEdit && onEdit && (
                <button
                  className="cx-btn cx-btn--secondary cx-btn--sm"
                  onClick={handleEditClick}
                  aria-label={`Edit ${event.title}`}
                >
                  Edit
                </button>
              )}

              {canDelete && onDelete && (
                <button
                  className="cx-btn cx-btn--danger cx-btn--sm"
                  onClick={handleDeleteClick}
                  aria-label={`Delete ${event.title}`}
                >
                  Delete
                </button>
              )}

              {variant === 'dashboard' && (
                <button
                  className="cx-btn cx-btn--ghost cx-btn--sm"
                  onClick={handleCardClick}
                  aria-label={`View ${event.title}`}
                >
                  View
                </button>
              )}
            </div>
          )}

          <div className="sr-only">
            {eventTypeInfo.label} event {event.title}.
            {event.context_name && ` In ${event.context_name}.`}
            {event.all_day ? ' All day event' : ` At ${dateTimeInfo.time}`} on {dateTimeInfo.date}.
            {event.location_name && ` Located at ${event.location_name}.`}
            {event.rrule && ' This is a recurring event.'}
            {event.reserved && ' You have reserved a slot for this appointment.'}
            {dateTimeInfo.isToday && ' This event is today.'}
            {dateTimeInfo.isPast && ' This event has passed.'}
          </div>
        </div>
      )
    }
  )
)

CalendarEventCard.displayName = 'CalendarEventCard'