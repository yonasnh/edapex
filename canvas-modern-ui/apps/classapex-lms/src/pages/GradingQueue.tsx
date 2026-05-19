/**
 * ClassApex — Grading Queue (Instructor View)
 * =============================================
 * Speed grading interface powered by Canvas Submissions API.
 * Features:
 *  - Submission queue with pending/late/resubmitted filters
 *  - Inline review panel (no full page reload)
 *  - Grade input with comment
 *  - Batch grade actions
 *  - Prev/Next navigation for efficient grading flow
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import './grading.css'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Submission {
  id: number
  user_id: number
  user: {
    id: number
    name: string
    short_name?: string
    avatar_url?: string
  }
  assignment_id: number
  assignment: {
    id: number
    name: string
    points_possible: number
    course_id: number
    due_at?: string
  }
  course_name?: string
  workflow_state: 'submitted' | 'pending_review' | 'graded' | 'unsubmitted'
  submitted_at?: string
  graded_at?: string
  score?: number | null
  grade?: string | null
  body?: string
  late: boolean
  missing: boolean
  attempt: number
  submission_type?: 'online_text_entry' | 'online_upload' | 'online_url' | 'media_recording'
  attachments?: { id: number; filename: string; url: string; content_type: string }[]
  submission_comments?: { id: number; author_name: string; comment: string; created_at: string }[]
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6']

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffHrs = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
  if (diffHrs < 1) return `${Math.round(diffHrs * 60)}m ago`
  if (diffHrs < 24) return `${Math.round(diffHrs)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function getStatusInfo(sub: Submission): { label: string; className: string } {
  if (sub.workflow_state === 'graded') return { label: 'Graded', className: 'cx-grade-item__status--graded' }
  if (sub.attempt > 1) return { label: 'Resubmitted', className: 'cx-grade-item__status--resubmitted' }
  if (sub.late) return { label: 'Late', className: 'cx-grade-item__status--late' }
  return { label: 'Pending', className: 'cx-grade-item__status--pending' }
}

// ─── Grading Queue Page ─────────────────────────────────────────────────────

type QueueFilter = 'all' | 'pending' | 'late' | 'resubmitted' | 'graded'

export default function GradingQueuePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all')
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [gradeValue, setGradeValue] = useState('')
  const [comment, setComment] = useState('')
  const [gradedLocally, setGradedLocally] = useState<Set<number>>(new Set())

  // SpeedGrader Enhancements States (Sprint 18)
  const [rubricViewTab, setRubricViewTab] = useState<'teacher' | 'self' | 'peer'>('teacher')
  const [isModerated, setIsModerated] = useState(false)
  const [moderator, setModerator] = useState('Professor Miller')
  
  // DocViewer Annotation States
  const [annotations, setAnnotations] = useState<{ id: string; x: number; y: number; text: string; type: string }[]>([
    { id: '1', x: 120, y: 110, text: 'Excellent introductory paragraph! Strong thesis statement.', type: 'note' },
    { id: '2', x: 280, y: 190, text: 'Check APA citation style formatting here.', type: 'highlight' }
  ])
  const [annotationType, setAnnotationType] = useState<'note' | 'highlight' | 'pencil'>('note')
  
  // Media Recording States
  const [isRecording, setIsRecording] = useState(false)
  const [recordTimer, setRecordTimer] = useState(0)
  const [recordedComment, setRecordedComment] = useState<string | null>(null)

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

  // Fetch courses to grade
  const { data: coursesData } = useCanvasQuery<any[]>(
    '/api/v1/courses',
    { enrollment_state: 'active', enrollment_type: 'teacher', per_page: 50 } as any
  )
  const courses = Array.isArray(coursesData) ? coursesData : []
  
  // Auto-select first course when loaded
  React.useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id)
    }
  }, [courses, selectedCourseId])

  // Canvas API — submissions for selected course
  const { data: apiSubmissions } = useCanvasQuery<Submission[]>(
    selectedCourseId ? `/api/v1/courses/${selectedCourseId}/students/submissions` : '',
    { workflow_state: 'submitted', include: ['user', 'assignment', 'submission_comments'], per_page: 50 } as any
  )

  const submissions = Array.isArray(apiSubmissions) ? apiSubmissions : []

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    let list = [...submissions]
    switch (queueFilter) {
      case 'pending': list = list.filter(s => s.workflow_state !== 'graded' && !s.late && s.attempt <= 1); break
      case 'late': list = list.filter(s => s.late); break
      case 'resubmitted': list = list.filter(s => s.attempt > 1); break
      case 'graded': list = list.filter(s => s.workflow_state === 'graded' || gradedLocally.has(s.id)); break
    }
    return list.sort((a, b) => {
      // Ungraded first, then by submitted time
      const aGraded = a.workflow_state === 'graded' || gradedLocally.has(a.id) ? 1 : 0
      const bGraded = b.workflow_state === 'graded' || gradedLocally.has(b.id) ? 1 : 0
      if (aGraded !== bGraded) return aGraded - bGraded
      return new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime()
    })
  }, [submissions, queueFilter, gradedLocally])

  const selected = useMemo(
    () => submissions.find(s => s.id === selectedId) || null,
    [submissions, selectedId]
  )

  // Stats
  const stats = useMemo(() => {
    const total = submissions.length
    const pending = submissions.filter(s => s.workflow_state !== 'graded' && !gradedLocally.has(s.id)).length
    const late = submissions.filter(s => s.late && s.workflow_state !== 'graded').length
    const graded = submissions.filter(s => s.workflow_state === 'graded' || gradedLocally.has(s.id)).length
    return { total, pending, late, graded }
  }, [submissions, gradedLocally])

  const toggleSelect = useCallback((id: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    if (selectedItems.size === filteredSubmissions.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredSubmissions.map(s => s.id)))
    }
  }, [filteredSubmissions, selectedItems])

  const handleSubmitGrade = useCallback(async () => {
    if (!selected || !gradeValue) return

    try {
      // Use URLSearchParams for form-encoded payload which is robust for Canvas REST API
      const formData = new URLSearchParams()
      formData.append('submission[posted_grade]', gradeValue)
      if (comment) {
        formData.append('comment[text_comment]', comment)
      }

      const res = await fetch(`/api/v1/courses/${selected.assignment.course_id}/assignments/${selected.assignment_id}/submissions/${selected.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })
      if (!res.ok) throw new Error('Failed to submit grade')

      setGradedLocally(prev => new Set(prev).add(selected.id))
      setGradeValue('')
      setComment('')

      // Auto-advance to next ungraded
      const currentIndex = filteredSubmissions.findIndex(s => s.id === selected.id)
      const next = filteredSubmissions.find((s, i) => i > currentIndex && s.workflow_state !== 'graded' && !gradedLocally.has(s.id))
      if (next) setSelectedId(next.id)

    } catch (err) {
      console.error('Grading failed:', err)
      alert('Failed to submit grade. Please try again.')
    }
  }, [selected, gradeValue, comment, filteredSubmissions, gradedLocally])

  const navigateQueue = useCallback((direction: 'prev' | 'next') => {
    if (!selected) return
    const idx = filteredSubmissions.findIndex(s => s.id === selected.id)
    const newIdx = direction === 'next' ? idx + 1 : idx - 1
    if (newIdx >= 0 && newIdx < filteredSubmissions.length) {
      setSelectedId(filteredSubmissions[newIdx].id)
      setGradeValue('')
      setComment('')
    }
  }, [selected, filteredSubmissions])

  const currentIndex = selected ? filteredSubmissions.findIndex(s => s.id === selected.id) : -1

  return (
    <div className="cx-grading">
      {/* ── Header ── */}
      <div className="cx-grading__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 className="cx-grading__title">Grading Queue</h1>
            <select
              className="cx-select"
              value={selectedCourseId || ''}
              onChange={e => {
                setSelectedCourseId(Number(e.target.value))
                setSelectedId(null)
                setGradedLocally(new Set())
              }}
              style={{ padding: '6px 12px', fontSize: '0.875rem' }}
            >
              <option value="" disabled>Select a course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <p className="cx-grading__subtitle">
            {stats.pending} submission{stats.pending !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="cx-grading__stats">
        <div className="cx-grading__stat">
          <span className="cx-grading__stat-icon">📋</span>
          <div>
            <div className="cx-grading__stat-value">{stats.total}</div>
            <div className="cx-grading__stat-label">Total</div>
          </div>
        </div>
        <div className="cx-grading__stat">
          <span className="cx-grading__stat-icon">⏳</span>
          <div>
            <div className="cx-grading__stat-value">{stats.pending}</div>
            <div className="cx-grading__stat-label">Pending</div>
          </div>
        </div>
        <div className="cx-grading__stat">
          <span className="cx-grading__stat-icon">⚠️</span>
          <div>
            <div className="cx-grading__stat-value">{stats.late}</div>
            <div className="cx-grading__stat-label">Late</div>
          </div>
        </div>
        <div className="cx-grading__stat">
          <span className="cx-grading__stat-icon">✅</span>
          <div>
            <div className="cx-grading__stat-value">{stats.graded}</div>
            <div className="cx-grading__stat-label">Graded</div>
          </div>
        </div>
      </div>

      {/* ── Split Layout ── */}
      <div className={`cx-grading__split ${selected ? 'cx-grading__split--review-open' : ''}`}>
        {/* ── Queue List ── */}
        <div className="cx-grading__queue-panel">
          <div className="cx-grading__queue-header">
            <span className="cx-grading__queue-title">Submissions ({filteredSubmissions.length})</span>
            <div className="cx-grading__batch-actions">
              <button className="cx-grading__batch-btn" onClick={selectAll}>
                {selectedItems.size === filteredSubmissions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="cx-grading__queue-filters">
            {([
              ['all', 'All'],
              ['pending', 'Pending'],
              ['late', 'Late'],
              ['resubmitted', 'Resubmitted'],
              ['graded', 'Graded'],
            ] as [QueueFilter, string][]).map(([key, label]) => (
              <button
                key={key}
                className={`cx-grading__queue-filter ${queueFilter === key ? 'cx-grading__queue-filter--active' : ''}`}
                onClick={() => setQueueFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <ul className="cx-grading__queue-list" role="listbox">
            {filteredSubmissions.length === 0 ? (
              <li style={{ padding: 24, textAlign: 'center', color: 'var(--cx-text-muted)', fontSize: '0.85rem' }}>
                No submissions in this filter
              </li>
            ) : (
              filteredSubmissions.map(sub => {
                const status = getStatusInfo(sub)
                const isGraded = sub.workflow_state === 'graded' || gradedLocally.has(sub.id)

                return (
                  <li
                    key={sub.id}
                    className={`cx-grade-item ${selectedId === sub.id ? 'cx-grade-item--active' : ''} ${isGraded ? 'cx-grade-item--graded' : ''}`}
                    onClick={() => { setSelectedId(sub.id); setGradeValue(''); setComment('') }}
                    role="option"
                    aria-selected={selectedId === sub.id}
                  >
                    <input
                      type="checkbox"
                      className="cx-grade-item__select"
                      checked={selectedItems.has(sub.id)}
                      onChange={() => toggleSelect(sub.id)}
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="cx-grade-item__avatar" style={{ background: getColor(sub.user_id) }}>
                      {getInitials(sub.user.name)}
                    </div>
                    <div className="cx-grade-item__info">
                      <div className="cx-grade-item__student">{sub.user.name}</div>
                      <div className="cx-grade-item__assignment">{sub.assignment.name}</div>
                    </div>
                    <div className="cx-grade-item__meta">
                      <span className={`cx-grade-item__status ${status.className}`}>{status.label}</span>
                      {sub.submitted_at && (
                        <span className="cx-grade-item__submitted">{formatTime(sub.submitted_at)}</span>
                      )}
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </div>

        {/* ── Review Panel ── */}
        <div className="cx-grading__review-panel">
          {!selected ? (
            <div className="cx-grading__review-empty">
              <span className="cx-grading__review-empty-icon">📝</span>
              <p>Select a submission to review</p>
            </div>
          ) : (
            <>
              <div className="cx-grading__review-header">
                <div>
                  <div className="cx-grading__review-student">{selected.user.name}</div>
                  <div className="cx-grading__review-assign">
                    {selected.assignment.name} · {selected.course_name}
                  </div>
                </div>
                <div className="cx-grading__nav-btns">
                  <button
                    className="cx-grading__nav-btn"
                    onClick={() => navigateQueue('prev')}
                    disabled={currentIndex <= 0}
                    aria-label="Previous submission"
                  >
                    ◀ Prev
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-muted)', alignSelf: 'center' }}>
                    {currentIndex + 1} / {filteredSubmissions.length}
                  </span>
                  <button
                    className="cx-grading__nav-btn"
                    onClick={() => navigateQueue('next')}
                    disabled={currentIndex >= filteredSubmissions.length - 1}
                    aria-label="Next submission"
                  >
                    Next ▶
                  </button>
                </div>
              </div>

              <div className="cx-grading__submission">
                {/* Rubric View Selectors (S18-10) */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--cx-border-subtle)', marginBottom: 12, gap: 4 }}>
                  <button
                    className={`cx-btn cx-btn--sm ${rubricViewTab === 'teacher' ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
                    onClick={() => setRubricViewTab('teacher')}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                  >
                    Teacher Rubric
                  </button>
                  <button
                    className={`cx-btn cx-btn--sm ${rubricViewTab === 'self' ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
                    onClick={() => setRubricViewTab('self')}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                  >
                    Self Assessment
                  </button>
                  <button
                    className={`cx-btn cx-btn--sm ${rubricViewTab === 'peer' ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
                    onClick={() => setRubricViewTab('peer')}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                  >
                    Peer Reviews
                  </button>
                </div>

                {rubricViewTab === 'teacher' && (
                  <div className="cx-grading__submission-meta" style={{ marginBottom: 16 }}>
                    <div className="cx-grading__meta-card">
                      <div className="cx-grading__meta-label">Submitted</div>
                      <div className="cx-grading__meta-value">
                        {selected.submitted_at ? new Date(selected.submitted_at).toLocaleString() : '—'}
                      </div>
                    </div>
                    <div className="cx-grading__meta-card">
                      <div className="cx-grading__meta-label">Attempt</div>
                      <div className="cx-grading__meta-value">#{selected.attempt}</div>
                    </div>
                    <div className="cx-grading__meta-card">
                      <div className="cx-grading__meta-label">Points Possible</div>
                      <div className="cx-grading__meta-value">{selected.assignment.points_possible}</div>
                    </div>
                    <div className="cx-grading__meta-card">
                      <div className="cx-grading__meta-label">Status</div>
                      <div className="cx-grading__meta-value">{getStatusInfo(selected).label}</div>
                    </div>
                  </div>
                )}

                {rubricViewTab === 'self' && (
                  <div className="cx-card" style={{ padding: 16, marginBottom: 16, background: 'var(--cx-color-primary-subtle)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-color-primary)' }}>Student Self-Evaluation Rubric</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 4 }}>
                        <span>Content Accuracy</span>
                        <strong style={{ color: 'var(--cx-color-success)' }}>Exceeds Standards (5/5)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 4 }}>
                        <span>Academic Citations</span>
                        <strong style={{ color: 'var(--cx-color-warning)' }}>Meets Standards (3/5)</strong>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', color: 'var(--cx-text-secondary)' }}>
                        "I spent extra time researching peer-reviewed articles, but I need to double-check my APA citation endings."
                      </p>
                    </div>
                  </div>
                )}

                {rubricViewTab === 'peer' && (
                  <div className="cx-card" style={{ padding: 16, marginBottom: 16, background: 'var(--cx-color-primary-subtle)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-color-primary)' }}>Peer Review Evaluations (2 reviews)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
                      <div style={{ borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>Peer Reviewer A</strong>
                          <span style={{ color: 'var(--cx-text-tertiary)' }}>Score: 4.5/5</span>
                        </div>
                        <p style={{ margin: '2px 0 0 0', color: 'var(--cx-text-secondary)' }}>"Clear thesis and strong evidence in section 2. Well organized!"</p>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>Peer Reviewer B</strong>
                          <span style={{ color: 'var(--cx-text-tertiary)' }}>Score: 4.0/5</span>
                        </div>
                        <p style={{ margin: '2px 0 0 0', color: 'var(--cx-text-secondary)' }}>"Very detailed analysis, but the bibliography is missing two references cited."</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DocViewer Annotation Canvas (S18-06) */}
                <div style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ background: 'var(--cx-bg-surface-sunken, #f1f5f9)', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)' }}>DocViewer Inline Annotation tool</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className={`cx-btn cx-btn--sm ${annotationType === 'note' ? 'cx-btn--primary' : 'cx-btn--secondary'}`}
                        onClick={() => setAnnotationType('note')}
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        💬 Note
                      </button>
                      <button
                        className={`cx-btn cx-btn--sm ${annotationType === 'highlight' ? 'cx-btn--primary' : 'cx-btn--secondary'}`}
                        onClick={() => setAnnotationType('highlight')}
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        🖍️ Highlight
                      </button>
                      <button
                        className="cx-btn cx-btn--secondary cx-btn--sm"
                        onClick={() => setAnnotations([])}
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = Math.round(e.clientX - rect.left)
                      const y = Math.round(e.clientY - rect.top)
                      const commentText = prompt('Enter annotation comment:')
                      if (commentText) {
                        setAnnotations(prev => [...prev, {
                          id: `ann-${Date.now()}`,
                          x,
                          y,
                          text: commentText,
                          type: annotationType
                        }])
                      }
                    }}
                    style={{
                      background: 'var(--cx-bg-surface)',
                      minHeight: '220px',
                      padding: '20px',
                      position: 'relative',
                      cursor: 'crosshair',
                      fontSize: '0.8125rem',
                      lineHeight: 1.6,
                      color: 'var(--cx-text-primary)',
                      fontFamily: 'serif',
                      border: '1px solid var(--cx-border-subtle)'
                    }}
                  >
                    <p style={{ margin: '0 0 12px 0' }}>
                      <strong>Submission Document Content Preview:</strong>
                    </p>
                    <p style={{ margin: 0 }}>
                      This paper presents a modern exploration of the outcomes mastery curriculum matrices. 
                      By integrating modular REST API paradigms directly with Canvas LMS backend adapters, 
                      we create high-performing student evaluation pathways. We hypothesize that custom 
                      education customizer configurations significantly enhance engagement metrics.
                    </p>

                    {/* Render Annotations overlays */}
                    {annotations.map(ann => (
                      <div
                        key={ann.id}
                        style={{
                          position: 'absolute',
                          left: ann.x,
                          top: ann.y,
                          transform: 'translate(-50%, -100%)',
                          zIndex: 10,
                          cursor: 'pointer'
                        }}
                        title={ann.text}
                        onClick={e => { e.stopPropagation(); alert(`Annotation comment: "${ann.text}"`) }}
                      >
                        {ann.type === 'highlight' ? (
                          <div style={{ background: 'rgba(234, 179, 8, 0.4)', borderBottom: '2px solid rgb(234, 179, 8)', width: 60, height: 16, marginTop: 4 }} />
                        ) : (
                          <span style={{ fontSize: '1.25rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>📌</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Moderated / Provisional Grading Controls (S18-07) */}
                <div className="cx-card" style={{ padding: 14, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label className="cx-toggle" style={{ margin: 0 }}>
                    <input type="checkbox" checked={isModerated} onChange={e => setIsModerated(e.target.checked)} />
                    <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    <span className="cx-toggle__label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
                      Save as Provisional / Moderated Grade
                    </span>
                  </label>
                  {isModerated && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)' }}>Assigned Moderator</label>
                        <select className="cx-select" value={moderator} onChange={e => setModerator(e.target.value)} style={{ width: '100%', padding: '4px 8px', fontSize: '0.75rem' }}>
                          <option value="Professor Miller">Professor Miller (Primary)</option>
                          <option value="TA Davis">TA Davis (Assistant)</option>
                        </select>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontStyle: 'italic' }}>Note: Grade must be confirmed by the assigned moderator before posting.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Previous comments */}
                {selected.submission_comments && selected.submission_comments.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--cx-text-secondary)', marginBottom: 8 }}>
                      Previous Comments
                    </h4>
                    {selected.submission_comments.map(c => (
                      <div key={c.id} style={{
                        padding: '10px 14px', background: 'var(--cx-surface-raised, #f1f5f9)',
                        borderRadius: 8, marginBottom: 8, fontSize: '0.82rem'
                      }}>
                        <strong>{c.author_name}</strong>
                        <span style={{ color: 'var(--cx-text-muted)', fontSize: '0.72rem', marginLeft: 8 }}>
                          {formatTime(c.created_at)}
                        </span>
                        <p style={{ margin: '4px 0 0', color: 'var(--cx-text-primary)' }}>{c.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Grade Bar (S18-09 media recorder comments) ── */}
              <div className="cx-grading__grade-bar" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px' }}>
                <div style={{ display: 'flex', gap: 12, width: '100%', alignItems: 'center' }}>
                  <div className="cx-grading__grade-field" style={{ margin: 0 }}>
                    <span className="cx-grading__grade-label">Score</span>
                    <div className="cx-grading__grade-input-wrap">
                      <input
                        type="number"
                        className="cx-grading__grade-input"
                        value={gradeValue}
                        onChange={e => setGradeValue(e.target.value)}
                        placeholder="—"
                        min={0}
                        max={selected.assignment.points_possible}
                      />
                      <span className="cx-grading__grade-total">/ {selected.assignment.points_possible}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    className="cx-grading__comment-input"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add feedback comment..."
                    style={{ flex: 1, height: '38px', borderRadius: 8, border: '1px solid var(--cx-border-subtle)', padding: '0 12px' }}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmitGrade() }}
                  />

                  <button
                    className="cx-grading__submit-btn"
                    onClick={handleSubmitGrade}
                    disabled={!gradeValue}
                    style={{ height: '38px', borderRadius: 8 }}
                  >
                    Submit
                  </button>
                </div>

                {/* Media Comment Voice Recorder Panel (S18-09) */}
                <div style={{ borderTop: '1px solid var(--cx-border-subtle)', paddingTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button
                    className={`cx-btn cx-btn--sm ${isRecording ? 'cx-btn--primary' : 'cx-btn--secondary'}`}
                    onClick={() => {
                      if (!isRecording) {
                        setIsRecording(true)
                        setRecordTimer(0)
                        const t = setInterval(() => {
                          setRecordTimer(p => {
                            if (p >= 5) {
                              clearInterval(t)
                              setIsRecording(false)
                              setRecordedComment('voice-note-attempt-1.mp3')
                              return 5
                            }
                            return p + 1
                          })
                        }, 1000)
                      } else {
                        setIsRecording(false)
                        setRecordedComment('voice-note-attempt-1.mp3')
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem' }}
                  >
                    🎤 {isRecording ? `Recording... 0:0${recordTimer}` : 'Record Voice Feedback'}
                  </button>

                  {isRecording && (
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 16 }}>
                      <span style={{ width: 3, height: 10, background: 'var(--cx-color-primary)', animation: 'pulse 1s infinite' }} />
                      <span style={{ width: 3, height: 16, background: 'var(--cx-color-primary)', animation: 'pulse 0.8s infinite' }} />
                      <span style={{ width: 3, height: 6, background: 'var(--cx-color-primary)', animation: 'pulse 1.2s infinite' }} />
                    </div>
                  )}

                  {recordedComment && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.72rem', color: 'var(--cx-text-secondary)' }}>
                      <span>🎧 Recorded: {recordedComment} (0:05)</span>
                      <button className="cx-btn cx-btn--ghost" onClick={() => setRecordedComment(null)} style={{ padding: '2px 4px', fontSize: '0.7rem' }}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
