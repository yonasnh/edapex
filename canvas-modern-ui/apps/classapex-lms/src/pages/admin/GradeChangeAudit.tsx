import React, { useState } from 'react';
import { useCanvasQuery } from '../../hooks/useCanvasQuery';
import VirtualList from '../../widgets/VirtualList';

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
  
  const queryParams: Record<string, string> = {};
  if (courseId) queryParams.course_id = courseId;
  if (studentId) queryParams.student_id = studentId;
  if (graderId) queryParams.grader_id = graderId;

  const { data: eventsData, isLoading } = useCanvasQuery<any>(
    '/api/v1/audit/grade_change',
    queryParams as any
  );

  const events: GradeChange[] = eventsData?.events || [];

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Grade Change Audit</h1>
          <p className="cx-page__subtitle">Review a log of all grade changes across the institution.</p>
        </div>
      </div>

      <div className="cx-toolbar" style={{ marginBottom: 24 }}>
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
      </div>

      {isLoading ? (
        <div className="cx-loading"><div className="cx-loading__spinner" /></div>
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
                    {new Date(event.created_at).toLocaleString()}
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
