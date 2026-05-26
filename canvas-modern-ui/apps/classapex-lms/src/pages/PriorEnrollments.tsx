import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import clsx from 'clsx'

interface PriorEnrollment {
  id: number
  user_id: number
  user: {
    id: number
    name: string
    sortable_name: string
    avatar_url?: string
  }
  type: string
  role: string
  course_section_id?: number
  course_section?: {
    id: number
    name: string
  }
  start_at?: string
  end_at?: string
  created_at: string
  updated_at: string
  grades?: {
    final_score?: number
    final_grade?: string
  }
  enrollment_state: string
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function PriorEnrollmentsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { showToast } = useNotification()
  const [search, setSearch] = useState('')

  const { data: enrollments, isLoading } = useCanvasQuery<PriorEnrollment[]>(
    courseId ? `/api/v1/courses/${courseId}/enrollments` : '',
    {
      'state[]': ['completed', 'inactive'],
      per_page: 100,
      include: ['section', 'user', 'grades'],
    } as any
  )

  const filtered = useMemo(() => {
    if (!enrollments) return []
    let list = enrollments
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.user?.name?.toLowerCase().includes(q) || e.user?.sortable_name?.toLowerCase().includes(q))
    }
    return list
  }, [enrollments, search])

  const handleExportCSV = () => {
    const rows = [
      ['Name', 'Role', 'Section', 'Start Date', 'End Date', 'Final Grade', 'State'],
      ...filtered.map(e => [
        e.user?.name || '—',
        e.role,
        e.course_section?.name || '—',
        formatDate(e.start_at),
        formatDate(e.end_at),
        e.grades?.final_grade || (e.grades?.final_score != null ? String(e.grades.final_score) : '—'),
        e.enrollment_state,
      ]),
    ]
    downloadCSV(`prior-enrollments-course-${courseId}.csv`, rows)
    showToast({ title: 'CSV exported', message: `${filtered.length} rows exported.`, type: 'success' })
  }

  if (isLoading) {
    return (
      <div className="cx-page">
        <div className="cx-page__header" style={{ paddingTop: 0 }}>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Prior Enrollments</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 56, borderRadius: 10 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div
        className="cx-page__header"
        style={{
          paddingTop: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Prior Enrollments</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
            {filtered.length} concluded or inactive enrollment{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to={`/courses/${courseId}/people`} className="cx-btn cx-btn--ghost cx-btn--sm">
            ← Active Enrollments
          </Link>
          <input
            type="text"
            className="cx-input cx-btn--sm"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleExportCSV} disabled={filtered.length === 0}>
            Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p>{search ? 'No enrollments match your search.' : 'No prior enrollments found for this course.'}</p>
          <Link to={`/courses/${courseId}/people`} className="cx-btn cx-btn--secondary" style={{ marginTop: 12 }}>
            Back to Active Enrollments
          </Link>
        </div>
      ) : (
        <div className="cx-table-container">
          <table className="cx-table" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Section</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th style={{ textAlign: 'right' }}>Final Grade</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(enrollment => (
                <tr key={enrollment.id} className="cx-table__row">
                  <td className="cx-table__cell cx-table__cell--name">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {enrollment.user?.avatar_url ? (
                        <img src={enrollment.user.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                      ) : (
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'var(--cx-color-primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {(enrollment.user?.name || '?').charAt(0)}
                        </div>
                      )}
                      {enrollment.user?.name || '—'}
                    </div>
                  </td>
                  <td className="cx-table__cell">{enrollment.role}</td>
                  <td className="cx-table__cell cx-table__cell--muted">
                    {enrollment.course_section?.name || '—'}
                  </td>
                  <td className="cx-table__cell cx-table__cell--muted">{formatDate(enrollment.start_at)}</td>
                  <td className="cx-table__cell cx-table__cell--muted">{formatDate(enrollment.end_at)}</td>
                  <td className="cx-table__cell" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {enrollment.grades?.final_grade || (enrollment.grades?.final_score != null ? `${enrollment.grades.final_score}%` : '—')}
                  </td>
                  <td className="cx-table__cell">
                    <span
                      className={clsx('cx-badge')}
                      style={{
                        fontSize: '0.6875rem',
                        background:
                          enrollment.enrollment_state === 'completed'
                            ? 'rgba(217,119,6,0.12)'
                            : 'rgba(107,114,128,0.12)',
                        color: enrollment.enrollment_state === 'completed' ? '#d97706' : 'var(--cx-text-secondary)',
                      }}
                    >
                      {enrollment.enrollment_state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
