/**
 * RoleSwitcher — Floating demo persona picker
 * =============================================
 * A pill-shaped floating widget that lets users switch between
 * Student, Teacher, and Admin personas during demo/development.
 * Persists selection via RoleContext → localStorage.
 */

import React, { useState } from 'react'
import { useRole, type UserRole } from '../contexts/RoleContext'

const ROLE_CONFIG: Record<UserRole, { label: string; icon: string; color: string; bgColor: string }> = {
  student: { label: 'Student', icon: '🎓', color: 'var(--cx-status-assignment-fg)', bgColor: 'var(--cx-status-assignment-bg)' },
  teacher: { label: 'Instructor', icon: '👩‍🏫', color: 'var(--cx-status-discussion-fg)', bgColor: 'var(--cx-status-discussion-bg)' },
  admin:   { label: 'Admin', icon: '🔧', color: 'var(--cx-status-quiz-fg)', bgColor: 'var(--cx-status-quiz-bg)' },
}

export function RoleSwitcher() {
  const { role, user, setRole } = useRole()
  const [expanded, setExpanded] = useState(false)
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student
  console.log("🚨 ROLE SWITCHER RENDERED! 🚨", { role, config })

  return (
    <>
      {/* Floating Pill */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Expanded Menu */}
        {expanded && (
          <div
            style={{
              background: 'var(--cx-surface, #fff)',
              border: '1px solid var(--cx-border, #e2e8f0)',
              borderRadius: 16,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
              padding: 8,
              minWidth: 220,
              animation: 'cx-slide-up 0.2s ease',
            }}
          >
            <div style={{
              padding: '8px 12px 12px',
              borderBottom: '1px solid var(--cx-border)',
              marginBottom: 4,
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--cx-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Persona
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-secondary)', marginTop: 2 }}>
                Switch to preview role-specific views
              </div>
            </div>

            {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([key, cfg]) => {
              const isActive = role === key
              return (
                <button
                  key={key}
                  onClick={() => { setRole(key); setExpanded(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '10px 12px',
                    border: isActive ? `2px solid ${cfg.color}` : '2px solid transparent',
                    borderRadius: 10,
                    background: isActive ? cfg.bgColor : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    marginBottom: 2,
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget.style.background = 'var(--cx-surface-hover, #f8fafc)')
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget.style.background = 'transparent')
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? cfg.color : 'var(--cx-text-primary, #0f172a)',
                    }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--cx-text-muted)' }}>
                      {key === 'student' ? 'Alex Johnson' : key === 'teacher' ? 'Dr. Sarah Chen' : 'System Admin'}
                    </div>
                  </div>
                  {isActive && (
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: cfg.color, flexShrink: 0,
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Trigger Button */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            border: `2px solid ${config.color}`,
            borderRadius: 50,
            background: config.bgColor,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.15s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          aria-label={`Current role: ${config.label}. Click to switch.`}
          title="Switch demo persona"
        >
          <span style={{ fontSize: '1.1rem' }}>{config.icon}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: config.color }}>
            {config.label}
          </span>
          <span style={{
            fontSize: '0.65rem',
            color: config.color,
            opacity: 0.7,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}>
            ▲
          </span>
        </button>
      </div>

      {/* Backdrop for closing */}
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'transparent',
          }}
        />
      )}
    </>
  )
}
