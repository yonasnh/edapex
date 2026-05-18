import React, { useState, useCallback } from 'react'
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
  const [settings, setSettings] = useState<CourseSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [sections, setSections] = useState(['General', 'Course Content', 'Enrollment', 'Grading', 'System'])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

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
