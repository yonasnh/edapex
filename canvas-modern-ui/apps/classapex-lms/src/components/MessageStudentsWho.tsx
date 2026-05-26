import React, { useMemo, useState } from 'react'
import { canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import clsx from 'clsx'

export interface Student {
  id: string
  name: string
  email?: string
  avatar_url?: string
}

export interface MessageStudentsWhoProps {
  courseId: string
  students: Student[]
  assignmentId?: string
  isOpen: boolean
  onClose: () => void
  onSent: () => void
}

type FilterType =
  | 'not_submitted'
  | 'not_graded'
  | 'scored_less_than'
  | 'scored_more_than'
  | 'late'

interface SubmissionMap {
  [studentId: string]: {
    submitted_at?: string
    grade?: string | number
    score?: number
    workflow_state?: string
    late?: boolean
    missing?: boolean
    graded_at?: string
  }
}

export default function MessageStudentsWho({
  courseId,
  students,
  assignmentId,
  isOpen,
  onClose,
  onSent,
}: MessageStudentsWhoProps) {
  const { showToast } = useNotification()
  const [filterType, setFilterType] = useState<FilterType>('not_submitted')
  const [threshold, setThreshold] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  // Fetch submissions if we have an assignment to filter against
  const [submissionMap, setSubmissionMap] = useState<SubmissionMap>({})
  const [submissionsLoaded, setSubmissionsLoaded] = useState(false)

  React.useEffect(() => {
    if (!isOpen || !assignmentId) {
      setSubmissionsLoaded(true)
      return
    }

    let cancelled = false
    setSubmissionsLoaded(false)

    canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`, {
      method: 'GET',
    })
      .then((data: any[]) => {
        if (cancelled) return
        const map: SubmissionMap = {}
        ;(Array.isArray(data) ? data : []).forEach((sub: any) => {
          map[String(sub.user_id)] = {
            submitted_at: sub.submitted_at,
            grade: sub.grade,
            score: sub.score,
            workflow_state: sub.workflow_state,
            late: sub.late,
            missing: sub.missing,
            graded_at: sub.graded_at,
          }
        })
        setSubmissionMap(map)
        setSubmissionsLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setSubmissionsLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, courseId, assignmentId])

  const filteredStudents = useMemo(() => {
    if (!students.length) return []

    switch (filterType) {
      case 'not_submitted': {
        if (!assignmentId) return students
        return students.filter(s => {
          const sub = submissionMap[s.id]
          return !sub || sub.workflow_state === 'unsubmitted' || sub.missing
        })
      }
      case 'not_graded': {
        if (!assignmentId) return []
        return students.filter(s => {
          const sub = submissionMap[s.id]
          return sub && sub.submitted_at && !sub.graded_at && sub.workflow_state !== 'unsubmitted'
        })
      }
      case 'scored_less_than': {
        if (!assignmentId || threshold === '') return []
        const val = Number(threshold)
        if (isNaN(val)) return []
        return students.filter(s => {
          const sub = submissionMap[s.id]
          return sub && sub.score != null && sub.score < val
        })
      }
      case 'scored_more_than': {
        if (!assignmentId || threshold === '') return []
        const val = Number(threshold)
        if (isNaN(val)) return []
        return students.filter(s => {
          const sub = submissionMap[s.id]
          return sub && sub.score != null && sub.score > val
        })
      }
      case 'late': {
        if (!assignmentId) return []
        return students.filter(s => {
          const sub = submissionMap[s.id]
          return sub && sub.late
        })
      }
      default:
        return []
    }
  }, [students, filterType, threshold, submissionMap, assignmentId])

  const handleSend = async () => {
    if (!subject.trim()) {
      showToast({ title: 'Subject required', type: 'warning' })
      return
    }
    if (!body.trim()) {
      showToast({ title: 'Message body required', type: 'warning' })
      return
    }
    if (filteredStudents.length === 0) {
      showToast({ title: 'No recipients', message: 'No students match the selected filter.', type: 'warning' })
      return
    }

    setSending(true)
    try {
      await canvasFetch('/api/v1/conversations', {
        method: 'POST',
        body: {
          recipients: filteredStudents.map(s => s.id),
          subject: subject.trim(),
          body: body.trim(),
          force_new: true,
        },
      })
      showToast({
        title: 'Message sent',
        message: `Sent to ${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''}.`,
        type: 'success',
      })
      onSent()
      handleClose()
    } catch (err: any) {
      showToast({ title: 'Send failed', message: err.message || 'Could not send message.', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setFilterType('not_submitted')
    setThreshold('')
    setSubject('')
    setBody('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="cx-modal-overlay" onClick={handleClose}>
      <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="cx-modal__header">
          <h2 className="cx-modal__title">Message Students Who…</h2>
          <button className="cx-btn cx-btn--ghost" onClick={handleClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg>
          </button>
        </div>

        <div className="cx-modal__body" style={{ overflow: 'auto' }}>
          {/* Filter Options */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 8 }}>
              Filter
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <FilterOption
                label="Haven't submitted"
                selected={filterType === 'not_submitted'}
                onSelect={() => setFilterType('not_submitted')}
              />
              <FilterOption
                label="Haven't been graded"
                selected={filterType === 'not_graded'}
                onSelect={() => setFilterType('not_graded')}
              />
              <FilterOption
                label="Scored less than"
                selected={filterType === 'scored_less_than'}
                onSelect={() => setFilterType('scored_less_than')}
              >
                {filterType === 'scored_less_than' && (
                  <input
                    type="number"
                    className="cx-input cx-btn--sm"
                    style={{ width: 80, marginLeft: 8 }}
                    placeholder="0"
                    value={threshold}
                    onChange={e => setThreshold(e.target.value)}
                  />
                )}
              </FilterOption>
              <FilterOption
                label="Scored more than"
                selected={filterType === 'scored_more_than'}
                onSelect={() => setFilterType('scored_more_than')}
              >
                {filterType === 'scored_more_than' && (
                  <input
                    type="number"
                    className="cx-input cx-btn--sm"
                    style={{ width: 80, marginLeft: 8 }}
                    placeholder="0"
                    value={threshold}
                    onChange={e => setThreshold(e.target.value)}
                  />
                )}
              </FilterOption>
              <FilterOption
                label="Late submissions"
                selected={filterType === 'late'}
                onSelect={() => setFilterType('late')}
              />
            </div>
          </div>

          {/* Recipient Count */}
          <div
            style={{
              background: 'var(--cx-bg-surface-sunken)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>Matching students</span>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--cx-color-primary)' }}>
              {!submissionsLoaded && assignmentId ? '…' : filteredStudents.length}
            </span>
          </div>

          {/* Compose */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>
                Subject
              </label>
              <input
                type="text"
                className="cx-input"
                style={{ width: '100%' }}
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Enter subject…"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>
                Message
              </label>
              <textarea
                className="cx-input"
                style={{ width: '100%', minHeight: 120, resize: 'vertical' }}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Type your message here…"
              />
            </div>
          </div>
        </div>

        <div className="cx-modal__footer">
          <button className="cx-btn cx-btn--secondary" onClick={handleClose} disabled={sending}>
            Cancel
          </button>
          <button
            className="cx-btn cx-btn--primary"
            onClick={handleSend}
            disabled={sending || filteredStudents.length === 0 || !subject.trim() || !body.trim()}
          >
            {sending ? 'Sending…' : `Send to ${filteredStudents.length}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterOption({
  label,
  selected,
  onSelect,
  children,
}: {
  label: string
  selected: boolean
  onSelect: () => void
  children?: React.ReactNode
}) {
  return (
    <label
      className={clsx('cx-filter-option')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 6,
        border: `1px solid ${selected ? 'var(--cx-color-primary)' : 'var(--cx-border-subtle)'}`,
        background: selected ? 'var(--cx-color-primary-subtle)' : 'var(--cx-bg-surface)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        color: 'var(--cx-text-primary)',
        userSelect: 'none',
      }}
    >
      <input type="radio" checked={selected} onChange={onSelect} style={{ accentColor: 'var(--cx-color-primary)', cursor: 'pointer' }} />
      <span style={{ flex: 1 }}>{label}</span>
      {children}
    </label>
  )
}
