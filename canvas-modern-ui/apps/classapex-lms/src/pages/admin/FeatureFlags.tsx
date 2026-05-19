import React, { useState } from 'react'

interface FeatureFlag {
  id: string
  key: string
  label: string
  description: string
  state: 'on' | 'off' | 'allowed'
  appliesTo: 'account' | 'course' | 'user'
  beta: boolean
  autoEnable: boolean
  lastModified: string
}

// We will fetch this data from Canvas API instead
// const mockFlags: FeatureFlag[] = ...

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function FlagSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 17V3h8l1 2h4v9H9l-1-2H4z"/></svg>; }
function CheckSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7l3 3 5-6"/></svg>; }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>; }
function InfoSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 7v3.5"/><circle cx="8" cy="5.5" r="0.5" fill="currentColor"/></svg>; }

import { useCanvasQuery } from '../../hooks/useCanvasQuery'

export default function FeatureFlagsPage() {
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState('all')
  const [filterApplies, setFilterApplies] = useState('all')
  const { data: canvasFlags, refetch } = useCanvasQuery<any[]>('/api/v1/accounts/1/features')

  const flags = React.useMemo<FeatureFlag[]>(() => {
    if (!Array.isArray(canvasFlags)) return [];
    return canvasFlags.map(f => ({
      id: f.feature,
      key: f.feature,
      label: f.display_name || f.name || f.feature,
      description: f.description || '',
      state: f.state || 'off', // on, off, allowed
      appliesTo: f.applies_to || 'account',
      beta: !!f.beta,
      autoEnable: !!f.autoexpand,
      lastModified: new Date().toLocaleDateString(),
    }));
  }, [canvasFlags]);

  const toggleFlag = async (key: string, currentState: string) => {
    const nextState = currentState === 'on' ? 'off' : currentState === 'off' ? 'allowed' : 'on'
    try {
      const res = await fetch(`/api/v1/accounts/1/features/flags/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `state=${nextState}`
      })
      if (!res.ok) throw new Error('Failed to update feature flag')
      refetch()
    } catch (err) {
      console.error(err)
      alert('Failed to update feature flag.')
    }
  }

  const filtered = flags.filter(f => {
    if (search && !f.label.toLowerCase().includes(search.toLowerCase()) && !f.key.toLowerCase().includes(search.toLowerCase())) return false
    if (filterState !== 'all' && f.state !== filterState) return false
    if (filterApplies !== 'all' && f.appliesTo !== filterApplies) return false
    return true
  })

  const stats = {
    total: flags.length,
    on: flags.filter(f => f.state === 'on').length,
    allowed: flags.filter(f => f.state === 'allowed').length,
    off: flags.filter(f => f.state === 'off').length,
    beta: flags.filter(f => f.beta).length,
  }

  const stateColor = (s: string) => s === 'on' ? 'var(--cx-color-success)' : s === 'allowed' ? 'var(--cx-color-warning)' : 'var(--cx-color-danger)'

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Feature Flags</h1>
          <p className="cx-page__subtitle">Manage feature availability across the platform</p>
        </div>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Flags', value: stats.total, icon: <FlagSvg /> },
          { label: 'Enabled', value: stats.on, icon: <CheckSvg />, color: 'var(--cx-color-success)' },
          { label: 'Allowed', value: stats.allowed, icon: <InfoSvg />, color: 'var(--cx-color-warning)' },
          { label: 'Beta Features', value: stats.beta, icon: <FlagSvg />, color: 'var(--cx-color-primary)' },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cx-section">
        <div className="cx-toolbar">
          <div className="cx-search">
            <SearchSvg />
            <input type="search" className="cx-search__input" placeholder="Search flags..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="cx-select" value={filterState} onChange={e => setFilterState(e.target.value)}>
            <option value="all">All States</option>
            <option value="on">On</option>
            <option value="allowed">Allowed</option>
            <option value="off">Off</option>
          </select>
          <select className="cx-select" value={filterApplies} onChange={e => setFilterApplies(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="account">Account</option>
            <option value="course">Course</option>
            <option value="user">User</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="cx-empty">
            <FlagSvg />
            <h3>No feature flags found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(flag => (
              <div key={flag.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--cx-bg-surface)' }}>
                <button
                  onClick={() => toggleFlag(flag.key, flag.state)}
                  style={{ flexShrink: 0, width: 40, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', background: flag.state === 'on' ? 'var(--cx-color-success)' : flag.state === 'allowed' ? 'var(--cx-color-warning)' : 'var(--cx-border-default)' }}
                  aria-label={`Toggle ${flag.label}`}
                >
                  <span style={{ position: 'absolute', top: 2, left: flag.state === 'on' ? 20 : flag.state === 'allowed' ? 10 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)' }}>{flag.label}</span>
                    {flag.beta && <span className="cx-badge cx-badge--accent" style={{ fontSize: '0.625rem' }}>Beta</span>}
                    <span className="cx-badge cx-badge--neutral" style={{ fontSize: '0.625rem' }}>{flag.appliesTo}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)', margin: '2px 0 0' }}>{flag.description}</p>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--cx-text-tertiary)' }}>Key: {flag.key} · Updated {flag.lastModified}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: stateColor(flag.state), textTransform: 'uppercase' }}>{flag.state}</span>
                  {flag.state === 'allowed' && <span style={{ fontSize: '0.625rem', color: 'var(--cx-text-tertiary)' }}>opt-in</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
