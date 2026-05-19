import React, { useState } from 'react';
import { useCanvasQuery, useCanvasMutation } from '../../hooks/useCanvasQuery';

function PaintSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/><path d="M12 18V12"/><path d="M12 8H12.01"/></svg>; }

interface BrandConfig {
  variables: Record<string, string>;
}

export default function BrandConfigsPage() {
  const { data: brandConfig, isLoading, refetch } = useCanvasQuery<BrandConfig>(
    '/api/v1/accounts/1/brand_configs/current',
    {} as any
  );

  const { mutate, isLoading: isSaving } = useCanvasMutation(
    '/api/v1/accounts/1/brand_configs',
    'POST' // Usually POST to create a new one, but let's assume standard REST
  );

  const [variables, setVariables] = useState<Record<string, string>>({
    ic_brand_primary: '#0055AA',
    ic_brand_button: '#0055AA',
    ic_brand_button_text: '#ffffff',
    ic_brand_header_image: '',
    ic_brand_favicon: '',
  });

  // Sync state when data loads
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <form onSubmit={handleSave} className="cx-card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <section>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Colors</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="cx-label">Primary Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="color" className="cx-input" value={variables.ic_brand_primary} onChange={e => handleChange('ic_brand_primary', e.target.value)} style={{ width: 60, padding: 4 }} />
                  <input type="text" className="cx-input" value={variables.ic_brand_primary} onChange={e => handleChange('ic_brand_primary', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="cx-label">Button Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="color" className="cx-input" value={variables.ic_brand_button} onChange={e => handleChange('ic_brand_button', e.target.value)} style={{ width: 60, padding: 4 }} />
                  <input type="text" className="cx-input" value={variables.ic_brand_button} onChange={e => handleChange('ic_brand_button', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Images</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="cx-label">Header Logo URL</label>
                <input type="url" className="cx-input" value={variables.ic_brand_header_image || ''} onChange={e => handleChange('ic_brand_header_image', e.target.value)} placeholder="https://example.com/logo.png" />
              </div>
              <div>
                <label className="cx-label">Favicon URL</label>
                <input type="url" className="cx-input" value={variables.ic_brand_favicon || ''} onChange={e => handleChange('ic_brand_favicon', e.target.value)} placeholder="https://example.com/favicon.ico" />
              </div>
            </div>
          </section>

          <div style={{ borderTop: '1px solid var(--cx-border-subtle)', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="cx-btn cx-btn--primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Apply Theme'}
            </button>
          </div>
        </form>

        <div className="cx-card" style={{ background: 'var(--cx-bg-surface-raised)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ margin: 0 }}>Theme Preview</h3>
          <div style={{ padding: 16, border: '1px solid var(--cx-border-subtle)', borderRadius: 8, background: 'white' }}>
            <div style={{ height: 40, background: variables.ic_brand_primary, borderRadius: 4, marginBottom: 16, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              {variables.ic_brand_header_image ? (
                <img src={variables.ic_brand_header_image} alt="Logo" style={{ height: 24, objectFit: 'contain' }} />
              ) : (
                <span style={{ color: 'white', fontWeight: 600 }}>Your Logo</span>
              )}
            </div>
            <div style={{ height: 20, width: '60%', background: 'var(--cx-border-subtle)', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 12, width: '40%', background: 'var(--cx-border-subtle)', borderRadius: 4, marginBottom: 16 }} />
            <button style={{ 
              background: variables.ic_brand_button, 
              color: variables.ic_brand_button_text || '#fff', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: 4,
              fontWeight: 500
            }}>
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
