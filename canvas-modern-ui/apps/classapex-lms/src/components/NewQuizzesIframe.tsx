/**
 * NewQuizzesIframe
 * ================
 * Embeds the Canvas New Quizzes experience via iframe.
 * New Quizzes are LTI-based assignments that require Canvas's native
 * launch/build/taking routes. This component routes to the correct
 * Canvas URL based on the user's role and action.
 *
 * Canvas routes (from config/routes.rb):
 *   GET /courses/:course_id/new_quizzes/launch
 *   GET /courses/:course_id/new_quizzes/build
 *   GET /courses/:course_id/new_quizzes/taking
 *   GET /courses/:course_id/new_quizzes/moderation
 *
 * Usage:
 *   <NewQuizzesIframe
 *     courseId="123"
 *     assignmentId={456}
 *     mode="take"   // 'take' | 'build' | 'moderate'
 *     onExit={() => navigate('/courses/123/quizzes')}
 *   />
 */

import React, { useEffect, useRef, useState } from 'react'
import LogoLoader from './LogoLoader'

export type NewQuizzesMode = 'take' | 'build' | 'moderate'

interface NewQuizzesIframeProps {
  courseId: string
  assignmentId: number
  mode: NewQuizzesMode
  onExit: () => void
}

function buildNewQuizzesUrl(
  courseId: string,
  assignmentId: number,
  mode: NewQuizzesMode
): string {
  const base = `/courses/${courseId}/new_quizzes`
  switch (mode) {
    case 'build':
      return `${base}/build?assignment_id=${assignmentId}`
    case 'moderate':
      return `${base}/moderation?assignment_id=${assignmentId}`
    case 'take':
    default:
      return `${base}/taking?assignment_id=${assignmentId}`
  }
}

export default function NewQuizzesIframe({
  courseId,
  assignmentId,
  mode,
  onExit,
}: NewQuizzesIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const src = buildNewQuizzesUrl(courseId, assignmentId, mode)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--cx-bg-surface, #fff)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--cx-bg-surface)',
          borderBottom: '1px solid var(--cx-border-subtle)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--cx-text-primary)',
            }}
          >
            New Quiz
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--cx-text-tertiary)',
              background: 'var(--cx-bg-surface-sunken)',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {mode === 'take' ? 'Taking' : mode === 'build' ? 'Building' : 'Moderation'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="cx-btn cx-btn--ghost cx-btn--sm"
            style={{ textDecoration: 'none' }}
          >
            Open in Canvas
          </a>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onExit}>
            Exit
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: 'var(--cx-bg-surface)',
              zIndex: 2,
            }}
          >
            <LogoLoader text="Loading New Quiz…" />
          </div>
        )}

        {hasError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              background: 'var(--cx-bg-surface)',
              zIndex: 2,
              padding: 24,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <circle cx="10" cy="10" r="8" />
              <path d="M7 7l6 6M13 7l-6 6" />
            </svg>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
              New Quizzes could not load
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', textAlign: 'center', maxWidth: 480 }}>
              This quiz uses Canvas New Quizzes, which requires the native Canvas interface.
              Please open it in a new tab or return to the quiz list.
            </span>
            <div style={{ display: 'flex', gap: 12 }}>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="cx-btn cx-btn--primary cx-btn--sm"
                style={{ textDecoration: 'none' }}
              >
                Open in Canvas Tab
              </a>
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onExit}>
                Back to Quizzes
              </button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={src}
          title="New Quiz"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'var(--cx-bg-surface)',
          }}
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
        />
      </div>
    </div>
  )
}
