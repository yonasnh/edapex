import React, { useState, useRef, useEffect, type ReactNode } from 'react'
import { Avatar } from '../atoms/Atoms'
import './TopBar.css'

interface TopBarProps {
  userName: string
  userAvatar?: string
  userRole?: string
  notificationCount?: number
  theme?: 'light' | 'dark'
  onThemeToggle?: () => void
  onSearch?: (query: string) => void
  onNotificationsClick?: () => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onLogout?: () => void
  breadcrumb?: ReactNode
}

export function TopBar({
  userName,
  userAvatar,
  userRole,
  notificationCount = 0,
  theme = 'light',
  onThemeToggle,
  onSearch,
  onNotificationsClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
  breadcrumb,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowUserMenu(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) onSearch?.(searchQuery.trim())
  }

  return (
    <div className="cm-topbar">
      <div className="cm-topbar__left">
        {breadcrumb}
      </div>

      <form className="cm-topbar__search" onSubmit={handleSearch} role="search">
        <svg className="cm-topbar__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="search"
          className="cm-topbar__search-input"
          placeholder="Search courses, assignments, people..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search"
        />
        <kbd className="cm-topbar__search-kbd">⌘K</kbd>
      </form>

      <div className="cm-topbar__right">
        <button
          className="cm-topbar__action cm-topbar__action--search"
          onClick={() => onSearch?.('')}
          aria-label="Open Search"
          title="Search"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {onThemeToggle && (
          <button
            className="cm-topbar__action"
            onClick={onThemeToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            type="button"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M15 11.5A7.5 7.5 0 016.5 3 7.5 7.5 0 1015 11.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}

        <button
          className="cm-topbar__action"
          onClick={onNotificationsClick}
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 18a2 2 0 01-2-2h4a2 2 0 01-2 2zM16 13H4l1-1V8a5 5 0 0110 0v4l1 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {notificationCount > 0 && (
            <span className="cm-topbar__badge">{notificationCount > 9 ? '9+' : notificationCount}</span>
          )}
        </button>

        <div className="cm-topbar__user" ref={menuRef}>
          <button
            className="cm-topbar__user-btn"
            onClick={() => setShowUserMenu(v => !v)}
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            type="button"
          >
            <Avatar src={userAvatar} name={userName} size="sm" />
            <span className="cm-topbar__user-name">{userName}</span>
            <svg className={`cm-topbar__chevron ${showUserMenu ? 'cm-topbar__chevron--open' : ''}`} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {showUserMenu && (
            <div className="cm-topbar__menu" role="menu">
              <div className="cm-topbar__menu-header">
                <strong>{userName}</strong>
                {userRole && <span className="cm-topbar__menu-role">{userRole}</span>}
              </div>
              <div className="cm-topbar__menu-divider" />
              <button className="cm-topbar__menu-item" role="menuitem" onClick={() => { setShowUserMenu(false); onProfileClick?.() }}>
                Profile
              </button>
              <button className="cm-topbar__menu-item" role="menuitem" onClick={() => { setShowUserMenu(false); onSettingsClick?.() }}>
                Settings
              </button>
              <div className="cm-topbar__menu-divider" />
              <button className="cm-topbar__menu-item cm-topbar__menu-item--danger" role="menuitem" onClick={() => { setShowUserMenu(false); onLogout?.() }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
