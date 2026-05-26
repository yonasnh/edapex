/**
 * CourseImport — ClassApex LMS
 * =================================
 * Import course content from another course or Commons.
 * Canvas REST API:
 *  GET /api/v1/courses (source courses)
 *  POST /api/v1/courses/:courseId/content_migrations
 *  GET /api/v1/courses/:courseId/content_migrations
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

const IMPORT_TYPES = [
  { value: 'course_copy_importer', label: 'Copy from Another Course' },
  { value: 'common_cartridge_importer', label: 'Common Cartridge (.imscc)' },
  { value: 'canvas_cartridge_importer', label: 'Canvas Course Export (.ccx)' },
  { value: 'moodle_converter', label: 'Moodle Backup (.mbz)' },
  { value: 'd2l_converter', label: 'D2L Export (.zip)' },
  { value: 'blackboard_converter', label: 'Blackboard Export (.zip)' },
]

const SELECT_ALL = [
  'assignments', 'quizzes', 'discussion_topics', 'wiki_pages',
  'context_modules', 'files', 'rubrics', 'learning_outcomes',
]

export default function CourseImportPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [importType, setImportType] = useState('course_copy_importer')
  const [sourceCourseId, setSourceCourseId] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([...SELECT_ALL])
  const [importing, setImporting] = useState(false)

  const { data: sourceCourses } = useCanvasQuery<any[]>(
    '/api/v1/courses',
    { enrollment_state: 'active', per_page: 100 } as any
  )

  const { data: migrations, refetch: refetchMigrations } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/content_migrations` : '',
    { per_page: 20 } as any
  )

  const handleToggleItem = (item: string) => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  const handleImport = async () => {
    if (importType === 'course_copy_importer' && !sourceCourseId) {
      showToast({ title: 'Select a source course', type: 'error' })
      return
    }
    const confirmed = await showConfirm({
      title: 'Start Import?',
      message: `This will import ${selectedItems.length} content types into this course. Existing content may be overwritten.`,
      type: 'warning',
    })
    if (!confirmed) return
    setImporting(true)
    try {
      const payload: any = {
        migration_type: importType,
        settings: { import_quizzes: true },
        select: selectedItems,
      }
      if (importType === 'course_copy_importer') {
        payload.settings.source_course_id = Number(sourceCourseId)
      }
      await canvasFetch(`/api/v1/courses/${courseId}/content_migrations`, { method: 'POST', body: payload })
      showToast({ title: 'Import started', message: 'Check status below for progress.', type: 'success' })
      refetchMigrations()
    } catch (err: any) {
      showToast({ title: 'Import failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setImporting(false)
    }
  }

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Import Content</h2>
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--cx-text-tertiary)' }}>You do not have permission.</p>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0 }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Import Content</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Import Form */}
        <div>
          <div className="cx-card" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 16px 0' }}>Import Source</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Import Type</label>
                <select className="cx-input" value={importType} onChange={e => setImportType(e.target.value)} style={{ width: '100%' }}>
                  {IMPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {importType === 'course_copy_importer' && (
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Source Course</label>
                  <select className="cx-input" value={sourceCourseId} onChange={e => setSourceCourseId(e.target.value)} style={{ width: '100%' }}>
                    <option value="">Select a course...</option>
                    {(sourceCourses || []).filter((c: any) => String(c.id) !== courseId).map((c: any) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Content to Import</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {SELECT_ALL.map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedItems.includes(item)} onChange={() => handleToggleItem(item)} />
                      {item.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setSelectedItems([])}>Deselect All</button>
                <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setSelectedItems([...SELECT_ALL])}>Select All</button>
              </div>

              <button className="cx-btn cx-btn--primary" onClick={handleImport} disabled={importing} style={{ marginTop: 8 }}>
                {importing ? 'Importing...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>

        {/* Migration History */}
        <div>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Import History</h3>
          {!migrations || migrations.length === 0 ? (
            <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>No previous imports.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {migrations.map((m: any) => (
                <div key={m.id} className="cx-card" style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cx-text-primary)' }}>{(m.migration_type as string).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginBottom: 4 }}>{new Date(m.created_at).toLocaleString()}</div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                    color: m.workflow_state === 'completed' ? 'var(--cx-color-success)' : m.workflow_state === 'failed' ? 'var(--cx-color-danger)' : 'var(--cx-color-warning)'
                  }}>{m.workflow_state}</span>
                  {m.progress !== undefined && m.workflow_state === 'running' && (
                    <div style={{ marginTop: 6 }}>
                      <div className="cx-progress-bar">
                        <div className="cx-progress-bar__track">
                          <div className="cx-progress-bar__fill" style={{ width: `${m.progress}%` }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--cx-text-tertiary)', marginTop: 2, textAlign: 'right' }}>{m.progress}%</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
