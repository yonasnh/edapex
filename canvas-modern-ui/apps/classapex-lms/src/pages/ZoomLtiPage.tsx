/**
 * ZoomLtiPage — ClassApex LMS
 * =============================
 * Dedicated Zoom LTI launcher for courses.
 *
 * Canvas REST API:
 *   GET /api/v1/courses/:courseId/external_tools
 *   GET /api/v1/courses/:courseId/external_tools/sessionless_launch
 *
 * Detects if Zoom is installed as an LTI tool and launches it
 * via iframe. Falls back to helpful instructions if Zoom is not
 * configured in the course.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'

interface ExternalTool {
  id: number
  name: string
  url: string
}

export default function ZoomLtiPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [launchUrl, setLaunchUrl] = useState<string | null>(null)
  const [loadingLaunch, setLoadingLaunch] = useState(false)
  const [launchError, setLaunchError] = useState<string | null>(null)

  const { data: tools, isLoading } = useCanvasQuery<ExternalTool[]>(
    courseId ? `/api/v1/courses/${courseId}/external_tools` : ''
  )

  // Find Zoom-like tool by name
  const zoomTool = React.useMemo(() => {
    if (!Array.isArray(tools)) return null
    return tools.find(t => /zoom/i.test(t.name))
  }, [tools])

  useEffect(() => {
    if (!zoomTool || !courseId) return
    setLoadingLaunch(true)
    setLaunchError(null)
    canvasFetch(
      `/api/v1/courses/${courseId}/external_tools/sessionless_launch?` +
        new URLSearchParams({
          id: String(zoomTool.id),
          launch_type: 'course_navigation',
        }).toString()
    )
      .then((res: any) => {
        setLaunchUrl(res.url || null)
      })
      .catch((err: any) => {
        setLaunchError(err?.message || 'Could not prepare Zoom launch')
      })
      .finally(() => {
        setLoadingLaunch(false)
      })
  }, [zoomTool, courseId])

  if (isLoading || loadingLaunch) {
    return (
      <div className="cx-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '64px 0' }}>
        <div className="cx-loading__spinner" />
        <span style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>
          {isLoading ? 'Checking for Zoom…' : 'Preparing Zoom launch…'}
        </span>
      </div>
    )
  }

  if (!zoomTool) {
    return (
      <div className="cx-page">
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="5" width="16" height="10" rx="2" />
              <path d="M7 5V3a3 3 0 016 0v2" />
              <circle cx="10" cy="10" r="2" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 8px', color: 'var(--cx-text-primary)' }}>Zoom is not configured</h3>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
            This course does not have the Zoom LTI tool installed.
            Please ask your Canvas administrator to add Zoom to this course,
            or use the native Canvas interface to schedule meetings.
          </p>
        </div>
      </div>
    )
  }

  if (launchError || !launchUrl) {
    return (
      <div className="cx-page">
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <circle cx="10" cy="10" r="8" />
              <path d="M7 7l6 6M13 7l-6 6" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 8px', color: 'var(--cx-text-primary)' }}>Could not launch Zoom</h3>
          <p>{launchError || 'No launch URL returned from Canvas'}</p>
          <a
            href={`/courses/${courseId}/external_tools`}
            className="cx-btn cx-btn--primary cx-btn--sm"
            style={{ textDecoration: 'none', marginTop: 16 }}
          >
            Manage External Tools
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', flexDirection: 'column', background: 'var(--cx-bg-surface, #fff)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--cx-bg-surface)', borderBottom: '1px solid var(--cx-border-subtle)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="5" width="16" height="10" rx="2" />
            <path d="M7 5V3a3 3 0 016 0v2" />
            <circle cx="10" cy="10" r="2" />
          </svg>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Zoom</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', background: 'var(--cx-bg-surface-sunken)', padding: '2px 8px', borderRadius: 4 }}>LTI</span>
        </div>
        <a href={launchUrl} target="_blank" rel="noopener noreferrer" className="cx-btn cx-btn--ghost cx-btn--sm" style={{ textDecoration: 'none' }}>
          Open in New Tab
        </a>
      </div>

      {/* Iframe */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <iframe
          src={launchUrl}
          title="Zoom LTI"
          style={{ width: '100%', height: '100%', border: 'none', background: 'var(--cx-bg-surface)' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
        />
      </div>
    </div>
  )
}
