/**
 * OutcomeEditModal — ClassApex LMS (S15)
 * ========================================
 * Canvas REST API:
 *   POST /api/v1/courses/:courseId/outcome_groups/:groupId/outcomes
 *   PUT  /api/v1/courses/:courseId/outcome_groups/:groupId/outcomes/:outcomeId
 */

import React, { useEffect, useState } from 'react'
import { canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'

interface RatingForm {
  description: string
  points: number
  mastery: boolean
}

interface OutcomeForm {
  title: string
  display_name: string
  description: string
  mastery_points: number
  calculation_method: 'decaying_average' | 'n_mastery' | 'latest' | 'highest'
  calculation_int: number
  ratings: RatingForm[]
}

interface Props {
  outcome: any | null
  courseId: string
  groupId: number
  onClose: () => void
  onSave: () => void
}

const defaultRatings: RatingForm[] = [
  { description: 'Exceeds Mastery', points: 4, mastery: true },
  { description: 'Meets Mastery', points: 3, mastery: true },
  { description: 'Near Mastery', points: 2, mastery: false },
  { description: 'Well Below Mastery', points: 1, mastery: false },
]

const emptyForm = (): OutcomeForm => ({
  title: '',
  display_name: '',
  description: '',
  mastery_points: 3,
  calculation_method: 'highest',
  calculation_int: 65,
  ratings: [...defaultRatings],
})

export default function OutcomeEditModal({ outcome, courseId, groupId, onClose, onSave }: Props) {
  const { showToast } = useNotification()
  const isEdit = !!outcome?.id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<OutcomeForm>(emptyForm())

  useEffect(() => {
    if (outcome) {
      setForm({
        title: outcome.title || '',
        display_name: outcome.display_name || '',
        description: outcome.description || '',
        mastery_points: outcome.mastery_points ?? 3,
        calculation_method: outcome.calculation_method || 'highest',
        calculation_int: outcome.calculation_int ?? 65,
        ratings: (outcome.ratings || defaultRatings).map((r: any) => ({
          description: r.description || '',
          points: r.points ?? 0,
          mastery: !!r.mastery,
        })),
      })
    } else {
      setForm(emptyForm())
    }
  }, [outcome])

  const updateRating = (index: number, patch: Partial<RatingForm>) => {
    setForm(prev => {
      const ratings = [...prev.ratings]
      ratings[index] = { ...ratings[index], ...patch }
      return { ...prev, ratings }
    })
  }

  const addRating = () => {
    setForm(prev => ({ ...prev, ratings: [...prev.ratings, { description: '', points: 0, mastery: false }] }))
  }

  const removeRating = (index: number) => {
    setForm(prev => ({ ...prev, ratings: prev.ratings.filter((_, i) => i !== index) }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast({ title: 'Title is required', type: 'error' })
      return
    }
    if (form.ratings.length === 0) {
      showToast({ title: 'At least one rating level is required', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        title: form.title.trim(),
        display_name: form.display_name.trim() || undefined,
        description: form.description.trim() || undefined,
        mastery_points: form.mastery_points,
        calculation_method: form.calculation_method,
        ratings: form.ratings.map(r => ({
          description: r.description,
          points: r.points,
          mastery: r.mastery,
        })),
      }
      if (form.calculation_method === 'decaying_average' || form.calculation_method === 'n_mastery') {
        payload.calculation_int = form.calculation_int
      }
      if (isEdit) {
        await canvasFetch(`/api/v1/courses/${courseId}/outcome_groups/${groupId}/outcomes/${outcome.id}`, {
          method: 'PUT',
          body: { outcome: payload },
        })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/outcome_groups/${groupId}/outcomes`, {
          method: 'POST',
          body: { outcome: payload },
        })
      }
      showToast({ title: `Outcome ${isEdit ? 'updated' : 'created'}`, type: 'success' })
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
        background: 'var(--cx-bg-surface)', borderRadius: 12, width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--cx-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--cx-text-primary)' }}>
            {isEdit ? 'Edit Outcome' : 'New Outcome'}
          </h3>
          <button onClick={onClose} className="cx-btn cx-btn--ghost cx-btn--sm" aria-label="Close">✕</button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Title *</label>
            <input type="text" className="cx-input" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Display Name</label>
            <input type="text" className="cx-input" value={form.display_name} onChange={e => setForm(prev => ({ ...prev, display_name: e.target.value }))} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
            <textarea className="cx-input" rows={3} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} style={{ width: '100%', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Mastery Points</label>
              <input type="number" className="cx-input" value={form.mastery_points} onChange={e => setForm(prev => ({ ...prev, mastery_points: Number(e.target.value) || 0 }))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Calculation Method</label>
              <select className="cx-input" value={form.calculation_method} onChange={e => setForm(prev => ({ ...prev, calculation_method: e.target.value as any }))} style={{ width: '100%' }}>
                <option value="highest">Highest</option>
                <option value="latest">Latest</option>
                <option value="decaying_average">Decaying Average</option>
                <option value="n_mastery">N Number of Times</option>
              </select>
            </div>
          </div>

          {form.calculation_method === 'decaying_average' && (
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Decaying Average Percentage (%)</label>
              <input type="number" className="cx-input" min={1} max={99} value={form.calculation_int} onChange={e => setForm(prev => ({ ...prev, calculation_int: Number(e.target.value) || 65 }))} style={{ width: '100%' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', margin: '4px 0 0' }}>Weight given to the most recent assessment (e.g. 65 = 65% newest, 35% previous).</p>
            </div>
          )}
          {form.calculation_method === 'n_mastery' && (
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Number of Times</label>
              <input type="number" className="cx-input" min={1} max={10} value={form.calculation_int} onChange={e => setForm(prev => ({ ...prev, calculation_int: Number(e.target.value) || 3 }))} style={{ width: '100%' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', margin: '4px 0 0' }}>Required number of times mastery must be achieved.</p>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Proficiency Ratings</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.ratings.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="text" className="cx-input" value={r.description} onChange={e => updateRating(i, { description: e.target.value })} placeholder="Description" style={{ flex: 1 }} />
                  <input type="number" className="cx-input" value={r.points} onChange={e => updateRating(i, { points: Number(e.target.value) || 0 })} placeholder="Pts" style={{ width: 72 }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--cx-text-secondary)', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={r.mastery} onChange={e => updateRating(i, { mastery: e.target.checked })} />
                    Mastery
                  </label>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => removeRating(i)} style={{ color: 'var(--cx-text-tertiary)' }}>✕</button>
                </div>
              ))}
              <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={addRating} style={{ alignSelf: 'flex-start' }}>+ Add Rating</button>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--cx-border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="cx-btn cx-btn--secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="cx-btn cx-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Outcome'}
          </button>
        </div>
      </div>
    </div>
  )
}
