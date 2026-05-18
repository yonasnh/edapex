import React from 'react'

interface CourseSidebarProps {
  courseName: string
  courseCode: string
  peopleCount: number
  modulesCount: number
  assignmentsCount?: number
  storageUsed?: string
  isLoading?: boolean
}

export function CourseSidebar({
  courseName,
  courseCode,
  peopleCount,
  modulesCount,
  assignmentsCount,
  storageUsed = '--',
  isLoading = false,
}: CourseSidebarProps) {
  if (isLoading) {
    return (
      <div className="cx-course-sidebar">
        <div className="cx-skeleton cx-skeleton--sidebar-card" />
        <div className="cx-skeleton cx-skeleton--sidebar-card" />
        <div className="cx-skeleton cx-skeleton--sidebar-card" />
      </div>
    )
  }

  return (
    <div className="cx-course-sidebar">
      <div className="cx-course-sidebar__section">
        <h3 className="cx-course-sidebar__heading">Course Info</h3>
        <div className="cx-course-sidebar__info-row">
          <span className="cx-course-sidebar__label">Code</span>
          <span className="cx-course-sidebar__value">{courseCode}</span>
        </div>
        <div className="cx-course-sidebar__info-row">
          <span className="cx-course-sidebar__label">People</span>
          <span className="cx-course-sidebar__value">{peopleCount}</span>
        </div>
        <div className="cx-course-sidebar__info-row">
          <span className="cx-course-sidebar__label">Modules</span>
          <span className="cx-course-sidebar__value">{modulesCount}</span>
        </div>
        {assignmentsCount !== undefined && (
          <div className="cx-course-sidebar__info-row">
            <span className="cx-course-sidebar__label">Assignments</span>
            <span className="cx-course-sidebar__value">{assignmentsCount}</span>
          </div>
        )}
        <div className="cx-course-sidebar__info-row">
          <span className="cx-course-sidebar__label">Storage</span>
          <span className="cx-course-sidebar__value">{storageUsed}</span>
        </div>
      </div>

      <div className="cx-course-sidebar__section">
        <h3 className="cx-course-sidebar__heading">Quick Links</h3>
        <nav className="cx-course-sidebar__nav">
          <a href={`/courses/${courseCode}`} className="cx-course-sidebar__link">Home</a>
          <a href={`/courses/${courseCode}/assignments`} className="cx-course-sidebar__link">Assignments</a>
          <a href={`/courses/${courseCode}/discussions`} className="cx-course-sidebar__link">Discussions</a>
          <a href={`/courses/${courseCode}/files`} className="cx-course-sidebar__link">Files</a>
          <a href={`/courses/${courseCode}/grades`} className="cx-course-sidebar__link">Grades</a>
        </nav>
      </div>
    </div>
  )
}
