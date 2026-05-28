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

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { useRole } from '../contexts/RoleContext'
import NewQuizzesIframe from '../components/NewQuizzesIframe'
import './assignment.css'
import LogoLoader from '../components/LogoLoader'

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
  /** True if this is a Canvas New Quiz (LTI assignment) */
  is_new_quiz?: boolean
  /** The assignment ID for New Quizzes (may differ from quiz id) */
  assignment_id?: number
}

interface MatchingPair {
  id: number
  left: string
  right: string
}

interface NumericalAnswer {
  id: number
  exact?: number
  margin?: number
  approximate?: number
  range_start?: number
  range_end?: number
}

interface FormulaVariable {
  name: string
  min: number
  max: number
}

interface QuizQuestion {
  id: number
  position: number
  question_name: string
  question_type:
    | 'multiple_choice_question'
    | 'true_false_question'
    | 'short_answer_question'
    | 'essay_question'
    | 'multiple_answers_question'
    | 'matching_question'
    | 'numerical_question'
    | 'calculated_question'
    | 'file_upload_question'
    | 'fill_in_multiple_blanks_question'
  question_text: string
  points_possible: number
  answers?: { id: number; text: string; html?: string }[]
  matching_answer?: MatchingPair[]
  numerical_answer?: NumericalAnswer[]
  formulas?: string[]
  variables?: FormulaVariable[]
  blank_answers?: Record<string, { id: number; text: string }[]>
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

type AnswerValue = string | string[] | number | Record<string, string> | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCsrfToken(): string {
  const raw = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? ''
  return decodeURIComponent(raw)
}

function substituteFormulaVariables(text: string, variables: FormulaVariable[]): string {
  let result = text
  variables.forEach(v => {
    const val = Math.round((v.min + Math.random() * (v.max - v.min)) * 100) / 100
    const regex = new RegExp(`\\[${v.name}\\]`, 'g')
    result = result.replace(regex, String(val))
  })
  return result
}

function parseBlankIds(text: string): string[] {
  const matches = text.match(/\[([a-zA-Z0-9_]+)\]/g)
  if (!matches) return []
  return [...new Set(matches.map(m => m.slice(1, -1)))]
}

// ─── File Upload Area for Quiz Questions ──────────────────────────────────────

function QuizFileUpload({
  courseId,
  quizId,
  submissionId,
  onUpload,
}: {
  courseId: string
  quizId: number
  submissionId: number
  onUpload: (fileId: number) => void
}) {
  const { showToast } = useNotification()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    setIsUploading(true)
    try {
      const notifyBody: Record<string, string | number> = {
        name: file.name,
        size: file.size,
        content_type: file.type,
      }
      const notifyRes = await fetch(
        `/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/files`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
          body: JSON.stringify(notifyBody),
        }
      )
      if (!notifyRes.ok) throw new Error('Upload notify failed')
      const { upload_url, upload_params } = await notifyRes.json()

      const formData = new FormData()
      Object.entries(upload_params || {}).forEach(([k, v]) => formData.append(k, v as string))
      formData.append('file', file)
      const uploadRes = await fetch(upload_url, { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('File upload failed')

      const confirmUrl = uploadRes.headers.get('Location') || (await uploadRes.json()).location
      if (confirmUrl) await fetch(confirmUrl, { method: 'GET' })

      const result = await uploadRes.json()
      onUpload(result.id || result.file?.id || 0)
      showToast({ title: 'File uploaded', type: 'success' })
    } catch (err) {
      console.error('[Quiz] Upload failed:', err)
      showToast({ title: 'Upload failed', message: 'Check console for details.', type: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
      <div
        className="cx-file-upload-area"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) handleFile(f)
        }}
        style={{
          border: '2px dashed var(--cx-border-subtle)',
          borderRadius: 12,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'var(--cx-bg-surface-sunken)',
        }}
      >
        <div style={{ marginBottom: 8, color: 'var(--cx-color-primary)' }}>
          <svg width="32" height="32" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 15V3M4 7l4-4 4 4"/><path d="M2 17h16"/>
          </svg>
        </div>
        <p style={{ fontWeight: 500, margin: '0 0 4px' }}>{isUploading ? 'Uploading…' : 'Drag & drop a file here'}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', margin: 0 }}>or click to browse</p>
      </div>
    </div>
  )
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
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({})
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

  // Check for existing user submission to prevent 409 and enable resuming
  const { data: existingSubData } = useCanvasQuery<any>(
    `/api/v1/courses/${courseId}/quizzes/${quizId}/submission`
  )
  const existingSubmission = existingSubData?.quiz_submissions?.[0]
  const hasInProgress = existingSubmission && existingSubmission.workflow_state === 'untaken'

  const handleStart = useCallback(async () => {
    if (existingSubmission && existingSubmission.workflow_state === 'untaken') {
      setSubmission(existingSubmission)
      return
    }
    setStarting(true); setError(null)
    try {
      const json = await canvasFetch(`/api/v1/courses/${courseId}/quizzes/${quizId}/submissions`, {
        method: 'POST'
      })
      setSubmission(json.quiz_submissions?.[0] ?? null)
    } catch (e: any) {
      setError(e.message || 'Could not start quiz')
    } finally {
      setStarting(false)
    }
  }, [courseId, quizId, existingSubmission])

  const handleAnswer = (qId: number, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  const handleSubmit = useCallback(async () => {
    if (!submission) return
    setSubmitting(true); setError(null)
    try {
      // Build quiz_submissions payload
      const quiz_questions = questions.map(q => {
        const ans = answers[q.id]
        let answer: any = ans ?? ''
        // Canvas expects specific formats for complex types
        if (q.question_type === 'matching_question' && typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
          answer = answer
        }
        if (q.question_type === 'fill_in_multiple_blanks_question' && typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
          answer = answer
        }
        return {
          id: q.id,
          answer,
        }
      })
      await canvasFetch(
        `/api/v1/courses/${courseId}/quizzes/${quizId}/submissions/${submission.id}/complete`,
        {
          method: 'POST',
          body: { attempt: submission.attempt, quiz_questions }
        }
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

  // Quiz timer — must be declared before any conditional returns to satisfy Rules of Hooks
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const timerInitRef = useRef(false)

  useEffect(() => {
    if (quiz?.time_limit && !timerInitRef.current) {
      timerInitRef.current = true
      setTimeLeft(quiz.time_limit * 60)
    }
  }, [quiz?.time_limit])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  if (!quiz) {
    return (
      <div className="cx-page">
        <LogoLoader />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="cx-page cx-quiz-taker-detail">
        <div className="cx-card" style={{ margin: '48px auto 0', padding: 32, textAlign: 'center', background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 12 }}>
          <div style={{ marginBottom: 16, color: 'var(--cx-color-success, #10b981)' }}><svg width="64" height="64" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M6.5 10l2.5 2.5 5-5"/></svg></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cx-text-primary)', marginBottom: 8 }}>
            Quiz Submitted!
          </h2>
          <p style={{ color: 'var(--cx-text-secondary)', marginBottom: 24 }}>
            Your answers have been recorded. Scores will be available after grading.
          </p>
          <button className="cx-btn cx-btn--primary" onClick={onExit}>Back to Quizzes</button>
        </div>
      </div>
    )
  }

  if (!submission) {
    const attemptsLeft = quiz.allowed_attempts === -1 
      ? true 
      : existingSubmission 
        ? existingSubmission.attempt < quiz.allowed_attempts 
        : true

    return (
      <div className="cx-page cx-quiz-taker-detail">
        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={onExit} style={{ marginBottom: 16 }}>
          ← Back to Quizzes
        </button>
        <div className="cx-card" style={{ padding: 32, background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 12 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8, color: 'var(--cx-text-primary)' }}>
            {quiz.title}
          </h1>
          {quiz.description && (
            <div
              style={{ fontSize: '0.9rem', color: 'var(--cx-text-secondary)', marginBottom: 20 }}
              dangerouslySetInnerHTML={{ __html: quiz.description }}
            />
          )}

          {existingSubmission && (existingSubmission.workflow_state === 'complete' || existingSubmission.score !== undefined) && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--cx-color-success, #10b981)' }}>Quiz Completed!</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--cx-text-secondary)', marginTop: 2 }}>
                  Attempt #{existingSubmission.attempt}
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
                {existingSubmission.score} / {quiz.points_possible} pts
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px', marginBottom: 28 }}>
            {[
              { label: 'Questions', value: quiz.question_count },
              { label: 'Points', value: quiz.points_possible },
              { label: 'Time Limit', value: quiz.time_limit ? `${quiz.time_limit} min` : 'None' },
              { label: 'Attempts Allowed', value: quiz.allowed_attempts === -1 ? 'Unlimited' : quiz.allowed_attempts },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--cx-bg-surface-sunken)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--cx-border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontWeight: 700, color: 'var(--cx-text-primary)', marginTop: 4 }}>{value}</div>
              </div>
            ))}
          </div>
          {error && <p style={{ color: '#ef4444', marginBottom: 12, fontSize: '0.875rem' }}>{error}</p>}
          {quiz.locked_for_user ? (
            <p style={{ color: 'var(--cx-text-tertiary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8V6a4 4 0 018 0v2M5 8h10a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z"/></svg> This quiz is locked.
            </p>
          ) : !attemptsLeft ? (
            <div style={{ textAlign: 'center', color: 'var(--cx-text-tertiary)', fontStyle: 'italic', padding: '12px', border: '1px dashed var(--cx-border-subtle)', borderRadius: 8, background: 'var(--cx-bg-surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
               <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M13 7L7 13M7 7l6 6"/></svg> Attempt limit reached ({quiz.allowed_attempts} attempts allowed)
            </div>
          ) : (
            <button className="cx-btn cx-btn--primary" onClick={handleStart} disabled={starting}>
              {starting ? 'Starting…' : hasInProgress ? 'Resume Quiz' : existingSubmission ? 'Take Quiz Again' : 'Start Quiz'}
            </button>
          )}
        </div>
      </div>
    )
  }

  const q = questions[currentQ]
  const progress = Math.round(((currentQ + 1) / questions.length) * 100)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="cx-page cx-quiz-taker-detail">
      <div style={{ margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontWeight: 700, color: 'var(--cx-text-primary)', margin: 0 }}>{quiz.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {timeLeft !== null && timeLeft > 0 && (
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: timeLeft < 60 ? '#dc2626' : 'var(--cx-text-secondary)', background: timeLeft < 60 ? 'rgba(239,68,68,0.10)' : 'var(--cx-bg-surface-raised)', padding: '4px 10px', borderRadius: 6 }}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
          <span style={{ fontSize: '0.82rem', color: 'var(--cx-text-tertiary)' }}>
            Question {currentQ + 1} of {questions.length}
          </span>
        </div>
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
                        background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--cx-bg-surface-sunken)',
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
                        background: checked ? 'rgba(99,102,241,0.08)' : 'var(--cx-bg-surface-sunken)',
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
                  background: 'var(--cx-bg-surface-sunken)',
                  color: 'var(--cx-text-primary)',
                  boxShadow: 'none',
                  minHeight: q.question_type === 'essay_question' ? 180 : 80
                }}
              />
            )}

            {/* Matching Question */}
            {q.question_type === 'matching_question' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {q.matching_answer && q.matching_answer.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Items</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.matching_answer.map(pair => (
                          <div key={pair.id} style={{ padding: '12px 16px', background: 'var(--cx-bg-surface-sunken)', borderRadius: 8, border: '1px solid var(--cx-border-subtle)' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--cx-text-primary)' }}>{pair.left}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Matches</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.matching_answer.map(pair => {
                          const matchVal = (answers[q.id] as Record<string, string> | undefined)?.[String(pair.id)] ?? ''
                          return (
                            <select
                              key={pair.id}
                              value={matchVal}
                              onChange={e => {
                                const current = (answers[q.id] as Record<string, string> | undefined) ?? {}
                                handleAnswer(q.id, { ...current, [String(pair.id)]: e.target.value })
                              }}
                              style={{
                                padding: '12px 16px',
                                borderRadius: 8,
                                border: '1px solid var(--cx-border-subtle)',
                                background: 'var(--cx-bg-surface-sunken)',
                                color: 'var(--cx-text-primary)',
                                fontSize: '0.875rem',
                                width: '100%',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="">Select match…</option>
                              {q.matching_answer?.map(opt => (
                                <option key={opt.id} value={String(opt.id)}>{opt.right}</option>
                              ))}
                            </select>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Numerical Question */}
            {q.question_type === 'numerical_question' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="number"
                  step="any"
                  className="cx-search__input"
                  placeholder="Enter a number…"
                  value={(answers[q.id] as number | string | undefined) ?? ''}
                  onChange={e => {
                    const val = e.target.value
                    handleAnswer(q.id, val === '' ? '' : Number(val))
                  }}
                  style={{
                    width: '100%',
                    fontSize: '0.95rem',
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid var(--cx-border-subtle)',
                    background: 'var(--cx-bg-surface-sunken)',
                    color: 'var(--cx-text-primary)',
                  }}
                />
                {q.numerical_answer && q.numerical_answer.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>
                    Accepted answers may have a tolerance range.
                  </div>
                )}
              </div>
            )}

            {/* Calculated / Formula Question */}
            {q.question_type === 'calculated_question' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                  style={{
                    padding: '16px 20px',
                    background: 'var(--cx-bg-surface-sunken)',
                    borderRadius: 12,
                    border: '1px solid var(--cx-border-subtle)',
                    fontSize: '0.95rem',
                    color: 'var(--cx-text-primary)',
                    lineHeight: 1.6,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: substituteFormulaVariables(q.question_text, q.variables ?? []),
                  }}
                />
                {q.formulas && q.formulas.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>
                    Formula: {q.formulas[0]}
                  </div>
                )}
                <input
                  type="number"
                  step="any"
                  className="cx-search__input"
                  placeholder="Enter your calculated answer…"
                  value={(answers[q.id] as number | string | undefined) ?? ''}
                  onChange={e => {
                    const val = e.target.value
                    handleAnswer(q.id, val === '' ? '' : Number(val))
                  }}
                  style={{
                    width: '100%',
                    fontSize: '0.95rem',
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid var(--cx-border-subtle)',
                    background: 'var(--cx-bg-surface-sunken)',
                    color: 'var(--cx-text-primary)',
                  }}
                />
              </div>
            )}

            {/* File Upload Question */}
            {q.question_type === 'file_upload_question' && submission && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <QuizFileUpload
                  courseId={courseId}
                  quizId={quizId}
                  submissionId={submission.id}
                  onUpload={fileId => handleAnswer(q.id, fileId)}
                />
                {typeof answers[q.id] === 'number' && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--cx-color-success)' }}>
                    File uploaded successfully (ID: {String(answers[q.id])})
                  </div>
                )}
              </div>
            )}

            {/* Fill In Multiple Blanks Question */}
            {q.question_type === 'fill_in_multiple_blanks_question' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(() => {
                  const blankIds = parseBlankIds(q.question_text)
                  const parts = q.question_text.split(/\[([a-zA-Z0-9_]+)\]/g)
                  return (
                    <div style={{ fontSize: '0.95rem', color: 'var(--cx-text-primary)', lineHeight: 1.8 }}>
                      {parts.map((part, i) => {
                        if (i % 2 === 1) {
                          const blankId = part
                          const current = (answers[q.id] as Record<string, string> | undefined) ?? {}
                          return (
                            <input
                              key={`${blankId}-${i}`}
                              type="text"
                              value={current[blankId] ?? ''}
                              onChange={e => handleAnswer(q.id, { ...current, [blankId]: e.target.value })}
                              placeholder={`Blank: ${blankId}`}
                              style={{
                                display: 'inline-block',
                                width: 140,
                                padding: '6px 10px',
                                margin: '0 4px',
                                borderRadius: 8,
                                border: '1px solid var(--cx-border-subtle)',
                                background: 'var(--cx-bg-surface-sunken)',
                                color: 'var(--cx-text-primary)',
                                fontSize: '0.9rem',
                                verticalAlign: 'middle',
                              }}
                            />
                          )
                        }
                        return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />
                      })}
                    </div>
                  )
                })()}
              </div>
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
  </div>
  )
}

// ─── Quiz List ────────────────────────────────────────────────────────────────

export default function QuizzesPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const quizIdFromQuery = queryParams.get('quiz_id')

  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(() => {
    return quizIdFromQuery ? parseInt(quizIdFromQuery, 10) : null
  })
  const [selectedNewQuiz, setSelectedNewQuiz] = useState<Quiz | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newQuiz, setNewQuiz] = useState({ title: '', timeLimit: '', proctoring: false, maxAttempts: 1 })
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast } = useNotification()

  useEffect(() => {
    if (quizIdFromQuery) {
      const qid = parseInt(quizIdFromQuery, 10)
      if (!isNaN(qid)) {
        setSelectedQuizId(qid)
      }
    }
  }, [quizIdFromQuery])

  const handleExit = useCallback(() => {
    setSelectedQuizId(null)
    setSelectedNewQuiz(null)
    if (courseId) {
      navigate(`/courses/${courseId}/quizzes`, { replace: true })
    }
  }, [courseId, navigate])

  const { data: classicQuizzes, isLoading: classicLoading, refetch: refetchClassic } = useCanvasQuery<Quiz[]>(
    courseId ? `/api/v1/courses/${courseId}/quizzes` : '',
    { per_page: 50 } as any
  )

  // Fetch New Quizzes — they are assignments with submission_types = external_tool
  const { data: newQuizAssignments, isLoading: newQuizLoading } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/assignments?per_page=100` : '',
    undefined,
    {
      select: (data: any[]) =>
        data
          .filter((a: any) => a.is_quiz_assignment || a.submission_types?.includes('external_tool'))
          .map((a: any) => ({
            id: a.id,
            title: a.name,
            description: a.description,
            quiz_type: 'assignment' as const,
            time_limit: a.time_limit_minutes,
            allowed_attempts: a.allowed_attempts || 1,
            question_count: a.question_count || 0,
            points_possible: a.points_possible || 0,
            due_at: a.due_at,
            workflow_state: a.published ? 'published' : 'unpublished',
            locked_for_user: a.locked_for_user,
            is_new_quiz: true,
            assignment_id: a.id,
          })),
    } as any
  )

  const quizzes: Quiz[] | undefined =
    classicQuizzes || newQuizAssignments
      ? [
          ...(classicQuizzes || []),
          ...(newQuizAssignments || []).filter(
            (nq) => !(classicQuizzes || []).some((cq) => cq.id === nq.id)
          ),
        ]
      : undefined

  const isLoading = classicLoading || newQuizLoading

  const refetch = () => {
    refetchClassic()
  }

  if (selectedNewQuiz && courseId && selectedNewQuiz.assignment_id) {
    return (
      <NewQuizzesIframe
        courseId={courseId}
        assignmentId={selectedNewQuiz.assignment_id}
        mode={isTeacher ? 'build' : 'take'}
        onExit={handleExit}
      />
    )
  }

  if (selectedQuizId && courseId) {
    return (
      <QuizTaker
        courseId={courseId}
        quizId={selectedQuizId}
        onExit={handleExit}
      />
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Quizzes</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--cx-text-secondary)', margin: '4px 0 0' }}>Practice knowledge checks, graded quizzes, and surveys.</p>
        </div>
        {isTeacher && (
          <button className="cx-btn cx-btn--primary" onClick={() => setShowCreateModal(true)}>
            + Create Quiz
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="cx-skeleton" style={{ height: 80, borderRadius: 10 }} />)}
        </div>
      ) : !quizzes || quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ marginBottom: 12 }}><svg width="48" height="48" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="1.5" width="14" height="17" rx="2"/><path d="M7 6h6M7 10h6M7 14h4"/></svg></div>
          <p>No quizzes available for this course.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quizzes.map(quiz => (
            <li
              key={quiz.id}
              className="cx-quiz-card"
              style={{ cursor: quiz.locked_for_user ? 'not-allowed' : 'pointer', opacity: quiz.locked_for_user ? 0.6 : 1 }}
              onClick={() => {
                if (quiz.locked_for_user) return
                if (quiz.is_new_quiz) {
                  setSelectedNewQuiz(quiz)
                } else {
                  setSelectedQuizId(quiz.id)
                }
              }}
            >
              <div style={{ flexShrink: 0, color: 'var(--cx-text-secondary)' }}>
                {quiz.is_new_quiz ? (
                  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ) : quiz.quiz_type === 'practice_quiz' ? (
                  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 3H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"/><path d="M7 10h6M10 7v6"/></svg>
                ) : quiz.quiz_type === 'survey' ? (
                  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 18h16"/><rect x="4" y="10" width="3" height="8" rx="0.5"/><rect x="8.5" y="6" width="3" height="12" rx="0.5"/><rect x="13" y="3" width="3" height="15" rx="0.5"/></svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="1.5" width="14" height="17" rx="2"/><path d="M7 6h6M7 10h6M7 14h4"/></svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {quiz.title}
                  {quiz.is_new_quiz && (
                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 10, background: 'rgba(99,102,241,0.12)', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Quiz</span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                  {quiz.question_count} questions · {quiz.points_possible} pts
                  {quiz.time_limit ? ` · ${quiz.time_limit} min` : ''}
                  {quiz.due_at ? ` · Due ${new Date(quiz.due_at).toLocaleDateString()}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {isTeacher && !quiz.is_new_quiz && (
                  <Link
                    to={`/courses/${courseId}/quizzes/${quiz.id}/builder`}
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    onClick={e => e.stopPropagation()}
                    style={{ textDecoration: 'none' }}
                  >
                    Build
                  </Link>
                )}
                {quiz.workflow_state === 'published' ? (
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#059669', fontWeight: 600 }}>Published</span>
                ) : (
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', color: '#d97706', fontWeight: 600 }}>Draft</span>
                )}
                {quiz.locked_for_user && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--cx-text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V6a3 3 0 016 0v3"/></svg> Locked</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showCreateModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Create Quiz</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>Quiz Title</label>
                  <input type="text" className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} placeholder="e.g. Midterm Exam" />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>Time Limit (Minutes)</label>
                    <input type="number" className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} value={newQuiz.timeLimit} onChange={e => setNewQuiz({...newQuiz, timeLimit: e.target.value})} placeholder="Optional" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>Max Attempts</label>
                    <input type="number" className="cx-search__input" style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} value={newQuiz.maxAttempts} onChange={e => setNewQuiz({...newQuiz, maxAttempts: Number(e.target.value)})} min="1" />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Advanced Settings</h3>
                  <label className="cx-toggle">
                    <input type="checkbox" checked={newQuiz.proctoring} onChange={e => setNewQuiz({...newQuiz, proctoring: e.target.checked})} />
                    <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    <span className="cx-toggle__label" style={{ fontSize: '0.875rem' }}>Require Respondus LockDown Browser / Proctoring Hooks</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" disabled={creatingQuiz || !newQuiz.title.trim()} onClick={async () => {
                if (!courseId || !newQuiz.title.trim()) return
                setCreatingQuiz(true)
                try {
                  const createdQuiz: any = await canvasFetch(`/api/v1/courses/${courseId}/quizzes`, {
                    method: 'POST',
                    body: {
                      quiz: {
                        title: newQuiz.title.trim(),
                        quiz_type: 'assignment',
                        time_limit: newQuiz.timeLimit ? Number(newQuiz.timeLimit) : undefined,
                        allowed_attempts: Number(newQuiz.maxAttempts) || 1,
                      }
                    }
                  })
                  // Persist proctoring preference as custom_data since Canvas has no native proctoring field
                  if (newQuiz.proctoring && createdQuiz?.id) {
                    try {
                      await canvasFetch(`/api/v1/courses/${courseId}/quizzes/${createdQuiz.id}/custom_data/classapex_proctoring`, {
                        method: 'PUT',
                        body: { data: { enabled: true, type: 'respondus_lockdown' } }
                      })
                    } catch (e) { /* custom_data may not be available; non-fatal */ }
                  }
                  showToast({ title: 'Quiz Created', message: `"${newQuiz.title.trim()}" has been created.`, type: 'success' })
                  setNewQuiz({ title: '', timeLimit: '', proctoring: false, maxAttempts: 1 })
                  setShowCreateModal(false)
                  refetch()
                } catch (err: any) {
                  showToast({ title: 'Create Failed', message: err.message || 'Could not create quiz.', type: 'error' })
                } finally {
                  setCreatingQuiz(false)
                }
              }}>
                {creatingQuiz ? 'Creating…' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
