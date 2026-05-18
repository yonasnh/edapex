import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge } from '@schoolapex/components'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { SubmissionStatus } from '../widgets/SubmissionStatus'
import { SubmissionForm } from '../widgets/SubmissionForm'
import './assignment.css'

export default function AssignmentDetail() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>()
  const [showForm, setShowForm] = useState(false)

  const { data: assignment, isLoading } = useCanvasQuery<any>(
    `/api/v1/courses/${courseId}/assignments/${assignmentId}`,
    { include: ['submission'] } as any
  )

  if (isLoading) {
    return (
      <div className="cx-assignment-detail">
        <div className="cx-skeleton cx-skeleton--detail-banner" />
        <div className="cx-skeleton cx-skeleton--detail-body" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="cx-assignment-detail cx-assignment-detail--error">
        <h2>Assignment not found</h2>
        <Link to={`/courses/${courseId}/assignments`}>Back to Assignments</Link>
      </div>
    )
  }

  const dueDate = assignment.due_at ? new Date(assignment.due_at) : null
  const isPast = dueDate && dueDate < new Date()
  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000) : null
  const hasSubmitted = assignment.submission?.submitted
  const submissionStatus = hasSubmitted
    ? (assignment.submission?.late ? 'late' : assignment.submission?.score !== undefined ? 'graded' : 'submitted')
    : isPast ? 'missing' : 'unsubmitted'

  return (
    <div className="cx-assignment-detail">
      <div className="cx-assignment-detail__header">
        <Link to={`/courses/${courseId}/assignments`} className="cx-assignment-detail__back">
          &larr; Back to Assignments
        </Link>
        <div className="cx-assignment-detail__title-row">
          <h1 className="cx-assignment-detail__title">{assignment.name}</h1>
          <Badge variant={isPast ? 'danger' : daysUntilDue !== null && daysUntilDue <= 2 ? 'warning' : 'primary'} size="md">
            {isPast ? 'Overdue' : daysUntilDue !== null && daysUntilDue <= 2 ? 'Due Soon' : dueDate ? 'Open' : 'No Due Date'}
          </Badge>
        </div>
        <div className="cx-assignment-detail__meta">
          <span className="cx-assignment-detail__points">{assignment.points_possible} points</span>
          {dueDate && (
            <span className="cx-assignment-detail__due">
              Due: {dueDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {isPast ? ' (past due)' : daysUntilDue !== null ? ` (${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} remaining)` : ''}
            </span>
          )}
          <span className="cx-assignment-detail__type">{assignment.grading_type?.replace('_', ' ') || 'Points'}</span>
        </div>
        <SubmissionStatus
          status={submissionStatus as any}
          grade={assignment.submission?.score}
          pointsPossible={assignment.points_possible}
          size="md"
        />
      </div>

      <div className="cx-assignment-detail__body">
        <div className="cx-assignment-detail__description">
          <h2>Description</h2>
          <div dangerouslySetInnerHTML={{ __html: assignment.description || '<p>No description provided.</p>' }} />
        </div>

        {assignment.has_rubric && (
          <div className="cx-assignment-detail__rubric">
            <h2>Rubric</h2>
            <p className="cx-assignment-detail__rubric-hint">This assignment includes a rubric for grading.</p>
          </div>
        )}

        {assignment.score_statistics && (
          <div className="cx-assignment-detail__stats">
            <h2>Class Statistics</h2>
            <div className="cx-assignment-detail__stats-grid">
              <div className="cx-assignment-detail__stat">
                <span className="cx-assignment-detail__stat-value">{assignment.score_statistics.mean}</span>
                <span className="cx-assignment-detail__stat-label">Mean</span>
              </div>
              <div className="cx-assignment-detail__stat">
                <span className="cx-assignment-detail__stat-value">{assignment.score_statistics.min}</span>
                <span className="cx-assignment-detail__stat-label">Min</span>
              </div>
              <div className="cx-assignment-detail__stat">
                <span className="cx-assignment-detail__stat-value">{assignment.score_statistics.max}</span>
                <span className="cx-assignment-detail__stat-label">Max</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="cx-assignment-detail__submit-section">
        {!hasSubmitted ? (
          showForm ? (
            <SubmissionForm
              assignmentId={assignment.id}
              submissionTypes={assignment.submission_types || ['online_text_entry', 'online_upload', 'online_url']}
              onSubmit={async (data) => {
                try {
                  const formData = new URLSearchParams()
                  formData.append('submission[submission_type]', data.type)
                  if (data.type === 'online_text_entry' && data.body) {
                    formData.append('submission[body]', data.body)
                  } else if (data.type === 'online_url' && data.url) {
                    formData.append('submission[url]', data.url)
                  } else if (data.type === 'online_upload' && data.fileIds) {
                    data.fileIds.forEach(id => formData.append('submission[file_ids][]', String(id)))
                  }
                  
                  const res = await fetch(`/api/v1/courses/${courseId}/assignments/${assignment.id}/submissions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                  })
                  if (!res.ok) throw new Error('Submission failed')
                  alert('Assignment submitted successfully!')
                  setShowForm(false)
                  // Ideally trigger a re-fetch of the assignment data here to show updated status
                } catch (err) {
                  console.error(err)
                  alert('Failed to submit assignment. Please try again.')
                }
              }}
            />
          ) : (
            <button className="cx-assignment-detail__submit-btn" onClick={() => setShowForm(true)}>
              Start Submission
            </button>
          )
        ) : (
          <div className="cx-assignment-detail__already-submitted">
            <p>You have already submitted this assignment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
