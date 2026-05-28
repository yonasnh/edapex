/**
 * LearningMasteryGradebook — ClassApex LMS
 * ===========================================
 * Canvas REST API:
 *  GET /api/v1/courses/:courseId/outcome_rollups?include[]=users
 */

import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'

export default function LearningMasteryGradebookPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)

  const { data: rollupsData, isLoading } = useCanvasQuery<any>(
    courseId ? `/api/v1/courses/${courseId}/outcome_rollups` : '',
    { include: ['users'], per_page: 100 } as any
  )

  const { data: outcomes } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/outcomes` : '',
    { per_page: 100 } as any
  )

  const rollups = rollupsData?.rollups || []
  const outcomeList = outcomes || []

  const summary = useMemo(() => {
    if (!rollups.length || !outcomeList.length) return null
    let totalScores = 0
    let totalPossible = 0
    let masteryCount = 0
    let totalCells = 0

    rollups.forEach((r: any) => {
      outcomeList.forEach((o: any) => {
        const score = r.scores?.find((s: any) => String(s.links?.outcome) === String(o.id))
        if (score && score.score !== null && score.score !== undefined) {
          totalScores += score.score
          totalPossible += o.mastery_points || 1
          totalCells++
          if (score.score >= (o.mastery_points || 0)) masteryCount++
        }
      })
    })

    return {
      avgMastery: totalPossible > 0 ? ((totalScores / totalPossible) * 100).toFixed(1) + '%' : 'N/A',
      masteryRate: totalCells > 0 ? ((masteryCount / totalCells) * 100).toFixed(1) + '%' : 'N/A',
      students: rollups.length,
      outcomes: outcomeList.length,
    }
  }, [rollups, outcomeList])

  const selectedStudent = rollups.find((r: any) => String(r.links?.user) === String(selectedStudentId))

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <div className="cx-page__header" style={{ paddingTop: 0 }}>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Learning Mastery</h2>
        </div>
        <p style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0 }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Learning Mastery Gradebook</h2>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 48, borderRadius: 10 }} />)}
        </div>
      ) : rollups.length === 0 || outcomeList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <p>No mastery data available.</p>
          <Link to={`/courses/${courseId}/outcomes`} className="cx-btn cx-btn--primary" style={{ marginTop: 12 }}>Manage Outcomes</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedStudentId ? '1fr 340px' : '1fr', gap: 20 }}>
          <div>
            {/* Summary Cards */}
            {summary && (
              <div className="cx-stats-grid" style={{ marginBottom: 16 }}>
                <div className="cx-stat-card">
                  <div className="cx-stat-card__body">
                    <div className="cx-stat-card__label">Students</div>
                    <div className="cx-stat-card__value">{summary.students}</div>
                  </div>
                </div>
                <div className="cx-stat-card">
                  <div className="cx-stat-card__body">
                    <div className="cx-stat-card__label">Outcomes</div>
                    <div className="cx-stat-card__value">{summary.outcomes}</div>
                  </div>
                </div>
                <div className="cx-stat-card">
                  <div className="cx-stat-card__body">
                    <div className="cx-stat-card__label">Avg Mastery</div>
                    <div className="cx-stat-card__value">{summary.avgMastery}</div>
                  </div>
                </div>
                <div className="cx-stat-card">
                  <div className="cx-stat-card__body">
                    <div className="cx-stat-card__label">Mastery Rate</div>
                    <div className="cx-stat-card__value">{summary.masteryRate}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="cx-table-container" style={{ overflowX: 'auto' }}>
              <table className="cx-table" style={{ fontSize: '0.8125rem', minWidth: 600 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 160 }}>Student</th>
                    {outcomeList.map(o => (
                      <th key={o.id} style={{ minWidth: 100, textAlign: 'center' }}>{o.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rollups.map((r: any) => (
                    <tr key={r.links?.user} className="cx-table__row" style={{ cursor: 'pointer' }} onClick={() => setSelectedStudentId(r.links?.user)}>
                      <td className="cx-table__cell cx-table__cell--name">{r.links?.user_name || `User ${r.links?.user}`}</td>
                      {outcomeList.map(o => {
                        const score = r.scores?.find((s: any) => String(s.links?.outcome) === String(o.id))
                        const mastered = score && score.score !== null && score.score >= (o.mastery_points || 0)
                        return (
                          <td key={o.id} className="cx-table__cell" style={{ textAlign: 'center' }}>
                            {score ? (
                              <span style={{
                                display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 600,
                                background: mastered ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
                                color: mastered ? '#059669' : '#dc2626',
                              }}>
                                {mastered ? '✓' : '✗'} {score.score?.toFixed(1) ?? '—'}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--cx-text-tertiary)' }}>—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student detail panel */}
          {selectedStudentId && selectedStudent && (
            <div className="cx-card" style={{ padding: 20, alignSelf: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>{selectedStudent.links?.user_name || `User ${selectedStudent.links?.user}`}</h4>
                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setSelectedStudentId(null)}>Close</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {outcomeList.map((o: any) => {
                  const score = selectedStudent.scores?.find((s: any) => String(s.links?.outcome) === String(o.id))
                  const mastered = score && score.score !== null && score.score >= (o.mastery_points || 0)
                  return (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--cx-bg-surface-raised)', borderRadius: 6, border: '1px solid var(--cx-border-subtle)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--cx-text-secondary)' }}>{o.title}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: mastered ? '#059669' : score ? '#dc2626' : 'var(--cx-text-tertiary)' }}>
                        {mastered ? '✓ Mastered' : score ? `✗ ${score.score?.toFixed(1)}` : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
