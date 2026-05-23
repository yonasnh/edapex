import React, { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge } from '@schoolapex/components'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { SubmissionStatus } from '../widgets/SubmissionStatus'
import './assignment.css'

type SortKey = 'due_at' | 'name' | 'points_possible'
type FilterStatus = 'all' | 'open' | 'due_soon' | 'overdue' | 'submitted' | 'graded'

export default function AssignmentList() {
  const { courseId } = useParams<{ courseId: string }>()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortBy, setSortBy] = useState<SortKey>('due_at')

  // Fetch active courses if we are on the global assignments page (no courseId in route)
  const { data: coursesData, isLoading: coursesLoading } = useCanvasQuery<any[]>(
    courseId ? '' : '/api/v1/users/self/courses',
    { enrollment_state: 'active' } as any,
    { enabled: !courseId }
  )

  const courses = useMemo(() => Array.isArray(coursesData) ? coursesData : [], [coursesData])

  // Automatically select the first course when courses load
  useEffect(() => {
    if (!courseId && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(String(courses[0].id))
    }
  }, [courses, courseId, selectedCourseId])

  const activeCourseId = courseId || selectedCourseId

  const { data: assignments, isLoading: assignmentsLoading } = useCanvasQuery<any[]>(
    activeCourseId ? `/api/v1/courses/${activeCourseId}/assignments` : '',
    { per_page: 50, include: ['submission', 'score_statistics'] } as any,
    { enabled: !!activeCourseId }
  )

  const courseMap = useMemo(() => {
    const map = new Map<number, { name: string; course_code: string }>()
    courses.forEach(c => {
      map.set(c.id, { name: c.name, course_code: c.course_code })
    })
    return map
  }, [courses])

  const isLoading = courseId
    ? (assignmentsLoading || !assignments)
    : (coursesLoading || !selectedCourseId || assignmentsLoading || !assignments)

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
      <div className="cx-assignment-list" data-testid="loading-container">
        <div className="cx-loading" role="status" aria-label="Loading assignments">
          <div className="cx-loading__spinner" data-testid="loading-spinner" />
          <span className="cx-loading__text">Loading assignments...</span>
        </div>
        <div className="cx-skeleton cx-skeleton--list-banner" style={{ marginTop: '24px' }} />
        <div className="cx-assignment-list__grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="cx-skeleton cx-skeleton--assignment-card" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="cx-assignment-list">


      <div className="cx-assignment-list__controls">
        {!courseId && courses.length > 0 && (
          <select
            className="cx-assignment-list__select"
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            aria-label="Select course"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        )}

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
          <div className="cx-assignment-list__grid" data-testid="assignments-list">
            {filtered.map(a => {
              const due = a.due_at ? new Date(a.due_at) : null
              const isPast = due && due < new Date()
              const daysDue = due ? Math.ceil((due.getTime() - Date.now()) / 86400000) : null
              const submitted = a.submission?.submitted
              const statusBadge = submitted ? 'success' : !due ? 'default' : isPast ? 'danger' : daysDue !== null && daysDue <= 2 ? 'warning' : 'primary'
              const statusLabel = submitted ? 'Submitted' : !due ? 'No Due Date' : isPast ? 'Overdue' : daysDue !== null && daysDue <= 2 ? 'Due Soon' : 'Open'

              const subStatus = submitted
                ? (a.submission?.score !== undefined ? 'graded' : 'submitted')
                : isPast ? 'missing' : 'unsubmitted'

              const courseInfo = courseMap.get(Number(a.course_id))
              const courseCode = courseId ? '' : (courseInfo?.course_code || a.course_code || '')

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
