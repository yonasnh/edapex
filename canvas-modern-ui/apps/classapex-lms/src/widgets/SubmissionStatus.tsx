import React from 'react'

type SubmissionState = 'submitted' | 'late' | 'missing' | 'graded' | 'unsubmitted'

interface SubmissionStatusProps {
  status: SubmissionState
  submittedAt?: string
  grade?: number | null
  pointsPossible?: number
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<SubmissionState, { label: string; className: string }> = {
  submitted:  { label: 'Submitted',  className: 'cx-sub-status--submitted' },
  late:       { label: 'Late',       className: 'cx-sub-status--late' },
  missing:    { label: 'Missing',    className: 'cx-sub-status--missing' },
  graded:     { label: 'Graded',     className: 'cx-sub-status--graded' },
  unsubmitted:{ label: 'Not Submitted', className: 'cx-sub-status--unsubmitted' },
}

const ICONS: Record<SubmissionState, React.ReactNode> = {
  submitted: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>
  ),
  late: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 3"/></svg>
  ),
  missing: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l8 8M14 6l-8 8"/></svg>
  ),
  graded: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>
  ),
  unsubmitted: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="7"/></svg>
  ),
}

export function SubmissionStatus({ status, submittedAt, grade, pointsPossible, size = 'md' }: SubmissionStatusProps) {
  const config = STATUS_CONFIG[status]
  const pct = grade !== undefined && grade !== null && pointsPossible ? Math.round((grade / pointsPossible) * 100) : null

  return (
    <span className={`cx-sub-status ${config.className} cx-sub-status--${size}`}>
      <span className="cx-sub-status__icon">{ICONS[status]}</span>
      <span className="cx-sub-status__label">{config.label}</span>
      {status === 'graded' && grade !== undefined && grade !== null && (
        <span className="cx-sub-status__grade">
          {grade}/{pointsPossible ?? '--'} ({pct}%)
        </span>
      )}
      {submittedAt && status !== 'graded' && (
        <span className="cx-sub-status__time" style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginLeft: 4 }}>
          {new Date(submittedAt).toLocaleDateString()}
        </span>
      )}
    </span>
  )
}
