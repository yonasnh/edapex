/**
 * FavoriteCourses Widget
 * =======================
 * Wired to Canvas REST API:
 *  GET    /api/v1/users/self/favorites/courses  — fetch favorites
 *  POST   /api/v1/users/self/favorites/courses/:id — add favorite
 *  DELETE /api/v1/users/self/favorites/courses/:id — remove favorite
 *
 * Custom ordering is persisted in localStorage (Canvas has no order API).
 * Drag-to-reorder updates local state + localStorage immediately.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useCanvasQuery } from '../hooks/useCanvasQuery'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FavoriteCourse {
  id: number
  name: string
  course_code: string
  workflow_state: string
  term?: { name: string }
  course_image?: string
  total_students?: number
  teachers?: { display_name: string }[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COURSE_COLORS = [
  '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b',
  '#10b981', '#ec4899', '#6366f1', '#14b8a6',
]
const STORAGE_KEY = 'classapex_favorite_order'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSavedOrder(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveOrder(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // storage full / private mode — silently ignore
  }
}

function applyOrder(courses: FavoriteCourse[], order: number[]): FavoriteCourse[] {
  if (order.length === 0) return courses
  const map = new Map(courses.map(c => [c.id, c]))
  const ordered: FavoriteCourse[] = []
  // First: courses present in saved order
  order.forEach(id => { if (map.has(id)) ordered.push(map.get(id)!) })
  // Then: any new courses not yet in saved order
  courses.forEach(c => { if (!order.includes(c.id)) ordered.push(c) })
  return ordered
}

async function getCSRFToken(): Promise<string> {
  const match = document.cookie.match(/csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function canvasFetch(path: string, method: string): Promise<boolean> {
  const token = await getCSRFToken()
  const res = await fetch(path, {
    method,
    headers: {
      Accept: 'application/json',
      'X-CSRF-Token': token,
    },
    credentials: 'include',
  })
  return res.ok
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FavoriteCourses() {
  const { data, isLoading, refetch } = useCanvasQuery<FavoriteCourse[]>(
    '/api/v1/users/self/favorites/courses',
    { include: ['term', 'total_students', 'teachers', 'course_image'] } as any,
  )

  const [items, setItems] = useState<FavoriteCourse[]>([])
  const [removing, setRemoving] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const defaultVisible = 3

  const dragIdx = useRef<number | null>(null)
  const dragOverIdx = useRef<number | null>(null)

  // Sync from API + apply saved order
  useEffect(() => {
    if (data) {
      const order = getSavedOrder()
      setItems(applyOrder(data, order))
    }
  }, [data])

  // ── Drag-to-reorder ───────────────────────────────────────────────────────

  const handleDragStart = useCallback((_e: React.DragEvent, idx: number) => {
    dragIdx.current = idx
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    dragOverIdx.current = idx
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const from = dragIdx.current
    const to = dragOverIdx.current
    dragIdx.current = null
    dragOverIdx.current = null

    if (from === null || to === null || from === to) return

    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      saveOrder(next.map(c => c.id))
      return next
    })
  }, [])

  // ── Remove favorite ───────────────────────────────────────────────────────

  const handleRemove = useCallback(async (courseId: number) => {
    setRemoving(prev => new Set(prev).add(courseId))
    setError(null)
    try {
      const ok = await canvasFetch(
        `/api/v1/users/self/favorites/courses/${courseId}`,
        'DELETE',
      )
      if (ok) {
        setItems(prev => {
          const next = prev.filter(c => c.id !== courseId)
          saveOrder(next.map(c => c.id))
          return next
        })
      } else {
        setError('Could not remove from favorites. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setRemoving(prev => {
        const next = new Set(prev)
        next.delete(courseId)
        return next
      })
    }
  }, [])

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="cx-favorites cx-favorites--loading">
        {[1, 2, 3].map(i => (
          <div key={i} className="cx-skeleton" style={{ height: 52, borderRadius: 10, marginBottom: 6 }} />
        ))}
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 16px' }}>
        <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem', marginBottom: 12 }}>
          No favorite courses yet
        </p>
        <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.8rem' }}>
          Star a course from the Courses page to add it here
        </p>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="cx-favorites">
      {error && (
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--cx-color-error, #ef4444)',
          marginBottom: 8,
          padding: '6px 10px',
          background: 'rgba(239,68,68,0.08)',
          borderRadius: 6,
        }}>
          {error}
        </p>
      )}

      <ul className="cx-favorites__list">
        {(isExpanded ? items : items.slice(0, defaultVisible)).map((course, idx) => {
          const color = COURSE_COLORS[course.id % COURSE_COLORS.length]
          const isRemoving = removing.has(course.id)
          const teacher = course.teachers?.[0]?.display_name

          return (
            <li
              key={course.id}
              className="cx-favorites__item"
              draggable
              onDragStart={e => handleDragStart(e, idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDrop={handleDrop}
              style={{ opacity: isRemoving ? 0.5 : 1, transition: 'opacity 0.2s' }}
            >
              <span
                className="cx-favorites__grip"
                aria-label="Drag to reorder"
                title="Drag to reorder"
              >
                ≡
              </span>

              <span
                className="cx-favorites__color"
                style={{
                  background: course.course_image
                    ? `url(${course.course_image}) center/cover`
                    : color,
                }}
              />

              <div className="cx-favorites__info">
                <a
                  href={`/courses/${course.id}`}
                  className="cx-favorites__name"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {course.name}
                </a>
                <span className="cx-favorites__code">
                  {course.course_code}
                  {teacher ? ` · ${teacher}` : ''}
                  {course.total_students != null ? ` · ${course.total_students} students` : ''}
                </span>
                {course.term && (
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'var(--cx-text-tertiary)',
                    marginTop: 2,
                    display: 'block',
                  }}>
                    {course.term.name}
                  </span>
                )}
              </div>

              <button
                className="cx-btn cx-btn--ghost cx-btn--sm"
                onClick={() => handleRemove(course.id)}
                disabled={isRemoving}
                aria-label={`Remove ${course.name} from favorites`}
                title="Remove from favorites"
                style={{ flexShrink: 0, opacity: 0.6, fontSize: '0.8rem' }}
              >
                {isRemoving ? '…' : '✕'}
              </button>
            </li>
          )
        })}
      </ul>

      {items.length > defaultVisible && (
        <button
          className="cx-widget__toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>Show Less ▴</>
          ) : (
            <>Show More ({items.length - defaultVisible} more) ▾</>
          )}
        </button>
      )}

      <p style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginTop: 8, textAlign: 'right' }}>
        Drag to reorder · Order saved locally
      </p>
    </div>
  )
}
