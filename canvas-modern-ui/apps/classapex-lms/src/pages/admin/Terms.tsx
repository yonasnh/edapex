import React, { useState } from 'react'

interface Term {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'active' | 'upcoming' | 'past'
  courseCount: number
  enrollmentCount: number
}

// We will fetch these from Canvas API instead
// const mockTerms: Term[] = ...

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg> }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z"/></svg> }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M11 5v7a1 1 0 01-1 1H4a1 1 0 01-1-1V5"/></svg> }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg> }
function CalendarSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="3.5" width="15" height="14" rx="2"/><path d="M2.5 6.5h15"/><path d="M6 2v3M14 2v3"/></svg> }
function CheckSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7l3 3 5-6"/></svg> }

import { useCanvasQuery } from '../../hooks/useCanvasQuery'

export default function TermsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })

  const resetForm = () => { setForm({ name: '', startDate: '', endDate: '' }); setShowCreate(false); setEditingId(null) }

  const openEdit = (term: Term) => {
    setForm({ name: term.name, startDate: term.startDate, endDate: term.endDate })
    setEditingId(term.id)
    setShowCreate(true)
  }

  const { data: termsData, refetch } = useCanvasQuery<any>('/api/v1/accounts/1/terms')
  
  const mockTerms = React.useMemo<Term[]>(() => {
    if (!termsData || !Array.isArray(termsData.enrollment_terms)) return [];
    return termsData.enrollment_terms.map((t: any) => ({
      id: String(t.id),
      name: t.name,
      startDate: t.start_at || '',
      endDate: t.end_at || '',
      status: t.workflow_state === 'active' ? 'active' : 'past', // Simplification
      courseCount: 0, // Not returned by default
      enrollmentCount: 0,
    }));
  }, [termsData])

  const handleSave = async () => {
    if (!form.name.trim()) return
    
    try {
      const formData = new URLSearchParams()
      formData.append('enrollment_term[name]', form.name)
      if (form.startDate) formData.append('enrollment_term[start_at]', new Date(form.startDate).toISOString())
      if (form.endDate) formData.append('enrollment_term[end_at]', new Date(form.endDate).toISOString())

      const url = editingId ? `/api/v1/accounts/1/terms/${editingId}` : `/api/v1/accounts/1/terms`
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })
      if (!res.ok) throw new Error('Failed to save term')
      
      resetForm()
      refetch()
    } catch (err) {
      console.error(err)
      alert('Failed to save term.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return;
    try {
      const res = await fetch(`/api/v1/accounts/1/terms/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete term')
      refetch()
    } catch (err) {
      console.error(err)
      alert('Failed to delete term.')
    }
  }

  const statusLabel = (s: Term['status']) => {
    const map: Record<string, string> = { active: 'cx-badge--success', upcoming: 'cx-badge--info', past: 'cx-badge--neutral' }
    return <span className={`cx-badge ${map[s] || 'cx-badge--neutral'}`}>{s}</span>
  }

  const stats = {
    active: mockTerms.filter(t => t.status === 'active').length,
    upcoming: mockTerms.filter(t => t.status === 'upcoming').length,
    past: mockTerms.filter(t => t.status === 'past').length,
    total: mockTerms.length,
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Academic Terms</h1>
          <p className="cx-page__subtitle">Manage enrollment terms and academic calendars</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => { resetForm(); setShowCreate(true) }}>
          <PlusSvg /> New Term
        </button>
      </div>

      <div className="cx-stats-grid" style={{ marginBottom: 16 }}>
        {[
          { label: 'Active Terms', value: stats.active, icon: <CalendarSvg />, color: 'var(--cx-green-500)' },
          { label: 'Upcoming', value: stats.upcoming, icon: <CalendarSvg />, color: 'var(--cx-blue-500)' },
          { label: 'Past Terms', value: stats.past, icon: <CalendarSvg />, color: 'var(--cx-text-tertiary)' },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__value">{s.value}</div>
              <div className="cx-stat-card__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="cx-card" style={{ marginBottom: 16, padding: 16 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>
            {editingId ? 'Edit Term' : 'Create New Term'}
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="cx-form-group" style={{ flex: '1 1 200px' }}>
              <label className="cx-form-label" htmlFor="term-name">Term Name</label>
              <input id="term-name" className="cx-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Fall 2025" />
            </div>
            <div className="cx-form-group">
              <label className="cx-form-label" htmlFor="term-start">Start Date</label>
              <input id="term-start" className="cx-input" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className="cx-form-group">
              <label className="cx-form-label" htmlFor="term-end">End Date</label>
              <input id="term-end" className="cx-input" type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleSave} disabled={!form.name.trim()}>
              <CheckSvg /> {editingId ? 'Update' : 'Create'}
            </button>
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      <div className="cx-table-container">
        <table className="cx-table">
          <thead>
            <tr>
              <th>Term</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Courses</th>
              <th>Enrollments</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockTerms.map(term => (
              <tr key={term.id}>
                <td className="cx-table__cell cx-table__cell--name">{term.name}</td>
                <td className="cx-table__cell">{new Date(term.startDate).toLocaleDateString()}</td>
                <td className="cx-table__cell">{new Date(term.endDate).toLocaleDateString()}</td>
                <td className="cx-table__cell">{statusLabel(term.status)}</td>
                <td className="cx-table__cell">{term.courseCount}</td>
                <td className="cx-table__cell">{term.enrollmentCount}</td>
                <td className="cx-table__cell cx-table__cell--actions">
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => openEdit(term)} aria-label="Edit"><EditSvg /></button>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDelete(term.id)} aria-label="Delete"><TrashSvg /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
