import React, { useState, useMemo } from 'react';
import clsx from 'clsx';

interface ReportData {
  id: string;
  name: string;
  description?: string;
  type: 'student_activity' | 'course_analytics' | 'grade_report' | 'attendance' | 'engagement' | 'custom';
  parameters: Record<string, any>;
  generatedAt?: string;
  generatedBy?: { id: string; name: string };
  fileUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  courseId?: string;
  courseName?: string;
  isScheduled: boolean;
  schedule?: { frequency: 'daily' | 'weekly' | 'monthly'; dayOfWeek?: number; dayOfMonth?: number; time: string };
  createdAt: string;
  size?: number;
  format?: 'pdf' | 'csv' | 'xlsx';
}

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>; }
function DownloadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10V2M4 7l3 3 3-3"/><path d="M2 11v1h10v-1"/></svg>; }
function EyeSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/><circle cx="7" cy="7" r="1.5"/></svg>; }
function RefreshSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7a6 6 0 0111-4M13 3v4H9"/><path d="M13 7a6 6 0 01-11 4M1 11V7h4"/></svg>; }
function CheckSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M4.5 7l2 2 3-3.5"/></svg>; }
function ClockSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3l2 2"/></svg>; }
function AlertSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2a5 5 0 100 10A5 5 0 007 2z"/><path d="M7 5v2.5"/><circle cx="7" cy="9.5" r="0.5" fill="currentColor"/></svg>; }
function ChartSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/></svg>; }
function ReportSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V7l-4-5z"/><path d="M12 2v5h5"/><path d="M7 12h6M7 9h6M7 15h3"/></svg>; }
function CalendarSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="3.5" width="15" height="14" rx="2"/><path d="M2.5 6.5h15"/><path d="M6 2v3M14 2v3"/></svg>; }
function UserSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 12v-1a2.5 2.5 0 00-2.5-2.5h-3A2.5 2.5 0 003 11v1"/><circle cx="7" cy="4" r="2.5"/></svg>; }
function BookSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2.5h10v9H2z"/><path d="M5 2.5v9"/></svg>; }
function TaskSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1" width="10" height="12" rx="1"/><path d="M5 7l2 2 3-4"/></svg>; }
function AnalyticsSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 13l4-5 3 2 5-7"/></svg>; }
function DocumentSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V4l-3-3z"/><path d="M9 1v3h3"/></svg>; }

const ReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [activeTab, setActiveTab] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const [newReport, setNewReport] = useState({
    name: '', description: '', type: 'student_activity', courseId: '',
    dateRange: 'last_30_days', format: 'pdf', includeDetails: true, isScheduled: false, frequency: 'weekly', scheduleTime: '09:00'
  });

  const mockReports: ReportData[] = [
    { id: '1', name: 'Student Activity Report - CS101', description: 'Comprehensive activity report for CS101 students', type: 'student_activity', parameters: {}, generatedAt: '2024-01-15T10:30:00Z', generatedBy: { id: 't1', name: 'Dr. Sarah Wilson' }, fileUrl: '/reports/cs101.pdf', status: 'completed', courseId: 'cs101', courseName: 'Computer Science 101', isScheduled: false, createdAt: '2024-01-15T10:25:00Z', size: 2048576, format: 'pdf' },
    { id: '2', name: 'Grade Distribution Analysis', description: 'Analysis of grade distribution across all courses', type: 'grade_report', parameters: {}, generatedAt: '2024-01-14T16:45:00Z', generatedBy: { id: 'a1', name: 'Admin User' }, fileUrl: '/reports/grades.xlsx', status: 'completed', isScheduled: true, schedule: { frequency: 'monthly', dayOfMonth: 1, time: '08:00' }, createdAt: '2024-01-14T16:40:00Z', size: 1024000, format: 'xlsx' },
    { id: '3', name: 'Course Engagement Metrics', description: 'Student engagement metrics for Advanced Mathematics', type: 'engagement', parameters: {}, status: 'generating', courseId: 'math301', courseName: 'Advanced Mathematics', isScheduled: false, createdAt: '2024-01-15T14:20:00Z' },
    { id: '4', name: 'Attendance Summary', description: 'Weekly attendance summary', type: 'attendance', parameters: {}, generatedAt: '2024-01-12T09:15:00Z', generatedBy: { id: 'ta1', name: 'Mike Chen' }, fileUrl: '/reports/attendance.csv', status: 'completed', isScheduled: true, schedule: { frequency: 'weekly', dayOfWeek: 1, time: '09:00' }, createdAt: '2024-01-12T09:10:00Z', size: 512000, format: 'csv' },
    { id: '5', name: 'Custom Analytics Report', description: 'Custom report for learning outcomes analysis', type: 'custom', parameters: {}, status: 'failed', isScheduled: false, createdAt: '2024-01-11T11:30:00Z' },
  ];

  const mockCourses = [
    { id: 'cs101', name: 'Computer Science 101' },
    { id: 'math301', name: 'Advanced Mathematics' },
    { id: 'eng201', name: 'English Literature' },
  ];

  const filteredReports = useMemo(() => {
    let filtered = mockReports;
    if (searchTerm) filtered = filtered.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterType !== 'all') filtered = filtered.filter(r => r.type === filterType);
    if (filterStatus !== 'all') filtered = filtered.filter(r => r.status === filterStatus);
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return (b.size || 0) - (a.size || 0);
        default: return 0;
      }
    });
    return filtered;
  }, [searchTerm, filterType, filterStatus, sortBy]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    total: mockReports.length,
    completed: mockReports.filter(r => r.status === 'completed').length,
    scheduled: mockReports.filter(r => r.isScheduled).length,
    failed: mockReports.filter(r => r.status === 'failed').length,
  }), []);

  const tabs = ['All Reports', 'Scheduled Reports'];

  const getTypeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const getStatusColor = (s: string) => s === 'completed' ? 'cx-badge--success' : s === 'generating' ? 'cx-badge--info' : s === 'failed' ? 'cx-badge--danger' : 'cx-badge--neutral';
  const getTypeIcon = (t: string) => {
    switch (t) { case 'student_activity': return <UserSvg />; case 'course_analytics': return <BookSvg />; case 'grade_report': return <TaskSvg />; case 'attendance': return <CalendarSvg />; case 'engagement': return <AnalyticsSvg />; default: return <DocumentSvg />; }
  };
  const formatSize = (b?: number) => b ? `${(b / 1024 / 1024).toFixed(1)} MB` : '—';
  const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString() : '—';

  const handleClearFilters = () => { setSearchTerm(''); setFilterType('all'); setFilterStatus('all'); setPage(1); };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Reports</h1>
          <p className="cx-page__subtitle">Generate and manage reports on activity, analytics, and performance</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowCreateModal(true)}><PlusSvg /> New Report</button>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Reports', value: stats.total, icon: <ReportSvg /> },
          { label: 'Completed', value: stats.completed, icon: <CheckSvg /> },
          { label: 'Scheduled', value: stats.scheduled, icon: <CalendarSvg /> },
          { label: 'Failed', value: stats.failed, icon: <AlertSvg />, trend: stats.failed > 0 ? 'decrease' as const : 'neutral' as const },
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

      <div className="cx-tabs">
        {tabs.map((tab, i) => (
          <button key={i} className={clsx('cx-tab', activeTab === i && 'cx-tab--active')} onClick={() => { setActiveTab(i); setPage(1); }}>{tab}</button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="cx-section">
          <div className="cx-toolbar">
            <div className="cx-search">
              <SearchSvg />
              <input type="search" className="cx-search__input" placeholder="Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="cx-select" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
              <option value="all">All Types</option>
              {['student_activity', 'course_analytics', 'grade_report', 'attendance', 'engagement', 'custom'].map(t => <option key={t} value={t}>{getTypeLabel(t)}</option>)}
            </select>
            <select className="cx-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="all">All Status</option>
              {['completed', 'generating', 'pending', 'failed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select className="cx-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
              <option value="created">Date Created</option>
              <option value="name">Name</option>
              <option value="size">File Size</option>
            </select>
          </div>

          {paginatedReports.length === 0 ? (
            <div className="cx-empty">
              <ReportSvg />
              <h3>No reports found</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="cx-btn cx-btn--secondary" onClick={handleClearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="cx-table-container">
              <table className="cx-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Course</th>
                    <th>Size</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.map(report => (
                    <tr key={report.id} className="cx-table__row" onClick={() => { setSelectedReport(report); setShowReportModal(true); }}>
                      <td className="cx-table__cell cx-table__cell--name">{report.name}</td>
                      <td className="cx-table__cell cx-table__cell--muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {getTypeIcon(report.type)} {getTypeLabel(report.type)}
                      </td>
                      <td className="cx-table__cell"><span className={clsx('cx-badge', getStatusColor(report.status))}>{report.status}</span></td>
                      <td className="cx-table__cell cx-table__cell--muted">{report.courseName || 'System-wide'}</td>
                      <td className="cx-table__cell cx-table__cell--muted">{formatSize(report.size)}</td>
                      <td className="cx-table__cell cx-table__cell--actions">
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={e => { e.stopPropagation(); setSelectedReport(report); setShowReportModal(true); }}><EyeSvg /></button>
                        {report.status === 'completed' && <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={e => { e.stopPropagation(); }}><DownloadSvg /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '8px 16px', fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)', borderTop: '1px solid var(--cx-border-subtle)' }}>
                {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="cx-pagination" style={{ marginTop: 16 }}>
              <span className="cx-pagination__info">Page {page} of {totalPages}</span>
              <div className="cx-pagination__controls">
                <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3L5 7l4 4"/></svg>
                </button>
                <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div className="cx-section">
          {mockReports.filter(r => r.isScheduled).length === 0 ? (
            <div className="cx-empty">
              <CalendarSvg />
              <h3>No scheduled reports</h3>
              <p>Set up recurring reports for automatic generation.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mockReports.filter(r => r.isScheduled).map(report => (
                <div key={report.id} className="cx-card">
                  <div className="cx-card__header">
                    <h3 className="cx-card__title">{report.name}</h3>
                    <span className="cx-badge cx-badge--info">{report.schedule?.frequency}</span>
                  </div>
                  <div className="cx-card__body">
                    {report.description && <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 12 }}>{report.description}</p>}
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
                      <span>Frequency: <strong>{report.schedule?.frequency}</strong></span>
                      <span>Time: <strong>{report.schedule?.time}</strong></span>
                      {report.schedule?.dayOfWeek != null && <span>Day: <strong>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][report.schedule.dayOfWeek]}</strong></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Generate New Report</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCreateModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Report Name</label>
                  <input type="text" className="cx-search__input" style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)' }}
                    placeholder="Enter report name" value={newReport.name} onChange={e => setNewReport({...newReport, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea className="cx-search__input" style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', resize: 'vertical', fontFamily: 'inherit' }}
                    rows={3} placeholder="Describe the purpose" value={newReport.description} onChange={e => setNewReport({...newReport, description: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Report Type</label>
                    <select className="cx-select" style={{ width: '100%' }} value={newReport.type} onChange={e => setNewReport({...newReport, type: e.target.value})}>
                      {['student_activity', 'course_analytics', 'grade_report', 'attendance', 'engagement', 'custom'].map(t => <option key={t} value={t}>{getTypeLabel(t)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Course</label>
                    <select className="cx-select" style={{ width: '100%' }} value={newReport.courseId} onChange={e => setNewReport({...newReport, courseId: e.target.value})}>
                      <option value="">System-wide</option>
                      {mockCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Date Range</label>
                    <select className="cx-select" style={{ width: '100%' }} value={newReport.dateRange} onChange={e => setNewReport({...newReport, dateRange: e.target.value})}>
                      <option value="last_7_days">Last 7 days</option>
                      <option value="last_30_days">Last 30 days</option>
                      <option value="last_semester">Last semester</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Format</label>
                    <select className="cx-select" style={{ width: '100%' }} value={newReport.format} onChange={e => setNewReport({...newReport, format: e.target.value})}>
                      <option value="pdf">PDF</option>
                      <option value="csv">CSV</option>
                      <option value="xlsx">Excel (XLSX)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <label className="cx-toggle">
                    <input type="checkbox" checked={newReport.includeDetails} onChange={e => setNewReport({...newReport, includeDetails: e.target.checked})} />
                    <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    <span className="cx-toggle__label">Include detailed breakdown</span>
                  </label>
                  <label className="cx-toggle">
                    <input type="checkbox" checked={newReport.isScheduled} onChange={e => setNewReport({...newReport, isScheduled: e.target.checked})} />
                    <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    <span className="cx-toggle__label">Schedule recurring</span>
                  </label>
                </div>
                {newReport.isScheduled && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Frequency</label>
                      <select className="cx-select" style={{ width: '100%' }} value={newReport.frequency} onChange={e => setNewReport({...newReport, frequency: e.target.value})}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Time</label>
                      <input type="time" className="cx-search__input" style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)' }}
                        value={newReport.scheduleTime} onChange={e => setNewReport({...newReport, scheduleTime: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => { setShowCreateModal(false); }}>Generate Report</button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && selectedReport && (
        <div className="cx-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{selectedReport.name}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowReportModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span className={clsx('cx-badge', getStatusColor(selectedReport.status))}>{selectedReport.status}</span>
                <span className="cx-badge cx-badge--neutral">{getTypeLabel(selectedReport.type)}</span>
              </div>
              {selectedReport.description && <p style={{ color: 'var(--cx-text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{selectedReport.description}</p>}
              <div className="cx-detail-grid">
                <div><span className="cx-detail-label">Created</span><span>{formatDate(selectedReport.createdAt)}</span></div>
                {selectedReport.generatedAt && <div><span className="cx-detail-label">Generated</span><span>{formatDate(selectedReport.generatedAt)}</span></div>}
                {selectedReport.generatedBy && <div><span className="cx-detail-label">Generated by</span><span>{selectedReport.generatedBy.name}</span></div>}
                {selectedReport.courseName && <div><span className="cx-detail-label">Course</span><span>{selectedReport.courseName}</span></div>}
                {selectedReport.size && <div><span className="cx-detail-label">File size</span><span>{formatSize(selectedReport.size)}</span></div>}
                {selectedReport.format && <div><span className="cx-detail-label">Format</span><span>{selectedReport.format.toUpperCase()}</span></div>}
              </div>
              {selectedReport.isScheduled && selectedReport.schedule && (
                <div className="cx-detail-section">
                  <h4>Schedule</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>Runs {selectedReport.schedule.frequency} at {selectedReport.schedule.time}</p>
                </div>
              )}
            </div>
            <div className="cx-modal__footer">
              {selectedReport.status === 'completed' && <button className="cx-btn cx-btn--primary cx-btn--sm"><DownloadSvg /> Download</button>}
              {selectedReport.status === 'failed' && <button className="cx-btn cx-btn--secondary cx-btn--sm"><RefreshSvg /> Regenerate</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
