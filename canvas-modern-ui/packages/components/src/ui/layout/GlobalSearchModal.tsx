/**
 * ClassApex Global Search Modal
 * ==============================
 * Command-K style global search overlay.
 */

import React, { useState, useEffect, useRef } from 'react'
import { Badge } from '../atoms/Atoms'
import { BookIcon, UserIcon, EditIcon, FileIcon, SearchIcon } from '../icon/Icon'
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

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSearch,
  results,
  isLoading = false,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Keyboard shortcut (Cmd/Ctrl + K) to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Parent should handle opening, but we dispatch an event just in case
        document.dispatchEvent(new CustomEvent('cx:open-search'))
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setActiveIndex(0)
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) onSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, onSearch])

  // Keyboard navigation within modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter' && results[activeIndex]) {
        e.preventDefault()
        window.location.href = results[activeIndex].url
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, activeIndex, onClose])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const activeElement = listRef.current.children[activeIndex] as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex, results])

  if (!isOpen) return null

  return (
    <div className="cm-search-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Global Search">
      <div className="cm-search-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-search-header">
          <svg className="cm-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M9 15.5A6.5 6.5 0 109 2.5a6.5 6.5 0 000 13zM18 18l-4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            className="cm-search-input"
            placeholder="Search Canvas... (courses, people, assignments)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search query"
          />
          {isLoading && <div className="cm-search-spinner" />}
          <button className="cm-search-close" onClick={onClose} aria-label="Close search">Esc</button>
        </div>

        {query.trim() && (
          <div className="cm-search-body">
            {isLoading && results.length === 0 ? (
              <div className="cm-search-empty">Searching...</div>
            ) : results.length > 0 ? (
              <ul className="cm-search-results" ref={listRef} role="listbox">
                {results.map((result, idx) => (
                  <li 
                    key={result.id} 
                    className={`cm-search-result-item ${idx === activeIndex ? 'cm-search-result-item--active' : ''}`}
                    role="option"
                    aria-selected={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      window.location.href = result.url
                      onClose()
                    }}
                  >
                    <div className="cm-search-result-icon">
                      {getIconForType(result.type)}
                    </div>
                    <div className="cm-search-result-content">
                      <span className="cm-search-result-title">{result.title}</span>
                      {result.subtitle && <span className="cm-search-result-subtitle">{result.subtitle}</span>}
                    </div>
                    <Badge variant="default" size="sm">{result.type}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="cm-search-empty">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getIconForType(type: string) {
  const iconProps = { size: 16 as const }
  switch (type) {
    case 'course': return <BookIcon {...iconProps} />
    case 'user': return <UserIcon {...iconProps} />
    case 'assignment': return <EditIcon {...iconProps} />
    case 'page': return <FileIcon {...iconProps} />
    case 'file': return <FileIcon {...iconProps} />
    default: return <SearchIcon {...iconProps} />
  }
}
