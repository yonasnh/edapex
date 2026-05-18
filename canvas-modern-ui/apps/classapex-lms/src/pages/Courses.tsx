import React, { useState, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Badge, BookIcon, CheckCircleIcon, BarChartIcon, GridIcon, ListIcon,
  ChevronLeftIcon, ChevronRightIcon, UserIcon, SearchIcon,
} from '@schoolapex/components';

import CourseCatalog from './CourseCatalog';
import CourseHome from './CourseHome';
import AssignmentList from './AssignmentList';
import AssignmentDetail from './AssignmentDetail';
import { useCourses } from '../hooks/useCanvasApi';
import './courses-page.css';

interface Course {
  id: string;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at?: string;
  end_at?: string;
  created_at: string;
  isActive: boolean;
  isPublished: boolean;
  total_students: number;
  teachers?: { id: string; display_name?: string }[];
  assignment_count: number;
  syllabus_body?: string;
  image_download_url?: string;
  public_description?: string;
}

const CoursesOverview: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const { data: courses, loading, error } = useCourses({ per_page: pageSize * 3 });

  const mockCourses: Course[] = [
    { id: '1', name: 'Computer Science 101', course_code: 'CS101', workflow_state: 'available', created_at: '2024-01-15T00:00:00Z', isActive: true, isPublished: true, total_students: 45, teachers: [{ id: 't1', display_name: 'Dr. Smith' }], assignment_count: 12, syllabus_body: 'Introduction to computer science fundamentals.' },
    { id: '2', name: 'Advanced Mathematics', course_code: 'MATH301', workflow_state: 'available', created_at: '2024-01-15T00:00:00Z', isActive: true, isPublished: true, total_students: 28, teachers: [{ id: 't1', display_name: 'Prof. Johnson' }], assignment_count: 8, syllabus_body: 'Advanced topics in calculus and linear algebra.' },
    { id: '3', name: 'English Literature', course_code: 'ENG201', workflow_state: 'available', created_at: '2024-01-15T00:00:00Z', isActive: true, isPublished: true, total_students: 32, teachers: [{ id: 't1', display_name: 'Dr. Williams' }], assignment_count: 6, syllabus_body: 'Survey of English literature.' },
    { id: '4', name: 'Physics Fundamentals', course_code: 'PHYS101', workflow_state: 'unpublished', created_at: '2024-01-10T00:00:00Z', isActive: false, isPublished: false, total_students: 0, teachers: [{ id: 't1', display_name: 'Dr. Brown' }], assignment_count: 0 },
    { id: '5', name: 'Data Structures', course_code: 'CS201', workflow_state: 'completed', created_at: '2023-07-01T00:00:00Z', isActive: false, isPublished: true, total_students: 38, teachers: [{ id: 't2', display_name: 'Prof. Davis' }], assignment_count: 15, syllabus_body: 'Advanced data structures and algorithm design.' },
  ];

  const effectiveCourses = courses && courses.length > 0 ? courses : mockCourses;

  const filteredCourses = useMemo(() => {
    if (!effectiveCourses.length) return [];
    let filtered = effectiveCourses;

    if (filterState !== 'all') {
      filtered = filtered.filter(course => {
        switch (filterState) {
          case 'active': return course.workflow_state === 'available';
          case 'inactive': return course.workflow_state !== 'available';
          case 'completed': return course.workflow_state === 'completed';
          default: return true;
        }
      });
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(q) ||
        course.course_code?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return (a.name || '').localeCompare(b.name || '');
        case 'code': return (a.course_code || '').localeCompare(b.course_code || '');
        case 'students': return (b.total_students || 0) - (a.total_students || 0);
        case 'created':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default: return 0;
      }
    });

    return filtered;
  }, [effectiveCourses, searchTerm, filterState, sortBy]);

  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);
  const displayCourses = paginatedCourses || [];

  const stats = useMemo(() => {
    if (!effectiveCourses.length) {
      return { total: 0, active: 0, students: 0, assignments: 0, avgStudents: 0 };
    }
    const activeCourses = effectiveCourses.filter(c => c.workflow_state === 'available');
    const totalStudents = effectiveCourses.reduce((sum, c) => sum + (c.total_students || 0), 0);
    const totalAssignments = effectiveCourses.reduce((sum, c) => sum + (c.assignment_count || 0), 0);
    return {
      total: effectiveCourses.length,
      active: activeCourses.length,
      students: totalStudents,
      assignments: totalAssignments,
      avgStudents: effectiveCourses.length > 0 ? Math.round(totalStudents / effectiveCourses.length) : 0,
    };
  }, [effectiveCourses]);

  const getStatusBadgeVariant = (state: string) => {
    switch (state) {
      case 'available': return 'success' as const;
      case 'completed': return 'primary' as const;
      default: return 'default' as const;
    }
  };

  const getStatusLabel = (state: string) => {
    switch (state) {
      case 'available': return 'Active';
      case 'completed': return 'Completed';
      case 'unpublished': return 'Draft';
      default: return 'Inactive';
    }
  };

  const showLoading = loading && (!courses || courses.length === 0);

  if (showLoading) {
    return (
      <div className="cx-page">
        <div className="cx-loading" role="status" aria-label="Loading courses">
          <div className="cx-loading__spinner" />
          <span className="cx-loading__text">Loading courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cx-courses">
      <div className="cx-courses__header">
        <div>
          <h1 className="cx-courses__title">Course Management</h1>
          <p className="cx-courses__subtitle">Manage and organize all your courses from one centralized dashboard.</p>
        </div>
        <div className="cx-courses__view-toggle" role="radiogroup" aria-label="View mode">
          <button
            className={clsx('cx-courses-view-btn', viewMode === 'cards' && 'cx-courses-view-btn--active')}
            onClick={() => setViewMode('cards')}
            role="radio"
            aria-checked={viewMode === 'cards'}
            aria-label="Card view"
          >
            <GridIcon size={16} /> Cards
          </button>
          <button
            className={clsx('cx-courses-view-btn', viewMode === 'table' && 'cx-courses-view-btn--active')}
            onClick={() => setViewMode('table')}
            role="radio"
            aria-checked={viewMode === 'table'}
            aria-label="Table view"
          >
            <ListIcon size={16} /> Table
          </button>
        </div>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Courses', value: stats.total, icon: <BookIcon /> },
          { label: 'Active Courses', value: stats.active, icon: <CheckCircleIcon /> },
          { label: 'Total Students', value: stats.students, icon: <UserIcon /> },
          { label: 'Avg/Course', value: stats.avgStudents, icon: <BarChartIcon /> },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon">{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="cx-notification cx-notification--warning" role="alert">
          <span className="cx-notification__title">Data not available</span>
          <span className="cx-notification__subtitle">Using sample data. Connect to GraphQL for real course data.</span>
        </div>
      )}

      <div className="cx-courses__controls">
        <div className="cx-courses__search">
          <span className="cx-courses__search-icon"><SearchIcon size={16} /></span>
          <input
            type="search"
            className="cx-courses__search-input"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="cx-courses__select"
          value={filterState}
          onChange={e => setFilterState(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Courses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="cx-courses__select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          aria-label="Sort by"
        >
          <option value="name">Name</option>
          <option value="code">Course Code</option>
          <option value="students">Student Count</option>
          <option value="created">Date Created</option>
        </select>
      </div>

      {displayCourses.length > 0 && (
        <p className="cx-courses__count">{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</p>
      )}

      {viewMode === 'cards' ? (
        displayCourses.length === 0 ? (
          <div className="cx-courses-empty">
            <span className="cx-courses-empty__icon"><BookIcon size={24} /></span>
            <p className="cx-courses-empty__message">No courses found</p>
            <p className="cx-courses-empty__hint">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="cx-courses-card-grid">
              {displayCourses.map(course => {
                const statusVariant = getStatusBadgeVariant(course.workflow_state);
                const statusLabel = getStatusLabel(course.workflow_state);
                const colorIndex = parseInt(course.id) % 8;

                return (
                  <div
                    key={course.id}
                    className="cx-courses-card"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/courses/${course.id}`); }}}
                    aria-label={`Course: ${course.name} (${course.course_code})`}
                  >
                    <div
                      className={`cx-courses-card__banner cx-courses-card__banner--c${colorIndex}`}
                      style={course.image_download_url ? {
                        background: `url(${course.image_download_url}) center/cover`,
                      } : undefined}
                    >
                      <div className="cx-courses-card__status">
                        <Badge variant={statusVariant} size="sm">{statusLabel}</Badge>
                      </div>
                    </div>
                    <div className="cx-courses-card__body">
                      <span className="cx-courses-card__code">{course.course_code}</span>
                      <h3 className="cx-courses-card__name">{course.name}</h3>
                      <div className="cx-courses-card__footer">
                        <span className="cx-courses-card__meta">
                          <UserIcon size={16} /> {course.total_students || 0}
                        </span>
                        <span className="cx-courses-card__meta">
                          <CheckCircleIcon size={16} /> {course.assignment_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="cx-pagination">
                <span className="cx-pagination__info">
                  {pageSize * (page - 1) + 1}&ndash;{Math.min(page * pageSize, filteredCourses.length)} of {filteredCourses.length}
                </span>
                <div className="cx-pagination__controls">
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon size={16} />
                  </button>
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )
      ) : (
        displayCourses.length === 0 ? (
          <div className="cx-courses-empty">
            <span className="cx-courses-empty__icon"><BookIcon size={24} /></span>
            <p className="cx-courses-empty__message">No courses found</p>
            <p className="cx-courses-empty__hint">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="cx-section" style={{ padding: 0 }}>
              <div className="cx-table-container" style={{ margin: 0, border: 'none' }}>
                <table className="cx-table">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Code</th>
                      <th>Status</th>
                      <th>Students</th>
                      <th>Assignments</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCourses.map(course => (
                      <tr key={course.id} className="cx-table__row" onClick={() => navigate(`/courses/${course.id}`)}>
                        <td className="cx-table__cell cx-table__cell--name">{course.name}</td>
                        <td className="cx-table__cell cx-table__cell--muted">{course.course_code}</td>
                        <td className="cx-table__cell">
                          <Badge variant={getStatusBadgeVariant(course.workflow_state)} size="sm">
                            {getStatusLabel(course.workflow_state)}
                          </Badge>
                        </td>
                        <td className="cx-table__cell">{course.total_students || 0}</td>
                        <td className="cx-table__cell">{course.assignment_count || 0}</td>
                        <td className="cx-table__cell cx-table__cell--muted">{new Date(course.created_at).toLocaleDateString()}</td>
                        <td className="cx-table__cell cx-table__cell--actions">
                          <button
                            className="cx-btn cx-btn--ghost cx-btn--sm"
                            onClick={e => { e.stopPropagation(); navigate(`/courses/${course.id}`); }}
                            title="View Course"
                          >
                            <SearchIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="cx-pagination">
                <span className="cx-pagination__info">
                  {pageSize * (page - 1) + 1}&ndash;{Math.min(page * pageSize, filteredCourses.length)} of {filteredCourses.length}
                </span>
                <div className="cx-pagination__controls">
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon size={16} />
                  </button>
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};

const CourseDetail: React.FC = () => {
  return <CourseHome />;
};

const Courses: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<CoursesOverview />} />
      <Route path="/catalog" element={<CourseCatalog />} />
      <Route path="/:courseId" element={<CourseDetail />} />
      <Route path="/:courseId/assignments" element={<AssignmentList />} />
      <Route path="/:courseId/assignments/:assignmentId" element={<AssignmentDetail />} />
    </Routes>
  );
};

export default Courses;
