/**
 * ClassApex Reports Page
 * ======================
 * Wired to Canvas Account Reports API:
 *   GET  /api/v1/accounts/1/reports/:report        — list instances
 *   POST /api/v1/accounts/1/reports/:report        — run a report
 *   GET  /api/v1/accounts/1/reports/:report/:id    — poll progress
 *   DELETE /api/v1/accounts/1/reports/:report/:id  — cancel/delete
 * Also uses /api/v1/courses for the course picker.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { useCanvasQuery } from '../hooks/useCanvasQuery';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReportInstance {
  id: number
  report: string          // e.g. "student_activity_csv"
  file_url?: string
  status: 'created' | 'running' | 'complete' | 'error' | 'deleted'
  progress?: number
  created_at: string
  started_at?: string
  ended_at?: string
  course_id?: number
  parameters?: Record<string, any>
}

// Canvas built-in report types
const CANVAS_REPORTS = [
  { key: 'student_activity_csv',   label: 'Student Activity',    icon: '👤' },
  { key: 'grade_export_csv',       label: 'Grade Export',        icon: '📊' },
  { key: 'mgp_and_grades_csv',     label: 'MGP & Grades',        icon: '🎓' },
  { key: 'course_storage_csv',     label: 'Course Storage',      icon: '💾' },
  { key: 'outcome_export_csv',     label: 'Outcomes',            icon: '🎯' },
  { key: 'unused_courses_csv',     label: 'Unused Courses',      icon: '📁' },
  { key: 'zero_activity_csv',      label: 'Zero Activity',       icon: '⚠️' },
  { key: 'last_user_access_csv',   label: 'Last User Access',    icon: '🕐' },
]

// ─── SVG icons ────────────────────────────────────────────────────────────────
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg> }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg> }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg> }
function DownloadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10V2M4 7l3 3 3-3"/><path d="M2 11v1h10v-1"/></svg> }
function RefreshSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7a6 6 0 0111-4M13 3v4H9"/><path d="M13 7a6 6 0 01-11 4M1 11V7h4"/></svg> }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M11 5v7a1 1 0 01-1 1H4a1 1 0 01-1-1V5"/></svg> }
function CheckSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M4.5 7l2 2 3-3.5"/></svg> }
function AlertSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2a5 5 0 100 10A5 5 0 007 2z"/><path d="M7 5v2.5"/><circle cx="7" cy="9.5" r="0.5" fill="currentColor"/></svg> }
function ChartSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/></svg> }
function SpinnerSvg() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}><circle cx="8" cy="8" r="6" strokeOpacity="0.3"/><path d="M8 2a6 6 0 016 6" strokeLinecap="round"/></svg> }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCsrfToken() {
  return document.cookie.match(/csrf_token=([^;]+)/)?.[1]
    ? decodeURIComponent(document.cookie.match(/csrf_token=([^;]+)/)![1])
    : ''
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('cx_access_token') || (import.meta as any).env?.VITE_CANVAS_API_TOKEN || ''
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  const csrf = getCsrfToken()
  if (csrf) h['X-CSRF-Token'] = csrf
  return h
}

function statusBadge(status: ReportInstance['status']) {
  const map: Record<string, string> = {
    complete: 'cx-badge--success',
    running:  'cx-badge--info',
    created:  'cx-badge--neutral',
    error:    'cx-badge--danger',
    deleted:  'cx-badge--neutral',
  }
  return <span className={clsx('cx-badge', map[status] ?? 'cx-badge--neutral')}>{status}</span>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm]       = useState('')
  const [filterType, setFilterType]       = useState('all')
  const [filterStatus, setFilterStatus]   = useState('all')
  const [sortBy, setSortBy]               = useState('created')
  const [page, setPage]                   = useState(1)
  const pageSize = 10
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [generating, setGenerating]           = useState(false)
  const [generateError, setGenerateError]     = useState('')

  const [newReport, setNewReport] = useState({
    reportType: 'student_activity_csv',
    courseId: '',
  })

  // ── Fetch all report instances for the account ──
  // Canvas returns a list-of-lists: one array per report type
  const [allInstances, setAllInstances] = useState<ReportInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Fetch courses for picker
  const { data: coursesData } = useCanvasQuery<any[]>('/api/v1/courses', { per_page: 50 } as any)
  const courses = Array.isArray(coursesData) ? coursesData : []

  const fetchAllReports = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      // Fetch most-recent instances for each report type in parallel
      const results = await Promise.allSettled(
        CANVAS_REPORTS.map(r =>
          fetch(`/api/v1/accounts/1/reports/${r.key}`, { headers: authHeaders() })
            .then(res => res.ok ? res.json() : [])
            .catch(() => [])
        )
      )
      const flat: ReportInstance[] = []
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          result.value.forEach((inst: any) => {
            flat.push({
              id: inst.id,
              report: CANVAS_REPORTS[idx].key,
              file_url: inst.file_url,
              status: inst.status,
              progress: inst.progress,
              created_at: inst.created_at,
              started_at: inst.started_at,
              ended_at: inst.ended_at,
              parameters: inst.parameters,
            })
          })
        }
      })
      setAllInstances(flat.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    } catch (e: any) {
      setFetchError(e.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAllReports() }, [fetchAllReports])

  // Auto-poll while any report is running
  useEffect(() => {
    const hasRunning = allInstances.some(r => r.status === 'running' || r.status === 'created')
    if (!hasRunning) return
    const t = setTimeout(fetchAllReports, 4000)
    return () => clearTimeout(t)
  }, [allInstances, fetchAllReports])

  // ── Generate a new report ──
  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateError('')
    try {
      const body: Record<string, any> = {}
      if (newReport.courseId) body.course_id = newReport.courseId

      const res = await fetch(`/api/v1/accounts/1/reports/${newReport.reportType}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      setShowCreateModal(false)
      setNewReport({ reportType: 'student_activity_csv', courseId: '' })
      await fetchAllReports()
    } catch (e: any) {
      setGenerateError(e.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  // ── Delete a report instance ──
  const handleDelete = async (reportType: string, id: number) => {
    if (!confirm('Delete this report instance?')) return
    try {
      const res = await fetch(`/api/v1/accounts/1/reports/${reportType}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (res.ok) fetchAllReports()
      else alert('Failed to delete report')
    } catch (e) {
      alert('Error deleting report')
    }
  }

  // ── Filters & pagination ──
  const filtered = useMemo(() => {
    let list = [...allInstances]
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(r =>
        r.report.replace(/_/g, ' ').includes(q) ||
        CANVAS_REPORTS.find(x => x.key === r.report)?.label.toLowerCase().includes(q)
      )
    }
    if (filterType !== 'all') list = list.filter(r => r.report === filterType)
    if (filterStatus !== 'all') list = list.filter(r => r.status === filterStatus)
    list.sort((a, b) => {
      if (sortBy === 'name') return a.report.localeCompare(b.report)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return list
  }, [allInstances, searchTerm, filterType, filterStatus, sortBy])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

  const stats = useMemo(() => ({
    total:     allInstances.length,
    complete:  allInstances.filter(r => r.status === 'complete').length,
    running:   allInstances.filter(r => r.status === 'running' || r.status === 'created').length,
    error:     allInstances.filter(r => r.status === 'error').length,
  }), [allInstances])

  const getLabelForKey = (key: string) =>
    CANVAS_REPORTS.find(r => r.key === key)?.label ?? key.replace(/_/g, ' ')
  const getIconForKey  = (key: string) =>
    CANVAS_REPORTS.find(r => r.key === key)?.icon ?? '📄'

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ justifyContent: 'flex-end', paddingTop: 0 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={fetchAllReports} title="Refresh">
            <RefreshSvg /> Refresh
          </button>
          <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowCreateModal(true)}>
            <PlusSvg /> New Report
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="cx-notification cx-notification--warning" role="alert">
          <AlertSvg />
          <div>
            <div className="cx-notification__title">Could not load reports</div>
            <div className="cx-notification__subtitle">{fetchError}</div>
          </div>
        </div>
      )}

      <div className="cx-stats-grid">
        {[
          { label: 'Total',    value: stats.total,    icon: <ChartSvg /> },
          { label: 'Complete', value: stats.complete,  icon: <CheckSvg /> },
          { label: 'Running',  value: stats.running,   icon: <SpinnerSvg /> },
          { label: 'Errors',   value: stats.error,     icon: <AlertSvg /> },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon">{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cx-section">
        <div className="cx-toolbar">
          <div className="cx-search">
            <SearchSvg />
            <input type="search" className="cx-search__input" placeholder="Search reports..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="cx-select" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}>
            <option value="all">All Types</option>
            {CANVAS_REPORTS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          <select className="cx-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
            <option value="all">All Status</option>
            {['complete', 'running', 'created', 'error', 'deleted'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select className="cx-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="created">Date Created</option>
            <option value="name">Name</option>
          </select>
        </div>

        {loading ? (
          <div className="cx-loading" role="status"><div className="cx-loading__spinner" /><span>Loading reports…</span></div>
        ) : paginated.length === 0 ? (
          <div className="cx-empty">
            <ChartSvg />
            <h3>No reports found</h3>
            <p>Generate a new report using the button above.</p>
          </div>
        ) : (
          <div className="cx-table-container">
            <table className="cx-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Created</th>
                  <th>Completed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(report => (
                  <tr key={`${report.report}-${report.id}`} className="cx-table__row">
                    <td className="cx-table__cell cx-table__cell--name">
                      <span style={{ marginRight: 6 }}>{getIconForKey(report.report)}</span>
                      {getLabelForKey(report.report)}
                    </td>
                    <td className="cx-table__cell">{statusBadge(report.status)}</td>
                    <td className="cx-table__cell cx-table__cell--muted">
                      {report.progress != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="cx-progress-bar" style={{ width: 80 }}>
                            <div className="cx-progress-bar__track">
                              <div className="cx-progress-bar__fill" style={{ width: `${report.progress}%` }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem' }}>{report.progress}%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="cx-table__cell cx-table__cell--muted">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="cx-table__cell cx-table__cell--muted">
                      {report.ended_at ? new Date(report.ended_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="cx-table__cell cx-table__cell--actions">
                      {report.status === 'complete' && report.file_url && (
                        <a
                          href={report.file_url}
                          className="cx-btn cx-btn--ghost cx-btn--sm"
                          download
                          title="Download"
                          onClick={e => e.stopPropagation()}
                        >
                          <DownloadSvg />
                        </a>
                      )}
                      {(report.status === 'running' || report.status === 'created') && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <SpinnerSvg /> Running
                        </span>
                      )}
                      <button
                        className="cx-btn cx-btn--ghost cx-btn--sm"
                        title="Delete"
                        onClick={() => handleDelete(report.report, report.id)}
                      >
                        <TrashSvg />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '8px 16px', fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)', borderTop: '1px solid var(--cx-border-subtle)' }}>
              {filtered.length} report{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="cx-pagination" style={{ marginTop: 16 }}>
            <span className="cx-pagination__info">Page {page} of {totalPages}</span>
            <div className="cx-pagination__controls">
              <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3L5 7l4 4"/></svg>
              </button>
              <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Generate Report Modal ── */}
      {showCreateModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="Generate report">
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Generate New Report</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCreateModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="cx-form-group">
                <label className="cx-form-label" htmlFor="rpt-type">Report Type</label>
                <select id="rpt-type" className="cx-select" style={{ width: '100%' }}
                  value={newReport.reportType} onChange={e => setNewReport(p => ({ ...p, reportType: e.target.value }))}>
                  {CANVAS_REPORTS.map(r => (
                    <option key={r.key} value={r.key}>{r.icon} {r.label}</option>
                  ))}
                </select>
              </div>
              <div className="cx-form-group">
                <label className="cx-form-label" htmlFor="rpt-course">Course (optional)</label>
                <select id="rpt-course" className="cx-select" style={{ width: '100%' }}
                  value={newReport.courseId} onChange={e => setNewReport(p => ({ ...p, courseId: e.target.value }))}>
                  <option value="">Account-wide</option>
                  {courses.map((c: any) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>
              </div>
              {generateError && (
                <div className="cx-notification cx-notification--warning" role="alert">
                  <AlertSvg />
                  <div className="cx-notification__subtitle">{generateError}</div>
                </div>
              )}
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleGenerate} disabled={generating}>
                {generating ? <><SpinnerSvg /> Generating…</> : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default ReportsPage
