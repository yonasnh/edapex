import React, { memo, useState, useCallback, useMemo } from 'react'
import { 
  Search, 
  ComboBox, 
  Tag, 
  Button, 
  Modal,
  Checkbox,
  DatePicker,
  DatePickerInput
} from '@carbon/react'
import { User } from '@schoolapex/core'
import {
  Search as SearchIcon,
  Filter,
  Close,
  Course,
  Task as Assignment,
  Chat,
  Folder,
  Calendar,
  Group
} from '@carbon/icons-react'
import clsx from 'clsx'

/**
 * Search result interface
 */
interface SearchResult {
  id: string
  type: 'course' | 'assignment' | 'discussion' | 'file' | 'user' | 'announcement' | 'calendar'
  title: string
  description?: string
  url: string
  course?: string
  date?: Date
  relevance: number
  metadata?: Record<string, any>
}

/**
 * Search filter interface
 */
interface SearchFilter {
  types: string[]
  courses: string[]
  dateRange?: {
    start?: Date
    end?: Date
  }
  includeArchived: boolean
}

/**
 * Global Search component props
 */
interface GlobalSearchProps {
  currentUser: User
  placeholder?: string
  onSearch?: (query: string, filters: SearchFilter) => Promise<SearchResult[]>
  onResultClick?: (result: SearchResult) => void
  showFilters?: boolean
  showRecentSearches?: boolean
  maxResults?: number
  className?: string
  'data-testid'?: string
}

/**
 * SchoolApex Global Search component
 *
 * Comprehensive search interface with filters, recent searches, and result categorization.
 * Provides intelligent search across all Canvas content types.
 *
 * @example
 * ```tsx
 * <GlobalSearch
 *   currentUser={currentUser}
 *   onSearch={handleSearch}
 *   onResultClick={handleResultClick}
 *   showFilters={true}
 * />
 * ```
 */
export const GlobalSearch = memo<GlobalSearchProps>(
  ({
    currentUser,
    placeholder = "Search courses, assignments, discussions...",
    onSearch,
    onResultClick,
    showFilters = true,
    showRecentSearches = true,
    maxResults = 50,
    className,
    'data-testid': testId,
  }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [recentSearches, setRecentSearches] = useState<string[]>([
      'React components',
      'Assignment 1',
      'Discussion forum',
      'Course materials'
    ])
    
    const [filters, setFilters] = useState<SearchFilter>({
      types: [],
      courses: [],
      includeArchived: false,
    })

    const searchTypes = [
      { id: 'course', label: 'Courses', icon: Course },
      { id: 'assignment', label: 'Assignments', icon: Assignment },
      { id: 'discussion', label: 'Discussions', icon: Chat },
      { id: 'file', label: 'Files', icon: Folder },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'user', label: 'People', icon: Group },
    ]

    const handleSearch = useCallback(async (searchQuery: string) => {
      if (!searchQuery.trim() || !onSearch) return

      setIsSearching(true)
      try {
        const searchResults = await onSearch(searchQuery, filters)
        setResults(searchResults.slice(0, maxResults))
        
        // Add to recent searches
        if (showRecentSearches) {
          setRecentSearches(prev => {
            const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)]
            return updated.slice(0, 5) // Keep only 5 recent searches
          })
        }
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, [onSearch, filters, maxResults, showRecentSearches])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      
      if (value.length >= 2) {
        handleSearch(value)
      } else {
        setResults([])
      }
    }

    const handleResultClick = (result: SearchResult) => {
      if (onResultClick) {
        onResultClick(result)
      } else {
        window.open(result.url, '_blank')
      }
      setQuery('')
      setResults([])
    }

    const handleRecentSearchClick = (recentQuery: string) => {
      setQuery(recentQuery)
      handleSearch(recentQuery)
    }

    const handleFilterChange = (newFilters: Partial<SearchFilter>) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)
      
      if (query.trim()) {
        handleSearch(query)
      }
    }

    const getResultIcon = (type: string) => {
      const searchType = searchTypes.find(t => t.id === type)
      return searchType ? searchType.icon : SearchIcon
    }

    const groupedResults = useMemo(() => {
      return results.reduce((groups, result) => {
        const type = result.type
        if (!groups[type]) {
          groups[type] = []
        }
        groups[type].push(result)
        return groups
      }, {} as Record<string, SearchResult[]>)
    }, [results])

    const activeFiltersCount = filters.types.length + filters.courses.length + 
      (filters.dateRange?.start || filters.dateRange?.end ? 1 : 0) +
      (filters.includeArchived ? 1 : 0)

    return (
      <div
        className={clsx('global-search', className)}
        data-testid={testId}
      >
        <div className="global-search__input-container">
          <Search
            labelText="Global search"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            size="lg"
            className="global-search__input"
          />
          
          {showFilters && (
            <Button
              kind="ghost"
              size="lg"
              renderIcon={Filter}
              iconDescription="Search filters"
              onClick={() => setShowFilterModal(true)}
              className={clsx('global-search__filter-button', {
                'global-search__filter-button--active': activeFiltersCount > 0
              })}
              aria-label="Search filters"
            >
              {activeFiltersCount > 0 && (
                <span className="global-search__filter-count">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="global-search__active-filters">
            {filters.types.map(type => (
              <Tag
                key={type}
                type="blue"
                size="sm"
                filter
                onClose={() => handleFilterChange({
                  types: filters.types.filter(t => t !== type)
                })}
              >
                {searchTypes.find(t => t.id === type)?.label || type}
              </Tag>
            ))}
            
            {filters.courses.map(course => (
              <Tag
                key={course}
                type="purple"
                size="sm"
                filter
                onClose={() => handleFilterChange({
                  courses: filters.courses.filter(c => c !== course)
                })}
              >
                {course}
              </Tag>
            ))}
            
            {(filters.dateRange?.start || filters.dateRange?.end) && (
              <Tag
                type="green"
                size="sm"
                filter
                onClose={() => handleFilterChange({
                  dateRange: undefined
                })}
              >
                Date Range
              </Tag>
            )}
            
            {filters.includeArchived && (
              <Tag
                type="warm-gray"
                size="sm"
                filter
                onClose={() => handleFilterChange({
                  includeArchived: false
                })}
              >
                Include Archived
              </Tag>
            )}
          </div>
        )}

        {/* Search Results */}
        {(results.length > 0 || isSearching) && (
          <div className="global-search__results">
            {isSearching ? (
              <div className="global-search__loading">
                Searching...
              </div>
            ) : (
              <>
                {Object.entries(groupedResults).map(([type, typeResults]) => {
                  const searchType = searchTypes.find(t => t.id === type)
                  const Icon = searchType?.icon || SearchIcon
                  
                  return (
                    <div key={type} className="global-search__result-group">
                      <div className="global-search__result-group-header">
                        <Icon size={16} />
                        <span className="global-search__result-group-title">
                          {searchType?.label || type} ({typeResults.length})
                        </span>
                      </div>
                      
                      <div className="global-search__result-list">
                        {typeResults.map(result => (
                          <div
                            key={result.id}
                            className="global-search__result-item"
                            onClick={() => handleResultClick(result)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleResultClick(result)
                              }
                            }}
                          >
                            <div className="global-search__result-content">
                              <h4 className="global-search__result-title">
                                {result.title}
                              </h4>
                              {result.description && (
                                <p className="global-search__result-description">
                                  {result.description}
                                </p>
                              )}
                              <div className="global-search__result-meta">
                                {result.course && (
                                  <span className="global-search__result-course">
                                    {result.course}
                                  </span>
                                )}
                                {result.date && (
                                  <span className="global-search__result-date">
                                    {result.date.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {showRecentSearches && !query && recentSearches.length > 0 && (
          <div className="global-search__recent">
            <h4 className="global-search__recent-title">Recent Searches</h4>
            <div className="global-search__recent-list">
              {recentSearches.map((recentQuery, index) => (
                <button
                  key={index}
                  className="global-search__recent-item"
                  onClick={() => handleRecentSearchClick(recentQuery)}
                >
                  <SearchIcon size={16} />
                  <span>{recentQuery}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Modal */}
        <Modal
          open={showFilterModal}
          onRequestClose={() => setShowFilterModal(false)}
          modalHeading="Search Filters"
          primaryButtonText="Apply Filters"
          secondaryButtonText="Clear All"
          onRequestSubmit={() => setShowFilterModal(false)}
          onSecondarySubmit={() => {
            handleFilterChange({
              types: [],
              courses: [],
              dateRange: undefined,
              includeArchived: false,
            })
            setShowFilterModal(false)
          }}
        >
          <div className="global-search__filter-content">
            {/* Content Types */}
            <div className="global-search__filter-section">
              <h5>Content Types</h5>
              {searchTypes.map(type => (
                <Checkbox
                  key={type.id}
                  id={`filter-type-${type.id}`}
                  labelText={type.label}
                  checked={filters.types.includes(type.id)}
                  onChange={(checked) => {
                    const newTypes = checked
                      ? [...filters.types, type.id]
                      : filters.types.filter(t => t !== type.id)
                    handleFilterChange({ types: newTypes })
                  }}
                />
              ))}
            </div>

            {/* Date Range */}
            <div className="global-search__filter-section">
              <h5>Date Range</h5>
              <DatePicker datePickerType="range">
                <DatePickerInput
                  id="date-picker-start"
                  placeholder="mm/dd/yyyy"
                  labelText="Start date"
                  size="md"
                />
                <DatePickerInput
                  id="date-picker-end"
                  placeholder="mm/dd/yyyy"
                  labelText="End date"
                  size="md"
                />
              </DatePicker>
            </div>

            {/* Other Options */}
            <div className="global-search__filter-section">
              <Checkbox
                id="include-archived"
                labelText="Include archived content"
                checked={filters.includeArchived}
                onChange={(evt, { checked }) => handleFilterChange({ includeArchived: checked })}
              />
            </div>
          </div>
        </Modal>

        {/* Screen reader only content */}
        <div className="sr-only">
          Global search interface.
          {query && ` Current search: ${query}.`}
          {results.length > 0 && ` ${results.length} results found.`}
          {activeFiltersCount > 0 && ` ${activeFiltersCount} filters active.`}
        </div>
      </div>
    )
  }
)

GlobalSearch.displayName = 'GlobalSearch'
