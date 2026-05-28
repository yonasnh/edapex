import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import clsx from 'clsx'
import LogoLoader from '../components/LogoLoader'

export interface CourseTab {
  id: string
  label: string
  visibility: 'public' | 'hidden' | 'admins'
  position: number
  html_url?: string
}

function DragHandleSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5" cy="4" r="1" fill="currentColor" />
      <circle cx="11" cy="4" r="1" fill="currentColor" />
      <circle cx="5" cy="8" r="1" fill="currentColor" />
      <circle cx="11" cy="8" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="11" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function EyeSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function ArrowUpSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

function ArrowDownSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SpinnerSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}>
      <circle cx="8" cy="8" r="6" strokeOpacity="0.3" />
      <path d="M8 2a6 6 0 016 6" strokeLinecap="round" />
    </svg>
  )
}

export default function CourseNavigationEditor() {
  const { courseId } = useParams<{ courseId: string }>()
  const { showToast } = useNotification()
  const [saving, setSaving] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const { data: tabsData, isLoading, refetch } = useCanvasQuery<CourseTab[]>(
    courseId ? `/api/v1/courses/${courseId}/tabs` : '',
    { per_page: 100 }
  )

  const [tabs, setTabs] = useState<CourseTab[]>([])

  useEffect(() => {
    if (tabsData) {
      const sorted = [...tabsData].sort((a, b) => a.position - b.position)
      setTabs(sorted)
    }
  }, [tabsData])

  const handleToggleVisibility = useCallback((index: number) => {
    setTabs(prev => {
      const next = [...prev]
      const tab = next[index]
      next[index] = {
        ...tab,
        visibility: tab.visibility === 'hidden' ? 'public' : 'hidden',
      }
      return next
    })
  }, [])

  const handleMove = useCallback((index: number, direction: -1 | 1) => {
    setTabs(prev => {
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(newIndex, 0, moved)
      return next.map((t, i) => ({ ...t, position: i + 1 }))
    })
  }, [])

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    setTabs(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index, 0, moved)
      return next.map((t, i) => ({ ...t, position: i + 1 }))
    })
    setDragIndex(index)
  }, [dragIndex])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
  }, [])

  const handleSave = async () => {
    if (!courseId) return
    setSaving(true)
    try {
      const originalMap = new Map((tabsData || []).map(t => [t.id, t]))

      await Promise.all(
        tabs.map(async (tab, index) => {
          const original = originalMap.get(tab.id)
          const requests: Promise<any>[] = []

          if (!original || original.position !== index + 1) {
            requests.push(
              canvasFetch(`/api/v1/courses/${courseId}/tabs/${tab.id}`, {
                method: 'PUT',
                body: { position: index + 1 },
              })
            )
          }

          if (!original || original.visibility !== tab.visibility) {
            requests.push(
              canvasFetch(`/api/v1/courses/${courseId}/tabs/${tab.id}`, {
                method: 'PUT',
                body: { hidden: tab.visibility === 'hidden' },
              })
            )
          }

          await Promise.all(requests)
        })
      )

      await refetch()
      showToast({ title: 'Navigation saved', type: 'success' })
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const visibleTabs = tabs.filter(t => t.visibility !== 'hidden')

  if (isLoading) {
    return (
      <div className="cx-page">
        <LogoLoader text="Loading course navigation…" />
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="cx-page__title">Course Navigation</h1>
        <button
          className="cx-btn cx-btn--primary cx-btn--sm"
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {saving ? <><SpinnerSvg /> Saving…</> : 'Save Navigation'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Editor */}
        <div className="cx-section" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--cx-bg-surface-raised)',
              borderBottom: '1px solid var(--cx-border-subtle)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--cx-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'grid',
              gridTemplateColumns: '40px 1fr 100px 80px',
              gap: 8,
            }}
          >
            <span>Order</span>
            <span>Tab</span>
            <span>Visibility</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          <div role="list" aria-label="Course navigation tabs">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                role="listitem"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={clsx(
                  'cx-nav-editor-row',
                  dragIndex === index && 'cx-nav-editor-row--dragging'
                )}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 100px 80px',
                  gap: 8,
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--cx-border-subtle)',
                  background: dragIndex === index ? 'var(--cx-color-primary-subtle)' : 'transparent',
                  cursor: 'grab',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--cx-text-tertiary)' }}>
                  <DragHandleSvg />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{index + 1}</span>
                </div>

                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cx-text-primary)' }}>
                  {tab.label}
                </div>

                <div>
                  <button
                    className={clsx(
                      'cx-btn cx-btn--sm',
                      tab.visibility === 'hidden' ? 'cx-btn--ghost' : 'cx-btn--secondary'
                    )}
                    onClick={() => handleToggleVisibility(index)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.8125rem',
                      color: tab.visibility === 'hidden' ? 'var(--cx-text-tertiary)' : 'var(--cx-color-primary)',
                    }}
                    aria-label={tab.visibility === 'hidden' ? `Show ${tab.label}` : `Hide ${tab.label}`}
                  >
                    {tab.visibility === 'hidden' ? <EyeOffSvg /> : <EyeSvg />}
                    {tab.visibility === 'hidden' ? 'Hidden' : 'Visible'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${tab.label} up`}
                    style={{ color: 'var(--cx-text-tertiary)' }}
                  >
                    <ArrowUpSvg />
                  </button>
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === tabs.length - 1}
                    aria-label={`Move ${tab.label} down`}
                    style={{ color: 'var(--cx-text-tertiary)' }}
                  >
                    <ArrowDownSvg />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {tabs.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>
              No navigation tabs found.
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="cx-section" style={{ padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
            Preview
          </h3>
          <nav
            aria-label="Navigation preview"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              background: 'var(--cx-bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--cx-border-subtle)',
              padding: '8px 0',
            }}
          >
            {visibleTabs.map(tab => (
              <div
                key={tab.id}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  color: 'var(--cx-text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  margin: '0 8px',
                  background: 'transparent',
                }}
              >
                {tab.label}
              </div>
            ))}
            {visibleTabs.length === 0 && (
              <div style={{ padding: 16, textAlign: 'center', fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)' }}>
                All tabs are hidden
              </div>
            )}
          </nav>
          <p style={{ margin: '12px 0 0', fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', lineHeight: 1.5 }}>
            Drag rows or use arrows to reorder. Toggle visibility with the eye icon. Hidden tabs are not shown to students.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .cx-nav-editor-row:hover {
          background: var(--cx-bg-surface-raised) !important;
        }
        .cx-nav-editor-row--dragging {
          opacity: 0.7;
        }
      `}</style>
    </div>
  )
}
