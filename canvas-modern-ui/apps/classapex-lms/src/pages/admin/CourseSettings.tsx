import React, { useState, useCallback } from 'react'
import { useNotification } from '../../hooks/useNotification'
import clsx from 'clsx'

interface CourseSettings {
  name: string
  courseCode: string
  description: string
  isPublic: boolean
  isPublished: boolean
  allowStudentDiscussionEditing: boolean
  allowStudentDiscussionAttachments: boolean
  allowStudentDiscussionReporting: boolean
  restrictEnrollmentsToCourseDates: boolean
  hideFinalGrades: boolean
  allowFinalGradeOverride: boolean
  allowStudentAssignmentEdits: boolean
  selfEnrollment: boolean
  openEnrollment: boolean
  defaultView: 'modules' | 'syllabus' | 'assignments' | 'feed'
  storageQuota: number
  gradingStandard: string
  language: string
  timeZone: string
}

const defaultSettings: CourseSettings = {
  name: 'Computer Science 101',
  courseCode: 'CS101',
  description: 'Introduction to computer science fundamentals including programming, algorithms, and data structures.',
  isPublic: false,
  isPublished: true,
  allowStudentDiscussionEditing: false,
  allowStudentDiscussionAttachments: true,
  allowStudentDiscussionReporting: true,
  restrictEnrollmentsToCourseDates: true,
  hideFinalGrades: false,
  allowFinalGradeOverride: true,
  allowStudentAssignmentEdits: false,
  selfEnrollment: false,
  openEnrollment: true,
  defaultView: 'modules',
  storageQuota: 500,
  gradingStandard: 'A-F',
  language: 'English',
  timeZone: 'America/New_York',
}

function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function SettingsSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>; }
function GripSvg() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="4" cy="3" r="1"/><circle cx="8" cy="3" r="1"/><circle cx="4" cy="6" r="1"/><circle cx="8" cy="6" r="1"/><circle cx="4" cy="9" r="1"/><circle cx="8" cy="9" r="1"/></svg>; }

const labelStyle: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }
const inpStyle: React.CSSProperties = { border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', fontFamily: 'inherit' }
const toggleLabelStyle: React.CSSProperties = { fontSize: '0.8125rem', color: 'var(--cx-text-primary)' }

export default function CourseSettingsPage() {
  const { showToast } = useNotification()
  const [settings, setSettings] = useState<CourseSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [sections, setSections] = useState(['General', 'Course Content', 'Enrollment', 'Grading', 'Blueprint Settings', 'Navigation Tabs', 'System'])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // Blueprint states (S15-06)
  const [isBlueprint, setIsBlueprint] = useState(false)
  const [syncingBlueprint, setSyncingBlueprint] = useState(false)
  const [associatedCourses, setAssociatedCourses] = useState([
    { id: '101', name: 'Computer Science 101 - Section A', status: 'In Sync' },
    { id: '102', name: 'Computer Science 101 - Section B', status: 'Pending Changes' },
    { id: '103', name: 'Computer Science 101 - Section C', status: 'In Sync' }
  ])

  // Navigation tab states (S15-09)
  const [navTabs, setNavTabs] = useState([
    { id: 'home', label: 'Home', visible: true },
    { id: 'modules', label: 'Modules', visible: true },
    { id: 'syllabus', label: 'Syllabus', visible: true },
    { id: 'assignments', label: 'Assignments', visible: true },
    { id: 'quizzes', label: 'Quizzes', visible: true },
    { id: 'grades', label: 'Grades', visible: true },
    { id: 'discussions', label: 'Discussions', visible: true },
    { id: 'outcomes', label: 'Outcomes', visible: false },
    { id: 'rubrics', label: 'Rubrics', visible: false },
    { id: 'files', label: 'Files', visible: true },
    { id: 'settings', label: 'Settings', visible: true }
  ])
  const [dragTabIdx, setDragTabIdx] = useState<number | null>(null)

  const handleTabDragStart = (idx: number) => setDragTabIdx(idx)
  const handleTabDrop = (idx: number) => {
    if (dragTabIdx === null || dragTabIdx === idx) {
      setDragTabIdx(null)
      return
    }
    setNavTabs(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(dragTabIdx, 1)
      updated.splice(idx, 0, moved)
      return updated
    })
    setDragTabIdx(null)
  }

  const update = (key: keyof CourseSettings, value: any) => setSettings(p => ({ ...p, [key]: value }))

  const handleSave = () => {
    console.log('Saving course settings:', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleDragStart = useCallback((idx: number) => {
    setDragIndex(idx)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((idx: number) => {
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null)
      return
    }
    setSections(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(dragIndex, 1)
      updated.splice(idx, 0, moved)
      return updated
    })
    setDragIndex(null)
  }, [dragIndex])

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Course Settings</h1>
          <p className="cx-page__subtitle">Configure course behavior, content options, and enrollment policies</p>
        </div>
      </div>

      {saved && (
        <div className="cx-notification cx-notification--success" style={{ marginBottom: 16 }}>
          <CheckSvg />
          <div>
            <div className="cx-notification__title">Settings Saved</div>
            <div className="cx-notification__subtitle">Course settings updated successfully.</div>
          </div>
        </div>
      )}

      <div className="cx-tabs" role="tablist">
        {sections.map((s, i) => (
          <button
            key={s}
            className={clsx('cx-tab', activeSection === i && 'cx-tab--active', dragIndex === i && 'cx-tab--dragging')}
            onClick={() => setActiveSection(i)}
            role="tab"
            aria-selected={activeSection === i}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(i)}
          >
            <span style={{ cursor: 'grab', opacity: 0.5, marginRight: 4, display: 'inline-flex', verticalAlign: 'middle' }}><GripSvg /></span>
            {s}
          </button>
        ))}
      </div>

      <div className="cx-section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
          {activeSection === 0 && (
            <>
              <div>
                <label style={labelStyle} htmlFor="cs-name">Course Name</label>
                <input id="cs-name" type="text" style={inpStyle} value={settings.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="cs-code">Course Code</label>
                <input id="cs-code" type="text" style={inpStyle} value={settings.courseCode} onChange={e => update('courseCode', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="cs-desc">Description</label>
                <textarea id="cs-desc" style={{ ...inpStyle, resize: 'vertical', minHeight: 80 }} rows={4} value={settings.description} onChange={e => update('description', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Language</label>
                  <select className="cx-select" style={{ width: '100%' }} value={settings.language} onChange={e => update('language', e.target.value)}>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Time Zone</label>
                  <select className="cx-select" style={{ width: '100%' }} value={settings.timeZone} onChange={e => update('timeZone', e.target.value)}>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.isPublic} onChange={e => update('isPublic', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Public Course</span>
                </label>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.isPublished} onChange={e => update('isPublished', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Published</span>
                </label>
              </div>
            </>
          )}

          {activeSection === 1 && (
            <>
              <div>
                <label style={labelStyle}>Default Home Page View</label>
                <select className="cx-select" style={{ width: '100%' }} value={settings.defaultView} onChange={e => update('defaultView', e.target.value as any)}>
                  <option value="modules">Modules</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="assignments">Assignments</option>
                  <option value="feed">Activity Feed</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '8px 0 0' }}>Discussion Permissions</h4>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.allowStudentDiscussionEditing} onChange={e => update('allowStudentDiscussionEditing', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Students can edit their own discussions</span>
                </label>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.allowStudentDiscussionAttachments} onChange={e => update('allowStudentDiscussionAttachments', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Students can attach files to discussions</span>
                </label>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.allowStudentDiscussionReporting} onChange={e => update('allowStudentDiscussionReporting', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Students can report discussions</span>
                </label>
              </div>
              <div>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.allowStudentAssignmentEdits} onChange={e => update('allowStudentAssignmentEdits', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Students can edit their own assignments</span>
                </label>
              </div>
            </>
          )}

          {activeSection === 2 && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.selfEnrollment} onChange={e => update('selfEnrollment', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Allow Self Enrollment</span>
                </label>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.openEnrollment} onChange={e => update('openEnrollment', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Open Enrollment</span>
                </label>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.restrictEnrollmentsToCourseDates} onChange={e => update('restrictEnrollmentsToCourseDates', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Restrict Enrollments to Course Dates</span>
                </label>
              </div>
              <div>
                <label style={labelStyle}>Storage Quota (MB)</label>
                <input type="number" style={inpStyle} min={50} max={10000} value={settings.storageQuota} onChange={e => update('storageQuota', Number(e.target.value))} />
              </div>
            </>
          )}

          {activeSection === 3 && (
            <>
              <div>
                <label style={labelStyle}>Grading Standard</label>
                <select className="cx-select" style={{ width: '100%' }} value={settings.gradingStandard} onChange={e => update('gradingStandard', e.target.value)}>
                  <option value="A-F">A–F Letter Grades</option>
                  <option value="pass-fail">Pass/Fail</option>
                  <option value="percent">Percentage Only</option>
                  <option value="gpa">GPA Scale</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.hideFinalGrades} onChange={e => update('hideFinalGrades', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Hide Final Grades from Students</span>
                </label>
                <label className="cx-toggle">
                  <input type="checkbox" checked={settings.allowFinalGradeOverride} onChange={e => update('allowFinalGradeOverride', e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Allow Final Grade Override</span>
                </label>
              </div>
            </>
          )}

          {activeSection === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 6px' }}>Blueprint Course Management</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: '0 0 16px' }}>
                  Marking this course as a Blueprint Course allows you to lock specific settings and content items, then sync them down to associated courses.
                </p>
                <label className="cx-toggle" style={{ marginBottom: 20 }}>
                  <input type="checkbox" checked={isBlueprint} onChange={e => setIsBlueprint(e.target.checked)} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
                    Enable Blueprint Course Mode
                  </span>
                </label>
              </div>

              {isBlueprint && (
                <div className="cx-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Associated Course Sections</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>These courses inherit updates from this Blueprint template.</p>
                    </div>
                    <button
                      className="cx-btn cx-btn--primary cx-btn--sm"
                      disabled={syncingBlueprint}
                      onClick={() => {
                        setSyncingBlueprint(true)
                        setTimeout(() => {
                          setSyncingBlueprint(false)
                          setAssociatedCourses(prev => prev.map(c => ({ ...c, status: 'In Sync' })))
                          showToast({
                            title: 'Sync Complete',
                            message: 'Blueprint content synchronized successfully across all associated courses!',
                            type: 'success'
                          })
                        }, 2500)
                      }}
                    >
                      {syncingBlueprint ? 'Syncing...' : 'Sync Content Now'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {associatedCourses.map(c => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--cx-border-subtle)', borderRadius: 8, background: 'var(--cx-bg-surface-raised, #f8fafc)' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)' }}>{c.name}</span>
                        <span className={clsx('cx-badge', c.status === 'In Sync' ? 'cx-badge--success' : 'cx-badge--warning')} style={{ fontSize: '0.6875rem' }}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 6px' }}>Course Navigation Tabs</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: '0 0 16px' }}>
                  Drag items to reorder the sidebar navigation tabs for this course, or toggle visibility to hide folders from student views.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {navTabs.map((tab, idx) => (
                  <div
                    key={tab.id}
                    draggable
                    onDragStart={() => handleTabDragStart(idx)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleTabDrop(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 16px', borderRadius: 8, border: '1px solid var(--cx-border-subtle)',
                      background: dragTabIdx === idx ? 'rgba(99,102,241,0.05)' : 'var(--cx-bg-surface)',
                      cursor: 'grab', transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ marginRight: 12, color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}><GripSvg /></span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: tab.visible ? 'var(--cx-text-primary)' : 'var(--cx-text-tertiary)' }}>
                        {tab.label}
                      </span>
                      {!tab.visible && (
                        <span style={{ marginLeft: 8, fontSize: '0.6875rem', color: 'var(--cx-text-tertiary)', fontStyle: 'italic' }}>
                          (hidden from students)
                        </span>
                      )}
                    </div>
                    <label className="cx-toggle" style={{ margin: 0 }} onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={tab.visible}
                        onChange={e => {
                          const vis = e.target.checked
                          setNavTabs(prev => prev.map((t, i) => i === idx ? { ...t, visible: vis } : t))
                        }}
                      />
                      <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 6 && (
            <div style={{ color: 'var(--cx-text-secondary)', fontSize: '0.875rem' }}>
              <p>System settings for this course are managed in <strong>Account &gt; System Settings</strong>.</p>
              <p style={{ marginTop: 8 }}>Course-level settings include:</p>
              <ul style={{ marginTop: 4, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Course SIS ID (integration with external systems)</li>
                <li>Course grading period configuration</li>
                <li>Course license and usage terms</li>
                <li>Course-level feature flag overrides</li>
              </ul>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <button className="cx-btn cx-btn--primary" onClick={handleSave}><CheckSvg /> Save Settings</button>
          <button className="cx-btn cx-btn--secondary" onClick={() => setSettings(defaultSettings)}>Reset to Defaults</button>
        </div>
      </div>
    </div>
  )
}
