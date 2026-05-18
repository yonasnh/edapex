import React, { useState } from 'react'

interface AssignmentFormData {
  name: string
  description: string
  points_possible: number
  grading_type: 'points' | 'percent' | 'letter_grade' | 'gpa_scale' | 'pass_fail'
  due_at: string
  submission_types: string[]
  published: boolean
}

interface DateOverride {
  id: string
  sectionId: string
  dueAt: string
  unlockAt: string
  lockAt: string
}

interface AssignmentFormProps {
  initialData?: Partial<AssignmentFormData>
  courseId: string
  onSubmit: (data: AssignmentFormData) => void
  onCancel: () => void
  initialOverrides?: DateOverride[]
}

const MOCK_SECTIONS = [
  { id: 's1', name: 'Section A - Morning' },
  { id: 's2', name: 'Section B - Afternoon' },
  { id: 's3', name: 'Section C - Evening' },
  { id: 's4', name: 'Online Only' },
]

function PlusCircleSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4.5v5M4.5 7h5"/></svg>; }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3.5h10M5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M11 5v7a1 1 0 01-1 1H4a1 1 0 01-1-1V5"/></svg>; }

let overrideCounter = 0
function nextOverrideId() { return `override-${++overrideCounter}` }

const SUBMISSION_TYPE_OPTIONS = [
  { value: 'online_text_entry', label: 'Text Entry' },
  { value: 'online_upload', label: 'File Upload' },
  { value: 'online_url', label: 'URL' },
  { value: 'online_quiz', label: 'Quiz' },
  { value: 'external_tool', label: 'External Tool' },
  { value: 'none', label: 'No Submission' },
]

const GRADING_TYPE_OPTIONS = [
  { value: 'points', label: 'Points' },
  { value: 'percent', label: 'Percentage' },
  { value: 'letter_grade', label: 'Letter Grade' },
  { value: 'gpa_scale', label: 'GPA Scale' },
  { value: 'pass_fail', label: 'Pass/Fail' },
]

export default function AssignmentForm({ initialData, courseId, onSubmit, onCancel, initialOverrides }: AssignmentFormProps) {
  const [form, setForm] = useState<AssignmentFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    points_possible: initialData?.points_possible || 100,
    grading_type: initialData?.grading_type || 'points',
    due_at: initialData?.due_at || '',
    submission_types: initialData?.submission_types || ['online_text_entry'],
    published: initialData?.published ?? false,
  })
  const [overrides, setOverrides] = useState<DateOverride[]>(initialOverrides || [])
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof AssignmentFormData, value: any) => setForm(p => ({ ...p, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(form)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSubmissionType = (type: string) => {
    const current = form.submission_types
    if (current.includes(type)) {
      update('submission_types', current.filter(t => t !== type))
    } else {
      update('submission_types', [...current, type])
    }
  }

  const addOverride = () => {
    const section = MOCK_SECTIONS.find(s => !overrides.find(o => o.sectionId === s.id))
    if (!section) return
    setOverrides(prev => [...prev, { id: nextOverrideId(), sectionId: section.id, dueAt: '', unlockAt: '', lockAt: '' }])
  }

  const removeOverride = (id: string) => {
    setOverrides(prev => prev.filter(o => o.id !== id))
  }

  const updateOverride = (id: string, field: keyof DateOverride, value: string) => {
    setOverrides(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o))
  }

  const remainingSections = MOCK_SECTIONS.filter(s => !overrides.find(o => o.sectionId === s.id))

  return (
    <form className="cx-assignment-form" onSubmit={handleSubmit}>
      <div className="cx-page__header">
        <h2 className="cx-page__title">{initialData ? 'Edit Assignment' : 'New Assignment'}</h2>
      </div>

      <div className="cx-form-section">
        <div className="cx-form-group">
          <label className="cx-form-label" htmlFor="assign-name">Assignment Name</label>
          <input
            id="assign-name"
            className="cx-input"
            type="text"
            required
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Homework 5 - Chapter 3"
          />
        </div>

        <div className="cx-form-group">
          <label className="cx-form-label" htmlFor="assign-desc">Description</label>
          <textarea
            id="assign-desc"
            className="cx-input cx-input--textarea"
            rows={6}
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Provide instructions, links, and resources..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="cx-form-group">
            <label className="cx-form-label" htmlFor="assign-points">Points Possible</label>
            <input
              id="assign-points"
              className="cx-input"
              type="number"
              min={0}
              required
              value={form.points_possible}
              onChange={e => update('points_possible', Math.max(0, Number(e.target.value)))}
            />
          </div>

          <div className="cx-form-group">
            <label className="cx-form-label" htmlFor="assign-grade-type">Grading Type</label>
            <select
              id="assign-grade-type"
              className="cx-select"
              value={form.grading_type}
              onChange={e => update('grading_type', e.target.value)}
            >
              {GRADING_TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cx-form-group">
          <label className="cx-form-label" htmlFor="assign-due">Due Date</label>
          <input
            id="assign-due"
            className="cx-input"
            type="datetime-local"
            value={form.due_at}
            onChange={e => update('due_at', e.target.value)}
          />
        </div>

        <div className="cx-form-group">
          <label className="cx-form-label">Date Overrides <span style={{ fontWeight: 400, color: 'var(--cx-text-tertiary)', fontSize: '0.75rem' }}>— Set different due dates for specific sections</span></label>
          {overrides.map(o => (
            <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 2 }}>Section</label>
                <select className="cx-select" style={{ width: '100%' }} value={o.sectionId} onChange={e => updateOverride(o.id, 'sectionId', e.target.value)}>
                  {MOCK_SECTIONS.map(s => (
                    <option key={s.id} value={s.id} disabled={!!overrides.find(ov => ov.sectionId === s.id && ov.id !== o.id)}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 2 }}>Due</label>
                <input className="cx-input" type="datetime-local" value={o.dueAt} onChange={e => updateOverride(o.id, 'dueAt', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 2 }}>Unlock</label>
                <input className="cx-input" type="datetime-local" value={o.unlockAt} onChange={e => updateOverride(o.id, 'unlockAt', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 2 }}>Lock</label>
                <input className="cx-input" type="datetime-local" value={o.lockAt} onChange={e => updateOverride(o.id, 'lockAt', e.target.value)} />
              </div>
              <button type="button" className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => removeOverride(o.id)} title="Remove override" style={{ marginBottom: 0 }}><TrashSvg /></button>
            </div>
          ))}
          {remainingSections.length > 0 && (
            <button type="button" className="cx-btn cx-btn--ghost cx-btn--sm" onClick={addOverride} style={{ marginTop: 4 }}>
              <PlusCircleSvg /> Add Date Override
            </button>
          )}
        </div>

        <div className="cx-form-group">
          <label className="cx-form-label">Submission Types</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUBMISSION_TYPE_OPTIONS.map(opt => (
              <label key={opt.value} className="cx-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.submission_types.includes(opt.value)}
                  onChange={() => toggleSubmissionType(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="cx-form-group">
          <label className="cx-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.published}
              onChange={e => update('published', e.target.checked)}
            />
            <span>Publish immediately</span>
          </label>
        </div>
      </div>

      <div className="cx-form-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
        <button type="button" className="cx-btn cx-btn--secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="cx-btn cx-btn--primary" disabled={submitting || !form.name.trim()}>
          {submitting ? 'Saving...' : initialData ? 'Update Assignment' : 'Create Assignment'}
        </button>
      </div>
    </form>
  )
}
