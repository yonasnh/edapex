/**
 * SectionManagement — ClassApex LMS
 * =================================
 * Course-level section CRUD. Each course may have multiple sections (class periods).
 * Canvas REST API:
 *  GET/POST /api/v1/courses/:courseId/sections
 *  PUT/DELETE /api/v1/sections/:sectionId
 *  POST /api/v1/sections/:sectionId/crosslist/:newCourseId
 */

import React, { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'
import BulkOperationsBar from '../components/BulkOperationsBar'

export default function SectionManagementPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: '', start_at: '', end_at: '' })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showCrosslistModal, setShowCrosslistModal] = useState(false)
  const [crosslistCourseQuery, setCrosslistCourseQuery] = useState('')
  const [crosslistTargetCourseId, setCrosslistTargetCourseId] = useState('')
  const [crosslisting, setCrosslisting] = useState(false)

  const { data: sections, isLoading, refetch } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/sections` : '',
    { per_page: 50, include: ['students'] } as any
  )

  const { data: coursesData } = useCanvasQuery<any[]>(
    '/api/v1/courses',
    { per_page: 50, enrollment_type: 'teacher' } as any
  )

  const courses = useMemo(() => Array.isArray(coursesData) ? coursesData : [], [coursesData])

  const filteredCourses = useMemo(() => {
    if (!crosslistCourseQuery.trim()) return courses
    const q = crosslistCourseQuery.toLowerCase()
    return courses.filter((c: any) => String(c.name).toLowerCase().includes(q) || String(c.id).includes(q))
  }, [courses, crosslistCourseQuery])

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    if (sections) setSelectedIds(sections.map(s => String(s.id)))
  }

  const handleSelectNone = () => setSelectedIds([])

  const handleBulkDelete = async (ids: string[]) => {
    const confirmed = await showConfirm({
      title: `Delete ${ids.length} Section${ids.length > 1 ? 's' : ''}?`,
      message: 'All enrollments in deleted sections will be moved to the default section.',
      type: 'danger'
    })
    if (!confirmed) return
    try {
      await Promise.all(ids.map(id => canvasFetch(`/api/v1/sections/${id}`, { method: 'DELETE' })))
      showToast({ title: 'Deleted', type: 'success' })
      setSelectedIds([])
      refetch()
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleBulkCrosslist = async (ids: string[]) => {
    if (!crosslistTargetCourseId) {
      showToast({ title: 'Select a target course', type: 'error' })
      return
    }
    setCrosslisting(true)
    try {
      await Promise.all(ids.map(id =>
        canvasFetch(`/api/v1/sections/${id}/crosslist/${crosslistTargetCourseId}`, { method: 'POST' })
      ))
      showToast({ title: 'Cross-listed', type: 'success' })
      setShowCrosslistModal(false)
      setCrosslistTargetCourseId('')
      setCrosslistCourseQuery('')
      setSelectedIds([])
      refetch()
    } catch (err: any) {
      showToast({ title: 'Cross-list failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setCrosslisting(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { showToast({ title: 'Name is required', type: 'error' }); return }
    try {
      const payload: any = { name: form.name.trim() }
      if (form.start_at) payload.start_at = form.start_at
      if (form.end_at) payload.end_at = form.end_at
      if (editing?.id) {
        await canvasFetch(`/api/v1/sections/${editing.id}`, { method: 'PUT', body: payload })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/sections`, { method: 'POST', body: payload })
      }
      showToast({ title: `Section ${editing?.id ? 'updated' : 'created'}`, type: 'success' })
      setEditing(null)
      setForm({ name: '', start_at: '', end_at: '' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({ title: 'Delete Section?', message: 'All enrollments in this section will be moved to the default section.', type: 'danger' })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/sections/${id}`, { method: 'DELETE' })
      showToast({ title: 'Deleted', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Sections</h2>
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--cx-text-tertiary)' }}>You do not have permission.</p>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Sections</h2>
        <button className="cx-btn cx-btn--primary" onClick={() => { setEditing({}); setForm({ name: '', start_at: '', end_at: '' }) }}>+ New Section</button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 64, borderRadius: 8 }} />)}
        </div>
      ) : !sections || sections.length === 0 ? (
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--cx-text-tertiary)' }}>No sections.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sections.map(s => (
            <div key={s.id} className="cx-card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(String(s.id))}
                    onChange={() => toggleSelection(String(s.id))}
                    aria-label={`Select ${s.name}`}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--cx-text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                      {s.sis_section_id ? `SIS ID: ${s.sis_section_id} · ` : ''}
                      {s.students_count !== undefined ? `${s.students_count} students` : `${(s.students || []).length} students`}
                      {s.start_at ? ` · Starts: ${new Date(s.start_at).toLocaleDateString()}` : ''}
                      {s.end_at ? ` · Ends: ${new Date(s.end_at).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { setEditing(s); setForm({ name: s.name, start_at: s.start_at ? s.start_at.slice(0, 10) : '', end_at: s.end_at ? s.end_at.slice(0, 10) : '' }) }}>Edit</button>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDelete(s.id)} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BulkOperationsBar
        items={sections || []}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectNone={handleSelectNone}
        itemName="sections"
        actions={[
          {
            id: 'delete',
            label: 'Delete',
            variant: 'danger',
            confirmMessage: 'Are you sure you want to delete the selected sections?',
            onClick: handleBulkDelete,
          },
          {
            id: 'crosslist',
            label: 'Cross-list',
            variant: 'primary',
            onClick: () => setShowCrosslistModal(true),
          },
        ]}
      />

      {/* Edit/Create Modal */}
      {editing && (
        <div className="cx-modal-overlay" onClick={() => setEditing(null)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">{editing.id ? 'Edit Section' : 'New Section'}</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Name *</label>
                <input type="text" className="cx-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Start Date</label>
                <input type="date" className="cx-input" value={form.start_at} onChange={e => setForm(p => ({ ...p, start_at: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>End Date</label>
                <input type="date" className="cx-input" value={form.end_at} onChange={e => setForm(p => ({ ...p, end_at: e.target.value }))} />
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Cross-list Modal */}
      {showCrosslistModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCrosslistModal(false)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">Cross-list Sections</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCrosslistModal(false)}>✕</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', margin: 0 }}>
                Cross-list {selectedIds.length} selected section{selectedIds.length > 1 ? 's' : ''} to a target course.
              </p>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Search Course</label>
                <input
                  type="text"
                  className="cx-input"
                  placeholder="Type to search courses..."
                  value={crosslistCourseQuery}
                  onChange={e => setCrosslistCourseQuery(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid var(--cx-border-subtle)', borderRadius: 8 }}>
                {filteredCourses.length === 0 ? (
                  <p style={{ padding: 16, fontSize: '0.875rem', color: 'var(--cx-text-tertiary)', margin: 0 }}>No courses found.</p>
                ) : (
                  filteredCourses.map((c: any) => (
                    <label
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--cx-border-subtle)',
                        background: crosslistTargetCourseId === String(c.id) ? 'var(--cx-bg-hover)' : 'transparent',
                      }}
                    >
                      <input
                        type="radio"
                        name="targetCourse"
                        checked={crosslistTargetCourseId === String(c.id)}
                        onChange={() => setCrosslistTargetCourseId(String(c.id))}
                      />
                      <span style={{ fontSize: '0.875rem', color: 'var(--cx-text-primary)' }}>{c.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginLeft: 'auto' }}>ID: {c.id}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowCrosslistModal(false)}>Cancel</button>
              <button
                className="cx-btn cx-btn--primary"
                disabled={!crosslistTargetCourseId || crosslisting}
                onClick={() => handleBulkCrosslist(selectedIds)}
              >
                {crosslisting ? 'Cross-listing…' : 'Cross-list'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
