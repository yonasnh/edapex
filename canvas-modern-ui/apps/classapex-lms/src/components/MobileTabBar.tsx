import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import clsx from 'clsx'

interface MobileTabBarProps {
  notificationCount?: number
  inboxCount?: number
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  notificationCount = 0,
  inboxCount = 0
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      href: '/dashboard',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: 'courses',
      label: 'Courses',
      href: '/courses',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
          <path d="M6 6h10M6 10h10"/>
        </svg>
      )
    },
    {
      id: 'calendar',
      label: 'Calendar',
      href: '/calendar',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      id: 'inbox',
      label: 'Inbox',
      href: '/inbox',
      badge: inboxCount,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return path === '/dashboard' || path === '/dashboard/v1'
    }
    return path.startsWith(href)
  }

  return (
    <nav className="cx-mobile-tab-bar" aria-label="Mobile Navigation">
      <div className="cx-mobile-tab-bar__container">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={clsx('cx-mobile-tab-bar__item', active && 'cx-mobile-tab-bar__item--active')}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="cx-mobile-tab-bar__icon-wrapper">
                {item.icon}
                {!!item.badge && (
                  <span className="cx-mobile-tab-bar__badge" role="status" aria-label={`${item.badge} unread items`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="cx-mobile-tab-bar__label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
