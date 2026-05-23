import React, { useState, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge } from '@schoolapex/components'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { ModuleList } from '../widgets/ModuleList'
import { PeopleList } from '../widgets/PeopleList'
import { CourseSidebar } from '../widgets/CourseSidebar'
import { MediaLibrary } from '../widgets/MediaLibrary'
import './course-home.css'

type Tab = 'modules' | 'syllabus' | 'people' | 'media'

type HomePageOption = 'modules' | 'syllabus' | 'assignments' | 'feed'

const HOME_PAGE_OPTIONS: { value: HomePageOption; label: string; desc: string }[] = [
  { value: 'modules', label: 'Modules', desc: 'Show course modules and their items' },
  { value: 'syllabus', label: 'Syllabus', desc: 'Display the course syllabus' },
  { value: 'assignments', label: 'Assignments', desc: 'List upcoming assignments' },
  { value: 'feed', label: 'Activity Feed', desc: 'Show recent course activity' },
]

interface CourseInfo {
  id: number
  name: string
  course_code: string
  term?: { name: string }
  course_image?: string
  workflow_state: string
  total_students?: number
  teachers?: { display_name: string }[]
  syllabus_body?: string
  start_at?: string
  end_at?: string
  storage_used_mb?: number
}

export default function CourseHome() {
  const { courseId } = useParams<{ courseId: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('modules')
  const [showCustomize, setShowCustomize] = useState(false)
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'

  const [homePage, setHomePage] = useState<HomePageOption>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`course_home_${courseId}`) : null
    return (saved as HomePageOption) || 'modules'
  })

  const handleHomePageChange = useCallback((option: HomePageOption) => {
    setHomePage(option)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`course_home_${courseId}`, option)
    }
  }, [courseId])

  const { data: course, isLoading: courseLoading } = useCanvasQuery<CourseInfo>(
    `/api/v1/courses/${courseId}`,
    { include: ['syllabus_body', 'term', 'teachers', 'total_students'] } as any
  )

  // Record course visited history in localStorage (recent tracking)
  React.useEffect(() => {
    if (course && courseId) {
      try {
        const key = 'classapex_recent_courses'
        const currentRecent = localStorage.getItem(key)
        let list: string[] = currentRecent ? JSON.parse(currentRecent) : []
        list = list.filter(id => id !== String(courseId))
        list.unshift(String(courseId))
        list = list.slice(0, 10)
        localStorage.setItem(key, JSON.stringify(list))
      } catch (e) {
        // Silently ignore storage or private mode issues
      }
    }
  }, [course, courseId])

  const { data: modules, isLoading: modulesLoading } = useCanvasQuery<any[]>(
    `/api/v1/courses/${courseId}/modules`,
    { include: ['items'] } as any
  )


  const { data: people, isLoading: peopleLoading } = useCanvasQuery<any[]>(
    `/api/v1/courses/${courseId}/users`,
    { per_page: 50, include: ['bio', 'avatar_url'] } as any
  )

  const tabs: { id: Tab; label: string }[] = [
    { id: 'modules', label: 'Modules' },
    { id: 'syllabus', label: 'Syllabus' },
    { id: 'people', label: 'People' },
    { id: 'media', label: 'Media Library' },
  ]

  const customLabel = HOME_PAGE_OPTIONS.find(o => o.value === homePage)?.label || 'Modules'

  const storageDisplay = course?.storage_used_mb
    ? `${(course.storage_used_mb / 1024).toFixed(1)} GB`
    : '--'

  if (courseLoading) {
    return (
      <div className="cx-course-home">
        <div className="cx-skeleton cx-skeleton--banner" />
        <div className="cx-skeleton cx-skeleton--tabs" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="cx-course-home cx-course-home--error">
        <h1>Course not found</h1>
        <Link to="/courses">Back to Courses</Link>
      </div>
    )
  }

  return (
    <div className="cx-course-home">
      <div
        className="cx-course-home__banner"
        style={{
          background: course.course_image
            ? `url(${course.course_image}) center/cover`
            : 'linear-gradient(135deg, var(--cx-color-primary), var(--cx-color-primary-hover))',
        }}
      >
        <div className="cx-course-home__banner-content">
          <div>
            <span className="cx-course-home__code">{course.course_code}</span>
            <h1 className="cx-course-home__title">{course.name}</h1>
            <div className="cx-course-home__meta">
              {course.term && <Badge variant="default" size="sm">{course.term.name}</Badge>}
              {course.teachers?.[0] && (
                <span className="cx-course-home__teacher">
                  {course.teachers[0].display_name}
                </span>
              )}
              {course.total_students !== undefined && (
                <span className="cx-course-home__students">
                  {course.total_students} students
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="cx-course-home__tabs" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`cx-course-home__tab ${activeTab === tab.id ? 'cx-course-home__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <div className="cx-course-home__tabs-actions">
          <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', whiteSpace: 'nowrap' }}>
            Home: {customLabel}
          </span>
          <button
            className="cx-btn cx-btn--ghost cx-btn--sm"
            onClick={() => setShowCustomize(p => !p)}
            aria-label="Customize course home page"
          >
            {showCustomize ? 'Done' : 'Customize'}
          </button>
        </div>
      </div>

      {showCustomize && (
        <div className="cx-card" style={{ margin: '16px 0', padding: 16 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>Choose your course home page</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {HOME_PAGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`cx-card ${homePage === opt.value ? 'cx-card--selected' : ''}`}
                style={{ flex: '1 1 180px', cursor: 'pointer', textAlign: 'left', padding: 12, border: homePage === opt.value ? '2px solid var(--cx-color-primary)' : '2px solid transparent' }}
                onClick={() => handleHomePageChange(opt.value)}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{opt.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="cx-course-layout">
        <div className="cx-course-home__content">
          {activeTab === 'modules' && (
            <ModuleList
              modules={modules || []}
              isLoading={modulesLoading}
              isTeacher={isTeacher}
              courseId={courseId!}
            />
          )}

          {activeTab === 'syllabus' && (
            <div className="cx-course-syllabus">
              {course.syllabus_body ? (
                <div className="cx-course-syllabus__body" dangerouslySetInnerHTML={{ __html: course.syllabus_body }} />
              ) : (
                <p className="cx-widget__empty">No syllabus available for this course</p>
              )}
            </div>
          )}

          {activeTab === 'people' && (
            <PeopleList people={people || []} isLoading={peopleLoading} />
          )}

          {activeTab === 'media' && (
            <div className="cx-course-media-library" style={{ background: 'var(--cx-bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--cx-border-subtle)' }}>
              <MediaLibrary courseId={courseId!} />
            </div>
          )}
        </div>

        <CourseSidebar
          courseId={courseId!}
          courseName={course.name}
          courseCode={course.course_code}
          peopleCount={course.total_students ?? 0}
          modulesCount={modules?.length ?? 0}
          storageUsed={storageDisplay}
        />
      </div>
    </div>
  )
}
