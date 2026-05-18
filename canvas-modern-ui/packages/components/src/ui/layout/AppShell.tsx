import React, { useState, type ReactNode } from 'react'
import clsx from 'clsx'
import './AppShell.css'

interface AppShellProps {
  children: ReactNode
  sidebar?: ReactNode
  topbar?: ReactNode
  defaultCollapsed?: boolean
  hideSidebar?: boolean
}

export function AppShell({
  children,
  sidebar,
  topbar,
  defaultCollapsed = false,
  hideSidebar = false,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div
      className={clsx('cm-shell', collapsed && 'cm-shell--collapsed', hideSidebar && 'cm-shell--no-sidebar')}
      data-testid="app-shell"
    >
      <a href="#cm-main" className="cm-skip-link">
        Skip to main content
      </a>

      {!hideSidebar && sidebar && (
        <aside
          className={clsx('cm-shell__sidebar', mobileOpen && 'cm-shell__sidebar--open')}
          aria-label="Main navigation"
        >
          {React.isValidElement(sidebar)
            ? React.cloneElement(sidebar as React.ReactElement<any>, {
                isCollapsed: collapsed,
                onToggleCollapse: (c: boolean) => {
                  setCollapsed(c)
                  setMobileOpen(false)
                },
              })
            : sidebar}
        </aside>
      )}

      <div className="cm-shell__body">
        {topbar && (
          <header className="cm-shell__topbar">
            <button
              className="cm-shell__mobile-toggle"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {topbar}
          </header>
        )}

        <main id="cm-main" className="cm-shell__main" tabIndex={-1}>
          <div className="cm-shell__content">
            {children}
          </div>
          <footer className="cm-shell__footer" aria-label="ClassApex Footer">
            <div className="cm-shell__footer-info">
              <span className="cm-shell__footer-brand">ClassApex</span>
              <span className="cm-shell__footer-separator">•</span>
              <span>Learning Management</span>
              <span className="cm-shell__footer-separator">•</span>
              <span>v1.0.0</span>
            </div>
            <div className="cm-shell__footer-links">
              <a href="/help" className="cm-shell__footer-link">Support</a>
              <a href="/settings" className="cm-shell__footer-link">Settings</a>
              <a href="/admin/terms" className="cm-shell__footer-link">Terms</a>
            </div>
            <div className="cm-shell__footer-copyright">
              © {new Date().getFullYear()} ClassApex. All rights reserved.
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
