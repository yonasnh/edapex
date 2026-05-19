/**
 * Rubrics — ClassApex LMS (S18)
 * ================================
 * Canvas REST API integration:
 *  GET /api/v1/courses/:id/rubrics              — list course rubrics
 *  GET /api/v1/courses/:id/rubrics/:id          — rubric detail
 *  GET /api/v1/courses/:id/assignments/:aid/rubric_assessments — live scores
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery } from '../hooks/useCanvasQuery'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RubricCriterion {
  id: string
  description: string
  long_description?: string
  points: number
  ratings: { id: string; description: string; points: number }[]
}

interface Rubric {
  id: number
  title: string
  context_type: string
  points_possible: number
  reusable: boolean
  free_form_criterion_comments: boolean
  criteria: RubricCriterion[]
  assessments?: RubricAssessment[]
}

interface RubricAssessment {
  id: number
  assessor_id: number
  data: {
    criterion_id: string
    points: number
    comments?: string
    rating_id?: string
  }[]
  score: number
}

// ─── Rubric Detail ────────────────────────────────────────────────────────────

function RubricDetail({
  courseId,
  rubricId,
  onBack,
}: {
  courseId: string
  rubricId: number
  onBack: () => void
}) {
  const { data: rubric, isLoading } = useCanvasQuery<Rubric>(
    `/api/v1/courses/${courseId}/rubrics/${rubricId}`,
    { include: ['assessments'] } as any
  )

  if (isLoading) {
    return <div className="cx-loading"><div className="cx-loading__spinner" /></div>
  }
  if (!rubric) {
    return <p style={{ color: 'var(--cx-text-tertiary)', padding: 24 }}>Rubric not found.</p>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={onBack}>← Back</button>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1.2rem' }}>
          {rubric.title}
        </h2>
        <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--cx-text-secondary)', fontSize: '0.875rem' }}>
          {rubric.points_possible} pts total
        </span>
      </div>

      {/* Rubric table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '2px solid var(--cx-border-subtle)', minWidth: 180 }}>
                Criterion
              </th>
              {rubric.criteria[0]?.ratings.map(r => (
                <th key={r.id} style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '2px solid var(--cx-border-subtle)', minWidth: 120 }}>
                  {r.description}
                </th>
              ))}
              <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '2px solid var(--cx-border-subtle)', minWidth: 80 }}>
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {rubric.criteria.map((criterion, ci) => (
              <tr key={criterion.id} style={{ background: ci % 2 === 0 ? 'var(--cx-bg-surface)' : 'var(--cx-bg-surface-raised, #f8fafc)' }}>
                <td style={{ padding: '12px 14px', verticalAlign: 'top', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 2 }}>
                    {criterion.description}
                  </div>
                  {criterion.long_description && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)', lineHeight: 1.4 }}>
                      {criterion.long_description}
                    </div>
                  )}
                </td>
                {criterion.ratings.map(rating => (
                  <td key={rating.id} style={{ padding: '12px 14px', verticalAlign: 'top', textAlign: 'center', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--cx-color-primary)', marginBottom: 4 }}>
                      {rating.points} pts
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)', lineHeight: 1.35 }}>
                      {rating.description}
                    </div>
                  </td>
                ))}
                <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: 'var(--cx-text-primary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                  {criterion.points}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)' }}>
              <td colSpan={(rubric.criteria[0]?.ratings.length ?? 0) + 1} style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderTop: '2px solid var(--cx-border-subtle)' }}>
                Total Points
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: 'var(--cx-text-primary)', borderTop: '2px solid var(--cx-border-subtle)', fontSize: '1rem' }}>
                {rubric.points_possible}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─── Rubric List ──────────────────────────────────────────────────────────────

export default function RubricsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: rubrics, isLoading } = useCanvasQuery<Rubric[]>(
    courseId ? `/api/v1/courses/${courseId}/rubrics` : '',
    { per_page: 50 } as any
  )

  if (selectedId && courseId) {
    return (
      <div className="cx-page">
        <RubricDetail courseId={courseId} rubricId={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0 }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Rubrics</h2>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <div key={i} className="cx-skeleton" style={{ height: 72, borderRadius: 10 }} />)}
        </div>
      ) : !rubrics || rubrics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p>No rubrics found for this course.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rubrics.map(rubric => (
            <li
              key={rubric.id}
              className="cx-card"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
              onClick={() => setSelectedId(rubric.id)}
            >
              <div style={{ fontSize: 28, flexShrink: 0 }}>📋</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 2 }}>{rubric.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                  {rubric.criteria?.length ?? 0} criteria · {rubric.points_possible} pts possible
                  {rubric.reusable ? ' · Reusable' : ''}
                </div>
              </div>
              <span style={{ color: 'var(--cx-text-tertiary)', fontSize: '1.2rem' }}>›</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
