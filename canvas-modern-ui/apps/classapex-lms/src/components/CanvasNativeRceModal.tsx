/**
 * CanvasNativeRceModal
 * ====================
 * Opens Canvas's native Rich Content Editor in a full-screen iframe modal.
 * This unlocks the full Instructure New RCE (equation editor, tables,
 * media embed, Studio integration, content linking, accessibility checker,
 * etc.) by leveraging Canvas's existing edit pages.
 *
 * Usage:
 *   <CanvasNativeRceModal
 *     courseId="123"
 *     contentType="page"
 *     contentId={456}
 *     isOpen={isOpen}
 *     onClose={() => setIsOpen(false)}
 *   />
 *
 * Supported contentType values:
 *   'page' | 'assignment' | 'discussion' | 'announcement' | 'quiz'
 */

import React, { useEffect, useRef, useState } from 'react'

export type CanvasContentType =
  | 'page'
  | 'assignment'
  | 'discussion'
  | 'announcement'
  | 'quiz'

interface CanvasNativeRceModalProps {
  courseId: string
  contentType: CanvasContentType
  contentId: number | string
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
  /** Optional page URL (for wiki pages) */
  pageUrl?: string
}

function buildCanvasEditUrl(
  courseId: string,
  contentType: CanvasContentType,
  contentId: number | string,
  pageUrl?: string
): string {
  const base = '' // Relative to current origin (same domain via proxy)
  switch (contentType) {
    case 'page':
      return `${base}/courses/${courseId}/pages/${pageUrl || contentId}/edit`
    case 'assignment':
      return `${base}/courses/${courseId}/assignments/${contentId}/edit`
    case 'discussion':
      return `${base}/courses/${courseId}/discussion_topics/${contentId}/edit`
    case 'announcement':
      return `${base}/courses/${courseId}/discussion_topics/${contentId}/edit`
    case 'quiz':
      return `${base}/courses/${courseId}/quizzes/${contentId}/edit`
    default:
      return `${base}/courses/${courseId}/pages/${contentId}/edit`
  }
}

export default function CanvasNativeRceModal({
  courseId,
  contentType,
  contentId,
  isOpen,
  onClose,
  onSave,
  pageUrl,
}: CanvasNativeRceModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const src = buildCanvasEditUrl(courseId, contentType, contentId, pageUrl)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setHasError(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Listen for iframe load to hide spinner
  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (!isOpen) return null

  return (
    <div
      className="cx-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--cx-bg-surface, #fff)',
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
              textTransform: 'capitalize',
            }}
          >
            {contentType.replace('_', ' ')} Editor
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
            Canvas RCE
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {onSave && (
            <button
              className="cx-btn cx-btn--primary cx-btn--sm"
              onClick={onSave}
              title="Trigger save (if supported by Canvas page)"
            >
              Save
            </button>
          )}
          <button
            className="cx-btn cx-btn--ghost cx-btn--sm"
            onClick={onClose}
            title="Close editor"
          >
            Close
          </button>
        </div>
      </div>

      {/* Iframe container */}
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
              Loading Canvas Editor…
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
              gap: 12,
              background: 'var(--cx-bg-surface)',
              zIndex: 2,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <circle cx="10" cy="10" r="8" />
              <path d="M7 7l6 6M13 7l-6 6" />
            </svg>
            <span style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>
              Failed to load Canvas editor.
            </span>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="cx-btn cx-btn--secondary cx-btn--sm"
            >
              Open in Canvas Tab
            </a>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={src}
          title={`Canvas ${contentType} editor`}
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
