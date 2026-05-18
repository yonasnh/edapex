import React, { memo, type ReactNode, type MouseEvent } from 'react'
import clsx from 'clsx'
import './Card.css'

export type CardVariant = 'default' | 'stat' | 'interactive' | 'settings' | 'summary'

export type CardDensity = 'comfortable' | 'default' | 'compact'

export interface CardProps {
  children?: ReactNode
  variant?: CardVariant
  density?: CardDensity
  icon?: ReactNode
  title?: string
  subtitle?: string
  headerActions?: ReactNode
  footer?: ReactNode
  onClick?: (e: MouseEvent) => void
  href?: string
  selected?: boolean
  disabled?: boolean
  className?: string
}

export const Card = memo<CardProps>(({
  children,
  variant = 'default',
  density = 'default',
  icon,
  title,
  subtitle,
  headerActions,
  footer,
  onClick,
  href,
  selected = false,
  disabled = false,
  className,
}) => {
  const isInteractive = variant === 'interactive' || !!onClick || !!href
  const role = isInteractive ? 'button' : undefined
  const tabIndex = isInteractive && !disabled ? 0 : undefined

  const content = (
    <>
      {(title || subtitle || icon || headerActions) && (
        <div className="cm-card__header">
          {icon && <div className="cm-card__icon" aria-hidden="true">{icon}</div>}
          <div className="cm-card__titles">
            {title && <div className="cm-card__title">{title}</div>}
            {subtitle && <div className="cm-card__subtitle">{subtitle}</div>}
          </div>
          {headerActions && <div className="cm-card__header-actions">{headerActions}</div>}
        </div>
      )}
      {children && (
        <div className={clsx('cm-card__body', variant === 'stat' && 'cm-card__body--stat')}>
          {children}
        </div>
      )}
      {footer && <div className="cm-card__footer">{footer}</div>}
    </>
  )

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={clsx('cm-card', `cm-card--${variant}`, `cm-card--${density}`, isInteractive && 'cm-card--interactive', selected && 'cm-card--selected', className)}
        aria-current={selected ? 'page' : undefined}
      >
        {content}
      </a>
    )
  }

  return (
    <div
      className={clsx('cm-card', `cm-card--${variant}`, `cm-card--${density}`, isInteractive && 'cm-card--interactive', selected && 'cm-card--selected', className)}
      onClick={disabled ? undefined : onClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={isInteractive && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(e as unknown as MouseEvent)
        }
      } : undefined}
      aria-disabled={disabled || undefined}
    >
      {content}
    </div>
  )
})

Card.displayName = 'Card'
