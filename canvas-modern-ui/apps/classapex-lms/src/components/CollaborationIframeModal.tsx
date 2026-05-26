/**
 * CollaborationIframeModal
 * ========================
 * Full-screen iframe wrapper for Canvas's native LTI Collaborations page.
 * Opens /courses/:courseId/lti_collaborations so teachers can create
 * Google Docs / Office 365 collaborations using Canvas's built-in LTI flow.
 *
 * Usage:
 *   <CollaborationIframeModal
 *     courseId="123"
 *     onClose={() => setIsOpen(false)}
 *   />
 */

import React, { useEffect, useRef, useState } from 'react'

interface CollaborationIframeModalProps {
  courseId: string
  onClose: () => void
}

export default function CollaborationIframeModal({
  courseId,
  onClose,
}: CollaborationIframeModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const src = `/courses/${courseId}/lti_collaborations`

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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 17v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 002 15.5V17"/>
            <circle cx="7.5" cy="6" r="3.5"/>
            <path d="M18 17v-1.5a3.5 3.5 0 00-2.5-3.4"/>
            <circle cx="14" cy="6" r="3.5"/>
          </svg>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--cx-text-primary)',
            }}
          >
            Collaborations
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
            Canvas LTI
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
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onClose}>
            Close
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
            <div className="cx-loading__spinner" />
            <span style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>
              Loading Canvas Collaborations…
            </span>
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
              Collaborations could not load
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', textAlign: 'center', maxWidth: 480 }}>
              Canvas Collaborations requires the native Canvas interface.
              Please open it in a new tab or return to the course.
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
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onClose}>
                Back to List
              </button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={src}
          title="Canvas Collaborations"
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
