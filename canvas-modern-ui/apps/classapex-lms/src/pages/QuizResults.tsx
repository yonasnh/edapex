/**
 * QuizResults — ClassApex LMS
 * =================================
 * Shows quiz statistics and individual student results for instructors.
 * Canvas REST API:
 *  GET /api/v1/courses/:courseId/quizzes/:quizId/submissions
 *  GET /api/v1/courses/:courseId/quizzes/:quizId/statistics
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'

export default function QuizResultsPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'

  const [expandedSub, setExpandedSub] = useState<number | null>(null)

  const { data: submissions, isLoading } = useCanvasQuery<any[]>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}/submissions` : '',
    { per_page: 100, include: ['user'] } as any
  )

  const { data: stats } = useCanvasQuery<any>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}/statistics` : ''
  )

  const [filterText, setFilterText] = useState('')
  const [showOnlyNeedsGrading, setShowOnlyNeedsGrading] = useState(false)

  const filtered = React.useMemo(() => {
    if (!Array.isArray(submissions)) return []
    let list = [...submissions]
    if (filterText) {
      const q = filterText.toLowerCase()
      list = list.filter(s => s.user?.name?.toLowerCase().includes(q))
    }
    if (showOnlyNeedsGrading) {
      list = list.filter(s => s.workflow_state === 'pending_review')
    }
    return list
  }, [submissions, filterText, showOnlyNeedsGrading])

  const avgScore = React.useMemo(() => {
    if (!filtered.length) return 0
    return filtered.reduce((sum, s) => sum + (s.score || 0), 0) / filtered.length
  }, [filtered])

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Quiz Results</h2>
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--cx-text-tertiary)' }}>You do not have permission to view quiz results.</p>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0 }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Quiz Results</h2>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="cx-card" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Submissions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>{stats.submission_statistics?.unique_count || filtered.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Average Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>{avgScore.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>High Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>{stats.submission_statistics?.points_possible || 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <input type="text" className="cx-input" placeholder="Search student name..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ maxWidth: 260 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--cx-text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showOnlyNeedsGrading} onChange={e => setShowOnlyNeedsGrading(e.target.checked)} />
          Only needs grading
        </label>
      </div>

      {/* Submissions Table */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4].map(i => <div key={i} className="cx-skeleton" style={{ height: 48, borderRadius: 8 }} />)}
        </div>
      ) : (
        <table className="cx-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--cx-bg-surface-raised)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--cx-border-subtle)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>Student</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid var(--cx-border-subtle)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>Score</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid var(--cx-border-subtle)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>Attempts</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid var(--cx-border-subtle)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>Time</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid var(--cx-border-subtle)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid var(--cx-border-subtle)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => {
              const statusColor = sub.workflow_state === 'pending_review' ? 'var(--cx-color-warning, #d97706)' : sub.workflow_state === 'complete' ? 'var(--cx-color-success, #059669)' : 'var(--cx-text-tertiary)'
              return (
                <React.Fragment key={sub.id}>
                  <tr style={{ borderBottom: '1px solid var(--cx-border-subtle)', cursor: 'pointer' }} onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sub.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>{sub.user?.login_id}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--cx-text-primary)' }}>{sub.score !== null ? sub.score : '—'}</td>
                    <td style={{ textAlign: 'center', color: 'var(--cx-text-secondary)' }}>{sub.attempt || 1}</td>
                    <td style={{ textAlign: 'center', color: 'var(--cx-text-secondary)' }}>{sub.time_spent ? `${Math.round(sub.time_spent / 60)}m` : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: statusColor, padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase' }}>{sub.workflow_state.replace('_', ' ')}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm">{expandedSub === sub.id ? '▲' : '▼'}</button>
                    </td>
                  </tr>
                  {expandedSub === sub.id && sub.submission_data && (
                    <tr>
                      <td colSpan={6} style={{ padding: '16px 20px', background: 'var(--cx-bg-surface-raised)', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: 8 }}>Submission Details</div>
                        {sub.submission_data.map((ans: any, i: number) => (
                          <div key={i} style={{ fontSize: '0.78rem', color: 'var(--cx-text-secondary)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <span>Q{ans.question_id}: {ans.text || ans.answer}</span>
                            <span style={{ color: ans.correct ? 'var(--cx-color-success)' : 'var(--cx-color-danger)' }}>{ans.correct ? 'Correct' : 'Incorrect'}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--cx-text-tertiary)' }}>
                  No submissions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
