import React from 'react'

export const AccessibilityStatementPage: React.FC = () => {
  return (
    <div className="cx-page" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="cx-page__header" style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 24, marginBottom: 32 }}>
        <h1 className="cx-page__title" style={{ fontSize: '2rem' }}>Accessibility Statement</h1>
        <p className="cx-page__subtitle" style={{ fontSize: '1.05rem', marginTop: 8 }}>
          Our commitment to digital inclusion, WCAG 2.1 AA compliance, and accessible learning.
        </p>
      </div>

      <div className="cx-section" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--cx-text-primary)', marginBottom: 16 }}>
          Compliance Status
        </h2>
        <p style={{ color: 'var(--cx-text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
          We firmly believe that the web should be available and accessible to anyone, and we are committed to providing a learning management platform that is accessible to the widest possible audience, regardless of ability or technology.
        </p>
        <p style={{ color: 'var(--cx-text-secondary)', lineHeight: 1.7 }}>
          To achieve this, the ClassApex LMS modern UI is engineered to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standard.
        </p>
      </div>

      <div className="cx-section" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--cx-text-primary)', marginBottom: 16 }}>
          Accessibility Features in ClassApex
        </h2>
        <ul style={{ paddingLeft: 20, color: 'var(--cx-text-secondary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li>
            <strong>Focus Management & Keyboard Navigation (S23-06):</strong> All dynamic modals, sidebar drawers, notifications dropdowns, and search modals utilize focus traps and return focus securely to the initiating element upon exit, preventing keyboard lock.
          </li>
          <li>
            <strong>Screen Reader Support (S23-03):</strong> Dynamic notifications and active operations make use of the <code>aria-live</code> announcements tree to update non-visual browsers immediately.
          </li>
          <li>
            <strong>High Contrast Variant (S23-04):</strong> A dedicated high contrast theme mode is available under appearance settings to ensure all text elements achieve contrast ratios exceeding WCAG Requirements.
          </li>
          <li>
            <strong>Reduced Motion Compatibility (S23-05):</strong> CSS transitions, transform scaling, and canvas animations respect the operating system level <code>prefers-reduced-motion</code> settings.
          </li>
          <li>
            <strong>Skip to Content Link:</strong> A keyboard-accessible skip link is located at the top of the application shell (S3-10) to bypass navigation items.
          </li>
        </ul>
      </div>

      <div className="cx-section" style={{ padding: 32 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--cx-text-primary)', marginBottom: 16 }}>
          Feedback and Contact Information
        </h2>
        <p style={{ color: 'var(--cx-text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          If you encounter any accessibility barriers on ClassApex, please reach out to our accessibility support desk:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)', borderRadius: 8, padding: 16, border: '1px solid var(--cx-border-subtle)' }}>
            <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>📧 Email Support</div>
            <div style={{ color: 'var(--cx-text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>accessibility@classapex-lms.com</div>
          </div>
          <div style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)', borderRadius: 8, padding: 16, border: '1px solid var(--cx-border-subtle)' }}>
            <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>📞 Phone Hotline</div>
            <div style={{ color: 'var(--cx-text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>1-800-A11Y-LMS (Ext. 4)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessibilityStatementPage
