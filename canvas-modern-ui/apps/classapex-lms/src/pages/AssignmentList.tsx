import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge } from '@schoolapex/components'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { SubmissionStatus } from '../widgets/SubmissionStatus'
import './assignment.css'

type SortKey = 'due_at' | 'name' | 'points_possible'
type FilterStatus = 'all' | 'open' | 'due_soon' | 'overdue' | 'submitted' | 'graded'

export default function AssignmentList() {
  const { courseId } = useParams<{ courseId: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortBy, setSortBy] = useState<SortKey>('due_at')

  const { data: assignments, isLoading } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/assignments` : '',
    { per_page: 50, include: ['submission', 'score_statistics'], enabled: !!courseId } as any
  )

  const filtered = useMemo(() => {
    if (!assignments) return []

    let result = [...assignments]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a => a.name?.toLowerCase().includes(q))
    }

    const now = Date.now()
    result = result.filter(a => {
      const due = a.due_at ? new Date(a.due_at).getTime() : null
      const daysUntilDue = due ? Math.ceil((due - now) / 86400000) : null
      const submitted = a.submission?.submitted
      const graded = a.submission?.score !== undefined && a.submission?.score !== null

      switch (filterStatus) {
        case 'open': return due && daysUntilDue !== null && daysUntilDue > 2
        case 'due_soon': return due && daysUntilDue !== null && daysUntilDue <= 2 && daysUntilDue > 0
        case 'overdue': return due && daysUntilDue !== null && daysUntilDue < 0 && !submitted
        case 'submitted': return submitted
        case 'graded': return graded
        default: return true
      }
    })

    result.sort((a, b) => {
      if (sortBy === 'due_at') {
        return (a.due_at || '').localeCompare(b.due_at || '')
      }
      if (sortBy === 'name') return a.name?.localeCompare(b.name || '') || 0
      return (b.points_possible || 0) - (a.points_possible || 0)
    })

    return result
  }, [assignments, searchQuery, filterStatus, sortBy])

  if (isLoading) {
    return (
      <div className="cx-assignment-list">
        <div className="cx-skeleton cx-skeleton--list-banner" />
        <div className="cx-assignment-list__grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="cx-skeleton cx-skeleton--assignment-card" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="cx-assignment-list">
      <div className="cx-assignment-list__header">
        <h1 className="cx-assignment-list__title">Assignments</h1>
        <p className="cx-assignment-list__subtitle">
          {courseId ? `Course assignments` : 'All your assignments across courses'}
        </p>
      </div>

      <div className="cx-assignment-list__controls">
        <input
          type="search"
          className="cx-assignment-list__search"
          placeholder="Search assignments..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <select
          className="cx-assignment-list__select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as FilterStatus)}
          aria-label="Filter by status"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="due_soon">Due Soon</option>
          <option value="overdue">Overdue</option>
          <option value="submitted">Submitted</option>
          <option value="graded">Graded</option>
        </select>

        <select
          className="cx-assignment-list__select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          aria-label="Sort by"
        >
          <option value="due_at">Due Date</option>
          <option value="name">Name</option>
          <option value="points_possible">Points</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="cx-assignment-list__empty">
          <p className="cx-assignment-list__empty-text">No assignments match your filters</p>
          <p className="cx-assignment-list__empty-hint">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <p className="cx-assignment-list__count">{filtered.length} assignment{filtered.length !== 1 ? 's' : ''}</p>
          <div className="cx-assignment-list__grid">
            {filtered.map(a => {
              const due = a.due_at ? new Date(a.due_at) : null
              const isPast = due && due < new Date()
              const daysDue = due ? Math.ceil((due.getTime() - Date.now()) / 86400000) : null
              const submitted = a.submission?.submitted
              const statusBadge = !due ? 'default' : isPast ? 'danger' : daysDue !== null && daysDue <= 2 ? 'warning' : 'primary'
              const statusLabel = !due ? 'No Due Date' : isPast ? 'Overdue' : daysDue !== null && daysDue <= 2 ? 'Due Soon' : 'Open'

              const subStatus = submitted
                ? (a.submission?.score !== undefined ? 'graded' : 'submitted')
                : isPast ? 'missing' : 'unsubmitted'

              const courseCode = courseId ? '' : a.course_code || ''

              return (
                <Link
                  key={a.id}
                  to={`/courses/${courseId || a.course_id}/assignments/${a.id}`}
                  className="cx-assignment-card"
                >
                  <div className="cx-assignment-card__top">
                    <h3 className="cx-assignment-card__name">{a.name}</h3>
                    <Badge variant={statusBadge} size="sm">{statusLabel}</Badge>
                  </div>
                  <div className="cx-assignment-card__meta">
                    <span className="cx-assignment-card__points">{a.points_possible} pts</span>
                    {due && (
                      <span className="cx-assignment-card__due">
                        Due: {due.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {courseCode && (
                    <span className="cx-assignment-card__course">{courseCode}</span>
                  )}
                  <div className="cx-assignment-card__footer">
                    <SubmissionStatus status={subStatus} grade={a.submission?.score} pointsPossible={a.points_possible} size="sm" />
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
