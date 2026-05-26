/**
 * AssignmentEditModal — ClassApex LMS (S19)
 * ===========================================
 * Canvas REST API:
 *   POST/PUT /api/v1/courses/:courseId/assignments/:id
 *   GET/POST/PUT/DELETE /api/v1/courses/:courseId/assignments/:id/overrides
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import NewRceWrapper from '../components/NewRceWrapper'
import { useNotification } from '../hooks/useNotification'

export interface AssignmentEditModalProps {
  courseId: string
  assignment?: any | null
  onClose: () => void
  onSaved: () => void
}

const SUBMISSION_TYPE_OPTIONS = [
  { value: 'online_text_entry', label: 'Text Entry' },
  { value: 'online_url', label: 'Website URL' },
  { value: 'online_upload', label: 'File Upload' },
  { value: 'media_recording', label: 'Media Recording' },
  { value: 'student_annotation', label: 'Student Annotation' },
  { value: 'on_paper', label: 'On Paper' },
  { value: 'online_quiz', label: 'Online Quiz' },
  { value: 'external_tool', label: 'External Tool' },
  { value: 'none', label: 'No Submission' },
]

const GRADING_TYPE_OPTIONS = [
  { value: 'points', label: 'Points' },
  { value: 'percent', label: 'Percentage' },
  { value: 'letter_grade', label: 'Letter Grade' },
  { value: 'gpa_scale', label: 'GPA Scale' },
  { value: 'pass_fail', label: 'Pass/Fail' },
  { value: 'not_graded', label: 'Not Graded' },
]

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface Override {
  id?: number
  title?: string
  course_section_id?: number
  student_ids?: number[]
  due_at?: string
  unlock_at?: string
  lock_at?: string
}

export default function AssignmentEditModal({ courseId, assignment, onClose, onSaved }: AssignmentEditModalProps) {
  const isEdit = !!assignment
  const { showToast } = useNotification()
  const [saving, setSaving] = useState(false)

  const { data: assignmentGroups } = useCanvasQuery<any[]>(
    `/api/v1/courses/${courseId}/assignment_groups`,
    { per_page: 50 }
  )

  const { data: rubrics } = useCanvasQuery<any[]>(
    `/api/v1/courses/${courseId}/rubrics`,
    { per_page: 50 }
  )

  const { data: sections } = useCanvasQuery<any[]>(
    `/api/v1/courses/${courseId}/sections`,
    { per_page: 50 }
  )

  const { data: students } = useCanvasQuery<any[]>(
    `/api/v1/courses/${courseId}/users?enrollment_type[]=student`,
    { per_page: 100 }
  )

  const { data: graders } = useCanvasQuery<any[]>(
    `/api/v1/courses/${courseId}/users?enrollment_type[]=teacher&enrollment_type[]=ta`,
    { per_page: 100 }
  )

  const { data: overridesData } = useCanvasQuery<any[]>(
    isEdit ? `/api/v1/courses/${courseId}/assignments/${assignment.id}/overrides` : '',
    { per_page: 50 }
  )

  const [form, setForm] = useState({
    name: '',
    description: '',
    points_possible: 100,
    grading_type: 'points',
    due_at: '',
    lock_at: '',
    unlock_at: '',
    submission_types: ['online_text_entry', 'online_upload'] as string[],
    allowed_extensions: '',
    assignment_group_id: '',
    published: false,
    peer_reviews: false,
    automatic_peer_reviews: false,
    peer_review_count: 1,
    rubric_id: '',
    anonymous_grading: false,
    moderated_grading: false,
    grader_count: 2,
    final_grader_id: '',
    muted: false,
  })

  const [overrides, setOverrides] = useState<Override[]>([])
  const [showOverrides, setShowOverrides] = useState(false)

  useEffect(() => {
    if (isEdit && assignment) {
      setForm({
        name: assignment.name || '',
        description: assignment.description || '',
        points_possible: assignment.points_possible ?? 100,
        grading_type: assignment.grading_type || 'points',
        due_at: toDatetimeLocal(assignment.due_at),
        lock_at: toDatetimeLocal(assignment.lock_at),
        unlock_at: toDatetimeLocal(assignment.unlock_at),
        submission_types: Array.isArray(assignment.submission_types)
          ? assignment.submission_types.filter((t: string) =>
              ['none', 'on_paper', 'online_quiz', 'online_upload', 'online_text_entry',
               'online_url', 'external_tool', 'media_recording', 'student_annotation'].includes(t)
            )
          : ['none'],
        allowed_extensions: (assignment.allowed_extensions || []).join(', '),
        assignment_group_id: assignment.assignment_group_id ? String(assignment.assignment_group_id) : '',
        published: assignment.published ?? false,
        peer_reviews: assignment.peer_reviews ?? false,
        automatic_peer_reviews: assignment.automatic_peer_reviews ?? false,
        peer_review_count: assignment.peer_review_count ?? 1,
        rubric_id: assignment.rubric?.id ? String(assignment.rubric.id) : '',
        anonymous_grading: assignment.anonymous_grading ?? false,
        moderated_grading: assignment.moderated_grading ?? false,
        grader_count: assignment.grader_count ?? 2,
        final_grader_id: assignment.final_grader_id ? String(assignment.final_grader_id) : '',
        muted: assignment.muted ?? false,
      })
    }
  }, [isEdit, assignment])

  useEffect(() => {
    if (overridesData) {
      setOverrides(overridesData.map((o: any) => ({
        id: o.id,
        title: o.title,
        course_section_id: o.course_section_id,
        student_ids: o.student_ids,
        due_at: o.due_at,
        unlock_at: o.unlock_at,
        lock_at: o.lock_at,
      })))
    }
  }, [overridesData])

  const groups = useMemo(() => Array.isArray(assignmentGroups) ? assignmentGroups : [], [assignmentGroups])
  const rubricList = useMemo(() => Array.isArray(rubrics) ? rubrics : [], [rubrics])
  const sectionList = useMemo(() => Array.isArray(sections) ? sections : [], [sections])
  const _studentList = useMemo(() => Array.isArray(students) ? students : [], [students])
  const graderList = useMemo(() => Array.isArray(graders) ? graders : [], [graders])

  const handleToggleSubmissionType = (value: string) => {
    setForm(prev => {
      const set = new Set(prev.submission_types)
      if (set.has(value)) {
        set.delete(value)
      } else {
        // 'none' is mutually exclusive with all other submission types
        if (value === 'none') {
          set.clear()
          set.add('none')
        } else {
          set.delete('none')
          set.add(value)
        }
      }
      return { ...prev, submission_types: Array.from(set) }
    })
  }

  const addOverride = () => {
    setOverrides(prev => [...prev, {}])
  }

  const updateOverride = (index: number, patch: Partial<Override>) => {
    setOverrides(prev => {
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      return next
    })
  }

  const removeOverride = (index: number) => {
    setOverrides(prev => prev.filter((_, i) => i !== index))
  }

  const saveOverrides = async (assignmentId: number) => {
    // Delete removed overrides that had IDs
    const originalIds = new Set((overridesData || []).map((o: any) => o.id))
    const currentIds = new Set(overrides.map(o => o.id).filter(Boolean))
    const toDelete = Array.from(originalIds).filter(id => !currentIds.has(id))
    for (const id of toDelete) {
      try {
        await canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/overrides/${id}`, { method: 'DELETE' })
      } catch { /* ignore */ }
    }

    for (const o of overrides) {
      const payload: any = {}
      if (o.course_section_id) payload.assignment_override = { course_section_id: o.course_section_id }
      else if (o.student_ids && o.student_ids.length > 0) payload.assignment_override = { student_ids: o.student_ids }
      else continue

      if (o.due_at) payload.assignment_override.due_at = new Date(o.due_at).toISOString()
      if (o.unlock_at) payload.assignment_override.unlock_at = new Date(o.unlock_at).toISOString()
      if (o.lock_at) payload.assignment_override.lock_at = new Date(o.lock_at).toISOString()

      try {
        if (o.id) {
          await canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/overrides/${o.id}`, { method: 'PUT', body: payload })
        } else {
          await canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/overrides`, { method: 'POST', body: payload })
        }
      } catch (err: any) {
        showToast({ title: 'Override save failed', message: err.message, type: 'error' })
      }
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast({ title: 'Name is required', type: 'warning' })
      return
    }

    setSaving(true)
    try {
      const validSubmissionTypes = [
        'none', 'on_paper', 'online_quiz', 'online_upload', 'online_text_entry',
        'online_url', 'external_tool', 'media_recording', 'student_annotation'
      ]
      const sanitizedSubmissionTypes = form.submission_types
        .filter((t: string) => validSubmissionTypes.includes(t))
        .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i) // dedupe

      const payload: Record<string, any> = {
        assignment: {
          name: form.name.trim(),
          description: form.description,
          points_possible: Number(form.points_possible) || 0,
          grading_type: form.grading_type,
          submission_types: sanitizedSubmissionTypes.length > 0 ? sanitizedSubmissionTypes : ['none'],
          published: form.published,
          peer_reviews: form.peer_reviews,
          automatic_peer_reviews: form.automatic_peer_reviews,
          anonymous_grading: form.anonymous_grading,
          moderated_grading: form.moderated_grading,
        }
      }

      if (form.due_at) payload.assignment.due_at = new Date(form.due_at).toISOString()
      if (form.lock_at) payload.assignment.lock_at = new Date(form.lock_at).toISOString()
      if (form.unlock_at) payload.assignment.unlock_at = new Date(form.unlock_at).toISOString()
      if (form.assignment_group_id) payload.assignment.assignment_group_id = Number(form.assignment_group_id)
      if (form.rubric_id) payload.assignment.rubric_id = Number(form.rubric_id)

      if (form.submission_types.includes('online_upload') && form.allowed_extensions.trim()) {
        payload.assignment.allowed_extensions = form.allowed_extensions.split(',').map(s => s.trim()).filter(Boolean)
      }

      if (form.peer_reviews) {
        payload.assignment.peer_review_count = form.peer_review_count
      }

      if (form.moderated_grading) {
        payload.assignment.grader_count = Math.max(1, Number(form.grader_count) || 1)
        if (form.final_grader_id) {
          payload.assignment.final_grader_id = form.final_grader_id
        }
      }

      let assignmentId = assignment?.id
      if (isEdit) {
        await canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignment.id}`, { method: 'PUT', body: payload })
        showToast({ title: 'Assignment updated', type: 'success' })
      } else {
        const created = await canvasFetch(`/api/v1/courses/${courseId}/assignments`, { method: 'POST', body: payload })
        assignmentId = created.id
        showToast({ title: 'Assignment created', type: 'success' })
      }

      // Handle muted separately via post/hide grades if changed
      if (isEdit && assignmentId && form.muted !== (assignment?.muted ?? false)) {
        const ep = form.muted ? 'hide_grades' : 'post_grades'
        try {
          await canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/${ep}`, { method: 'POST', body: {} })
        } catch { /* mute state may not be toggleable */ }
      }

      // Save overrides
      if (assignmentId) {
        await saveOverrides(assignmentId)
      }

      onSaved()
      onClose()
    } catch (err: any) {
      console.error(err)
      showToast({ title: 'Failed to save assignment', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const showUploadOptions = form.submission_types.includes('online_upload')

  return (
    <div className="cx-modal-overlay" onClick={onClose}>
      <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="cx-modal__header">
          <h2 className="cx-modal__title">{isEdit ? 'Edit Assignment' : 'New Assignment'}</h2>
          <button className="cx-btn cx-btn--ghost" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg>
          </button>
        </div>

        <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-04)' }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>
              Name <span style={{ color: 'var(--cx-color-danger)' }}>*</span>
            </label>
            <input type="text" className="cx-input" style={{ width: '100%' }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Assignment name" />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Description</label>
            <NewRceWrapper value={form.description || ''} onChange={html => setForm(p => ({ ...p, description: html }))} placeholder="Instructions or details..." minHeight={120} />
          </div>

          {/* Points & Grading Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Points Possible</label>
              <input type="number" className="cx-input" style={{ width: '100%' }} min={0} value={form.points_possible} onChange={e => setForm(p => ({ ...p, points_possible: Number(e.target.value) }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Display Grade as</label>
              <select className="cx-input" style={{ width: '100%' }} value={form.grading_type} onChange={e => setForm(p => ({ ...p, grading_type: e.target.value }))}>
                {GRADING_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Assignment Group & Rubric */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Assignment Group</label>
              <select className="cx-input" style={{ width: '100%' }} value={form.assignment_group_id} onChange={e => setForm(p => ({ ...p, assignment_group_id: e.target.value }))}>
                <option value="">Default</option>
                {groups.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Rubric</label>
              <select className="cx-input" style={{ width: '100%' }} value={form.rubric_id} onChange={e => setForm(p => ({ ...p, rubric_id: e.target.value }))}>
                <option value="">None</option>
                {rubricList.map(r => <option key={r.id} value={String(r.id)}>{r.title}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Due</label>
              <input type="datetime-local" className="cx-input" style={{ width: '100%' }} value={form.due_at} onChange={e => setForm(p => ({ ...p, due_at: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Available From</label>
              <input type="datetime-local" className="cx-input" style={{ width: '100%' }} value={form.unlock_at} onChange={e => setForm(p => ({ ...p, unlock_at: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Until</label>
              <input type="datetime-local" className="cx-input" style={{ width: '100%' }} value={form.lock_at} onChange={e => setForm(p => ({ ...p, lock_at: e.target.value }))} />
            </div>
          </div>

          {/* Submission Types */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 8 }}>Submission Types</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUBMISSION_TYPE_OPTIONS.map(opt => (
                <label key={opt.value} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 8,
                  border: `1px solid ${form.submission_types.includes(opt.value) ? 'var(--cx-color-primary)' : 'var(--cx-border-subtle)'}`,
                  background: form.submission_types.includes(opt.value) ? 'var(--cx-color-primary-subtle)' : 'var(--cx-bg-surface)',
                  color: 'var(--cx-text-primary)', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none',
                }}>
                  <input type="checkbox" checked={form.submission_types.includes(opt.value)} onChange={() => handleToggleSubmissionType(opt.value)} style={{ accentColor: 'var(--cx-color-primary)', cursor: 'pointer' }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {showUploadOptions && (
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Allowed File Extensions</label>
              <input type="text" className="cx-input" style={{ width: '100%' }} value={form.allowed_extensions} onChange={e => setForm(p => ({ ...p, allowed_extensions: e.target.value }))} placeholder="pdf, docx, txt (comma separated)" />
            </div>
          )}

          {/* Toggles */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingTop: 4 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} style={{ accentColor: 'var(--cx-color-primary)', width: 18, height: 18 }} />
              Published
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.peer_reviews} onChange={e => setForm(p => ({ ...p, peer_reviews: e.target.checked }))} style={{ accentColor: 'var(--cx-color-primary)', width: 18, height: 18 }} />
              Peer Reviews
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.anonymous_grading} onChange={e => setForm(p => ({ ...p, anonymous_grading: e.target.checked }))} style={{ accentColor: 'var(--cx-color-primary)', width: 18, height: 18 }} />
              Anonymous Grading
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.moderated_grading} onChange={e => setForm(p => ({ ...p, moderated_grading: e.target.checked }))} style={{ accentColor: 'var(--cx-color-primary)', width: 18, height: 18 }} />
              Moderated Grading
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.muted} onChange={e => setForm(p => ({ ...p, muted: e.target.checked }))} style={{ accentColor: 'var(--cx-color-primary)', width: 18, height: 18 }} />
              Muted (Hide Grades)
            </label>
          </div>

          {form.anonymous_grading && (
            <div style={{ paddingLeft: 26, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', lineHeight: 1.5 }}>
              Student names will be hidden during grading. Identities are revealed after grades are posted.
            </div>
          )}

          {form.moderated_grading && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, paddingLeft: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-secondary)' }}>Number of Graders</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="cx-input"
                  style={{ width: 70 }}
                  value={form.grader_count}
                  onChange={e => setForm(p => ({ ...p, grader_count: Math.max(1, Math.min(10, Number(e.target.value))) }))}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 200 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-secondary)', whiteSpace: 'nowrap' }}>Final Grader</label>
                <select
                  className="cx-input"
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                  value={form.final_grader_id}
                  onChange={e => setForm(p => ({ ...p, final_grader_id: e.target.value }))}
                >
                  <option value="">Select grader…</option>
                  {graderList.map(g => (
                    <option key={g.id} value={String(g.id)}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {form.peer_reviews && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 26 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.automatic_peer_reviews} onChange={e => setForm(p => ({ ...p, automatic_peer_reviews: e.target.checked }))} style={{ accentColor: 'var(--cx-color-primary)' }} />
                Automatic
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>Count</label>
                <input type="number" min={1} max={10} className="cx-input" style={{ width: 60 }} value={form.peer_review_count} onChange={e => setForm(p => ({ ...p, peer_review_count: Math.max(1, Math.min(10, Number(e.target.value))) }))} />
              </div>
            </div>
          )}

          {/* Assignment Overrides */}
          {isEdit && (
            <div className="cx-card" style={{ padding: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Assignment Overrides</h4>
                <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowOverrides(s => !s)}>
                  {showOverrides ? 'Hide' : 'Show'} Overrides
                </button>
              </div>
              {showOverrides && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {overrides.map((o, i) => (
                    <div key={i} className="cx-card" style={{ padding: 12, background: 'var(--cx-bg-surface-raised, #f8fafc)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Section</label>
                          <select className="cx-input" style={{ width: '100%', fontSize: '0.8125rem' }} value={o.course_section_id || ''} onChange={e => updateOverride(i, { course_section_id: Number(e.target.value) || undefined, student_ids: undefined })}>
                            <option value="">All Sections</option>
                            {sectionList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Due</label>
                          <input type="datetime-local" className="cx-input" style={{ width: '100%', fontSize: '0.8125rem' }} value={toDatetimeLocal(o.due_at)} onChange={e => updateOverride(i, { due_at: e.target.value || undefined })} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>From</label>
                          <input type="datetime-local" className="cx-input" style={{ width: '100%', fontSize: '0.8125rem' }} value={toDatetimeLocal(o.unlock_at)} onChange={e => updateOverride(i, { unlock_at: e.target.value || undefined })} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Until</label>
                          <input type="datetime-local" className="cx-input" style={{ width: '100%', fontSize: '0.8125rem' }} value={toDatetimeLocal(o.lock_at)} onChange={e => updateOverride(i, { lock_at: e.target.value || undefined })} />
                        </div>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => removeOverride(i)} style={{ color: 'var(--cx-color-danger, #dc2626)' }} title="Remove">🗑</button>
                      </div>
                    </div>
                  ))}
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={addOverride} style={{ alignSelf: 'flex-start' }}>+ Add Override</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="cx-modal__footer">
          <button className="cx-btn cx-btn--secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="cx-btn cx-btn--primary" onClick={handleSubmit} disabled={saving || !form.name.trim()}>
            {saving ? 'Saving…' : isEdit ? 'Update Assignment' : 'Create Assignment'}
          </button>
        </div>
      </div>
    </div>
  )
}
