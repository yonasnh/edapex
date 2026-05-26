/**
 * Waitlist — ClassApex LMS (S17)
 * =================================
 * Canvas REST API:
 *  GET    /api/v1/courses/:id/enrollments?state[]=invited&state[]=creation_pending
 *  PUT    /api/v1/courses/:id/enrollments/:enrollmentId  — promote to active
 *  DELETE /api/v1/courses/:id/enrollments/:enrollmentId  — remove
 */

import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

interface Enrollment {
  id: number
  user_id: number
  course_id: number
  type: string
  enrollment_state: string
  user: {
    id: number
    name: string
    sortable_name: string
    short_name: string
    login_id?: string
    sis_user_id?: string
    email?: string
  }
  created_at: string
  updated_at: string
  start_at?: string
  end_at?: string
}

export default function WaitlistPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [actionLoading, setActionLoading] = useState(false)

  const { data: enrollments, isLoading, refetch } = useCanvasQuery<Enrollment[]>(
    courseId ? `/api/v1/courses/${courseId}/enrollments` : '',
    {
      state: ['invited', 'creation_pending'],
      type: ['StudentEnrollment'],
      per_page: 100,
      include: ['email'],
    } as any
  )

  const waitlisted = useMemo(() => enrollments || [], [enrollments])

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === waitlisted.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(waitlisted.map(e => e.id)))
    }
  }

  const handlePromote = async (ids: number[]) => {
    if (!courseId) return
    const confirmed = await showConfirm({
      title: 'Promote to Enrolled?',
      message: `This will activate ${ids.length} student enrollment(s).`,
      type: 'warning',
    })
    if (!confirmed) return
    setActionLoading(true)
    try {
      await Promise.all(ids.map(id =>
        canvasFetch(`/api/v1/courses/${courseId}/enrollments/${id}`, {
          method: 'PUT',
          body: { enrollment: { state: 'active' } },
        })
      ))
      showToast({ title: `${ids.length} student(s) promoted`, type: 'success' })
      setSelectedIds(new Set())
      refetch()
    } catch (err: any) {
      showToast({ title: 'Promotion failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemove = async (ids: number[]) => {
    if (!courseId) return
    const confirmed = await showConfirm({
      title: 'Remove from Waitlist?',
      message: `This will permanently delete ${ids.length} enrollment(s).`,
      type: 'danger',
    })
    if (!confirmed) return
    setActionLoading(true)
    try {
      await Promise.all(ids.map(id =>
        canvasFetch(`/api/v1/courses/${courseId}/enrollments/${id}`, { method: 'DELETE' })
      ))
      showToast({ title: `${ids.length} enrollment(s) removed`, type: 'success' })
      setSelectedIds(new Set())
      refetch()
    } catch (err: any) {
      showToast({ title: 'Removal failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <div className="cx-page__header" style={{ paddingTop: 0 }}>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Waitlist</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <p>You do not have permission to view the waitlist.</p>
          <Link to={`/courses/${courseId}`} className="cx-btn cx-btn--secondary" style={{ marginTop: 12 }}>Back to Course</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Waitlist</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
            Pending enrollments · {waitlisted.length} student{waitlisted.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to={`/courses/${courseId}`} className="cx-btn cx-btn--secondary cx-btn--sm">Back to Course</Link>
      </div>

      {/* Bulk actions */}
      {waitlisted.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={selectedIds.size === 0 || actionLoading} onClick={() => handlePromote(Array.from(selectedIds))}>
            Promote Selected ({selectedIds.size})
          </button>
          <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={selectedIds.size === 0 || actionLoading} onClick={() => handleRemove(Array.from(selectedIds))} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>
            Remove Selected
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <div key={i} className="cx-skeleton" style={{ height: 56, borderRadius: 10 }} />)}
        </div>
      ) : waitlisted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <p>No pending enrollments.</p>
          <p style={{ fontSize: '0.78rem' }}>Students in invited or creation-pending states will appear here.</p>
        </div>
      ) : (
        <div className="cx-table-container">
          <table className="cx-table" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selectedIds.size === waitlisted.length && waitlisted.length > 0} onChange={toggleSelectAll} />
                </th>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
                <th>Requested</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {waitlisted.map(e => (
                <tr key={e.id} className="cx-table__row">
                  <td>
                    <input type="checkbox" checked={selectedIds.has(e.id)} onChange={() => toggleSelect(e.id)} />
                  </td>
                  <td className="cx-table__cell cx-table__cell--name">{e.user?.name || 'Unknown'}</td>
                  <td className="cx-table__cell cx-table__cell--muted">{e.user?.email || e.user?.login_id || '—'}</td>
                  <td className="cx-table__cell">
                    <span className="cx-badge cx-badge--warning" style={{ fontSize: '0.6875rem' }}>
                      {e.enrollment_state}
                    </span>
                  </td>
                  <td className="cx-table__cell cx-table__cell--muted">
                    {e.created_at ? new Date(e.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="cx-table__cell cx-table__cell--actions">
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={actionLoading} onClick={() => handlePromote([e.id])}>Promote</button>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={actionLoading} onClick={() => handleRemove([e.id])} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
