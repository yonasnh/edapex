import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@schoolapex/core'

export const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { signUpUser, isAuthenticated, isLoading } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'educator'>('student')
  const [joinCode, setJoinCode] = useState('')
  const [institution, setInstitution] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('cm-theme')
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const root = document.querySelector('html')
    if (root) {
      root.setAttribute('data-theme', theme)
      root.classList.remove('light-theme', 'dark-theme')
      root.classList.add(`${theme}-theme`)
    }
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('cm-theme', newTheme)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!termsAccepted) {
      setLocalError('You must accept the Terms of Service and Privacy Policy.')
      return
    }

    setIsSubmitting(true)
    try {
      const code = role === 'student' ? joinCode : undefined
      const success = await signUpUser(name, email, password, role, code)
      if (success) {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setLocalError(err.message || 'Signup failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDark = theme === 'dark'
  const colors = {
    bgPage: isDark ? '#0f172a' : 'var(--cx-bg-canvas, #f5f5f5)',
    bgCard: isDark ? '#1e293b' : 'var(--cx-bg-surface, #ffffff)',
    textPrimary: isDark ? '#f8fafc' : 'var(--cx-text-primary, #1a1a1a)',
    textSecondary: isDark ? '#cbd5e1' : 'var(--cx-text-secondary, #666666)',
    textTertiary: isDark ? '#94a3b8' : 'var(--cx-text-tertiary, #999999)',
    textBrand: isDark ? '#ffffff' : '#000000',
    border: isDark ? '#334155' : 'var(--cx-border-subtle, #e5e5e5)',
    inputBg: isDark ? '#0f172a' : 'var(--cx-bg-canvas, #f9fafb)',
    inputBorder: isDark ? '#334155' : 'var(--cx-border-subtle, #e5e5e5)',
    inputColor: isDark ? '#f8fafc' : 'var(--cx-text-primary, #1a1a1a)',
    shadow: isDark ? '0 10px 25px rgba(0,0,0,0.3)' : '0 10px 25px rgba(0,0,0,0.05)',
  }
  const linkColor = isDark ? '#60a5fa' : 'var(--cx-color-primary, #2563eb)'

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowY: 'auto',
      fontFamily: 'system-ui, sans-serif',
      background: colors.bgPage,
      color: colors.textPrimary,
      transition: 'background-color 0.2s, color 0.2s',
      padding: '2rem 1rem',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        width: '100%',
        maxWidth: '440px',
        margin: 'auto',
      }}>
        {/* Brand Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%', 
          marginBottom: '1.5rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={isDark ? {
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            } : {
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <img 
                src={isDark ? '/classapex_logo_darkmode.png' : '/classapex_logo_light.png'} 
                alt="ClassApex Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.025em', color: colors.textBrand }}>
                ClassApex
              </h1>
              <span style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textSecondary }}>
                Learning Management
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: colors.textPrimary,
              boxShadow: colors.shadow,
              transition: 'all 0.2s',
            }}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>

        {/* Signup Form Card */}
        <div style={{
          background: colors.bgCard,
          padding: '1.5rem 2rem 2rem 2rem',
          borderRadius: '1rem',
          boxShadow: colors.shadow,
          width: '100%',
          textAlign: 'left',
          transition: 'background-color 0.2s, box-shadow 0.2s',
          border: `1px solid ${colors.border}`
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Create your account</h1>
          <p style={{ 
            color: colors.textSecondary, 
            marginBottom: '1.25rem', 
            fontSize: '0.875rem',
            paddingBottom: '1rem',
            borderBottom: `1px solid ${colors.border}` 
          }}>
            Already have an account? <a href="/login" style={{ color: linkColor, textDecoration: 'none', fontWeight: 500 }}>Sign in</a>
          </p>

          {localError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '4px solid #ef4444',
              color: '#ef4444',
              padding: '8px 12px',
              fontSize: '0.875rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontWeight: 500
            }}>
              {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Role Toggle Switch */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Are you a Student or Educator?</label>
              <div style={{
                display: 'flex',
                background: colors.bgPage,
                borderRadius: '0.5rem',
                padding: '4px',
                border: `1px solid ${colors.border}`
              }}>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer', background: role === 'student' ? 'var(--cx-color-primary, #2563eb)' : 'transparent',
                    color: role === 'student' ? '#fff' : colors.textSecondary, transition: 'all 0.2s'
                  }}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('educator')}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer', background: role === 'educator' ? 'var(--cx-color-primary, #2563eb)' : 'transparent',
                    color: role === 'educator' ? '#fff' : colors.textSecondary, transition: 'all 0.2s'
                  }}
                >
                  🏫 Educator
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                style={{
                  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                  border: `1px solid ${colors.inputBorder}`,
                  background: colors.inputBg,
                  color: colors.inputColor,
                  boxSizing: 'border-box',
                  outline: 'none',
                }} 
              />
            </div>

            {/* Email Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@schoolapex.edu"
                style={{
                  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                  border: `1px solid ${colors.inputBorder}`,
                  background: colors.inputBg,
                  color: colors.inputColor,
                  boxSizing: 'border-box',
                  outline: 'none',
                }} 
              />
            </div>

            {/* Password Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                  border: `1px solid ${colors.inputBorder}`,
                  background: colors.inputBg,
                  color: colors.inputColor,
                  boxSizing: 'border-box',
                  outline: 'none',
                }} 
              />
            </div>

            {/* Conditional Join Code or Institution Input */}
            {role === 'student' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Course Invite Code <span style={{ color: colors.textTertiary, fontWeight: 400 }}>(Optional)</span>
                </label>
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. CS101-JOIN"
                  style={{
                    width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                    border: `1px solid ${colors.inputBorder}`,
                    background: colors.inputBg,
                    color: colors.inputColor,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }} 
                />
                <span style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '4px', display: 'block' }}>
                  Provide an invite code to auto-enroll in your classroom right away.
                </span>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Institution / Organization</label>
                <input 
                  type="text" 
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. SchoolApex Academy"
                  style={{
                    width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                    border: `1px solid ${colors.inputBorder}`,
                    background: colors.inputBg,
                    color: colors.inputColor,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }} 
                />
                <span style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '4px', display: 'block' }}>
                  Educators will be automatically provisioned a personal testing sandbox.
                </span>
              </div>
            )}

            {/* Terms checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', userSelect: 'none', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginTop: '3px' }} 
              />
              <span style={{ fontSize: '0.8125rem', color: colors.textSecondary, lineHeight: 1.4 }}>
                I agree to the <a href="#" style={{ color: linkColor, textDecoration: 'none', fontWeight: 500 }}>Terms of Service</a> and <a href="#" style={{ color: linkColor, textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</a>.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem', fontSize: '1rem', fontWeight: 600,
                background: 'var(--cx-color-primary, #2563eb)', color: '#fff', border: 'none', borderRadius: '0.5rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 4px 6px rgba(37,99,235,0.2)',
                transition: 'background 0.2s', width: '100%'
              }}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          color: colors.textTertiary,
          borderTop: `1px solid ${colors.border}`,
          width: '100%',
          textAlign: 'center',
        }}>
          <span>&copy; {new Date().getFullYear()} ClassApex LMS. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
