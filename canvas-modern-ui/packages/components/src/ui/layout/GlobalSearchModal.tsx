/**
 * ClassApex Global Search Modal
 * ==============================
 * Command-K style global search overlay & command palette.
 */

import React, { useState, useEffect, useRef } from 'react'
import { Badge } from '../atoms/Atoms'
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
import './GlobalSearchModal.css'

export interface SearchResult {
  id: string
  title: string
  type: 'course' | 'user' | 'assignment' | 'page' | 'file'
  subtitle?: string
  url: string
}

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  results: SearchResult[]
  isLoading?: boolean
}

// Pre-defined System Commands / Actions
const SYSTEM_ACTIONS = [
  { id: 'action-dashboard', title: 'Go to Dashboard', type: 'action', subtitle: 'Jump to main dashboard view', url: '/', icon: 'home', keywords: ['dashboard', 'home', 'nav', 'main'] },
  { id: 'action-calendar', title: 'Go to Calendar', type: 'action', subtitle: 'View course event schedules', url: '/calendar', icon: 'calendar', keywords: ['calendar', 'schedule', 'dates', 'agenda', 'events'] },
  { id: 'action-inbox', title: 'Go to Inbox', type: 'action', subtitle: 'Open direct conversation messages', url: '/inbox', icon: 'chat', keywords: ['inbox', 'chat', 'message', 'mail', 'conversation'] },
  { id: 'action-settings', title: 'Go to Settings', type: 'action', subtitle: 'Manage your profile and preferences', url: '/settings', icon: 'settings', keywords: ['settings', 'profile', 'timezone', 'preferences'] },
  { id: 'action-theme', title: 'Toggle Light/Dark Theme', type: 'action', subtitle: 'Switch interface appearance mode', url: '#theme', icon: 'settings', keywords: ['theme', 'dark', 'light', 'mode', 'appearance'] },
  { id: 'action-contrast', title: 'Toggle High Contrast Mode', type: 'action', subtitle: 'Enable high-contrast layout filters', url: '#contrast', icon: 'settings', keywords: ['contrast', 'accessibility', 'a11y', 'high contrast'] },
]

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSearch,
  results,
  isLoading = false,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcut (Cmd/Ctrl + K) to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('cx:open-search'))
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setActiveIndex(0)
      try {
        const history = JSON.parse(localStorage.getItem('classapex-recent-searches') || '[]') as string[]
        setRecentSearches(history)
      } catch (e) {
        setRecentSearches([])
      }
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Debounce search callbacks
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 250)
    return () => clearTimeout(timer)
  }, [query, onSearch])

  // Helper to save a query term
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return
    const cleanTerm = term.trim()
    const next = [cleanTerm, ...recentSearches.filter(x => x !== cleanTerm)].slice(0, 5)
    localStorage.setItem('classapex-recent-searches', JSON.stringify(next))
    setRecentSearches(next)
  }

  // Helper to delete a single query term
  const deleteRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation()
    const next = recentSearches.filter(x => x !== term)
    localStorage.setItem('classapex-recent-searches', JSON.stringify(next))
    setRecentSearches(next)
  }

  // Helper to clear all recent search history
  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.removeItem('classapex-recent-searches')
    setRecentSearches([])
  }

  // Filter commands by keywords matching query
  const lowerQuery = query.toLowerCase().trim()
  const matchingActions = lowerQuery 
    ? SYSTEM_ACTIONS.filter(act => 
        act.title.toLowerCase().includes(lowerQuery) || 
        act.subtitle.toLowerCase().includes(lowerQuery) ||
        act.keywords.some(k => k.includes(lowerQuery))
      )
    : []

  // Define flat items layout for unified keyboard arrow indexing
  const flatItems = query.trim()
    ? [...results, ...matchingActions]
    : [
        ...recentSearches.map(term => ({ id: `recent-${term}`, title: term, type: 'recent' as const, url: '', subtitle: 'Recent Search' })),
        ...SYSTEM_ACTIONS
      ]

  // Reset active index when search results change
  useEffect(() => {
    setActiveIndex(0)
  }, [query, results])

  // Handle selected item trigger
  const handleSelect = (item: any) => {
    if (item.type === 'recent') {
      setQuery(item.title)
    } else if (item.type === 'action') {
      if (item.url === '#theme') {
        document.dispatchEvent(new CustomEvent('cx:toggle-theme'))
      } else if (item.url === '#contrast') {
        document.dispatchEvent(new CustomEvent('cx:toggle-contrast'))
      } else {
        window.location.href = item.url
      }
      onClose()
    } else {
      // General SearchResult
      saveRecentSearch(query)
      window.location.href = item.url
      onClose()
    }
  }

  // Keyboard navigation within command palette
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
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
  }, [isOpen, flatItems, activeIndex, onClose])

  // Scroll active list node into view
  useEffect(() => {
    if (bodyRef.current && flatItems.length > 0) {
      const activeEl = bodyRef.current.querySelector('[aria-selected="true"]') as HTMLElement
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

  const courses = results.filter(r => r.type === 'course')
  const users = results.filter(r => r.type === 'user')
  const assignments = results.filter(r => r.type === 'assignment')
  const resources = results.filter(r => r.type === 'page' || r.type === 'file')
  const commands = matchingActions

  if (!isOpen) return null

  return (
    <div className="cm-search-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Global Search Command Palette">
      <div className="cm-search-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className="cm-search-header">
          <SearchIcon size={20} className="cm-search-icon" />
          <input
            ref={inputRef}
            className="cm-search-input"
            placeholder="Type a command or search... (courses, people, assignments)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Command palette input"
          />
          {query && (
            <button className="cm-search-clear-btn" onClick={() => setQuery('')} aria-label="Clear input">
              <CloseIcon size={16} />
            </button>
          )}
          {isLoading && <div className="cm-search-spinner" />}
          <button className="cm-search-close" onClick={onClose} aria-label="Close search">Esc</button>
        </div>

        {/* Search Results / Default Body */}
        <div className="cm-search-body" ref={bodyRef}>
          {!query.trim() ? (
            <div className="cm-search-default-view">
              
              {/* Recent History */}
              {recentSearches.length > 0 && (
                <div className="cm-search-group">
                  <div className="cm-search-group-header">
                    <span>Recent Searches</span>
                    <button className="cm-search-clear-all" onClick={clearAllRecent}>Clear History</button>
                  </div>
                  <ul className="cm-search-group-list">
                    {recentSearches.map((term, index) => {
                      const globalItem = flatItems[index]
                      const isSelected = flatItems[activeIndex]?.id === globalItem?.id
                      return (
                        <li
                          key={term}
                          className={`cm-search-result-item ${isSelected ? 'cm-search-result-item--active' : ''}`}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => handleSelect(globalItem)}
                        >
                          <div className="cm-search-result-icon">
                            <SearchIcon size={16} />
                          </div>
                          <div className="cm-search-result-content">
                            <span className="cm-search-result-title">{term}</span>
                          </div>
                          <button 
                            className="cm-search-delete-history" 
                            onClick={(e) => deleteRecentSearch(e, term)}
                            aria-label="Remove search query"
                          >
                            <CloseIcon size={16} />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Quick Navigation / Shortcuts */}
              <div className="cm-search-group">
                <div className="cm-search-group-header">Quick Commands</div>
                <ul className="cm-search-group-list">
                  {SYSTEM_ACTIONS.map((act, idx) => {
                    const globalIdx = recentSearches.length + idx
                    const isSelected = flatItems[activeIndex]?.id === act.id
                    return (
                      <li
                        key={act.id}
                        className={`cm-search-result-item ${isSelected ? 'cm-search-result-item--active' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        onClick={() => handleSelect(act)}
                      >
                        <div className="cm-search-result-icon">
                          {getIconForType('action', act.icon)}
                        </div>
                        <div className="cm-search-result-content">
                          <span className="cm-search-result-title">{act.title}</span>
                          <span className="cm-search-result-subtitle">{act.subtitle}</span>
                        </div>
                        <Badge variant="default" size="sm">Command</Badge>
                      </li>
                    )
                  })}
                </ul>
              </div>

            </div>
          ) : (
            <div className="cm-search-results-view">
              {isLoading && results.length === 0 ? (
                <div className="cm-search-empty">Searching Canvas...</div>
              ) : flatItems.length > 0 ? (
                <div className="cm-search-group-container">
                  
                  {/* Courses Group */}
                  {courses.length > 0 && (
                    <div className="cm-search-group">
                      <div className="cm-search-group-header">Courses</div>
                      <ul className="cm-search-group-list">
                        {courses.map(r => {
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
                                {getIconForType(r.type)}
                              </div>
                              <div className="cm-search-result-content">
                                <span className="cm-search-result-title">{renderHighlighted(r.title, query)}</span>
                                {r.subtitle && <span className="cm-search-result-subtitle">{r.subtitle}</span>}
                              </div>
                              <Badge variant="default" size="sm">Course</Badge>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Assignments Group */}
                  {assignments.length > 0 && (
                    <div className="cm-search-group">
                      <div className="cm-search-group-header">Assignments & Quizzes</div>
                      <ul className="cm-search-group-list">
                        {assignments.map(r => {
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
                                {getIconForType(r.type)}
                              </div>
                              <div className="cm-search-result-content">
                                <span className="cm-search-result-title">{renderHighlighted(r.title, query)}</span>
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
                  {users.length > 0 && (
                    <div className="cm-search-group">
                      <div className="cm-search-group-header">People</div>
                      <ul className="cm-search-group-list">
                        {users.map(r => {
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
                                {getIconForType(r.type)}
                              </div>
                              <div className="cm-search-result-content">
                                <span className="cm-search-result-title">{renderHighlighted(r.title, query)}</span>
                                {r.subtitle && <span className="cm-search-result-subtitle">{r.subtitle}</span>}
                              </div>
                              <Badge variant="default" size="sm">User</Badge>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Resources Group */}
                  {resources.length > 0 && (
                    <div className="cm-search-group">
                      <div className="cm-search-group-header">Resources & Files</div>
                      <ul className="cm-search-group-list">
                        {resources.map(r => {
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
                                {getIconForType(r.type)}
                              </div>
                              <div className="cm-search-result-content">
                                <span className="cm-search-result-title">{renderHighlighted(r.title, query)}</span>
                                {r.subtitle && <span className="cm-search-result-subtitle">{r.subtitle}</span>}
                              </div>
                              <Badge variant="default" size="sm">{r.type}</Badge>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Matching Actions Group */}
                  {commands.length > 0 && (
                    <div className="cm-search-group">
                      <div className="cm-search-group-header">System Commands</div>
                      <ul className="cm-search-group-list">
                        {commands.map(r => {
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
                                {getIconForType('action', r.icon)}
                              </div>
                              <div className="cm-search-result-content">
                                <span className="cm-search-result-title">{renderHighlighted(r.title, query)}</span>
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
                <div className="cm-search-empty">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend / Keybinding Footer */}
        <div className="cm-search-footer">
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
    </div>
  )
}

function getIconForType(type: string, iconName?: string) {
  const iconProps = { size: 16 as const }
  if (type === 'action') {
    switch (iconName) {
      case 'home': return <HomeIcon {...iconProps} />
      case 'calendar': return <CalendarIcon {...iconProps} />
      case 'chat': return <ChatIcon {...iconProps} />
      case 'settings': return <SettingsIcon {...iconProps} />
      default: return <SettingsIcon {...iconProps} />
    }
  }
  switch (type) {
    case 'course': return <BookIcon {...iconProps} />
    case 'user': return <UserIcon {...iconProps} />
    case 'assignment': return <EditIcon {...iconProps} />
    case 'page': return <FileIcon {...iconProps} />
    case 'file': return <FileIcon {...iconProps} />
    default: return <SearchIcon {...iconProps} />
  }
}

