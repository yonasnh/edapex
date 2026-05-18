import React from 'react'
import { Badge } from '@schoolapex/components'

interface ActivitySummaryItem {
  type: string
  unread_count: number
  count?: number
}

interface RecentActivityProps {
  items: ActivitySummaryItem[]
  isLoading?: boolean
}

export function RecentActivity({ items, isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return <div className="cx-skeleton cx-skeleton--list" />
  }

  if (!items || items.length === 0) {
    return <p className="cx-widget__empty">No recent activity</p>
  }

  return (
    <div className="cx-activity-summary">
      {items.map((item, i) => (
        <div key={i} className="cx-activity-row">
          <span className="cx-activity-row__type">{item.type?.replace(/_/g, ' ')}</span>
          <Badge variant="primary" size="sm" count={item.unread_count} />
        </div>
      ))}
    </div>
  )
}
