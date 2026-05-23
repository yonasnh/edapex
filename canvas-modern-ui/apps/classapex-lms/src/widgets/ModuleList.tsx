import React, { useState, useCallback } from 'react'
import { ModuleItem, type ModuleItemData } from './ModuleItem'

interface ModuleData {
  id: number
  name: string
  position: number
  unlock_at?: string | null
  prerequisite_module_ids?: number[]
  published?: boolean
  items: ModuleItemData[]
}

interface ModuleListProps {
  modules: ModuleData[]
  isLoading?: boolean
  isTeacher?: boolean
  courseId: string
  onReorder?: (modules: ModuleData[]) => void
}

function ModuleCollapse({ module: mod, courseId, defaultOpen = true, isTeacher, onDragStart, onDragOver, onDrop, dragIndex, onTogglePublish }: {
  module: ModuleData
  courseId?: string
  defaultOpen?: boolean
  isTeacher?: boolean
  onDragStart?: (e: React.DragEvent, index: number) => void
  onDragOver?: (e: React.DragEvent, index: number) => void
  onDrop?: (e: React.DragEvent, index: number) => void
  dragIndex?: number | null
  onTogglePublish?: (id: number, published: boolean) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const isLocked = mod.prerequisite_module_ids && mod.prerequisite_module_ids.length > 0

  return (
    <div
      className={`cx-module ${dragIndex !== undefined && dragIndex !== null ? 'cx-module--dragging' : ''}`}
      draggable={isTeacher}
      onDragStart={e => onDragStart?.(e, mod.position)}
      onDragOver={e => onDragOver?.(e, mod.position)}
      onDrop={e => onDrop?.(e, mod.position)}
    >
      {/* Header row — note: publish button is a sibling of the toggle, NOT nested inside it */}
      <div className="cx-module__header">
        {/* Collapse toggle — left portion only */}
        <div
          role="button"
          tabIndex={0}
          className="cx-module__header-left"
          onClick={() => setOpen(!open)}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(!open)}
          aria-expanded={open}
          aria-label={`${open ? 'Collapse' : 'Expand'} module: ${mod.name}`}
          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
        >
          {isTeacher && <span className="cx-module__grip" title="Drag to reorder">::</span>}
          <span className="cx-module__chevron">{open ? '\u25BC' : '\u25B6'}</span>
          <div>
            <span className="cx-module__title">{mod.name}</span>
            {mod.items.length > 0 && (
              <span className="cx-module__meta">{mod.items.length} items</span>
            )}
          </div>
        </div>

        {/* Publish toggle and lock badge — sibling, NOT inside the collapse button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {isTeacher && (
            <button
              className={`cx-btn cx-btn--sm ${mod.published ? 'cx-btn--success' : 'cx-btn--outline'}`}
              style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: '12px' }}
              onClick={() => onTogglePublish?.(mod.id, !mod.published)}
              aria-label={mod.published ? 'Unpublish module' : 'Publish module'}
            >
              {mod.published ? '✓ Published' : 'Unpublished'}
            </button>
          )}
          {isLocked && <span className="cx-module__lock" title="Prerequisites required">locked</span>}
        </div>
      </div>

      {open && mod.items.length > 0 && (
        <div className="cx-module__items">
          {mod.items.map(item => (
            <ModuleItem key={item.id} item={item} courseId={courseId} moduleId={mod.id} />
          ))}
        </div>
      )}
      {open && mod.items.length === 0 && (
        <p className="cx-module__empty">No items in this module</p>
      )}
    </div>
  )
}

export function ModuleList({ modules, isLoading = false, isTeacher = false, courseId, onReorder }: ModuleListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [orderedModules, setOrderedModules] = useState<ModuleData[] | null>(null)
  
  // Optimistic local state for publish toggling
  const [localPublishState, setLocalPublishState] = useState<Record<number, boolean>>({})

  const sorted = orderedModules ?? [...modules].sort((a, b) => a.position - b.position)
  
  // Merge prop data with optimistic local state
  const displayModules = sorted.map(m => ({
    ...m,
    published: localPublishState[m.id] !== undefined ? localPublishState[m.id] : (m.published ?? true)
  }))

  const handleDragStart = useCallback((e: React.DragEvent, position: number) => {
    setDragIndex(position)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, position: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropPosition: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropPosition) {
      setDragIndex(null)
      return
    }

    const reordered = [...sorted]
    const fromIdx = reordered.findIndex(m => m.position === dragIndex)
    const toIdx = reordered.findIndex(m => m.position === dropPosition)
    if (fromIdx === -1 || toIdx === -1) {
      setDragIndex(null)
      return
    }

    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)

    const updated = reordered.map((m, i) => ({ ...m, position: i + 1 }))
    setOrderedModules(updated)
    setDragIndex(null)
    onReorder?.(updated)
  }, [dragIndex, sorted, onReorder])

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSaveOrder = useCallback(async () => {
    if (!orderedModules) return
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Canvas requires individual PUT per module to update position
      const token = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? ''
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-Token': decodeURIComponent(token),
      }

      const results = await Promise.allSettled(
        orderedModules.map(mod =>
          fetch(`/api/v1/courses/${courseId}/modules/${mod.id}`, {
            method: 'PUT',
            headers,
            credentials: 'include',
            body: JSON.stringify({ module: { position: mod.position } }),
          })
        )
      )

      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok))
      if (failed.length > 0) {
        setSaveError(`${failed.length} module(s) failed to save. Please try again.`)
      } else {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch {
      setSaveError('Network error saving module order.')
    } finally {
      setIsSaving(false)
    }
  }, [orderedModules, courseId])

  const handleTogglePublish = useCallback(async (id: number, published: boolean) => {
    setLocalPublishState(prev => ({ ...prev, [id]: published }))
    console.log(`Module ${id} ${published ? 'published' : 'unpublished'}`)
    try {
      const response = await fetch(`/api/v1/courses/${courseId}/modules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: { published } })
      })
      if (!response.ok) throw new Error('Failed to update module')
    } catch (err) {
      console.error('Failed to update module:', err)
      setLocalPublishState(prev => ({ ...prev, [id]: !published }))
    }
  }, [courseId])

  if (isLoading) {
    return (
      <div className="cx-module-skeleton">
        {[1, 2, 3].map(i => <div key={i} className="cx-skeleton cx-skeleton--module" />)}
      </div>
    )
  }

  if (!modules || modules.length === 0) {
    return <p className="cx-widget__empty">No modules available</p>
  }

  return (
    <div className="cx-module-list">
      {displayModules.map(mod => (
        <ModuleCollapse
          key={mod.id}
          module={mod}
          courseId={courseId}
          defaultOpen={mod.position <= 2}
          isTeacher={isTeacher}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          dragIndex={dragIndex}
          onTogglePublish={handleTogglePublish}
        />
      ))}
      {isTeacher && orderedModules && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          <button
            className="cx-module-list__save"
            onClick={handleSaveOrder}
            disabled={isSaving}
            aria-busy={isSaving}
          >
            {isSaving ? 'Saving…' : saveSuccess ? '✓ Saved!' : 'Save Module Order'}
          </button>
          {saveError && (
            <p style={{ fontSize: '0.8rem', color: 'var(--cx-color-error, #ef4444)', margin: 0 }}>
              {saveError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
