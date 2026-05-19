import React, { memo } from 'react'
import { Tile, ProgressBar, Tag } from '@carbon/react'
import { Assignment, User, Submission } from '@schoolapex/core'
import clsx from 'clsx'

/**
 * Grade statistics for a course
 */
interface GradeStats {
  totalStudents: number
  averageScore: number
  highestScore: number
  lowestScore: number
  submissionRate: number
  gradedRate: number
  distribution: {
    A: number
    B: number
    C: number
    D: number
    F: number
  }
}

/**
 * Gradebook Summary component props
 */
interface GradebookSummaryProps {
  courseId: string
  courseName: string
  students: User[]
  assignments: Assignment[]
  submissions: Record<string, Submission[]> // keyed by student ID
  variant?: 'dashboard' | 'detailed'
  onViewFullGradebook?: () => void
  className?: string
  'data-testid'?: string
}

/**
 * Calculate grade statistics from submissions data
 */
const calculateGradeStats = (
  students: User[],
  assignments: Assignment[],
  submissions: Record<string, Submission[]>
): GradeStats => {
  const totalStudents = students.length
  const scores: number[] = []
  let totalSubmissions = 0
  let totalGraded = 0
  let totalPossible = 0

  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 }

  students.forEach(student => {
    const studentSubmissions = submissions[student.id] || []
    let studentScore = 0
    let studentPossible = 0

    assignments.forEach(assignment => {
      const submission = studentSubmissions.find(s => s.assignment_id === assignment.id)
      const points = assignment.points_possible || 0
      
      studentPossible += points
      totalPossible += points

      if (submission) {
        totalSubmissions++
        if (submission.workflow_state === 'graded' && submission.score !== null) {
          totalGraded++
          studentScore += submission.score
        }
      }
    })

    if (studentPossible > 0) {
      const percentage = (studentScore / studentPossible) * 100
      scores.push(percentage)

      // Calculate letter grade distribution
      if (percentage >= 90) distribution.A++
      else if (percentage >= 80) distribution.B++
      else if (percentage >= 70) distribution.C++
      else if (percentage >= 60) distribution.D++
      else distribution.F++
    }
  })

  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0
  const submissionRate = totalPossible > 0 ? (totalSubmissions / (totalStudents * assignments.length)) * 100 : 0
  const gradedRate = totalSubmissions > 0 ? (totalGraded / totalSubmissions) * 100 : 0

  return {
    totalStudents,
    averageScore,
    highestScore,
    lowestScore,
    submissionRate,
    gradedRate,
    distribution
  }
}

/**
 * Grade distribution chart component
 */
interface GradeDistributionProps {
  distribution: GradeStats['distribution']
  totalStudents: number
}

const GradeDistribution: React.FC<GradeDistributionProps> = ({ distribution, totalStudents }) => {
  const grades = ['A', 'B', 'C', 'D', 'F'] as const
  
  return (
    <div className="grade-distribution">
      <h4 className="grade-distribution__title">Grade Distribution</h4>
      <div className="grade-distribution__chart">
        {grades.map(grade => {
          const count = distribution[grade]
          const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0
          
          return (
            <div key={grade} className="grade-distribution__item">
              <div className="grade-distribution__label">
                <span className="grade-distribution__grade">{grade}</span>
                <span className="grade-distribution__count">({count})</span>
              </div>
              <ProgressBar
                label={`${grade} grade distribution`}
                value={percentage}
                max={100}
                size="small"
                className={`grade-distribution__bar grade-distribution__bar--${grade.toLowerCase()}`}
              />
              <span className="grade-distribution__percentage">{percentage.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * SchoolApex Gradebook Summary component
 *
 * Displays key gradebook statistics and metrics for a course, including
 * average scores, submission rates, and grade distribution.
 *
 * @example
 * ```tsx
 * <GradebookSummary
 *   courseId="123"
 *   courseName="Advanced Web Development"
 *   students={students}
 *   assignments={assignments}
 *   submissions={submissions}
 *   variant="dashboard"
 *   onViewFullGradebook={() => navigate('/gradebook')}
 * />
 * ```
 */
export const GradebookSummary = memo<GradebookSummaryProps>(({
  courseId,
  courseName,
  students,
  assignments,
  submissions,
  variant = 'dashboard',
  onViewFullGradebook,
  className,
  'data-testid': testId,
  ...props
}) => {
  const stats = calculateGradeStats(students, assignments, submissions)
  const isDetailed = variant === 'detailed'

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green'
    if (score >= 80) return 'blue'
    if (score >= 70) return 'warm-gray'
    if (score >= 60) return 'warm-gray'
    return 'red'
  }

  return (
    <Tile
      className={clsx('gradebook-summary', `gradebook-summary--${variant}`, className)}
      data-testid={testId}
      {...props}
    >
      <div className="gradebook-summary__header">
        <h3 className="gradebook-summary__title">
          {isDetailed ? `${courseName} - Gradebook Summary` : 'Gradebook Overview'}
        </h3>
        {onViewFullGradebook && (
          <button
            className="gradebook-summary__view-link"
            onClick={onViewFullGradebook}
            type="button"
          >
            View Full Gradebook →
          </button>
        )}
      </div>

      <div className="gradebook-summary__stats">
        <div className="gradebook-summary__stat-grid">
          <div className="gradebook-summary__stat">
            <span className="gradebook-summary__stat-label">Students</span>
            <span className="gradebook-summary__stat-value">{stats.totalStudents}</span>
          </div>

          <div className="gradebook-summary__stat">
            <span className="gradebook-summary__stat-label">Assignments</span>
            <span className="gradebook-summary__stat-value">{assignments.length}</span>
          </div>

          <div className="gradebook-summary__stat">
            <span className="gradebook-summary__stat-label">Class Average</span>
            <div className="gradebook-summary__stat-value-with-tag">
              <span className="gradebook-summary__stat-value">
                {stats.averageScore.toFixed(1)}%
              </span>
              <Tag type={getScoreColor(stats.averageScore)} size="sm">
                {stats.averageScore >= 90 ? 'A' :
                 stats.averageScore >= 80 ? 'B' :
                 stats.averageScore >= 70 ? 'C' :
                 stats.averageScore >= 60 ? 'D' : 'F'}
              </Tag>
            </div>
          </div>

          <div className="gradebook-summary__stat">
            <span className="gradebook-summary__stat-label">Submission Rate</span>
            <span className="gradebook-summary__stat-value">{stats.submissionRate.toFixed(1)}%</span>
          </div>
        </div>

        {isDetailed && (
          <>
            <div className="gradebook-summary__detailed-stats">
              <div className="gradebook-summary__stat">
                <span className="gradebook-summary__stat-label">Highest Score</span>
                <span className="gradebook-summary__stat-value">{stats.highestScore.toFixed(1)}%</span>
              </div>

              <div className="gradebook-summary__stat">
                <span className="gradebook-summary__stat-label">Lowest Score</span>
                <span className="gradebook-summary__stat-value">{stats.lowestScore.toFixed(1)}%</span>
              </div>

              <div className="gradebook-summary__stat">
                <span className="gradebook-summary__stat-label">Graded Rate</span>
                <span className="gradebook-summary__stat-value">{stats.gradedRate.toFixed(1)}%</span>
              </div>
            </div>

            <GradeDistribution 
              distribution={stats.distribution} 
              totalStudents={stats.totalStudents} 
            />
          </>
        )}
      </div>

      {!isDetailed && (
        <div className="gradebook-summary__quick-stats">
          <div className="gradebook-summary__progress">
            <span className="gradebook-summary__progress-label">Submissions</span>
            <ProgressBar
              label="Submission rate progress"
              value={stats.submissionRate}
              max={100}
              size="small"
              className="gradebook-summary__progress-bar"
            />
          </div>
          
          <div className="gradebook-summary__progress">
            <span className="gradebook-summary__progress-label">Graded</span>
            <ProgressBar
              label="Graded rate progress"
              value={stats.gradedRate}
              max={100}
              size="small"
              className="gradebook-summary__progress-bar"
            />
          </div>
        </div>
      )}

      {/* Screen reader content */}
      <div className="sr-only">
        Gradebook summary for {courseName}. 
        {stats.totalStudents} students, {assignments.length} assignments.
        Class average: {stats.averageScore.toFixed(1)}%.
        Submission rate: {stats.submissionRate.toFixed(1)}%.
        Graded rate: {stats.gradedRate.toFixed(1)}%.
      </div>
    </Tile>
  )
})

GradebookSummary.displayName = 'GradebookSummary'
