import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import NewRceWrapper from '../components/NewRceWrapper';
import { useNotification } from '../hooks/useNotification';

function CalendarSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M2 7h12M5 2v2M11 2v2"/></svg>; }
function EditSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2.5a1.5 1.5 0 012.1 2.1l-9.5 9.5H2v-2.6l9.5-9.5z"/></svg>; }

interface CourseDetails {
  id: number;
  name: string;
  syllabus_body: string | null;
}

interface SyllabusEvent {
  id: string | number;
  title: string;
  date: string;
  time: string;
  type: 'assignment' | 'event';
  html_url?: string;
  timestamp: number;
}

export default function SyllabusPage() {
  const { courseId } = useParams();
  const { showToast } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch course details for syllabus body
  const { data: course, isLoading: loadingCourse, refetch: refetchCourse } = useCanvasQuery<CourseDetails>(
    `/api/v1/courses/${courseId}`
  );

  // Fetch course assignments
  const { data: assignments, isLoading: loadingAssignments } = useCanvasQuery<any[]>(
    `/api/v1/courses/${courseId}/assignments`,
    { per_page: 50 } as any
  );

  // Fetch calendar events for the course
  const { data: events, isLoading: loadingEvents } = useCanvasQuery<any[]>(
    `/api/v1/calendar_events`,
    { 'context_codes[]': `course_${courseId}`, per_page: 50 } as any
  );

  useEffect(() => {
    if (course?.syllabus_body) {
      setEditedBody(course.syllabus_body);
    }
  }, [course]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await canvasFetch(`/api/v1/courses/${courseId}`, {
        method: 'PUT',
        body: {
          course: {
            syllabus_body: editedBody
          }
        }
      });
      showToast({ title: 'Syllabus Updated', message: 'The syllabus content has been successfully updated.', type: 'success' });
      setIsEditing(false);
      refetchCourse();
    } catch (err: any) {
      showToast({ title: 'Update Failed', message: err.message || 'Could not update syllabus.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Combine assignments & events into a single chronological feed
  const combinedSummary = React.useMemo(() => {
    const summary: SyllabusEvent[] = [];

    if (assignments) {
      assignments.forEach(a => {
        if (a.due_at) {
          const dateObj = new Date(a.due_at);
          const timestamp = dateObj.getTime();
          summary.push({
            id: `assignment_${a.id}`,
            title: a.name,
            date: dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            time: dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            type: 'assignment',
            html_url: a.html_url,
            timestamp
          });
        }
      });
    }

    if (events) {
      events.forEach(e => {
        if (e.start_at) {
          const dateObj = new Date(e.start_at);
          const timestamp = dateObj.getTime();
          summary.push({
            id: `event_${e.id}`,
            title: e.title,
            date: dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            time: dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            type: 'event',
            html_url: e.html_url,
            timestamp
          });
        }
      });
    }

    // Sort chronologically by timestamp
    summary.sort((a, b) => a.timestamp - b.timestamp);
    return summary;
  }, [assignments, events]);

  if (loadingCourse || loadingAssignments || loadingEvents) {
    return (
      <div className="cx-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div className="cx-loading-ring" />
      </div>
    );
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Syllabus</h2>
        </div>
        {!isEditing ? (
          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setIsEditing(true)}><EditSvg /> Edit</button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div style={{ marginBottom: 32 }}>
          <NewRceWrapper
            value={editedBody || ''}
            onChange={html => setEditedBody(html)}
            placeholder="Write course syllabus here..."
            minHeight={300}
          />
        </div>
      ) : (
        <div style={{ marginBottom: 32, padding: '24px', background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600 }}>Course Syllabus Content</h3>
          {course?.syllabus_body ? (
            <div 
              className="cx-syllabus-body"
              style={{ color: 'var(--cx-text-secondary)', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: course.syllabus_body }}
            />
          ) : (
            <p style={{ color: 'var(--cx-text-tertiary)', fontStyle: 'italic' }}>No syllabus content has been added to this course yet.</p>
          )}
        </div>
      )}

      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.25rem', marginBottom: 16 }}><CalendarSvg /> Course Summary</h3>
      
      <div style={{ background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--cx-bg-surface-sunken)', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)' }}>Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {combinedSummary.map((event) => (
              <tr key={event.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                <td style={{ padding: '12px 16px', verticalAlign: 'top', width: '25%', color: 'var(--cx-text-secondary)' }}>
                  {event.date}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a href={event.html_url || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cx-color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                      <span style={{ marginRight: 6 }}>{event.type === 'assignment' ? '📝' : '📅'}</span>
                      {event.title}
                    </a>
                    <span style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.8rem' }}>{event.time}</span>
                  </div>
                </td>
              </tr>
            ))}
            {combinedSummary.length === 0 && (
              <tr>
                <td colSpan={2} style={{ padding: '24px', textAlign: 'center', color: 'var(--cx-text-tertiary)' }}>
                  No syllabus events or assignments listed for this course.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
