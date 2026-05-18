import React, { memo } from 'react'
import clsx from 'clsx'
import { CheckIcon, CloseIcon } from '../icon/Icon'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  withOverlay?: boolean
  description?: string
  className?: string
}

const sizeMap = { sm: 16, md: 24, lg: 48 }

export const LoadingSpinner = memo<LoadingSpinnerProps>(({
  size = 'md',
  withOverlay = false,
  description = 'Loading...',
  className
}) => {
  const sizePx = sizeMap[size]

  const spinner = (
    <div
      className={clsx('cm-spinner-wrapper', `cm-spinner-wrapper--${size}`, className)}
      role="status"
      aria-label={description}
    >
      <svg
        className="cm-spinner"
        width={sizePx}
        height={sizePx}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      </svg>
      <span className="cm-spinner__description cm-visually-hidden">{description}</span>
    </div>
  )

  if (withOverlay) {
    return (
      <div className="cm-loading-overlay">
        {spinner}
      </div>
    )
  }

  return spinner
})

LoadingSpinner.displayName = 'LoadingSpinner'

export interface SkeletonCardProps {
  count?: number
  showAvatar?: boolean
  showActions?: boolean
  className?: string
}

export const SkeletonCard = memo<SkeletonCardProps>(({
  count = 1,
  showAvatar = false,
  showActions = false,
  className
}) => {
  const renderSkeleton = (index: number) => (
    <div key={index} className={clsx('cm-skeleton-card', className)}>
      <div className="cm-skeleton-card__header">
        {showAvatar && <div className="cm-skel cm-skel--circle" style={{ width: 40, height: 40 }} />}
        <div className="cm-skeleton-card__title-section">
          <div className="cm-skel cm-skel--heading" style={{ width: '60%' }} />
          <div className="cm-skel cm-skel--text" style={{ width: '40%' }} />
        </div>
      </div>
      <div className="cm-skeleton-card__content">
        <div className="cm-skel cm-skel--text" style={{ width: '100%' }} />
        <div className="cm-skel cm-skel--text" style={{ width: '100%' }} />
        <div className="cm-skel cm-skel--text" style={{ width: '65%' }} />
      </div>
      {showActions && (
        <div className="cm-skeleton-card__actions">
          <div className="cm-skel cm-skel--button" style={{ width: 80, height: 32 }} />
          <div className="cm-skel cm-skel--button" style={{ width: 80, height: 32 }} />
        </div>
      )}
    </div>
  )

  return (
    <div className="cm-skeleton-cards">
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  )
})

SkeletonCard.displayName = 'SkeletonCard'

export interface SkeletonTableProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  className?: string
}

export const SkeletonTable = memo<SkeletonTableProps>(({
  rows = 5,
  columns = 4,
  showHeader = true,
  className
}) => (
  <div className={clsx('cm-skeleton-table', className)}>
    {showHeader && (
      <div className="cm-skeleton-table__header">
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="cm-skel cm-skel--heading" style={{ width: '80%' }} />
        ))}
      </div>
    )}
    <div className="cm-skeleton-table__body">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="cm-skeleton-table__row">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="cm-skel cm-skel--text" style={{ width: '70%' }} />
          ))}
        </div>
      ))}
    </div>
  </div>
))

SkeletonTable.displayName = 'SkeletonTable'

export interface SkeletonListProps {
  count?: number
  showAvatar?: boolean
  showMeta?: boolean
  className?: string
}

export const SkeletonList = memo<SkeletonListProps>(({
  count = 5,
  showAvatar = true,
  showMeta = true,
  className
}) => (
  <div className={clsx('cm-skeleton-list', className)}>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="cm-skeleton-list__item">
        {showAvatar && <div className="cm-skel cm-skel--circle" style={{ width: 36, height: 36 }} />}
        <div className="cm-skeleton-list__content">
          <div className="cm-skel cm-skel--heading" style={{ width: '60%' }} />
          {showMeta && <div className="cm-skel cm-skel--text" style={{ width: '40%' }} />}
          <div className="cm-skel cm-skel--text" style={{ width: '100%' }} />
          <div className="cm-skel cm-skel--text" style={{ width: '85%' }} />
        </div>
      </div>
    ))}
  </div>
))

SkeletonList.displayName = 'SkeletonList'

export interface SkeletonProgressBarProps {
  className?: string
}

export const SkeletonProgressBar = memo<SkeletonProgressBarProps>(({ className }) => (
  <div className={clsx('cm-skel', 'cm-skel--progress', className)} style={{ width: '100%', height: 8, borderRadius: 4 }} />
))

SkeletonProgressBar.displayName = 'SkeletonProgressBar'

export interface PageLoadingProps {
  title?: string
  description?: string
  className?: string
}

export const PageLoading = memo<PageLoadingProps>(({
  title = 'Loading...',
  description = 'Please wait while we load your content.',
  className
}) => (
  <div className={clsx('cm-page-loading', className)}>
    <div className="cm-page-loading__content">
      <LoadingSpinner size="lg" />
      <h2 className="cm-page-loading__title">{title}</h2>
      <p className="cm-page-loading__description">{description}</p>
    </div>
  </div>
))

PageLoading.displayName = 'PageLoading'

export interface InlineLoadingProps {
  status?: 'inactive' | 'active' | 'finished' | 'error'
  description?: string
  successDescription?: string
  errorDescription?: string
  className?: string
}

export const InlineLoading = memo<InlineLoadingProps>(({
  status = 'active',
  description = 'Loading...',
  successDescription = 'Loaded successfully',
  errorDescription = 'Failed to load',
  className
}) => {
  const getDescription = () => {
    switch (status) {
      case 'finished': return successDescription
      case 'error': return errorDescription
      default: return description
    }
  }

  return (
    <div className={clsx('cm-inline-loading', `cm-inline-loading--${status}`, className)}>
      {status === 'active' && <LoadingSpinner size="sm" />}
      {status === 'finished' && <span className="cm-inline-loading__success"><CheckIcon size={16} /></span>}
      {status === 'error' && <span className="cm-inline-loading__error"><CloseIcon size={16} /></span>}
      <span className="cm-inline-loading__description">{getDescription()}</span>
    </div>
  )
})

InlineLoading.displayName = 'InlineLoading'
