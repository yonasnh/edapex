import React, { useState, useEffect, useRef, type ReactNode, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'
import { EyeIcon, EyeOffIcon, CloseIcon } from '../icon/Icon'
import './atoms.css'

// ═══════════════════════════════════════
// INPUT
// ═══════════════════════════════════════

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  fullWidth?: boolean
  success?: boolean
}

export function Input({
  label,
  hint,
  error,
  size = 'md',
  icon,
  fullWidth = false,
  success = false,
  id,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const inputId = id || `cm-input-${Math.random().toString(36).slice(2, 8)}`
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint ? `${inputId}-hint` : undefined

  return (
    <div className={clsx('cm-input-group', fullWidth && 'cm-input-group--full', className)}>
      {label && (
        <label htmlFor={inputId} className="cm-input-label">
          {label}
        </label>
      )}
      <div className={clsx(
        'cm-input-wrapper',
        `cm-input-wrapper--${size}`,
        error && 'cm-input-wrapper--error',
        success && !error && 'cm-input-wrapper--success',
      )}>
        {icon && <span className="cm-input-icon">{icon}</span>}
        <input
          id={inputId}
          className="cm-input"
          aria-invalid={!!error}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          disabled={disabled}
          {...props}
        />
      </div>
      {hint && !error && (
        <span id={hintId} className="cm-input-hint">{hint}</span>
      )}
      {error && (
        <span id={errorId} className="cm-input-error" role="alert">{error}</span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// TEXTAREA
// ═══════════════════════════════════════

interface TextareaProps extends Omit<InputHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  fullWidth?: boolean
}

export function Textarea({
  label,
  hint,
  error,
  fullWidth = false,
  id,
  className = '',
  ...props
}: TextareaProps) {
  const textareaId = id || `cm-textarea-${Math.random().toString(36).slice(2, 8)}`
  const errorId = error ? `${textareaId}-error` : undefined

  return (
    <div className={clsx('cm-input-group', fullWidth && 'cm-input-group--full', className)}>
      {label && (
        <label htmlFor={textareaId} className="cm-input-label">
          {label}
        </label>
      )}
      <div className={clsx('cm-input-wrapper cm-textarea-wrapper', error && 'cm-input-wrapper--error')}>
        <textarea
          id={textareaId}
          className="cm-input cm-textarea"
          aria-invalid={!!error}
          aria-describedby={errorId}
          {...props}
        />
      </div>
      {hint && !error && <span className="cm-input-hint">{hint}</span>}
      {error && <span id={errorId} className="cm-input-error" role="alert">{error}</span>}
    </div>
  )
}

// ═══════════════════════════════════════
// SELECT
// ═══════════════════════════════════════

interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || `cm-select-${Math.random().toString(36).slice(2, 8)}`

  return (
    <div className={clsx('cm-input-group', className)}>
      {label && <label htmlFor={selectId} className="cm-input-label">{label}</label>}
      <div className={clsx('cm-input-wrapper', error && 'cm-input-wrapper--error')}>
        <select id={selectId} className="cm-input cm-select" {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {hint && !error && <span className="cm-input-hint">{hint}</span>}
      {error && <span className="cm-input-error" role="alert">{error}</span>}
    </div>
  )
}

// ═══════════════════════════════════════
// CHECKBOX
// ═══════════════════════════════════════

interface CheckboxProps {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
}

export function Checkbox({ label, checked, onChange, disabled, id }: CheckboxProps) {
  const cbId = id || `cm-cb-${Math.random().toString(36).slice(2, 8)}`

  return (
    <label htmlFor={cbId} className={clsx('cm-checkbox', disabled && 'cm-checkbox--disabled')}>
      <input
        id={cbId}
        type="checkbox"
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      {label}
    </label>
  )
}

// ═══════════════════════════════════════
// RADIO
// ═══════════════════════════════════════

interface RadioProps {
  label?: string
  name: string
  value: string
  checked?: boolean
  onChange?: (value: string) => void
  disabled?: boolean
}

export function Radio({ label, name, value, checked, onChange, disabled }: RadioProps) {
  const radioId = `cm-radio-${name}-${value}`

  return (
    <label htmlFor={radioId} className={clsx('cm-radio', disabled && 'cm-radio--disabled')}>
      <input
        id={radioId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
        disabled={disabled}
      />
      {label}
    </label>
  )
}

// ═══════════════════════════════════════
// SWITCH
// ═══════════════════════════════════════

interface SwitchProps {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
}

export function Switch({ label, checked, onChange, disabled, id }: SwitchProps) {
  const swId = id || `cm-sw-${Math.random().toString(36).slice(2, 8)}`

  return (
    <label htmlFor={swId} className={clsx('cm-switch', disabled && 'cm-switch--disabled')}>
      <input
        id={swId}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <span className="cm-switch__track">
        <span className="cm-switch__thumb" />
      </span>
      {label}
    </label>
  )
}

// ═══════════════════════════════════════
// SEARCH INPUT
// ═══════════════════════════════════════

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  onSearch?: (value: string) => void
  fullWidth?: boolean
}

export function SearchInput({
  label,
  hint,
  onSearch,
  fullWidth = false,
  className = '',
  ...props
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const searchId = `cm-search-${Math.random().toString(36).slice(2, 8)}`

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className={clsx('cm-input-group', fullWidth && 'cm-input-group--full', className)}>
      {label && <label htmlFor={searchId} className="cm-input-label">{label}</label>}
      <div className="cm-input-wrapper cm-search-input-wrapper">
        <svg className="cm-search-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M7.5 13A5.5 5.5 0 107.5 2a5.5 5.5 0 000 11zM14 14l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          ref={inputRef}
          id={searchId}
          type="search"
          className="cm-input cm-search-input"
          onChange={e => onSearch?.(e.target.value)}
          {...props}
        />
        <kbd className="cm-search-input-kbd">⌘K</kbd>
      </div>
      {hint && <span className="cm-input-hint">{hint}</span>}
    </div>
  )
}

// ═══════════════════════════════════════
// PASSWORD INPUT
// ═══════════════════════════════════════

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  fullWidth?: boolean
}

export function PasswordInput({
  label,
  hint,
  error,
  fullWidth = false,
  id,
  className = '',
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const pwId = id || `cm-pw-${Math.random().toString(36).slice(2, 8)}`
  const errorId = error ? `${pwId}-error` : undefined

  return (
    <div className={clsx('cm-input-group', fullWidth && 'cm-input-group--full', className)}>
      {label && <label htmlFor={pwId} className="cm-input-label">{label}</label>}
      <div className={clsx('cm-input-wrapper', error && 'cm-input-wrapper--error')}>
        <input
          id={pwId}
          type={visible ? 'text' : 'password'}
          className="cm-input"
          aria-invalid={!!error}
          aria-describedby={errorId}
          {...props}
        />
        <button
          type="button"
          className="cm-password-toggle"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>
      {hint && !error && <span className="cm-input-hint">{hint}</span>}
      {error && <span id={errorId} className="cm-input-error" role="alert">{error}</span>}
    </div>
  )
}

// ═══════════════════════════════════════
// BADGE
// ═══════════════════════════════════════

interface BadgeProps {
  children?: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
  size?: 'sm' | 'md'
  dot?: boolean
  count?: number
}

export function Badge({ children, variant = 'default', size = 'md', dot = false, count }: BadgeProps) {
  if (count !== undefined) {
    return (
      <span className={clsx('cm-badge', `cm-badge--${variant}`, 'cm-badge--count')} aria-label={`${count} items`}>
        {count > 99 ? '99+' : count}
      </span>
    )
  }

  return (
    <span className={clsx('cm-badge', `cm-badge--${variant}`, `cm-badge--${size}`, dot && 'cm-badge--dot')}>
      {dot && <span className="cm-badge__dot" />}
      {children}
    </span>
  )
}

// ═══════════════════════════════════════
// AVATAR
// ═══════════════════════════════════════

interface AvatarProps {
  src?: string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'away' | 'offline'
  className?: string
}

const AVATAR_SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getColorIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 10
}

export function Avatar({ src, name, size = 'md', status, className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const px = AVATAR_SIZES[size]

  return (
    <div
      className={clsx('cm-avatar', `cm-avatar--${size}`, className)}
      style={{ width: px, height: px }}
      title={name}
      role="img"
      aria-label={name}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          className="cm-avatar__img"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className={clsx('cm-avatar__initials', `cm-avatar__initials--c${getColorIndex(name)}`)}
          style={{ fontSize: px * 0.38 }}
        >
          {getInitials(name)}
        </span>
      )}
      {status && (
        <span className={clsx('cm-avatar__status', `cm-avatar__status--${status}`)} aria-label={`Status: ${status}`} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// MODAL
// ═══════════════════════════════════════

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
  closeOnOverlay?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  closeOnOverlay = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement
      dialog.showModal()
    } else {
      dialog.close()
      previousFocus.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className={clsx('cm-modal', `cm-modal--${size}`)}
      aria-labelledby={title ? 'cm-modal-title' : undefined}
      onClick={(e) => {
        if (closeOnOverlay && e.target === dialogRef.current) onClose()
      }}
    >
      <div className="cm-modal__content">
        {title && (
          <div className="cm-modal__header">
            <h2 id="cm-modal-title" className="cm-modal__title">{title}</h2>
            <button
              className="cm-modal__close"
              onClick={onClose}
              aria-label="Close dialog"
              type="button"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        )}
        <div className="cm-modal__body">{children}</div>
        {footer && <div className="cm-modal__footer">{footer}</div>}
      </div>
    </dialog>
  )
}
