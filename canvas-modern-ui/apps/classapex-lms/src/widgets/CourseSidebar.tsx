import React from 'react'
import { Link } from 'react-router-dom'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'

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
  courseName: _courseName,
  courseCode,
  peopleCount,
  modulesCount,
  assignmentsCount,
  storageUsed = '--',
  isLoading = false,
}: CourseSidebarProps) {
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const isObserver = role === 'observer'
  // Fetch course-level external tools (LTI Placements)
  const { data: externalTools } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/external_tools` : '',
    undefined,
    { enabled: !!courseId }
  );

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
          {/* Common to all roles */}
          <Link to={`/courses/${courseId}`} className="cx-course-sidebar__link">Home</Link>
          <Link to={`/courses/${courseId}/syllabus`} className="cx-course-sidebar__link">Syllabus</Link>
          <Link to={`/courses/${courseId}/modules`} className="cx-course-sidebar__link">Modules</Link>
          <Link to={`/courses/${courseId}/announcements`} className="cx-course-sidebar__link">Announcements</Link>
          <Link to="/discussions" className="cx-course-sidebar__link">Discussions</Link>
          <Link to="/files" className="cx-course-sidebar__link">Files</Link>

          {/* Student + Teacher + Admin (not Observer) */}
          {!isObserver && (
            <>
              <Link to={`/courses/${courseId}/assignments`} className="cx-course-sidebar__link">Assignments</Link>
              <Link to={`/courses/${courseId}/attendance`} className="cx-course-sidebar__link">Attendance</Link>
              <Link to={`/courses/${courseId}/conferences`} className="cx-course-sidebar__link">Conferences</Link>
              <Link to={`/courses/${courseId}/groups`} className="cx-course-sidebar__link">Groups</Link>
              <Link to={`/grades?courseId=${courseId}`} className="cx-course-sidebar__link">My Grades</Link>
            </>
          )}

          {/* Observer-only: Grades (linked student) */}
          {isObserver && (
            <Link to={`/grades?courseId=${courseId}`} className="cx-course-sidebar__link">Grades</Link>
          )}

          {/* Teacher + Admin only */}
          {isTeacher && (
            <>
              <Link to={`/courses/${courseId}/gradebook`} className="cx-course-sidebar__link">Gradebook</Link>
              <Link to={`/courses/${courseId}/gradebook/columns`} className="cx-course-sidebar__link">Custom Columns</Link>
              <Link to={`/courses/${courseId}/mastery`} className="cx-course-sidebar__link">Mastery</Link>
              <Link to={`/courses/${courseId}/people`} className="cx-course-sidebar__link">People</Link>
              <Link to={`/courses/${courseId}/waitlist`} className="cx-course-sidebar__link">Waitlist</Link>
              <Link to={`/courses/${courseId}/question-banks`} className="cx-course-sidebar__link">Question Banks</Link>
              <Link to={`/courses/${courseId}/late-policy`} className="cx-course-sidebar__link">Late Policy</Link>
              <Link to={`/courses/${courseId}/assignment-groups`} className="cx-course-sidebar__link">Assignment Groups</Link>
              <Link to={`/courses/${courseId}/sections`} className="cx-course-sidebar__link">Sections</Link>
              <Link to={`/courses/${courseId}/groups`} className="cx-course-sidebar__link">Course Groups</Link>
              <Link to={`/courses/${courseId}/import`} className="cx-course-sidebar__link">Import Content</Link>
            </>
          )}
        </nav>
      </div>

      {externalTools && externalTools.length > 0 && (
        <div className="cx-course-sidebar__section">
          <h3 className="cx-course-sidebar__heading">External Tools</h3>
          <nav className="cx-course-sidebar__nav">
            {externalTools.filter((tool) => tool.course_navigation).map((tool) => (
              <Link 
                key={tool.id} 
                to={`/courses/${courseId}/lti?tool_id=${tool.id}`} 
                className="cx-course-sidebar__link"
              >
                {tool.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
