/**
 * PeerReviews — ClassApex LMS (S22)
 * =====================================
 * Canvas REST API:
 *  GET /api/v1/courses/:courseId/assignments/:assignmentId/peer_reviews
 *  GET /api/v1/courses/:courseId/assignments/:assignmentId/submissions
 *  POST /api/v1/courses/:courseId/assignments/:assignmentId/submissions/:submissionId/peer_reviews
 */

import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

interface PeerReview {
  id: number
  user_id: number
  assessor_id: number
  asset_id: number
  workflow_state: string
  user_name?: string
  assessor_name?: string
}

export default function PeerReviewsPage() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast } = useNotification()
  const [editingReview, setEditingReview] = useState<any | null>(null)
  const [reviewForm, setReviewForm] = useState({ score: '', comment: '' })
  const [saving, setSaving] = useState(false)
  const [anonymousMode, setAnonymousMode] = useState(false)

  const { data: rubrics } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/rubrics` : '',
    { per_page: 50 } as any
  )

  const { data: selectedRubric } = useCanvasQuery<any>(
    editingReview?.rubric_id && courseId
      ? `/api/v1/courses/${courseId}/rubrics/${editingReview.rubric_id}`
      : '',
    undefined,
    { enabled: !!(editingReview?.rubric_id && courseId) }
  )

  const [rubricScores, setRubricScores] = useState<Record<string, { points: number; comments: string }>>({})

  const { data: reviews, isLoading, refetch } = useCanvasQuery<PeerReview[]>(
    courseId && assignmentId ? `/api/v1/courses/${courseId}/assignments/${assignmentId}/peer_reviews` : '',
    { include: ['user'] } as any
  )

  const { data: submissions } = useCanvasQuery<any[]>(
    courseId && assignmentId ? `/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions` : '',
    { per_page: 100 } as any
  )

  const { data: assignment } = useCanvasQuery<any>(
    courseId && assignmentId ? `/api/v1/courses/${courseId}/assignments/${assignmentId}` : ''
  )

  const handleSubmitReview = async () => {
    if (!editingReview || !courseId || !assignmentId) return
    setSaving(true)
    try {
      const payload: any = { score: Number(reviewForm.score) || 0, comment: reviewForm.comment }
      if (anonymousMode) payload.anonymous = true
      if (Object.keys(rubricScores).length > 0) {
        payload.rubric_assessment = Object.entries(rubricScores).reduce((acc, [criterionId, data]) => {
          acc[criterionId] = { points: data.points, comments: data.comments }
          return acc
        }, {} as any)
      }
      // Canvas peer-review content is submitted via submission comments, not the peer_reviews endpoint.
      // The peer_reviews endpoint is only for assigning reviewers (user_id).
      await canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${editingReview.user_id}/comments`, {
        method: 'POST',
        body: {
          comment: reviewForm.comment,
          media_comment_id: undefined,
          media_comment_type: undefined,
        },
      })
      // If rubric scores were entered, submit a rubric assessment for this peer review
      if (Object.keys(rubricScores).length > 0 && editingReview.rubric_id) {
        const rubricAssessment = Object.entries(rubricScores).reduce((acc, [criterionId, data]) => {
          acc[criterionId] = { points: data.points, comments: data.comments }
          return acc
        }, {} as any)
        await canvasFetch(`/api/v1/courses/${courseId}/rubric_associations/${editingReview.rubric_id}/rubric_assessments`, {
          method: 'POST',
          body: {
            rubric_assessment: {
              user_id: editingReview.user_id,
              ...rubricAssessment,
            },
          },
        })
      }
      showToast({ title: 'Review submitted', type: 'success' })
      setEditingReview(null)
      setRubricScores({})
      refetch()
    } catch (err: any) {
      showToast({ title: 'Submit failed', message: err.message || 'Unknown error', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleAssign = async (submissionId: number, reviewerId: number) => {
    if (!courseId || !assignmentId) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/peer_reviews`, {
        method: 'POST',
        body: { user_id: reviewerId },
      })
      showToast({ title: 'Peer review assigned', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Assignment failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const reviewList = reviews || []
  const submissionList = submissions || []

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Peer Reviews</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
            {assignment?.name || 'Assignment'}
          </p>
        </div>
        <Link to={`/courses/${courseId}/assignments`} className="cx-btn cx-btn--secondary cx-btn--sm">Back to Assignments</Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 56, borderRadius: 10 }} />)}
        </div>
      ) : reviewList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p>No peer reviews assigned yet.</p>
          {isTeacher && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            {submissionList.length > 1 && (
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => {
                submissionList.forEach((sub, i) => {
                  const next = submissionList[(i + 1) % submissionList.length]
                  if (sub.user_id && next.user_id) handleAssign(sub.id, next.user_id)
                })
              }}>
                Auto-Assign Round Robin
              </button>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={anonymousMode}
                onChange={(e) => setAnonymousMode(e.target.checked)}
              />
              Anonymous Reviews
            </label>
          </div>
        )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reviewList.map(r => (
            <div key={r.id} className="cx-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>
                  Reviewer: {r.assessor_name || `User ${r.assessor_id}`}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                  Reviewing submission by {r.user_name || `User ${r.user_id}`} · Status: {r.workflow_state}
                </div>
              </div>
              {r.workflow_state !== 'completed' && !isTeacher && (
                <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => { setEditingReview(r); setReviewForm({ score: '', comment: '' }); setRubricScores({}) }}>
                  Submit Review
                </button>
              )}
              {isTeacher && (
                <span className="cx-badge" style={{ fontSize: '0.6875rem', background: r.workflow_state === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(241,194,27,0.15)', color: r.workflow_state === 'completed' ? '#059669' : '#b45309' }}>
                  {r.workflow_state}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      {editingReview && (
        <div className="cx-modal-overlay" onClick={() => setEditingReview(null)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">Submit Peer Review</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditingReview(null)}>✕</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {anonymousMode && (
                <div style={{ padding: 8, background: 'rgba(99,102,241,0.08)', borderRadius: 6, fontSize: '0.8125rem', color: 'var(--cx-color-primary)' }}>
                  🔒 Anonymous review — your identity will be hidden from the student.
                </div>
              )}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Score</label>
                <input type="number" className="cx-input" value={reviewForm.score} onChange={e => setReviewForm(p => ({ ...p, score: e.target.value }))} placeholder="0-100" style={{ width: '100%' }} />
              </div>
              {selectedRubric?.criteria && (
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Rubric Assessment</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedRubric.criteria.map((criterion: any) => (
                      <div key={criterion.id} style={{ padding: 10, background: 'var(--cx-bg-surface-raised)', borderRadius: 6, border: '1px solid var(--cx-border-subtle)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: 6 }}>{criterion.description}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          {criterion.ratings?.map((rating: any) => (
                            <button
                              key={rating.id}
                              className={`cx-btn cx-btn--sm ${rubricScores[criterion.id]?.points === rating.points ? 'cx-btn--primary' : 'cx-btn--secondary'}`}
                              onClick={() => setRubricScores(prev => ({ ...prev, [criterion.id]: { ...prev[criterion.id], points: rating.points } }))}
                            >
                              {rating.points} pts
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          className="cx-input cx-input--sm"
                          style={{ width: '100%', fontSize: '0.75rem' }}
                          placeholder="Criterion comment..."
                          value={rubricScores[criterion.id]?.comments || ''}
                          onChange={e => setRubricScores(prev => ({ ...prev, [criterion.id]: { ...prev[criterion.id], comments: e.target.value } }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Comment</label>
                <textarea className="cx-input" rows={4} value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} placeholder="Your feedback..." style={{ width: '100%', resize: 'vertical' }} />
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setEditingReview(null)} disabled={saving}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSubmitReview} disabled={saving}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
