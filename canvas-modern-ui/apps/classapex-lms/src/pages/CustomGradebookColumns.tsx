/**
 * CustomGradebookColumns — ClassApex LMS
 * ========================================
 * Canvas REST API:
 *  GET/POST /api/v1/courses/:courseId/custom_gradebook_columns
 *  PUT/DELETE /api/v1/courses/:courseId/custom_gradebook_columns/:id
 *  GET/PUT /api/v1/courses/:courseId/custom_gradebook_columns/:id/data
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

interface CustomColumn {
  id: number
  title: string
  position: number
  hidden: boolean
  teacher_notes: boolean
  formula?: string
}

export default function CustomGradebookColumnsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [editingColumn, setEditingColumn] = useState<any | null>(null)
  const [colForm, setColForm] = useState({ title: '', hidden: false, teacher_notes: false, formula: '' })

  const { data: columns, isLoading, refetch } = useCanvasQuery<CustomColumn[]>(
    courseId ? `/api/v1/courses/${courseId}/custom_gradebook_columns` : '',
    { per_page: 50 } as any
  )

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({ title: 'Delete Column?', message: 'This will remove the column and all its data.', type: 'danger' })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/custom_gradebook_columns/${id}`, { method: 'DELETE' })
      showToast({ title: 'Column deleted', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleSave = async () => {
    if (!colForm.title.trim()) {
      showToast({ title: 'Title is required', type: 'error' })
      return
    }
    try {
      const payload = { column: { title: colForm.title.trim(), hidden: colForm.hidden, teacher_notes: colForm.teacher_notes } }
      if (editingColumn?.id) {
        await canvasFetch(`/api/v1/courses/${courseId}/custom_gradebook_columns/${editingColumn.id}`, { method: 'PUT', body: payload })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/custom_gradebook_columns`, { method: 'POST', body: payload })
      }
      // Persist formula locally since Canvas API doesn't expose it
      const stored = JSON.parse(localStorage.getItem('cx-custom-column-formulas') || '{}')
      const key = editingColumn?.id ? `col-${editingColumn.id}` : `new-${Date.now()}`
      stored[key] = colForm.formula
      localStorage.setItem('cx-custom-column-formulas', JSON.stringify(stored))
      showToast({ title: `Column ${editingColumn?.id ? 'updated' : 'created'}`, type: 'success' })
      setEditingColumn(null)
      setColForm({ title: '', hidden: false, teacher_notes: false, formula: '' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <div className="cx-page__header" style={{ paddingTop: 0 }}>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Custom Gradebook Columns</h2>
        </div>
        <p style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Custom Gradebook Columns</h2>
        <button className="cx-btn cx-btn--primary" onClick={() => { setEditingColumn({}); setColForm({ title: '', hidden: false, teacher_notes: false, formula: '' }) }}>+ New Column</button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 56, borderRadius: 10 }} />)}
        </div>
      ) : !columns || columns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p>No custom columns.</p>
        </div>
      ) : (
        <div className="cx-table-container">
          <table className="cx-table" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr><th>Title</th><th>Type</th><th>Visible</th><th style={{ width: 120 }}>Actions</th></tr>
            </thead>
            <tbody>
              {columns.map(c => {
                const stored = JSON.parse(localStorage.getItem('cx-custom-column-formulas') || '{}')
                const formula = stored[`col-${c.id}`] || c.formula || ''
                return (
                  <tr key={c.id} className="cx-table__row">
                    <td className="cx-table__cell cx-table__cell--name">
                      {c.title}
                      {formula && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 2 }}>Formula: {formula}</div>
                      )}
                    </td>
                    <td className="cx-table__cell">{c.teacher_notes ? 'Teacher Notes' : 'Custom'}</td>
                    <td className="cx-table__cell">{c.hidden ? 'Hidden' : 'Visible'}</td>
                    <td className="cx-table__cell cx-table__cell--actions">
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => {
                        const storedFormulas = JSON.parse(localStorage.getItem('cx-custom-column-formulas') || '{}')
                        setEditingColumn(c)
                        setColForm({ title: c.title, hidden: c.hidden, teacher_notes: c.teacher_notes, formula: storedFormulas[`col-${c.id}`] || c.formula || '' })
                      }}>Edit</button>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDelete(c.id)} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingColumn && (
        <div className="cx-modal-overlay" onClick={() => setEditingColumn(null)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">{editingColumn.id ? 'Edit Column' : 'New Column'}</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditingColumn(null)}>✕</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Title *</label>
                <input type="text" className="cx-input" value={colForm.title} onChange={e => setColForm(p => ({ ...p, title: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={colForm.hidden} onChange={e => setColForm(p => ({ ...p, hidden: e.target.checked }))} />
                Hidden from students
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={colForm.teacher_notes} onChange={e => setColForm(p => ({ ...p, teacher_notes: e.target.checked }))} />
                Teacher notes column
              </label>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Formula</label>
                <input
                  type="text"
                  className="cx-input"
                  value={colForm.formula}
                  onChange={e => setColForm(p => ({ ...p, formula: e.target.value }))}
                  style={{ width: '100%' }}
                  placeholder="e.g. =SUM(assignment1, assignment2)"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', margin: '4px 0 0' }}>Stored locally; Canvas API does not persist custom column formulas.</p>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setEditingColumn(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
