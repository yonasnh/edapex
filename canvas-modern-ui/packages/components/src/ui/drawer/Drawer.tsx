import React, { memo, useEffect, useRef, type ReactNode, type MouseEvent } from 'react'
import clsx from 'clsx'
import { CloseIcon } from '../icon/Icon'

export type DrawerSide = 'left' | 'right'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  side?: DrawerSide
  title?: string
  children: ReactNode
  width?: number
  className?: string
}

export const Drawer = memo<DrawerProps>(({
  isOpen,
  onClose,
  side = 'right',
  title,
  children,
  width = 360,
  className,
}) => {
  const prevFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      prevFocus.current = document.activeElement as HTMLElement
    } else if (prevFocus.current) {
      prevFocus.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="cm-drawer-overlay" onClick={onClose} role="presentation">
      <div
        className={clsx('cm-drawer', `cm-drawer--${side}`, className)}
        style={{ width }}
        onClick={(e: MouseEvent) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Drawer'}
      >
        <div className="cm-drawer__header">
          {title && <h2 className="cm-drawer__title">{title}</h2>}
          <button className="cm-drawer__close" onClick={onClose} aria-label="Close drawer" type="button"><CloseIcon size={16} /></button>
        </div>
        <div className="cm-drawer__body">{children}</div>
      </div>
    </div>
  )
})

Drawer.displayName = 'Drawer'
