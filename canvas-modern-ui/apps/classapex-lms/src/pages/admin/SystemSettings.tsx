import React, { useState, useMemo } from 'react';
import clsx from 'clsx';

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>; }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function AlertSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/></svg>; }
function XCircleSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M6 6l4 4M10 6l-4 4"/></svg>; }
function SettingsSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>; }
function EyeSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>; }
function ShieldSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1l7 3v5a7 7 0 01-7 7 7 7 0 01-7-7V4l7-3z"/><path d="M7 10l2 2 4-4"/></svg>; }
function MailSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="16" height="12" rx="2"/><path d="M2 6l8 5 8-5"/></svg>; }
function BellSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a6 6 0 00-6 6c0 3-1 5-2 6h16c-1-1-2-3-2-6a6 6 0 00-6-6z"/><path d="M8 14a2 2 0 004 0"/></svg>; }
function ConnectSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 10a5 5 0 0110 0M7 10a3 3 0 016 0"/><circle cx="10" cy="10" r="1" fill="currentColor"/></svg>; }
function ArchiveSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="16" height="4" rx="1"/><path d="M3 6v10a1 1 0 001 1h12a1 1 0 001-1V6"/><path d="M8 10h4"/></svg>; }
function DownloadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10V2M4 7l3 3 3-3"/><path d="M2 11v1h10v-1"/></svg>; }
function UploadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2v8M4 7l3-3 3 3"/><path d="M2 11v1h10v-1"/></svg>; }
function ResetSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7a6 6 0 0111-4M13 3v4H9"/><path d="M13 7a6 6 0 01-11 4M1 11V7h4"/></svg>; }
function ChevronDownSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5l3 3 3-3"/></svg>; }
function ChevronRightSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4l3 3-3 3"/></svg>; }
function PaletteSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="13" cy="7" r="1" fill="currentColor"/><circle cx="10" cy="13" r="1" fill="currentColor"/><path d="M14 11c-1 0-2 1-2 2"/><path d="M6 11c1 0 2 1 2 2"/></svg>; }

interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'file';
  isPublic: boolean;
  updatedAt: string;
  updatedBy: { id: string; name: string };
  options?: string[];
  validation?: { required?: boolean; min?: number; max?: number; pattern?: string };
}

const mockSettings: SystemSetting[] = [
  { id: '1', category: 'general', key: 'institution_name', value: 'ClassApex University', description: 'The name of your institution displayed throughout the platform', type: 'string', isPublic: true, updatedAt: '2024-01-15T10:30:00Z', updatedBy: { id: 'admin1', name: 'Admin User' }, validation: { required: true } },
  { id: '2', category: 'general', key: 'default_timezone', value: 'America/New_York', description: 'Default timezone for the institution', type: 'string', isPublic: true, updatedAt: '2024-01-14T16:45:00Z', updatedBy: { id: 'admin1', name: 'Admin User' }, options: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'UTC'] },
  { id: '3', category: 'security', key: 'password_min_length', value: '8', description: 'Minimum password length for user accounts', type: 'number', isPublic: false, updatedAt: '2024-01-10T09:15:00Z', updatedBy: { id: 'admin1', name: 'Admin User' }, validation: { required: true, min: 6, max: 32 } },
  { id: '4', category: 'security', key: 'enable_two_factor', value: 'true', description: 'Require two-factor authentication for all users', type: 'boolean', isPublic: false, updatedAt: '2024-01-12T14:20:00Z', updatedBy: { id: 'admin1', name: 'Admin User' } },
  { id: '5', category: 'email', key: 'smtp_server', value: 'smtp.university.edu', description: 'SMTP server for sending emails', type: 'string', isPublic: false, updatedAt: '2024-01-08T11:30:00Z', updatedBy: { id: 'admin1', name: 'Admin User' }, validation: { required: true } },
  { id: '6', category: 'email', key: 'smtp_port', value: '587', description: 'SMTP server port', type: 'number', isPublic: false, updatedAt: '2024-01-08T11:30:00Z', updatedBy: { id: 'admin1', name: 'Admin User' }, validation: { required: true, min: 1, max: 65535 } },
  { id: '7', category: 'notifications', key: 'enable_email_notifications', value: 'true', description: 'Enable email notifications for users', type: 'boolean', isPublic: true, updatedAt: '2024-01-13T15:45:00Z', updatedBy: { id: 'admin1', name: 'Admin User' } },
  { id: '8', category: 'storage', key: 'max_file_size', value: '104857600', description: 'Maximum file upload size in bytes (100MB)', type: 'number', isPublic: false, updatedAt: '2024-01-11T12:00:00Z', updatedBy: { id: 'admin1', name: 'Admin User' }, validation: { required: true, min: 1048576, max: 1073741824 } },
  { id: '9', category: 'integrations', key: 'google_oauth_enabled', value: 'false', description: 'Enable Google OAuth for user authentication', type: 'boolean', isPublic: false, updatedAt: '2024-01-09T10:15:00Z', updatedBy: { id: 'admin1', name: 'Admin User' } },
  { id: '10', category: 'appearance', key: 'primary_color', value: '#0f62fe', description: 'Primary brand color for the platform', type: 'string', isPublic: true, updatedAt: '2024-01-07T14:30:00Z', updatedBy: { id: 'admin1', name: 'Admin User' }, validation: { pattern: '^#[0-9A-Fa-f]{6}$' } },
];

const categories = [
  { id: 'general', name: 'General', icon: <SettingsSvg /> },
  { id: 'security', name: 'Security', icon: <ShieldSvg /> },
  { id: 'email', name: 'Email', icon: <MailSvg /> },
  { id: 'notifications', name: 'Notifications', icon: <BellSvg /> },
  { id: 'integrations', name: 'Integrations', icon: <ConnectSvg /> },
  { id: 'storage', name: 'Storage', icon: <ArchiveSvg /> },
  { id: 'appearance', name: 'Appearance', icon: <PaletteSvg /> },
];

import { useCanvasQuery } from '../../hooks/useCanvasQuery';

const AdminSystemSettingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const { data: canvasSettings, refetch } = useCanvasQuery<any>('/api/v1/accounts/1/settings')

  const settings = useMemo(() => {
    if (!canvasSettings) return mockSettings;
    
    // Map canvas settings to our mock schema
    const mapped = [...mockSettings];
    
    const updateSetting = (key: string, value: any) => {
      const idx = mapped.findIndex(s => s.key === key);
      if (idx !== -1 && value !== undefined) {
        mapped[idx] = { ...mapped[idx], value: String(value) };
      }
    };

    updateSetting('default_timezone', canvasSettings.default_time_zone);
    updateSetting('institution_name', canvasSettings.name);
    updateSetting('max_file_size', canvasSettings.default_storage_quota_mb ? String(canvasSettings.default_storage_quota_mb * 1024 * 1024) : undefined);
    // Many other settings are enterprise-specific or not exposed in standard API, keeping mock defaults for them

    return mapped;
  }, [canvasSettings]);

  const filteredSettings = useMemo(() => {
    let filtered = settings;
    if (searchTerm) filtered = filtered.filter(s => s.key.toLowerCase().includes(searchTerm.toLowerCase()) || s.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterCategory !== 'all') filtered = filtered.filter(s => s.category === filterCategory);
    return filtered;
  }, [searchTerm, filterCategory, settings]);

  const settingsByCategory = useMemo(() => {
    const grouped: Record<string, SystemSetting[]> = {};
    filteredSettings.forEach(s => { if (!grouped[s.category]) grouped[s.category] = []; grouped[s.category].push(s); });
    return grouped;
  }, [filteredSettings]);

  const stats = useMemo(() => ({
    total: mockSettings.length,
    public: mockSettings.filter(s => s.isPublic).length,
    recent: mockSettings.filter(s => { const w = new Date(); w.setDate(w.getDate() - 7); return new Date(s.updatedAt) > w; }).length,
    categories: new Set(mockSettings.map(s => s.category)).size,
  }), []);

  const formatValue = (s: SystemSetting) => {
    if (s.type === 'boolean') return s.value === 'true' ? 'Enabled' : 'Disabled';
    if (s.type === 'number' && (s.key.includes('size') || s.key.includes('bytes'))) {
      const b = parseInt(s.value); const sizes = ['B', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(b) / Math.log(1024));
      return `${(b / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }
    return s.value;
  };

  const handleEditSetting = (s: SystemSetting) => { setSelectedSetting(s); setEditValue(s.value); setShowEditModal(true); };
  const handleSaveSetting = async () => {
    if (selectedSetting) {
      try {
        const formData = new URLSearchParams()
        
        // Map back to canvas keys
        if (selectedSetting.key === 'default_timezone') formData.append('default_time_zone', editValue)
        if (selectedSetting.key === 'institution_name') formData.append('name', editValue)
        if (selectedSetting.key === 'max_file_size') formData.append('default_storage_quota_mb', String(Math.floor(parseInt(editValue) / (1024 * 1024))))

        if (Array.from(formData.keys()).length > 0) {
          const res = await fetch('/api/v1/accounts/1/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
          })
          if (!res.ok) throw new Error('Failed to update setting')
          refetch()
        }
        
        setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000); 
      } catch (err) {
        console.error(err);
        setShowWarning(true); setTimeout(() => setShowWarning(false), 3000);
      }
    }
    setShowEditModal(false); setSelectedSetting(null); setEditValue(''); setHasUnsavedChanges(false);
  };
  const handleResetToDefaults = () => console.log('Resetting all settings to defaults');
  const handleExportSettings = () => console.log('Exporting system settings');
  const handleImportSettings = () => console.log('Importing system settings');

  const inpStyle: React.CSSProperties = { border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 };
  const toggleLabelStyle: React.CSSProperties = { fontSize: '0.8125rem', color: 'var(--cx-text-primary)' };

  const renderSettingInput = (setting: SystemSetting, value: string, onChange: (v: string) => void) => {
    if (setting.type === 'boolean') {
      return (
        <label className="cx-toggle">
          <input type="checkbox" checked={value === 'true'} onChange={e => onChange(e.target.checked.toString())} />
          <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
        </label>
      );
    }
    if (setting.type === 'number') {
      return <input type="number" style={inpStyle} value={parseInt(value) || 0} min={setting.validation?.min} max={setting.validation?.max} onChange={e => onChange(e.target.value)} />;
    }
    if (setting.options) {
      return (
        <select className="cx-select" style={{ width: '100%' }} value={value} onChange={e => onChange(e.target.value)}>
          {setting.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    return <input type="text" style={inpStyle} value={value} onChange={e => onChange(e.target.value)} placeholder={setting.description} />;
  };

  const tabs = ['All Settings', 'Security', 'Integrations', 'Backup & Restore'];

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">System Settings</h1>
          <p className="cx-page__subtitle">Configure platform-wide settings. Manage system configuration, security, integrations, and platform behavior.</p>
        </div>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Settings', value: stats.total, icon: <SettingsSvg /> },
          { label: 'Public Settings', value: stats.public, icon: <EyeSvg /> },
          { label: 'Recently Updated', value: stats.recent, icon: <EditSvg /> },
          { label: 'Categories', value: stats.categories, icon: <ArchiveSvg /> },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon">{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {showSuccess && (
        <div className="cx-notification cx-notification--success" style={{ marginBottom: 16 }}>
          <CheckSvg />
          <div>
            <div className="cx-notification__title">Settings Saved</div>
            <div className="cx-notification__subtitle">Your system settings have been updated successfully.</div>
          </div>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="cx-notification cx-notification--warning" style={{ marginBottom: 16 }}>
          <AlertSvg />
          <div>
            <div className="cx-notification__title">Unsaved Changes</div>
            <div className="cx-notification__subtitle">You have unsaved changes. Make sure to save your settings before leaving this page.</div>
          </div>
        </div>
      )}

      <div className="cx-tabs">
        {tabs.map((tab, i) => (
          <button key={i} className={clsx('cx-tab', activeTab === i && 'cx-tab--active')} onClick={() => setActiveTab(i)}>{tab}</button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="cx-section">
          <div className="cx-toolbar">
            <div className="cx-search">
              <SearchSvg />
              <input type="search" className="cx-search__input" placeholder="Search settings..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="cx-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={handleResetToDefaults} title="Reset to Defaults"><ResetSvg /></button>
          </div>

          {Object.keys(settingsByCategory).length === 0 ? (
            <div className="cx-empty" style={{ marginTop: 32 }}>
              <SettingsSvg />
              <h3>No settings found</h3>
              <p>Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(settingsByCategory).map(([category, settings]) => {
                const cat = categories.find(c => c.id === category);
                const isExpanded = expandedCategory === category;
                return (
                  <div key={category} className="cx-section" style={{ padding: 0 }}>
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--cx-text-primary)', fontSize: '0.875rem', fontWeight: 600, borderBottom: isExpanded ? '1px solid var(--cx-border-subtle)' : 'none' }}
                    >
                      {isExpanded ? <ChevronDownSvg /> : <ChevronRightSvg />}
                      {cat?.icon || <SettingsSvg />}
                      <span>{cat?.name || category}</span>
                      <span className="cx-badge cx-badge--neutral" style={{ marginLeft: 'auto' }}>{settings.length} settings</span>
                    </button>
                    {isExpanded && (
                      <div style={{ padding: '8px 16px 16px' }}>
                        {settings.map(setting => (
                          <div key={setting.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: 0 }}>
                                  {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h4>
                                <span className={clsx('cx-badge', setting.isPublic ? 'cx-badge--info' : 'cx-badge--neutral')} style={{ fontSize: '0.625rem' }}>{setting.isPublic ? 'Public' : 'Private'}</span>
                                <span className="cx-badge cx-badge--neutral" style={{ fontSize: '0.625rem' }}>{setting.type}</span>
                              </div>
                              {setting.description && <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)', margin: '0 0 4px' }}>{setting.description}</p>}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Value:</span>
                                <code style={{ fontSize: '0.75rem', background: 'var(--cx-bg-canvas)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', color: 'var(--cx-text-primary)' }}>{formatValue(setting)}</code>
                              </div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
                                Last updated {new Date(setting.updatedAt).toLocaleDateString()} by {setting.updatedBy.name}
                              </div>
                            </div>
                            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => handleEditSetting(setting)}><EditSvg /> Edit</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div className="cx-section">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 16px' }}>Security Configuration</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 24 }}>Configure security policies and authentication settings.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            <div className="cx-card">
              <div className="cx-card__header"><h3 className="cx-card__title">Password Policy</h3></div>
              <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Minimum Password Length</label>
                  <input type="number" style={inpStyle} defaultValue={8} min={6} max={32} />
                </div>
                <label className="cx-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Require Special Characters</span>
                </label>
                <div>
                  <label style={labelStyle}>Password Expiration (days)</label>
                  <input type="number" style={inpStyle} defaultValue={90} min={30} max={365} />
                </div>
              </div>
            </div>

            <div className="cx-card">
              <div className="cx-card__header"><h3 className="cx-card__title">Authentication</h3></div>
              <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label className="cx-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Two-Factor Authentication</span>
                </label>
                <div>
                  <label style={labelStyle}>Session Timeout (minutes)</label>
                  <input type="number" style={inpStyle} defaultValue={60} min={15} max={480} />
                </div>
                <div>
                  <label style={labelStyle}>Maximum Login Attempts</label>
                  <input type="number" style={inpStyle} defaultValue={5} min={3} max={10} />
                </div>
              </div>
            </div>

            <div className="cx-card">
              <div className="cx-card__header"><h3 className="cx-card__title">Data Protection</h3></div>
              <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label className="cx-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Enable Data Encryption</span>
                </label>
                <label className="cx-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Audit Logging</span>
                </label>
                <div>
                  <label style={labelStyle}>IP Whitelist</label>
                  <textarea style={{ ...inpStyle, resize: 'vertical', minHeight: 60 }} rows={3} placeholder="Enter IP addresses or ranges, one per line" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="cx-section">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 16px' }}>Third-Party Integrations</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 24 }}>Configure external service integrations and API connections.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            <div className="cx-card">
              <div className="cx-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="cx-card__title">Google Workspace</h3>
                <span className="cx-badge cx-badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckSvg /> Connected</span>
              </div>
              <div className="cx-card__body">
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 12 }}>Single sign-on and Google Drive integration</p>
                <button className="cx-btn cx-btn--secondary cx-btn--sm">Configure</button>
              </div>
            </div>

            <div className="cx-card">
              <div className="cx-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="cx-card__title">Microsoft 365</h3>
                <span className="cx-badge cx-badge--danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircleSvg /> Disconnected</span>
              </div>
              <div className="cx-card__body">
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 12 }}>Office 365 and Teams integration</p>
                <button className="cx-btn cx-btn--primary cx-btn--sm">Connect</button>
              </div>
            </div>

            <div className="cx-card">
              <div className="cx-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="cx-card__title">Zoom</h3>
                <span className="cx-badge cx-badge--warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertSvg /> Needs Setup</span>
              </div>
              <div className="cx-card__body">
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 12 }}>Video conferencing integration</p>
                <button className="cx-btn cx-btn--secondary cx-btn--sm">Setup</button>
              </div>
            </div>

            <div className="cx-card">
              <div className="cx-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="cx-card__title">Slack</h3>
                <span className="cx-badge cx-badge--neutral">Available</span>
              </div>
              <div className="cx-card__body">
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 12 }}>Team communication and notifications</p>
                <button className="cx-btn cx-btn--ghost cx-btn--sm">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="cx-section">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 16px' }}>Backup & Restore</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 24 }}>Manage system backups and data recovery options.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            <div className="cx-card">
              <div className="cx-card__header"><h3 className="cx-card__title">Automatic Backups</h3></div>
              <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label className="cx-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Enable Automatic Backups</span>
                </label>
                <div>
                  <label style={labelStyle}>Backup Frequency</label>
                  <select className="cx-select" style={{ width: '100%' }} defaultValue="daily">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Retention Period (days)</label>
                  <input type="number" style={inpStyle} defaultValue={30} min={7} max={365} />
                </div>
              </div>
            </div>

            <div className="cx-card">
              <div className="cx-card__header"><h3 className="cx-card__title">Manual Backup</h3></div>
              <div className="cx-card__body">
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 12 }}>Create an immediate backup of all system data.</p>
                <button className="cx-btn cx-btn--primary cx-btn--sm"><UploadSvg /> Create Backup Now</button>
              </div>
            </div>

            <div className="cx-card">
              <div className="cx-card__header"><h3 className="cx-card__title">Restore from Backup</h3></div>
              <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Upload backup file</label>
                  <input type="file" style={inpStyle} accept=".backup,.zip" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>Select a backup file to restore from</p>
                </div>
                <button className="cx-btn cx-btn--danger cx-btn--sm" disabled><DownloadSvg /> Restore System</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedSetting && (
        <div className="cx-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Edit {selectedSetting.key.replace(/_/g, ' ')}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowEditModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 4px' }}>
                  {selectedSetting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                {selectedSetting.description && <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: '0 0 8px' }}>{selectedSetting.description}</p>}
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={clsx('cx-badge', selectedSetting.isPublic ? 'cx-badge--info' : 'cx-badge--neutral')}>{selectedSetting.isPublic ? 'Public' : 'Private'}</span>
                  <span className="cx-badge cx-badge--neutral">{selectedSetting.type}</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Current Value:</label>
                <div style={{ marginTop: 4 }}>{renderSettingInput(selectedSetting, editValue, setEditValue)}</div>
              </div>

              {selectedSetting.validation && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--cx-bg-canvas)', borderRadius: 'var(--radius-md)' }}>
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 8px' }}>Validation Rules:</h5>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)', margin: 0, paddingLeft: 16 }}>
                    {selectedSetting.validation.required && <li>This field is required</li>}
                    {selectedSetting.validation.min && <li>Minimum value: {selectedSetting.validation.min}</li>}
                    {selectedSetting.validation.max && <li>Maximum value: {selectedSetting.validation.max}</li>}
                    {selectedSetting.validation.pattern && <li>Must match pattern: {selectedSetting.validation.pattern}</li>}
                  </ul>
                </div>
              )}
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleSaveSetting}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystemSettingsPage;
