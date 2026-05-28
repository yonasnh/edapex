/**
 * ClassApex — Student Planner / Task Center
 * ===========================================
 * Weekly task planner powered by Canvas Planner API.
 * Features:
 *  - Week-based navigation with day grouping
 *  - Completion toggling (Canvas planner_overrides)
 *  - Type filtering (assignments, quizzes, discussions)
 *  - Progress summary cards
 *  - Overdue item highlighting
 */

import React, { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { extractPath } from '../utils/urlHelpers'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import './planner.css'

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlannerItem {
  plannable_id: number
  plannable_type: 'assignment' | 'quiz' | 'discussion_topic' | 'calendar_event' | 'announcement' | 'planner_note'
  plannable: {
    id: number
    title: string
    due_at?: string
    points_possible?: number
    course_id?: number
    created_at: string
  }
  context_name?: string
  context_type?: string
  course_id?: number
  planner_override?: {
    id: number
    plannable_id: number
    marked_complete: boolean
  }
  submissions?: {
    submitted: boolean
    graded: boolean
    excused: boolean
    late: boolean
    missing: boolean
  }
  html_url?: string
  new_activity?: boolean
}

// Helper to extract or construct client-side route from html_url or items fields
const SUPPORTED_CLIENT_PATTERNS = [
  /^\/dashboard\/?$/,
  /^\/planner\/?$/,
  /^\/assignments\/?$/,
  /^\/grades\/?$/,
  /^\/calendar\/?$/,
  /^\/inbox\/?$/,
  /^\/grading\/?$/,
  /^\/discussions\/?$/,
  /^\/files\/?$/,
  /^\/groups\/?$/,
  /^\/notifications\/?$/,
  /^\/settings\/?$/,
  /^\/profile\/?$/,
  /^\/analytics\/?$/,
  /^\/reports\/?$/,
  /^\/courses\/?$/,
  /^\/courses\/catalog\/?$/,
  /^\/courses\/favorites\/?$/,
  /^\/courses\/recent\/?$/,
  /^\/courses\/\d+\/?$/,
  /^\/courses\/\d+\/assignments\/?$/,
  /^\/courses\/\d+\/assignments\/\d+\/?$/,
  /^\/courses\/\d+\/quizzes\/?$/,
  /^\/courses\/\d+\/pages\/?$/,
  /^\/courses\/\d+\/rubrics\/?$/,
  /^\/courses\/\d+\/outcomes\/?$/,
  /^\/courses\/\d+\/external-tools\/?$/,
  /^\/courses\/\d+\/discussions\/?$/
]

const isSupportedClientRoute = (path: string): boolean => {
  const cleanPath = path.split('?')[0].split('#')[0]
  return SUPPORTED_CLIENT_PATTERNS.some(regex => regex.test(cleanPath))
}

// Helper to extract or construct client-side route from html_url or items fields
const getClientRoute = (item: PlannerItem): string | null => {
  let targetRoute: string | null = null
  const courseId = item.course_id || item.plannable.course_id
  const plannableType = item.plannable_type
  const plannableId = item.plannable_id
  
  // Cast plannable to any since assignment_id is present on graded quizzes/discussions
  const plannableData = item.plannable as any
  const assignmentId = plannableType === 'assignment' ? plannableId : plannableData?.assignment_id

  // If this item has a known assignment_id, route it natively to AssignmentDetail
  // This allows Assignments, Quizzes, and Discussions to open in the same window (SPA mode)
  if (courseId && assignmentId) {
    targetRoute = `/courses/${courseId}/assignments/${assignmentId}`
  } else if (item.html_url) {
    try {
      const url = new URL(item.html_url, window.location.origin)
      targetRoute = url.pathname + url.search + url.hash
    } catch (e) {
      if (item.html_url.startsWith('/')) targetRoute = item.html_url
    }
  }

  if (!targetRoute && courseId) {
    if (plannableType === 'quiz') {
      targetRoute = `/courses/${courseId}/quizzes`
    } else if (plannableType === 'discussion_topic') {
      targetRoute = `/courses/${courseId}/discussions`
    } else {
      targetRoute = `/courses/${courseId}`
    }
  }

  if (targetRoute && isSupportedClientRoute(targetRoute)) {
    return targetRoute
  }

  return null
}

const ItemLink = ({ item, children }: { item: PlannerItem; children: React.ReactNode }) => {
  const route = getClientRoute(item)

  if (route) {
    return (
      <Link to={route} className="cx-planner-item__main-link">
        {children}
      </Link>
    )
  }

  if (item.html_url) {
    return (
      <Link to={extractPath(item.html_url)} className="cx-planner-item__main-link">
        {children}
      </Link>
    )
  }

  return (
    <div className="cx-planner-item__main-link">
      {children}
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, { icon: React.ReactNode; className: string }> = {
  assignment: { icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M12 2v4h4"/><path d="M7 10h6M7 13h4"/></svg>, className: 'cx-planner-item__type-icon--assignment' },
  quiz: { icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M7.5 7.5a2.5 2.5 0 014.5 1.5c0 1.5-2 2-2 3.5"/><circle cx="10" cy="15" r="0.5" fill="currentColor"/></svg>, className: 'cx-planner-item__type-icon--quiz' },
  discussion_topic: { icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1h-4l-3 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>, className: 'cx-planner-item__type-icon--discussion' },
  calendar_event: { icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></svg>, className: 'cx-planner-item__type-icon--event' },
  announcement: { icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 5l-5 3H5v4h5l5 3V5z"/><path d="M17 8a4 4 0 010 4"/></svg>, className: 'cx-planner-item__type-icon--announcement' },
  planner_note: { icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3v14l5-3 5 3V3H5z"/></svg>, className: 'cx-planner-item__type-icon--assignment' },
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatDayHeader(date: Date, today: Date): { name: string; date: string; isToday: boolean } {
  const isToday = isSameDay(date, today)
  const isTomorrow = isSameDay(date, addDays(today, 1))
  const name = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' })
  return {
    name,
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isToday,
  }
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (d.getHours() === 23 && d.getMinutes() === 59) return 'End of day'
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatWeekLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${weekStart.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`
}

// ─── Planner Page ───────────────────────────────────────────────────────────

type TypeFilter = 'all' | 'assignment' | 'quiz' | 'discussion_topic'

export default function PlannerPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [weekOffset, setWeekOffset] = useState(0)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [completedMap, setCompletedMap] = useState<Record<number, boolean>>({})

  const weekStart = addDays(getWeekStart(today), weekOffset * 7)
  const weekEnd = addDays(weekStart, 7)

  // Canvas Planner API
  const { data: apiItems, isLoading } = useCanvasQuery<PlannerItem[]>(
    '/api/v1/planner/items',
    {
      start_date: weekStart.toISOString(),
      end_date: weekEnd.toISOString(),
      per_page: 50,
    } as any
  )

  const items = Array.isArray(apiItems) ? apiItems : []

  // Build completion state from overrides + local toggles
  const isCompleted = useCallback((item: PlannerItem): boolean => {
    if (completedMap[item.plannable_id] !== undefined) return completedMap[item.plannable_id]
    return item.planner_override?.marked_complete || 
           item.submissions?.submitted || 
           item.submissions?.graded || 
           item.submissions?.excused || 
           false
  }, [completedMap])

  const toggleComplete = useCallback(async (item: PlannerItem) => {
    const isNowComplete = !isCompleted(item)
    setCompletedMap(prev => ({ ...prev, [item.plannable_id]: isNowComplete }))
    
    try {
      if (item.planner_override?.id) {
        // Update existing override
        const res = await fetch(`/api/v1/planner/overrides/${item.planner_override.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ marked_complete: isNowComplete })
        })
        if (!res.ok) throw new Error('Failed to update override')
      } else {
        // Create new override
        const res = await fetch('/api/v1/planner/overrides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            plannable_type: item.plannable_type,
            plannable_id: item.plannable_id,
            marked_complete: isNowComplete 
          })
        })
        if (!res.ok) throw new Error('Failed to create override')
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err)
      // Revert optimistic update on failure
      setCompletedMap(prev => ({ ...prev, [item.plannable_id]: !isNowComplete }))
    }
  }, [isCompleted])

  // Filter items
  const filteredItems = useMemo(() => {
    let list = [...items]
    if (typeFilter !== 'all') {
      list = list.filter(i => i.plannable_type === typeFilter)
    }
    return list
  }, [items, typeFilter])

  // Group by day
  const dayGroups = useMemo(() => {
    const groups: { date: Date; items: PlannerItem[]; isOverdueGroup: boolean }[] = []
    const now = new Date()

    // Add overdue items as "Overdue" group
    const overdueItems = filteredItems.filter(i => {
      const isSubmittable = ['assignment', 'quiz', 'discussion_topic', 'planner_note'].includes(i.plannable_type)
      const due = i.plannable.due_at ? new Date(i.plannable.due_at) : null
      return isSubmittable && due && due < today && !isCompleted(i)
    })

    if (overdueItems.length > 0 && weekOffset <= 0) {
      const overdueDateMarker = addDays(today, -1)
      groups.push({ date: overdueDateMarker, items: overdueItems, isOverdueGroup: true })
    }

    // Days of the week
    for (let d = 0; d < 7; d++) {
      const dayDate = addDays(weekStart, d)
      const dayItems = filteredItems.filter(i => {
        const due = i.plannable.due_at ? new Date(i.plannable.due_at) : null
        return due && isSameDay(due, dayDate) && (isCompleted(i) || due >= today)
      })
      if (dayItems.length > 0 || isSameDay(dayDate, today)) {
        groups.push({ date: dayDate, items: dayItems.sort((a, b) => {
          const aTime = a.plannable.due_at ? new Date(a.plannable.due_at).getTime() : 0
          const bTime = b.plannable.due_at ? new Date(b.plannable.due_at).getTime() : 0
          return aTime - bTime
        }), isOverdueGroup: false })
      }
    }

    return groups
  }, [filteredItems, weekStart, today, isCompleted, weekOffset])

  // Stats
  const stats = useMemo(() => {
    const assignments = filteredItems.filter(i => i.plannable_type === 'assignment').length
    const quizzes = filteredItems.filter(i => i.plannable_type === 'quiz').length
    const discussions = filteredItems.filter(i => i.plannable_type === 'discussion_topic').length
    const overdue = filteredItems.filter(i => {
      const due = i.plannable.due_at ? new Date(i.plannable.due_at) : null
      return due && due < today && !isCompleted(i)
    }).length
    const completed = filteredItems.filter(i => isCompleted(i)).length
    const total = filteredItems.length
    return { assignments, quizzes, discussions, overdue, completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [filteredItems, isCompleted, today])

  if (isLoading) {
    return (
      <div className="cx-planner">
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 0',gap:'16px'}}>
          <div className="cx-spinner" />
          <span style={{color:'var(--cx-text-muted)',fontSize:'0.85rem'}}>Loading your schedule...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cx-planner">
      {/* ── Stats & Controls ── */}
      <div className="cx-planner__header" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span className="cx-planner__subtitle" style={{ margin: 0 }}>
            {stats.completed} of {stats.total} tasks completed · {stats.pct}% done
          </span>
          <div className="cx-planner__completion-bar" style={{ width: 120, margin: 0, height: 6 }}>
            <div className="cx-planner__completion-fill" style={{ width: `${stats.pct}%` }} />
          </div>
        </div>

        <div className="cx-planner__controls">
          <div className="cx-planner__week-nav">
            <button className="cx-planner__week-btn" onClick={() => setWeekOffset(o => o - 1)} aria-label="Previous week">
              ◀
            </button>
            <span className="cx-planner__week-label">{formatWeekLabel(weekStart)}</span>
            <button className="cx-planner__week-btn" onClick={() => setWeekOffset(o => o + 1)} aria-label="Next week">
              ▶
            </button>
            {weekOffset !== 0 && (
              <button className="cx-planner__week-btn" onClick={() => setWeekOffset(0)} style={{ fontWeight: 600 }}>
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="cx-planner__filter-group" style={{ marginBottom: 20 }}>
        {([
          ['all', 'All'],
          ['assignment', 'Assignments'],
          ['quiz', 'Quizzes'],
          ['discussion_topic', 'Discussions'],
        ] as [TypeFilter, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`cx-planner__filter-chip ${typeFilter === key ? 'cx-planner__filter-chip--active' : ''}`}
            onClick={() => setTypeFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Progress Cards ── */}
      <div className="cx-planner__progress">
        <div className="cx-planner__progress-card">
          <div className="cx-planner__progress-icon cx-planner__progress-icon--assignments"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M12 2v4h4"/><path d="M7 10h6M7 13h4"/></svg></div>
          <div>
            <div className="cx-planner__progress-value">{stats.assignments}</div>
            <div className="cx-planner__progress-label">Assignments</div>
          </div>
        </div>
        <div className="cx-planner__progress-card">
          <div className="cx-planner__progress-icon cx-planner__progress-icon--quizzes"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M7.5 7.5a2.5 2.5 0 014.5 1.5c0 1.5-2 2-2 3.5"/><circle cx="10" cy="15" r="0.5" fill="currentColor"/></svg></div>
          <div>
            <div className="cx-planner__progress-value">{stats.quizzes}</div>
            <div className="cx-planner__progress-label">Quizzes</div>
          </div>
        </div>
        <div className="cx-planner__progress-card">
          <div className="cx-planner__progress-icon cx-planner__progress-icon--discussions"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1h-4l-3 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg></div>
          <div>
            <div className="cx-planner__progress-value">{stats.discussions}</div>
            <div className="cx-planner__progress-label">Discussions</div>
          </div>
        </div>
        {stats.overdue > 0 && (
          <div className="cx-planner__progress-card">
            <div className="cx-planner__progress-icon cx-planner__progress-icon--overdue"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2L1 18h18L10 2z"/><path d="M10 8v4"/><circle cx="10" cy="15" r="0.5" fill="currentColor"/></svg></div>
            <div>
              <div className="cx-planner__progress-value">{stats.overdue}</div>
              <div className="cx-planner__progress-label">Overdue</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Day Groups ── */}
      <div className="cx-planner__days">
        {dayGroups.map((group, gi) => {
          const isOverdueGroup = group.isOverdueGroup
          const header = isOverdueGroup
            ? { name: 'Overdue', date: '', isToday: false }
            : formatDayHeader(group.date, today)

          return (
            <div key={gi} className="cx-planner__day">
              <div className={`cx-planner__day-header ${header.isToday ? 'cx-planner__day-header--today' : ''} ${isOverdueGroup ? 'cx-planner__day-header--today' : ''}`}>
                <div>
                  <span className={`cx-planner__day-name ${header.isToday ? 'cx-planner__day-name--today' : ''}`} style={isOverdueGroup ? { color: 'var(--cx-status-overdue-fg)' } : undefined}>
                    {header.name}
                  </span>
                  {header.date && <span className="cx-planner__day-date">{header.date}</span>}
                </div>
                <span className="cx-planner__day-count">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
              </div>

              {group.items.length === 0 ? (
                <div className="cx-planner__day-empty">Nothing due — enjoy your day!</div>
              ) : (
                <ul className="cx-planner__items">
                  {group.items.map(item => {
                    const completed = isCompleted(item)
                    const overdue = isOverdueGroup || (item.plannable.due_at && new Date(item.plannable.due_at) < today && !completed)
                    const typeInfo = TYPE_ICONS[item.plannable_type] || TYPE_ICONS.assignment

                    return (
                      <li
                        key={item.plannable_id}
                        className={`cx-planner-item ${completed ? 'cx-planner-item--completed' : ''} ${overdue ? 'cx-planner-item--overdue' : ''}`}
                      >
                        <button
                          className="cx-planner-item__check"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            toggleComplete(item)
                          }}
                          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {completed && <span className="cx-planner-item__check-mark">✓</span>}
                        </button>
                        <ItemLink item={item}>
                          <div className={`cx-planner-item__type-icon ${typeInfo.className}`}>
                            {typeInfo.icon}
                          </div>
                          <div className="cx-planner-item__content">
                            <div className="cx-planner-item__title">{item.plannable.title}</div>
                            <div className="cx-planner-item__course">{item.context_name}</div>
                          </div>
                          <div className="cx-planner-item__right">
                            {overdue && !completed && (
                              <span className="cx-planner-item__overdue-badge">Overdue</span>
                            )}
                            {completed && (
                              <span className="cx-planner-item__completed-badge">Completed</span>
                            )}
                            {item.plannable.points_possible && (
                              <span className="cx-planner-item__points">{item.plannable.points_possible} pts</span>
                            )}
                            {item.plannable.due_at && (
                              <span className="cx-planner-item__time">{formatTime(item.plannable.due_at)}</span>
                            )}
                          </div>
                        </ItemLink>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
