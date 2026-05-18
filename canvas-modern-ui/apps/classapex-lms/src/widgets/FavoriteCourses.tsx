import React, { useState, useCallback, useRef, useEffect } from 'react'

interface FavoriteCourse {
  id: number
  name: string
  course_code: string
  term?: { name: string }
}

interface FavoriteCoursesProps {
  courses: FavoriteCourse[]
  isLoading?: boolean
  onReorder?: (courseIds: number[]) => void
}

const COURSE_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#14b8a6']

export function FavoriteCourses({ courses, isLoading = false, onReorder }: FavoriteCoursesProps) {
  const [items, setItems] = useState(courses)
  const dragIdx = useRef<number | null>(null)
  const dragOverIdx = useRef<number | null>(null)

  useEffect(() => { setItems(courses) }, [courses])

  if (isLoading) {
    return <div className="cx-skeleton cx-skeleton--list" />
  }

  if (!items || items.length === 0) {
    return <p className="cx-widget__empty">No favorite courses yet</p>
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const from = dragIdx.current
    const to = dragOverIdx.current
    if (from === null || to === null || from === to) {
      dragIdx.current = null
      dragOverIdx.current = null
      return
    }
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    dragIdx.current = null
    dragOverIdx.current = null
  }, [])

  const handleSave = () => {
    onReorder?.(items.map(c => c.id))
  }

  const hasChanged = items.map(c => c.id).join() !== courses.map(c => c.id).join()

  return (
    <div className="cx-favorites">
      <ul className="cx-favorites__list">
        {items.map((course, idx) => (
          <li
            key={course.id}
            className="cx-favorites__item"
            draggable
            onDragStart={() => { dragIdx.current = idx }}
            onDragOver={e => { e.preventDefault(); dragOverIdx.current = idx }}
            onDrop={handleDrop}
          >
            <span className="cx-favorites__grip" aria-label="Drag to reorder">
              ≡
            </span>
            <span
              className="cx-favorites__color"
              style={{ background: COURSE_COLORS[course.id % COURSE_COLORS.length] }}
            />
            <div className="cx-favorites__info">
              <span className="cx-favorites__name">{course.name}</span>
              <span className="cx-favorites__code">{course.course_code}</span>
            </div>
          </li>
        ))}
      </ul>
      {hasChanged && (
        <button className="cx-favorites__save" onClick={handleSave}>
          Save order
        </button>
      )}
    </div>
  )
}
