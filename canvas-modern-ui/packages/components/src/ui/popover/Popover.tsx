import React, { memo, useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface PopoverProps {
  trigger: ReactNode
  children: ReactNode
  placement?: PopoverPlacement
  open?: boolean
  onToggle?: (open: boolean) => void
  className?: string
}

export const Popover = memo<PopoverProps>(({
  trigger,
  children,
  placement = 'bottom',
  open: controlledOpen,
  onToggle,
  className,
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const ref = useRef<HTMLDivElement>(null)

  const setOpen = (v: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(v)
    onToggle?.(v)
  }

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', handler)
    }
  }, [isOpen])

  return (
    <div className={clsx('cm-popover-wrapper', className)} ref={ref}>
      <div className="cm-popover-trigger" onClick={() => setOpen(!isOpen)} role="button" tabIndex={0} aria-expanded={isOpen} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!isOpen) } }}>
        {trigger}
      </div>
      {isOpen && (
        <div className={clsx('cm-popover', `cm-popover--${placement}`)} role="tooltip">
          {children}
        </div>
      )}
    </div>
  )
})

Popover.displayName = 'Popover'
