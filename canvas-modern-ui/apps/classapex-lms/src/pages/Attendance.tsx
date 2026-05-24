import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';

interface Student {
  id: number;
  name: string;
  avatar_url?: string;
}

interface Submission {
  user_id: number;
  grade: string | null;
  score: number | null;
}

interface Assignment {
  id: number;
  name: string;
  points_possible: number;
}

export default function AttendancePage() {
  const { courseId } = useParams();
  const { showToast, showConfirm } = useNotification();
  const [viewMode, setViewMode] = useState<'list' | 'seating'>('list');
  const [attendanceAssignment, setAttendanceAssignment] = useState<Assignment | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>({});
  const [initializing, setInitializing] = useState(false);
  const [updatingStudents, setUpdatingStudents] = useState<Set<number>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);

  // Fetch students in the course
  const { data: students, isLoading: loadingStudents, isError: studentsError } = useCanvasQuery<Student[]>(
    `/api/v1/courses/${courseId}/users`,
    { enrollment_type: ['student'], per_page: 100 } as any
  );

  // Fetch all assignments to find "Roll Call Attendance"
  const { data: assignments, isLoading: loadingAssignments, refetch: refetchAssignments } = useCanvasQuery<Assignment[]>(
    `/api/v1/courses/${courseId}/assignments`,
    { per_page: 50 } as any
  );

  // Locate the Roll Call Attendance assignment (robust lookup)
  useEffect(() => {
    if (assignments) {
      const found = assignments.find(a => /roll\s*call\s*attendance/i.test(a.name));
      if (found) {
        setAttendanceAssignment(found);
      }
    }
  }, [assignments]);

  // Fetch submissions for the attendance assignment if it exists
  const { data: submissions, isLoading: loadingSubmissions, refetch: refetchSubmissions } = useCanvasQuery<Submission[]>(
    attendanceAssignment ? `/api/v1/courses/${courseId}/assignments/${attendanceAssignment.id}/submissions` : null,
    { per_page: 100 } as any
  );

  // Map submissions to local state statuses
  useEffect(() => {
    if (submissions && students) {
      const mapping: Record<number, string> = {};
      students.forEach(s => {
        const sub = submissions.find(sub => sub.user_id === s.id);
        if (sub) {
          if (sub.grade === '100' || sub.score === 100) mapping[s.id] = 'present';
          else if (sub.grade === '80' || sub.score === 80) mapping[s.id] = 'late';
          else if (sub.grade === '0' || sub.score === 0) mapping[s.id] = 'absent';
          else mapping[s.id] = 'unmarked';
        } else {
          mapping[s.id] = 'unmarked';
        }
      });
      setLocalStatuses(mapping);
    }
  }, [submissions, students]);

  const handleInitializeAssignment = useCallback(async () => {
    setInitializing(true);
    try {
      const created = await canvasFetch(`/api/v1/courses/${courseId}/assignments`, {
        method: 'POST',
        body: {
          assignment: {
            name: 'Roll Call Attendance',
            points_possible: 100,
            submission_types: ['attendance'],
            published: true
          }
        }
      });
      showToast({ title: 'Success', message: 'Roll Call Attendance assignment initialized.', type: 'success' });
      setAttendanceAssignment(created);
      refetchAssignments();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to initialize attendance.', type: 'error' });
    } finally {
      setInitializing(false);
    }
  }, [courseId, showToast, refetchAssignments]);

  const cycleStatus = useCallback(async (studentId: number) => {
    if (!attendanceAssignment) {
      showToast({ title: 'Notice', message: 'Initialize the attendance assignment first.', type: 'info' });
      return;
    }

    const currentStatus = localStatuses[studentId] || 'unmarked';
    let nextStatus = 'unmarked';
    let nextGrade = '';

    if (currentStatus === 'unmarked') {
      nextStatus = 'present';
      nextGrade = '100';
    } else if (currentStatus === 'present') {
      nextStatus = 'absent';
      nextGrade = '0';
    } else if (currentStatus === 'absent') {
      nextStatus = 'late';
      nextGrade = '80';
    } else {
      nextStatus = 'unmarked';
      nextGrade = ''; // cleared
    }

    // Optimistically update
    setLocalStatuses(prev => ({ ...prev, [studentId]: nextStatus }));
    setUpdatingStudents(prev => new Set(prev).add(studentId));

    try {
      await canvasFetch(`/api/v1/courses/${courseId}/assignments/${attendanceAssignment.id}/submissions/${studentId}`, {
        method: 'PUT',
        body: {
          submission: {
            posted_grade: nextGrade
          }
        }
      });
      showToast({ title: 'Updated', message: 'Gradebook synced.', type: 'success' });
    } catch (err: any) {
      showToast({ title: 'Sync Failed', message: err.message || 'Failed to update attendance.', type: 'error' });
      // Rollback on error
      setLocalStatuses(prev => ({ ...prev, [studentId]: currentStatus }));
    } finally {
      setUpdatingStudents(prev => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }
  }, [attendanceAssignment, courseId, localStatuses, showToast]);

  // Batch updates with concurrency limit to avoid overwhelming the API
  const handleMarkAllPresent = useCallback(async () => {
    if (!attendanceAssignment || !students) return;
    const confirmed = await showConfirm({
      title: 'Mark All Present',
      message: `This will mark all ${students.length} students as present. Continue?`,
      confirmLabel: 'Mark All Present',
      cancelLabel: 'Cancel',
      type: 'warning'
    });
    if (!confirmed) return;

    setMarkingAll(true);
    try {
      const CONCURRENCY = 5;
      const chunks: Student[][] = [];
      for (let i = 0; i < students.length; i += CONCURRENCY) {
        chunks.push(students.slice(i, i + CONCURRENCY));
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(s =>
            canvasFetch(`/api/v1/courses/${courseId}/assignments/${attendanceAssignment.id}/submissions/${s.id}`, {
              method: 'PUT',
              body: { submission: { posted_grade: '100' } }
            })
          )
        );
      }
      showToast({ title: 'Success', message: 'All students marked present.', type: 'success' });
      refetchSubmissions();
    } catch {
      showToast({ title: 'Sync Failed', message: 'Some status updates failed.', type: 'error' });
    } finally {
      setMarkingAll(false);
    }
  }, [attendanceAssignment, courseId, students, showConfirm, showToast, refetchSubmissions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'var(--cx-color-success)';
      case 'absent': return 'var(--cx-color-danger)';
      case 'late': return 'var(--cx-color-warning)';
      default: return 'var(--cx-text-tertiary)';
    }
  };

  if (loadingStudents || loadingAssignments || (attendanceAssignment && loadingSubmissions)) {
    return (
      <div className="cx-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div className="cx-loading-ring" />
      </div>
    );
  }

  if (studentsError) {
    return (
      <div className="cx-page">
        <div className="cx-notification cx-notification--danger">Failed to load student roster.</div>
      </div>
    );
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Attendance & Roll Call</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--cx-text-secondary)', margin: '4px 0 0' }}>Record today's attendance directly to the gradebook.</p>
        </div>
        <div className="cx-tabs" style={{ marginBottom: 0 }}>
          <button className={`cx-tab ${viewMode === 'list' ? 'cx-tab--active' : ''}`} onClick={() => setViewMode('list')}>List View</button>
          <button className={`cx-tab ${viewMode === 'seating' ? 'cx-tab--active' : ''}`} onClick={() => setViewMode('seating')}>Seating Chart</button>
        </div>
      </div>

      {!attendanceAssignment ? (
        <div className="cx-empty" style={{ padding: 48, background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 8, textAlign: 'center' }}>
          <h3>Initialize Attendance Tracking</h3>
          <p style={{ color: 'var(--cx-text-secondary)', maxWidth: 450, margin: '8px auto 24px' }}>
            No "Roll Call Attendance" assignment was found in this course. Initialize it now to automatically create a column in your Canvas gradebook.
          </p>
          <button className="cx-btn cx-btn--primary" onClick={handleInitializeAssignment} disabled={initializing}>
            {initializing ? 'Initializing...' : 'Initialize Attendance'}
          </button>
        </div>
      ) : (
        <div style={{ padding: '24px', background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
            <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>Today: {new Date().toLocaleDateString()}</div>
            <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={handleMarkAllPresent} disabled={markingAll}>{markingAll ? 'Marking...' : 'Mark All Present'}</button>
          </div>

          {viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {students?.map(student => {
                const status = localStatuses[student.id] || 'unmarked';
                return (
                  <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--cx-bg-surface-sunken)', borderRadius: 8, border: '1px solid var(--cx-border-subtle)' }}>
                    <span style={{ fontWeight: 500, color: 'var(--cx-text-primary)' }}>{student.name}</span>
                    <button 
                      onClick={() => cycleStatus(student.id)}
                      disabled={updatingStudents.has(student.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 16,
                        border: `1px solid ${getStatusColor(status)}`,
                        background: status === 'unmarked' ? 'transparent' : `${getStatusColor(status)}22`,
                        color: getStatusColor(status),
                        fontWeight: 600,
                        cursor: updatingStudents.has(student.id) ? 'not-allowed' : 'pointer',
                        minWidth: 100,
                        textTransform: 'capitalize',
                        opacity: updatingStudents.has(student.id) ? 0.7 : 1
                      }}
                    >
                      {updatingStudents.has(student.id) ? 'Saving...' : status}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, padding: 24, background: 'var(--cx-bg-surface-sunken)', borderRadius: 8, minHeight: 300 }}>
              {students?.map(student => {
                const status = localStatuses[student.id] || 'unmarked';
                return (
                  <div 
                    key={student.id} 
                    onClick={() => { if (!updatingStudents.has(student.id)) cycleStatus(student.id); }}
                    style={{
                      padding: '24px 16px',
                      background: 'var(--cx-bg-surface)',
                      borderRadius: 8,
                      border: `2px solid ${getStatusColor(status)}`,
                      textAlign: 'center',
                      cursor: updatingStudents.has(student.id) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'border-color 0.2s',
                      opacity: updatingStudents.has(student.id) ? 0.7 : 1
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cx-border-subtle)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600, color: 'var(--cx-text-secondary)', overflow: 'hidden' }}>
                      {student.avatar_url ? <img src={student.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : student.name.charAt(0)}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: getStatusColor(status), fontWeight: 700 }}>{status}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
