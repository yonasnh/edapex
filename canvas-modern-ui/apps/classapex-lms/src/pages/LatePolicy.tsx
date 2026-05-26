/**
 * LatePolicy — ClassApex LMS (S20)
 * ==================================
 * Canvas REST API:
 *  GET /api/v1/courses/:courseId/late_policy
 *  PUT /api/v1/courses/:courseId/late_policy
 *  POST /api/v1/courses/:courseId/assignments/:id/post_grades
 *  POST /api/v1/courses/:courseId/assignments/:id/hide_grades
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

interface LatePolicyForm {
  missing_submission_deduction_enabled: boolean
  missing_submission_deduction_type: 'percentage' | 'points'
  missing_submission_deduction_amount: number
  late_submission_deduction_enabled: boolean
  late_submission_deduction_type: 'percentage' | 'points'
  late_submission_deduction_amount: number
  late_submission_interval: 'day' | 'hour'
  late_submission_minimum_percent_enabled: boolean
  late_submission_minimum_percent: number
}

const emptyForm = (): LatePolicyForm => ({
  missing_submission_deduction_enabled: false,
  missing_submission_deduction_type: 'percentage',
  missing_submission_deduction_amount: 100,
  late_submission_deduction_enabled: false,
  late_submission_deduction_type: 'percentage',
  late_submission_deduction_amount: 10,
  late_submission_interval: 'day',
  late_submission_minimum_percent_enabled: false,
  late_submission_minimum_percent: 0,
})

export default function LatePolicyPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast } = useNotification()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<LatePolicyForm>(emptyForm())

  const { data: policy, isLoading, refetch } = useCanvasQuery<any>(
    courseId ? `/api/v1/courses/${courseId}/late_policy` : ''
  )

  const { data: assignments } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/assignments` : '',
    { per_page: 100 } as any
  )

  useEffect(() => {
    if (policy?.late_policy) {
      const p = policy.late_policy
      setForm({
        missing_submission_deduction_enabled: !!p.missing_submission_deduction_enabled,
        missing_submission_deduction_type: p.missing_submission_deduction_type || 'percentage',
        missing_submission_deduction_amount: p.missing_submission_deduction_amount ?? 100,
        late_submission_deduction_enabled: !!p.late_submission_deduction_enabled,
        late_submission_deduction_type: p.late_submission_deduction_type || 'percentage',
        late_submission_deduction_amount: p.late_submission_deduction_amount ?? 10,
        late_submission_interval: p.late_submission_interval || 'day',
        late_submission_minimum_percent_enabled: !!p.late_submission_minimum_percent_enabled,
        late_submission_minimum_percent: p.late_submission_minimum_percent ?? 0,
      })
    }
  }, [policy])

  const handleSave = async () => {
    setSaving(true)
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/late_policy`, {
        method: 'PUT',
        body: {
          late_policy: {
            missing_submission_deduction_enabled: form.missing_submission_deduction_enabled,
            missing_submission_deduction_type: form.missing_submission_deduction_type,
            missing_submission_deduction_amount: form.missing_submission_deduction_amount,
            late_submission_deduction_enabled: form.late_submission_deduction_enabled,
            late_submission_deduction_type: form.late_submission_deduction_type,
            late_submission_deduction_amount: form.late_submission_deduction_amount,
            late_submission_interval: form.late_submission_interval,
            late_submission_minimum_percent_enabled: form.late_submission_minimum_percent_enabled,
            late_submission_minimum_percent: form.late_submission_minimum_percent,
          },
        },
      })
      showToast({ title: 'Late policy saved', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handlePostGrades = async (assignmentId: number, hide: boolean) => {
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/${hide ? 'hide_grades' : 'post_grades'}`, { method: 'POST', body: {} })
      showToast({ title: hide ? 'Grades hidden' : 'Grades posted', type: 'success' })
    } catch (err: any) {
      showToast({ title: 'Action failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <div className="cx-page__header" style={{ paddingTop: 0 }}>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Late Policy & Grade Posting</h2>
        </div>
        <p style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0 }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Late Policy & Grade Posting</h2>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 48, borderRadius: 10 }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Late Policy */}
          <div className="cx-card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Late Submission Policy</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.late_submission_deduction_enabled} onChange={e => setForm(p => ({ ...p, late_submission_deduction_enabled: e.target.checked }))} />
                Enable automatic late deductions
              </label>
              {form.late_submission_deduction_enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, paddingLeft: 24 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Deduction Amount</label>
                    <input type="number" className="cx-input" value={form.late_submission_deduction_amount} onChange={e => setForm(p => ({ ...p, late_submission_deduction_amount: Number(e.target.value) || 0 }))} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Type</label>
                    <select className="cx-input" value={form.late_submission_deduction_type} onChange={e => setForm(p => ({ ...p, late_submission_deduction_type: e.target.value as any }))} style={{ width: '100%' }}>
                      <option value="percentage">%</option>
                      <option value="points">Points</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Interval</label>
                    <select className="cx-input" value={form.late_submission_interval} onChange={e => setForm(p => ({ ...p, late_submission_interval: e.target.value as any }))} style={{ width: '100%' }}>
                      <option value="day">Per Day</option>
                      <option value="hour">Per Hour</option>
                    </select>
                  </div>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.missing_submission_deduction_enabled} onChange={e => setForm(p => ({ ...p, missing_submission_deduction_enabled: e.target.checked }))} />
                Auto-zero missing submissions
              </label>
              {form.missing_submission_deduction_enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingLeft: 24 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Deduction</label>
                    <input type="number" className="cx-input" value={form.missing_submission_deduction_amount} onChange={e => setForm(p => ({ ...p, missing_submission_deduction_amount: Number(e.target.value) || 0 }))} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', display: 'block', marginBottom: 4 }}>Type</label>
                    <select className="cx-input" value={form.missing_submission_deduction_type} onChange={e => setForm(p => ({ ...p, missing_submission_deduction_type: e.target.value as any }))} style={{ width: '100%' }}>
                      <option value="percentage">%</option>
                      <option value="points">Points</option>
                    </select>
                  </div>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.late_submission_minimum_percent_enabled} onChange={e => setForm(p => ({ ...p, late_submission_minimum_percent_enabled: e.target.checked }))} />
                Lowest possible grade
              </label>
              {form.late_submission_minimum_percent_enabled && (
                <div style={{ paddingLeft: 24 }}>
                  <input type="number" className="cx-input" value={form.late_submission_minimum_percent} onChange={e => setForm(p => ({ ...p, late_submission_minimum_percent: Number(e.target.value) || 0 }))} style={{ width: 120 }} placeholder="%" />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="cx-btn cx-btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Policy'}</button>
              </div>
            </div>
          </div>

          {/* Grade Posting */}
          <div className="cx-card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Grade Posting</h3>
            <div className="cx-table-container">
              <table className="cx-table" style={{ fontSize: '0.875rem' }}>
                <thead>
                  <tr><th>Assignment</th><th style={{ width: 140 }}>Actions</th></tr>
                </thead>
                <tbody>
                  {(assignments || []).map(a => (
                    <tr key={a.id} className="cx-table__row">
                      <td className="cx-table__cell cx-table__cell--name">{a.name}</td>
                      <td className="cx-table__cell cx-table__cell--actions">
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handlePostGrades(a.id, false)}>Post</button>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handlePostGrades(a.id, true)} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>Hide</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
