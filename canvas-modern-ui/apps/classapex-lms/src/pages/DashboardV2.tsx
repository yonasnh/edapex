/**
 * ClassApex Dashboard Page
 * =========================
 * Modern dashboard with activity stream, upcoming items,
 * course cards, and todo widgets — all powered by Canvas API.
 */

import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge, BookIcon, CheckCircleIcon, CalendarIcon, AlertTriangleIcon, StarIcon } from '@schoolapex/components'
import { BookmarkIcon } from '../navigation'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useTenant } from '../contexts/TenantContext'
import { extractPath } from '../utils/urlHelpers'
import { TodoWidget, type TodoItem } from '../widgets/TodoWidget'
import { UpcomingWidget } from '../widgets/UpcomingWidget'
import { RecentActivity } from '../widgets/RecentActivity'
import { FavoriteCourses } from '../widgets/FavoriteCourses'
import './dashboard-v2.css'
import '../widgets/widgets.css'

interface ActivityStreamItem {
  id: number
  title: string
  type: string
  read_state: boolean
  submission_comments?: any[]
  score?: number | null
  graded_at?: string | null
  html_url?: string
  course_id?: number
  assignment_id?: number
  created_at?: string
}

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
  const [missingExpanded, setMissingExpanded] = useState(false)

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

  const { data: activityStream } = useCanvasQuery<ActivityStreamItem[]>(
    '/api/v1/users/self/activity_stream',
    { only_active: true } as any
  )

  const recentFeedback = useMemo(() => {
    if (!activityStream) return []
    return activityStream.filter(item => {
      if (item.type !== 'Submission') return false
      const hasUnread = item.read_state === false
      const hasFeedback = (item.submission_comments && item.submission_comments.length > 0) || item.score !== null || item.graded_at !== null
      return hasUnread || hasFeedback
    }).slice(0, 5)
  }, [activityStream])

  // Compute stats
  const stats = useMemo(() => {
    const activeCourses = courses?.length || 0
    const pendingTodos = todoItems?.length || 0
    const upcoming = upcomingEvents?.length || 0
    const missing = missingSubmissions?.length || 0
    const completed = todoItems?.filter(t => t.type === 'grading')?.length || 0
    return { activeCourses, pendingTodos, upcoming, missing, completed }
  }, [courses, todoItems, upcomingEvents, missingSubmissions])

  return (
    <div className="cx-dashboard" data-testid="dashboard-content">
      {/* ── View Toggle ── */}
      <div className="cx-dashboard__header" style={{ justifyContent: 'flex-end', paddingTop: 0 }}>
        <div className="cx-dashboard__view-toggle" role="radiogroup" aria-label="View mode">
          <button
            className={`cx-view-btn ${viewMode === 'cards' ? 'cx-view-btn--active' : ''}`}
            onClick={() => setViewMode('cards')}
            aria-label="Grid view"
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

      {/* ── Recent Feedback ── */}
      {recentFeedback.length > 0 && (
        <section className="cx-dashboard__section" style={{ marginTop: 16 }}>
          <div className="cx-section-header">
            <h2 className="cx-section-title">Recent Feedback</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 12,
          }}>
            {recentFeedback.map(item => (
              <Link
                key={item.id}
                to={extractPath(item.html_url || '#')}
                className="cx-stat-card"
                style={{
                  textDecoration: 'none',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '12px 14px',
                  background: 'var(--cx-bg-surface)',
                  border: '1px solid var(--cx-border-subtle)',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'var(--cx-color-primary-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--cx-color-primary)', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--cx-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-secondary)', marginTop: 2 }}>
                    {item.score !== null && item.score !== undefined ? `Score: ${item.score} · ` : ''}
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Main Grid ── */}
      <div className="cx-dashboard__grid">
        {/* Left Column: Courses */}
        <section className="cx-dashboard__section cx-dashboard__section--courses">
          <div className="cx-section-header">
            <h2 className="cx-section-title">My Courses</h2>
            <Link to="/courses" className="cx-section-link">View all →</Link>
          </div>

          {coursesLoading ? (
            <div className="cx-skeleton-grid">
              {[1, 2, 3, 4].map(i => <div key={i} className="cx-skeleton cx-skeleton--card" />)}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className={viewMode === 'cards' ? 'cx-course-grid' : 'cx-course-list'}>
              {courses.slice(0, 8).map(course => (
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
            <h3 className="cx-widget__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookmarkIcon size={16} /> Favorite Courses</h3>
            <FavoriteCourses />
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
              <h3 className="cx-widget__title" style={{ color: 'var(--cx-status-overdue-fg)', display: 'flex', alignItems: 'center', gap: 6 }}><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2L1 18h18L10 2z"/><path d="M10 8v4"/><circle cx="10" cy="14.5" r="0.5" fill="currentColor"/></svg> Missing Work</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(missingExpanded ? missingSubmissions : missingSubmissions.slice(0, 2)).map((item: any) => (
                  <li key={item.id} style={{
                    padding: '8px 12px', background: 'transparent', borderRadius: '0 8px 8px 0',
                    borderLeft: '3px solid var(--cx-status-overdue-fg)', borderTop: 'none', fontSize: '0.82rem'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-secondary)', marginTop: 2 }}>
                      {item.course?.name || 'Course'} · Due {new Date(item.due_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
              {missingSubmissions.length > 2 && (
                <button
                  className="cx-widget__toggle-btn"
                  onClick={() => setMissingExpanded(!missingExpanded)}
                >
                  {missingExpanded ? (
                    <>Show Less ▴</>
                  ) : (
                    <>Show More ({missingSubmissions.length - 2} more) ▾</>
                  )}
                </button>
              )}
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
      <div className="cx-stat-card__icon">{icon}</div>
      <div className="cx-stat-card__body">
        <div className="cx-stat-card__label">{label}</div>
        <div className="cx-stat-card__value">{value}</div>
      </div>
    </div>
  )
}

function CourseCard({ course, viewMode }: { course: CourseData; viewMode: 'cards' | 'list' }) {
  const COURSE_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#14b8a6']
  const colorIndex = (typeof course.id === 'number' ? course.id : parseInt(String(course.id), 10) || 0) % 8
  const color = COURSE_COLORS[colorIndex]
  const teacher = course.teachers?.[0]?.display_name || ''

  const progress = course.course_progress
  const progressPct = progress && progress.requirement_count > 0
    ? Math.round((progress.requirement_completed_count / progress.requirement_count) * 100)
    : null

  if (viewMode === 'list') {
    return (
      <Link to={`/courses/${course.id}`} className="cx-course-row">
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
      </Link>
    )
  }

  const bannerImage = course.course_image

  return (
    <Link to={`/courses/${course.id}`} className="cx-course-card">
      <div
        className={`cx-course-card__banner cx-course-card__banner--c${colorIndex}`}
        style={bannerImage ? {
          background: `url(${bannerImage}) center/cover`,
        } : undefined}
      >
        <div className="cx-course-card__banner-overlay" />
        
        {!bannerImage && (
          <div className="cx-course-card__banner-deco">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        )}

        <div className="cx-course-card__banner-meta">
          <span className="cx-course-card__code-badge">{course.course_code}</span>
          {course.term && (
            <span className="cx-course-card__term-badge">{course.term.name}</span>
          )}
        </div>
      </div>

      <div className="cx-course-card__body">
        <h3 className="cx-course-card__name" style={{ marginTop: 0 }}>{course.name}</h3>

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
        </div>
      </div>
    </Link>
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
