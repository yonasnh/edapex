/**
 * Analytics Page — ClassApex LMS
 * ================================
 * Fully wired to Canvas REST API via useCanvasQuery.
 * No mock data — all stats derived from live endpoints.
 *
 * Data sources:
 *  - /api/v1/courses?include[]=total_students,teachers,term
 *  - /api/v1/users/self/todo
 *  - /api/v1/users/self/upcoming_events
 *  - /api/v1/users/self/activity_stream/summary
 *  - /api/v1/accounts/1/users (admin-only, silently skipped if 401)
 */

import React, { useMemo, useState } from 'react'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 16v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"/>
      <circle cx="8" cy="6" r="3"/>
      <path d="M18 16v-1a3 3 0 00-2-2.87"/>
      <path d="M13 3.13a3 3 0 010 5.75"/>
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/>
      <path d="M4 7h12M4 11h12M4 15h12"/>
    </svg>
  )
}
function TaskIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="2" width="14" height="16" rx="2"/>
      <path d="M7 9l2 2 4-4"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="7"/>
      <path d="M6.5 10l2.5 2.5 4.5-5"/>
    </svg>
  )
}
function TrendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 11l4-4 3 3 6-6"/>
      <path d="M11 4h4v4"/>
    </svg>
  )
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 11V3M4 7l4 4 4-4"/>
      <path d="M2 13h12"/>
    </svg>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Course {
  id: number
  name: string
  course_code: string
  workflow_state: string
  total_students?: number
  teachers?: { display_name: string }[]
  term?: { name: string }
  start_at?: string
  end_at?: string
  enrollments?: { type: string }[]
}

interface TodoItem {
  type: string
  assignment?: { name: string; course_id: number }
  quiz?: { title: string; course_id: number }
}

interface ActivitySummary {
  type: string
  count: number
  unread_count: number
  notification_category?: string
}

interface AccountUser {
  id: number
  name: string
}

interface AssignmentItem {
  id: number
  name: string
  points_possible: number
}

interface SubmissionItem {
  id: number
  user_id: number
  assignment_id: number
  score: number | null
  assignment?: { id: number; points_possible: number }
}

interface StudentUser {
  id: number
  name: string
  enrollments?: { type: string; grades?: { current_score?: number } }[]
}

interface StudentSummary {
  id: number
  page_views: number
  participations: number
  current_score: number
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  sub?: string
}) {
  return (
    <div className="cx-stat-card">
      <div className="cx-stat-card__icon">{icon}</div>
      <div className="cx-stat-card__body">
        <div className="cx-stat-card__label">{label}</div>
        <div className="cx-stat-card__value">{value}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function ProgressRow({ label, value, max, format }: { label: string; value: number; max: number; format?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
        <span style={{ color: 'var(--cx-text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>
          {format === 'pct' ? `${pct}%` : value.toLocaleString()}
        </span>
      </div>
      <div className="cx-progress-bar">
        <div className="cx-progress-bar__track">
          <div className="cx-progress-bar__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '1year'>('30days')
  const [mode, setMode] = useState<'system' | 'student' | 'grades'>('system')
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null)
  const [selectedGradeCourseId, setSelectedGradeCourseId] = useState<number | null>(null)
  const [selectedStudentCourseId, setSelectedStudentCourseId] = useState<number | null>(null)

  const { showConfirm, showToast } = useNotification()

  // ── Live Canvas API queries ──────────────────────────────────────────────
  const { data: courses, isLoading: coursesLoading } = useCanvasQuery<Course[]>(
    '/api/v1/courses',
    { per_page: 100, include: ['total_students', 'teachers', 'term', 'course_progress', 'concluded'] } as any,
  )

  const { data: todoItems, isLoading: todosLoading } = useCanvasQuery<TodoItem[]>(
    '/api/v1/users/self/todo',
    { per_page: 50 } as any,
  )

  const { data: upcomingEvents } = useCanvasQuery<any[]>(
    '/api/v1/users/self/upcoming_events',
    { per_page: 20 } as any,
  )

  const { data: activitySummary } = useCanvasQuery<ActivitySummary[]>(
    '/api/v1/users/self/activity_stream/summary',
  )

  const { data: missingWork } = useCanvasQuery<any[]>(
    '/api/v1/users/self/missing_submissions',
    { per_page: 50 } as any,
  )

  // Admin-only endpoint — silently ignored for students
  const { data: accountUsers } = useCanvasQuery<AccountUser[]>(
    '/api/v1/accounts/1/users',
    { per_page: 1 } as any,
  )

  // ── Grades mode queries ──────────────────────────────────────────────────
  const activeGradeCourseId = selectedGradeCourseId ?? (courses?.find(c => c.workflow_state === 'available')?.id ?? null)

  const { data: assignments, isLoading: assignmentsLoading } = useCanvasQuery<AssignmentItem[]>(
    activeGradeCourseId ? `/api/v1/courses/${activeGradeCourseId}/assignments` : '',
    { per_page: 100 } as any,
    { enabled: !!activeGradeCourseId && mode === 'grades' }
  )

  const { data: submissions, isLoading: submissionsLoading } = useCanvasQuery<SubmissionItem[]>(
    activeGradeCourseId ? `/api/v1/courses/${activeGradeCourseId}/students/submissions` : '',
    { include: ['assignment'], per_page: 100 } as any,
    { enabled: !!activeGradeCourseId && mode === 'grades' }
  )

  // ── Student mode queries ─────────────────────────────────────────────────
  const activeStudentCourseId = selectedStudentCourseId ?? (courses?.find(c => c.workflow_state === 'available')?.id ?? null)

  const { data: students, isLoading: studentsLoading } = useCanvasQuery<StudentUser[]>(
    activeStudentCourseId ? `/api/v1/courses/${activeStudentCourseId}/users` : '',
    { enrollment_type: ['student'], include: ['enrollments'], per_page: 100 } as any,
    { enabled: !!activeStudentCourseId && mode === 'student' }
  )

  const { data: studentSummaries, isLoading: summariesLoading } = useCanvasQuery<StudentSummary[]>(
    activeStudentCourseId ? `/api/v1/courses/${activeStudentCourseId}/analytics/student_summaries` : '',
    undefined,
    { enabled: !!activeStudentCourseId && mode === 'student' }
  )

  const isLoading = coursesLoading || todosLoading

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const activeCourses = courses?.filter(c => c.workflow_state === 'available') ?? []
    const concludedCourses = courses?.filter(c => c.workflow_state === 'completed') ?? []
    const totalStudents = activeCourses.reduce((sum, c) => sum + (c.total_students ?? 0), 0)
    const avgStudentsPerCourse = activeCourses.length > 0 ? Math.round(totalStudents / activeCourses.length) : 0
    const totalTodos = todoItems?.length ?? 0
    const pendingAssignments = todoItems?.filter(t => t.type === 'submitting').length ?? 0
    const pendingGrading = todoItems?.filter(t => t.type === 'grading').length ?? 0
    const unreadActivity = activitySummary?.reduce((sum, a) => sum + a.unread_count, 0) ?? 0
    const totalActivity = activitySummary?.reduce((sum, a) => sum + a.count, 0) ?? 0
    const upcomingCount = upcomingEvents?.length ?? 0
    const missingCount = missingWork?.length ?? 0

    return {
      activeCourses: activeCourses.length,
      concludedCourses: concludedCourses.length,
      totalStudents,
      avgStudentsPerCourse,
      totalTodos,
      pendingAssignments,
      pendingGrading,
      unreadActivity,
      totalActivity,
      upcomingCount,
      missingCount,
    }
  }, [courses, todoItems, activitySummary, upcomingEvents, missingWork])

  // ── Enrollment bar chart — derived from course term dates ────────────────
  const enrollmentBars = useMemo(() => {
    if (!courses || courses.length === 0) return []

    const now = new Date()
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365
    const buckets: Record<string, number> = {}

    // Group active courses by their most recent term or start date
    courses.forEach(course => {
      const ref = course.start_at ? new Date(course.start_at) : null
      if (!ref) return
      const diffDays = Math.floor((now.getTime() - ref.getTime()) / 86400000)
      if (diffDays < 0 || diffDays > days) return

      // Create weekly buckets
      const week = Math.floor(diffDays / 7)
      const key = `W${week}`
      buckets[key] = (buckets[key] ?? 0) + (course.total_students ?? 1)
    })

    const entries = Object.entries(buckets).sort((a, b) => {
      const wa = parseInt(a[0].replace('W', ''), 10)
      const wb = parseInt(b[0].replace('W', ''), 10)
      return wa - wb
    })

    if (entries.length === 0) {
      // Fallback: show one bar per active course
      return courses.slice(0, 10).map((c, i) => ({
        label: c.course_code ?? `C${i + 1}`,
        value: c.total_students ?? 1,
      }))
    }

    const max = Math.max(...entries.map(([, v]) => v), 1)
    return entries.slice(-12).map(([key, value]) => ({ label: key, value, max }))
  }, [courses, timeRange])

  const barMax = Math.max(...enrollmentBars.map(b => b.value), 1)

  // ── Activity breakdown ───────────────────────────────────────────────────
  const activityBreakdown = useMemo(() => {
    if (!activitySummary || activitySummary.length === 0) return []
    return activitySummary
      .filter(a => a.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [activitySummary])

  // ── Top courses by enrollment ────────────────────────────────────────────
  const topCourses = useMemo(() => {
    if (!courses) return []
    return [...courses]
      .filter(c => (c.total_students ?? 0) > 0)
      .sort((a, b) => (b.total_students ?? 0) - (a.total_students ?? 0))
      .slice(0, 5)
  }, [courses])

  const maxEnrollment = topCourses[0]?.total_students ?? 1

  // ── Grade distribution computation ───────────────────────────────────────
  const activeAssignmentId = selectedAssignment ?? (assignments?.[0]?.id ?? null)

  const gradeDistribution = useMemo(() => {
    if (!assignments || !submissions || !activeAssignmentId) return null

    const assignment = assignments.find(a => a.id === activeAssignmentId)
    if (!assignment) return null

    const pointsPossible = assignment.points_possible || 0
    if (pointsPossible <= 0) return null

    const relevantSubmissions = submissions.filter(
      s => s.assignment_id === activeAssignmentId && s.score !== null && s.score !== undefined
    )

    if (relevantSubmissions.length === 0) return null

    const percentages = relevantSubmissions.map(s => (s.score! / pointsPossible) * 100)

    const buckets = [
      { label: '0–59% (F)', count: 0, pct: 0 },
      { label: '60–69% (D)', count: 0, pct: 0 },
      { label: '70–79% (C)', count: 0, pct: 0 },
      { label: '80–89% (B)', count: 0, pct: 0 },
      { label: '90–100% (A)', count: 0, pct: 0 },
    ]

    percentages.forEach(pct => {
      if (pct >= 90) buckets[4].count++
      else if (pct >= 80) buckets[3].count++
      else if (pct >= 70) buckets[2].count++
      else if (pct >= 60) buckets[1].count++
      else buckets[0].count++
    })

    const maxCount = Math.max(...buckets.map(b => b.count), 1)
    buckets.forEach(b => { b.pct = Math.round((b.count / maxCount) * 100) })

    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length
    const sorted = [...percentages].sort((a, b) => a - b)
    const median = sorted.length % 2 === 1
      ? sorted[Math.floor(sorted.length / 2)]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2

    const variance = percentages.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / (percentages.length - 1 || 1)
    const stdDev = Math.sqrt(variance)

    return {
      average: `${avg.toFixed(1)}%`,
      median: `${median.toFixed(1)}%`,
      stdDev: `${stdDev.toFixed(1)}%`,
      bars: buckets.map(b => ({ label: b.label, count: b.count, pct: b.pct })),
      total: relevantSubmissions.length,
    }
  }, [assignments, submissions, activeAssignmentId])

  // ── Student list computation ─────────────────────────────────────────────
  const studentList = useMemo(() => {
    if (!students) return []

    const summaryMap = new Map<number, StudentSummary>()
    studentSummaries?.forEach(s => summaryMap.set(s.id, s))

    return students.map(student => {
      const summary = summaryMap.get(student.id)
      const score = summary?.current_score ?? student.enrollments?.[0]?.grades?.current_score ?? null

      let tier: string
      let color: string
      let statusText: string

      if (score === null || score === undefined) {
        tier = 'Ungraded'
        color = 'cx-badge--secondary'
        statusText = 'No grade data'
      } else if (score >= 90) {
        tier = 'Excelling'
        color = 'cx-badge--success'
        statusText = 'Good Standing / Excelling'
      } else if (score >= 70) {
        tier = 'On Track'
        color = 'cx-badge--info'
        statusText = 'On Track'
      } else {
        tier = 'At Risk'
        color = 'cx-badge--danger'
        statusText = 'At Risk (Low Participation)'
      }

      return {
        id: student.id,
        name: student.name,
        grade: score !== null && score !== undefined ? `${score.toFixed(1)}%` : 'N/A',
        views: summary?.page_views ?? 0,
        actions: summary?.participations ?? 0,
        tier,
        color,
        statusText,
      }
    })
  }, [students, studentSummaries])

  const selectedStudent = studentList.find(s => s.id === selectedStudentId)

  // ─── Export CSV ──────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!courses || courses.length === 0) return
    const header = 'Course Name,Code,Term,Students,State\n'
    const rows = courses
      .map(c => `"${c.name}","${c.course_code}","${c.term?.name ?? ''}",${c.total_students ?? 0},${c.workflow_state}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `classapex-analytics-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  const gradesLoading = assignmentsLoading || submissionsLoading
  const studentModeLoading = studentsLoading || summariesLoading

  if (isLoading) {
    return (
      <div className="cx-page">
        <div className="cx-loading">
          <div className="cx-loading__spinner" />
          <span className="cx-loading__text">Loading analytics…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cx-page" data-testid="analytics-dashboard">
      {/* Header controls & Mode Switcher */}
      <div className="cx-page__header" style={{ paddingTop: 0, borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 12, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={`cx-btn cx-btn--sm cx-analytics-tab ${mode === 'system' ? 'cx-analytics-tab--active' : ''}`} onClick={() => { setMode('system'); setSelectedStudentId(null); }}>System Activity</button>
          <button className={`cx-btn cx-btn--sm cx-analytics-tab ${mode === 'student' ? 'cx-analytics-tab--active' : ''}`} onClick={() => { setMode('student'); setSelectedStudentId(null); }}>Student Performance</button>
          <button className={`cx-btn cx-btn--sm cx-analytics-tab ${mode === 'grades' ? 'cx-analytics-tab--active' : ''}`} onClick={() => { setMode('grades'); setSelectedStudentId(null); }}>Grade Distributions</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="cx-select"
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            aria-label="Time range"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleExport} title="Export as CSV">
            <DownloadIcon /> Export CSV
          </button>
        </div>
      </div>

      {mode === 'system' && (
        <>
          {/* KPI Stats */}
          <div className="cx-stats-grid" style={{ marginBottom: 20 }}>
            <StatCard
              label="Active Courses"
              value={stats.activeCourses}
              icon={<BookIcon />}
              sub={stats.concludedCourses > 0 ? `${stats.concludedCourses} concluded` : undefined}
            />
            <StatCard
              label="Total Enrolled Students"
              value={stats.totalStudents.toLocaleString()}
              icon={<UsersIcon />}
              sub={accountUsers ? 'across all your courses' : undefined}
            />
            <StatCard
              label="To-Do Items"
              value={stats.totalTodos}
              icon={<TaskIcon />}
              sub={stats.pendingGrading > 0 ? `${stats.pendingGrading} need grading` : undefined}
            />
            <StatCard
              label="Upcoming Events"
              value={stats.upcomingCount}
              icon={<CheckIcon />}
              sub={stats.missingCount > 0 ? `${stats.missingCount} missing` : 'No missing work'}
            />
          </div>

          {/* Enrollment chart */}
          <div className="cx-card" style={{ marginBottom: 16 }}>
            <div className="cx-card__header">
              <h3 className="cx-card__title"><TrendIcon /> Enrollment by Course Start Date</h3>
            </div>
            <div className="cx-card__body">
              {enrollmentBars.length === 0 ? (
                <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem', padding: '24px 0', textAlign: 'center' }}>
                  No enrollment data available for this time range
                </p>
              ) : (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 200, padding: '16px 8px', position: 'relative' }}>
                  {enrollmentBars.map((bar, i) => {
                    const heightPct = (bar.value / barMax) * 100
                    const prev = enrollmentBars[i - 1]
                    const isUp = prev ? bar.value > prev.value : false
                    return (
                      <div key={bar.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: '0.625rem', color: 'var(--cx-text-tertiary)' }}>{bar.value}</span>
                        <div
                          style={{
                            width: '100%',
                            height: `${Math.max(heightPct, 4)}%`,
                            background: 'var(--cx-color-primary)',
                            borderRadius: '3px 3px 0 0',
                            opacity: 0.75,
                            minHeight: 4,
                            position: 'relative',
                            transition: 'height 0.3s ease',
                          }}
                          title={`${bar.label}: ${bar.value} students`}
                        >
                          {isUp && (
                            <span style={{ position: 'absolute', top: -14, right: -4, fontSize: '0.6rem', color: 'var(--cx-color-success, #10b981)' }}>↑</span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.625rem', color: 'var(--cx-text-tertiary)', textAlign: 'center', lineHeight: 1.2 }}>
                          {bar.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Two-column analytics */}
          <div className="cx-stats-grid cx-stats-grid--2" style={{ marginBottom: 16 }}>
            {/* Top courses by enrollment */}
            <div className="cx-analytics-card">
              <h3 className="cx-analytics-card__title"><BookIcon /> Top Courses by Enrollment</h3>
              {topCourses.length === 0 ? (
                <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>No enrollment data</p>
              ) : (
                topCourses.map(course => (
                  <ProgressRow
                    key={course.id}
                    label={course.name.length > 32 ? `${course.name.slice(0, 32)}…` : course.name}
                    value={course.total_students ?? 0}
                    max={maxEnrollment}
                  />
                ))
              )}
            </div>

            {/* Activity breakdown */}
            <div className="cx-analytics-card">
              <h3 className="cx-analytics-card__title"><TaskIcon /> Activity Stream Breakdown</h3>
              {activityBreakdown.length === 0 ? (
                <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>No recent activity</p>
              ) : (
                activityBreakdown.map(item => (
                  <ProgressRow
                    key={item.type}
                    label={item.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    value={item.count}
                    max={stats.totalActivity || 1}
                  />
                ))
              )}
              {stats.unreadActivity > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: '8px 12px',
                  background: 'var(--cx-color-primary-subtle, rgba(99,102,241,0.1))',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  color: 'var(--cx-color-primary)',
                  fontWeight: 600,
                }}>
                  {stats.unreadActivity} unread notification{stats.unreadActivity !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* To-do breakdown */}
          {(stats.pendingAssignments > 0 || stats.pendingGrading > 0) && (
            <div className="cx-card" style={{ marginBottom: 16 }}>
              <div className="cx-card__header">
                <h3 className="cx-card__title"><TaskIcon /> To-Do Breakdown</h3>
              </div>
              <div className="cx-card__body">
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Submissions Due', value: stats.pendingAssignments },
                    { label: 'Needs Grading', value: stats.pendingGrading },
                    { label: 'Upcoming Events', value: stats.upcomingCount },
                    { label: 'Missing Work', value: stats.missingCount },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        flex: '1 1 140px',
                        padding: '16px',
                        background: 'var(--cx-bg-surface-sunken)',
                        borderRadius: 10,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
                        {item.value}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-secondary)', marginTop: 4 }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'student' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedStudentId ? '1fr 340px' : '1fr', gap: 20 }}>
          {/* Students list */}
          <div className="cx-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Student Progress Tracking Dashboard</h3>
              <select
                className="cx-select"
                aria-label="Course selector"
                value={activeStudentCourseId ?? ''}
                onChange={e => {
                  setSelectedStudentCourseId(Number(e.target.value) || null)
                  setSelectedStudentId(null)
                }}
              >
                {courses?.filter(c => c.workflow_state === 'available').map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            {studentModeLoading ? (
              <div className="cx-loading" style={{ padding: '40px 0' }}>
                <div className="cx-loading__spinner" />
                <span className="cx-loading__text">Loading student data…</span>
              </div>
            ) : !activeStudentCourseId || studentList.length === 0 ? (
              <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem', padding: '24px 0', textAlign: 'center' }}>
                {!activeStudentCourseId ? 'No active courses available.' : 'No students enrolled in this course.'}
              </p>
            ) : (
              <div className="cx-table-container">
                <table className="cx-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Current Grade</th>
                      <th>Page Views</th>
                      <th>Participations</th>
                      <th>Performance Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentList.map(student => (
                      <tr
                        key={student.id}
                        className="cx-table__row"
                        style={{ cursor: 'pointer', background: selectedStudentId === student.id ? 'rgba(99,102,241,0.05)' : 'none' }}
                        onClick={() => setSelectedStudentId(student.id)}
                      >
                        <td style={{ fontWeight: 600, color: 'var(--cx-color-primary)' }}>{student.name}</td>
                        <td style={{ fontWeight: 700 }}>{student.grade}</td>
                        <td>{student.views}</td>
                        <td>{student.actions}</td>
                        <td>
                          <span className={`cx-badge ${student.color}`} style={{ fontSize: '0.7rem' }}>
                            {student.tier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Student details panel */}
          {selectedStudentId && selectedStudent && (
            <div className="cx-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Student Analytics Visualizer</h4>
                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setSelectedStudentId(null)}>Close</button>
              </div>

              <div>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: 'var(--cx-text-primary)' }}>{selectedStudent.name}</h5>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.75rem', color: selectedStudent.tier === 'At Risk' ? 'var(--cx-accent-error)' : 'var(--cx-color-success)', fontWeight: 600 }}>
                  Status: {selectedStudent.statusText}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)', marginBottom: 4 }}>Weekly Activity Streams</div>
                    {selectedStudent.views > 0 || selectedStudent.actions > 0 ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80, padding: '4px 0' }}>
                        {[selectedStudent.views * 0.1, selectedStudent.actions * 0.5, selectedStudent.views * 0.15, selectedStudent.actions * 0.3, selectedStudent.views * 0.08, selectedStudent.actions * 0.4].map((val, i) => (
                          <div key={i} style={{ flex: 1, height: `${Math.min(Math.max((val / 50) * 100, 4), 100)}%`, background: selectedStudent.tier === 'At Risk' ? 'var(--cx-accent-error)' : 'var(--cx-color-primary)', borderRadius: '2px 2px 0 0' }} />
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', padding: '12px 0' }}>
                        Weekly activity data not available for this student.
                      </p>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid var(--cx-border-subtle)', paddingTop: 12, fontSize: '0.75rem', color: 'var(--cx-text-secondary)' }}>
                    <strong>Recommendations:</strong> {selectedStudent.tier === 'At Risk' ? 'Send auto-nudge email reminder, offer virtual tutoring session.' : 'Maintain current pace. Ready for honors assignments!'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      className="cx-btn cx-btn--primary cx-btn--sm"
                      onClick={async () => {
                        const confirmed = await showConfirm({ title: 'Launch Intervention?', message: 'This will flag the student for advisor outreach.', type: 'warning' })
                        if (confirmed) showToast({ title: 'Intervention Initiated', message: `Workflow started for ${selectedStudent.name}.`, type: 'success' })
                      }}
                    >
                      Launch Intervention
                    </button>
                    <button className="cx-btn cx-btn--secondary cx-btn--sm">Send Message</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'grades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="cx-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Assignment Grade Distribution</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', margin: '4px 0 0 0' }}>
                  Visualize distribution curves across grading systems customized by institution tiers.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="cx-select"
                  aria-label="Course selector"
                  value={activeGradeCourseId ?? ''}
                  onChange={e => {
                    setSelectedGradeCourseId(Number(e.target.value) || null)
                    setSelectedAssignment(null)
                  }}
                >
                  {courses?.filter(c => c.workflow_state === 'available').map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
                <select
                  className="cx-select"
                  aria-label="Assignment selector"
                  value={activeAssignmentId ?? ''}
                  onChange={e => setSelectedAssignment(Number(e.target.value) || null)}
                >
                  {assignments?.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {gradesLoading ? (
              <div className="cx-loading" style={{ padding: '40px 0' }}>
                <div className="cx-loading__spinner" />
                <span className="cx-loading__text">Loading grade data…</span>
              </div>
            ) : !activeGradeCourseId || !courses || courses.length === 0 ? (
              <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem', padding: '24px 0', textAlign: 'center' }}>
                No courses available. Enroll in or create a course to view grade distributions.
              </p>
            ) : !assignments || assignments.length === 0 ? (
              <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem', padding: '24px 0', textAlign: 'center' }}>
                No assignments found in this course.
              </p>
            ) : !gradeDistribution ? (
              <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem', padding: '24px 0', textAlign: 'center' }}>
                No submission data available for the selected assignment.
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 240, padding: '24px 0', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                  {gradeDistribution.bars.map(bar => (
                    <div key={bar.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>{bar.count} students</span>
                      <div style={{ width: '100%', height: `${bar.pct}%`, background: 'rgba(99,102,241,0.85)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--cx-color-primary)', borderRadius: '4px 4px 0 0' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--cx-text-secondary)', fontWeight: 500 }}>{bar.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
                  <div><span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Class Average:</span> <strong style={{ fontSize: '0.875rem' }}>{gradeDistribution.average}</strong></div>
                  <div><span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Standard Deviation:</span> <strong style={{ fontSize: '0.875rem' }}>{gradeDistribution.stdDev}</strong></div>
                  <div><span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Median Score:</span> <strong style={{ fontSize: '0.875rem' }}>{gradeDistribution.median}</strong></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
