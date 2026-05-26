/**
 * Outcomes — ClassApex LMS (S15)
 * =================================
 * Canvas REST API integration:
 *  GET    /api/v1/courses/:id/outcome_groups                     — outcome groups
 *  POST   /api/v1/courses/:id/outcome_groups                     — create group
 *  PUT    /api/v1/courses/:id/outcome_groups/:id                 — update group
 *  DELETE /api/v1/courses/:id/outcome_groups/:id                 — delete group
 *  GET    /api/v1/courses/:id/outcome_groups/:id/outcomes        — outcomes in group
 *  GET    /api/v1/courses/:id/outcome_results                    — student results
 *  GET    /api/v1/courses/:id/outcome_rollups                    — mastery rollup
 *  POST   /api/v1/courses/:id/outcome_imports                    — import outcomes
 *  GET    /api/v1/courses/:id/outcome_imports/:id                — import status
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'
import OutcomeEditModal from './OutcomeEditModal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OutcomeGroup {
  id: number
  title: string
  description?: string
  outcomes_count: number
  subgroups_count: number
}

interface Outcome {
  id: number
  title: string
  display_name?: string
  description?: string
  mastery_points: number
  points_possible: number
  ratings: { description: string; points: number; mastery: boolean; color?: string }[]
  calculation_method: string
  calculation_int?: number
}

interface OutcomeRollup {
  scores: {
    outcome: { id: number; title: string }
    score: number | null
    count: number
    links: { outcome: string }
  }[]
  links: { user: string; section: string; status: string }
}

// ─── Outcome Detail ───────────────────────────────────────────────────────────

function OutcomeDetail({ courseId, outcome, onBack, onEdit }: { courseId: string; outcome: Outcome; onBack: () => void; onEdit: () => void }) {
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { data: rollups, isLoading } = useCanvasQuery<{ rollups: OutcomeRollup[] }>(
    `/api/v1/courses/${courseId}/outcome_rollups`,
    { outcome_ids: [outcome.id], per_page: 30 } as any
  )

  const scores = rollups?.rollups?.flatMap(r => r.scores.filter(s => String(s.links.outcome) === String(outcome.id))) ?? []
  const masteredCount = scores.filter(s => s.score !== null && s.score >= outcome.mastery_points).length
  const totalCount = scores.filter(s => s.score !== null).length
  const avgScore = totalCount > 0
    ? (scores.reduce((sum, s) => sum + (s.score ?? 0), 0) / totalCount).toFixed(2)
    : 'N/A'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={onBack}>← Back</button>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1.2rem' }}>{outcome.title}</h2>
        {isTeacher && <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onEdit}>Edit</button>}
      </div>
      {outcome.display_name && (
        <p style={{ fontSize: '0.85rem', color: 'var(--cx-text-secondary)', marginBottom: 8 }}>{outcome.display_name}</p>
      )}
      {outcome.description && (
        <div style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', marginBottom: 20, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: outcome.description }} />
      )}

      {/* Rating scale */}
      <div className="cx-card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 14, fontSize: '0.9rem' }}>Proficiency Scale</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {outcome.ratings.map((r, i) => (
            <div key={i} style={{
              flex: '1 1 130px',
              padding: '12px 14px',
              borderRadius: 8,
              background: r.mastery ? 'rgba(16,185,129,0.10)' : 'var(--cx-bg-surface-raised, #f8fafc)',
              border: `1px solid ${r.mastery ? 'rgba(16,185,129,0.3)' : 'var(--cx-border-subtle)'}`,
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: r.mastery ? '#059669' : 'var(--cx-text-primary)' }}>{r.points} pts</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--cx-text-secondary)', marginTop: 2 }}>{r.description}</div>
              {r.mastery && <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>★ Mastery</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Class stats */}
      {isLoading ? (
        <div className="cx-skeleton" style={{ height: 80, borderRadius: 10 }} />
      ) : scores.length > 0 && (
        <div className="cx-card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 14, fontSize: '0.9rem' }}>Class Performance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Students Mastered', value: `${masteredCount} / ${totalCount}` },
              { label: 'Mastery Rate', value: totalCount > 0 ? `${Math.round((masteredCount / totalCount) * 100)}%` : 'N/A' },
              { label: 'Avg Score', value: avgScore },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--cx-bg-surface-raised, #f8fafc)', borderRadius: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--cx-color-primary)' }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Outcomes Page ───────────────────────────────────────────────────────

export default function OutcomesPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null)
  const [editingOutcome, setEditingOutcome] = useState<any | null>(null)
  const [editingGroup, setEditingGroup] = useState<any | null>(null)
  const [groupForm, setGroupForm] = useState({ title: '', description: '' })

  // Import states
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importLog, setImportLog] = useState<string[]>([])
  const [, setImportJobId] = useState<string | null>(null)

  const { data: groups, isLoading: groupsLoading, refetch: refetchGroups } = useCanvasQuery<OutcomeGroup[]>(
    courseId ? `/api/v1/courses/${courseId}/outcome_groups` : '',
    { per_page: 50 } as any
  )

  const { data: outcomesData, isLoading: outcomesLoading, refetch: refetchOutcomes } = useCanvasQuery<Outcome[]>(
    selectedGroupId ? `/api/v1/courses/${courseId}/outcome_groups/${selectedGroupId}/outcomes` : '',
    { per_page: 100 } as any
  )

  const outcomes = outcomesData || []

  const handleDeleteOutcome = async (outcome: Outcome) => {
    if (!selectedGroupId || !courseId) return
    const confirmed = await showConfirm({
      title: 'Delete Outcome?',
      message: `Permanently delete "${outcome.title}"? This cannot be undone.`,
      type: 'danger',
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/outcome_groups/${selectedGroupId}/outcomes/${outcome.id}`, { method: 'DELETE' })
      showToast({ title: 'Outcome deleted', type: 'success' })
      refetchOutcomes()
      setSelectedOutcome(null)
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleDeleteGroup = async (group: OutcomeGroup) => {
    if (!courseId) return
    const confirmed = await showConfirm({
      title: 'Delete Group?',
      message: `Permanently delete "${group.title}" and all its outcomes? This cannot be undone.`,
      type: 'danger',
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/outcome_groups/${group.id}`, { method: 'DELETE' })
      showToast({ title: 'Group deleted', type: 'success' })
      refetchGroups()
      setSelectedGroupId(null)
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleSaveGroup = async () => {
    if (!groupForm.title.trim()) {
      showToast({ title: 'Group title is required', type: 'error' })
      return
    }
    try {
      if (editingGroup?.id) {
        await canvasFetch(`/api/v1/courses/${courseId}/outcome_groups/${editingGroup.id}`, {
          method: 'PUT',
          body: { title: groupForm.title.trim(), description: groupForm.description.trim() },
        })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/outcome_groups`, {
          method: 'POST',
          body: { title: groupForm.title.trim(), description: groupForm.description.trim() },
        })
      }
      showToast({ title: `Group ${editingGroup?.id ? 'updated' : 'created'}`, type: 'success' })
      setEditingGroup(null)
      setGroupForm({ title: '', description: '' })
      refetchGroups()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleFileImport = async (file: File) => {
    if (!courseId) return
    setIsImporting(true)
    setImportProgress(0)
    setImportLog(['Uploading outcome import package...'])
    try {
      const formData = new FormData()
      formData.append('import_type', 'instructure_csv')
      formData.append('file', file)
      const result = await canvasFetch(`/api/v1/courses/${courseId}/outcome_imports`, {
        method: 'POST',
        body: formData,
      })
      setImportJobId(String(result.id))
      setImportLog(prev => [...prev, `Import job #${result.id} started. Polling for status...`])
      pollImportStatus(String(result.id))
    } catch (err: any) {
      setIsImporting(false)
      setImportLog(prev => [...prev, `ERROR: ${err.message || 'Upload failed'}`])
      showToast({ title: 'Import failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const pollImportStatus = async (jobId: string) => {
    if (!courseId) return
    let attempts = 0
    const maxAttempts = 30
    const interval = setInterval(async () => {
      attempts++
      try {
        const status = await canvasFetch(`/api/v1/courses/${courseId}/outcome_imports/${jobId}`, { method: 'GET' })
        const pct = Math.min((attempts / maxAttempts) * 100, 95)
        setImportProgress(Math.round(pct))
        setImportLog(prev => [...prev, `> Job ${jobId} status: ${status.workflow_state || 'unknown'} (${Math.round(pct)}%)`])
        if (status.workflow_state === 'succeeded' || status.workflow_state === 'imported') {
          clearInterval(interval)
          setImportProgress(100)
          setIsImporting(false)
          setImportLog(prev => [...prev, 'Import completed successfully!'])
          showToast({ title: 'Import completed', type: 'success' })
          refetchGroups()
        } else if (status.workflow_state === 'failed') {
          clearInterval(interval)
          setIsImporting(false)
          setImportLog(prev => [...prev, 'Import failed.'])
          showToast({ title: 'Import failed', type: 'error' })
        }
        if (attempts >= maxAttempts) {
          clearInterval(interval)
          setIsImporting(false)
          setImportLog(prev => [...prev, 'Polling timed out. Check Canvas admin for final status.'])
        }
      } catch (err: any) {
        clearInterval(interval)
        setIsImporting(false)
        setImportLog(prev => [...prev, `ERROR polling: ${err.message}`])
      }
    }, 2000)
  }

  if (selectedOutcome && courseId) {
    return (
      <div className="cx-page">
        <OutcomeDetail
          courseId={courseId}
          outcome={selectedOutcome}
          onBack={() => setSelectedOutcome(null)}
          onEdit={() => setEditingOutcome(selectedOutcome)}
        />
        {editingOutcome && selectedGroupId && (
          <OutcomeEditModal
            outcome={editingOutcome}
            courseId={courseId}
            groupId={selectedGroupId}
            onClose={() => setEditingOutcome(null)}
            onSave={() => { setEditingOutcome(null); refetchOutcomes() }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Outcomes &amp; Mastery</h2>
        {isTeacher && (
          <button className="cx-btn cx-btn--primary" onClick={() => { setEditingGroup({}); setGroupForm({ title: '', description: '' }) }}>+ New Group</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedGroupId ? '260px 1fr' : '1fr', gap: 20 }}>
        {/* Groups column */}
        <div>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Outcome Groups
          </h3>
          {groupsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 48, borderRadius: 8 }} />)}
            </div>
          ) : !groups || groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cx-text-tertiary)' }}>
              <svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ marginBottom: 8, opacity: 0.35 }}><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="5"/><circle cx="10" cy="10" r="2" fill="currentColor" stroke="none"/></svg>
              <p style={{ fontSize: '0.875rem' }}>No outcome groups configured.</p>
              {isTeacher && (
                <button className="cx-btn cx-btn--primary cx-btn--sm" style={{ marginTop: 8 }} onClick={() => { setEditingGroup({}); setGroupForm({ title: '', description: '' }) }}>
                  Create Group
                </button>
              )}
            </div>
          ) : (
            <div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {groups.map(group => (
                  <li
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    style={{
                      padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                      background: selectedGroupId === group.id ? 'rgba(var(--cx-color-primary-rgb, 99,102,241), 0.1)' : 'var(--cx-bg-surface)',
                      border: `1px solid ${selectedGroupId === group.id ? 'var(--cx-color-primary)' : 'var(--cx-border-subtle)'}`,
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, opacity: 0.6 }}><path d="M1.5 4a1 1 0 011-1h5l2 2h7a1 1 0 011 1v10a1 1 0 01-1 1h-14a1 1 0 01-1-1V4z"/></svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cx-text-primary)' }}>{group.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--cx-text-tertiary)', marginTop: 2 }}>{group.outcomes_count} outcomes</div>
                    </div>
                    {isTeacher && (
                      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { setEditingGroup(group); setGroupForm({ title: group.title, description: group.description || '' }) }} title="Edit">✎</button>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteGroup(group)} title="Delete" style={{ color: 'var(--cx-color-danger, #dc2626)' }}>🗑</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Outcomes column */}
        {selectedGroupId && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Outcomes
              </h3>
              {isTeacher && (
                <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setEditingOutcome({})}>+ New Outcome</button>
              )}
            </div>
            {outcomesLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3,4].map(i => <div key={i} className="cx-skeleton" style={{ height: 64, borderRadius: 10 }} />)}
              </div>
            ) : !outcomes || outcomes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cx-text-tertiary)' }}>
                <p style={{ fontSize: '0.875rem' }}>No outcomes in this group.</p>
                {isTeacher && (
                  <button className="cx-btn cx-btn--primary cx-btn--sm" style={{ marginTop: 8 }} onClick={() => setEditingOutcome({})}>Create Outcome</button>
                )}
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {outcomes.map(outcome => (
                  <li
                    key={outcome.id}
                    className="cx-card"
                    style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                    onClick={() => setSelectedOutcome(outcome)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 3 }}>{outcome.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                        Mastery at {outcome.mastery_points} pts · {outcome.points_possible} pts max · {outcome.ratings.length} levels
                      </div>
                    </div>
                    {isTeacher && (
                      <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setEditingOutcome(outcome)} title="Edit">✎</button>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteOutcome(outcome)} title="Delete" style={{ color: 'var(--cx-color-danger, #dc2626)' }}>🗑</button>
                      </div>
                    )}
                    <span style={{ color: 'var(--cx-text-tertiary)', fontSize: '1.2rem' }}>›</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Outcome Import/Export Administration Center */}
      <div className="cx-card" style={{ marginTop: 24, padding: 20 }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
          Outcomes Import / Export Center
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: 'var(--cx-text-secondary)' }}>
          Import standard educational outcomes in Academic Benchmarks CSV format or export current course mappings.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* CSV File Upload Section */}
          <div style={{
            border: '2px dashed var(--cx-border-subtle)',
            borderRadius: 8,
            padding: 20,
            textAlign: 'center',
            background: 'var(--cx-bg-surface-raised, #f8fafc)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ marginBottom: 8, opacity: 0.5 }}><path d="M10 2v10M6 8l4 4 4-4"/><path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2"/></svg>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
              Drag &amp; drop standard CSV file here
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
              or click to browse local filesystem
            </span>

            <input
              type="file"
              accept=".csv,.json"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFileImport(file)
              }}
            />
          </div>

          {/* Logs & Actions Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ flex: 1, background: 'var(--cx-bg-surface-sunken, #0f172a)', color: '#38bdf8', padding: '12px 16px', borderRadius: 8, fontFamily: 'var(--cm-font-family-mono, monospace)', fontSize: '0.72rem', minHeight: '120px', overflowY: 'auto' }}>
              <div style={{ color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: 4, marginBottom: 6, fontWeight: 'bold' }}>
                Outcome Import Sync Stream
              </div>
              {importLog.length === 0 ? (
                <div style={{ color: '#64748b', fontStyle: 'italic' }}>Awaiting file upload package import...</div>
              ) : (
                importLog.map((log, index) => (
                  <div key={index} style={{ marginBottom: 4 }}>&gt; {log}</div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="cx-btn cx-btn--primary"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(groups || [], null, 2))
                  const downloadAnchor = document.createElement('a')
                  downloadAnchor.setAttribute("href", dataStr)
                  downloadAnchor.setAttribute("download", `course-${courseId}-outcomes-export.json`)
                  document.body.appendChild(downloadAnchor)
                  downloadAnchor.click()
                  downloadAnchor.remove()
                }}
                style={{ flex: 1 }}
              >
                Export Course Outcomes
              </button>
            </div>
          </div>
        </div>

        {isImporting && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
              <span>Uploading package data...</span>
              <span>{importProgress}%</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'var(--cx-border-subtle)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${importProgress}%`, height: '100%', background: 'var(--cx-color-primary)', transition: 'width 0.2s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Group Edit Modal */}
      {editingGroup && (
        <div className="cx-modal-overlay" onClick={() => setEditingGroup(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{
            background: 'var(--cx-bg-surface)', borderRadius: 12, width: '100%', maxWidth: 480,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--cx-border-subtle)' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--cx-text-primary)' }}>
                {editingGroup.id ? 'Edit Group' : 'New Group'}
              </h3>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Group Title *</label>
                <input type="text" className="cx-input" value={groupForm.title} onChange={e => setGroupForm(prev => ({ ...prev, title: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea className="cx-input" rows={3} value={groupForm.description} onChange={e => setGroupForm(prev => ({ ...prev, description: e.target.value }))} style={{ width: '100%', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--cx-border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="cx-btn cx-btn--secondary" onClick={() => setEditingGroup(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSaveGroup}>
                {editingGroup.id ? 'Save Changes' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Edit Modal */}
      {editingOutcome && selectedGroupId && courseId && (
        <OutcomeEditModal
          outcome={editingOutcome.id ? editingOutcome : null}
          courseId={courseId}
          groupId={selectedGroupId}
          onClose={() => setEditingOutcome(null)}
          onSave={() => { setEditingOutcome(null); refetchOutcomes() }}
        />
      )}
    </div>
  )
}
