/**
 * CourseFeatureFlags — ClassApex LMS
 * ===================================
 * Canvas REST API integration:
 *   GET /api/v1/courses/:courseId/features         — list course features
 *   PUT /api/v1/courses/:courseId/features/:feature — update state
 *
 * Allows teachers to toggle course-level feature options.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { useRole } from '../contexts/RoleContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseFeature {
  feature: string
  display_name: string
  description: string
  applies_to: string
  beta: boolean
  feature_flag: {
    feature: string
    state: 'on' | 'off' | 'allowed'
    locked: boolean
    transitions: Record<string, { locked?: boolean }>
    parent_state?: string
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stateLabel(state: string): string {
  switch (state) {
    case 'on': return 'Enabled'
    case 'off': return 'Disabled'
    case 'allowed': return 'Allowed'
    default: return state
  }
}

function stateColor(state: string): string {
  switch (state) {
    case 'on': return 'var(--cx-color-success, #059669)'
    case 'off': return 'var(--cx-color-danger, #dc2626)'
    case 'allowed': return 'var(--cx-color-warning, #d97706)'
    default: return 'var(--cx-text-tertiary)'
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CourseFeatureFlagsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { showToast } = useNotification()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'

  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState('all')

  const {
    data: rawFeatures,
    isLoading,
    refetch,
  } = useCanvasQuery<CourseFeature[]>(
    courseId ? `/api/v1/courses/${courseId}/features` : ''
  )

  const features = React.useMemo(() => {
    if (!Array.isArray(rawFeatures)) return []
    return rawFeatures.filter((f: CourseFeature) => f.applies_to === 'Course')
  }, [rawFeatures])

  const toggleFeature = async (featureKey: string, currentState: string) => {
    // Determine next state cycling: off → allowed → on → off
    const nextState = currentState === 'on' ? 'off' : currentState === 'off' ? 'allowed' : 'on'
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/features/flags/${featureKey}?state=${nextState}`, {
        method: 'PUT',
      })
      showToast({
        title: 'Feature Updated',
        message: `${featureKey} set to ${stateLabel(nextState)}`,
        type: 'success',
      })
      refetch()
    } catch (err: any) {
      showToast({
        title: 'Update Failed',
        message: err?.message || `Could not update ${featureKey}`,
        type: 'error',
      })
    }
  }

  const filtered = features.filter((f: CourseFeature) => {
    const q = search.toLowerCase()
    if (search && !f.display_name?.toLowerCase().includes(q) && !f.feature.toLowerCase().includes(q)) return false
    if (filterState !== 'all' && f.feature_flag?.state !== filterState) return false
    return true
  })

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Feature Options</h2>
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--cx-text-tertiary)' }}>You do not have permission to manage course feature options.</p>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', flex: 1 }}>Feature Options</h2>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="search"
          className="cx-assignment-list__search"
          placeholder="Search features…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
          data-testid="feature-search"
        />
        <select
          className="cx-input"
          value={filterState}
          onChange={e => setFilterState(e.target.value)}
          data-testid="feature-filter-state"
        >
          <option value="all">All States</option>
          <option value="on">Enabled</option>
          <option value="off">Disabled</option>
          <option value="allowed">Allowed</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 72, borderRadius: 10 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cx-text-tertiary)' }}>
          <p>{search ? 'No features match your search' : 'No course features available'}</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((f: CourseFeature) => {
            const state = f.feature_flag?.state || 'off'
            const locked = f.feature_flag?.locked
            return (
              <li
                key={f.feature}
                data-testid={`feature-${f.feature}`}
                style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  background: 'var(--cx-bg-surface-elevated)',
                  border: '1px solid var(--cx-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity: locked ? 0.7 : 1,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {f.display_name || f.feature}
                    {f.beta && (
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 10, background: 'rgba(99,102,241,0.12)', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Beta</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                    {f.description}
                  </div>
                  {f.feature_flag?.parent_state && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginTop: 2 }}>
                      Inherited: {stateLabel(f.feature_flag.parent_state)}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 12,
                      textTransform: 'uppercase',
                      background: `${stateColor(state)}15`,
                      color: stateColor(state),
                    }}
                  >
                    {stateLabel(state)}
                  </span>
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    onClick={() => toggleFeature(f.feature, state)}
                    disabled={locked}
                    data-testid={`toggle-${f.feature}`}
                    title={locked ? 'Locked by administrator' : `Change to ${stateLabel(state === 'on' ? 'off' : state === 'off' ? 'allowed' : 'on')}`}
                  >
                    {locked ? 'Locked' : 'Toggle'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginTop: 12, textAlign: 'right' }}>
        {filtered.length} feature{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
