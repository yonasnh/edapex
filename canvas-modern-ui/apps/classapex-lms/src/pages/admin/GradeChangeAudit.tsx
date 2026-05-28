import React, { useState } from 'react';
import { useCanvasQuery } from '../../hooks/useCanvasQuery';
import VirtualList from '../../widgets/VirtualList';
import LogoLoader from '../../components/LogoLoader'

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function ActivitySvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10h4l3-6 4 12 3-6h4"/></svg>; }

interface GradeChange {
  id: string;
  created_at: string;
  event_type: string;
  excused_before: boolean;
  excused_after: boolean;
  grade_before: string;
  grade_after: string;
  grader_id: number;
  student_id: number;
  assignment_id: number;
  course_id: number;
}

export default function GradeChangeAuditPage() {
  const [courseId, setCourseId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [graderId, setGraderId] = useState('');
  const [eventType, setEventType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const queryParams: Record<string, string> = {};
  if (courseId) queryParams.course_id = courseId;
  if (studentId) queryParams.student_id = studentId;
  if (graderId) queryParams.grader_id = graderId;
  if (eventType) queryParams.event_type = eventType;
  if (startDate) queryParams.start_time = new Date(startDate).toISOString();
  if (endDate) queryParams.end_time = new Date(endDate).toISOString();

  const { data: eventsData, isLoading } = useCanvasQuery<any>(
    '/api/v1/audit/grade_change',
    queryParams as any
  );

  const events: GradeChange[] = eventsData?.events || [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  };

  const handleExportCSV = () => {
    if (events.length === 0) return;
    const header = 'Date,Course ID,Assignment ID,Student ID,Grader ID,Event Type,Previous Grade,New Grade\n';
    const rows = events.map(e =>
      `${e.created_at},${e.course_id},${e.assignment_id},${e.student_id},${e.grader_id},${e.event_type},${e.grade_before || '—'},${e.grade_after || '—'}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grade-change-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Grade Change Audit</h1>
          <p className="cx-page__subtitle">Review a log of all grade changes across the institution.</p>
        </div>
      </div>

      <div className="cx-toolbar" style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div className="cx-search">
          <SearchSvg />
          <input type="text" className="cx-search__input" placeholder="Course ID" value={courseId} onChange={e => setCourseId(e.target.value)} />
        </div>
        <div className="cx-search">
          <SearchSvg />
          <input type="text" className="cx-search__input" placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
        </div>
        <div className="cx-search">
          <SearchSvg />
          <input type="text" className="cx-search__input" placeholder="Grader ID" value={graderId} onChange={e => setGraderId(e.target.value)} />
        </div>
        <select className="cx-select" style={{ height: 36 }} value={eventType} onChange={e => setEventType(e.target.value)}>
          <option value="">All Events</option>
          <option value="grade_change">Grade Change</option>
          <option value="excused">Excused</option>
          <option value="override">Override</option>
        </select>
        <input type="date" className="cx-input" style={{ height: 36, width: 140 }} value={startDate} onChange={e => setStartDate(e.target.value)} title="Start date" />
        <input type="date" className="cx-input" style={{ height: 36, width: 140 }} value={endDate} onChange={e => setEndDate(e.target.value)} title="End date" />
        <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleExportCSV} disabled={events.length === 0}>
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <LogoLoader />
      ) : events.length === 0 ? (
        <div className="cx-empty">
          <ActivitySvg />
          <h3>No Grade Changes Found</h3>
          <p>Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="cx-table-container" style={{ height: 600 }}>
          <div className="cx-table" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: '2px solid var(--cx-border-subtle)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--cx-text-tertiary)', padding: '8px 16px', flexShrink: 0 }}>
              <div style={{ flex: 1 }}>Date</div>
              <div style={{ flex: 1 }}>Course / Assignment</div>
              <div style={{ flex: 1 }}>Student ID</div>
              <div style={{ flex: 1 }}>Grader ID</div>
              <div style={{ flex: 1 }}>Previous Grade</div>
              <div style={{ flex: 1 }}>New Grade</div>
            </div>
            <VirtualList items={events} itemHeight={60} style={{ flex: 1 }}>
              {(event) => (
                <div key={event.id} className="cx-table__row" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 60, borderBottom: '1px solid var(--cx-border-subtle)' }}>
                  <div className="cx-table__cell cx-table__cell--muted" style={{ flex: 1 }}>
                    {formatDate(event.created_at)}
                  </div>
                  <div className="cx-table__cell" style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{event.course_id}</div>
                    <div className="cx-table__cell--muted" style={{ fontSize: '0.75rem' }}>Assign: {event.assignment_id}</div>
                  </div>
                  <div className="cx-table__cell cx-table__cell--mono" style={{ flex: 1 }}>{event.student_id}</div>
                  <div className="cx-table__cell cx-table__cell--mono" style={{ flex: 1 }}>{event.grader_id}</div>
                  <div className="cx-table__cell" style={{ flex: 1 }}>
                    {event.excused_before ? 'Excused' : event.grade_before || '—'}
                  </div>
                  <div className="cx-table__cell" style={{ flex: 1, fontWeight: 600, color: 'var(--cx-color-primary)' }}>
                    {event.excused_after ? 'Excused' : event.grade_after || '—'}
                  </div>
                </div>
              )}
            </VirtualList>
          </div>
        </div>
      )}
    </div>
  );
}
