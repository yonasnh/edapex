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

const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 1, user_id: 101,
    user: { id: 101, name: 'Emma Thompson' },
    assignment_id: 201, assignment: { id: 201, name: 'Binary Search Tree Implementation', points_possible: 100, course_id: 1, due_at: '2026-05-17T23:59:00Z' },
    course_name: 'CS 301 — Data Structures',
    workflow_state: 'submitted', submitted_at: '2026-05-17T22:30:00Z',
    body: 'Here is my implementation of a Binary Search Tree in Python. I implemented insert, delete, search, and in-order traversal methods. The delete method handles all three cases: leaf node, node with one child, and node with two children.\n\n```python\nclass Node:\n    def __init__(self, key):\n        self.left = None\n        self.right = None\n        self.val = key\n\nclass BST:\n    def __init__(self):\n        self.root = None\n    \n    def insert(self, key):\n        if self.root is None:\n            self.root = Node(key)\n        else:\n            self._insert_recursive(self.root, key)\n    \n    def _insert_recursive(self, node, key):\n        if key < node.val:\n            if node.left is None:\n                node.left = Node(key)\n            else:\n                self._insert_recursive(node.left, key)\n        else:\n            if node.right is None:\n                node.right = Node(key)\n            else:\n                self._insert_recursive(node.right, key)\n```\n\nI also included 8 unit tests covering edge cases like empty tree operations and duplicate insertions.',
    late: false, missing: false, attempt: 1, submission_type: 'online_text_entry',
    submission_comments: [],
  },
  {
    id: 2, user_id: 102,
    user: { id: 102, name: 'Marcus Chen' },
    assignment_id: 201, assignment: { id: 201, name: 'Binary Search Tree Implementation', points_possible: 100, course_id: 1, due_at: '2026-05-17T23:59:00Z' },
    course_name: 'CS 301 — Data Structures',
    workflow_state: 'submitted', submitted_at: '2026-05-18T02:15:00Z',
    body: 'My BST implementation with all required methods. I used an iterative approach for insertion and search for better performance on large datasets. The traversal methods include in-order, pre-order, and post-order.\n\nI went beyond the requirements by also implementing a balanced BST (AVL tree) variant with automatic rebalancing on insertions.',
    late: true, missing: false, attempt: 1, submission_type: 'online_text_entry',
    submission_comments: [],
  },
  {
    id: 3, user_id: 103,
    user: { id: 103, name: 'Priya Patel' },
    assignment_id: 201, assignment: { id: 201, name: 'Binary Search Tree Implementation', points_possible: 100, course_id: 1, due_at: '2026-05-17T23:59:00Z' },
    course_name: 'CS 301 — Data Structures',
    workflow_state: 'graded', submitted_at: '2026-05-17T18:00:00Z', graded_at: '2026-05-18T10:00:00Z',
    score: 95, grade: 'A',
    body: 'Complete BST implementation with comprehensive test suite. Included visualization method using ASCII art to display tree structure.',
    late: false, missing: false, attempt: 1, submission_type: 'online_text_entry',
    submission_comments: [
      { id: 301, author_name: 'Dr. Sarah Chen', comment: 'Excellent work! Your visualization method is creative and well-implemented. -5 for minor style issues.', created_at: '2026-05-18T10:00:00Z' }
    ],
  },
  {
    id: 4, user_id: 104,
    user: { id: 104, name: 'Jordan Rivera' },
    assignment_id: 202, assignment: { id: 202, name: 'Essay: Graph Theory Applications', points_possible: 75, course_id: 1, due_at: '2026-05-18T23:59:00Z' },
    course_name: 'CS 301 — Data Structures',
    workflow_state: 'submitted', submitted_at: '2026-05-18T14:00:00Z',
    body: 'This essay explores real-world applications of graph theory in social network analysis, GPS navigation systems, and recommendation engines. I discuss how Dijkstra\'s algorithm powers modern mapping services and how PageRank revolutionized web search.',
    late: false, missing: false, attempt: 1, submission_type: 'online_text_entry',
    submission_comments: [],
  },
  {
    id: 5, user_id: 105,
    user: { id: 105, name: 'Taylor Kim' },
    assignment_id: 201, assignment: { id: 201, name: 'Binary Search Tree Implementation', points_possible: 100, course_id: 1, due_at: '2026-05-17T23:59:00Z' },
    course_name: 'CS 301 — Data Structures',
    workflow_state: 'submitted', submitted_at: '2026-05-18T08:00:00Z',
    body: 'Resubmitting after incorporating feedback from the initial review. Added proper error handling and improved the delete method to handle the successor/predecessor approach correctly.',
    late: true, missing: false, attempt: 2, submission_type: 'online_text_entry',
    submission_comments: [
      { id: 501, author_name: 'Dr. Sarah Chen', comment: 'Please fix the delete method — it doesn\'t correctly handle the case with two children.', created_at: '2026-05-17T09:00:00Z' }
    ],
  },
  {
    id: 6, user_id: 106,
    user: { id: 106, name: 'Alex Washington' },
    assignment_id: 202, assignment: { id: 202, name: 'Essay: Graph Theory Applications', points_possible: 75, course_id: 1, due_at: '2026-05-18T23:59:00Z' },
    course_name: 'CS 301 — Data Structures',
    workflow_state: 'submitted', submitted_at: '2026-05-18T12:00:00Z',
    body: 'In this essay I examine how graph coloring algorithms solve scheduling problems in university timetabling and resource allocation. I present three case studies from educational institutions.',
    late: false, missing: false, attempt: 1, submission_type: 'online_text_entry',
    submission_comments: [],
  },
]

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

  // Canvas API — with fallback to mock
  const { data: apiSubmissions } = useCanvasQuery<Submission[]>(
    '/api/v1/courses/1/students/submissions',
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
          <h1 className="cx-grading__title">Grading Queue</h1>
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
                <div className="cx-grading__submission-meta">
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

                <div className="cx-grading__submission-body">
                  {selected.body || 'No submission text. Check attachments.'}
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

              {/* ── Grade Bar ── */}
              <div className="cx-grading__grade-bar">
                <div className="cx-grading__grade-field">
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
                  placeholder="Add a comment..."
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmitGrade() }}
                />
                <button
                  className="cx-grading__submit-btn"
                  onClick={handleSubmitGrade}
                  disabled={!gradeValue}
                >
                  Submit Grade
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
