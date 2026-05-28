import React, { useState, useEffect } from 'react';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { Link } from 'react-router-dom';
import LogoLoader from '../components/LogoLoader'

function UserSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function BookSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>; }
function AlertSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 5v3.5M8 11h.01"/><circle cx="8" cy="8" r="7"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8l3 3 5-5"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function InfoSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 11V7M8 5h.01"/></svg>; }

interface Observee {
  id: string;
  name: string;
  avatar_url?: string;
}

export default function ObserverDashboard() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [pairingStatus, setPairingStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  // Fetch observees
  const { data: observees, isLoading: loadingObservees, refetch: refetchObservees } = useCanvasQuery<Observee[]>('/api/v1/users/self/observees');

  useEffect(() => {
    if (observees && observees.length > 0 && !selectedStudentId) {
      setSelectedStudentId(String(observees[0].id));
    }
  }, [observees, selectedStudentId]);

  // Fetch data for selected student
  const { data: enrollments, isLoading: loadingEnrollments } = useCanvasQuery<any[]>(
    selectedStudentId ? `/api/v1/users/${selectedStudentId}/enrollments` : null,
    { state: ['active'] } as any
  );

  const { data: missingSubmissions } = useCanvasQuery<any[]>(
    selectedStudentId ? `/api/v1/users/${selectedStudentId}/missing_submissions` : null
  );

  const handlePairingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingCode) return;
    setPairingStatus('loading');
    try {
      // Sourced from Canvas API POST /api/v1/users/self/observees
      await canvasFetch('/api/v1/users/self/observees', {
        method: 'POST',
        body: { pairing_code: pairingCode }
      });
      setPairingStatus('success');
      setTimeout(() => {
        setShowPairingModal(false);
        setPairingCode('');
        setPairingStatus('idle');
        refetchObservees();
      }, 1500);
    } catch (err) {
      setPairingStatus('error');
    }
  };

  return (
    <div className="cx-page" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Observer Dashboard</h1>
          <p className="cx-page__subtitle">Monitor progress, grades, and activity for your linked students.</p>
        </div>
        <button className="cx-btn cx-btn--primary" onClick={() => setShowPairingModal(true)}>
          <PlusSvg /> Link Student
        </button>
      </div>

      {loadingObservees ? (
        <LogoLoader />
      ) : !observees || observees.length === 0 ? (
        <div className="cx-empty" style={{ background: 'var(--cx-bg-surface)', padding: 48, borderRadius: 12, border: '1px solid var(--cx-border-subtle)' }}>
          <UserSvg />
          <h3 style={{ margin: '16px 0 8px' }}>No Linked Students</h3>
          <p style={{ color: 'var(--cx-text-secondary)', maxWidth: 400, margin: '0 auto 24px' }}>
            You haven't linked any students to your account yet. Ask your student to generate a pairing code from their Settings page.
          </p>
          <button className="cx-btn cx-btn--primary" onClick={() => setShowPairingModal(true)}>Enter Pairing Code</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-secondary)', margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Students</h3>
            {observees.map(obs => (
              <button
                key={obs.id}
                onClick={() => setSelectedStudentId(String(obs.id))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  background: selectedStudentId === String(obs.id) ? 'var(--cx-color-primary)' : 'var(--cx-bg-surface)',
                  color: selectedStudentId === String(obs.id) ? '#fff' : 'var(--cx-text-primary)',
                  border: `1px solid ${selectedStudentId === String(obs.id) ? 'var(--cx-color-primary)' : 'var(--cx-border-subtle)'}`,
                  borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: selectedStudentId === String(obs.id) ? '0 4px 12px rgba(99, 131, 252, 0.2)' : 'none'
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: selectedStudentId === String(obs.id) ? 'rgba(255,255,255,0.2)' : 'var(--cx-bg-canvas)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  {obs.avatar_url ? <img src={obs.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserSvg />}
                </div>
                <div style={{ fontWeight: 600 }}>{obs.name}</div>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {loadingEnrollments ? (
              <LogoLoader />
            ) : (
              <>
                {missingSubmissions && missingSubmissions.length > 0 && (
                  <div className="cx-card" style={{ borderColor: 'var(--cx-color-danger-border)', background: 'var(--cx-color-danger-subtle)' }}>
                    <div className="cx-card__header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                      <h3 className="cx-card__title" style={{ color: 'var(--cx-color-danger-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertSvg /> Missing Assignments ({missingSubmissions.length})
                      </h3>
                    </div>
                    <div className="cx-card__body">
                      <ul style={{ margin: 0, paddingLeft: 24, color: 'var(--cx-color-danger-text)' }}>
                        {missingSubmissions.slice(0, 3).map((sub: any) => (
                          <li key={sub.id} style={{ marginBottom: 4 }}>
                            <strong>{sub.name}</strong> - Due {new Date(sub.due_at).toLocaleDateString()}
                          </li>
                        ))}
                        {missingSubmissions.length > 3 && <li>And {missingSubmissions.length - 3} more...</li>}
                      </ul>
                    </div>
                  </div>
                )}

                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: 0 }}>Current Courses</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {enrollments?.filter(e => e.type === 'StudentEnrollment').map((enr: any) => {
                    const grade = enr.grades?.current_grade || 'N/A';
                    const score = enr.grades?.current_score;
                    return (
                      <div key={enr.id} className="cx-card">
                        <div className="cx-card__header">
                          <h3 className="cx-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BookSvg /> Course ID: {enr.course_id}</h3>
                        </div>
                        <div className="cx-card__body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>Current Grade</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cx-color-primary)', lineHeight: 1.2 }}>{grade}</div>
                            {score !== undefined && <div style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>{score}%</div>}
                          </div>
                          <Link to={`/courses/${enr.course_id}`} className="cx-btn cx-btn--secondary cx-btn--sm">View Course</Link>
                        </div>
                      </div>
                    );
                  })}
                  {(!enrollments || enrollments.filter(e => e.type === 'StudentEnrollment').length === 0) && (
                    <div className="cx-empty" style={{ gridColumn: '1 / -1', padding: 32 }}>
                      <InfoSvg />
                      <p style={{ marginTop: 8 }}>Student is not currently enrolled in any active courses.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Pairing Modal */}
      {showPairingModal && (
        <div className="cx-modal-overlay" onClick={() => setShowPairingModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Link with Student</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowPairingModal(false)}><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg></button>
            </div>
            <form onSubmit={handlePairingSubmit}>
              <div className="cx-modal__body">
                <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', marginBottom: 16 }}>
                  Enter the pairing code provided by the student. Students can generate pairing codes from their Settings page.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>Pairing Code</label>
                  <input
                    type="text"
                    value={pairingCode}
                    onChange={e => setPairingCode(e.target.value)}
                    placeholder="e.g. 1a2b3c4d"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, fontSize: '1rem', textTransform: 'uppercase' }}
                    autoFocus
                    required
                  />
                </div>
                
                {pairingStatus === 'error' && (
                  <div style={{ marginTop: 12, padding: 8, background: 'var(--cx-color-danger-subtle)', color: 'var(--cx-color-danger-text)', borderRadius: 6, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertSvg /> Invalid pairing code or code has expired.
                  </div>
                )}
                {pairingStatus === 'success' && (
                  <div style={{ marginTop: 12, padding: 8, background: 'var(--cx-color-success-subtle)', color: 'var(--cx-color-success-text)', borderRadius: 6, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckSvg /> Student successfully linked!
                  </div>
                )}
              </div>
              <div className="cx-modal__footer">
                <button type="button" className="cx-btn cx-btn--secondary" onClick={() => setShowPairingModal(false)}>Cancel</button>
                <button type="submit" className="cx-btn cx-btn--primary" disabled={!pairingCode || pairingStatus === 'loading'}>
                  {pairingStatus === 'loading' ? 'Linking...' : 'Link Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
