/**
 * Quizzes — ClassApex LMS (S17)
 * ================================
 * Canvas REST API integration:
 *  GET  /api/v1/courses/:id/quizzes              — list
 *  GET  /api/v1/courses/:id/quizzes/:id          — quiz detail
 *  GET  /api/v1/courses/:id/quizzes/:id/questions — questions
 *  POST /api/v1/courses/:id/quizzes/:id/submissions — start attempt
 *  PUT  /api/v1/courses/:id/quizzes/:id/submissions/:id/questions — answer
 *  POST /api/v1/courses/:id/quizzes/:id/submissions/:id/complete  — submit
 */

import React, { useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery } from '../hooks/useCanvasQuery'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Quiz {
  id: number
  title: string
  description?: string
  quiz_type: 'assignment' | 'practice_quiz' | 'graded_survey' | 'survey'
  time_limit?: number
  allowed_attempts: number
  question_count: number
  points_possible: number
  due_at?: string
  workflow_state: 'published' | 'unpublished'
  locked_for_user?: boolean
}

interface QuizQuestion {
  id: number
  position: number
  question_name: string
  question_type: 'multiple_choice_question' | 'true_false_question' | 'short_answer_question' | 'essay_question' | 'multiple_answers_question'
  question_text: string
  points_possible: number
  answers?: { id: number; text: string; html?: string }[]
}

interface QuizSubmission {
  id: number
  quiz_id: number
  user_id: number
  attempt: number
  workflow_state: 'untaken' | 'pending_review' | 'complete'
  score?: number
  kept_score?: number
  time_spent?: number
}

// ─── CSRF helper ──────────────────────────────────────────────────────────────

async function csrfFetch(path: string, method: string, body?: object): Promise<Response> {
  const token = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? ''
  return fetch(path, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': decodeURIComponent(token),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ─── Quiz Taker ───────────────────────────────────────────────────────────────

function QuizTaker({
  courseId,
  quizId,
  onExit,
}: {
  courseId: string
  quizId: number
  onExit: () => void
}) {
  const [submission, setSubmission] = useState<QuizSubmission | null>(null)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Touch Swipe Gesture State (S22-04)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const { data: quiz } = useCanvasQuery<Quiz>(`/api/v1/courses/${courseId}/quizzes/${quizId}`)
  const { data: rawQuestions } = useCanvasQuery<QuizQuestion[]>(
    `/api/v1/courses/${courseId}/quizzes/${quizId}/questions`,
    { per_page: 100 } as any
  )
  const questions = rawQuestions ?? []

  const handleStart = useCallback(async () => {
    setStarting(true); setError(null)
    try {
      const res = await csrfFetch(`/api/v1/courses/${courseId}/quizzes/${quizId}/submissions`, 'POST')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setSubmission(json.quiz_submissions?.[0] ?? null)
    } catch (e: any) {
      setError(e.message || 'Could not start quiz')
    } finally {
      setStarting(false)
    }
  }, [courseId, quizId])

  const handleAnswer = (qId: number, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  const handleSubmit = useCallback(async () => {
    if (!submission) return
    setSubmitting(true); setError(null)
    try {
      // Build quiz_submissions payload
      const quiz_questions = questions.map(q => ({
        id: q.id,
        answer: answers[q.id] ?? '',
      }))
      await csrfFetch(
        `/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submission.id}/complete`,
        'POST',
        { attempt: submission.attempt, quiz_questions }
      )
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }, [submission, questions, answers, courseId, quizId])

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipeDistance = 60
    if (distance > minSwipeDistance && currentQ < questions.length - 1) {
      // Swiped Left -> Next Question
      setCurrentQ(p => p + 1)
    } else if (distance < -minSwipeDistance && currentQ > 0) {
      // Swiped Right -> Previous Question
      setCurrentQ(p => p - 1)
    }
  }

  if (!quiz) {
    return (
      <div className="cx-page">
        <div className="cx-loading"><div className="cx-loading__spinner" /></div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="cx-page" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 48 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cx-text-primary)', marginBottom: 8 }}>
          Quiz Submitted!
        </h2>
        <p style={{ color: 'var(--cx-text-secondary)', marginBottom: 24 }}>
          Your answers have been recorded. Scores will be available after grading.
        </p>
        <button className="cx-btn cx-btn--primary" onClick={onExit}>Back to Quizzes</button>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="cx-page" style={{ maxWidth: 640, margin: '0 auto' }}>
        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={onExit} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <div className="cx-card" style={{ padding: 32 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8, color: 'var(--cx-text-primary)' }}>
            {quiz.title}
          </h1>
          {quiz.description && (
            <div
              style={{ fontSize: '0.9rem', color: 'var(--cx-text-secondary)', marginBottom: 20 }}
              dangerouslySetInnerHTML={{ __html: quiz.description }}
            />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px', marginBottom: 28 }}>
            {[
              { label: 'Questions', value: quiz.question_count },
              { label: 'Points', value: quiz.points_possible },
              { label: 'Time Limit', value: quiz.time_limit ? `${quiz.time_limit} min` : 'None' },
              { label: 'Attempts', value: quiz.allowed_attempts === -1 ? 'Unlimited' : quiz.allowed_attempts },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontWeight: 700, color: 'var(--cx-text-primary)', marginTop: 4 }}>{value}</div>
              </div>
            ))}
          </div>
          {error && <p style={{ color: '#ef4444', marginBottom: 12, fontSize: '0.875rem' }}>{error}</p>}
          {quiz.locked_for_user ? (
            <p style={{ color: 'var(--cx-text-tertiary)', fontStyle: 'italic' }}>This quiz is locked.</p>
          ) : (
            <button className="cx-btn cx-btn--primary" onClick={handleStart} disabled={starting}>
              {starting ? 'Starting…' : 'Start Quiz'}
            </button>
          )}
        </div>
      </div>
    )
  }

  const q = questions[currentQ]
  const progress = Math.round(((currentQ + 1) / questions.length) * 100)

  return (
    <div className="cx-page" style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, color: 'var(--cx-text-primary)', margin: 0 }}>{quiz.title}</h2>
        <span style={{ fontSize: '0.82rem', color: 'var(--cx-text-tertiary)' }}>
          Question {currentQ + 1} of {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--cx-border-subtle)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--cx-color-primary)', borderRadius: 3, transition: 'width 0.3s ease' }} />
      </div>

      {/* Question Card with Touch/Swipe Gestures */}
      {q && (
        <div
          className="cx-card touch-optimized-card"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            padding: 28,
            marginBottom: 20,
            touchAction: 'pan-y',
            position: 'relative',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <span style={{
              background: 'var(--cx-color-primary)',
              color: '#fff',
              borderRadius: '50%',
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 700, flexShrink: 0,
            }}>{currentQ + 1}</span>
            <div>
              <div
                style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--cx-text-primary)', lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{ __html: q.question_text }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
                {q.points_possible} pt{q.points_possible !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Touch-Friendly Answer inputs */}
          <div className="touch-friendly-options" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(q.question_type === 'multiple_choice_question' || q.question_type === 'true_false_question') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {q.answers?.map(ans => {
                  const isSelected = answers[q.id] === String(ans.id);
                  return (
                    <label
                      key={ans.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                        padding: '16px 20px', borderRadius: 12, border: '2px solid',
                        borderColor: isSelected ? 'var(--cx-color-primary)' : 'var(--cx-border-subtle)',
                        background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--cx-bg-surface-raised, #f8fafc)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                        boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,0.12)' : 'none',
                        minHeight: 56, // Accessible touch target size
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={ans.id}
                        checked={isSelected}
                        onChange={() => handleAnswer(q.id, String(ans.id))}
                        style={{
                          accentColor: 'var(--cx-color-primary)',
                          width: 20,
                          height: 20,
                          flexShrink: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.925rem',
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? 'var(--cx-color-primary)' : 'var(--cx-text-primary)',
                          lineHeight: 1.4
                        }}
                        dangerouslySetInnerHTML={{ __html: ans.html || ans.text }}
                      />
                    </label>
                  );
                })}
              </div>
            )}

            {q.question_type === 'multiple_answers_question' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {q.answers?.map(ans => {
                  const sel = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : []
                  const checked = sel.includes(String(ans.id))
                  return (
                    <label
                      key={ans.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                        padding: '16px 20px', borderRadius: 12, border: '2px solid',
                        borderColor: checked ? 'var(--cx-color-primary)' : 'var(--cx-border-subtle)',
                        background: checked ? 'rgba(99,102,241,0.08)' : 'var(--cx-bg-surface-raised, #f8fafc)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: checked ? 'scale(1.01)' : 'scale(1)',
                        boxShadow: checked ? '0 4px 12px rgba(99,102,241,0.12)' : 'none',
                        minHeight: 56,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked ? sel.filter(s => s !== String(ans.id)) : [...sel, String(ans.id)]
                          handleAnswer(q.id, next)
                        }}
                        style={{
                          accentColor: 'var(--cx-color-primary)',
                          width: 20,
                          height: 20,
                          flexShrink: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.925rem',
                          fontWeight: checked ? 600 : 400,
                          color: checked ? 'var(--cx-color-primary)' : 'var(--cx-text-primary)',
                          lineHeight: 1.4
                        }}
                        dangerouslySetInnerHTML={{ __html: ans.html || ans.text }}
                      />
                    </label>
                  )
                })}
              </div>
            )}

            {(q.question_type === 'short_answer_question' || q.question_type === 'essay_question') && (
              <textarea
                rows={q.question_type === 'essay_question' ? 8 : 3}
                className="cx-compose__textarea"
                placeholder="Type your answer here…"
                value={(answers[q.id] as string) ?? ''}
                onChange={e => handleAnswer(q.id, e.target.value)}
                style={{
                  width: '100%',
                  resize: 'vertical',
                  fontSize: '0.95rem',
                  padding: 16,
                  borderRadius: 12,
                  borderColor: 'var(--cx-border-subtle)',
                  background: 'var(--cx-bg-surface-raised, #f8fafc)',
                  color: 'var(--cx-text-primary)',
                  boxShadow: 'none',
                  minHeight: q.question_type === 'essay_question' ? 180 : 80
                }}
              />
            )}
          </div>

          {/* Swipe indicator (shown on mobile breakpoint) */}
          <div
            className="mobile-swipe-hint"
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--cx-text-tertiary)',
              marginTop: 20,
              borderTop: '1px solid var(--cx-border-subtle)',
              paddingTop: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span>↔</span>
            <span>Swipe left/right to navigate questions</span>
            <span>↔</span>
          </div>
        </div>
      )}

      {error && <p style={{ color: '#ef4444', marginBottom: 12, fontSize: '0.875rem' }}>{error}</p>}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          className="cx-btn cx-btn--ghost"
          onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
          disabled={currentQ === 0}
          style={{ minHeight: 44, padding: '10px 16px' }}
        >
          ← Previous
        </button>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '100%', flex: 1 }}>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: '1px solid',
                borderColor: i === currentQ ? 'var(--cx-color-primary)' : answers[questions[i]?.id] ? 'var(--cx-color-primary)' : 'var(--cx-border-subtle)',
                background: i === currentQ ? 'var(--cx-color-primary)' : answers[questions[i]?.id] ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: i === currentQ ? '#fff' : 'var(--cx-text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {currentQ < questions.length - 1 ? (
          <button
            className="cx-btn cx-btn--primary"
            onClick={() => setCurrentQ(p => p + 1)}
            style={{ minHeight: 44, padding: '10px 16px' }}
          >
            Next →
          </button>
        ) : (
          <button
            className="cx-btn cx-btn--primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ minHeight: 44, padding: '10px 20px' }}
          >
            {submitting ? 'Submitting…' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Quiz List ────────────────────────────────────────────────────────────────

export default function QuizzesPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null)

  const { data: quizzes, isLoading } = useCanvasQuery<Quiz[]>(
    courseId ? `/api/v1/courses/${courseId}/quizzes` : '',
    { per_page: 50 } as any
  )

  if (selectedQuizId && courseId) {
    return (
      <QuizTaker
        courseId={courseId}
        quizId={selectedQuizId}
        onExit={() => setSelectedQuizId(null)}
      />
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0 }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Quizzes</h2>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <div key={i} className="cx-skeleton" style={{ height: 80, borderRadius: 10 }} />)}
        </div>
      ) : !quizzes || quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p>No quizzes available for this course.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {quizzes.map(quiz => (
            <li
              key={quiz.id}
              className="cx-card"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: quiz.locked_for_user ? 'not-allowed' : 'pointer', opacity: quiz.locked_for_user ? 0.6 : 1 }}
              onClick={() => !quiz.locked_for_user && setSelectedQuizId(quiz.id)}
            >
              <div style={{ fontSize: 28, flexShrink: 0 }}>
                {quiz.quiz_type === 'practice_quiz' ? '🧪' : quiz.quiz_type === 'survey' ? '📊' : '📝'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 2 }}>{quiz.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                  {quiz.question_count} questions · {quiz.points_possible} pts
                  {quiz.time_limit ? ` · ${quiz.time_limit} min` : ''}
                  {quiz.due_at ? ` · Due ${new Date(quiz.due_at).toLocaleDateString()}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {quiz.workflow_state === 'published' ? (
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#059669', fontWeight: 600 }}>Published</span>
                ) : (
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', color: '#d97706', fontWeight: 600 }}>Draft</span>
                )}
                {quiz.locked_for_user && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--cx-text-tertiary)' }}>🔒 Locked</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
