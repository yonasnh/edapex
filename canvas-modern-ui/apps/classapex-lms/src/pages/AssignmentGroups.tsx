/**
 * AssignmentGroups — ClassApex LMS
 * =================================
 * Course-level assignment groups (weighted grading categories).
 * Canvas REST API:
 *  GET/POST /api/v1/courses/:courseId/assignment_groups
 *  PUT/DELETE /api/v1/courses/:courseId/assignment_groups/:groupId
 *  GET /api/v1/courses/:courseId/assignments
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

export default function AssignmentGroupsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ name: '', group_weight: 0, drop_lowest: 0, drop_highest: 0 })

  const { data: groups, isLoading, refetch } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/assignment_groups` : '',
    { per_page: 50 } as any
  )

  const { data: assignments } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/assignments` : '',
    { per_page: 100 } as any
  )

  const handleSave = async () => {
    if (!form.name.trim()) { showToast({ title: 'Name is required', type: 'error' }); return }
    try {
      const payload = {
        name: form.name.trim(),
        group_weight: Number(form.group_weight) || 0,
        rules: {
          drop_lowest: Number(form.drop_lowest) || 0,
          drop_highest: Number(form.drop_highest) || 0,
        }
      }
      if (editing?.id) {
        await canvasFetch(`/api/v1/courses/${courseId}/assignment_groups/${editing.id}`, {
          method: 'PUT', body: payload
        })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/assignment_groups`, {
          method: 'POST', body: payload
        })
      }
      showToast({ title: `Assignment group ${editing?.id ? 'updated' : 'created'}`, type: 'success' })
      setEditing(null)
      setForm({ name: '', group_weight: 0, drop_lowest: 0, drop_highest: 0 })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({ title: 'Delete Group?', message: 'Assignments in this group will be uncategorized.', type: 'danger' })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/assignment_groups/${id}`, { method: 'DELETE' })
      showToast({ title: 'Deleted', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Assignment Groups</h2>
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--cx-text-tertiary)' }}>You do not have permission.</p>
      </div>
    )
  }

  const totalWeight = (groups || []).reduce((s: number, g: any) => s + (g.group_weight || 0), 0)

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Assignment Groups</h2>
        <button className="cx-btn cx-btn--primary" onClick={() => { setEditing({}); setForm({ name: '', group_weight: 0, drop_lowest: 0, drop_highest: 0 }) }}>+ New Group</button>
      </div>

      <div className="cx-card" style={{ padding: 18, marginBottom: 20, background: totalWeight !== 100 ? 'rgba(217,119,6,0.08)' : 'rgba(5,150,105,0.08)', borderLeft: `4px solid ${totalWeight !== 100 ? 'var(--cx-color-warning, #d97706)' : 'var(--cx-color-success, #059669)'}` }}>
        <span style={{ fontWeight: 700, color: 'var(--cx-text-primary)' }}>Total Weight: {totalWeight}%</span>
        {totalWeight !== 100 && <span style={{ fontSize: '0.8125rem', color: 'var(--cx-color-warning)', marginLeft: 12 }}>Should total 100% for weighted grading</span>}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 64, borderRadius: 8 }} />)}
        </div>
      ) : !groups || groups.length === 0 ? (
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--cx-text-tertiary)' }}>No assignment groups.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {groups.map(g => {
            const groupAssignments = (assignments || []).filter((a: any) => a.assignment_group_id === g.id)
            return (
              <div key={g.id} className="cx-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--cx-text-primary)' }}>{g.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>{groupAssignments.length} assignments · Weight: {g.group_weight || 0}%{g.rules?.drop_lowest ? ` · Drop Lowest: ${g.rules.drop_lowest}` : ''}{g.rules?.drop_highest ? ` · Drop Highest: ${g.rules.drop_highest}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { setEditing(g); setForm({ name: g.name, group_weight: g.group_weight || 0, drop_lowest: g.rules?.drop_lowest || 0, drop_highest: g.rules?.drop_highest || 0 }) }}>Edit</button>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDelete(g.id)} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>Delete</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="cx-modal-overlay" onClick={() => setEditing(null)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">{editing.id ? 'Edit Assignment Group' : 'New Assignment Group'}</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Name *</label>
                <input type="text" className="cx-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Weight (%)</label>
                <input type="number" className="cx-input" value={form.group_weight} onChange={e => setForm(p => ({ ...p, group_weight: Number(e.target.value) || 0 }))} style={{ width: 120 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Drop Lowest</label>
                  <input type="number" className="cx-input" min={0} value={form.drop_lowest} onChange={e => setForm(p => ({ ...p, drop_lowest: Number(e.target.value) || 0 }))} style={{ width: 120 }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Drop Highest</label>
                  <input type="number" className="cx-input" min={0} value={form.drop_highest} onChange={e => setForm(p => ({ ...p, drop_highest: Number(e.target.value) || 0 }))} style={{ width: 120 }} />
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
