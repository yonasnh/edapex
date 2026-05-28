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
import { useCanvasQuery } from '../hooks/useCanvasQuery';
import './courses-page.css';
import LogoLoader from '../components/LogoLoader'

// Canvas API course shape
interface Course {
  id: string | number;
  name: string;
  course_code: string;
  workflow_state: 'available' | 'completed' | 'unpublished' | string;
  start_at?: string;
  end_at?: string;
  created_at: string;
  total_students?: number;
  teachers?: { id: string; display_name?: string }[];
  assignment_count?: number;
  syllabus_body?: string;
  image_download_url?: string;
  course_image?: string;
  public_description?: string;
  term?: { name: string };
  course_progress?: {
    requirement_count: number;
    requirement_completed_count: number;
  };
}

interface CoursesOverviewProps {
  filterType?: 'all' | 'favorites' | 'recent';
}

const CoursesOverview: React.FC<CoursesOverviewProps> = ({ filterType = 'all' }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // ── Live Canvas API via TanStack-style useCanvasQuery ──
  const endpoint = filterType === 'favorites' ? '/api/v1/users/self/favorites/courses' : '/api/v1/courses';
  const { data: rawCourses, isLoading, isError } = useCanvasQuery<Course[]>(
    endpoint,
    {
      per_page: 100,
      include: ['term', 'total_students', 'teachers', 'course_image', 'course_progress'],
    } as any
  );

  const courses = rawCourses ?? [];
  const loading = isLoading;
  const error = isError;

  const filteredCourses = useMemo(() => {
    if (!courses.length) return [];
    let filtered = [...courses];

    if (filterType === 'recent') {
      try {
        const recentStr = localStorage.getItem('classapex_recent_courses');
        const recentIds: string[] = recentStr ? JSON.parse(recentStr) : [];
        if (recentIds.length > 0) {
          filtered = filtered.filter(course => recentIds.includes(String(course.id)));
          if (sortBy === 'name') {
            filtered.sort((a, b) => {
              const idxA = recentIds.indexOf(String(a.id));
              const idxB = recentIds.indexOf(String(b.id));
              return idxA - idxB;
            });
          }
        } else {
          // If no recent items tracked yet, fallback to sorting by created_at (newest first)
          if (sortBy === 'name') {
            filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          }
        }
      } catch (e) {
        // Fallback
        if (sortBy === 'name') {
          filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        }
      }
    } else if (filterState !== 'all') {
      filtered = filtered.filter(course => {
        switch (filterState) {
          case 'active': return course.workflow_state === 'available' || course.workflow_state === 'unpublished';
          case 'inactive': return course.workflow_state !== 'available' && course.workflow_state !== 'unpublished';
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

    if (sortBy !== 'name' || filterType !== 'recent') {
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
    }

    return filtered;
  }, [courses, searchTerm, filterState, sortBy, filterType]);

  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);
  const displayCourses = paginatedCourses || [];

  const stats = useMemo(() => {
    if (!courses.length) {
      return { total: 0, active: 0, students: 0, assignments: 0, avgStudents: 0 };
    }
    const activeCourses = courses.filter(c => c.workflow_state === 'available' || c.workflow_state === 'unpublished');
    const totalStudents = courses.reduce((sum, c) => sum + (c.total_students || 0), 0);
    const totalAssignments = courses.reduce((sum, c) => sum + (c.assignment_count || 0), 0);
    return {
      total: courses.length,
      active: activeCourses.length,
      students: totalStudents,
      assignments: totalAssignments,
      avgStudents: courses.length > 0 ? Math.round(totalStudents / courses.length) : 0,
    };
  }, [courses]);

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

  const showLoading = loading && courses.length === 0;

  if (showLoading) {
    return (
      <div className="cx-page" data-testid="loading-container">
        <LogoLoader text="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="cx-courses">
      <div className="cx-courses__header" style={{ justifyContent: 'flex-end', paddingTop: 0 }}>
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
          <span className="cx-notification__title">Canvas API unavailable</span>
          <span className="cx-notification__subtitle">Could not load courses from Canvas. Check that Canvas is running at localhost:3000 and your API token is valid.</span>
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
          <option value="name">{filterType === 'recent' ? 'Recently Accessed' : 'Name'}</option>
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
          <div className="cx-courses-empty" data-testid="empty-courses-state">
            <span className="cx-courses-empty__icon"><BookIcon size={24} /></span>
            <p className="cx-courses-empty__message">No courses found</p>
            <p className="cx-courses-empty__hint">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="cx-courses-card-grid" data-testid="courses-grid">
              {displayCourses.map(course => {
                const statusVariant = getStatusBadgeVariant(course.workflow_state);
                const statusLabel = getStatusLabel(course.workflow_state);
                // Canvas returns numeric IDs; coerce safely for color index
                const colorIndex = (typeof course.id === 'number' ? course.id : parseInt(String(course.id), 10) || 0) % 8;
                const bannerImage = course.course_image || course.image_download_url;

                return (
                  <div
                    key={course.id}
                    className="cx-courses-card"
                    data-testid="course-card"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/courses/${course.id}`); }}}
                    aria-label={`Course: ${course.name} (${course.course_code})`}
                  >
                    <div
                      className={`cx-courses-card__banner cx-courses-card__banner--c${colorIndex}`}
                      style={bannerImage ? {
                        background: `url(${bannerImage}) center/cover`,
                      } : undefined}
                    >
                      <div className="cx-courses-card__banner-overlay" />
                      
                      {!bannerImage && (
                        <div className="cx-courses-card__banner-deco">
                          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                        </div>
                      )}

                      <div className="cx-courses-card__banner-meta">
                        <span className="cx-courses-card__code-badge">{course.course_code}</span>
                        <Badge variant={statusVariant} size="sm">{statusLabel}</Badge>
                      </div>
                    </div>
                    <div className="cx-courses-card__body">
                      <h3 className="cx-courses-card__name" style={{ marginTop: 0 }}>{course.name}</h3>
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
          <div className="cx-courses-empty" data-testid="empty-courses-state">
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
      <Route path="/" element={<CoursesOverview filterType="all" />} />
      <Route path="/catalog" element={<CourseCatalog />} />
      <Route path="/favorites" element={<CoursesOverview filterType="favorites" />} />
      <Route path="/recent" element={<CoursesOverview filterType="recent" />} />
      <Route path="/:courseId" element={<CourseDetail />} />
      <Route path="/:courseId/assignments" element={<AssignmentList />} />
      <Route path="/:courseId/assignments/:assignmentId" element={<AssignmentDetail />} />
    </Routes>
  );
};

export default Courses;
