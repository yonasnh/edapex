import React, { memo } from 'react'
import clsx from 'clsx'

export interface ProgressBarProps {
  value?: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  label?: string
  showLabel?: boolean
  indeterminate?: boolean
  className?: string
}

export const ProgressBar = memo<ProgressBarProps>(({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  label,
  showLabel = false,
  indeterminate = false,
  className,
}) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={clsx('cm-progress', `cm-progress--${size}`, className)} role="progressbar" aria-valuenow={indeterminate ? undefined : value} aria-valuemin={0} aria-valuemax={max} aria-label={label || 'Progress'}>
      <div className={clsx('cm-progress__track', indeterminate && 'cm-progress__track--indeterminate')}>
        <div
          className={clsx('cm-progress__fill', `cm-progress__fill--${variant}`, indeterminate && 'cm-progress__fill--indeterminate')}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
      {showLabel && !indeterminate && (
        <span className="cm-progress__label">{Math.round(pct)}%</span>
      )}
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'
