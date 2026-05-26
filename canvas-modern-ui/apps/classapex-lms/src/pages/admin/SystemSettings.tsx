import React, { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery';
import { useNotification } from '../../hooks/useNotification';

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function FlagSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 17V3h8l1 2h4v9H9l-1-2H4z"/></svg>; }
function UploadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2v8M4 7l3-3 3 3"/><path d="M2 11v1h10v-1"/></svg>; }
function DownloadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10V2M4 7l3 3 3-3"/><path d="M2 11v1h10v-1"/></svg>; }

interface AccountFeature {
  feature: string
  feature_flag: {
    feature: string
    state: string
    locked: boolean
    display_name: string
    description: string
  }
}

export default function SystemSettingsPage() {
  const { showToast } = useNotification()
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)

  const { data: accountData, isLoading: accountLoading, refetch: refetchAccount } = useCanvasQuery<any>('/api/v1/accounts/1')
  const { data: featuresData, isLoading: featuresLoading, refetch: refetchFeatures } = useCanvasQuery<AccountFeature[]>('/api/v1/accounts/1/features')

  const [form, setForm] = useState<Record<string, any>>({})

  useEffect(() => {
    if (accountData) {
      setForm({
        name: accountData.name || '',
        default_time_zone: accountData.default_time_zone || 'UTC',
        default_storage_quota_mb: accountData.default_storage_quota_mb || 500,
        users_can_edit_name: accountData.users_can_edit_name ?? true,
        users_can_edit_comm_channels: accountData.users_can_edit_comm_channels ?? true,
        restrict_student_past_view: accountData.restrict_student_past_view ?? false,
        restrict_student_future_view: accountData.restrict_student_future_view ?? false,
      })
    }
  }, [accountData])

  const features = useMemo(() => Array.isArray(featuresData) ? featuresData : [], [featuresData])

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return features
    const q = searchTerm.toLowerCase()
    return features.filter(f =>
      (f.feature_flag?.display_name || '').toLowerCase().includes(q) ||
      (f.feature_flag?.feature || '').toLowerCase().includes(q) ||
      (f.feature_flag?.description || '').toLowerCase().includes(q)
    )
  }, [features, searchTerm])

  const handleSaveAccount = async () => {
    setSaving(true)
    try {
      await canvasFetch('/api/v1/accounts/1', {
        method: 'PUT',
        body: {
          name: form.name,
          default_time_zone: form.default_time_zone,
          default_storage_quota_mb: Number(form.default_storage_quota_mb),
          users_can_edit_name: !!form.users_can_edit_name,
          users_can_edit_comm_channels: !!form.users_can_edit_comm_channels,
          restrict_student_past_view: !!form.restrict_student_past_view,
          restrict_student_future_view: !!form.restrict_student_future_view,
        },
      })
      showToast({ title: 'Account settings saved', type: 'success' })
      refetchAccount()
    } catch (err: any) {
      showToast({ title: 'Failed to save', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleFeature = async (feature: string, currentState: string) => {
    const newState = currentState === 'on' ? 'off' : 'on'
    try {
      await canvasFetch(`/api/v1/accounts/1/features/${feature}`, {
        method: 'PUT',
        body: { state: newState },
      })
      showToast({ title: `Feature ${newState === 'on' ? 'enabled' : 'disabled'}`, type: 'success' })
      refetchFeatures()
    } catch (err: any) {
      showToast({ title: 'Failed to toggle feature', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const inpStyle: React.CSSProperties = {
    border: '1px solid var(--cx-border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
    width: '100%',
    background: 'var(--cx-bg-surface)',
    color: 'var(--cx-text-primary)',
    fontFamily: 'inherit',
    fontSize: 'var(--cx-text-sm)',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--cx-text-primary)',
    display: 'block',
    marginBottom: 4,
  }

  const isLoading = accountLoading || featuresLoading

  if (isLoading && activeTab === 0) {
    return (
      <div className="cx-page">
        <div className="cx-loading" role="status" aria-label="Loading settings">
          <div className="cx-loading__spinner" />
          <span className="cx-loading__text">Loading system settings…</span>
        </div>
      </div>
    )
  }

  const tabs = ['Account Settings', 'Feature Flags', 'Backup & Demo Data']

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">System Settings</h1>
          <p className="cx-page__subtitle">Configure platform-wide account settings and feature flags.</p>
        </div>
      </div>

      <div className="cx-tabs">
        {tabs.map((tab, i) => (
          <button key={i} className={clsx('cx-tab', activeTab === i && 'cx-tab--active')} onClick={() => setActiveTab(i)}>{tab}</button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="cx-section" style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Institution Name</label>
              <input type="text" style={inpStyle} value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Default Time Zone</label>
              <input type="text" style={inpStyle} value={form.default_time_zone || ''} onChange={e => setForm(p => ({ ...p, default_time_zone: e.target.value }))} placeholder="America/New_York" />
            </div>
            <div>
              <label style={labelStyle}>Default Storage Quota (MB)</label>
              <input type="number" style={inpStyle} min={0} value={form.default_storage_quota_mb || 0} onChange={e => setForm(p => ({ ...p, default_storage_quota_mb: Number(e.target.value) }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 8 }}>
              {[
                { key: 'users_can_edit_name', label: 'Users can edit their name' },
                { key: 'users_can_edit_comm_channels', label: 'Users can edit communication channels' },
                { key: 'restrict_student_past_view', label: 'Restrict students from viewing past courses' },
                { key: 'restrict_student_future_view', label: 'Restrict students from viewing future courses' },
              ].map(toggle => (
                <label key={toggle.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!form[toggle.key]}
                    onChange={e => setForm(p => ({ ...p, [toggle.key]: e.target.checked }))}
                    style={{ accentColor: 'var(--cx-color-primary)', width: 18, height: 18 }}
                  />
                  {toggle.label}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12 }}>
              <button className="cx-btn cx-btn--primary" onClick={handleSaveAccount} disabled={saving}>
                {saving ? 'Saving…' : 'Save Account Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="cx-section">
          <div className="cx-toolbar" style={{ marginBottom: 16 }}>
            <div className="cx-search">
              <SearchSvg />
              <input type="search" className="cx-search__input" placeholder="Search features..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {filteredFeatures.length === 0 ? (
            <div className="cx-empty" style={{ marginTop: 32 }}>
              <FlagSvg />
              <h3>No features found</h3>
              <p>Try adjusting your search.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredFeatures.map(f => {
                const flag = f.feature_flag
                const state = flag.state || 'disabled'
                const isOn = state === 'on' || state === 'allowed'
                return (
                  <div key={flag.feature} className="cx-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: 0 }}>{flag.display_name || flag.feature}</h4>
                        <span className={clsx('cx-badge', isOn ? 'cx-badge--success' : 'cx-badge--neutral')} style={{ fontSize: '0.625rem' }}>{state}</span>
                        {flag.locked && <span className="cx-badge cx-badge--warning" style={{ fontSize: '0.625rem' }}>Locked</span>}
                      </div>
                      {flag.description && <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)', margin: 0 }}>{flag.description}</p>}
                    </div>
                    <label className="cx-toggle" style={{ flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={isOn}
                        disabled={flag.locked}
                        onChange={() => handleToggleFeature(flag.feature, state)}
                      />
                      <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    </label>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="cx-section">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 16px' }}>Backup, Restore & Demo Data</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 24 }}>Manage system backups and development demo data.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            <div className="cx-card">
              <div className="cx-card__header"><h3 className="cx-card__title">Manual Backup</h3></div>
              <div className="cx-card__body">
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 12 }}>Create an immediate backup of all system data.</p>
                <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => showToast({ title: 'Backup initiated', type: 'info' })}><UploadSvg /> Create Backup Now</button>
              </div>
            </div>

            <div className="cx-card">
              <div className="cx-card__header"><h3 className="cx-card__title">Restore from Backup</h3></div>
              <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Upload backup file</label>
                  <input type="file" style={inpStyle} accept=".backup,.zip" />
                </div>
                <button className="cx-btn cx-btn--danger cx-btn--sm" disabled><DownloadSvg /> Restore System</button>
              </div>
            </div>

            <div className="cx-card">
              <div className="cx-card__header"><h3 className="cx-card__title">Demo Data</h3></div>
              <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: 0 }}>Populate or clean demonstration data for evaluation.</p>
                <button className="cx-btn cx-btn--secondary cx-btn--sm" style={{ width: '100%' }} onClick={() => showToast({ title: 'Cleanup not available', type: 'warning' })}>Clean Up Test Records</button>
                <button className="cx-btn cx-btn--primary cx-btn--sm" style={{ width: '100%' }} onClick={() => showToast({ title: 'Import not available', type: 'warning' })}>Import Demo Data</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
