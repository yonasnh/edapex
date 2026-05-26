/**
 * Blueprint Courses — ClassApex LMS (S16)
 * =========================================
 * Canvas REST API:
 *  GET    /api/v1/courses/:id/blueprint_templates
 *  GET    /api/v1/courses/:id/blueprint_templates/:templateId/associated_courses
 *  POST   /api/v1/courses/:id/blueprint_templates/:templateId/associated_courses
 *  DELETE /api/v1/courses/:id/blueprint_templates/:templateId/associated_courses/:courseId
 *  POST   /api/v1/courses/:id/blueprint_templates/:templateId/migrations
 *  GET    /api/v1/courses/:id/blueprint_templates/:templateId/migrations/:migrationId
 */

import React, { useState } from 'react'
import { canvasFetch } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

interface BlueprintTemplate {
  id: number
  course_id: number
  name: string
}

interface AssociatedCourse {
  id: number
  name: string
  course_code: string
}

interface Migration {
  id: number
  workflow_state: string
  created_at: string
}

export default function BlueprintCoursesPage() {
  const { showToast, showConfirm } = useNotification()
  const [courseId, setCourseId] = useState('')
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<BlueprintTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<BlueprintTemplate | null>(null)
  const [associated, setAssociated] = useState<AssociatedCourse[]>([])
  const [migrations, setMigrations] = useState<Migration[]>([])
  const [newAssocId, setNewAssocId] = useState('')
  const [syncing, setSyncing] = useState(false)

  const fetchTemplates = async () => {
    if (!courseId.trim()) return
    setLoading(true)
    try {
      const data = await canvasFetch(`/api/v1/courses/${courseId.trim()}/blueprint_templates`, { method: 'GET' })
      const list = Array.isArray(data) ? data : []
      setTemplates(list)
      if (list.length === 0) {
        showToast({ title: 'No blueprint templates found', type: 'warning' })
      }
      setSelectedTemplate(null)
      setAssociated([])
      setMigrations([])
    } catch (err: any) {
      showToast({ title: 'Failed to load templates', message: err.message || 'Unknown error', type: 'error' })
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAssociated = async (template: BlueprintTemplate) => {
    setSelectedTemplate(template)
    setLoading(true)
    try {
      const data = await canvasFetch(`/api/v1/courses/${template.course_id}/blueprint_templates/${template.id}/associated_courses`, { method: 'GET' })
      setAssociated(Array.isArray(data) ? data : [])
    } catch (err: any) {
      showToast({ title: 'Failed to load associated courses', message: err.message || 'Unknown error', type: 'error' })
      setAssociated([])
    }
    try {
      const data = await canvasFetch(`/api/v1/courses/${template.course_id}/blueprint_templates/${template.id}/migrations`, { method: 'GET' })
      setMigrations(Array.isArray(data) ? data.slice(0, 5) : [])
    } catch {
      setMigrations([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddAssociated = async () => {
    if (!selectedTemplate || !newAssocId.trim()) return
    try {
      await canvasFetch(`/api/v1/courses/${selectedTemplate.course_id}/blueprint_templates/${selectedTemplate.id}/associated_courses`, {
        method: 'POST',
        body: { course_ids: [Number(newAssocId.trim())] },
      })
      showToast({ title: 'Course associated', type: 'success' })
      setNewAssocId('')
      fetchAssociated(selectedTemplate)
    } catch (err: any) {
      showToast({ title: 'Association failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleRemoveAssociated = async (assocId: number, name: string) => {
    if (!selectedTemplate) return
    const confirmed = await showConfirm({
      title: 'Remove Association?',
      message: `Remove "${name}" from this blueprint?`,
      type: 'danger',
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${selectedTemplate.course_id}/blueprint_templates/${selectedTemplate.id}/associated_courses/${assocId}`, { method: 'DELETE' })
      showToast({ title: 'Association removed', type: 'success' })
      fetchAssociated(selectedTemplate)
    } catch (err: any) {
      showToast({ title: 'Removal failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleSync = async () => {
    if (!selectedTemplate) return
    setSyncing(true)
    try {
      const result = await canvasFetch(`/api/v1/courses/${selectedTemplate.course_id}/blueprint_templates/${selectedTemplate.id}/migrations`, {
        method: 'POST',
        body: { comment: 'Sync triggered from ClassApex' },
      })
      showToast({ title: 'Sync started', type: 'success' })
      setMigrations(prev => [result, ...prev].slice(0, 5))
    } catch (err: any) {
      showToast({ title: 'Sync failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0 }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Blueprint Courses</h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
          Manage blueprint templates, associated courses, and content sync.
        </p>
      </div>

      {/* Course lookup */}
      <div className="cx-card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Blueprint Course Lookup</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="cx-input"
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
            placeholder="Enter blueprint course Canvas ID"
            style={{ flex: 1, maxWidth: 300 }}
            onKeyDown={e => { if (e.key === 'Enter') fetchTemplates() }}
          />
          <button className="cx-btn cx-btn--primary" onClick={fetchTemplates} disabled={loading || !courseId.trim()}>
            {loading ? 'Loading…' : 'Lookup'}
          </button>
        </div>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Templates</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {templates.map(t => (
              <button
                key={t.id}
                className="cx-btn"
                onClick={() => fetchAssociated(t)}
                style={{
                  background: selectedTemplate?.id === t.id ? 'var(--cx-color-primary)' : 'var(--cx-bg-surface)',
                  color: selectedTemplate?.id === t.id ? '#fff' : 'var(--cx-text-primary)',
                  border: `1px solid ${selectedTemplate?.id === t.id ? 'var(--cx-color-primary)' : 'var(--cx-border-subtle)'}`,
                }}
              >
                {t.name} (ID: {t.id})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Associated courses & sync */}
      {selectedTemplate && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="cx-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Associated Courses</h3>
              <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={syncing} onClick={handleSync}>
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                className="cx-input"
                value={newAssocId}
                onChange={e => setNewAssocId(e.target.value)}
                placeholder="Course ID to associate"
                style={{ flex: 1 }}
                onKeyDown={e => { if (e.key === 'Enter') handleAddAssociated() }}
              />
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleAddAssociated} disabled={!newAssocId.trim()}>Add</button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2].map(i => <div key={i} className="cx-skeleton" style={{ height: 48, borderRadius: 8 }} />)}
              </div>
            ) : associated.length === 0 ? (
              <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>No associated courses.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {associated.map(c => (
                  <li key={c.id} className="cx-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>{c.course_code} · ID: {c.id}</div>
                    </div>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleRemoveAssociated(c.id, c.name)} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="cx-card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Recent Sync History</h3>
            {migrations.length === 0 ? (
              <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>No sync history.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {migrations.map(m => (
                  <li key={m.id} style={{ padding: '10px 12px', background: 'var(--cx-bg-surface-raised, #f8fafc)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cx-text-primary)' }}>Migration #{m.id}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)' }}>{m.created_at ? new Date(m.created_at).toLocaleString() : '—'}</div>
                    </div>
                    <span className="cx-badge" style={{
                      fontSize: '0.6875rem',
                      background: m.workflow_state === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(241,194,27,0.15)',
                      color: m.workflow_state === 'completed' ? '#059669' : '#b45309',
                    }}>
                      {m.workflow_state}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
