import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { extractPath } from '../utils/urlHelpers'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import clsx from 'clsx'
import LogoLoader from '../components/LogoLoader'

interface PublicCourse {
  id: number
  name: string
  syllabus_body?: string | null
  public_syllabus?: boolean
  public_syllabus_to_auth?: boolean
}

interface PublicAssignment {
  id: number
  name: string
  due_at?: string | null
  points_possible: number
  html_url?: string
}

export default function PublicSyllabusPage() {
  const { courseId } = useParams<{ courseId: string }>()

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useCanvasQuery<PublicCourse>(
    courseId ? `/api/v1/courses/${courseId}` : '',
    { 'include[]': 'syllabus_body' } as any
  )

  const { data: assignments, isLoading: assignmentsLoading } = useCanvasQuery<PublicAssignment[]>(
    courseId ? `/api/v1/courses/${courseId}/assignments` : '',
    { per_page: 100 } as any
  )

  const isPublic = course?.public_syllabus || course?.public_syllabus_to_auth

  if (courseLoading || assignmentsLoading) {
    return (
      <div className="cx-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <LogoLoader />
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <div className="cx-page">
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <p>Unable to load course syllabus.</p>
          <Link to="/login" className="cx-btn cx-btn--secondary" style={{ marginTop: 12 }}>Sign In</Link>
        </div>
      </div>
    )
  }

  if (!isPublic) {
    return (
      <div className="cx-page">
        <div className="cx-page__header" style={{ paddingTop: 0 }}>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>{course.name}</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <h3 style={{ margin: '0 0 8px', color: 'var(--cx-text-primary)' }}>Syllabus Not Public</h3>
          <p style={{ maxWidth: 420, margin: '0 auto 20px' }}>
            This course does not have a public syllabus. Please sign in to view course content.
          </p>
          <Link to="/login" className="cx-btn cx-btn--primary">Sign In</Link>
        </div>
      </div>
    )
  }

  const sortedAssignments = (assignments || [])
    .filter(a => a.due_at)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())

  return (
    <div className="cx-page">
      {/* Public Syllabus Banner */}
      <div
        className={clsx('cx-banner', 'cx-banner--info')}
        style={{
          background: 'var(--cx-color-primary-subtle, rgba(99,102,241,0.1))',
          border: '1px solid var(--cx-color-primary)',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--cx-color-primary)', fontSize: '0.875rem' }}>
          📋 Public Syllabus
        </span>
        <Link
          to="/login"
          className="cx-btn cx-btn--primary cx-btn--sm"
          style={{ marginLeft: 'auto' }}
        >
          Sign In
        </Link>
      </div>

      {/* Minimal Header */}
      <div className="cx-page__header" style={{ paddingTop: 0, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
          {course.name}
        </h1>
      </div>

      {/* Syllabus Body */}
      <div
        style={{
          marginBottom: 32,
          padding: '24px',
          background: 'var(--cx-bg-surface)',
          border: '1px solid var(--cx-border-subtle)',
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600 }}>Syllabus</h3>
        {course.syllabus_body ? (
          <div
            className="cx-syllabus-body"
            style={{ color: 'var(--cx-text-secondary)', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: course.syllabus_body }}
          />
        ) : (
          <p style={{ color: 'var(--cx-text-tertiary)', fontStyle: 'italic' }}>
            No syllabus content has been added to this course yet.
          </p>
        )}
      </div>

      {/* Assignment Schedule */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: 16, fontWeight: 600 }}>Assignment Schedule</h3>
      <div
        style={{
          background: 'var(--cx-bg-surface)',
          border: '1px solid var(--cx-border-subtle)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="cx-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--cx-bg-surface-sunken)', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)' }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)' }}>Due Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', textAlign: 'right' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssignments.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--cx-text-primary)', fontWeight: 500 }}>
                    {a.html_url ? (
                      <Link to={extractPath(a.html_url)} style={{ color: 'var(--cx-color-primary)', textDecoration: 'none' }}>
                        {a.name}
                      </Link>
                    ) : (
                      a.name
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--cx-text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(a.due_at!).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--cx-text-secondary)', textAlign: 'right' }}>
                    {a.points_possible}
                  </td>
                </tr>
              ))}
              {sortedAssignments.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--cx-text-tertiary)' }}>
                    No assignments with due dates listed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
