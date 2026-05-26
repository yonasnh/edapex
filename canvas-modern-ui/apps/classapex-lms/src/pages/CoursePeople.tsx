/**
 * CoursePeople — ClassApex LMS (S21)
 * =====================================
 * Canvas REST API:
 *  GET    /api/v1/courses/:courseId/users?enrollment_type[]=...
 *  POST   /api/v1/courses/:courseId/enrollments
 *  DELETE /api/v1/courses/:courseId/enrollments/:enrollmentId
 */

import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

interface User {
  id: number
  name: string
  sortable_name: string
  email?: string
  avatar_url?: string
  enrollments?: { id: number; type: string; role: string; enrollment_state: string }[]
}

const ROLE_OPTIONS = [
  { value: 'StudentEnrollment', label: 'Student' },
  { value: 'TeacherEnrollment', label: 'Teacher' },
  { value: 'TaEnrollment', label: 'TA' },
  { value: 'ObserverEnrollment', label: 'Observer' },
  { value: 'DesignerEnrollment', label: 'Designer' },
]

export default function CoursePeoplePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [filterRole, setFilterRole] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ userId: '', role: 'StudentEnrollment', sectionId: '' })
  const [adding, setAdding] = useState(false)

  const { data: users, isLoading, refetch } = useCanvasQuery<User[]>(
    courseId ? `/api/v1/courses/${courseId}/users` : '',
    { per_page: 100, include: ['email', 'avatar_url', 'enrollments'] } as any
  )

  const { data: sections } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/sections` : '',
    { per_page: 50 }
  )

  const filtered = useMemo(() => {
    let list = users || []
    if (filterRole !== 'all') {
      list = list.filter(u => u.enrollments?.some(e => e.type === filterRole))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    }
    return list
  }, [users, filterRole, search])

  const handleRemove = async (user: User) => {
    const enrollment = user.enrollments?.find(e => e.enrollment_state !== 'deleted')
    if (!enrollment) return
    const confirmed = await showConfirm({
      title: 'Remove Enrollment?',
      message: `Remove ${user.name} from this course?`,
      type: 'danger',
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/enrollments/${enrollment.id}`, { method: 'DELETE' })
      showToast({ title: 'Enrollment removed', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Removal failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleConclude = async (user: User) => {
    const enrollment = user.enrollments?.find(e => e.enrollment_state === 'active')
    if (!enrollment) return
    const confirmed = await showConfirm({
      title: 'Conclude Enrollment?',
      message: `Conclude ${user.name}'s enrollment? They will lose access to course content.`,
      type: 'warning',
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/enrollments/${enrollment.id}`, {
        method: 'PUT', body: { enrollment: { state: 'completed' } }
      })
      showToast({ title: 'Enrollment concluded', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Conclude failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleReactivate = async (user: User) => {
    const enrollment = user.enrollments?.find(e => e.enrollment_state === 'completed')
    if (!enrollment) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/enrollments/${enrollment.id}`, {
        method: 'PUT', body: { enrollment: { state: 'active' } }
      })
      showToast({ title: 'Enrollment reactivated', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Reactivation failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleAdd = async () => {
    if (!addForm.userId.trim()) {
      showToast({ title: 'User ID is required', type: 'error' })
      return
    }
    setAdding(true)
    try {
      const payload: any = {
        enrollment: {
          user_id: addForm.userId.trim(),
          type: addForm.role,
          enrollment_state: 'active',
        },
      }
      if (addForm.sectionId) payload.enrollment.course_section_id = addForm.sectionId
      await canvasFetch(`/api/v1/courses/${courseId}/enrollments`, { method: 'POST', body: payload })
      showToast({ title: 'Enrollment added', type: 'success' })
      setShowAdd(false)
      setAddForm({ userId: '', role: 'StudentEnrollment', sectionId: '' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Add failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setAdding(false)
    }
  }

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <div className="cx-page__header" style={{ paddingTop: 0 }}>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>People</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <p>You do not have permission to manage course enrollments.</p>
          <Link to={`/courses/${courseId}`} className="cx-btn cx-btn--secondary" style={{ marginTop: 12 }}>Back to Course</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>People</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>{filtered.length} enrolled</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="text" className="cx-input cx-btn--sm" placeholder="Search people..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
          <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowAdd(true)}>+ Add People</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={`cx-btn cx-btn--sm ${filterRole === 'all' ? 'cx-btn--primary' : 'cx-btn--secondary'}`} onClick={() => setFilterRole('all')}>All</button>
        {ROLE_OPTIONS.map(r => (
          <button key={r.value} className={`cx-btn cx-btn--sm ${filterRole === r.value ? 'cx-btn--primary' : 'cx-btn--secondary'}`} onClick={() => setFilterRole(r.value)}>{r.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4].map(i => <div key={i} className="cx-skeleton" style={{ height: 56, borderRadius: 10 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <p>No people found.</p>
        </div>
      ) : (
        <div className="cx-table-container">
          <table className="cx-table" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="cx-table__row">
                  <td className="cx-table__cell cx-table__cell--name">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} /> : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cx-color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>{user.name.charAt(0)}</div>}
                      {user.name}
                    </div>
                  </td>
                  <td className="cx-table__cell cx-table__cell--muted">{user.email || '—'}</td>
                  <td className="cx-table__cell">
                    {user.enrollments?.map(e => (
                      <span key={e.id} className="cx-badge" style={{ fontSize: '0.6875rem', marginRight: 4, background: e.enrollment_state === 'completed' ? 'rgba(217,119,6,0.12)' : e.type === 'StudentEnrollment' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)', color: e.enrollment_state === 'completed' ? 'var(--cx-color-warning, #d97706)' : e.type === 'StudentEnrollment' ? '#059669' : 'var(--cx-color-primary)' }}>
                        {ROLE_OPTIONS.find(r => r.value === e.type)?.label || e.role}
                        {e.enrollment_state === 'completed' && ' (Concluded)'}
                      </span>
                    ))}
                  </td>
                  <td className="cx-table__cell cx-table__cell--actions">
                    <div style={{ display: 'flex', gap: 6 }}>
                      {user.enrollments?.some(e => e.enrollment_state === 'active') && (
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleConclude(user)} title="Conclude">Conclude</button>
                      )}
                      {user.enrollments?.some(e => e.enrollment_state === 'completed') && (
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleReactivate(user)} title="Reactivate">Reactivate</button>
                      )}
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleRemove(user)} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="cx-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">Add People</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>User ID or SIS ID *</label>
                <input type="text" className="cx-input" value={addForm.userId} onChange={e => setAddForm(p => ({ ...p, userId: e.target.value }))} placeholder="Canvas User ID" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Role</label>
                <select className="cx-input" value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))} style={{ width: '100%' }}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Section (optional)</label>
                <select className="cx-input" value={addForm.sectionId} onChange={e => setAddForm(p => ({ ...p, sectionId: e.target.value }))} style={{ width: '100%' }}>
                  <option value="">All Sections</option>
                  {(sections || []).map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowAdd(false)} disabled={adding}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleAdd} disabled={adding}>Add Enrollment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
