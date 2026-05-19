/**
 * Pages (Wiki) — ClassApex LMS
 * ==============================
 * Fully wired to Canvas REST API:
 *  GET  /api/v1/courses/:id/pages          — list all wiki pages
 *  GET  /api/v1/courses/:id/pages/:url     — single page body
 *  POST /api/v1/courses/:id/pages          — create page (teacher)
 *  PUT  /api/v1/courses/:id/pages/:url     — update page (teacher)
 *  DELETE /api/v1/courses/:id/pages/:url   — delete page (teacher)
 */

import React, { useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'

// ─── Types ───────────────────────────────────────────────────────────────────

interface WikiPage {
  page_id: number
  url: string
  title: string
  created_at: string
  updated_at: string
  published: boolean
  hide_from_students: boolean
  editing_roles: string
  body?: string
  last_edited_by?: { display_name: string; avatar_image_url?: string }
  front_page?: boolean
}

// ─── CSRF helper ─────────────────────────────────────────────────────────────

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

// ─── Rich Text Editor ────────────────────────────────────────────────────────

const TOOLBAR_ITEMS = [
  { cmd: 'bold',          label: 'B',   title: 'Bold',         style: { fontWeight: 700 } },
  { cmd: 'italic',        label: 'I',   title: 'Italic',       style: { fontStyle: 'italic' } },
  { cmd: 'underline',     label: 'U',   title: 'Underline',    style: { textDecoration: 'underline' } },
  { cmd: 'strikeThrough', label: 'S̶',   title: 'Strikethrough',style: {} },
  { cmd: '---',           label: '|',   title: '',             style: {} },
  { cmd: 'formatBlock',   label: 'H1',  title: 'Heading 1',    arg: 'h1', style: {} },
  { cmd: 'formatBlock',   label: 'H2',  title: 'Heading 2',    arg: 'h2', style: {} },
  { cmd: 'formatBlock',   label: 'H3',  title: 'Heading 3',    arg: 'h3', style: {} },
  { cmd: 'formatBlock',   label: '¶',   title: 'Paragraph',    arg: 'p',  style: {} },
  { cmd: '---',           label: '|',   title: '',             style: {} },
  { cmd: 'insertUnorderedList', label: '• List', title: 'Bullet list', style: {} },
  { cmd: 'insertOrderedList',   label: '1. List', title: 'Numbered list', style: {} },
  { cmd: '---',           label: '|',   title: '',             style: {} },
  { cmd: 'createLink',    label: '🔗',  title: 'Insert link',  style: {} },
  { cmd: 'removeFormat',  label: '✕',   title: 'Clear formatting', style: {} },
]

function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposing = useRef(false)

  // Sync initial value only on mount
  React.useLayoutEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (cmd: string, arg?: string) => {
    if (cmd === 'createLink') {
      const url = prompt('Enter URL:', 'https://')
      if (url) document.execCommand('createLink', false, url)
    } else if (arg) {
      document.execCommand(cmd, false, arg)
    } else {
      document.execCommand(cmd, false, undefined)
    }
    editorRef.current?.focus()
    onChange(editorRef.current?.innerHTML ?? '')
  }

  return (
    <div style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        padding: '6px 8px',
        background: 'var(--cx-bg-surface-raised, #f8fafc)',
        borderBottom: '1px solid var(--cx-border-subtle)',
      }}>
        {TOOLBAR_ITEMS.map((item, i) =>
          item.cmd === '---' ? (
            <div key={i} style={{ width: 1, background: 'var(--cx-border-subtle)', margin: '0 4px', alignSelf: 'stretch' }} />
          ) : (
            <button
              key={i}
              type="button"
              title={item.title}
              onMouseDown={e => {
                e.preventDefault()
                exec(item.cmd, (item as any).arg)
              }}
              style={{
                padding: '3px 8px',
                border: '1px solid transparent',
                borderRadius: 4,
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                color: 'var(--cx-text-secondary)',
                ...item.style,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--cx-bg-hover, rgba(0,0,0,0.05))')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {item.label}
            </button>
          )
        )}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onCompositionStart={() => { isComposing.current = true }}
        onCompositionEnd={() => {
          isComposing.current = false
          onChange(editorRef.current?.innerHTML ?? '')
        }}
        onInput={() => {
          if (!isComposing.current) onChange(editorRef.current?.innerHTML ?? '')
        }}
        style={{
          minHeight: 320,
          padding: '16px',
          outline: 'none',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          color: 'var(--cx-text-primary)',
          background: 'var(--cx-bg-surface)',
          overflowY: 'auto',
        }}
        aria-label="Page body"
        aria-multiline="true"
        role="textbox"
      />
    </div>
  )
}

// ─── Page Editor ─────────────────────────────────────────────────────────────

function PageEditor({
  courseId,
  page,
  onSave,
  onCancel,
}: {
  courseId: string
  page: Partial<WikiPage> | null
  onSave: () => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(page?.title ?? '')
  const [body, setBody] = useState(page?.body ?? '')
  const [published, setPublished] = useState(page?.published ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true); setError(null)
    try {
      const payload = { wiki_page: { title, body, published } }
      const res = page?.url
        ? await csrfFetch(`/api/v1/courses/${courseId}/pages/${page.url}`, 'PUT', payload)
        : await csrfFetch(`/api/v1/courses/${courseId}/pages`, 'POST', payload)
      if (!res.ok) throw new Error(await res.text())
      onSave()
    } catch (e: any) {
      setError(e.message || 'Failed to save page')
    } finally {
      setSaving(false)
    }
  }, [title, body, published, page, courseId, onSave])

  return (
    <div className="cx-page-editor">
      <div className="cx-page-editor__header">
        <h2 className="cx-page-editor__heading">{page?.url ? 'Edit Page' : 'New Page'}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={onCancel}>Cancel</button>
          <button
            className="cx-btn cx-btn--primary cx-btn--sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Page'}
          </button>
        </div>
      </div>
      {error && (
        <p style={{ color: 'var(--cx-color-error,#ef4444)', fontSize: '0.82rem', marginBottom: 8 }}>{error}</p>
      )}
      <input
        className="cx-page-editor__title-input"
        type="text"
        placeholder="Page Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        aria-label="Page title"
        style={{ marginBottom: 12 }}
      />
      <RichTextEditor value={body} onChange={setBody} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
          />
          Publish page
        </label>
      </div>
    </div>
  )
}


// ─── Page Viewer ─────────────────────────────────────────────────────────────

function PageViewer({
  courseId,
  pageUrl,
  isTeacher,
  onEdit,
  onBack,
}: {
  courseId: string
  pageUrl: string
  isTeacher: boolean
  onEdit: () => void
  onBack: () => void
}) {
  const { data: page, isLoading } = useCanvasQuery<WikiPage>(
    `/api/v1/courses/${courseId}/pages/${pageUrl}`,
  )

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="cx-skeleton" style={{ height: 32, width: '40%', borderRadius: 8, marginBottom: 16 }} />
        <div className="cx-skeleton" style={{ height: 400, borderRadius: 8 }} />
      </div>
    )
  }

  if (!page) {
    return <p style={{ color: 'var(--cx-text-tertiary)', padding: 24 }}>Page not found.</p>
  }

  return (
    <div className="cx-wiki-page">
      <div className="cx-wiki-page__header">
        <button
          className="cx-btn cx-btn--ghost cx-btn--sm"
          onClick={onBack}
          style={{ marginRight: 8 }}
        >
          ← Back
        </button>
        <h1 className="cx-wiki-page__title">{page.title}</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {!page.published && (
            <span style={{
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: 12,
              background: 'rgba(245,158,11,0.15)',
              color: '#d97706',
              fontWeight: 600,
            }}>Unpublished</span>
          )}
          {page.last_edited_by && (
            <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>
              Last edited by {page.last_edited_by.display_name} · {new Date(page.updated_at).toLocaleDateString()}
            </span>
          )}
          {isTeacher && (
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onEdit}>
              Edit
            </button>
          )}
        </div>
      </div>
      <div
        className="cx-wiki-page__body"
        dangerouslySetInnerHTML={{ __html: page.body ?? '<p><em>No content</em></p>' }}
      />
    </div>
  )
}

// ─── Main Pages Component ─────────────────────────────────────────────────────

export default function Pages() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'

  const [search, setSearch] = useState('')
  const [viewingUrl, setViewingUrl] = useState<string | null>(null)
  const [editingPage, setEditingPage] = useState<WikiPage | null | 'new'>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const refetchRef = useRef<(() => void) | null>(null)

  const { data: pages, isLoading, refetch } = useCanvasQuery<WikiPage[]>(
    courseId ? `/api/v1/courses/${courseId}/pages` : '',
    { per_page: 100, include: ['body'] } as any,
  )
  refetchRef.current = refetch

  const filtered = (pages ?? []).filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = useCallback(async (pageUrl: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return
    setDeletingId(pageUrl); setDeleteError(null)
    try {
      const res = await csrfFetch(`/api/v1/courses/${courseId}/pages/${pageUrl}`, 'DELETE')
      if (!res.ok) throw new Error('Failed to delete page')
      refetchRef.current?.()
    } catch {
      setDeleteError('Could not delete page. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }, [courseId])

  // ── Editor mode ────────────────────────────────────────────────────────────
  if (editingPage !== null) {
    return (
      <div className="cx-page">
        <PageEditor
          courseId={courseId!}
          page={editingPage === 'new' ? null : editingPage}
          onSave={() => { setEditingPage(null); refetchRef.current?.() }}
          onCancel={() => setEditingPage(null)}
        />
      </div>
    )
  }

  // ── Viewer mode ────────────────────────────────────────────────────────────
  if (viewingUrl) {
    return (
      <div className="cx-page">
        <PageViewer
          courseId={courseId!}
          pageUrl={viewingUrl}
          isTeacher={isTeacher}
          onEdit={() => {
            const pg = pages?.find(p => p.url === viewingUrl)
            if (pg) setEditingPage(pg)
          }}
          onBack={() => setViewingUrl(null)}
        />
      </div>
    )
  }

  // ── List mode ──────────────────────────────────────────────────────────────
  return (
    <div className="cx-page">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="search"
          className="cx-assignment-list__search"
          placeholder="Search pages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        {isTeacher && (
          <button
            className="cx-btn cx-btn--primary cx-btn--sm"
            onClick={() => setEditingPage('new')}
          >
            + New Page
          </button>
        )}
      </div>

      {deleteError && (
        <p style={{ color: 'var(--cx-color-error,#ef4444)', fontSize: '0.82rem', marginBottom: 10 }}>{deleteError}</p>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 64, borderRadius: 10 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cx-text-tertiary)' }}>
          <p style={{ fontSize: '1rem', margin: 0 }}>{search ? 'No pages match your search' : 'No pages yet'}</p>
          {isTeacher && !search && (
            <button
              className="cx-btn cx-btn--primary"
              onClick={() => setEditingPage('new')}
              style={{ marginTop: 16 }}
            >
              Create the first page
            </button>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(page => (
            <li
              key={page.page_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: 'var(--cx-bg-surface)',
                borderRadius: 10,
                border: '1px solid var(--cx-border-subtle)',
                transition: 'box-shadow 0.15s',
                cursor: 'pointer',
              }}
              onClick={() => setViewingUrl(page.url)}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--cx-shadow-sm)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--cx-text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {page.title}
                  {page.front_page && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: 8,
                      background: 'var(--cx-color-primary)',
                      color: '#fff',
                    }}>Front Page</span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 2 }}>
                  Updated {new Date(page.updated_at).toLocaleDateString()}
                  {page.last_edited_by ? ` by ${page.last_edited_by.display_name}` : ''}
                </div>
              </div>

              {!page.published && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(245,158,11,0.12)',
                  color: '#d97706',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>Draft</span>
              )}

              {isTeacher && (
                <div
                  style={{ display: 'flex', gap: 6, flexShrink: 0 }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    onClick={() => setEditingPage(page)}
                    title="Edit page"
                  >
                    Edit
                  </button>
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    onClick={() => handleDelete(page.url)}
                    disabled={deletingId === page.url}
                    title="Delete page"
                    style={{ color: 'var(--cx-color-error,#ef4444)' }}
                  >
                    {deletingId === page.url ? '…' : 'Delete'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginTop: 12, textAlign: 'right' }}>
        {filtered.length} page{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
