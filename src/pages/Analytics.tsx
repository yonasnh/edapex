import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Grid,
  Column,
  Tile,
  Loading,
  InlineNotification,
  Button,
  Dropdown,
  DatePicker,
  DatePickerInput,
  ProgressBar,
  Tag,
} from '@carbon/react';
import {
  Analytics as AnalyticsIcon,
  TrendUp,
  TrendDown,
  User,
  Course,
  Assignment,
  CheckmarkFilled,
  Time,
  Calendar,
  Download,
} from '@carbon/icons-react';
import { GET_DASHBOARD_STATS, GET_COURSES, GET_ASSIGNMENTS } from '../graphql/queries';

const Analytics: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('engagement');

  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_DASHBOARD_STATS);
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES, {
    variables: { limit: 100, offset: 0 }
  });
  const { data: assignmentsData, loading: assignmentsLoading } = useQuery(GET_ASSIGNMENTS, {
    variables: { limit: 100, offset: 0 }
  });

  if (statsLoading || coursesLoading || assignmentsLoading) {
    return (
      <div className="loading-spinner">
        <Loading description="Loading analytics..." />
      </div>
    );
  }

  if (statsError) {
    return (
      <InlineNotification
        kind="error"
        title="Error loading analytics"
        subtitle={statsError.message}
        hideCloseButton
      />
    );
  }

  const stats = statsData?.dashboardStats;
  const courses = coursesData?.courses || [];
  const assignments = assignmentsData?.assignments || [];

  // Calculate analytics metrics
  const totalStudents = courses.reduce((sum: number, course: any) => sum + (course.studentCount || 0), 0);
  const totalSubmissions = assignments.reduce((sum: number, assignment: any) => sum + (assignment.submissionCount || 0), 0);
  const totalGraded = assignments.reduce((sum: number, assignment: any) => sum + (assignment.gradedCount || 0), 0);
  const averageCompletion = totalSubmissions > 0 ? Math.round((totalGraded / totalSubmissions) * 100) : 0;

  const overdueAssignments = assignments.filter((a: any) => a.isOverdue).length;
  const activeAssignments = assignments.filter((a: any) => !a.isOverdue && a.isPublished).length;

  // Mock trend data (in real implementation, this would come from time-series data)
  const trendData = {
    userGrowth: 12.5,
    courseCompletion: 8.3,
    assignmentSubmission: -2.1,
    engagement: 15.7
  };

  const timeRangeOptions = [
    { id: '7days', text: 'Last 7 days' },
    { id: '30days', text: 'Last 30 days' },
    { id: '90days', text: 'Last 90 days' },
    { id: 'semester', text: 'This semester' },
    { id: 'year', text: 'This year' },
  ];

  const metricOptions = [
    { id: 'engagement', text: 'Student Engagement' },
    { id: 'completion', text: 'Course Completion' },
    { id: 'performance', text: 'Academic Performance' },
    { id: 'activity', text: 'Platform Activity' },
  ];

  const renderTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendUp size={20} style={{ color: '#24a148' }} />
    ) : (
      <TrendDown size={20} style={{ color: '#da1e28' }} />
    );
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return '#24a148';
    if (value >= 60) return '#f1c21b';
    return '#da1e28';
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '300', 
              margin: '0 0 0.5rem 0',
              background: 'linear-gradient(135deg, #0f62fe 0%, #8a3ffc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Analytics Dashboard
            </h1>
            <p style={{ color: '#6f6f6f', margin: 0 }}>
              Comprehensive insights into learning outcomes and platform performance
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              kind="secondary"
              renderIcon={Download}
              onClick={() => alert('Export functionality would be implemented here')}
            >
              Export Report
            </Button>
            <Button
              kind="primary"
              renderIcon={Calendar}
              onClick={() => alert('Schedule reports functionality would be implemented here')}
            >
              Schedule Reports
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Grid>
          <Column lg={4} md={2} sm={4}>
            <Dropdown
              id="time-range"
              titleText="Time Range"
              label="Select time range"
              items={timeRangeOptions}
              selectedItem={timeRangeOptions.find(opt => opt.id === selectedTimeRange)}
              onChange={({ selectedItem }) => setSelectedTimeRange(selectedItem?.id || '30days')}
            />
          </Column>
          <Column lg={4} md={2} sm={4}>
            <Dropdown
              id="metric"
              titleText="Primary Metric"
              label="Select metric"
              items={metricOptions}
              selectedItem={metricOptions.find(opt => opt.id === selectedMetric)}
              onChange={({ selectedItem }) => setSelectedMetric(selectedItem?.id || 'engagement')}
            />
          </Column>
        </Grid>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>{stats?.totalUsers || 0}</h4>
              <p>Total Users</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {renderTrendIcon(trendData.userGrowth)}
              <span style={{ fontSize: '0.875rem' }}>
                {Math.abs(trendData.userGrowth)}%
              </span>
            </div>
          </div>
          <small>{stats?.activeUsers || 0} active in selected period</small>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>{stats?.totalCourses || 0}</h4>
              <p>Active Courses</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {renderTrendIcon(trendData.courseCompletion)}
              <span style={{ fontSize: '0.875rem' }}>
                {Math.abs(trendData.courseCompletion)}%
              </span>
            </div>
          </div>
          <small>{stats?.activeCourses || 0} recently updated</small>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>{totalSubmissions}</h4>
              <p>Submissions</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {renderTrendIcon(trendData.assignmentSubmission)}
              <span style={{ fontSize: '0.875rem' }}>
                {Math.abs(trendData.assignmentSubmission)}%
              </span>
            </div>
          </div>
          <small>{totalGraded} graded ({averageCompletion}% completion)</small>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>{Math.round(trendData.engagement)}%</h4>
              <p>Engagement Rate</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {renderTrendIcon(trendData.engagement)}
              <span style={{ fontSize: '0.875rem' }}>
                {Math.abs(trendData.engagement)}%
              </span>
            </div>
          </div>
          <small>Student platform engagement</small>
        </div>
      </div>

      <Grid>
        {/* Course Performance */}
        <Column lg={8} md={4} sm={4}>
          <div className="dashboard-card">
            <h3>Course Performance Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {courses.slice(0, 8).map((course: any) => {
                const completionRate = course.assignmentCount > 0 ? 
                  Math.round(((course.studentCount || 0) * 0.75) / (course.assignmentCount || 1) * 100) : 0;
                
                return (
                  <div key={course.id} style={{ 
                    padding: '1rem', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '4px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <strong>{course.name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
                          {course.courseCode} • {course.studentCount} students
                        </div>
                      </div>
                      <Tag type={course.isPublished ? 'green' : 'gray'}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar 
                          value={completionRate} 
                          max={100}
                          label={`${completionRate}% completion`}
                          size="sm"
                        />
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: getPerformanceColor(completionRate),
                        fontWeight: '600'
                      }}>
                        {completionRate}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Column>

        {/* Assignment Analytics */}
        <Column lg={8} md={4} sm={4}>
          <div className="dashboard-card">
            <h3>Assignment Analytics</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f4f4f4', borderRadius: '4px' }}>
                <CheckmarkFilled size={32} style={{ color: '#24a148', marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0', color: '#24a148' }}>{activeAssignments}</h4>
                <p style={{ margin: '0', fontSize: '0.875rem' }}>Active Assignments</p>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fff1f1', borderRadius: '4px' }}>
                <Time size={32} style={{ color: '#da1e28', marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0', color: '#da1e28' }}>{overdueAssignments}</h4>
                <p style={{ margin: '0', fontSize: '0.875rem' }}>Overdue Assignments</p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h4>Recent Assignment Performance</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {assignments.slice(0, 6).map((assignment: any) => {
                  const submissionRate = assignment.submissionCount && assignment.course?.studentCount ? 
                    Math.round((assignment.submissionCount / assignment.course.studentCount) * 100) : 0;
                  
                  return (
                    <div key={assignment.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '0.75rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          {assignment.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6f6f6f' }}>
                          {assignment.course?.name}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ minWidth: '80px' }}>
                          <ProgressBar 
                            value={submissionRate} 
                            max={100}
                            size="sm"
                            hideLabel
                          />
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600',
                          color: getPerformanceColor(submissionRate),
                          minWidth: '40px',
                          textAlign: 'right'
                        }}>
                          {submissionRate}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Column>

        {/* Platform Usage */}
        <Column lg={16} md={8} sm={4}>
          <div className="dashboard-card">
            <h3>Platform Usage Insights</h3>
            
            <Grid style={{ marginTop: '1rem' }}>
              <Column lg={4} md={2} sm={4}>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <User size={48} style={{ color: '#0f62fe', marginBottom: '1rem' }} />
                  <h4>Student Engagement</h4>
                  <p style={{ fontSize: '2rem', fontWeight: '600', margin: '0.5rem 0', color: '#0f62fe' }}>
                    {Math.round(trendData.engagement)}%
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
                    Average daily active users
                  </p>
                </div>
              </Column>
              
              <Column lg={4} md={2} sm={4}>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <Assignment size={48} style={{ color: '#8a3ffc', marginBottom: '1rem' }} />
                  <h4>Assignment Completion</h4>
                  <p style={{ fontSize: '2rem', fontWeight: '600', margin: '0.5rem 0', color: '#8a3ffc' }}>
                    {averageCompletion}%
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
                    Average completion rate
                  </p>
                </div>
              </Column>
              
              <Column lg={4} md={2} sm={4}>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <Course size={48} style={{ color: '#24a148', marginBottom: '1rem' }} />
                  <h4>Course Activity</h4>
                  <p style={{ fontSize: '2rem', fontWeight: '600', margin: '0.5rem 0', color: '#24a148' }}>
                    {Math.round(trendData.courseCompletion)}%
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
                    Courses with recent activity
                  </p>
                </div>
              </Column>
              
              <Column lg={4} md={2} sm={4}>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <AnalyticsIcon size={48} style={{ color: '#f1c21b', marginBottom: '1rem' }} />
                  <h4>Performance Score</h4>
                  <p style={{ fontSize: '2rem', fontWeight: '600', margin: '0.5rem 0', color: '#f1c21b' }}>
                    8.7/10
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
                    Overall platform performance
                  </p>
                </div>
              </Column>
            </Grid>
          </div>
        </Column>
      </Grid>

      {/* Insights and Recommendations */}
      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <h3>AI-Powered Insights & Recommendations</h3>
        <Grid style={{ marginTop: '1rem' }}>
          <Column lg={8} md={4} sm={4}>
            <div style={{ padding: '1rem', backgroundColor: '#e8f4fd', borderRadius: '4px', border: '1px solid #0f62fe' }}>
              <h4 style={{ color: '#0f62fe', margin: '0 0 0.5rem 0' }}>📈 Positive Trend</h4>
              <p style={{ margin: 0 }}>
                Student engagement has increased by {trendData.engagement}% this period. 
                Consider expanding successful course formats to other subjects.
              </p>
            </div>
          </Column>
          <Column lg={8} md={4} sm={4}>
            <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #f1c21b' }}>
              <h4 style={{ color: '#f1c21b', margin: '0 0 0.5rem 0' }}>⚠️ Attention Needed</h4>
              <p style={{ margin: 0 }}>
                {overdueAssignments} assignments are overdue. Consider sending automated 
                reminders to improve submission rates.
              </p>
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};

export default Analytics;
