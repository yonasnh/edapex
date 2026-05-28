import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { extractPath } from '../utils/urlHelpers'
import { formatRelativeDate } from './date-utils'

export interface TodoItem {
  type: string
  assignment?: { id: number; name: string; due_at: string; points_possible: number }
  context_name: string
  context_type: string
  course_id: number
  html_url: string
}

interface TodoWidgetProps {
  items: TodoItem[]
  isLoading?: boolean
  maxItems?: number
}

export function TodoWidget({ items, isLoading = false, maxItems = 6 }: TodoWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return <div className="cx-skeleton cx-skeleton--list" />
  }

  if (!items || items.length === 0) {
    return <p className="cx-widget__empty">All caught up!</p>
  }

  const defaultVisible = 3
  const hasMore = items.length > defaultVisible
  const displayItems = isExpanded
    ? items.slice(0, maxItems)
    : items.slice(0, defaultVisible)

  return (
    <div>
      <ul className="cx-todo-list">
        {displayItems.map((item, i) => {
          const toUrl = item.assignment?.id && item.course_id
            ? `/courses/${item.course_id}/assignments/${item.assignment.id}`
            : ''

          const content = (
            <>
              <span className="cx-todo-item__type">
                {item.type === 'grading' ? '\uD83D\uDCDD' : '\uD83D\uDCCB'}
              </span>
              <div className="cx-todo-item__content">
                <span className="cx-todo-item__name">{item.assignment?.name || 'Item'}</span>
                <span className="cx-todo-item__context">{item.context_name}</span>
              </div>
              {item.assignment?.due_at && (
                <span className="cx-todo-item__due">
                  {formatRelativeDate(item.assignment.due_at)}
                </span>
              )}
            </>
          )

          return (
            <li key={item.assignment?.id ?? i} className="cx-todo-item">
              {toUrl ? (
                <Link to={toUrl} className="cx-todo-item__link">
                  {content}
                </Link>
              ) : (
                <Link to={extractPath(item.html_url)} className="cx-todo-item__link">
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
      {hasMore && (
        <button
          className="cx-widget__toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>Show Less ▴</>
          ) : (
            <>Show More ({items.length - defaultVisible} more) ▾</>
          )}
        </button>
      )}
    </div>
  )
}
