import React, { useState } from 'react'

interface CalendarEvent {
  id?: number
  title: string
  start_at?: string
  end_at?: string
  context_name?: string
  context_code?: string
  html_url?: string
}

interface UpcomingWidgetProps {
  events: CalendarEvent[]
  isLoading?: boolean
  maxItems?: number
}

export function UpcomingWidget({ events, isLoading = false, maxItems = 5 }: UpcomingWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return <div className="cx-skeleton cx-skeleton--list" />
  }

  if (!events || events.length === 0) {
    return <p className="cx-widget__empty">No upcoming events</p>
  }

  const defaultVisible = 3
  const hasMore = events.length > defaultVisible
  const displayEvents = isExpanded
    ? events.slice(0, maxItems)
    : events.slice(0, defaultVisible)

  return (
    <div>
      <ul className="cx-event-list">
        {displayEvents.map((event, i) => (
          <li key={event.id ?? i} className="cx-event-item">
            <div className="cx-event-item__date">
              <span className="cx-event-item__month">
                {event.start_at
                  ? new Date(event.start_at).toLocaleDateString('en', { month: 'short' })
                  : '\u2014'}
              </span>
              <span className="cx-event-item__day">
                {event.start_at ? new Date(event.start_at).getDate() : '\u2014'}
              </span>
            </div>
            <div className="cx-event-item__info">
              <span className="cx-event-item__title">{event.title}</span>
              <span className="cx-event-item__context">{event.context_name || ''}</span>
            </div>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          className="cx-widget__toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>Show Less ▴</>
          ) : (
            <>Show More ({events.length - defaultVisible} more) ▾</>
          )}
        </button>
      )}
    </div>
  )
}
