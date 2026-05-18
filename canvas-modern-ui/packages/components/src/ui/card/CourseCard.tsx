import React, { memo, forwardRef } from 'react'
import { CanvasRole, Course, User, usePermissions } from '@schoolapex/core'
import { Button } from '../button/Button'
import clsx from 'clsx'

interface CourseCardProps {
  course: Course
  currentUser: User
  variant?: 'dashboard' | 'catalog' | 'admin' | 'compact'
  showEnrollmentInfo?: boolean
  showQuickActions?: boolean
  onEnroll?: (courseId: string) => Promise<void>
  onUnenroll?: (courseId: string) => Promise<void>
  onClick?: (course: Course) => void
  className?: string
  'data-testid'?: string
}

export const CourseCard = memo(
  forwardRef<HTMLDivElement, CourseCardProps>(
    (
      {
        course,
        currentUser,
        variant = 'dashboard',
        showEnrollmentInfo = true,
        showQuickActions = true,
        onEnroll,
        onUnenroll,
        onClick,
        className,
        'data-testid': testId,
        ...props
      },
      ref
    ) => {
      const { can } = usePermissions(currentUser.roles as CanvasRole[])
      const canEnroll = can('manageUsers')
      const canUnenroll = can('manageUsers')
      const canManage = can('editCourse')

      const navigateToCourse = (courseId: string) => {
        window.location.href = `/courses/${courseId}`
      }
      const navigateToGradebook = (courseId: string) => {
        window.location.href = `/courses/${courseId}/gradebook`
      }

      const enrollment = course.enrollments.find((e: any) => e.user_id === currentUser.id)
      const isEnrolled = !!enrollment
      const enrollmentRole = enrollment?.role

      const handleCardClick = () => {
        if (onClick) {
          onClick(course)
        } else {
          navigateToCourse(course.id)
        }
      }

      const handleEnrollClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
          if (isEnrolled && onUnenroll) {
            await onUnenroll(course.id)
          } else if (!isEnrolled && onEnroll) {
            await onEnroll(course.id)
          }
        } catch (error) {
          console.error('Enrollment action failed:', error)
        }
      }

      const handleGradebookClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigateToGradebook(course.id)
      }

      const getEnrollmentBadge = () => {
        if (!showEnrollmentInfo || !enrollment) return null

        const roleLabels: Record<string, string> = {
          student: 'Student',
          teacher: 'Teacher',
          ta: 'Teaching Assistant',
          observer: 'Observer',
          admin: 'Admin',
          designer: 'Designer',
        }

        return (
          <span
            className={clsx('course-card__enrollment-badge', `course-card__enrollment-badge--${enrollmentRole}`)}
            data-role={enrollmentRole}
          >
            {roleLabels[enrollmentRole || ''] || enrollmentRole}
          </span>
        )
      }

      const getWorkflowStateBadge = () => {
        if (course.workflow_state === 'available') return null

        const stateLabels: Record<string, string> = {
          unpublished: 'Unpublished',
          completed: 'Completed',
          deleted: 'Deleted',
        }

        return (
          <span
            className={clsx('course-card__state-badge', `course-card__state-badge--${course.workflow_state}`)}
          >
            {stateLabels[course.workflow_state] || course.workflow_state}
          </span>
        )
      }

      const isCompact = variant === 'compact'

      return (
        <div
          ref={ref}
          className={clsx(
            'cx-card',
            'course-card',
            `course-card--${variant}`,
            {
              'course-card--enrolled': isEnrolled,
              'course-card--clickable': !!onClick || variant !== 'catalog',
              'course-card--compact': isCompact,
            },
            className
          )}
          onClick={handleCardClick}
          data-testid={testId}
          role="article"
          aria-label={`Course: ${course.name}`}
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleCardClick()
            }
          }}
          {...props}
        >
          <div className="course-card__header">
            <div className="course-card__title-section">
              <h3 className="course-card__name" title={course.name}>
                {course.name}
              </h3>
              <span className="course-card__code">{course.course_code}</span>
            </div>
            
            <div className="course-card__badges">
              {getEnrollmentBadge()}
              {getWorkflowStateBadge()}
            </div>
          </div>

          {!isCompact && (
            <>
              <div className="course-card__term">
                <span className="course-card__term-label">Term:</span>
                <span className="course-card__term-name">{course.term.name}</span>
              </div>

              {course.start_at && course.end_at && (
                <div className="course-card__dates">
                  <span className="course-card__date-range">
                    {new Date(course.start_at).toLocaleDateString()} - {new Date(course.end_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </>
          )}

          {showQuickActions && (
            <div className="course-card__actions">
              {variant === 'catalog' && (
                <Button
                  variant={isEnrolled ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={handleEnrollClick}
                  disabled={!canEnroll && !canUnenroll}
                  aria-describedby={`course-${course.id}-enrollment-status`}
                >
                  {isEnrolled ? 'Unenroll' : 'Enroll'}
                </Button>
              )}

              {(variant === 'dashboard' || variant === 'admin') && canManage && (
                <div className="course-card__admin-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGradebookClick}
                    aria-label={`Open gradebook for ${course.name}`}
                  >
                    Gradebook
                  </Button>
                </div>
              )}
            </div>
          )}

          <div id={`course-${course.id}-enrollment-status`} className="sr-only">
            {isEnrolled
              ? `You are enrolled as ${enrollmentRole} in this course`
              : 'You are not enrolled in this course'}
          </div>
        </div>
      )
    }
  )
)

CourseCard.displayName = 'CourseCard'

interface CourseCardGridProps {
  courses: Course[]
  currentUser: User
  variant?: CourseCardProps['variant']
  onEnroll?: (courseId: string) => Promise<void>
  onUnenroll?: (courseId: string) => Promise<void>
  onCourseClick?: (course: Course) => void
  className?: string
  emptyMessage?: string
}

export const CourseCardGrid: React.FC<CourseCardGridProps> = ({
  courses,
  currentUser,
  variant = 'dashboard',
  onEnroll,
  onUnenroll,
  onCourseClick,
  className,
  emptyMessage = 'No courses found',
}) => {
  if (courses.length === 0) {
    return (
      <div className={clsx('course-card-grid__empty', className)}>
        <p className="course-card-grid__empty-message">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={clsx('course-card-grid', `course-card-grid--${variant}`, className)}>
      {courses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          currentUser={currentUser}
          variant={variant}
          onEnroll={onEnroll}
          onUnenroll={onUnenroll}
          onClick={onCourseClick}
        />
      ))}
    </div>
  )
}
