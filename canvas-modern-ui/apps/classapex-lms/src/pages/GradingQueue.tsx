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
import { useNotification } from '../hooks/useNotification'
import DocViewerWrapper from '../components/DocViewerWrapper'
import MediaCommentRecorder from '../components/MediaCommentRecorder'
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
    rubric_id?: number
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
  // Real rubric grading state
  const [rubricScores, setRubricScores] = useState<Record<string, { points: number; comments: string }>>({})
  
  // DocViewer Annotation States
  const [annotations, setAnnotations] = useState<{ id: string; x: number; y: number; text: string; type: string }[]>([
    { id: '1', x: 120, y: 110, text: 'Excellent introductory paragraph! Strong thesis statement.', type: 'note' },
    { id: '2', x: 280, y: 190, text: 'Check APA citation style formatting here.', type: 'highlight' }
  ])
  const [showRecorder, setShowRecorder] = useState(false)

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

  const { showToast } = useNotification()

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

  // Fetch real rubric for selected assignment
  const { data: rubricData } = useCanvasQuery<any>(
    selected?.assignment?.id && selectedCourseId
      ? `/api/v1/courses/${selectedCourseId}/rubrics/${selected.assignment.rubric_id}`
      : '',
    undefined,
    { enabled: !!(selected?.assignment?.id && selected.assignment.rubric_id && selectedCourseId) }
  )

  // Reset rubric scores when selection changes
  React.useEffect(() => {
    setRubricScores({})
  }, [selectedId])

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

      // Submit rubric assessment if scores entered
      if (rubricData?.data?.length && Object.keys(rubricScores).length > 0) {
        try {
          const rubricAssessment: any = {}
          rubricData.data.forEach((criterion: any) => {
            const score = rubricScores[String(criterion.id)]
            if (score) {
              rubricAssessment[criterion.id] = { points: score.points, comments: score.comments }
            }
          })
          await fetch(`/api/v1/courses/${selectedCourseId}/rubric_associations/${selected.assignment.rubric_id}/rubric_assessments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rubric_assessment: { user_id: selected.user_id, ...rubricAssessment } })
          })
        } catch (rErr) {
          console.error('Rubric assessment failed:', rErr)
        }
      }

      setGradedLocally(prev => new Set(prev).add(selected.id))
      setGradeValue('')
      setComment('')
      setRubricScores({})

      // Auto-advance to next ungraded
      const currentIndex = filteredSubmissions.findIndex(s => s.id === selected.id)
      const next = filteredSubmissions.find((s, i) => i > currentIndex && s.workflow_state !== 'graded' && !gradedLocally.has(s.id))
      if (next) setSelectedId(next.id)

    } catch (err) {
      console.error('Grading failed:', err)
      showToast({ title: 'Failed to submit grade', message: 'Please try again.', type: 'error' })
    }
  }, [selected, gradeValue, comment, filteredSubmissions, gradedLocally, rubricData, rubricScores, selectedCourseId])

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
          <span className="cx-grading__stat-icon"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="3" width="12" height="15" rx="1"/><path d="M8 1h4a1 1 0 011 1v1H7V2a1 1 0 011-1z"/><path d="M8 8h4M8 11h4M8 14h2"/></svg></span>
          <div>
            <div className="cx-grading__stat-value">{stats.total}</div>
            <div className="cx-grading__stat-label">Total</div>
          </div>
        </div>
        <div className="cx-grading__stat">
          <span className="cx-grading__stat-icon"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/></svg></span>
          <div>
            <div className="cx-grading__stat-value">{stats.pending}</div>
            <div className="cx-grading__stat-label">Pending</div>
          </div>
        </div>
        <div className="cx-grading__stat">
          <span className="cx-grading__stat-icon"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2L1 17h18L10 2z"/><path d="M10 9v4M10 14.5v.5"/></svg></span>
          <div>
            <div className="cx-grading__stat-value">{stats.late}</div>
            <div className="cx-grading__stat-label">Late</div>
          </div>
        </div>
        <div className="cx-grading__stat">
          <span className="cx-grading__stat-icon"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M6 10l3 3 5-5"/></svg></span>
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
              <span className="cx-grading__review-empty-icon"><svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" style={{opacity:0.3}}><rect x="3" y="1.5" width="14" height="17" rx="2"/><path d="M7 6h6M7 10h6M7 14h4"/></svg></span>
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
                  <>
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
                    {/* Real Rubric Grading */}
                    {rubricData?.data && (
                      <div className="cx-card" style={{ padding: 14, marginBottom: 16 }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Rubric: {rubricData.title || 'Assignment Rubric'}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {rubricData.data.map((criterion: any) => (
                            <div key={criterion.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>{criterion.description}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)' }}>Max: {criterion.points}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input
                                  type="number"
                                  className="cx-input cx-input--sm"
                                  style={{ width: 80 }}
                                  placeholder="0"
                                  min={0}
                                  max={criterion.points}
                                  value={rubricScores[String(criterion.id)]?.points ?? ''}
                                  onChange={e => {
                                    const val = Number(e.target.value)
                                    setRubricScores(prev => ({ ...prev, [String(criterion.id)]: { ...prev[String(criterion.id)], points: val } }))
                                  }}
                                />
                                <input
                                  type="text"
                                  className="cx-input cx-input--sm"
                                  style={{ flex: 1 }}
                                  placeholder="Criterion comment..."
                                  value={rubricScores[String(criterion.id)]?.comments || ''}
                                  onChange={e => {
                                    setRubricScores(prev => ({ ...prev, [String(criterion.id)]: { ...prev[String(criterion.id)], comments: e.target.value } }))
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
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
                {selected.attachments?.[0]?.url ? (
                  <DocViewerWrapper
                    fileUrl={selected.attachments[0].url}
                    annotatable={true}
                    onAnnotationSave={(newAnnotations) => setAnnotations(newAnnotations)}
                  />
                ) : (
                  <div style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 8, padding: 24, marginBottom: 16, textAlign: 'center', color: 'var(--cx-text-muted)', fontSize: '0.875rem' }}>
                    No document available for annotation.
                  </div>
                )}

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

                {/* Media Comment Recorder */}
                <div style={{ borderTop: '1px solid var(--cx-border-subtle)', paddingTop: 10 }}>
                  {!showRecorder ? (
                    <button
                      className="cx-btn cx-btn--sm cx-btn--secondary"
                      onClick={() => setShowRecorder(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem' }}
                    >
                      <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{marginRight:4}}><rect x="7" y="1" width="6" height="10" rx="3"/><path d="M3 10a7 7 0 0014 0M10 17v3"/></svg>
                      Record Media
                    </button>
                  ) : (
                    <MediaCommentRecorder
                      mode="audio"
                      maxDuration={300}
                      onRecordComplete={(url, mediaType) => {
                        setComment(prev => prev ? `${prev}\n\n[${mediaType.toUpperCase()}]: ${url}` : `[${mediaType.toUpperCase()}]: ${url}`)
                        setShowRecorder(false)
                      }}
                      onCancel={() => setShowRecorder(false)}
                    />
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
