/**
 * RubricEditModal — ClassApex LMS (S14)
 * =======================================
 * Canvas REST API:
 *   POST /api/v1/courses/:id/rubrics
 *   PUT  /api/v1/courses/:id/rubrics/:rubricId
 */

import React, { useEffect, useState } from 'react'
import { canvasFetch, useCanvasQuery } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'

interface Rating {
  id?: string
  description: string
  points: number
}

interface Criterion {
  id?: string
  description: string
  long_description?: string
  points: number
  ratings: Rating[]
  learning_outcome_id?: string
}

interface RubricForm {
  title: string
  free_form_criterion_comments: boolean
  criteria: Criterion[]
}

const emptyCriterion = (): Criterion => ({
  description: '',
  long_description: '',
  points: 0,
  ratings: [
    { description: 'Excellent', points: 4 },
    { description: 'Good', points: 3 },
    { description: 'Satisfactory', points: 2 },
    { description: 'Needs Improvement', points: 1 },
    { description: 'Unsatisfactory', points: 0 },
  ],
  learning_outcome_id: '',
})

interface Props {
  rubric: any | null
  courseId: string
  onClose: () => void
  onSave: () => void
}

export default function RubricEditModal({ rubric, courseId, onClose, onSave }: Props) {
  const { showToast } = useNotification()
  const isEdit = !!rubric?.id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<RubricForm>({
    title: '',
    free_form_criterion_comments: false,
    criteria: [emptyCriterion()],
  })

  const { data: outcomes } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/outcomes` : '',
    { per_page: 100 } as any
  )
  const outcomeList = outcomes || []

  useEffect(() => {
    if (rubric) {
      setForm({
        title: rubric.title || '',
        free_form_criterion_comments: !!rubric.free_form_criterion_comments,
        criteria: (rubric.criteria || []).map((c: any) => ({
          id: c.id,
          description: c.description || '',
          long_description: c.long_description || '',
          points: c.points ?? 0,
          learning_outcome_id: c.learning_outcome_id ? String(c.learning_outcome_id) : '',
          ratings: (c.ratings || []).map((r: any) => ({
            id: r.id,
            description: r.description || '',
            points: r.points ?? 0,
          })),
        })),
      })
    } else {
      setForm({ title: '', free_form_criterion_comments: false, criteria: [emptyCriterion()] })
    }
  }, [rubric])

  const updateCriterion = (index: number, patch: Partial<Criterion>) => {
    setForm(prev => {
      const criteria = [...prev.criteria]
      criteria[index] = { ...criteria[index], ...patch }
      return { ...prev, criteria }
    })
  }

  const updateRating = (cIndex: number, rIndex: number, patch: Partial<Rating>) => {
    setForm(prev => {
      const criteria = [...prev.criteria]
      const ratings = [...criteria[cIndex].ratings]
      ratings[rIndex] = { ...ratings[rIndex], ...patch }
      criteria[cIndex] = { ...criteria[cIndex], ratings }
      return { ...prev, criteria }
    })
  }

  const addCriterion = () => {
    setForm(prev => ({ ...prev, criteria: [...prev.criteria, emptyCriterion()] }))
  }

  const removeCriterion = (index: number) => {
    setForm(prev => ({ ...prev, criteria: prev.criteria.filter((_, i) => i !== index) }))
  }

  const addRating = (cIndex: number) => {
    setForm(prev => {
      const criteria = [...prev.criteria]
      criteria[cIndex] = { ...criteria[cIndex], ratings: [...criteria[cIndex].ratings, { description: '', points: 0 }] }
      return { ...prev, criteria }
    })
  }

  const removeRating = (cIndex: number, rIndex: number) => {
    setForm(prev => {
      const criteria = [...prev.criteria]
      criteria[cIndex] = { ...criteria[cIndex], ratings: criteria[cIndex].ratings.filter((_, i) => i !== rIndex) }
      return { ...prev, criteria }
    })
  }

  const totalPoints = form.criteria.reduce((sum, c) => sum + (c.points || 0), 0)

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast({ title: 'Title is required', type: 'error' })
      return
    }
    if (form.criteria.length === 0) {
      showToast({ title: 'At least one criterion is required', type: 'error' })
      return
    }
    for (const c of form.criteria) {
      if (!c.description.trim()) {
        showToast({ title: 'All criteria must have a description', type: 'error' })
        return
      }
      if (c.ratings.length === 0) {
        showToast({ title: `Criterion "${c.description}" needs at least one rating`, type: 'error' })
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        rubric: {
          title: form.title.trim(),
          free_form_criterion_comments: form.free_form_criterion_comments,
          criteria: form.criteria.map(c => ({
            description: c.description,
            long_description: c.long_description,
            points: c.points,
            ratings: c.ratings.map(r => ({ description: r.description, points: r.points })),
            ...(c.learning_outcome_id ? { learning_outcome_id: c.learning_outcome_id } : {}),
          })),
        },
      }
      if (isEdit) {
        await canvasFetch(`/api/v1/courses/${courseId}/rubrics/${rubric.id}`, { method: 'PUT', body: payload })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/rubrics`, { method: 'POST', body: payload })
      }
      showToast({ title: `Rubric ${isEdit ? 'updated' : 'created'}`, type: 'success' })
      onSave()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="cx-modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: 16,
    }}>
      <div className="cx-modal" onClick={e => e.stopPropagation()} style={{
        background: 'var(--cx-bg-surface)', borderRadius: 12, width: '100%', maxWidth: 720,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--cx-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--cx-text-primary)' }}>
            {isEdit ? 'Edit Rubric' : 'New Rubric'}
          </h3>
          <button onClick={onClose} className="cx-btn cx-btn--ghost cx-btn--sm" aria-label="Close">✕</button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Rubric Title *</label>
            <input
              type="text"
              className="cx-input"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Research Paper Rubric"
              style={{ width: '100%' }}
            />
          </div>

          {/* Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.free_form_criterion_comments}
              onChange={e => setForm(prev => ({ ...prev, free_form_criterion_comments: e.target.checked }))}
            />
            Allow free-form criterion comments
          </label>

          {/* Criteria */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {form.criteria.map((criterion, ci) => (
              <div key={ci} className="cx-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Criterion Description *</label>
                    <input
                      type="text"
                      className="cx-input"
                      value={criterion.description}
                      onChange={e => updateCriterion(ci, { description: e.target.value })}
                      placeholder="e.g. Thesis & Argument"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ width: 100 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Points *</label>
                    <input
                      type="number"
                      className="cx-input"
                      value={criterion.points}
                      onChange={e => updateCriterion(ci, { points: Number(e.target.value) || 0 })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => removeCriterion(ci)} style={{ marginTop: 20, color: 'var(--cx-color-danger, #dc2626)' }} title="Remove criterion">🗑</button>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Long Description (optional)</label>
                  <textarea
                    className="cx-input"
                    rows={2}
                    value={criterion.long_description}
                    onChange={e => updateCriterion(ci, { long_description: e.target.value })}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                {/* Outcome Alignment */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Align to Outcome</label>
                  <select
                    className="cx-input"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                    value={criterion.learning_outcome_id || ''}
                    onChange={e => updateCriterion(ci, { learning_outcome_id: e.target.value })}
                  >
                    <option value="">None</option>
                    {outcomeList.map((o: any) => (
                      <option key={o.id} value={String(o.id)}>{o.title}</option>
                    ))}
                  </select>
                </div>

                {/* Ratings */}
                <div style={{ marginLeft: 12, borderLeft: '2px solid var(--cx-border-subtle)', paddingLeft: 12 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', marginBottom: 6 }}>Ratings</div>
                  {criterion.ratings.map((rating, ri) => (
                    <div key={ri} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                      <input
                        type="text"
                        className="cx-input"
                        value={rating.description}
                        onChange={e => updateRating(ci, ri, { description: e.target.value })}
                        placeholder="Rating description"
                        style={{ flex: 1, fontSize: '0.8125rem' }}
                      />
                      <input
                        type="number"
                        className="cx-input"
                        value={rating.points}
                        onChange={e => updateRating(ci, ri, { points: Number(e.target.value) || 0 })}
                        placeholder="Pts"
                        style={{ width: 72, fontSize: '0.8125rem' }}
                      />
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => removeRating(ci, ri)} style={{ color: 'var(--cx-text-tertiary)' }} title="Remove rating">✕</button>
                    </div>
                  ))}
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => addRating(ci)}>+ Add Rating</button>
                </div>
              </div>
            ))}
            <button className="cx-btn cx-btn--secondary" onClick={addCriterion}>+ Add Criterion</button>
          </div>

          <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9rem', color: 'var(--cx-text-primary)' }}>
            Total Points: {totalPoints}
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--cx-border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="cx-btn cx-btn--secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="cx-btn cx-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Rubric'}
          </button>
        </div>
      </div>
    </div>
  )
}
