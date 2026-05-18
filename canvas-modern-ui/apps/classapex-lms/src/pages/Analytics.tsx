import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS, GET_COURSES, GET_ASSIGNMENTS } from '../graphql/queries';

function UsersSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 16v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"/><circle cx="8" cy="6" r="3"/><path d="M18 16v-1a3 3 0 00-2-2.87"/><path d="M13 3.13a3 3 0 010 5.75"/></svg>; }
function BookSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M4 7h12M4 11h12M4 15h12"/></svg>; }
function TaskSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 9l2 2 4-4"/></svg>; }
function CheckSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="7"/><path d="M6.5 10l2.5 2.5 4.5-5"/></svg>; }
function DownloadSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 11V3M4 7l4 4 4-4"/><path d="M2 13h12"/></svg>; }
function TrendUpSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 11l4-4 3 3 6-6"/><path d="M11 4h4v4"/></svg>; }

const Analytics: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');

  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_DASHBOARD_STATS);
  const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery(GET_COURSES, { variables: { limit: 100, offset: 0 } });
  const { data: assignmentsData, loading: assignmentsLoading, error: assignmentsError } = useQuery(GET_ASSIGNMENTS, { variables: { limit: 100, offset: 0 } });

  const mockStats = {
    dashboardStats: { totalUsers: 1250, totalCourses: 45, totalAssignments: 180, totalSubmissions: 2340, activeUsers: 342, activeCourses: 38 }
  };
  const mockCourses = {
    courses: [
      { id: '1', name: 'Introduction to Computer Science', courseCode: 'CS101', studentCount: 45, assignmentCount: 12, teacherCount: 2, isPublished: true, workflowState: 'available' },
      { id: '2', name: 'Advanced Mathematics', courseCode: 'MATH301', studentCount: 32, assignmentCount: 8, teacherCount: 1, isPublished: true, workflowState: 'available' }
    ]
  };
  const mockAssignments = {
    assignments: [{ id: '1', name: 'Programming Assignment 1', course: { id: '1', name: 'Introduction to Computer Science', courseCode: 'CS101' }, dueAt: new Date().toISOString(), pointsPossible: 100, submissionTypes: ['online_upload'], workflowState: 'published' }]
  };

  const loading = statsLoading || coursesLoading || assignmentsLoading;
  const stats = statsError || statsLoading ? mockStats.dashboardStats : statsData?.dashboardStats;
  const courses = coursesError || coursesLoading ? mockCourses.courses : coursesData?.courses;
  const assignments = assignmentsError || assignmentsLoading ? mockAssignments.assignments : assignmentsData?.assignments;

  const totalStudents = courses?.reduce((sum: number, course: any) => sum + (course.studentCount || 0), 0) || 0;
  const totalAssignmentsCount = assignments?.length || 0;
  const avgStudentsPerCourse = courses?.length ? Math.round(totalStudents / courses.length) : 0;

  if (loading) {
    return (
      <div className="cx-page">
        <div className="cx-loading">
          <div className="cx-loading__spinner" />
          <span className="cx-loading__text">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Analytics</h1>
          <p className="cx-page__subtitle">Data-driven insights for your learning platform</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="cx-select" value={selectedTimeRange} onChange={e => setSelectedTimeRange(e.target.value)}>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button className="cx-btn cx-btn--secondary cx-btn--sm"><DownloadSvg /> Export</button>
        </div>
      </div>

      {statsError && (
        <div className="cx-notification cx-notification--warning" style={{ marginBottom: 24 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a6 6 0 100 12A6 6 0 008 2z"/><path d="M8 5v3"/><circle cx="8" cy="10.5" r="0.5" fill="currentColor"/></svg>
          <div>
            <div className="cx-notification__title">Data not available</div>
            <div className="cx-notification__subtitle">Using sample data. Connect to GraphQL for real data.</div>
          </div>
        </div>
      )}

      <div className="cx-stats-grid">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: <UsersSvg /> },
          { label: 'Total Courses', value: stats?.totalCourses || 0, icon: <BookSvg /> },
          { label: 'Assignments', value: stats?.totalAssignments || 0, icon: <TaskSvg /> },
          { label: 'Submissions', value: stats?.totalSubmissions || 0, icon: <CheckSvg /> },
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

      <div className="cx-card" style={{ marginBottom: 16 }}>
        <div className="cx-card__header"><h3 className="cx-card__title"><TrendUpSvg /> Enrollment Trends</h3></div>
        <div className="cx-card__body">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 200, padding: '16px 8px', position: 'relative' }}>
            {[
              { month: 'Aug', students: 320 },
              { month: 'Sep', students: 380 },
              { month: 'Oct', students: 410 },
              { month: 'Nov', students: 395 },
              { month: 'Dec', students: 370 },
              { month: 'Jan', students: 450 },
              { month: 'Feb', students: 480 },
              { month: 'Mar', students: 470 },
              { month: 'Apr', students: 490 },
              { month: 'May', students: 460 },
              { month: 'Jun', students: 420 },
              { month: 'Jul', students: 350 },
            ].map((d, i) => {
              const maxStudents = 500
              const heightPct = (d.students / maxStudents) * 100
              const isIncreasing = i > 0 && d.students > [{ month: 'Aug', students: 320 },{ month: 'Sep', students: 380 },{ month: 'Oct', students: 410 },{ month: 'Nov', students: 395 },{ month: 'Dec', students: 370 },{ month: 'Jan', students: 450 },{ month: 'Feb', students: 480 },{ month: 'Mar', students: 470 },{ month: 'Apr', students: 490 },{ month: 'May', students: 460 },{ month: 'Jun', students: 420 },{ month: 'Jul', students: 350 }][i - 1].students
              return (
                <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.625rem', color: 'var(--cx-text-tertiary)' }}>{d.students}</span>
                  <div style={{ width: '100%', height: `${heightPct}%`, background: `var(--cx-color-primary)`, borderRadius: '3px 3px 0 0', opacity: 0.7, minHeight: 4, position: 'relative' }}>
                    {isIncreasing && <span style={{ position: 'absolute', top: -12, right: -4, fontSize: '0.625rem' }}>↑</span>}
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--cx-text-tertiary)' }}>{d.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="cx-stats-grid cx-stats-grid--2">
        <div className="cx-analytics-card">
          <h3 className="cx-analytics-card__title"><BookSvg /> Course Analytics</h3>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--cx-text-secondary)' }}>Total Students</span>
              <span style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{totalStudents}</span>
            </div>
            <div className="cx-progress-bar">
              <div className="cx-progress-bar__track">
                <div className="cx-progress-bar__fill" style={{ width: `${Math.min(100, totalStudents / 10)}%` }} />
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--cx-text-secondary)' }}>Avg. Students per Course</span>
              <span style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{avgStudentsPerCourse}</span>
            </div>
            <div className="cx-progress-bar">
              <div className="cx-progress-bar__track">
                <div className="cx-progress-bar__fill" style={{ width: `${Math.min(100, avgStudentsPerCourse)}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="cx-analytics-card">
          <h3 className="cx-analytics-card__title"><TaskSvg /> Assignment Analytics</h3>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--cx-text-secondary)' }}>Total Assignments</span>
              <span style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{totalAssignmentsCount}</span>
            </div>
            <div className="cx-progress-bar">
              <div className="cx-progress-bar__track">
                <div className="cx-progress-bar__fill" style={{ width: `${Math.min(100, totalAssignmentsCount * 5)}%` }} />
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--cx-text-secondary)' }}>Submission Rate</span>
              <span style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>78%</span>
            </div>
            <div className="cx-progress-bar">
              <div className="cx-progress-bar__track">
                <div className="cx-progress-bar__fill" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
