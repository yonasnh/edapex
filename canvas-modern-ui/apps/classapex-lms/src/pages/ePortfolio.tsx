import React, { useState } from 'react';
import { useCanvasQuery } from '../hooks/useCanvasQuery';

interface ePortfolioEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface ePortfolioSection {
  id: string;
  name: string;
  entries: ePortfolioEntry[];
}

interface ePortfolio {
  id: string;
  name: string;
  public: boolean;
  sections: ePortfolioSection[];
}

export default function EPortfolioPage() {
  // Canvas ePortfolios retrieval (S20-08)
  const { data: apiPortfolios } = useCanvasQuery<any[]>(
    '/api/v1/eportfolios',
    { per_page: 50 } as any
  );

  const [portfolios, setPortfolios] = useState<ePortfolio[]>([
    {
      id: 'port-1',
      name: 'Jane Doe Capstone & Research Showcase',
      public: true,
      sections: [
        {
          id: 'sec-1',
          name: 'Introduction & Biography',
          entries: [
            {
              id: 'ent-1',
              title: 'Welcome to my academic page',
              content: 'I am a junior biochemistry undergraduate researching modular enzyme alignments. This portfolio contains my recent findings and term projects.',
              created_at: new Date().toLocaleDateString()
            }
          ]
        },
        {
          id: 'sec-2',
          name: 'Biochemistry Lab Reports',
          entries: [
            {
              id: 'ent-2',
              title: 'Protein Purification Findings',
              content: 'Successfully purified lactase using custom chromatography cartridges. Recorded standard deviation metrics and bell curve stats.',
              created_at: new Date().toLocaleDateString()
            }
          ]
        }
      ]
    }
  ]);

  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>('port-1');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-1');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>('ent-1');

  // Creation & edit states (S20-09)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioPublic, setNewPortfolioPublic] = useState(true);

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // New section/entry inputs
  const [newSectionName, setNewSectionName] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');

  const activePortfolio = portfolios.find(p => p.id === selectedPortfolioId) || null;
  const activeSection = activePortfolio?.sections.find(s => s.id === selectedSectionId) || null;
  const activeEntry = activeSection?.entries.find(e => e.id === selectedEntryId) || null;

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName) return;

    const newPort: ePortfolio = {
      id: `port-${Date.now()}`,
      name: newPortfolioName,
      public: newPortfolioPublic,
      sections: [
        {
          id: `sec-${Date.now()}`,
          name: 'Welcome Section',
          entries: [
            {
              id: `ent-${Date.now()}`,
              title: 'Welcome Entry',
              content: 'Start editing your portfolio entries here.',
              created_at: new Date().toLocaleDateString()
            }
          ]
        }
      ]
    };

    setPortfolios(prev => [...prev, newPort]);
    setSelectedPortfolioId(newPort.id);
    setSelectedSectionId(newPort.sections[0].id);
    setSelectedEntryId(newPort.sections[0].entries[0].id);
    setNewPortfolioName('');
    setShowCreateModal(false);
  };

  const handleAddSection = () => {
    if (!newSectionName || !activePortfolio) return;

    const newSec: ePortfolioSection = {
      id: `sec-${Date.now()}`,
      name: newSectionName,
      entries: []
    };

    setPortfolios(prev =>
      prev.map(p =>
        p.id === activePortfolio.id ? { ...p, sections: [...p.sections, newSec] } : p
      )
    );
    setSelectedSectionId(newSec.id);
    setSelectedEntryId(null);
    setNewSectionName('');
  };

  const handleAddEntry = () => {
    if (!newEntryTitle || !newEntryContent || !activePortfolio || !activeSection) return;

    const newEnt: ePortfolioEntry = {
      id: `ent-${Date.now()}`,
      title: newEntryTitle,
      content: newEntryContent,
      created_at: new Date().toLocaleDateString()
    };

    setPortfolios(prev =>
      prev.map(p => {
        if (p.id !== activePortfolio.id) return p;
        return {
          ...p,
          sections: p.sections.map(s =>
            s.id === activeSection.id ? { ...s, entries: [...s.entries, newEnt] } : s
          )
        };
      })
    );
    setSelectedEntryId(newEnt.id);
    setNewEntryTitle('');
    setNewEntryContent('');
  };

  return (
    <div className="cx-page">
      {/* Page Header */}
      <div className="cx-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="cx-page__title">ePortfolios</h1>
          <p className="cx-page__subtitle">Curate your learning journey, achievements, and course works for peer review.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activePortfolio && (
            <button
              className={`cx-btn ${isPreviewMode ? 'cx-btn--primary' : 'cx-btn--secondary'} cx-btn--sm`}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? '✏️ Edit Portfolio' : '👁️ Preview Portfolio'}
            </button>
          )}
          <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowCreateModal(true)}>
            + Create ePortfolio
          </button>
        </div>
      </div>

      {!activePortfolio ? (
        <div className="cx-empty" style={{ padding: 48, background: 'var(--cx-bg-surface)', borderRadius: 12, border: '1px solid var(--cx-border-subtle)' }}>
          <span style={{ fontSize: '3rem', marginBottom: 12 }}>📁</span>
          <h3>No ePortfolios Found</h3>
          <p style={{ maxWidth: '360px', margin: '8px auto 16px auto' }}>Create a new portfolio to display your course accomplishments to advisors and peers.</p>
          <button className="cx-btn cx-btn--primary" onClick={() => setShowCreateModal(true)}>Create Portfolio</button>
        </div>
      ) : isPreviewMode ? (
        /* Gorgeous Live Preview Showcase Mode */
        <div className="cx-card" style={{ padding: 32, background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-default)', boxShadow: 'var(--cx-shadow-md)' }}>
          <div style={{ borderBottom: '2px solid var(--cx-border-subtle)', paddingBottom: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--cx-text-primary)' }}>{activePortfolio.name}</h2>
              <span className="cx-badge cx-badge--success">{activePortfolio.public ? 'Public Access' : 'Private'}</span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--cx-text-tertiary)' }}>Published Student Showcase</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
            <div style={{ borderRight: '1px solid var(--cx-border-subtle)', paddingRight: 24 }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activePortfolio.sections.map(sec => (
                  <li
                    key={sec.id}
                    onClick={() => { setSelectedSectionId(sec.id); setSelectedEntryId(sec.entries[0]?.id || null) }}
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: selectedSectionId === sec.id ? 700 : 500,
                      color: selectedSectionId === sec.id ? 'var(--cx-color-primary)' : 'var(--cx-text-secondary)',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: selectedSectionId === sec.id ? 'var(--cx-color-primary-subtle)' : 'transparent'
                    }}
                  >
                    {sec.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--cx-text-primary)' }}>
                {activeSection?.name}
              </h3>
              {activeSection?.entries.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'var(--cx-text-tertiary)' }}>No showcase entries in this section yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {activeSection?.entries.map(ent => (
                    <div key={ent.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 20 }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 600 }}>{ent.title}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--cx-text-tertiary)' }}>Published: {ent.created_at}</span>
                      <p style={{ marginTop: 12, lineHeight: 1.6, color: 'var(--cx-text-secondary)', fontSize: '0.875rem' }}>{ent.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Comprehensive Editor Mode (S20-09) */
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
          {/* Sidebar Section Manager */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Portfolios list switcher */}
            <div className="cx-card" style={{ padding: 14 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', fontWeight: 'bold', display: 'block', marginBottom: 6 }}>ACTIVE PORTFOLIO</label>
              <select
                className="cx-select"
                value={selectedPortfolioId || ''}
                onChange={e => {
                  const port = portfolios.find(p => p.id === e.target.value);
                  setSelectedPortfolioId(e.target.value);
                  if (port) {
                    setSelectedSectionId(port.sections[0]?.id || '');
                    setSelectedEntryId(port.sections[0]?.entries[0]?.id || null);
                  }
                }}
                style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem' }}
              >
                {portfolios.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Sections lists */}
            <div className="cx-card" style={{ padding: 16 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '0.82rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Portfolio Sections</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activePortfolio.sections.map(sec => (
                  <li
                    key={sec.id}
                    onClick={() => { setSelectedSectionId(sec.id); setSelectedEntryId(sec.entries[0]?.id || null) }}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: selectedSectionId === sec.id ? 600 : 500,
                      color: selectedSectionId === sec.id ? 'var(--cx-color-primary)' : 'var(--cx-text-secondary)',
                      cursor: 'pointer',
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: selectedSectionId === sec.id ? 'var(--cx-color-primary-subtle)' : 'transparent',
                      border: `1px solid ${selectedSectionId === sec.id ? 'var(--cx-color-primary-hover)' : 'transparent'}`
                    }}
                  >
                    📂 {sec.name}
                  </li>
                ))}
              </ul>

              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="New Section..."
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  style={{ flex: 1, height: '30px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 8px', fontSize: '0.72rem' }}
                />
                <button className="cx-btn cx-btn--primary" onClick={handleAddSection} style={{ padding: '0 10px', fontSize: '0.72rem', height: '30px' }}>Add</button>
              </div>
            </div>
          </div>

          {/* Entries list and active editor showcase */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="cx-card" style={{ padding: 20 }}>
              <div style={{ borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
                  Section: {activeSection?.name}
                </h3>
              </div>

              {/* Show List of entries inside Section */}
              {activeSection?.entries.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'var(--cx-text-tertiary)', fontSize: '0.8rem' }}>No entries in this section. Add one below!</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {activeSection?.entries.map(ent => (
                    <button
                      key={ent.id}
                      className={`cx-btn cx-btn--sm ${selectedEntryId === ent.id ? 'cx-btn--primary' : 'cx-btn--secondary'}`}
                      onClick={() => setSelectedEntryId(ent.id)}
                    >
                      📄 {ent.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Active Showcase editor preview */}
              {activeEntry && (
                <div style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)', border: '1px solid var(--cx-border-subtle)', borderRadius: 8, padding: 18 }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.875rem', fontWeight: 600 }}>{activeEntry.title}</h4>
                  <span style={{ fontSize: '0.68rem', color: 'var(--cx-text-tertiary)' }}>Created: {activeEntry.created_at}</span>
                  <div style={{ borderTop: '1px solid var(--cx-border-subtle)', marginTop: 12, paddingTop: 12, fontSize: '0.82rem', color: 'var(--cx-text-secondary)', lineHeight: 1.6 }}>
                    {activeEntry.content}
                  </div>
                </div>
              )}
            </div>

            {/* Add New Entry Form */}
            <div className="cx-card" style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
                Add Section Showcase Entry
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Entry Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab Experiment 1 Writeup"
                    value={newEntryTitle}
                    onChange={e => setNewEntryTitle(e.target.value)}
                    style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px', fontSize: '0.78rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Showcase Narrative / Content</label>
                  <textarea
                    placeholder="Provide a detailed narrative detailing this curriculum milestone artifact..."
                    value={newEntryContent}
                    onChange={e => setNewEntryContent(e.target.value)}
                    style={{ width: '100%', height: '100px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '8px 10px', fontSize: '0.78rem', resize: 'vertical' }}
                  />
                </div>
                <button className="cx-btn cx-btn--primary" onClick={handleAddEntry} style={{ alignSelf: 'flex-start' }} disabled={!newEntryTitle || !newEntryContent}>
                  Add Showcase Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Portfolio Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <form className="cx-card" onSubmit={handleCreatePortfolio} style={{ background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-default)', width: '100%', maxWidth: '440px', padding: 24, borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
              Create New ePortfolio
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Portfolio Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe - Capstone Projects"
                  value={newPortfolioName}
                  onChange={e => setNewPortfolioName(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                  required
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                <input
                  type="checkbox"
                  checked={newPortfolioPublic}
                  onChange={e => setNewPortfolioPublic(e.target.checked)}
                />
                Make this portfolio Public (visible to peer reviewers)
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="cx-btn cx-btn--ghost" type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" type="submit">Create Portfolio</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
