import React, { useState, useRef } from 'react'
import { MediaLibrary } from './MediaLibrary'

interface ReplyEditorProps {
  placeholder?: string
  onSubmit: (text: string) => void
  onCancel?: () => void
  submitLabel?: string
  initialValue?: string
  courseId?: string | number
}

export default function ReplyEditor({
  placeholder = 'Write a reply...',
  onSubmit,
  onCancel,
  submitLabel = 'Post Reply',
  initialValue = '',
  courseId,
}: ReplyEditorProps) {
  const [text, setText] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertTextAtCursor = (insertedText: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = text.slice(0, start)
    const after = text.slice(end)
    setText(`${before}${insertedText}${after}`)
    setTimeout(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + insertedText.length
    }, 0)
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit(text.trim())
      setText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSelectMedia = (url: string, type: 'video' | 'audio' | 'image', title: string) => {
    let tag = ''
    if (type === 'video') {
      tag = `<p><video src="${url}" controls style="max-width: 100%; width: 100%; border-radius: 8px; box-shadow: var(--cx-shadow-sm);"></video></p>`
    } else if (type === 'audio') {
      tag = `<p><audio src="${url}" controls style="max-width: 100%; width: 100%;"></audio></p>`
    } else if (type === 'image') {
      tag = `<p><img src="${url}" alt="${title}" style="max-width: 100%; border-radius: 8px; box-shadow: var(--cx-shadow-sm);" /></p>`
    }
    insertTextAtCursor(tag)
    setShowPicker(false)
  }

  const handleInsertMediaUrl = () => {
    const url = prompt('Enter Media URL (video, audio, or image):', 'https://')
    if (!url) return
    const lowerUrl = url.toLowerCase()
    let tag = ''
    if (lowerUrl.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/)) {
      tag = `<p><video src="${url}" controls style="max-width: 100%; width: 100%; border-radius: 8px; box-shadow: var(--cx-shadow-sm);"></video></p>`
    } else if (lowerUrl.match(/\.(mp3|wav|ogg|aac|m4a|flac)$/)) {
      tag = `<p><audio src="${url}" controls style="max-width: 100%; width: 100%;"></p>`
    } else if (lowerUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      tag = `<p><img src="${url}" style="max-width: 100%; border-radius: 8px; box-shadow: var(--cx-shadow-sm);" /></p>`
    } else {
      tag = `[Link](${url})`
    }
    insertTextAtCursor(tag)
  }

  return (
    <div className="cx-reply-editor" role="form" aria-label="Reply editor" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="cx-reply-editor__toolbar" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={() => {
            const ta = textareaRef.current
            if (!ta) return
            const start = ta.selectionStart
            const end = ta.selectionEnd
            const before = text.slice(0, start)
            const after = text.slice(end)
            setText(`${before}**${text.slice(start, end) || 'bold'}**${after}`)
          }}
          aria-label="Bold"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={() => {
            const ta = textareaRef.current
            if (!ta) return
            const start = ta.selectionStart
            const end = ta.selectionEnd
            const before = text.slice(0, start)
            const after = text.slice(end)
            setText(`${before}_${text.slice(start, end) || 'italic'}_${after}`)
          }}
          aria-label="Italic"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={() => {
            const ta = textareaRef.current
            if (!ta) return
            const start = ta.selectionStart
            const end = ta.selectionEnd
            const before = text.slice(0, start)
            const after = text.slice(end)
            setText(`${before}\`${text.slice(start, end) || 'code'}\`${after}`)
          }}
          aria-label="Inline code"
          title="Inline code"
        >
          <code>&lt;/&gt;</code>
        </button>
        
        <div style={{ width: 1, background: 'var(--cx-border-subtle, rgba(255,255,255,0.1))', height: 16, margin: '0 4px' }} />

        <button
          type="button"
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={() => {
            const ta = textareaRef.current
            if (!ta) return
            const start = ta.selectionStart
            const end = ta.selectionEnd
            const before = text.slice(0, start)
            const after = text.slice(end)
            const selected = text.slice(start, end) || 'link text'
            setText(`${before}[${selected}](url)${after}`)
          }}
          aria-label="Insert link"
          title="Insert link"
        >
          🔗 Link
        </button>

        <button
          type="button"
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={handleInsertMediaUrl}
          aria-label="Insert Media URL"
          title="Insert Media URL"
        >
          🌐 Media URL
        </button>

        {courseId && (
          <button
            type="button"
            className="cx-btn cx-btn--ghost cx-btn--sm"
            onClick={() => setShowPicker(true)}
            aria-label="Insert Course Media"
            title="Insert Course Media"
          >
            🎥 Course Media
          </button>
        )}
      </div>

      <textarea
        ref={textareaRef}
        className="cx-input cx-input--textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={4}
        aria-label="Reply content"
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 8,
          border: '1px solid var(--cx-border-subtle, rgba(255,255,255,0.1))',
          background: 'var(--cx-bg-surface, rgba(0,0,0,0.1))',
          color: 'var(--cx-text-primary, #fff)',
          fontSize: '0.875rem',
          outline: 'none',
          resize: 'vertical'
        }}
      />

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary, #64748b)' }}>
          {text.length} characters
        </span>
        <div style={{ flex: 1 }} />
        {onCancel && (
          <button
            type="button"
            className="cx-btn cx-btn--secondary cx-btn--sm"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none' }}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          className="cx-btn cx-btn--primary cx-btn--sm"
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : submitLabel}
        </button>
      </div>

      {/* Media Picker Modal */}
      {showPicker && courseId && (
        <div 
          className="cx-modal-overlay" 
          onClick={() => setShowPicker(false)}
          style={{ zIndex: 1100 }}
        >
          <div 
            className="cx-modal cx-modal--lg" 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(30, 41, 59, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
              borderRadius: 16,
              width: '90%',
              maxWidth: 800,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
              overflow: 'hidden'
            }}
          >
            <div className="cx-modal__header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', flexShrink: 0 }}>
              <h2 className="cx-modal__title" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                Select Course Instructional Media
              </h2>
              <button 
                className="cx-btn cx-btn--ghost" 
                onClick={() => setShowPicker(false)}
                style={{ color: '#fff', opacity: 0.8 }}
              >
                &times;
              </button>
            </div>
            <div className="cx-modal__body" style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              <MediaLibrary courseId={courseId} isSelectMode={true} onSelectMedia={handleSelectMedia} />
            </div>
            <div style={{ display: 'flex', padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button 
                className="cx-btn cx-btn--secondary cx-btn--sm" 
                onClick={() => setShowPicker(false)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
