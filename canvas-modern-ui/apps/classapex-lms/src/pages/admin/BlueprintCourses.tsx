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

import React, { useState, useEffect } from 'react'
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

interface Schedule {
  id: string
  templateId: number
  frequency: 'daily' | 'weekly'
  dayOfWeek?: number
  time: string
  enabled: boolean
  lastRun?: string
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
  const [syncComment, setSyncComment] = useState('')
  const [syncExceptions, setSyncExceptions] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    try { return JSON.parse(localStorage.getItem('classapex-blueprint-schedules') || '[]') } catch { return [] }
  })
  const [newScheduleFreq, setNewScheduleFreq] = useState<'daily' | 'weekly'>('daily')
  const [newScheduleDay, setNewScheduleDay] = useState<number>(0)
  const [newScheduleTime, setNewScheduleTime] = useState('08:00')

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

  const handleSync = async (template?: BlueprintTemplate, comment?: string) => {
    const t = template || selectedTemplate
    if (!t) return
    setSyncing(true)
    try {
      const body: any = { comment: comment || syncComment.trim() || 'Sync triggered from ClassApex' }
      if (syncExceptions) {
        body.copy_settings = true
        body.publish_after_initial_sync = false
      }
      const result = await canvasFetch(`/api/v1/courses/${t.course_id}/blueprint_templates/${t.id}/migrations`, {
        method: 'POST',
        body,
      })
      showToast({ title: 'Sync started', type: 'success' })
      setMigrations(prev => [result, ...prev].slice(0, 5))
      if (!template) setSyncComment('')
    } catch (err: any) {
      showToast({ title: 'Sync failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    localStorage.setItem('classapex-blueprint-schedules', JSON.stringify(schedules))
  }, [schedules])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setSchedules(prev => {
        let changed = false
        const next = prev.map(s => {
          if (!s.enabled) return s
          const [h, m] = s.time.split(':').map(Number)
          if (now.getHours() !== h || now.getMinutes() !== m) return s
          if (s.frequency === 'weekly' && s.dayOfWeek !== undefined && now.getDay() !== s.dayOfWeek) return s
          if (s.lastRun) {
            const lr = new Date(s.lastRun)
            if (lr.getFullYear() === now.getFullYear() && lr.getMonth() === now.getMonth() && lr.getDate() === now.getDate()) return s
          }
          const tmpl = templates.find(t => t.id === s.templateId)
          if (tmpl) {
            const body: any = { comment: `Scheduled sync — ${s.frequency}` }
            if (syncExceptions) {
              body.copy_settings = true
              body.publish_after_initial_sync = false
            }
            canvasFetch(`/api/v1/courses/${tmpl.course_id}/blueprint_templates/${tmpl.id}/migrations`, {
              method: 'POST',
              body,
            }).then(result => {
              showToast({ title: 'Scheduled sync started', type: 'success' })
              setMigrations(prevMig => [result, ...prevMig].slice(0, 5))
            }).catch((err: any) => {
              showToast({ title: 'Scheduled sync failed', message: err.message || 'Unknown error', type: 'error' })
            })
            changed = true
            return { ...s, lastRun: now.toISOString() }
          }
          return s
        })
        return changed ? next : prev
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [templates, syncExceptions])

  const getNextRun = (schedule: Schedule): string => {
    const now = new Date()
    const [h, m] = schedule.time.split(':').map(Number)
    let next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m)
    if (schedule.frequency === 'daily') {
      if (next <= now) next.setDate(next.getDate() + 1)
    } else if (schedule.frequency === 'weekly' && schedule.dayOfWeek !== undefined) {
      const daysUntil = (schedule.dayOfWeek - now.getDay() + 7) % 7
      next.setDate(next.getDate() + daysUntil)
      if (next <= now) next.setDate(next.getDate() + 7)
    }
    return next.toLocaleString()
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
              <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={syncing} onClick={() => handleSync()}>
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                className="cx-input"
                value={syncComment}
                onChange={e => setSyncComment(e.target.value)}
                placeholder="Sync comment (optional)"
                style={{ width: '100%' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={syncExceptions} onChange={e => setSyncExceptions(e.target.checked)} />
                Include settings and exceptions in sync
              </label>
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

      {/* Sync Schedules */}
      {selectedTemplate && (
        <div className="cx-card" style={{ padding: 20, marginTop: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Sync Schedules</h3>

          {schedules.filter(s => s.templateId === selectedTemplate.id).length === 0 ? (
            <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem', marginBottom: 16 }}>No schedules configured for this template.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {schedules.filter(s => s.templateId === selectedTemplate.id).map(schedule => (
                <div key={schedule.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--cx-border-subtle)', background: 'var(--cx-bg-surface-raised, #f8fafc)', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={schedule.enabled} onChange={() => setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, enabled: !s.enabled } : s))} />
                    {schedule.enabled ? 'Enabled' : 'Disabled'}
                  </label>
                  <select className="cx-input" style={{ fontSize: '0.8125rem', width: 100 }} value={schedule.frequency} onChange={e => setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, frequency: e.target.value as any } : s))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  {schedule.frequency === 'weekly' && (
                    <select className="cx-input" style={{ fontSize: '0.8125rem', width: 110 }} value={schedule.dayOfWeek ?? 0} onChange={e => setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, dayOfWeek: Number(e.target.value) } : s))}>
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  )}
                  <input type="time" className="cx-input" style={{ fontSize: '0.8125rem', width: 120 }} value={schedule.time} onChange={e => setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, time: e.target.value } : s))} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Next: {getNextRun(schedule)}</span>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" style={{ color: 'var(--cx-color-danger, #dc2626)', marginLeft: 'auto' }} onClick={() => setSchedules(prev => prev.filter(s => s.id !== schedule.id))}>Delete</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <select className="cx-input" style={{ fontSize: '0.8125rem', width: 110 }} value={newScheduleFreq} onChange={e => setNewScheduleFreq(e.target.value as any)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            {newScheduleFreq === 'weekly' && (
              <select className="cx-input" style={{ fontSize: '0.8125rem', width: 110 }} value={newScheduleDay} onChange={e => setNewScheduleDay(Number(e.target.value))}>
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            )}
            <input type="time" className="cx-input" style={{ fontSize: '0.8125rem', width: 120 }} value={newScheduleTime} onChange={e => setNewScheduleTime(e.target.value)} />
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => {
              const newSchedule: Schedule = {
                id: `sch-${Date.now()}`,
                templateId: selectedTemplate.id,
                frequency: newScheduleFreq,
                dayOfWeek: newScheduleFreq === 'weekly' ? newScheduleDay : undefined,
                time: newScheduleTime,
                enabled: true,
              }
              setSchedules(prev => [...prev, newSchedule])
            }}>Add Schedule</button>
          </div>
        </div>
      )}
    </div>
  )
}
