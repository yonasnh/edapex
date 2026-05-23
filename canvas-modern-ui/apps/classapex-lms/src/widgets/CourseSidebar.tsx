import React from 'react'
import { Link } from 'react-router-dom'

interface CourseSidebarProps {
  courseId: string | number
  courseName: string
  courseCode: string
  peopleCount: number
  modulesCount: number
  assignmentsCount?: number
  storageUsed?: string
  isLoading?: boolean
}

export function CourseSidebar({
  courseId,
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
          <Link to={`/courses/${courseId}`} className="cx-course-sidebar__link">Home</Link>
          <Link to={`/courses/${courseId}/assignments`} className="cx-course-sidebar__link">Assignments</Link>
          <Link to="/discussions" className="cx-course-sidebar__link">Discussions</Link>
          <Link to="/files" className="cx-course-sidebar__link">Files</Link>
          <Link to={`/grades?courseId=${courseId}`} className="cx-course-sidebar__link">Grades</Link>
        </nav>
      </div>
    </div>
  )
}
