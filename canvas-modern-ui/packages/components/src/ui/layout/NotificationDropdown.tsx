/**
 * ClassApex Notification Dropdown
 * ================================
 * Displays recent activity stream items and notifications.
 */

import React, { useRef, useEffect } from 'react'
import { Badge } from '../atoms/Atoms'
import { MegaphoneIcon, ChatIcon, EditIcon, BellIcon, CheckCircleIcon, StarIcon } from '../icon/Icon'
import './NotificationDropdown.css'

export interface ActivityStreamItem {
  id: number
  title: string
  message: string
  type: string
  read_state: boolean
  created_at: string
  html_url: string
  course_id?: number
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  items: ActivityStreamItem[]
  isLoading?: boolean
  onMarkAllRead?: () => void
}

export function NotificationDropdown({
  isOpen,
  onClose,
  items,
  isLoading = false,
  onMarkAllRead,
}: NotificationDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      // Don't close if clicking the notification toggle button
      if ((e.target as Element).closest('.cx-topbar__action')) return
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const unreadCount = items.filter(i => !i.read_state).length

  return (
    <div className="cx-notification-dropdown" ref={menuRef} role="dialog" aria-label="Notifications">
      <div className="cx-notification-dropdown__header">
        <h3 className="cx-notification-dropdown__title">Notifications</h3>
        {unreadCount > 0 && onMarkAllRead && (
          <button className="cx-notification-dropdown__mark-read" onClick={onMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="cx-notification-dropdown__body" aria-live="polite">
        {isLoading ? (
          <div className="cx-notification-dropdown__loading">
            <div className="cx-skeleton cx-skeleton--list" />
            <div className="cx-skeleton cx-skeleton--list" />
          </div>
        ) : items.length === 0 ? (
          <div className="cx-notification-dropdown__empty">
            <span className="cx-notification-dropdown__empty-icon"><CheckCircleIcon size={24} /></span>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <ul className="cx-notification-list">
            {items.map((item) => (
              <li key={item.id} className={`cx-notification-item ${!item.read_state ? 'cx-notification-item--unread' : ''}`}>
                <a href={item.html_url} className="cx-notification-item__link">
                  <div className="cx-notification-item__icon">
                    {getIconForType(item.type)}
                  </div>
                  <div className="cx-notification-item__content">
                    <span className="cx-notification-item__title">{item.title}</span>
                    <span className="cx-notification-item__message">{item.message}</span>
                    <span className="cx-notification-item__time">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {!item.read_state && <div className="cx-notification-item__dot" />}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="cx-notification-dropdown__footer">
        <a href="/notifications" className="cx-notification-dropdown__view-all">
          View all activity
        </a>
      </div>
    </div>
  )
}

function getIconForType(type: string) {
  const iconProps = { size: 16 as const }
  switch (type.toLowerCase()) {
    case 'announcement': return <MegaphoneIcon {...iconProps} />
    case 'conversation': return <ChatIcon {...iconProps} />
    case 'assignment': return <EditIcon {...iconProps} />
    case 'discussiontopic': return <ChatIcon {...iconProps} />
    case 'submission': return <CheckCircleIcon {...iconProps} />
    case 'grade': return <StarIcon {...iconProps} />
    default: return <BellIcon {...iconProps} />
  }
}
