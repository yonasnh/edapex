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

// ─── Mock Data ──────────────────────────────────────────────────────────────

function getMockItems(): PlannerItem[] {
  const now = new Date()
  const d = (offset: number, hours = 23, minutes = 59) => {
    const dt = new Date(now)
    dt.setDate(dt.getDate() + offset)
    dt.setHours(hours, minutes, 0, 0)
    return dt.toISOString()
  }

  return [
    // Today
    {
      plannable_id: 1, plannable_type: 'assignment',
      plannable: { id: 1, title: 'Binary Search Tree Implementation', due_at: d(0, 23, 59), points_possible: 100, course_id: 1, created_at: d(-7) },
      context_name: 'CS 301 — Data Structures', course_id: 1,
      planner_override: { id: 1, plannable_id: 1, marked_complete: false },
      submissions: { submitted: false, graded: false, excused: false, late: false, missing: false },
    },
    {
      plannable_id: 2, plannable_type: 'quiz',
      plannable: { id: 2, title: 'Chapter 7 Quiz: Graphs', due_at: d(0, 17, 0), points_possible: 25, course_id: 1, created_at: d(-3) },
      context_name: 'CS 301 — Data Structures', course_id: 1,
      planner_override: { id: 2, plannable_id: 2, marked_complete: true },
      submissions: { submitted: true, graded: false, excused: false, late: false, missing: false },
    },
    {
      plannable_id: 3, plannable_type: 'discussion_topic',
      plannable: { id: 3, title: 'Discuss: Ethical Implications of AI in Education', due_at: d(0, 20, 0), course_id: 5, created_at: d(-2) },
      context_name: 'PHIL 210 — Ethics in Tech', course_id: 5,
      planner_override: { id: 3, plannable_id: 3, marked_complete: false },
    },
    // Tomorrow
    {
      plannable_id: 4, plannable_type: 'assignment',
      plannable: { id: 4, title: 'Lab Report: Quantum Tunneling', due_at: d(1, 23, 59), points_possible: 50, course_id: 2, created_at: d(-5) },
      context_name: 'PHYS 201 — Modern Physics', course_id: 2,
      planner_override: { id: 4, plannable_id: 4, marked_complete: false },
      submissions: { submitted: false, graded: false, excused: false, late: false, missing: false },
    },
    {
      plannable_id: 5, plannable_type: 'calendar_event',
      plannable: { id: 5, title: 'Study Group Session — Library Room 204', due_at: d(1, 14, 0), course_id: 1, created_at: d(-1) },
      context_name: 'CS 301 — Data Structures', course_id: 1,
    },
    // Day after tomorrow
    {
      plannable_id: 6, plannable_type: 'assignment',
      plannable: { id: 6, title: 'Essay: Romanticism vs. Realism', due_at: d(2, 23, 59), points_possible: 150, course_id: 3, created_at: d(-10) },
      context_name: 'ENG 201 — English Literature', course_id: 3,
      planner_override: { id: 6, plannable_id: 6, marked_complete: false },
      submissions: { submitted: false, graded: false, excused: false, late: false, missing: false },
    },
    {
      plannable_id: 7, plannable_type: 'quiz',
      plannable: { id: 7, title: 'Abstract Algebra Midterm', due_at: d(2, 10, 0), points_possible: 100, course_id: 4, created_at: d(-14) },
      context_name: 'MATH 401 — Abstract Algebra', course_id: 4,
      planner_override: { id: 7, plannable_id: 7, marked_complete: false },
    },
    // 3 days from now
    {
      plannable_id: 8, plannable_type: 'assignment',
      plannable: { id: 8, title: 'Group Project: Milestone 2 Deliverable', due_at: d(3, 23, 59), points_possible: 200, course_id: 6, created_at: d(-7) },
      context_name: 'CS 410 — Software Engineering', course_id: 6,
      planner_override: { id: 8, plannable_id: 8, marked_complete: false },
    },
    // 5 days from now
    {
      plannable_id: 9, plannable_type: 'discussion_topic',
      plannable: { id: 9, title: 'Weekly Reflection: Research Methods', due_at: d(5, 23, 59), course_id: 5, created_at: d(-1) },
      context_name: 'PHIL 210 — Ethics in Tech', course_id: 5,
    },
    {
      plannable_id: 10, plannable_type: 'assignment',
      plannable: { id: 10, title: 'Problem Set 8: Ring Homomorphisms', due_at: d(5, 23, 59), points_possible: 50, course_id: 4, created_at: d(-3) },
      context_name: 'MATH 401 — Abstract Algebra', course_id: 4,
      planner_override: { id: 10, plannable_id: 10, marked_complete: false },
    },
    // Overdue
    {
      plannable_id: 11, plannable_type: 'assignment',
      plannable: { id: 11, title: 'Reading Response: Chapter 12', due_at: d(-2, 23, 59), points_possible: 20, course_id: 3, created_at: d(-14) },
      context_name: 'ENG 201 — English Literature', course_id: 3,
      planner_override: { id: 11, plannable_id: 11, marked_complete: false },
      submissions: { submitted: false, graded: false, excused: false, late: false, missing: true },
    },
  ]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, { icon: string; className: string }> = {
  assignment: { icon: '📝', className: 'cx-planner-item__type-icon--assignment' },
  quiz: { icon: '❓', className: 'cx-planner-item__type-icon--quiz' },
  discussion_topic: { icon: '💬', className: 'cx-planner-item__type-icon--discussion' },
  calendar_event: { icon: '📅', className: 'cx-planner-item__type-icon--event' },
  announcement: { icon: '📢', className: 'cx-planner-item__type-icon--announcement' },
  planner_note: { icon: '📌', className: 'cx-planner-item__type-icon--assignment' },
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
  const { data: apiItems } = useCanvasQuery<PlannerItem[]>(
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
    return item.planner_override?.marked_complete || item.submissions?.submitted || false
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
    const groups: { date: Date; items: PlannerItem[] }[] = []
    const now = new Date()

    // Add overdue items as "Overdue" group
    const overdueItems = filteredItems.filter(i => {
      const due = i.plannable.due_at ? new Date(i.plannable.due_at) : null
      return due && due < today && !isCompleted(i)
    })

    if (overdueItems.length > 0 && weekOffset <= 0) {
      const overdueDateMarker = addDays(today, -1)
      groups.push({ date: overdueDateMarker, items: overdueItems })
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
        })})
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
      return due && due < new Date() && !isCompleted(i)
    }).length
    const completed = filteredItems.filter(i => isCompleted(i)).length
    const total = filteredItems.length
    return { assignments, quizzes, discussions, overdue, completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [filteredItems, isCompleted])

  return (
    <div className="cx-planner">
      {/* ── Header ── */}
      <div className="cx-planner__header">
        <div>
          <h1 className="cx-planner__title">Task Planner</h1>
          <p className="cx-planner__subtitle">
            {stats.completed} of {stats.total} tasks completed · {stats.pct}% done
          </p>
          <div className="cx-planner__completion-bar" style={{ width: 200, marginTop: 6 }}>
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
          <div className="cx-planner__progress-icon cx-planner__progress-icon--assignments">📝</div>
          <div>
            <div className="cx-planner__progress-value">{stats.assignments}</div>
            <div className="cx-planner__progress-label">Assignments</div>
          </div>
        </div>
        <div className="cx-planner__progress-card">
          <div className="cx-planner__progress-icon cx-planner__progress-icon--quizzes">❓</div>
          <div>
            <div className="cx-planner__progress-value">{stats.quizzes}</div>
            <div className="cx-planner__progress-label">Quizzes</div>
          </div>
        </div>
        <div className="cx-planner__progress-card">
          <div className="cx-planner__progress-icon cx-planner__progress-icon--discussions">💬</div>
          <div>
            <div className="cx-planner__progress-value">{stats.discussions}</div>
            <div className="cx-planner__progress-label">Discussions</div>
          </div>
        </div>
        {stats.overdue > 0 && (
          <div className="cx-planner__progress-card">
            <div className="cx-planner__progress-icon cx-planner__progress-icon--overdue">⚠️</div>
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
          const isOverdueGroup = group.date < today && !isSameDay(group.date, today)
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
                <div className="cx-planner__day-empty">Nothing due — enjoy your day! 🎉</div>
              ) : (
                <ul className="cx-planner__items">
                  {group.items.map(item => {
                    const completed = isCompleted(item)
                    const overdue = isOverdueGroup || (item.plannable.due_at && new Date(item.plannable.due_at) < new Date() && !completed)
                    const typeInfo = TYPE_ICONS[item.plannable_type] || TYPE_ICONS.assignment

                    return (
                      <li
                        key={item.plannable_id}
                        className={`cx-planner-item ${completed ? 'cx-planner-item--completed' : ''} ${overdue ? 'cx-planner-item--overdue' : ''}`}
                      >
                        <button
                          className="cx-planner-item__check"
                          onClick={() => toggleComplete(item)}
                          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {completed && <span className="cx-planner-item__check-mark">✓</span>}
                        </button>
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
                          {item.plannable.points_possible && (
                            <span className="cx-planner-item__points">{item.plannable.points_possible} pts</span>
                          )}
                          {item.plannable.due_at && (
                            <span className="cx-planner-item__time">{formatTime(item.plannable.due_at)}</span>
                          )}
                        </div>
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
