import React, { useState, useRef, useEffect, type ReactNode } from 'react'
import { Avatar, Badge } from '../atoms/Atoms'
import { 
  BookIcon, 
  UserIcon, 
  EditIcon, 
  FileIcon, 
  SearchIcon, 
  HomeIcon, 
  CalendarIcon, 
  ChatIcon, 
  SettingsIcon,
  CloseIcon 
} from '../icon/Icon'
import './TopBar.css'
import './GlobalSearchModal.css' // Import shared styles for highlights/groups

export interface SearchResult {
  id: string
  title: string
  type: 'course' | 'user' | 'assignment' | 'page' | 'file'
  subtitle?: string
  url: string
}

interface TopBarProps {
  userName: string
  userAvatar?: string
  userRole?: string
  notificationCount?: number
  theme?: 'light' | 'dark'
  onThemeToggle?: () => void
  onSearch?: (query: string) => void
  searchResults?: SearchResult[]
  isSearching?: boolean
  onNotificationsClick?: () => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onLogout?: () => void
  breadcrumb?: ReactNode
}

// Pre-defined System Commands / Actions
const SYSTEM_ACTIONS = [
  { id: 'action-dashboard', title: 'Go to Dashboard', type: 'action' as const, subtitle: 'Jump to main dashboard view', url: '/', icon: 'home', keywords: ['dashboard', 'home', 'nav', 'main'] },
  { id: 'action-calendar', title: 'Go to Calendar', type: 'action' as const, subtitle: 'View course event schedules', url: '/calendar', icon: 'calendar', keywords: ['calendar', 'schedule', 'dates', 'agenda', 'events'] },
  { id: 'action-inbox', title: 'Go to Inbox', type: 'action' as const, subtitle: 'Open direct conversation messages', url: '/inbox', icon: 'chat', keywords: ['inbox', 'chat', 'message', 'mail', 'conversation'] },
  { id: 'action-settings', title: 'Go to Settings', type: 'action' as const, subtitle: 'Manage your profile and preferences', url: '/settings', icon: 'settings', keywords: ['settings', 'profile', 'timezone', 'preferences'] },
  { id: 'action-theme', title: 'Toggle Light/Dark Theme', type: 'action' as const, subtitle: 'Switch interface appearance mode', url: '#theme', icon: 'settings', keywords: ['theme', 'dark', 'light', 'mode', 'appearance'] },
  { id: 'action-contrast', title: 'Toggle High Contrast Mode', type: 'action' as const, subtitle: 'Enable high-contrast layout filters', url: '#contrast', icon: 'settings', keywords: ['contrast', 'accessibility', 'a11y', 'high contrast'] },
]

export function TopBar({
  userName,
  userAvatar,
  userRole,
  notificationCount = 0,
  theme = 'light',
  onThemeToggle,
  onSearch,
  searchResults = [],
  isSearching = false,
  onNotificationsClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
  breadcrumb,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showUserMenu, setShowUserMenu] = useState(false)

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Listen to keyboard escape or outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false)
        setIsDropdownOpen(false)
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', escapeHandler)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', escapeHandler)
    }
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    if (isDropdownOpen) {
      setActiveIndex(0)
      try {
        const history = JSON.parse(localStorage.getItem('classapex-recent-searches') || '[]') as string[]
        setRecentSearches(history)
      } catch (e) {
        setRecentSearches([])
      }
    }
  }, [isDropdownOpen])

  // Focus search input on cx:focus-search custom event (Cmd+K action)
  useEffect(() => {
    const handleFocusSearch = () => {
      searchInputRef.current?.focus()
      setIsDropdownOpen(true)
    }
    window.addEventListener('cx:focus-search' as any, handleFocusSearch)
    return () => window.removeEventListener('cx:focus-search' as any, handleFocusSearch)
  }, [])

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  // Reset active keyboard focus index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [searchQuery, searchResults])

  const lowerQuery = searchQuery.toLowerCase().trim()
  const matchingActions = lowerQuery 
    ? SYSTEM_ACTIONS.filter(act => 
        act.title.toLowerCase().includes(lowerQuery) || 
        act.subtitle.toLowerCase().includes(lowerQuery) ||
        act.keywords.some(k => k.includes(lowerQuery))
      )
    : []

  // Flattened structure to simplify keyboard arrow navigation mapping
  const flatItems = searchQuery.trim()
    ? [...searchResults, ...matchingActions]
    : [
        ...recentSearches.map(term => ({ id: `recent-${term}`, title: term, type: 'recent' as const, url: '', subtitle: 'Recent Search' })),
        ...SYSTEM_ACTIONS
      ]

  const handleSelect = (item: any) => {
    if (item.type === 'recent') {
      setSearchQuery(item.title)
    } else if (item.type === 'action') {
      if (item.url === '#theme') {
        document.dispatchEvent(new CustomEvent('cx:toggle-theme'))
      } else if (item.url === '#contrast') {
        document.dispatchEvent(new CustomEvent('cx:toggle-contrast'))
      } else {
        window.location.href = item.url
      }
      setIsDropdownOpen(false)
      searchInputRef.current?.blur()
    } else {
      // General search query select
      if (searchQuery.trim()) {
        const next = [searchQuery.trim(), ...recentSearches.filter(x => x !== searchQuery.trim())].slice(0, 5)
        localStorage.setItem('classapex-recent-searches', JSON.stringify(next))
      }
      window.location.href = item.url
      setIsDropdownOpen(false)
      searchInputRef.current?.blur()
    }
  }

  // Keyboard navigation within the dropdown
  useEffect(() => {
    if (!isDropdownOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => (flatItems.length > 0 ? (prev + 1) % flatItems.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => (flatItems.length > 0 ? (prev - 1 + flatItems.length) % flatItems.length : 0))
      } else if (e.key === 'Enter' && flatItems[activeIndex]) {
        e.preventDefault()
        handleSelect(flatItems[activeIndex])
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDropdownOpen, flatItems, activeIndex])

  // Scroll active list node into view inside dropdown
  useEffect(() => {
    if (dropdownRef.current && flatItems.length > 0) {
      const activeEl = dropdownRef.current.querySelector('[aria-selected="true"]') as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex, flatItems])

  // Match Highlighter function for search text matches
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>
    const cleanHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex chars
    const regex = new RegExp(`(${cleanHighlight})`, 'gi')
    const parts = text.split(regex)
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? <mark key={i} className="cm-search-highlight">{part}</mark> : part
        )}
      </span>
    )
  }

  return (
    <div className="cm-topbar">
      <div className="cm-topbar__left">
        {breadcrumb}
      </div>

      <div 
        className={`cm-topbar__search ${isDropdownOpen ? 'cm-topbar__search--mobile-active' : ''}`}
        ref={searchContainerRef}
      >
        <svg className="cm-topbar__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          ref={searchInputRef}
          type="search"
          className="cm-topbar__search-input"
          placeholder="Search courses, assignments, people..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          aria-label="Search"
        />
        {searchQuery && (
          <button 
            type="button" 
            className="cm-search-clear-btn" 
            onClick={() => setSearchQuery('')} 
            aria-label="Clear search input"
            style={{ marginRight: 4 }}
          >
            <CloseIcon size={16} />
          </button>
        )}
        {isSearching && <div className="cm-search-spinner" style={{ marginRight: 4 }} />}
        <kbd className="cm-topbar__search-kbd">⌘K</kbd>

        {/* Dynamic Autocomplete Dropdown */}
        {isDropdownOpen && (
          <div className="cm-search-dropdown" ref={dropdownRef}>
            {flatItems.length === 0 ? (
              <div className="cm-search-empty">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <div className="cm-search-body" style={{ maxHeight: '320px', padding: 0 }}>
                {searchQuery.trim() ? (
                  <div>
                    {/* Courses Group */}
                    {flatItems.some(item => item.type === 'course') && (
                      <div className="cm-search-group">
                        <div className="cm-search-group-header">Courses</div>
                        <ul className="cm-search-group-list">
                          {flatItems.filter(item => item.type === 'course').map(r => {
                            const globalIdx = flatItems.findIndex(x => x.id === r.id)
                            const isSelected = activeIndex === globalIdx
                            return (
                              <li
                                key={r.id}
                                className={`cm-search-result-item ${isSelected ? 'cm-search-result-item--active' : ''}`}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setActiveIndex(globalIdx)}
                                onClick={() => handleSelect(r)}
                              >
                                <div className="cm-search-result-icon">
                                  <BookIcon size={16} />
                                </div>
                                <div className="cm-search-result-content">
                                  <span className="cm-search-result-title">{renderHighlighted(r.title, searchQuery)}</span>
                                  {r.subtitle && <span className="cm-search-result-subtitle">{r.subtitle}</span>}
                                </div>
                                <Badge variant="default" size="sm">Course</Badge>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Assignments & Quizzes Group */}
                    {flatItems.some(item => item.type === 'assignment') && (
                      <div className="cm-search-group">
                        <div className="cm-search-group-header">Assignments & Quizzes</div>
                        <ul className="cm-search-group-list">
                          {flatItems.filter(item => item.type === 'assignment').map(r => {
                            const globalIdx = flatItems.findIndex(x => x.id === r.id)
                            const isSelected = activeIndex === globalIdx
                            return (
                              <li
                                key={r.id}
                                className={`cm-search-result-item ${isSelected ? 'cm-search-result-item--active' : ''}`}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setActiveIndex(globalIdx)}
                                onClick={() => handleSelect(r)}
                              >
                                <div className="cm-search-result-icon">
                                  <EditIcon size={16} />
                                </div>
                                <div className="cm-search-result-content">
                                  <span className="cm-search-result-title">{renderHighlighted(r.title, searchQuery)}</span>
                                  {r.subtitle && <span className="cm-search-result-subtitle">{r.subtitle}</span>}
                                </div>
                                <Badge variant="default" size="sm">Assignment</Badge>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* People Group */}
                    {flatItems.some(item => item.type === 'user') && (
                      <div className="cm-search-group">
                        <div className="cm-search-group-header">People</div>
                        <ul className="cm-search-group-list">
                          {flatItems.filter(item => item.type === 'user').map(r => {
                            const globalIdx = flatItems.findIndex(x => x.id === r.id)
                            const isSelected = activeIndex === globalIdx
                            return (
                              <li
                                key={r.id}
                                className={`cm-search-result-item ${isSelected ? 'cm-search-result-item--active' : ''}`}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setActiveIndex(globalIdx)}
                                onClick={() => handleSelect(r)}
                              >
                                <div className="cm-search-result-icon">
                                  <UserIcon size={16} />
                                </div>
                                <div className="cm-search-result-content">
                                  <span className="cm-search-result-title">{renderHighlighted(r.title, searchQuery)}</span>
                                  {r.subtitle && <span className="cm-search-result-subtitle">{r.subtitle}</span>}
                                </div>
                                <Badge variant="default" size="sm">People</Badge>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Resources & Files Group */}
                    {flatItems.some(item => item.type === 'page' || item.type === 'file') && (
                      <div className="cm-search-group">
                        <div className="cm-search-group-header">Resources & Files</div>
                        <ul className="cm-search-group-list">
                          {flatItems.filter(item => item.type === 'page' || item.type === 'file').map(r => {
                            const globalIdx = flatItems.findIndex(x => x.id === r.id)
                            const isSelected = activeIndex === globalIdx
                            return (
                              <li
                                key={r.id}
                                className={`cm-search-result-item ${isSelected ? 'cm-search-result-item--active' : ''}`}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setActiveIndex(globalIdx)}
                                onClick={() => handleSelect(r)}
                              >
                                <div className="cm-search-result-icon">
                                  <FileIcon size={16} />
                                </div>
                                <div className="cm-search-result-content">
                                  <span className="cm-search-result-title">{renderHighlighted(r.title, searchQuery)}</span>
                                  {r.subtitle && <span className="cm-search-result-subtitle">{r.subtitle}</span>}
                                </div>
                                <Badge variant="default" size="sm">Resource</Badge>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Matching System Commands Group */}
                    {flatItems.some(item => item.type === 'action') && (
                      <div className="cm-search-group">
                        <div className="cm-search-group-header">System Commands</div>
                        <ul className="cm-search-group-list">
                          {flatItems.filter(item => item.type === 'action').map(r => {
                            const globalIdx = flatItems.findIndex(x => x.id === r.id)
                            const isSelected = activeIndex === globalIdx
                            return (
                              <li
                                key={r.id}
                                className={`cm-search-result-item ${isSelected ? 'cm-search-result-item--active' : ''}`}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setActiveIndex(globalIdx)}
                                onClick={() => handleSelect(r)}
                              >
                                <div className="cm-search-result-icon">
                                  {getIconForAction(r.icon)}
                                </div>
                                <div className="cm-search-result-content">
                                  <span className="cm-search-result-title">{renderHighlighted(r.title, searchQuery)}</span>
                                  <span className="cm-search-result-subtitle">{r.subtitle}</span>
                                </div>
                                <Badge variant="default" size="sm">Command</Badge>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="cm-search-default-view" style={{ padding: 0 }}>
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="cm-search-group">
                        <div className="cm-search-group-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Recent Searches</span>
                          <button 
                            type="button"
                            className="cm-search-clear-all" 
                            onClick={(e) => {
                              e.stopPropagation()
                              localStorage.removeItem('classapex-recent-searches')
                              setRecentSearches([])
                            }}
                          >
                            Clear History
                          </button>
                        </div>
                        <ul className="cm-search-group-list">
                          {recentSearches.map((term, index) => {
                            const globalIdx = index
                            const isSelected = activeIndex === globalIdx
                            return (
                              <li
                                key={`recent-${term}`}
                                className={`cm-search-result-item ${isSelected ? 'cm-search-result-item--active' : ''}`}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setActiveIndex(globalIdx)}
                                onClick={() => setSearchQuery(term)}
                              >
                                <div className="cm-search-result-icon">
                                  <SearchIcon size={16} />
                                </div>
                                <div className="cm-search-result-content">
                                  <span className="cm-search-result-title">{term}</span>
                                </div>
                                <button 
                                  type="button"
                                  className="cm-search-delete-history"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const next = recentSearches.filter(x => x !== term)
                                    localStorage.setItem('classapex-recent-searches', JSON.stringify(next))
                                    setRecentSearches(next)
                                  }}
                                  aria-label="Remove search history item"
                                >
                                  <CloseIcon size={16} />
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Quick System Navigation */}
                    <div className="cm-search-group">
                      <div className="cm-search-group-header">Quick Commands</div>
                      <ul className="cm-search-group-list">
                        {SYSTEM_ACTIONS.map(r => {
                          const globalIdx = recentSearches.length + SYSTEM_ACTIONS.findIndex(x => x.id === r.id)
                          const isSelected = activeIndex === globalIdx
                          return (
                            <li
                              key={r.id}
                              className={`cm-search-result-item ${isSelected ? 'cm-search-result-item--active' : ''}`}
                              role="option"
                              aria-selected={isSelected}
                              onMouseEnter={() => setActiveIndex(globalIdx)}
                              onClick={() => handleSelect(r)}
                            >
                              <div className="cm-search-result-icon">
                                {getIconForAction(r.icon)}
                              </div>
                              <div className="cm-search-result-content">
                                <span className="cm-search-result-title">{r.title}</span>
                                <span className="cm-search-result-subtitle">{r.subtitle}</span>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Legend / Keybinding Footer */}
            <div className="cm-search-footer" style={{ padding: '8px 12px', borderTop: '1px solid var(--cm-border-default, #e2e8f0)', marginTop: 8 }}>
              <div className="cm-search-footer-hint">
                <kbd>↑↓</kbd> Navigate
              </div>
              <div className="cm-search-footer-hint">
                <kbd>↵</kbd> Select
              </div>
              <div className="cm-search-footer-hint">
                <kbd>Esc</kbd> Close
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="cm-topbar__right">
        <button
          className="cm-topbar__action cm-topbar__action--search"
          onClick={() => {
            searchInputRef.current?.focus()
            setIsDropdownOpen(true)
          }}
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

function getIconForAction(iconName: string) {
  const iconProps = { size: 16 as const }
  switch (iconName) {
    case 'home': return <HomeIcon {...iconProps} />
    case 'calendar': return <CalendarIcon {...iconProps} />
    case 'chat': return <ChatIcon {...iconProps} />
    case 'settings': return <SettingsIcon {...iconProps} />
    default: return <SettingsIcon {...iconProps} />
  }
}
