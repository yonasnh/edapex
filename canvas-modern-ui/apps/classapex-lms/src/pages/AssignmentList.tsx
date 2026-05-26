import React, { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge } from '@schoolapex/components'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { useRole } from '../contexts/RoleContext'
import { SubmissionStatus } from '../widgets/SubmissionStatus'
import AssignmentEditModal from './AssignmentEditModal'
import './assignment.css'

type SortKey = 'due_at' | 'name' | 'points_possible'
type FilterStatus = 'all' | 'open' | 'due_soon' | 'overdue' | 'submitted' | 'graded'

export default function AssignmentList() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()

  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortBy, setSortBy] = useState<SortKey>('due_at')
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  const { data: assignments, isLoading: assignmentsLoading, refetch } = useCanvasQuery<any[]>(
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

  const handleDelete = async (assignment: any) => {
    const confirmed = await showConfirm({
      title: 'Delete Assignment?',
      message: `This will permanently remove "${assignment.name}". Students will lose access to any submissions.`,
      type: 'danger',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${activeCourseId}/assignments/${assignment.id}`, { method: 'DELETE' })
      showToast({ title: 'Assignment deleted', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Failed to delete', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const handleDuplicate = async (assignment: any) => {
    try {
      const payload: Record<string, any> = {
        assignment: {
          name: `${assignment.name} (Copy)`,
          description: assignment.description || '',
          points_possible: assignment.points_possible ?? 0,
          grading_type: assignment.grading_type || 'points',
          submission_types: Array.isArray(assignment.submission_types) ? assignment.submission_types : ['none'],
          published: false,
        }
      }
      if (assignment.due_at) payload.assignment.due_at = assignment.due_at
      if (assignment.lock_at) payload.assignment.lock_at = assignment.lock_at
      if (assignment.unlock_at) payload.assignment.unlock_at = assignment.unlock_at
      if (assignment.assignment_group_id) payload.assignment.assignment_group_id = String(assignment.assignment_group_id)
      await canvasFetch(`/api/v1/courses/${activeCourseId}/assignments`, { method: 'POST', body: payload })
      showToast({ title: 'Assignment duplicated', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Failed to duplicate', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

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

        {isTeacher && activeCourseId && (
          <button
            className="cx-btn cx-btn--primary"
            onClick={() => setShowCreateModal(true)}
            style={{ whiteSpace: 'nowrap' }}
          >
            + New Assignment
          </button>
        )}
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
                <div
                  key={a.id}
                  className="cx-assignment-card"
                  style={{ position: 'relative' }}
                >
                  <Link
                    to={`/courses/${courseId || a.course_id}/assignments/${a.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}
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

                  {isTeacher && (
                    <div style={{
                      display: 'flex',
                      gap: 6,
                      paddingTop: 10,
                      marginTop: 'auto',
                      borderTop: '1px solid var(--cx-border-subtle)',
                    }}>
                      <button
                        className="cx-btn cx-btn--ghost cx-btn--sm"
                        onClick={e => { e.stopPropagation(); setEditingAssignment(a) }}
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        className="cx-btn cx-btn--ghost cx-btn--sm"
                        onClick={e => { e.stopPropagation(); handleDuplicate(a) }}
                        title="Duplicate"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      </button>
                      <button
                        className="cx-btn cx-btn--ghost cx-btn--sm"
                        onClick={e => { e.stopPropagation(); handleDelete(a) }}
                        title="Delete"
                        style={{ color: 'var(--cx-color-danger)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {(showCreateModal || editingAssignment) && (
        <AssignmentEditModal
          courseId={activeCourseId}
          assignment={editingAssignment}
          onClose={() => { setShowCreateModal(false); setEditingAssignment(null) }}
          onSaved={refetch}
        />
      )}
    </div>
  )
}
