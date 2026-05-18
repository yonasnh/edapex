import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function SettingsSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>; }
function UserSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 17v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1"/><circle cx="10" cy="6" r="3"/></svg>; }
function BellSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a6 6 0 00-6 6c0 3-1 5-2 6h16c-1-1-2-3-2-6a6 6 0 00-6-6z"/><path d="M8 14a2 2 0 004 0"/></svg>; }
function PaletteSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="13" cy="7" r="1" fill="currentColor"/><circle cx="10" cy="13" r="1" fill="currentColor"/><path d="M14 11c-1 0-2 1-2 2"/><path d="M6 11c1 0 2 1 2 2"/></svg>; }
function GlobeSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="7"/><path d="M3 7h14M3 13h14"/><path d="M10 3a13 13 0 000 14 13 13 0 000-14z"/></svg>; }
function ShieldSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1l7 3v5a7 7 0 01-7 7 7 7 0 01-7-7V4l7-3z"/><path d="M7 10l2 2 4-4"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function SunSvg() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="3.5"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4"/></svg>; }
function MoonSvg() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 9.5A6.5 6.5 0 118.5 3a5 5 0 106.5 6.5z"/></svg>; }

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Settings</h1>
          <p className="cx-page__subtitle">Customize your ClassApex experience</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleSave}>Save Changes</button>
      </div>

      {showSuccess && (
        <div className="cx-notification cx-notification--success" style={{ marginBottom: 0 }}>
          <CheckSvg />
          <div>
            <div className="cx-notification__title">Settings Saved</div>
            <div className="cx-notification__subtitle">Your preferences have been updated successfully.</div>
          </div>
        </div>
      )}

      <div className="cx-settings-section" style={{ marginTop: 24 }}>
        <h2 className="cx-settings-section__title"><UserSvg /> Profile</h2>
        <div className="cx-section">
          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Display Name</div>
              <div className="cx-settings-row__desc">Your full name shown across Canvas</div>
            </div>
            <div className="cx-settings-row__control">
              <input type="text" className="cx-search__input" style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '6px 12px', width: 200, background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)' }} defaultValue="John Doe" />
            </div>
          </div>
          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Email Address</div>
              <div className="cx-settings-row__desc">Used for login and notifications</div>
            </div>
            <div className="cx-settings-row__control">
              <input type="email" className="cx-search__input" style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '6px 12px', width: 200, background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)' }} defaultValue="john.doe@example.com" />
            </div>
          </div>
          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Language</div>
              <div className="cx-settings-row__desc">Interface language</div>
            </div>
            <div className="cx-settings-row__control">
              <select className="cx-select" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Timezone</div>
              <div className="cx-settings-row__desc">Used for scheduling and deadlines</div>
            </div>
            <div className="cx-settings-row__control">
              <select className="cx-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                <option value="America/New_York">Eastern Time (US)</option>
                <option value="America/Chicago">Central Time (US)</option>
                <option value="America/Denver">Mountain Time (US)</option>
                <option value="America/Los_Angeles">Pacific Time (US)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title"><BellSvg /> Notifications</h2>
        <div className="cx-section">
          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Email Notifications</div>
              <div className="cx-settings-row__desc">Receive notifications via email</div>
            </div>
            <div className="cx-settings-row__control">
              <label className="cx-toggle">
                <input type="checkbox" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
              </label>
            </div>
          </div>
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Push Notifications</div>
              <div className="cx-settings-row__desc">Receive notifications in your browser</div>
            </div>
            <div className="cx-settings-row__control">
              <label className="cx-toggle">
                <input type="checkbox" checked={pushNotifications} onChange={e => setPushNotifications(e.target.checked)} />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title"><PaletteSvg /> Appearance</h2>
        <div className="cx-section">
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Theme</div>
              <div className="cx-settings-row__desc">Choose between light and dark mode</div>
            </div>
            <div className="cx-settings-row__control" style={{ display: 'flex', gap: 8 }}>
              <button
                className={theme === 'light' ? 'cx-btn cx-btn--primary cx-btn--sm' : 'cx-btn cx-btn--secondary cx-btn--sm'}
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <SunSvg /> Light
              </button>
              <button
                className={theme === 'dark' ? 'cx-btn cx-btn--primary cx-btn--sm' : 'cx-btn cx-btn--secondary cx-btn--sm'}
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MoonSvg /> Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="cx-settings-section">
        <h2 className="cx-settings-section__title"><ShieldSvg /> Privacy & Security</h2>
        <div className="cx-section">
          <div className="cx-settings-row">
            <div>
              <div className="cx-settings-row__label">Profile Visibility</div>
              <div className="cx-settings-row__desc">Allow other users to see your profile</div>
            </div>
            <div className="cx-settings-row__control">
              <label className="cx-toggle">
                <input type="checkbox" defaultChecked />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
              </label>
            </div>
          </div>
          <div className="cx-settings-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="cx-settings-row__label">Activity Status</div>
              <div className="cx-settings-row__desc">Show when you're online to other users</div>
            </div>
            <div className="cx-settings-row__control">
              <label className="cx-toggle">
                <input type="checkbox" defaultChecked />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
