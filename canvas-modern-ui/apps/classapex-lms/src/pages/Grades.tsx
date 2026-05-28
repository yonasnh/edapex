import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import VirtualList from '../widgets/VirtualList';

interface Grade {
  id: string;
  assignment: {
    id: string;
    name: string;
    type: 'assignment' | 'quiz' | 'exam' | 'project' | 'discussion';
    pointsPossible: number;
    dueDate?: string;
  };
  course: { id: string; name: string; color?: string };
  score?: number | null;
  grade?: string;
  percentage?: number;
  submittedAt?: string;
  gradedAt?: string;
  feedback?: string;
  status: 'graded' | 'submitted' | 'missing' | 'late' | 'excused';
  isLate?: boolean;
  isMissing?: boolean;
  isExcused?: boolean;
  rubricAssessment?: any;
}

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function TrophySvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3h10v4a5 5 0 01-10 0V3z"/><path d="M7 3V1h6v2"/><path d="M5 14h10v2H5z"/><path d="M10 14v4"/></svg>; }
function TrendingUpSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 14l5-5 4 4 7-7"/><path d="M13 6h5v5"/></svg>; }
function AlertSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/><path d="M10 6v4"/><circle cx="10" cy="13" r="0.5" fill="currentColor"/></svg>; }
function ClockSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg>; }
function CheckSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7l3 3 5-6"/></svg>; }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>; }
function DownloadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10V2M4 7l3 3 3-3"/><path d="M2 11v1h10v-1"/></svg>; }

const GRADING_SCHEMES = [
  { label: 'A', min: 90, color: '#10b981' },
  { label: 'B', min: 80, color: '#3b82f6' },
  { label: 'C', min: 70, color: '#f59e0b' },
  { label: 'D', min: 60, color: '#f97316' },
  { label: 'F', min: 0, color: '#ef4444' },
]

export function getLetterGrade(percentage: number): string {
  for (const s of GRADING_SCHEMES) {
    if (percentage >= s.min) return s.label
  }
  return 'F'
}

interface LatePolicy {
  enabled: boolean
  latePenaltyPercent: number
  latePenaltyPerDay: boolean
  missingSubmissionGrade: 'zero' | 'excused' | 'none'
  gracePeriodHours: number
  maxLatePercent: number
}

const defaultLatePolicy: LatePolicy = {
  enabled: true,
  latePenaltyPercent: 5,
  latePenaltyPerDay: true,
  missingSubmissionGrade: 'zero',
  gracePeriodHours: 24,
  maxLatePercent: 50,
}

export function exportGradesCSV(grades: Grade[]) {
  const rows = [['Assignment','Course','Type','Score','Points Possible','Percentage','Status','Due Date','Submitted Date','Graded Date','Feedback']]
  grades.forEach(g => {
    rows.push([
      g.assignment.name,
      g.course.name,
      g.assignment.type,
      g.score?.toString() ?? '',
      g.assignment.pointsPossible.toString(),
      g.percentage?.toString() ?? '',
      g.status,
      g.assignment.dueDate ? new Date(g.assignment.dueDate).toLocaleDateString() : '',
      g.submittedAt ? new Date(g.submittedAt).toLocaleDateString() : '',
      g.gradedAt ? new Date(g.gradedAt).toLocaleDateString() : '',
      g.feedback ?? '',
    ])
  })
  const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gradebook-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function filterGrades(
  grades: Grade[],
  searchTerm: string,
  filterCourse: string,
  filterType: string,
  filterStatus: string,
  sortBy: string
): Grade[] {
  let filtered = [...grades];
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(g => g.assignment.name.toLowerCase().includes(q));
  }
  if (filterCourse) filtered = filtered.filter(g => String(g.course.id) === filterCourse);
  if (filterType !== 'all') filtered = filtered.filter(g => g.assignment.type === filterType);
  if (filterStatus !== 'all') filtered = filtered.filter(g => g.status === filterStatus);
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.assignment.name.localeCompare(b.assignment.name);
      case 'score': return (b.score || 0) - (a.score || 0);
      case 'type': return a.assignment.type.localeCompare(b.assignment.type);
      default: return new Date(b.assignment.dueDate || 0).getTime() - new Date(a.assignment.dueDate || 0).getTime();
    }
  });
  return filtered;
}

import { useCanvasQuery } from '../hooks/useCanvasQuery';
import { useRole } from '../contexts/RoleContext';
import LogoLoader from '../components/LogoLoader'

const GradesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryCourseId = searchParams.get('courseId');
  const { role } = useRole();
  const isStudent = role === 'student';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const [whatIfMode, setWhatIfMode] = useState(false)
  const [whatIfScores, setWhatIfScores] = useState<Record<string, number | null>>({})
  const [latePolicy, setLatePolicy] = useState<LatePolicy>(defaultLatePolicy)
  const [showRubric, setShowRubric] = useState(false)

  const { data: rubricData } = useCanvasQuery<any>(
    selectedGrade ? `/api/v1/courses/${filterCourse}/assignments/${selectedGrade.assignment.id}/rubrics` : '',
    undefined,
    { enabled: !!selectedGrade }
  )

  React.useEffect(() => {
    setShowRubric(false)
  }, [selectedGrade])

  // Canvas API Integrations
  const { data: coursesData } = useCanvasQuery<any[]>('/api/v1/users/self/courses', { enrollment_state: 'active' } as any)
  const courses = Array.isArray(coursesData) ? coursesData : []

  React.useEffect(() => {
    if (queryCourseId) {
      setFilterCourse(queryCourseId);
    } else if (!filterCourse && courses.length > 0) {
      setFilterCourse(String(courses[0].id))
    }
  }, [courses, filterCourse, queryCourseId])

  const { data: submissionsData } = useCanvasQuery<any[]>(
    filterCourse ? `/api/v1/courses/${filterCourse}/students/submissions` : '',
    { student_ids: ['self'], include: ['assignment', 'rubric_assessment'], per_page: 50 },
    { enabled: !!filterCourse }
  )

  const liveGrades = useMemo<Grade[]>(() => {
    if (!Array.isArray(submissionsData)) return []
    const course = courses.find(c => String(c.id) === filterCourse) || { id: filterCourse, name: 'Unknown Course' }
    return submissionsData.map(sub => {
      const a = sub.assignment || {}
      return {
        id: String(sub.id),
        assignment: {
          id: String(a.id),
          name: a.name || 'Unknown Assignment',
          type: (a.is_quiz_assignment ? 'quiz' : 'assignment') as Grade['assignment']['type'],
          pointsPossible: a.points_possible || 0,
          dueDate: a.due_at,
        },
        course: { id: String(course.id), name: course.name },
        score: sub.score,
        grade: sub.grade,
        percentage: (sub.score != null && a.points_possible) ? Math.round((sub.score / a.points_possible) * 100) : undefined,
        submittedAt: sub.submitted_at,
        gradedAt: sub.graded_at,
        status: sub.workflow_state === 'graded' ? 'graded' : sub.missing ? 'missing' : sub.late ? 'late' : sub.excused ? 'excused' : sub.submitted_at ? 'submitted' : 'missing',
        isLate: sub.late,
        isMissing: sub.missing,
        isExcused: sub.excused,
        rubricAssessment: sub.rubric_assessment,
      }
    })
  }, [submissionsData, courses, filterCourse])

  const effectiveScores = useMemo(() => {
    if (!whatIfMode) return undefined
    return liveGrades.map(g => {
      const adjusted = whatIfScores[g.id] !== undefined ? whatIfScores[g.id] : g.score ?? null
      return {
        ...g,
        score: adjusted,
        percentage: adjusted != null && g.assignment.pointsPossible > 0
          ? Math.round((adjusted / g.assignment.pointsPossible) * 100)
          : undefined,
      }
    })
  }, [whatIfMode, whatIfScores, liveGrades])

  const displayGrades = effectiveScores || liveGrades

  const stats = useMemo(() => {
    const source = effectiveScores || liveGrades
    const graded = source.filter(g => g.status === 'graded' || g.score != null);
    const avg = graded.length ? Math.round(graded.reduce((s, g) => s + (g.percentage || 0), 0) / graded.length) : 0;
    return {
      overallGPA: avg,
      totalAssignments: source.length,
      gradedAssignments: graded.length,
      missingAssignments: source.filter(g => g.status === 'missing').length,
      pendingGrades: source.filter(g => g.status === 'submitted').length,
      totalScore: graded.reduce((s, g) => s + (g.score || 0), 0),
      totalPossible: graded.reduce((s, g) => s + g.assignment.pointsPossible, 0),
      whatIfGpa: whatIfMode ? avg : undefined,
    };
  }, [effectiveScores, liveGrades, whatIfMode]);

  const filteredGrades = useMemo(() => {
    return filterGrades(displayGrades, searchTerm, filterCourse, filterType, filterStatus, sortBy);
  }, [searchTerm, filterCourse, filterType, filterStatus, sortBy, displayGrades]);

  const getStatusBadge = (status: string, opts?: { late?: boolean; missing?: boolean }) => {
    const map: Record<string, string> = { graded: 'cx-badge--success', submitted: 'cx-badge--info', missing: 'cx-badge--danger', late: 'cx-badge--warning', excused: 'cx-badge--neutral' };
    const label = opts?.late ? 'Late' : opts?.missing ? 'Missing' : status;
    const cls = opts?.late ? 'cx-badge--warning' : opts?.missing ? 'cx-badge--danger' : map[status] || 'cx-badge--neutral';
    return <span className={clsx('cx-badge', cls)} title={opts?.late ? `Late penalty: ${latePolicy.latePenaltyPercent}%/day` : opts?.missing ? 'Missing submission' : ''}>{label}</span>;
  };

  const tabs = ['All Grades', 'Course Averages', 'Analytics', 'Grading Scheme', 'Late Policy', 'Learning Outcomes'];

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ justifyContent: 'flex-end', paddingTop: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {activeTab === 0 && (
            <>
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => exportGradesCSV(liveGrades)} title="Export to CSV"><DownloadSvg /> Export CSV</button>
              {isStudent && (
                <label className="cx-toggle">
                  <input type="checkbox" checked={whatIfMode} onChange={e => { setWhatIfMode(e.target.checked); setWhatIfScores({}) }} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label">What-If</span>
                </label>
              )}
            </>
          )}
        </div>
      </div>

      <div className="cx-stats-grid" aria-live="polite" aria-atomic="true">
        {[{ label: whatIfMode ? 'Projected GPA' : 'Overall GPA', value: `${stats.overallGPA}%`, icon: <TrophySvg />, desc: whatIfMode ? 'With your adjustments' : 'Average across all courses', trend: 'increase' as const },
          { label: 'Graded', value: `${stats.gradedAssignments}/${stats.totalAssignments}`, icon: <TrendingUpSvg />, desc: 'Assignments with grades', trend: 'neutral' as const },
          { label: 'Missing', value: stats.missingAssignments, icon: <AlertSvg />, desc: stats.missingAssignments > 0 ? 'Action needed' : 'All caught up', trend: stats.missingAssignments > 0 ? ('decrease' as const) : ('neutral' as const) },
          { label: 'Pending', value: stats.pendingGrades, icon: <ClockSvg />, desc: 'Awaiting grades', trend: 'neutral' as const },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon">{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
              <div className={clsx('cx-stat-card__change', `cx-stat-card__change--${s.trend}`)}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cx-tabs" role="tablist" aria-label="Grades sections">
        {tabs.map((tab, i) => (
          <button key={i} className={clsx('cx-tab', activeTab === i && 'cx-tab--active')} onClick={() => setActiveTab(i)} role="tab" aria-selected={activeTab === i} aria-controls={`grades-panel-${i}`} id={`grades-tab-${i}`}>{tab}</button>
        ))}
      </div>
      {activeTab === 0 && (
        <div role="tabpanel" id="grades-panel-0" aria-labelledby="grades-tab-0">
        <div className="cx-section">
          <div className="cx-toolbar">
            <div className="cx-search">
              <SearchSvg />
              <input type="search" className="cx-search__input" placeholder="Search assignments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="cx-select" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
              <option value="" disabled>Select a Course</option>
              {courses.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
            <select className="cx-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {['assignment', 'quiz', 'exam', 'project', 'discussion'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}s</option>)}
            </select>
            <select className="cx-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              {['graded', 'submitted', 'missing', 'late', 'excused'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select className="cx-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="dueDate">Due Date</option>
              <option value="name">Name</option>
              <option value="score">Score</option>
              <option value="type">Type</option>
            </select>
          </div>

          {filteredGrades.length === 0 ? (
            <div className="cx-empty">
              <SearchSvg />
              <h3>No grades found</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="cx-btn cx-btn--secondary" onClick={() => { setSearchTerm(''); setFilterCourse('all'); setFilterType('all'); setFilterStatus('all'); }}>Clear Filters</button>
            </div>
          ) : (
            <div className="cx-table-container" style={{ height: 480 }}>
              <div className="cx-table" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', borderBottom: '2px solid var(--cx-border-subtle)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--cx-text-tertiary)', padding: '8px 16px', flexShrink: 0 }}>
                  <div style={{ flex: 2 }}>Assignment</div>
                  <div style={{ flex: 1 }}>Course</div>
                  <div style={{ flex: 1 }}>Type</div>
                  <div style={{ flex: 1 }}>Score</div>
                  <div style={{ flex: 1 }}>Status</div>
                  <div style={{ flex: 1 }}>Due Date</div>
                  <div style={{ width: 40 }}></div>
                </div>
                <VirtualList
                  items={filteredGrades}
                  itemHeight={52}
                  style={{ flex: 1 }}
                >
                  {(grade) => (
                    <div key={grade.id} className="cx-table__row" onClick={() => setSelectedGrade(grade)} style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 52, cursor: 'pointer', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                      <div className="cx-table__cell cx-table__cell--name" style={{ flex: 2, fontWeight: 500 }}>{grade.assignment.name}</div>
                      <div className="cx-table__cell cx-table__cell--muted" style={{ flex: 1 }}>{grade.course.name}</div>
                      <div className="cx-table__cell cx-table__cell--muted" style={{ flex: 1 }}>{grade.assignment.type}</div>
                      <div className="cx-table__cell cx-table__cell--mono" style={{ flex: 1 }}>
                        {whatIfMode ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <input
                              type="number"
                              min={0}
                              max={grade.assignment.pointsPossible}
                              className="cx-input cx-input--inline"
                              style={{ width: 60 }}
                              value={whatIfScores[grade.id] ?? grade.score ?? ''}
                              onChange={e => setWhatIfScores(p => ({ ...p, [grade.id]: e.target.value ? Number(e.target.value) : null }))}
                              aria-label={`What-if score for ${grade.assignment.name}`}
                            />
                            <span>/{grade.assignment.pointsPossible}</span>
                            {whatIfScores[grade.id] != null && grade.assignment.pointsPossible > 0 && (
                              <span className="cx-table__cell--muted" style={{ marginLeft: 4 }}>
                                ({Math.round((whatIfScores[grade.id]! / grade.assignment.pointsPossible) * 100)}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          <>
                            {grade.score != null ? `${grade.score}/${grade.assignment.pointsPossible}` : '—'}
                            {grade.percentage != null && <span className="cx-table__cell--muted" style={{ marginLeft: 6 }}>({grade.percentage}%)</span>}
                          </>
                        )}
                      </div>
                      <div className="cx-table__cell" style={{ flex: 1 }}>{getStatusBadge(grade.status, { late: grade.isLate, missing: grade.isMissing })}</div>
                      <div className="cx-table__cell cx-table__cell--muted" style={{ flex: 1 }}>{grade.assignment.dueDate ? new Date(grade.assignment.dueDate).toLocaleDateString() : '—'}</div>
                      <div className="cx-table__cell cx-table__cell--actions" style={{ width: 40 }}>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={e => { e.stopPropagation(); setSelectedGrade(grade); }}><SearchSvg /></button>
                      </div>
                    </div>
                  )}
                </VirtualList>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 1 && (
        <div role="tabpanel" id="grades-panel-1" aria-labelledby="grades-tab-1" className="cx-section">
          <div className="cx-stats-grid cx-stats-grid--2">
            {courses.map((course: any) => {
              const courseGrades = liveGrades.filter(g => g.course.id === String(course.id) && g.status === 'graded');
              const avg = courseGrades.length ? Math.round(courseGrades.reduce((s, g) => s + (g.percentage || 0), 0) / courseGrades.length) : 0;
              return (
                <div key={course.id} className="cx-card">
                  <div className="cx-card__header">
                    <h3 className="cx-card__title">{course.name}</h3>
                    <span className={clsx('cx-badge', avg >= 80 ? 'cx-badge--success' : avg >= 60 ? 'cx-badge--warning' : 'cx-badge--danger')}>{avg}%</span>
                  </div>
                  <div className="cx-card__body">
                    <div className="cx-progress-bar">
                      <div className="cx-progress-bar__track">
                        <div className="cx-progress-bar__fill" style={{ width: `${avg}%` }} />
                      </div>
                    </div>
                    <div className="cx-card__meta">
                      <span>{courseGrades.length} graded</span>
                      <span>{liveGrades.filter(g => g.course.id === String(course.id) && g.status === 'missing').length} missing</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div role="tabpanel" id="grades-panel-3" aria-labelledby="grades-tab-3" className="cx-section">
          <div className="cx-card">
            <div className="cx-card__header"><h3 className="cx-card__title">Grading Scale</h3></div>
            <div className="cx-card__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {GRADING_SCHEMES.map(scheme => {
                  const nextMin = GRADING_SCHEMES[GRADING_SCHEMES.indexOf(scheme) - 1]?.min ?? 100
                  const range = scheme.label === 'F' ? `Below ${GRADING_SCHEMES[GRADING_SCHEMES.indexOf(scheme) - 1]?.min}%` : `${scheme.min}%–${nextMin - 1}%`
                  const pct = ((scheme.label === 'F' ? 10 : nextMin - scheme.min) / 100) * 100
                  return (
                    <div key={scheme.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: scheme.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem' }}>{scheme.label}</span>
                      <div style={{ flex: 1, height: 24, background: 'var(--cx-bg-tertiary)', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: scheme.color, opacity: 0.3, borderRadius: 6 }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', width: 120, textAlign: 'right' }}>{range}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="cx-card" style={{ marginTop: 16 }}>
            <div className="cx-card__header"><h3 className="cx-card__title">Your Current Standing</h3></div>
            <div className="cx-card__body">
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {courses.map((course: any) => {
                  const courseGrades = liveGrades.filter(g => g.course.id === String(course.id) && g.percentage != null)
                  const avg = courseGrades.length ? Math.round(courseGrades.reduce((s, g) => s + (g.percentage || 0), 0) / courseGrades.length) : 0
                  const letter = getLetterGrade(avg)
                  const scheme = GRADING_SCHEMES.find(s => s.label === letter)
                  return (
                    <div key={course.id} className="cx-card" style={{ flex: '1 1 200px' }}>
                      <div className="cx-card__header">
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{course.name}</span>
                        <span className="cx-badge cx-badge--success" style={{ background: scheme?.color }}>{letter} ({avg}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 4 && (
        <div role="tabpanel" id="grades-panel-4" aria-labelledby="grades-tab-4" className="cx-section">
          <div className="cx-card">
            <div className="cx-card__header"><h3 className="cx-card__title">Late Policy</h3></div>
            <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label className="cx-toggle">
                <input type="checkbox" checked={latePolicy.enabled} onChange={e => setLatePolicy(p => ({ ...p, enabled: e.target.checked }))} />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                <span className="cx-toggle__label" style={{ fontSize: '0.8125rem', color: 'var(--cx-text-primary)' }}>Enable Late/Missing Policy</span>
              </label>

              {latePolicy.enabled && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Late Penalty (% per day)</label>
                      <input type="number" className="cx-input" min={0} max={100} value={latePolicy.latePenaltyPercent}
                        onChange={e => setLatePolicy(p => ({ ...p, latePenaltyPercent: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Max Late Penalty (%)</label>
                      <input type="number" className="cx-input" min={0} max={100} value={latePolicy.maxLatePercent}
                        onChange={e => setLatePolicy(p => ({ ...p, maxLatePercent: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Grace Period (hours)</label>
                      <input type="number" className="cx-input" min={0} max={168} value={latePolicy.gracePeriodHours}
                        onChange={e => setLatePolicy(p => ({ ...p, gracePeriodHours: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Missing Submission Grade</label>
                      <select className="cx-select" style={{ width: '100%' }} value={latePolicy.missingSubmissionGrade}
                        onChange={e => setLatePolicy(p => ({ ...p, missingSubmissionGrade: e.target.value as any }))}>
                        <option value="zero">Zero (0)</option>
                        <option value="excused">Excused</option>
                        <option value="none">No Change</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ padding: 16, background: 'var(--cx-bg-canvas)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                    <h4 style={{ margin: '0 0 8px', fontWeight: 600 }}>Policy Preview</h4>
                    <p style={{ color: 'var(--cx-text-secondary)', margin: 0 }}>
                      Late submissions lose <strong>{latePolicy.latePenaltyPercent}%</strong> per day (max <strong>{latePolicy.maxLatePercent}%</strong>).
                      {latePolicy.gracePeriodHours > 0 ? ' ' + latePolicy.gracePeriodHours + 'h grace period applies.' : null}
                      Missing submissions automatically receive <strong>{latePolicy.missingSubmissionGrade === 'zero' ? '0' : latePolicy.missingSubmissionGrade === 'excused' ? 'Excused' : 'no change'}</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="cx-card" style={{ marginTop: 16 }}>
            <div className="cx-card__header"><h3 className="cx-card__title">Late & Missing Submissions</h3></div>
            <div className="cx-card__body">
              {liveGrades.filter(g => g.isLate || g.isMissing).length === 0 ? (
                <p style={{ color: 'var(--cx-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>No late or missing submissions.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {liveGrades.filter(g => g.isLate || g.isMissing).map(g => {
                    const daysLate = g.assignment.dueDate ? Math.max(0, Math.floor((Date.now() - new Date(g.assignment.dueDate).getTime()) / 86400000)) : 0
                    const penalty = Math.min(daysLate * latePolicy.latePenaltyPercent, latePolicy.maxLatePercent)
                    return (
                      <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--cx-bg-canvas)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <span style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{g.assignment.name}</span>
                          <span style={{ color: 'var(--cx-text-secondary)', marginLeft: 8, fontSize: '0.75rem' }}>{g.course.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {g.isLate && <span className="cx-badge cx-badge--warning">Late: -{penalty}%</span>}
                          {g.isMissing && <span className="cx-badge cx-badge--danger">Missing</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="cx-section">
          <div className="cx-card">
            <div className="cx-card__header"><h3 className="cx-card__title">Grade Distribution</h3></div>
            <div className="cx-card__body">
              {(() => {
                // Compute real distribution from Canvas submission data
                const graded = liveGrades.filter(g => g.percentage != null)
                const dist = GRADING_SCHEMES.map(scheme => {
                  const nextMin = GRADING_SCHEMES[GRADING_SCHEMES.indexOf(scheme) - 1]?.min ?? 101
                  const count = graded.filter(g => {
                    const p = g.percentage!
                    return scheme.label === 'F'
                      ? p < (GRADING_SCHEMES[GRADING_SCHEMES.indexOf(scheme) - 1]?.min ?? 60)
                      : p >= scheme.min && p < nextMin
                  }).length
                  const pct = graded.length > 0 ? Math.round((count / graded.length) * 100) : 0
                  return { label: scheme.label, count, pct, color: scheme.color }
                })

                if (graded.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--cx-text-tertiary)' }}>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>No graded submissions yet for this course.</p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem' }}>Select a course with graded work to see the distribution.</p>
                    </div>
                  )
                }

                const maxPct = Math.max(...dist.map(d => d.pct), 1)
                return (
                  <>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 180, padding: '24px 8px' }}>
                      {dist.map(({ label, pct, color }) => (
                        <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>{pct}%</span>
                          <div style={{
                            width: '100%',
                            height: `${(pct / maxPct) * 130}px`,
                            background: color,
                            opacity: 0.8,
                            borderRadius: '4px 4px 0 0',
                            minHeight: pct > 0 ? 4 : 0,
                            transition: 'height 0.4s ease',
                          }} />
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 8 }}>
                      Based on {graded.length} graded submission{graded.length !== 1 ? 's' : ''}
                    </p>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {selectedGrade && (
        <div className="cx-modal-overlay" onClick={() => setSelectedGrade(null)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{selectedGrade.assignment.name}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setSelectedGrade(null)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div className="cx-detail-grid">
                <div><span className="cx-detail-label">Course</span><span>{selectedGrade.course.name}</span></div>
                <div><span className="cx-detail-label">Type</span><span>{selectedGrade.assignment.type}</span></div>
                <div><span className="cx-detail-label">Due Date</span><span>{selectedGrade.assignment.dueDate ? new Date(selectedGrade.assignment.dueDate).toLocaleDateString() : '—'}</span></div>
                <div><span className="cx-detail-label">Status</span><span>{getStatusBadge(selectedGrade.status, { late: selectedGrade.isLate, missing: selectedGrade.isMissing })}</span></div>
                {latePolicy.enabled && selectedGrade.isLate && (
                  <div><span className="cx-detail-label">Late Penalty</span><span style={{ color: 'var(--cx-accent-error)' }}>-{latePolicy.latePenaltyPercent}%/day (max {latePolicy.maxLatePercent}%)</span></div>
                )}
                {selectedGrade.score != null && (
                  <>
                    <div><span className="cx-detail-label">Score</span><span>{selectedGrade.score}/{selectedGrade.assignment.pointsPossible} ({selectedGrade.percentage}%)</span></div>
                    <div><span className="cx-detail-label">Grade</span><span>{selectedGrade.grade}</span></div>
                  </>
                )}
                {selectedGrade.submittedAt && <div><span className="cx-detail-label">Submitted</span><span>{new Date(selectedGrade.submittedAt).toLocaleString()}</span></div>}
                {selectedGrade.gradedAt && <div><span className="cx-detail-label">Graded</span><span>{new Date(selectedGrade.gradedAt).toLocaleString()}</span></div>}
              </div>
              {selectedGrade.feedback && (
                <div className="cx-detail-section">
                  <h4>Feedback</h4>
                  <p style={{ color: 'var(--cx-text-secondary)', lineHeight: 1.6 }}>{selectedGrade.feedback}</p>
                </div>
              )}
              {selectedGrade.rubricAssessment && (
                <div className="cx-detail-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0 }}>Rubric</h4>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setShowRubric(v => !v)}>
                      {showRubric ? 'Hide Rubric' : 'View Rubric'}
                    </button>
                  </div>
                  {showRubric && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Criterion</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Points Earned</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const rubric = Array.isArray(rubricData) ? rubricData[0] : rubricData
                            const criteria = rubric?.criteria || []
                            if (!criteria.length) {
                              return (
                                <tr>
                                  <td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: 'var(--cx-text-tertiary)' }}>
                                    Rubric details not available.
                                  </td>
                                </tr>
                              )
                            }
                            return criteria.map((criterion: any) => {
                              const assessment = selectedGrade.rubricAssessment[criterion.id] || {}
                              const rating = criterion.ratings?.find((r: any) => r.id === assessment.rating_id)
                              return (
                                <tr key={criterion.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                                  <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{criterion.description}</div>
                                    {rating && (
                                      <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 2 }}>
                                        {rating.description}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--cx-color-primary)', verticalAlign: 'top' }}>
                                    {assessment.points !== undefined ? `${assessment.points} / ${criterion.points}` : `— / ${criterion.points}`}
                                  </td>
                                  <td style={{ padding: '8px 12px', color: 'var(--cx-text-secondary)', fontSize: '0.8rem', verticalAlign: 'top' }}>
                                    {assessment.comments || '—'}
                                  </td>
                                </tr>
                              )
                            })
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 5 && (
        <div role="tabpanel" id="grades-panel-5" aria-labelledby="grades-tab-5" className="cx-section">
          <OutcomesTab courseId={filterCourse} />
        </div>
      )}
    </div>
  );
};

// ─── Outcomes Tab Component ───────────────────────────────────────────────────

function OutcomesTab({ courseId }: { courseId: string }) {
  const { data: rollupsData, isLoading } = useCanvasQuery<any>(
    courseId ? `/api/v1/courses/${courseId}/outcome_rollups` : '',
    { 'user_ids[]': ['self'] } as any
  )

  if (!courseId) {
    return (
      <div className="cx-empty">
        <AlertSvg />
        <h3>No course selected</h3>
        <p>Please select a course to view your learning outcomes.</p>
      </div>
    )
  }

  if (isLoading) {
    return <LogoLoader />
  }

  const rollups = rollupsData?.rollups || []
  const linkedOutcomes = rollupsData?.linked?.outcomes || []

  // Combine rollup scores with linked outcome details
  const myRollup = rollups[0]
  const scores = myRollup?.scores || []

  const outcomesList = scores.map((s: any) => {
    const outcomeId = s.links.outcome
    const detail = linkedOutcomes.find((o: any) => String(o.id) === String(outcomeId))
    return {
      id: outcomeId,
      score: s.score,
      title: detail?.title || `Outcome ${outcomeId}`,
      masteryPoints: detail?.mastery_points || 3.0,
      pointsPossible: detail?.points_possible || 5.0,
      description: detail?.description,
    }
  })

  if (outcomesList.length === 0) {
    return (
      <div className="cx-empty">
        <h3>No learning outcomes available</h3>
        <p>This course has no outcomes configured or no outcome data has been recorded yet.</p>
      </div>
    )
  }

  const masteredCount = outcomesList.filter((o: any) => o.score != null && o.score >= o.masteryPoints).length
  const evaluatedCount = outcomesList.filter((o: any) => o.score != null).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="cx-stats-grid cx-stats-grid--3">
        <div className="cx-stat-card">
          <div className="cx-stat-card__icon"><CheckSvg /></div>
          <div className="cx-stat-card__body">
            <div className="cx-stat-card__label">Mastered</div>
            <div className="cx-stat-card__value">{masteredCount} / {outcomesList.length}</div>
          </div>
        </div>
        <div className="cx-stat-card">
          <div className="cx-stat-card__icon"><TrendingUpSvg /></div>
          <div className="cx-stat-card__body">
            <div className="cx-stat-card__label">Mastery Rate</div>
            <div className="cx-stat-card__value">{evaluatedCount > 0 ? Math.round((masteredCount / evaluatedCount) * 100) : 0}%</div>
          </div>
        </div>
        <div className="cx-stat-card">
          <div className="cx-stat-card__icon"><AlertSvg /></div>
          <div className="cx-stat-card__body">
            <div className="cx-stat-card__label">Needs Work</div>
            <div className="cx-stat-card__value">{outcomesList.length - masteredCount}</div>
          </div>
        </div>
      </div>

      <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
        Learning Outcomes &amp; Mastery Alignment
      </h3>

      <div className="cx-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead style={{ background: 'var(--cx-bg-surface-raised)' }}>
            <tr>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Learning Outcome</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Score</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)', width: 200 }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {outcomesList.map((o: any) => {
              const isMastered = o.score != null && o.score >= o.masteryPoints
              const isEvaluated = o.score != null
              const pct = isEvaluated ? Math.min(100, Math.round((o.score / Math.max(o.pointsPossible, 1)) * 100)) : 0
              const masteryPct = o.pointsPossible > 0 ? (o.masteryPoints / o.pointsPossible) * 100 : 0
              return (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{o.title}</div>
                    {o.description && <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 2 }} dangerouslySetInnerHTML={{ __html: o.description }} />}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {isEvaluated ? (
                      <span className={clsx('cx-badge', isMastered ? 'cx-badge--success' : 'cx-badge--warning')}>
                        {isMastered ? 'Mastered' : 'Not Mastered'}
                      </span>
                    ) : (
                      <span className="cx-badge cx-badge--neutral">Not Evaluated</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--cx-text-secondary)' }}>
                    {isEvaluated ? `${o.score.toFixed(1)} / ${o.pointsPossible}` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ width: '100%', height: 8, background: 'var(--cx-bg-tertiary)', borderRadius: 4, position: 'relative' }}>
                      {masteryPct > 0 && (
                        <div style={{ position: 'absolute', left: `${masteryPct}%`, top: -4, bottom: -4, width: 2, background: 'var(--cx-color-primary)', zIndex: 1 }} title={`Mastery threshold: ${o.masteryPoints}`} />
                      )}
                      {isEvaluated && (
                        <div style={{ height: '100%', width: `${pct}%`, background: isMastered ? 'var(--cx-accent-success, #10b981)' : 'var(--cx-accent-warning, #f59e0b)', borderRadius: 4 }} />
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GradesPage;
