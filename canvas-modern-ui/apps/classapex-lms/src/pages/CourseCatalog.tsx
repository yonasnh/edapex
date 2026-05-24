import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@schoolapex/components'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import './course-catalog.css'

interface CourseData {
  id: number
  name: string
  course_code: string
  term?: { name: string }
  course_image?: string
  workflow_state: string
  total_students?: number
  teachers?: { display_name: string }[]
  enrollments?: any[]
}

const COURSE_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#14b8a6']

function CourseCard({ course, viewMode }: { course: CourseData; viewMode: 'grid' | 'list' }) {
  const color = COURSE_COLORS[course.id % COURSE_COLORS.length]

  if (viewMode === 'list') {
    return (
      <Link to={`/courses/${course.id}`} className="cx-catalog-row">
        <div className="cx-catalog-row__color" style={{ background: color }} />
        <div className="cx-catalog-row__info">
          <span className="cx-catalog-row__name">{course.name}</span>
          <span className="cx-catalog-row__meta">{course.course_code}</span>
        </div>
        {course.term && <Badge variant="default" size="sm">{course.term.name}</Badge>}
        <span className="cx-catalog-row__students">{course.total_students ?? 0} students</span>
      </Link>
    )
  }

  return (
    <Link to={`/courses/${course.id}`} className="cx-catalog-card">
      <div
        className="cx-catalog-card__banner"
        style={{
          background: course.course_image
            ? `url(${course.course_image}) center/cover`
            : `linear-gradient(135deg, ${color}, ${color}88)`,
        }}
      />
      <div className="cx-catalog-card__body">
        <span className="cx-catalog-card__code">{course.course_code}</span>
        <h3 className="cx-catalog-card__name">{course.name}</h3>
        <div className="cx-catalog-card__footer">
          {course.term && <Badge variant="default" size="sm">{course.term.name}</Badge>}
          <span className="cx-catalog-card__students">{course.total_students ?? 0} enrolled</span>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button 
            className="cx-btn cx-btn--primary cx-btn--sm" 
            style={{ flex: 1 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if ((window as any).handleEnrollCourse) {
                (window as any).handleEnrollCourse(course.id);
              }
            }}
          >
            Enroll Now
          </button>
        </div>
      </div>
    </Link>
  )
}

export default function CourseCatalog() {
  const { showToast } = useNotification()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTerm, setFilterTerm] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')

  const { data: courses, isLoading } = useCanvasQuery<CourseData[]>(
    '/api/v1/courses',
    { per_page: 50, include: ['term', 'total_students', 'teachers', 'course_image'] } as any
  )

  const terms = useMemo(() => {
    if (!courses) return []
    const termSet = new Set<string>()
    courses.forEach(c => { if (c.term?.name) termSet.add(c.term.name) })
    return Array.from(termSet).sort()
  }, [courses])

  const filtered = useMemo(() => {
    if (!courses) return []

    let result = [...courses]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.course_code.toLowerCase().includes(q)
      )
    }

    if (filterTerm !== 'all') {
      result = result.filter(c => c.term?.name === filterTerm)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'code': return a.course_code.localeCompare(b.course_code)
        case 'students': return (b.total_students ?? 0) - (a.total_students ?? 0)
        case 'newest': return b.id - a.id
        default: return 0
      }
    })

    return result
  }, [courses, searchQuery, filterTerm, sortBy])

  const handleEnrollCourse = async (courseId: number) => {
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/enrollments`, {
        method: 'POST',
        body: {
          enrollment: {
            user_id: 'self',
            type: 'StudentEnrollment',
            enrollment_state: 'active'
          }
        }
      });
      showToast({ title: 'Enrolled successfully!', message: 'You have been enrolled in the course.', type: 'success' });
    } catch (err: any) {
      showToast({ title: 'Enrollment Failed', message: err.message || 'Could not enroll in course.', type: 'error' });
    }
  }

  // Attach to window so card can call it easily without prop drilling
  (window as any).handleEnrollCourse = handleEnrollCourse;

  return (
    <div className="cx-catalog">

      {/* Search + filters */}
      <div className="cx-catalog__controls">
        <div className="cx-catalog__search">
          <span className="cx-catalog__search-icon">search</span>
          <input
            type="search"
            className="cx-catalog__search-input"
            placeholder="Search courses by name or code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="cx-catalog__select"
          value={filterTerm}
          onChange={e => setFilterTerm(e.target.value)}
          aria-label="Filter by term"
        >
          <option value="all">All Terms</option>
          {terms.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          className="cx-catalog__select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          aria-label="Sort by"
        >
          <option value="name">Name</option>
          <option value="code">Code</option>
          <option value="students">Students</option>
          <option value="newest">Newest</option>
        </select>

        <div className="cx-catalog__view-toggle" role="radiogroup" aria-label="View mode">
          <button
            className={`cx-catalog-view-btn ${viewMode === 'grid' ? 'cx-catalog-view-btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            role="radio"
            aria-checked={viewMode === 'grid'}
          >
            Grid
          </button>
          <button
            className={`cx-catalog-view-btn ${viewMode === 'list' ? 'cx-catalog-view-btn--active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
            role="radio"
            aria-checked={viewMode === 'list'}
          >
            List
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="cx-catalog-skeleton">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="cx-skeleton cx-skeleton--card" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="cx-catalog__count">{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>
          <div className={viewMode === 'grid' ? 'cx-catalog-grid' : 'cx-catalog-list'}>
            {filtered.map(course => (
              <CourseCard key={course.id} course={course} viewMode={viewMode} />
            ))}
          </div>
        </>
      ) : (
        <div className="cx-catalog-empty">
          <span className="cx-catalog-empty__icon">search</span>
          <p className="cx-catalog-empty__message">No courses match your search</p>
          <p className="cx-catalog-empty__hint">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}
