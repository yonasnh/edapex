import React, { memo, forwardRef } from 'react'
import { Assignment, User, Submission } from '@schoolapex/core'
import { Button } from '../button/Button'
import clsx from 'clsx'

const mapTagTypeToBadgeVariant = (type: string): string => {
  const map: Record<string, string> = {
    green: 'success',
    red: 'danger',
    blue: 'info',
    purple: 'info',
    'warm-gray': 'warning',
    gray: 'default',
    yellow: 'warning',
  }
  return map[type] || 'default'
}

interface AssignmentCardProps {
  assignment: Assignment
  currentUser: User
  submission?: Submission | null
  variant?: 'dashboard' | 'course' | 'gradebook' | 'compact'
  showDueDate?: boolean
  showSubmissionStatus?: boolean
  showQuickActions?: boolean
  onSubmit?: (assignmentId: string) => Promise<void>
  onGrade?: (assignmentId: string) => Promise<void>
  onClick?: (assignment: Assignment) => void
  className?: string
  'data-testid'?: string
}

export const AssignmentCard = memo(
  forwardRef<HTMLDivElement, AssignmentCardProps>(
    (
      {
        assignment,
        currentUser,
        submission,
        variant = 'dashboard',
        showDueDate = true,
        showSubmissionStatus = true,
        showQuickActions = true,
        onSubmit,
        onGrade,
        onClick,
        className,
        'data-testid': testId,
        ...props
      },
      ref
    ) => {
      const navigateToAssignment = (courseId: string, _assignmentId: string) => {
        window.location.href = `/courses/${courseId}/assignments/${_assignmentId}`
      }

      const handleCardClick = () => {
        if (onClick) {
          onClick(assignment)
        } else {
          navigateToAssignment(assignment.course_id, assignment.id)
        }
      }

      const handleTitleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        handleCardClick()
      }

      const handleSubmitClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
          if (onSubmit) {
            await onSubmit(assignment.id)
          }
        } catch (error) {
          console.error('Submit action failed:', error)
        }
      }

      const handleGradeClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
          if (onGrade) {
            await onGrade(assignment.id)
          }
        } catch (error) {
          console.error('Grade action failed:', error)
        }
      }

      const getDueDateInfo = () => {
        if (!assignment.due_at) return null

        const dueDate = new Date(assignment.due_at)
        const now = new Date()
        const isOverdue = dueDate < now && (!submission || !submission.submitted_at)
        const isDueSoon = dueDate > now && (dueDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000

        return {
          dueDate,
          isOverdue,
          isDueSoon,
          dueDateString: dueDate.toLocaleDateString(),
          dueTimeString: dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }

      const getSubmissionStatus = () => {
        if (!submission) {
          return {
            status: 'not_submitted',
            label: 'Not Submitted',
            variant: 'gray' as const
          }
        }

        switch (submission.workflow_state) {
          case 'submitted':
            return {
              status: 'submitted',
              label: 'Submitted',
              variant: 'green' as const
            }
          case 'graded':
            return {
              status: 'graded',
              label: 'Graded',
              variant: 'blue' as const
            }
          case 'pending_review':
            return {
              status: 'pending_review',
              label: 'Pending Review',
              variant: 'warm-gray' as const
            }
          default:
            return {
              status: 'unsubmitted',
              label: 'Not Submitted',
              variant: 'gray' as const
            }
        }
      }

      const getGradingTypeLabel = () => {
        const labels: Record<string, string> = {
          pass_fail: 'Pass/Fail',
          percent: 'Percentage',
          letter_grade: 'Letter Grade',
          gpa_scale: 'GPA Scale',
          points: 'Points'
        }
        return labels[assignment.grading_type] || assignment.grading_type
      }

      const dueDateInfo = getDueDateInfo()
      const submissionStatus = getSubmissionStatus()
      const isCompact = variant === 'compact'
      const canSubmit = assignment.workflow_state === 'published' && !submission?.submitted_at
      const canGrade = currentUser.roles.includes('teacher') || currentUser.roles.includes('ta')

      return (
        <div
          ref={ref}
          className={clsx(
            'cx-card',
            'assignment-card',
            `assignment-card--${variant}`,
            {
              'assignment-card--overdue': dueDateInfo?.isOverdue,
              'assignment-card--due-soon': dueDateInfo?.isDueSoon,
              'assignment-card--submitted': submission?.submitted_at,
              'assignment-card--graded': submission?.workflow_state === 'graded',
              'assignment-card--clickable': !!onClick || variant !== 'gradebook',
              'assignment-card--compact': isCompact,
            },
            className
          )}
          onClick={handleCardClick}
          data-testid={testId}
          role="article"
          aria-label={`Assignment: ${assignment.name}`}
          {...props}
        >
          <div className="assignment-card__header">
            <div className="assignment-card__title-section">
              <h3 className="assignment-card__name" title={assignment.name}>
                <button
                  type="button"
                  className="assignment-card__name-link"
                  onClick={handleTitleClick}
                >
                  {assignment.name}
                </button>
              </h3>
              {assignment.points_possible && (
                <span className="assignment-card__points">
                  {assignment.points_possible} pts
                </span>
              )}
            </div>
            
            <div className="assignment-card__badges">
              {showSubmissionStatus && (
                <span className={clsx('cx-badge', `cx-badge--${mapTagTypeToBadgeVariant(submissionStatus.variant)}`, 'cx-badge--sm')}>
                  {submissionStatus.label}
                </span>
              )}
              {dueDateInfo?.isOverdue && (
                <span className="cx-badge cx-badge--danger cx-badge--sm">
                  Overdue
                </span>
              )}
              {dueDateInfo?.isDueSoon && (
                <span className="cx-badge cx-badge--warning cx-badge--sm">
                  Due Soon
                </span>
              )}
            </div>
          </div>

          {!isCompact && (
            <>
              {showDueDate && dueDateInfo && (
                <div className="assignment-card__due-date">
                  <span className="assignment-card__due-label">Due:</span>
                  <span className="assignment-card__due-value">
                    {dueDateInfo.dueDateString} at {dueDateInfo.dueTimeString}
                  </span>
                </div>
              )}

              <div className="assignment-card__details">
                <span className="assignment-card__grading-type">
                  {getGradingTypeLabel()}
                </span>
                {submission?.score !== null && submission?.score !== undefined && (
                  <span className="assignment-card__score">
                    Score: {submission.score}/{assignment.points_possible}
                  </span>
                )}
              </div>

              {assignment.description && (
                <div className="assignment-card__description">
                  <p className="assignment-card__description-text">
                    {assignment.description.length > 100
                      ? `${assignment.description.substring(0, 100)}...`
                      : assignment.description}
                  </p>
                </div>
              )}
            </>
          )}

          {showQuickActions && (
            <div className="assignment-card__actions">
              {canSubmit && onSubmit && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitClick}
                  aria-label={`Submit ${assignment.name}`}
                >
                  Submit
                </Button>
              )}

              {canGrade && onGrade && submission && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGradeClick}
                  aria-label={`Grade ${assignment.name}`}
                >
                  Grade
                </Button>
              )}

              {variant === 'dashboard' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCardClick}
                  aria-label={`View ${assignment.name}`}
                >
                  View
                </Button>
              )}
            </div>
          )}

          <div className="sr-only">
            Assignment {assignment.name}.
            {dueDateInfo && ` Due ${dueDateInfo.dueDateString} at ${dueDateInfo.dueTimeString}.`}
            {submission && ` Status: ${submissionStatus.label}.`}
            {submission?.score !== null && submission?.score !== undefined && 
              ` Score: ${submission.score} out of ${assignment.points_possible} points.`}
          </div>
        </div>
      )
    }
  )
)

AssignmentCard.displayName = 'AssignmentCard'

interface AssignmentCardGridProps {
  assignments: Assignment[]
  currentUser: User
  submissions?: Record<string, Submission>
  variant?: AssignmentCardProps['variant']
  onSubmit?: (assignmentId: string) => Promise<void>
  onGrade?: (assignmentId: string) => Promise<void>
  onAssignmentClick?: (assignment: Assignment) => void
  className?: string
  emptyMessage?: string
  groupBy?: 'due_date' | 'assignment_group' | 'none'
}

export const AssignmentCardGrid: React.FC<AssignmentCardGridProps> = ({
  assignments,
  currentUser,
  submissions = {},
  variant = 'dashboard',
  onSubmit,
  onGrade,
  onAssignmentClick,
  className,
  emptyMessage = 'No assignments found',
  groupBy = 'none'
}) => {
  if (assignments.length === 0) {
    return (
      <div className={clsx('assignment-card-grid__empty', className)}>
        <p className="assignment-card-grid__empty-message">{emptyMessage}</p>
      </div>
    )
  }

  const groupAssignments = () => {
    if (groupBy === 'none') {
      return [{ title: null, assignments }]
    }

    if (groupBy === 'due_date') {
      const groups: Record<string, Assignment[]> = {}

      assignments.forEach(assignment => {
        const key = assignment.due_at
          ? new Date(assignment.due_at).toDateString()
          : 'No Due Date'

        if (!groups[key]) groups[key] = []
        groups[key].push(assignment)
      })

      return Object.entries(groups)
        .sort(([a], [b]) => {
          if (a === 'No Due Date') return 1
          if (b === 'No Due Date') return -1
          return new Date(a).getTime() - new Date(b).getTime()
        })
        .map(([title, assignments]) => ({ title, assignments }))
    }

    return [{ title: null, assignments }]
  }

  const groupedAssignments = groupAssignments()

  return (
    <div className={clsx('assignment-card-grid', `assignment-card-grid--${variant}`, className)}>
      {groupedAssignments.map(({ title, assignments: groupAssignments }, groupIndex) => (
        <div key={title || groupIndex} className="assignment-card-grid__group">
          {title && (
            <h3 className="assignment-card-grid__group-title">{title}</h3>
          )}
          <div className="assignment-card-grid__items">
            {groupAssignments.map(assignment => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                currentUser={currentUser}
                submission={submissions[assignment.id]}
                variant={variant}
                onSubmit={onSubmit}
                onGrade={onGrade}
                onClick={onAssignmentClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
