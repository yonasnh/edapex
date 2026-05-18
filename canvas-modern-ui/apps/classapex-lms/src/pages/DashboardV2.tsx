/**
 * ClassApex Dashboard Page
 * =========================
 * Modern dashboard with activity stream, upcoming items,
 * course cards, and todo widgets — all powered by Canvas API.
 */

import React, { useState, useMemo } from 'react'
import { Badge, BookIcon, CheckCircleIcon, CalendarIcon, AlertTriangleIcon, StarIcon } from '@schoolapex/components'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useTenant } from '../contexts/TenantContext'
import { TodoWidget, type TodoItem } from '../widgets/TodoWidget'
import { UpcomingWidget } from '../widgets/UpcomingWidget'
import { RecentActivity } from '../widgets/RecentActivity'
import './dashboard-v2.css'
import '../widgets/widgets.css'

// ─── Types ───

interface CourseData {
  id: number
  name: string
  course_code: string
  term?: { name: string }
  course_image?: string
  workflow_state: string
  enrollments?: any[]
  total_students?: number
  teachers?: { display_name: string }[]
  course_progress?: {
    requirement_count: number
    requirement_completed_count: number
  }
}

// ─── Dashboard ───

export default function DashboardV2() {
  const { config: tenant } = useTenant()
  const isGamified = tenant.ui.dashboardLayout === 'gamified'
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(tenant.ui.dashboardLayout === 'list' ? 'list' : 'cards')

  // Canvas API queries
  const { data: courses, isLoading: coursesLoading } = useCanvasQuery<CourseData[]>(
    '/api/v1/courses',
    { per_page: 12, include: ['term', 'total_students', 'teachers', 'course_image', 'course_progress'] } as any
  )

  const { data: todoItems, isLoading: todosLoading } = useCanvasQuery<TodoItem[]>(
    '/api/v1/users/self/todo',
    { per_page: 10 } as any
  )

  const { data: upcomingEvents, isLoading: eventsLoading } = useCanvasQuery<any[]>(
    '/api/v1/users/self/upcoming_events'
  )

  const { data: missingSubmissions } = useCanvasQuery<any[]>(
    '/api/v1/users/self/missing_submissions',
    { per_page: 5, include: ['course'] } as any
  )

  const { data: streamSummary } = useCanvasQuery<any[]>(
    '/api/v1/users/self/activity_stream/summary'
  )

  // Compute stats
  const stats = useMemo(() => {
    const activeCourses = courses?.filter(c => c.workflow_state === 'available')?.length || 0
    const pendingTodos = todoItems?.length || 0
    const upcoming = upcomingEvents?.length || 0
    const missing = missingSubmissions?.length || 0
    const completed = todoItems?.filter(t => t.type === 'grading')?.length || 0
    return { activeCourses, pendingTodos, upcoming, missing, completed }
  }, [courses, todoItems, upcomingEvents, missingSubmissions])

  return (
    <div className="cx-dashboard">
      {/* ── Header ── */}
      <div className="cx-dashboard__header">
        <div>
          <h1 className="cx-dashboard__title">{isGamified ? 'My Learning Dashboard' : 'Dashboard'}</h1>
          <p className="cx-dashboard__subtitle">
            {isGamified
              ? 'Keep up the great work! Complete tasks to earn achievements.'
              : "Welcome back! Here's what's happening today."}
          </p>
        </div>
        <div className="cx-dashboard__view-toggle" role="radiogroup" aria-label="View mode">
          <button
            className={`cx-view-btn ${viewMode === 'cards' ? 'cx-view-btn--active' : ''}`}
            onClick={() => setViewMode('cards')}
            aria-label="Card view"
            role="radio"
            aria-checked={viewMode === 'cards'}
          >
            Grid
          </button>
          <button
            className={`cx-view-btn ${viewMode === 'list' ? 'cx-view-btn--active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
            role="radio"
            aria-checked={viewMode === 'list'}
          >
            List
          </button>
        </div>
      </div>

      {/* ── Stats Row (tier-aware) ── */}
      <div className="cx-dashboard__stats">
        <StatCard label={isGamified ? 'My Courses' : 'Active Courses'} value={stats.activeCourses} icon={<BookIcon />} />
        <StatCard label={isGamified ? 'Tasks' : 'To-Do Items'} value={stats.pendingTodos} icon={<CheckCircleIcon />} />
        <StatCard label="Upcoming" value={stats.upcoming} icon={<CalendarIcon />} />
        {isGamified ? (
          <StatCard label="Points Earned" value={stats.completed * 50 + stats.activeCourses * 100} icon={<StarIcon />} />
        ) : stats.missing > 0 ? (
          <StatCard label="Missing" value={stats.missing} icon={<AlertTriangleIcon />} alert />
        ) : stats.activeCourses > 0 ? (
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircleIcon />} />
        ) : null}
      </div>

      {/* ── Main Grid ── */}
      <div className="cx-dashboard__grid">
        {/* Left Column: Courses */}
        <section className="cx-dashboard__section cx-dashboard__section--courses">
          <div className="cx-section-header">
            <h2 className="cx-section-title">My Courses</h2>
            <a href="/courses" className="cx-section-link">View all →</a>
          </div>

          {coursesLoading ? (
            <div className="cx-skeleton-grid">
              {[1, 2, 3, 4].map(i => <div key={i} className="cx-skeleton cx-skeleton--card" />)}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className={viewMode === 'cards' ? 'cx-course-grid' : 'cx-course-list'}>
              {courses.filter(c => c.workflow_state === 'available').slice(0, 8).map(course => (
                <CourseCard key={course.id} course={course} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<BookIcon />} message="No active courses" hint="Enroll in courses to see them here." />
          )}
        </section>

        {/* Right Column: Sidebar Widgets */}
        <aside className="cx-dashboard__sidebar-widgets">
          <section className="cx-widget">
            <h3 className="cx-widget__title">To-Do</h3>
            <TodoWidget items={todoItems || []} isLoading={todosLoading} maxItems={6} />
          </section>

          <section className="cx-widget">
            <h3 className="cx-widget__title">Upcoming</h3>
            <UpcomingWidget events={upcomingEvents || []} isLoading={eventsLoading} maxItems={5} />
          </section>

          {streamSummary && streamSummary.length > 0 && (
            <section className="cx-widget">
              <h3 className="cx-widget__title">Activity</h3>
              <RecentActivity items={streamSummary} />
            </section>
          )}

          {/* At-Risk: Missing Work */}
          {missingSubmissions && missingSubmissions.length > 0 && (
            <section className="cx-widget">
              <h3 className="cx-widget__title" style={{ color: 'var(--cx-status-overdue-fg)' }}>⚠ Missing Work</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {missingSubmissions.map((item: any) => (
                  <li key={item.id} style={{
                    padding: '10px 12px', background: 'var(--cx-status-overdue-bg)', borderRadius: 8,
                    borderLeft: '3px solid var(--cx-status-overdue-fg)', fontSize: '0.82rem'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--cx-status-late-fg)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--cx-status-late-fg)', marginTop: 2 }}>
                      {item.course?.name || 'Course'} · Due {new Date(item.due_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}

// ─── Sub-Components ───

function StatCard({ label, value, icon, alert = false }: {
  label: string; value: number; icon: React.ReactNode; alert?: boolean
}) {
  return (
    <div className={`cx-stat-card ${alert ? 'cx-stat-card--alert' : ''}`}>
      <span className="cx-stat-card__icon">{icon}</span>
      <div>
        <span className="cx-stat-card__value">{value}</span>
        <span className="cx-stat-card__label">{label}</span>
      </div>
    </div>
  )
}

function CourseCard({ course, viewMode }: { course: CourseData; viewMode: 'cards' | 'list' }) {
  const COURSE_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#14b8a6']
  const color = COURSE_COLORS[course.id % COURSE_COLORS.length]
  const teacher = course.teachers?.[0]?.display_name || ''

  const progress = course.course_progress
  const progressPct = progress && progress.requirement_count > 0
    ? Math.round((progress.requirement_completed_count / progress.requirement_count) * 100)
    : null

  if (viewMode === 'list') {
    return (
      <a href={`/courses/${course.id}`} className="cx-course-row">
        <div className="cx-course-row__color" style={{ background: color }} />
        <div className="cx-course-row__info">
          <span className="cx-course-row__name">{course.name}</span>
          <span className="cx-course-row__meta">
            {course.course_code} · {teacher}
            {progressPct !== null && ` · ${progressPct}% complete`}
          </span>
        </div>
        {progressPct !== null && (
          <div style={{ width: 60, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              flex: 1, height: 4, background: 'var(--cx-border-subtle, #e2e8f0)',
              borderRadius: 2, overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: progressPct === 100 ? '#10b981' : color,
                borderRadius: 2, transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
        {course.term && <Badge variant="default" size="sm">{course.term.name}</Badge>}
      </a>
    )
  }

  return (
    <a href={`/courses/${course.id}`} className="cx-course-card">
      <div
        className="cx-course-card__banner"
        style={{
          background: course.course_image
            ? `url(${course.course_image}) center/cover`
            : `linear-gradient(135deg, ${color}, ${color}88)`,
        }}
      />
      <div className="cx-course-card__body">
        <span className="cx-course-card__code">{course.course_code}</span>
        <h3 className="cx-course-card__name">{course.name}</h3>

        {/* Progress Bar */}
        {progressPct !== null && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--cx-text-tertiary, #94a3b8)' }}>
                {progressPct === 100 ? '✓ Complete' : `${progressPct}% complete`}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--cx-text-tertiary, #94a3b8)' }}>
                {progress!.requirement_completed_count}/{progress!.requirement_count}
              </span>
            </div>
            <div style={{
              height: 4, background: 'var(--cx-border-subtle, #e2e8f0)',
              borderRadius: 2, overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: progressPct === 100
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : `linear-gradient(90deg, ${color}, ${color}cc)`,
                borderRadius: 2, transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}

        <div className="cx-course-card__footer">
          <span className="cx-course-card__teacher">{teacher}</span>
          {course.term && (
            <Badge variant="default" size="sm">{course.term.name}</Badge>
          )}
        </div>
      </div>
    </a>
  )
}

function EmptyState({ icon, message, hint }: { icon: React.ReactNode; message: string; hint: string }) {
  return (
    <div className="cx-empty-state">
      <span className="cx-empty-state__icon">{icon}</span>
      <p className="cx-empty-state__message">{message}</p>
      <p className="cx-empty-state__hint">{hint}</p>
    </div>
  )
}
