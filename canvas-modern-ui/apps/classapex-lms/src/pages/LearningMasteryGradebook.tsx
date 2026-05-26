/**
 * LearningMasteryGradebook — ClassApex LMS
 * ===========================================
 * Canvas REST API:
 *  GET /api/v1/courses/:courseId/outcome_rollups?include[]=users
 */

import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'

export default function LearningMasteryGradebookPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'

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
                <tr key={r.links?.user} className="cx-table__row">
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
      )}
    </div>
  )
}
