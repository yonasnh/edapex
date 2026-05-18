import React, { useState } from 'react'
import { PerformanceMonitor } from '../PerformanceMonitor'
import type { User } from '@schoolapex/core'

export interface SettingsPanelProps {
  user: User
  onSave: (settings: UserSettings) => Promise<void>
  onReset: () => void
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    assignments: boolean
    grades: boolean
    announcements: boolean
  }
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    screenReader: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
  privacy: {
    shareProfile: boolean
    shareActivity: boolean
    allowAnalytics: boolean
  }
}

export function SettingsPanel({ user, onSave, onReset }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'auto',
    language: 'en',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      push: true,
      assignments: true,
      grades: true,
      announcements: true,
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      fontSize: 'medium',
    },
    privacy: {
      shareProfile: true,
      shareActivity: false,
      allowAnalytics: true,
    },
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(settings)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any> || {}),
        [key]: value
      }
    }))
  }

  return (
    <div style={{ width: '600px', maxHeight: '80vh', overflow: 'auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Settings</h2>

      <div className="cm-tabs">
        <div className="cm-tabs__list" role="tablist">
          {['General', 'Notifications', 'Accessibility', 'Privacy', 'Performance'].map((label, i) => (
            <button key={i} className={`cm-tabs__tab ${activeTab === i ? 'cm-tabs__tab--active' : ''}`} onClick={() => setActiveTab(i)} role="tab">{label}</button>
          ))}
        </div>
      </div>

      {activeTab === 0 && (
        <form>
          <fieldset style={{ border: 'none', padding: 0, marginBottom: 16 }}>
            <legend>Appearance</legend>
            <div className="cm-form-group">
              <label htmlFor="theme" className="cm-label">Theme</label>
              <select
                id="theme"
                className="cm-select"
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </fieldset>

          <fieldset style={{ border: 'none', padding: 0, marginBottom: 16 }}>
            <legend>Localization</legend>
            <div className="cm-form-group">
              <label htmlFor="language" className="cm-label">Language</label>
              <select
                id="language"
                className="cm-select"
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div className="cm-form-group">
              <label htmlFor="timezone" className="cm-label">Timezone</label>
              <select
                id="timezone"
                className="cm-select"
                value={settings.timezone}
                onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </fieldset>
        </form>
      )}

      {activeTab === 1 && (
        <form>
          <fieldset style={{ border: 'none', padding: 0, marginBottom: 16 }}>
            <legend>Notification Preferences</legend>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.notifications.email} onChange={(e) => updateSettings('notifications', 'email', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Email Notifications</span>
            </label>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.notifications.push} onChange={(e) => updateSettings('notifications', 'push', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Push Notifications</span>
            </label>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.notifications.assignments} onChange={(e) => updateSettings('notifications', 'assignments', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Assignment Notifications</span>
            </label>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.notifications.grades} onChange={(e) => updateSettings('notifications', 'grades', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Grade Notifications</span>
            </label>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.notifications.announcements} onChange={(e) => updateSettings('notifications', 'announcements', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Announcement Notifications</span>
            </label>
          </fieldset>
        </form>
      )}

      {activeTab === 2 && (
        <form>
          <fieldset style={{ border: 'none', padding: 0, marginBottom: 16 }}>
            <legend>Accessibility Options</legend>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.accessibility.highContrast} onChange={(e) => updateSettings('accessibility', 'highContrast', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">High Contrast Mode</span>
            </label>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.accessibility.reducedMotion} onChange={(e) => updateSettings('accessibility', 'reducedMotion', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Reduce Motion</span>
            </label>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.accessibility.screenReader} onChange={(e) => updateSettings('accessibility', 'screenReader', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Screen Reader Optimizations</span>
            </label>
            <div className="cm-form-group">
              <label htmlFor="font-size" className="cm-label">Font Size</label>
              <select
                id="font-size"
                className="cm-select"
                value={settings.accessibility.fontSize}
                onChange={(e) => updateSettings('accessibility', 'fontSize', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </fieldset>
        </form>
      )}

      {activeTab === 3 && (
        <form>
          <fieldset style={{ border: 'none', padding: 0, marginBottom: 16 }}>
            <legend>Privacy Settings</legend>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.privacy.shareProfile} onChange={(e) => updateSettings('privacy', 'shareProfile', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Share Profile Information</span>
            </label>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.privacy.shareActivity} onChange={(e) => updateSettings('privacy', 'shareActivity', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Share Activity Status</span>
            </label>
            <label className="cm-toggle">
              <input type="checkbox" className="cm-toggle__input" checked={settings.privacy.allowAnalytics} onChange={(e) => updateSettings('privacy', 'allowAnalytics', e.target.checked)} />
              <span className="cm-toggle__slider" />
              <span className="cm-toggle__label">Allow Analytics Collection</span>
            </label>
          </fieldset>
        </form>
      )}

      {activeTab === 4 && (
        <PerformanceMonitor showDetails={true} />
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
        <button className="cm-btn cm-btn--secondary" onClick={onReset}>
          Reset to Defaults
        </button>
        <button
          className="cm-btn cm-btn--primary"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
