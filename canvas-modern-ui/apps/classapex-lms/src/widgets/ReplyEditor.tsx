import React, { useState, useRef } from 'react'

interface ReplyEditorProps {
  placeholder?: string
  onSubmit: (text: string) => void
  onCancel?: () => void
  submitLabel?: string
  initialValue?: string
}

export default function ReplyEditor({ placeholder = 'Write a reply...', onSubmit, onCancel, submitLabel = 'Post Reply', initialValue = '' }: ReplyEditorProps) {
  const [text, setText] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  return (
    <div className="cx-reply-editor" role="form" aria-label="Reply editor">
      <div className="cx-reply-editor__toolbar" style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={() => {
            const ta = textareaRef.current
            if (!ta) return
            const start = ta.selectionStart, end = ta.selectionEnd
            const before = text.slice(0, start), after = text.slice(end)
            setText(`${before}**${text.slice(start, end) || 'bold'}**${after}`)
          }}
          aria-label="Bold"
          title="Bold"
        ><strong>B</strong></button>
        <button
          type="button"
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={() => {
            const ta = textareaRef.current
            if (!ta) return
            const start = ta.selectionStart, end = ta.selectionEnd
            const before = text.slice(0, start), after = text.slice(end)
            setText(`${before}_${text.slice(start, end) || 'italic'}_${after}`)
          }}
          aria-label="Italic"
          title="Italic"
        ><em>I</em></button>
        <button
          type="button"
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={() => {
            const ta = textareaRef.current
            if (!ta) return
            const start = ta.selectionStart, end = ta.selectionEnd
            const before = text.slice(0, start), after = text.slice(end)
            setText(`${before}\`${text.slice(start, end) || 'code'}\`${after}`)
          }}
          aria-label="Inline code"
          title="Inline code"
        ><code>&lt;/&gt;</code></button>
        <button
          type="button"
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={() => {
            const ta = textareaRef.current
            if (!ta) return
            const start = ta.selectionStart, end = ta.selectionEnd
            const before = text.slice(0, start), after = text.slice(end)
            const selected = text.slice(start, end) || 'link text'
            setText(`${before}[${selected}](url)${after}`)
          }}
          aria-label="Insert link"
          title="Insert link"
        >🔗</button>
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
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', alignSelf: 'center' }}>
          {text.length} characters
        </span>
        <div style={{ flex: 1 }} />
        {onCancel && (
          <button type="button" className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onCancel} disabled={isSubmitting}>
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
    </div>
  )
}
