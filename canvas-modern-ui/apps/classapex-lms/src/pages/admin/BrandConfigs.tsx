import React, { useState } from 'react';
import { useCanvasQuery, useCanvasMutation } from '../../hooks/useCanvasQuery';
import { useTheme } from '../../contexts/ThemeContext';

function PaintSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/><path d="M12 18V12"/><path d="M12 8H12.01"/></svg>; }

interface BrandConfig {
  variables: Record<string, string>;
}

export default function BrandConfigsPage() {
  const { setBrandConfig } = useTheme();
  const { data: brandConfig, isLoading, refetch } = useCanvasQuery<BrandConfig>(
    '/api/v1/accounts/1/brand_configs/current',
    {} as any
  );

  const { mutate, isLoading: isSaving } = useCanvasMutation(
    '/api/v1/accounts/1/brand_configs',
    'POST'
  );

  const [variables, setVariables] = useState<Record<string, string>>({
    ic_brand_primary: '#0055AA',
    ic_brand_button: '#0055AA',
    ic_brand_button_text: '#ffffff',
    ic_brand_header_image: '',
    ic_brand_favicon: '',
  });

  React.useEffect(() => {
    if (brandConfig?.variables) {
      setVariables(prev => ({ ...prev, ...brandConfig.variables }));
    }
  }, [brandConfig]);

  const handleChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutate({ brand_config: { variables } });
    setBrandConfig({
      primaryColor: variables.ic_brand_primary || '#0055AA',
      buttonColor: variables.ic_brand_button || '#0055AA',
      buttonTextColor: variables.ic_brand_button_text || '#ffffff',
      logoUrl: variables.ic_brand_header_image || '',
      faviconUrl: variables.ic_brand_favicon || '',
    });
    refetch();
  };

  if (isLoading) return <div className="cx-loading"><div className="cx-loading__spinner" /></div>;

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
                <div className="cx-input-group">
                  <label className="cx-input-label">Primary Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div className="cx-input-wrapper cx-input-wrapper--md" style={{ width: 64, flexShrink: 0, overflow: 'hidden' }}>
                      <input 
                        type="color" 
                        className="cx-input" 
                        value={variables.ic_brand_primary} 
                        onChange={e => handleChange('ic_brand_primary', e.target.value)} 
                        style={{ height: '100%', padding: 0, cursor: 'pointer' }} 
                      />
                    </div>
                    <div className="cx-input-wrapper cx-input-wrapper--md" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="cx-input" 
                        value={variables.ic_brand_primary} 
                        onChange={e => handleChange('ic_brand_primary', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div className="cx-input-group">
                  <label className="cx-input-label">Button Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div className="cx-input-wrapper cx-input-wrapper--md" style={{ width: 64, flexShrink: 0, overflow: 'hidden' }}>
                      <input 
                        type="color" 
                        className="cx-input" 
                        value={variables.ic_brand_button} 
                        onChange={e => handleChange('ic_brand_button', e.target.value)} 
                        style={{ height: '100%', padding: 0, cursor: 'pointer' }} 
                      />
                    </div>
                    <div className="cx-input-wrapper cx-input-wrapper--md" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="cx-input" 
                        value={variables.ic_brand_button} 
                        onChange={e => handleChange('ic_brand_button', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Images</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="cx-input-group">
                  <label className="cx-input-label">Header Logo URL</label>
                  <div className="cx-input-wrapper cx-input-wrapper--md">
                    <input 
                      type="url" 
                      className="cx-input" 
                      value={variables.ic_brand_header_image || ''} 
                      onChange={e => handleChange('ic_brand_header_image', e.target.value)} 
                      placeholder="https://example.com/logo.png" 
                    />
                  </div>
                </div>

                <div className="cx-input-group">
                  <label className="cx-input-label">Favicon URL</label>
                  <div className="cx-input-wrapper cx-input-wrapper--md">
                    <input 
                      type="url" 
                      className="cx-input" 
                      value={variables.ic_brand_favicon || ''} 
                      onChange={e => handleChange('ic_brand_favicon', e.target.value)} 
                      placeholder="https://example.com/favicon.ico" 
                    />
                  </div>
                </div>
              </div>
            </section>

            <div style={{ borderTop: '1px solid var(--cx-border-subtle)', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="cx-btn cx-btn--primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Apply Theme'}
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
  );
}
