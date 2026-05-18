import React from 'react'
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
  if (isLoading) {
    return <div className="cx-skeleton cx-skeleton--list" />
  }

  if (!items || items.length === 0) {
    return <p className="cx-widget__empty">All caught up!</p>
  }

  const displayItems = items.slice(0, maxItems)

  return (
    <ul className="cx-todo-list">
      {displayItems.map((item, i) => (
        <li key={item.assignment?.id ?? i} className="cx-todo-item">
          <a href={item.html_url} className="cx-todo-item__link">
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
          </a>
        </li>
      ))}
    </ul>
  )
}
