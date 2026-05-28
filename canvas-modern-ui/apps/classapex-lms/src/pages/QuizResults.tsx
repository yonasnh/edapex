/**
 * QuizResults — ClassApex LMS
 * =================================
 * Dual-role quiz results page:
 *   Teachers: full submission list with statistics, filters, and grading status
 *   Students: personal submission with correct-answer reveal based on quiz settings
 *
 * Canvas REST API:
 *   GET /api/v1/courses/:courseId/quizzes/:quizId
 *   GET /api/v1/courses/:courseId/quizzes/:quizId/submissions
 *   GET /api/v1/courses/:courseId/quizzes/:quizId/statistics
 *   GET /api/v1/courses/:courseId/quizzes/:quizId/questions
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizSettings {
  id: number
  title: string
  points_possible: number
  hide_results: string | null
  show_correct_answers: boolean
  show_correct_answers_last_attempt: boolean
  show_correct_answers_at: string | null
  hide_correct_answers_at: string | null
  allowed_attempts: number
}

interface QuizQuestion {
  id: number
  question_name: string
  question_text: string
  question_type: string
  points_possible: number
  answers?: { id: number; text: string; html?: string; correct?: boolean }[]
}

interface SubmissionAnswer {
  question_id: number
  answer?: any
  correct?: boolean
  points?: number
  text?: string
}

interface QuizSubmission {
  id: number
  user_id: number
  user?: { name: string; login_id?: string }
  score: number | null
  attempt: number
  time_spent: number | null
  workflow_state: string
  submission_data?: SubmissionAnswer[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shouldShowCorrectAnswers(
  quiz: QuizSettings | undefined,
  submission: QuizSubmission | undefined
): boolean {
  if (!quiz || !submission) return false
  if (quiz.hide_results === 'always') return false
  if (quiz.hide_results === 'until_after_last_attempt') {
    if (quiz.allowed_attempts > 0 && submission.attempt < quiz.allowed_attempts) return false
  }
  if (!quiz.show_correct_answers) return false
  if (quiz.show_correct_answers_last_attempt && quiz.allowed_attempts > 1) {
    if (submission.attempt < quiz.allowed_attempts) return false
  }
  const now = new Date()
  if (quiz.show_correct_answers_at) {
    if (now < new Date(quiz.show_correct_answers_at)) return false
  }
  if (quiz.hide_correct_answers_at) {
    if (now > new Date(quiz.hide_correct_answers_at)) return false
  }
  return true
}

function getCorrectAnswerText(question: QuizQuestion | undefined, answerData: any): string {
  if (!question) return ''
  const correct = question.answers?.find(a => a.correct)
  if (correct) return correct.text || correct.html || String(correct.id)
  return ''
}

function formatAnswer(answer: any): string {
  if (answer === null || answer === undefined) return '—'
  if (typeof answer === 'boolean') return answer ? 'True' : 'False'
  if (typeof answer === 'number') return String(answer)
  if (typeof answer === 'string') return answer
  if (Array.isArray(answer)) return answer.join(', ')
  if (typeof answer === 'object') return JSON.stringify(answer)
  return String(answer)
}

// ─── Student Result Card ──────────────────────────────────────────────────────

function StudentResultView({
  quiz,
  submission,
  questions,
  isLoading,
}: {
  quiz?: QuizSettings
  submission?: QuizSubmission
  questions?: QuizQuestion[]
  isLoading: boolean
}) {
  const [expandedQ, setExpandedQ] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="cx-skeleton" style={{ height: 80, borderRadius: 10 }} />
        ))}
      </div>
    )
  }

  if (!submission) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cx-text-tertiary)' }}>
        <p>You have not submitted this quiz yet.</p>
      </div>
    )
  }

  const showCorrect = shouldShowCorrectAnswers(quiz, submission)
  const scorePercent = quiz?.points_possible
    ? Math.round(((submission.score || 0) / quiz.points_possible) * 100)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Score Summary */}
      <div
        className="cx-card"
        style={{
          padding: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 16,
          background: 'var(--cx-bg-surface-elevated)',
          border: '1px solid var(--cx-border-subtle)',
          borderRadius: 12,
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Score</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
            {submission.score !== null ? submission.score : '—'}
            <span style={{ fontSize: '1rem', color: 'var(--cx-text-tertiary)' }}> / {quiz?.points_possible || 0}</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Percentage</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: scorePercent >= 70 ? 'var(--cx-color-success)' : scorePercent >= 50 ? 'var(--cx-color-warning)' : 'var(--cx-color-danger)' }}>
            {scorePercent}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Attempt</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>{submission.attempt}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Time Spent</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
            {submission.time_spent ? `${Math.round(submission.time_spent / 60)}m` : '—'}
          </div>
        </div>
      </div>

      {/* Correct answers notice */}
      {quiz?.show_correct_answers && !showCorrect && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'var(--cx-color-info-subtle, rgba(59,130,246,0.1))',
            color: 'var(--cx-color-info, #2563eb)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v4l3 3" />
          </svg>
          Correct answers will be shown {quiz.show_correct_answers_at ? `after ${new Date(quiz.show_correct_answers_at).toLocaleDateString()}` : 'soon'}.
        </div>
      )}

      {/* Question Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>Question Breakdown</h3>
        {submission.submission_data?.map((ans, i) => {
          const q = questions?.find(qx => qx.id === ans.question_id)
          const isExpanded = expandedQ === ans.question_id
          const correct = ans.correct
          return (
            <div
              key={ans.question_id}
              data-testid={`question-${ans.question_id}`}
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                background: 'var(--cx-bg-surface-elevated)',
                border: '1px solid var(--cx-border-subtle)',
                cursor: 'pointer',
              }}
              onClick={() => setExpandedQ(isExpanded ? null : ans.question_id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)', marginBottom: 2 }}>
                    Q{i + 1}: {q?.question_name || `Question ${ans.question_id}`}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                    Your answer: {formatAnswer(ans.answer)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {correct !== undefined && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 12,
                        textTransform: 'uppercase',
                        background: correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: correct ? '#059669' : '#dc2626',
                      }}
                    >
                      {correct ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--cx-border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q?.question_text && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }} dangerouslySetInnerHTML={{ __html: q.question_text }} />
                  )}
                  <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
                    <strong>Your answer:</strong> {formatAnswer(ans.answer)}
                  </div>
                  {showCorrect && correct === false && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--cx-color-success)' }}>
                      <strong>Correct answer:</strong> {getCorrectAnswerText(q, ans.answer)}
                    </div>
                  )}
                  {ans.points !== undefined && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)' }}>
                      Points: {ans.points} / {q?.points_possible || 0}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Teacher Submissions Table ────────────────────────────────────────────────

function TeacherResultsView({
  submissions,
  stats,
  isLoading,
}: {
  submissions?: QuizSubmission[]
  stats?: any
  isLoading: boolean
}) {
  const [filterText, setFilterText] = useState('')
  const [showOnlyNeedsGrading, setShowOnlyNeedsGrading] = useState(false)
  const [expandedSub, setExpandedSub] = useState<number | null>(null)

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

  return (
    <>
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
        <input
          type="text"
          className="cx-input"
          placeholder="Search student name..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          style={{ maxWidth: 260 }}
          data-testid="filter-name"
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--cx-text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showOnlyNeedsGrading} onChange={e => setShowOnlyNeedsGrading(e.target.checked)} />
          Only needs grading
        </label>
      </div>

      {/* Submissions Table */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 48, borderRadius: 8 }} />
          ))}
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
              const statusColor =
                sub.workflow_state === 'pending_review'
                  ? 'var(--cx-color-warning, #d97706)'
                  : sub.workflow_state === 'complete'
                  ? 'var(--cx-color-success, #059669)'
                  : 'var(--cx-text-tertiary)'
              return (
                <React.Fragment key={sub.id}>
                  <tr
                    style={{ borderBottom: '1px solid var(--cx-border-subtle)', cursor: 'pointer' }}
                    onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}
                    data-testid={`submission-${sub.id}`}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sub.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>{sub.user?.login_id}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--cx-text-primary)' }}>{sub.score !== null ? sub.score : '—'}</td>
                    <td style={{ textAlign: 'center', color: 'var(--cx-text-secondary)' }}>{sub.attempt || 1}</td>
                    <td style={{ textAlign: 'center', color: 'var(--cx-text-secondary)' }}>{sub.time_spent ? `${Math.round(sub.time_spent / 60)}m` : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: statusColor, padding: '3px 10px', borderRadius: 12, textTransform: 'uppercase' }}>
                        {sub.workflow_state.replace('_', ' ')}
                      </span>
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
                            <span>
                              Q{ans.question_id}: {ans.text || formatAnswer(ans.answer)}
                            </span>
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
    </>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function QuizResultsPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'

  const { data: quiz } = useCanvasQuery<QuizSettings>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}` : ''
  )

  const { data: rawSubmissions, isLoading: subsLoading } = useCanvasQuery<any[]>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}/submissions` : '',
    { per_page: 100, include: ['user'] } as any
  )

  const { data: stats } = useCanvasQuery<any>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}/statistics` : ''
  )

  const { data: questions } = useCanvasQuery<QuizQuestion[]>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}/questions` : '',
    { per_page: 100 } as any
  )

  // Canvas returns quiz_submissions array nested or flat depending on endpoint
  const submissions = React.useMemo<QuizSubmission[] | undefined>(() => {
    if (!Array.isArray(rawSubmissions)) return undefined
    const list = rawSubmissions[0]?.quiz_submissions ? rawSubmissions.flatMap((s: any) => s.quiz_submissions || []) : rawSubmissions
    return list as QuizSubmission[]
  }, [rawSubmissions])

  // For students, pick their own submission
  const studentSubmission = React.useMemo(() => {
    if (isTeacher || !submissions) return undefined
    return submissions[0] as QuizSubmission | undefined
  }, [submissions, isTeacher])

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>
          {quiz?.title ? `${quiz.title} — Results` : 'Quiz Results'}
        </h2>
      </div>

      {isTeacher ? (
        <TeacherResultsView submissions={submissions} stats={stats} isLoading={subsLoading} />
      ) : (
        <StudentResultView quiz={quiz ?? undefined} submission={studentSubmission} questions={questions ?? undefined} isLoading={subsLoading} />
      )}
    </div>
  )
}
