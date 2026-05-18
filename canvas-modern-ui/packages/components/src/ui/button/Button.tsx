import React, { forwardRef } from 'react'
import clsx from 'clsx'
import './button.css'

export interface ButtonProps {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  'data-testid'?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  tabIndex?: number
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      iconOnly = false,
      onClick,
      type = 'button',
      className,
      'data-testid': testId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-expanded': ariaExpanded,
      tabIndex,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={clsx(
          'cm-btn',
          `cm-btn--${variant}`,
          `cm-btn--${size}`,
          {
            'cm-btn--loading': loading,
            'cm-btn--icon-only': iconOnly,
          },
          className
        )}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-busy={loading || undefined}
        tabIndex={tabIndex}
        {...props}
      >
        {loading ? (
          <>
            <span className="cm-btn__spinner" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="cm-btn__label">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children'> {
  icon: React.ReactNode
  label: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, ...props }, ref) => (
    <Button ref={ref} iconOnly aria-label={label} {...props}>
      {icon}
    </Button>
  )
)

IconButton.displayName = 'IconButton'

export interface ButtonGroupProps {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  className,
}) => (
  <div
    className={clsx('cm-btn-group', `cm-btn-group--${orientation}`, `cm-btn-group--spacing-${spacing}`, className)}
    role="group"
  >
    {children}
  </div>
)

ButtonGroup.displayName = 'ButtonGroup'
