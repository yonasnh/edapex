import React, { memo, type ReactNode } from 'react'
import clsx from 'clsx'
import { Button, type ButtonProps } from '../button/Button'
import { AlertTriangleIcon, WarningIcon, InfoIcon } from '../icon/Icon'

const CourseIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M12 6v7" />
    <path d="M9 9l3-3 3 3" />
  </svg>
)

const DocumentIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const ChatIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="14" y2="13" />
  </svg>
)

const CalendarIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const SearchIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export interface EmptyStateProps {
  icon?: React.ComponentType<any>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: ButtonProps['variant']
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'error' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const EmptyState = memo<EmptyStateProps>(({
  icon: IconComponent,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'md',
  className
}) => {
  const iconSize = size === 'lg' ? 64 : size === 'md' ? 48 : 32

  const DefaultIcon = () => {
    switch (variant) {
      case 'error': return <span style={{ color: 'var(--cm-status-danger-text)' }}><AlertTriangleIcon size={24} /></span>
      case 'warning': return <span style={{ color: 'var(--cm-status-warning-text)' }}><WarningIcon size={24} /></span>
      case 'info': return <span style={{ color: 'var(--cm-status-info-text)' }}><InfoIcon size={24} /></span>
      default: return <span style={{ color: 'var(--cm-text-tertiary)' }}><AlertTriangleIcon size={24} /></span>
    }
  }

  return (
    <div className={clsx('cm-empty-state', `cm-empty-state--${variant}`, `cm-empty-state--${size}`, className)}>
      <div className="cm-empty-state__icon" aria-hidden="true">
        {IconComponent ? <IconComponent size={iconSize} /> : <DefaultIcon />}
      </div>
      <div className="cm-empty-state__content">
        <h3 className="cm-empty-state__title">{title}</h3>
        {description && <p className="cm-empty-state__description">{description}</p>}
      </div>
      {(action || secondaryAction) && (
        <div className="cm-empty-state__actions">
          {action && (
            <Button variant={action.variant || 'primary'} onClick={action.onClick} size="sm">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick} size="sm">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
})

EmptyState.displayName = 'EmptyState'

export const EmptyStates = {
  NoCourses: memo<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>>(props => (
    <EmptyState icon={CourseIcon} title="No courses found" description="You're not enrolled in any courses yet." {...props} />
  )),

  NoAssignments: memo<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>>(props => (
    <EmptyState icon={DocumentIcon} title="No assignments" description="There are no assignments available at this time." {...props} />
  )),

  NoDiscussions: memo<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>>(props => (
    <EmptyState icon={ChatIcon} title="No discussions" description="No discussion topics have been created yet." {...props} />
  )),

  NoEvents: memo<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>>(props => (
    <EmptyState icon={CalendarIcon} title="No events scheduled" description="Your calendar is clear for this period." {...props} />
  )),

  NoSearchResults: memo<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>>(props => (
    <EmptyState icon={SearchIcon} title="No results found" description="Try adjusting your search terms or filters." {...props} />
  )),

  Error: memo<Omit<EmptyStateProps, 'icon' | 'title' | 'variant'>>(props => (
    <EmptyState title="Something went wrong" variant="error" {...props} />
  )),

  NetworkError: memo<Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'variant'>>(props => (
    <EmptyState title="Connection problem" description="Please check your internet connection and try again." variant="error" {...props} />
  )),

  Unauthorized: memo<Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'variant'>>(props => (
    <EmptyState title="Access denied" description="You don't have permission to view this content." variant="warning" {...props} />
  )),

  Maintenance: memo<Omit<EmptyStateProps, 'icon' | 'title' | 'description' | 'variant'>>(props => (
    <EmptyState title="Under maintenance" description="This feature is temporarily unavailable." variant="info" {...props} />
  )),
}

Object.entries(EmptyStates).forEach(([key, Component]) => {
  Component.displayName = `EmptyStates.${key}`
})
