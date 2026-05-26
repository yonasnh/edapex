/**
 * RichEditor — Lightweight WYSIWYG HTML Editor (S18)
 * ====================================================
 * Uses contentEditable + document.execCommand for basic formatting.
 * Toolbar: Bold, Italic, Underline, Link, Lists, Headings, Clear.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'

export interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  disabled?: boolean
}

const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'A', 'UL', 'OL', 'LI', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'DIV', 'SPAN'])
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(['href', 'target']),
}

function sanitizeHtml(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  function walk(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toUpperCase()
      if (!ALLOWED_TAGS.has(tag)) {
        // Replace unknown tag with its children
        const parent = el.parentNode
        if (parent) {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el)
          }
          parent.removeChild(el)
        }
        return
      }
      // Strip disallowed attributes
      const allowed = ALLOWED_ATTRS[tag]
      for (let i = el.attributes.length - 1; i >= 0; i--) {
        const attr = el.attributes[i]
        if (!allowed || !allowed.has(attr.name.toLowerCase())) {
          el.removeAttribute(attr.name)
        }
      }
      // Recurse
      Array.from(el.childNodes).forEach(walk)
    }
  }

  Array.from(doc.body.childNodes).forEach(walk)
  return doc.body.innerHTML
}

function exec(cmd: string, val?: string) {
  document.execCommand(cmd, false, val)
}

function ToolbarButton({ label, title, onClick, active }: { label: string; title: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        padding: '4px 8px',
        borderRadius: 4,
        border: '1px solid var(--cx-border-subtle)',
        background: active ? 'var(--cx-color-primary)' : 'var(--cx-bg-surface)',
        color: active ? '#fff' : 'var(--cx-text-secondary)',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 600,
        lineHeight: 1,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--cx-bg-surface-raised)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'var(--cx-bg-surface)' }}
    >
      {label}
    </button>
  )
}

const RichEditor = React.forwardRef<HTMLDivElement, Props>(function RichEditor({ value, onChange, placeholder, minHeight = 140, disabled }, ref) {
  const editorRef = useRef<HTMLDivElement | null>(null)

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    editorRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }, [ref])
  const [isEmpty, setIsEmpty] = useState(!value || value === '<p><br></p>' || value === '<br>')
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())

  const updateEmptyState = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    const text = el.innerText?.trim() || ''
    setIsEmpty(text === '')
  }, [])

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>()
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul')
    if (document.queryCommandState('insertOrderedList')) formats.add('ol')
    setActiveFormats(formats)
  }, [])

  const handleInput = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    updateEmptyState()
    const sanitized = sanitizeHtml(el.innerHTML)
    onChange(sanitized)
  }, [onChange, updateEmptyState])

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== value) {
      el.innerHTML = value || '<p><br></p>'
    }
    updateEmptyState()
  }, [value, updateEmptyState])

  const handleSelectionChange = useCallback(() => {
    updateActiveFormats()
  }, [updateActiveFormats])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [handleSelectionChange])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Let default behavior create <p> or <div>
      // Ensure we don't create <div> when inside lists
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const node = selection.getRangeAt(0).commonAncestorContainer
        const parentLi = node.nodeType === Node.TEXT_NODE
          ? node.parentElement?.closest('LI')
          : (node as Element).closest?.('LI')
        if (!parentLi) {
          // Ensure paragraphs instead of divs
          document.execCommand('defaultParagraphSeparator', false, 'p')
        }
      }
    }
  }

  const promptLink = () => {
    const url = window.prompt('Enter URL:', 'https://')
    if (url) exec('createLink', url)
  }

  return (
    <div style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 8, overflow: 'hidden', opacity: disabled ? 0.6 : 1 }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4,
        padding: '8px 10px',
        background: 'var(--cx-bg-surface-raised, #f8fafc)',
        borderBottom: '1px solid var(--cx-border-subtle)',
      }}>
        <ToolbarButton label="B" title="Bold" onClick={() => exec('bold')} active={activeFormats.has('bold')} />
        <ToolbarButton label="I" title="Italic" onClick={() => exec('italic')} active={activeFormats.has('italic')} />
        <ToolbarButton label="U" title="Underline" onClick={() => exec('underline')} active={activeFormats.has('underline')} />
        <div style={{ width: 1, background: 'var(--cx-border-subtle)', margin: '0 4px' }} />
        <ToolbarButton label="Link" title="Insert Link" onClick={promptLink} />
        <div style={{ width: 1, background: 'var(--cx-border-subtle)', margin: '0 4px' }} />
        <ToolbarButton label="• List" title="Bullet List" onClick={() => exec('insertUnorderedList')} active={activeFormats.has('ul')} />
        <ToolbarButton label="1. List" title="Numbered List" onClick={() => exec('insertOrderedList')} active={activeFormats.has('ol')} />
        <div style={{ width: 1, background: 'var(--cx-border-subtle)', margin: '0 4px' }} />
        <ToolbarButton label="H2" title="Heading 2" onClick={() => exec('formatBlock', 'h2')} />
        <ToolbarButton label="H3" title="Heading 3" onClick={() => exec('formatBlock', 'h3')} />
        <ToolbarButton label="¶" title="Paragraph" onClick={() => exec('formatBlock', 'p')} />
        <div style={{ width: 1, background: 'var(--cx-border-subtle)', margin: '0 4px' }} />
        <ToolbarButton label="Clear" title="Clear Formatting" onClick={() => exec('removeFormat')} />
      </div>

      {/* Editor */}
      <div style={{ position: 'relative' }}>
        <div
          ref={setRefs}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          style={{
            minHeight,
            padding: '12px 14px',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: 'var(--cx-text-primary)',
            background: 'var(--cx-bg-surface)',
            outline: 'none',
          }}
          suppressContentEditableWarning
        />
        {isEmpty && placeholder && (
          <div style={{
            position: 'absolute',
            top: 12,
            left: 14,
            fontSize: '0.875rem',
            color: 'var(--cx-text-tertiary)',
            pointerEvents: 'none',
            lineHeight: 1.6,
          }}>
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
})

export default RichEditor
