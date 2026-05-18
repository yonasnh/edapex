import React from 'react'

type SubmissionState = 'submitted' | 'late' | 'missing' | 'graded' | 'unsubmitted'

interface SubmissionStatusProps {
  status: SubmissionState
  submittedAt?: string
  grade?: number | null
  pointsPossible?: number
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<SubmissionState, { label: string; icon: string; className: string }> = {
  submitted:  { label: 'Submitted',  icon: 'check',     className: 'cx-sub-status--submitted' },
  late:       { label: 'Late',       icon: 'warning',   className: 'cx-sub-status--late' },
  missing:    { label: 'Missing',    icon: 'x',         className: 'cx-sub-status--missing' },
  graded:     { label: 'Graded',     icon: 'check',     className: 'cx-sub-status--graded' },
  unsubmitted:{ label: 'Not Submitted', icon: 'circle', className: 'cx-sub-status--unsubmitted' },
}

export function SubmissionStatus({ status, submittedAt, grade, pointsPossible, size = 'md' }: SubmissionStatusProps) {
  const config = STATUS_CONFIG[status]
  const pct = grade !== undefined && grade !== null && pointsPossible ? Math.round((grade / pointsPossible) * 100) : null

  return (
    <span className={`cx-sub-status ${config.className} cx-sub-status--${size}`}>
      <span className="cx-sub-status__icon">{config.icon}</span>
      <span className="cx-sub-status__label">{config.label}</span>
      {status === 'graded' && grade !== undefined && grade !== null && (
        <span className="cx-sub-status__grade">
          {grade}/{pointsPossible ?? '--'} ({pct}%)
        </span>
      )}
    </span>
  )
}
