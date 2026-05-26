import React, { useState, useEffect } from 'react'
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'
import { useTheme } from '../../contexts/ThemeContext'
import { useNotification } from '../../hooks/useNotification'

interface BrandVars {
  ic_brand_primary: string
  ic_brand_button: string
  ic_brand_button_text: string
  ic_brand_header_image: string
  ic_brand_favicon: string
}

const STORAGE_KEY = 'classapex-brand-config'

function loadLocalBrand(): Partial<BrandVars> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalBrand(vars: Partial<BrandVars>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vars))
}

export default function BrandConfigsPage() {
  const { setBrandConfig } = useTheme()
  const { showToast } = useNotification()
  const [saving, setSaving] = useState(false)

  const { data: brandConfigData, isLoading } = useCanvasQuery<any>(
    '/api/v1/accounts/1/brand_configs/current',
    {} as any
  )

  const [variables, setVariables] = useState<BrandVars>({
    ic_brand_primary: '#0f62fe',
    ic_brand_button: '#0f62fe',
    ic_brand_button_text: '#ffffff',
    ic_brand_header_image: '',
    ic_brand_favicon: '',
  })

  useEffect(() => {
    const local = loadLocalBrand()
    const apiVars = brandConfigData?.variables || {}
    setVariables({
      ic_brand_primary: apiVars.ic_brand_primary || local.ic_brand_primary || '#0f62fe',
      ic_brand_button: apiVars.ic_brand_button || local.ic_brand_button || '#0f62fe',
      ic_brand_button_text: apiVars.ic_brand_button_text || local.ic_brand_button_text || '#ffffff',
      ic_brand_header_image: apiVars.ic_brand_header_image || local.ic_brand_header_image || '',
      ic_brand_favicon: apiVars.ic_brand_favicon || local.ic_brand_favicon || '',
    })
  }, [brandConfigData])

  const handleChange = (key: keyof BrandVars, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Attempt to save to Canvas brand config API
      await canvasFetch('/api/v1/accounts/1/brand_configs', {
        method: 'POST',
        body: { brand_config: { variables } },
      })
      showToast({ title: 'Brand config saved to Canvas', type: 'success' })
    } catch (err: any) {
      console.warn('Brand config API failed:', err?.message || err)
      // Fallback: persist locally so the UI still works
      saveLocalBrand(variables)
      showToast({
        title: 'Saved locally',
        message: 'Canvas brand config API is unavailable. Settings stored in browser for this session.',
        type: 'warning',
      })
    }

    // Always apply to theme context immediately
    setBrandConfig({
      primaryColor: variables.ic_brand_primary,
      buttonColor: variables.ic_brand_button,
      buttonTextColor: variables.ic_brand_button_text,
      logoUrl: variables.ic_brand_header_image,
      faviconUrl: variables.ic_brand_favicon,
    })

    setSaving(false)
  }

  if (isLoading) {
    return (
      <div className="cx-page">
        <div className="cx-loading" role="status" aria-label="Loading brand config">
          <div className="cx-loading__spinner" />
          <span className="cx-loading__text">Loading branding settings…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Theme & Branding</h1>
          <p className="cx-page__subtitle">Customize the visual appearance of the LMS for your institution.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        <form onSubmit={handleSave} className="cx-card">
          <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Colors</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Primary Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="color" value={variables.ic_brand_primary} onChange={e => handleChange('ic_brand_primary', e.target.value)} style={{ width: 48, height: 36, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                    <input type="text" className="cx-input" value={variables.ic_brand_primary} onChange={e => handleChange('ic_brand_primary', e.target.value)} style={{ flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Button Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="color" value={variables.ic_brand_button} onChange={e => handleChange('ic_brand_button', e.target.value)} style={{ width: 48, height: 36, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                    <input type="text" className="cx-input" value={variables.ic_brand_button} onChange={e => handleChange('ic_brand_button', e.target.value)} style={{ flex: 1 }} />
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Button Text Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="color" value={variables.ic_brand_button_text} onChange={e => handleChange('ic_brand_button_text', e.target.value)} style={{ width: 48, height: 36, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                  <input type="text" className="cx-input" value={variables.ic_brand_button_text} onChange={e => handleChange('ic_brand_button_text', e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Images</h3>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Header Logo URL</label>
                <input type="url" className="cx-input" style={{ width: '100%' }} value={variables.ic_brand_header_image} onChange={e => handleChange('ic_brand_header_image', e.target.value)} placeholder="https://example.com/logo.png" />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Favicon URL</label>
                <input type="url" className="cx-input" style={{ width: '100%' }} value={variables.ic_brand_favicon} onChange={e => handleChange('ic_brand_favicon', e.target.value)} placeholder="https://example.com/favicon.ico" />
              </div>
            </section>

            <div style={{ borderTop: '1px solid var(--cx-border-subtle)', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="cx-btn cx-btn--primary" disabled={saving}>
                {saving ? 'Saving…' : 'Apply Theme'}
              </button>
            </div>
          </div>
        </form>

        <div className="cx-card">
          <div className="cx-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Theme Preview</h3>
            <div style={{ padding: 16, border: '1px solid var(--cx-border-subtle)', borderRadius: 8, background: 'var(--cx-bg-surface-raised)' }}>
              <div style={{ height: 40, background: variables.ic_brand_primary, borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                {variables.ic_brand_header_image ? (
                  <img src={variables.ic_brand_header_image} alt="Logo" style={{ height: 24, objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Your Logo</span>
                )}
              </div>
              <div style={{ height: 20, width: '60%', background: 'var(--cx-border-subtle)', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 12, width: '40%', background: 'var(--cx-border-subtle)', borderRadius: 4, marginBottom: 16 }} />
              <button style={{
                background: variables.ic_brand_button,
                color: variables.ic_brand_button_text || '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                Sample Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
