import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCanvasQuery } from '../../hooks/useCanvasQuery'
import LogoLoader from '../../components/LogoLoader'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function UsersSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function BookSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  )
}

function BuildingSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2" />
    </svg>
  )
}

function BellSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

function LaunchSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 8v3.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3H6" />
      <path d="M8 1h5v5" />
      <path d="M7 7l6-6" />
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(data: any[] | null): string {
  if (!Array.isArray(data)) return '—'
  if (data.length === 0) return '0'
  if (data.length >= 10) return `${data.length}+`
  return String(data.length)
}

function statusBadgeClass(state: string): string {
  switch (state) {
    case 'available':
      return 'cx-badge--success'
    case 'unpublished':
      return 'cx-badge--warning'
    case 'completed':
      return 'cx-badge--info'
    case 'deleted':
      return 'cx-badge--danger'
    default:
      return 'cx-badge--neutral'
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()

  const { data: users, isLoading: usersLoading } = useCanvasQuery<any[]>('/api/v1/accounts/1/users', {
    per_page: 10,
  } as any)

  const { data: courses, isLoading: coursesLoading } = useCanvasQuery<any[]>('/api/v1/accounts/1/courses', {
    per_page: 10,
  } as any)

  const { data: subAccounts, isLoading: subAccountsLoading } = useCanvasQuery<any[]>('/api/v1/accounts/1/sub_accounts', {
    per_page: 10,
  } as any)

  const { data: notifications, isLoading: notificationsLoading } = useCanvasQuery<any[]>('/api/v1/accounts/1/account_notifications', {
    per_page: 10,
  } as any)

  const stats = [
    {
      label: 'Total Users',
      value: formatCount(users),
      loading: usersLoading,
      icon: <UsersSvg />,
      iconClass: 'cx-stat-card__icon--primary',
    },
    {
      label: 'Total Courses',
      value: formatCount(courses),
      loading: coursesLoading,
      icon: <BookSvg />,
      iconClass: 'cx-stat-card__icon--success',
    },
    {
      label: 'Sub-Accounts',
      value: formatCount(subAccounts),
      loading: subAccountsLoading,
      icon: <BuildingSvg />,
      iconClass: 'cx-stat-card__icon--info',
    },
    {
      label: 'Active Announcements',
      value: formatCount(notifications),
      loading: notificationsLoading,
      icon: <BellSvg />,
      iconClass: 'cx-stat-card__icon--warning',
    },
  ]

  const quickActions = [
    { label: 'Users', href: '/admin/users' },
    { label: 'Course Management', href: '/admin/courses' },
    { label: 'SIS Imports', href: '/admin/sis-imports' },
    { label: 'Roles & Permissions', href: '/admin/roles' },
    { label: 'Developer Keys', href: '/admin/developer-keys' },
    { label: 'Global Notifications', href: '/admin/notifications' },
    { label: 'Sub-Accounts', href: '/admin/sub-accounts' },
    { label: 'Assessment', href: '/admin/assessment' },
  ]

  const recentCourses = Array.isArray(courses) ? courses.slice(0, 5) : []

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Admin Dashboard</h1>
          <p className="cx-page__subtitle">Institution overview and quick actions.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="cx-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className={`cx-stat-card__icon ${s.iconClass}`}>{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.loading ? '…' : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-05)',
        }}
      >
        {/* Quick Actions */}
        <div
          style={{
            background: 'var(--cx-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--cx-border-subtle)',
            padding: 'var(--spacing-05) var(--spacing-06)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-04)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--cx-text-primary)',
              margin: '0 0 var(--spacing-04) 0',
            }}
          >
            Quick Actions
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 'var(--spacing-03)',
            }}
          >
            {quickActions.map((action) => (
              <button
                key={action.href}
                className="cx-btn cx-btn--secondary cx-btn--sm"
                onClick={() => navigate(action.href)}
                style={{ justifyContent: 'space-between' }}
              >
                <span>{action.label}</span>
                <LaunchSvg />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: 'var(--cx-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--cx-border-subtle)',
            padding: 'var(--spacing-05) var(--spacing-06)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-04)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--cx-text-primary)',
              margin: '0 0 var(--spacing-04) 0',
            }}
          >
            Recent Activity
          </h2>

          {coursesLoading ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <LogoLoader />
            </div>
          ) : recentCourses.length === 0 ? (
            <p style={{ color: 'var(--cx-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              No recent courses to display.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-03)' }}>
              {recentCourses.map((course) => (
                <li
                  key={course.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-03)',
                    padding: 'var(--spacing-03) var(--spacing-04)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--cx-bg-hover)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--cx-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={course.name}
                  >
                    {course.name || 'Untitled Course'}
                  </span>
                  <span className={`cx-badge ${statusBadgeClass(course.workflow_state)}`}>
                    {course.workflow_state || 'unknown'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
