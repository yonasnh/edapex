import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

const TYPE_ICONS: Record<string, string> = {
  Page: 'file-text',
  Assignment: 'pencil',
  Quiz: 'help-circle',
  Discussion: 'message-square',
  File: 'file',
  ExternalUrl: 'external-link',
  SubHeader: 'type',
}

const TYPE_LABELS: Record<string, string> = {
  Page: 'Page',
  Assignment: 'Assignment',
  Quiz: 'Quiz',
  Discussion: 'Discussion',
  File: 'File',
  ExternalUrl: 'External Link',
  SubHeader: 'Sub Header',
}

interface CompletionRequirement {
  type: 'must_view' | 'must_submit' | 'must_contribute' | 'must_mark_done' | 'min_score'
  min_score?: number
  completed?: boolean
}

export interface ModuleItemData {
  id: number
  title: string
  type: string
  content_id?: number | null
  url?: string
  external_url?: string
  completion_requirement?: CompletionRequirement | null
  indent?: number
}

interface ModuleItemProps {
  item: ModuleItemData
  courseId?: string
  moduleId?: number
}

export function ModuleItem({ item, courseId, moduleId }: ModuleItemProps) {
  const [completed, setCompleted] = useState(item.completion_requirement?.completed ?? false)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const isSubHeader = item.type === 'SubHeader'
  const isExternal = item.type === 'ExternalUrl'
  const href = isExternal && item.external_url ? item.external_url : item.url || '#'
  const reqType = item.completion_requirement?.type

  const handleToggleComplete = useCallback(async (e: React.MouseEvent) => {
    if (reqType === 'must_view' || reqType === 'must_mark_done') {
      e.preventDefault()
      e.stopPropagation()
      const nextState = !completed
      setCompleted(nextState)

      if (courseId && moduleId) {
        try {
          const token = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? ''
          const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-Token': decodeURIComponent(token),
          }

          if (reqType === 'must_mark_done') {
            await fetch(`/api/v1/courses/${courseId}/modules/${moduleId}/items/${item.id}/done`, {
              method: nextState ? 'PUT' : 'DELETE',
              headers,
              credentials: 'include'
            })
          } else if (reqType === 'must_view' && nextState) {
            await fetch(`/api/v1/courses/${courseId}/modules/${moduleId}/items/${item.id}/mark_read`, {
              method: 'POST',
              headers,
              credentials: 'include'
            })
          }
        } catch (err) {
          console.error('Failed to update completion status', err)
          setCompleted(!nextState)
        }
      }
    }
  }, [reqType, completed, courseId, moduleId, item.id])

  const isMedia = useCallback(() => {
    const titleLower = (item.title || '').toLowerCase()
    const urlLower = (href || '').toLowerCase()
    
    const matchesExtension = (str: string) => 
      str.match(/\.(mp4|webm|ogg|mov|m4v|avi|mp3|wav|aac|m4a|png|jpg|jpeg|gif|webp|svg)$/)
    
    const matchesVideoService = (str: string) =>
      str.includes('youtube.com') || str.includes('youtu.be') || str.includes('vimeo.com')

    return matchesExtension(titleLower) || matchesExtension(urlLower) || matchesVideoService(urlLower)
  }, [item.title, href])

  const getMediaType = useCallback((): 'video' | 'audio' | 'image' | 'unknown' => {
    const titleLower = (item.title || '').toLowerCase()
    const urlLower = (href || '').toLowerCase()
    
    if (titleLower.match(/\.(mp4|webm|mov|m4v|avi)$/) || urlLower.match(/\.(mp4|webm|mov|m4v|avi)$/) || urlLower.includes('youtube.com') || urlLower.includes('youtu.be') || urlLower.includes('vimeo.com')) {
      return 'video'
    }
    if (titleLower.match(/\.(mp3|wav|ogg|aac|m4a|flac)$/) || urlLower.match(/\.(mp3|wav|ogg|aac|m4a|flac)$/)) {
      return 'audio'
    }
    if (titleLower.match(/\.(png|jpg|jpeg|gif|webp|svg)$/) || urlLower.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      return 'image'
    }
    return 'unknown'
  }, [item.title, href])

  const getEmbedUrl = useCallback((url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`
      }
    } else if (url.includes('vimeo.com')) {
      const regExp = /vimeo\.com\/(\d+)/
      const match = url.match(regExp)
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}`
      }
    }
    return null
  }, [])

  const handleMediaClick = useCallback((e: React.MouseEvent) => {
    if (isMedia()) {
      e.preventDefault()
      setShowMediaModal(true)
      
      // Auto-complete must_view requirements upon opening media player
      if (reqType === 'must_view' && !completed) {
        handleToggleComplete(e)
      }
    }
  }, [isMedia, reqType, completed, handleToggleComplete])

  if (isSubHeader) {
    return (
      <div className="cx-module-subheader">
        <span className="cx-module-subheader__text">{item.title}</span>
      </div>
    )
  }

  let toUrl = ''
  if (!isExternal && courseId) {
    if (item.type === 'Assignment' && item.content_id) {
      toUrl = `/courses/${courseId}/assignments/${item.content_id}`
    } else if (item.type === 'Quiz' && item.content_id) {
      toUrl = `/courses/${courseId}/quizzes?quiz_id=${item.content_id}`
    } else if (item.type === 'Page') {
      toUrl = `/courses/${courseId}/pages`
    } else if (item.type === 'Discussion' && item.content_id) {
      toUrl = `/discussions`
    }
  }

  const content = (
    <>
      <span
        className={`cx-module-item__icon ${completed ? 'cx-module-item__icon--done' : ''}`}
        title={completed ? 'Marked complete' : 'Mark as complete'}
        onClick={handleToggleComplete}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleToggleComplete(e as any) }}
      >
        {completed ? '\u2713' : '\u25CB'}
      </span>
      <span className="cx-module-item__title">{item.title}</span>
      <span className="cx-module-item__type-badge">{TYPE_LABELS[item.type] || item.type}</span>
      {reqType && (
        <span className="cx-module-item__req" title={`Requirement: ${reqType.replace(/_/g, ' ')}`}>
          {reqType === 'must_submit' ? 'Submit' : reqType === 'must_view' ? 'View' : reqType === 'must_contribute' ? 'Contribute' : reqType === 'min_score' ? `Score: ${item.completion_requirement?.min_score}` : 'Mark done'}
        </span>
      )}
    </>
  )

  if (toUrl) {
    return (
      <Link
        to={toUrl}
        className={`cx-module-item ${completed ? 'cx-module-item--completed' : ''}`}
      >
        {content}
      </Link>
    )
  }

  return (
    <>
      <a
        href={href}
        className={`cx-module-item ${completed ? 'cx-module-item--completed' : ''}`}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={handleMediaClick}
      >
        {content}
      </a>

      {showMediaModal && (
        <div 
          className="cx-modal-overlay" 
          onClick={() => setShowMediaModal(false)}
          style={{ zIndex: 1000 }}
        >
          <div 
            className="cx-modal cx-modal--md" 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(30, 41, 59, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
              borderRadius: 16,
              overflow: 'hidden',
              width: '90%',
              maxWidth: 680
            }}
          >
            <div className="cx-modal__header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px' }}>
              <h2 className="cx-modal__title" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                {item.title}
              </h2>
              <button 
                className="cx-btn cx-btn--ghost" 
                onClick={() => setShowMediaModal(false)}
                style={{ color: '#fff', opacity: 0.8 }}
              >
                &times;
              </button>
            </div>
            
            <div className="cx-modal__body" style={{ padding: 0, background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {getMediaType() === 'video' && (
                getEmbedUrl(href) ? (
                  <iframe
                    src={getEmbedUrl(href)!}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '380px', display: 'block' }}
                  />
                ) : (
                  <video 
                    src={href} 
                    controls 
                    autoPlay 
                    style={{ width: '100%', maxHeight: '420px', display: 'block' }}
                  />
                )
              )}

              {getMediaType() === 'audio' && (
                <div style={{ width: '100%', padding: '40px 24px', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: '3rem' }}>🎵</div>
                  <audio 
                    src={href} 
                    controls 
                    autoPlay 
                    style={{ width: '100%', maxWidth: 460 }}
                  />
                </div>
              )}

              {getMediaType() === 'image' && (
                <div style={{ width: '100%', maxHeight: '480px', overflowY: 'auto', display: 'flex', justifyContent: 'center', background: '#020617' }}>
                  <img 
                    src={href} 
                    alt={item.title} 
                    style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'flex-end', gap: 8 }}>
              <button 
                className="cx-btn cx-btn--secondary cx-btn--sm" 
                onClick={() => setShowMediaModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
