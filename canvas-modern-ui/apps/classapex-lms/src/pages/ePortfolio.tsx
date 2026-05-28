import React, { useState, useMemo, useEffect } from 'react';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';
import NewRceWrapper from '../components/NewRceWrapper';
import LogoLoader from '../components/LogoLoader'

interface EPortfolio {
  id: number;
  name: string;
  public: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface EPortfolioPage {
  id: number;
  eportfolio_id: number;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function EPortfolioPage() {
  const { showToast, showConfirm } = useNotification();

  // Fetch real ePortfolios from Canvas
  const { data: apiPortfolios, isLoading: portfoliosLoading, refetch: refetchPortfolios } = useCanvasQuery<EPortfolio[]>(
    '/api/v1/eportfolios',
    { per_page: 50 } as any
  );

  const portfolios = useMemo(() => Array.isArray(apiPortfolios) ? apiPortfolios : [], [apiPortfolios]);

  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Creation & edit states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioPublic, setNewPortfolioPublic] = useState(true);

  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePassword, setSharePassword] = useState('');

  // Page editing states
  const [newPageName, setNewPageName] = useState('');
  const [editingPageContent, setEditingPageContent] = useState('');
  const [savingPage, setSavingPage] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);

  // Fetch pages for selected portfolio
  const { data: apiPages, isLoading: pagesLoading, refetch: refetchPages } = useCanvasQuery<EPortfolioPage[]>(
    selectedPortfolioId ? `/api/v1/eportfolios/${selectedPortfolioId}/pages` : '',
    { per_page: 50 } as any,
    { enabled: !!selectedPortfolioId }
  );

  const pages = useMemo(() => Array.isArray(apiPages) ? apiPages : [], [apiPages]);

  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].id);
    }
  }, [portfolios, selectedPortfolioId]);

  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  const activePortfolio = portfolios.find(p => p.id === selectedPortfolioId) || null;
  const activePage = pages.find(p => p.id === selectedPageId) || null;

  useEffect(() => {
    if (activePage) {
      setEditingPageContent(activePage.content || '');
    } else {
      setEditingPageContent('');
    }
  }, [activePage?.id]);

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName.trim()) return;
    try {
      const created = await canvasFetch('/api/v1/eportfolios', {
        method: 'POST',
        body: { name: newPortfolioName.trim(), public: newPortfolioPublic },
      });
      showToast({ title: 'Portfolio created', type: 'success' });
      setNewPortfolioName('');
      setShowCreateModal(false);
      refetchPortfolios();
      if (created?.id) {
        setSelectedPortfolioId(created.id);
      }
    } catch (err: any) {
      showToast({ title: 'Failed to create portfolio', message: err?.message || 'Please try again.', type: 'error' });
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    const confirmed = await showConfirm({
      title: 'Delete Portfolio?',
      message: 'This will permanently delete the portfolio and all its pages.',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await canvasFetch(`/api/v1/eportfolios/${id}`, { method: 'DELETE' });
      showToast({ title: 'Portfolio deleted', type: 'success' });
      refetchPortfolios();
      if (selectedPortfolioId === id) {
        setSelectedPortfolioId(null);
        setSelectedPageId(null);
      }
    } catch (err: any) {
      showToast({ title: 'Failed to delete', message: err?.message || 'Please try again.', type: 'error' });
    }
  };

  const handleUpdatePortfolioVisibility = async (id: number, isPublic: boolean) => {
    try {
      await canvasFetch(`/api/v1/eportfolios/${id}`, {
        method: 'PUT',
        body: { public: isPublic },
      });
      showToast({ title: 'Visibility updated', type: 'success' });
      refetchPortfolios();
    } catch (err: any) {
      showToast({ title: 'Update failed', message: err?.message || 'Please try again.', type: 'error' });
    }
  };

  const handleAddPage = async () => {
    if (!newPageName.trim() || !selectedPortfolioId) return;
    setCreatingPage(true);
    try {
      const created = await canvasFetch(`/api/v1/eportfolios/${selectedPortfolioId}/pages`, {
        method: 'POST',
        body: { name: newPageName.trim(), content: '' },
      });
      showToast({ title: 'Page created', type: 'success' });
      setNewPageName('');
      refetchPages();
      if (created?.id) {
        setSelectedPageId(created.id);
      }
    } catch (err: any) {
      showToast({ title: 'Failed to create page', message: err?.message || 'Please try again.', type: 'error' });
    } finally {
      setCreatingPage(false);
    }
  };

  const handleSavePageContent = async () => {
    if (!activePage || !selectedPortfolioId) return;
    setSavingPage(true);
    try {
      await canvasFetch(`/api/v1/eportfolios/${selectedPortfolioId}/pages/${activePage.id}`, {
        method: 'PUT',
        body: { name: activePage.name, content: editingPageContent },
      });
      showToast({ title: 'Page saved', type: 'success' });
      refetchPages();
    } catch (err: any) {
      showToast({ title: 'Failed to save page', message: err?.message || 'Please try again.', type: 'error' });
    } finally {
      setSavingPage(false);
    }
  };

  const handleDeletePage = async (pageId: number) => {
    if (!selectedPortfolioId) return;
    const confirmed = await showConfirm({
      title: 'Delete Page?',
      message: 'This page will be permanently removed.',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      await canvasFetch(`/api/v1/eportfolios/${selectedPortfolioId}/pages/${pageId}`, { method: 'DELETE' });
      showToast({ title: 'Page deleted', type: 'success' });
      refetchPages();
      if (selectedPageId === pageId) {
        setSelectedPageId(null);
      }
    } catch (err: any) {
      showToast({ title: 'Failed to delete page', message: err?.message || 'Please try again.', type: 'error' });
    }
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="cx-page__title">ePortfolios</h1>
          <p className="cx-page__subtitle">Curate your learning journey, achievements, and course works for peer review.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activePortfolio && (
            <>
              <button
                className={`cx-btn ${isPreviewMode ? 'cx-btn--primary' : 'cx-btn--secondary'} cx-btn--sm`}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                {isPreviewMode ? 'Edit Portfolio' : 'Preview Portfolio'}
              </button>
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowShareModal(true)}>
                Share
              </button>
              <button className="cx-btn cx-btn--danger cx-btn--sm" onClick={() => handleDeletePortfolio(activePortfolio.id)}>
                Delete
              </button>
            </>
          )}
          <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowCreateModal(true)}>
            + Create ePortfolio
          </button>
        </div>
      </div>

      {portfoliosLoading ? (
        <LogoLoader text="Loading portfolios…" />
      ) : !activePortfolio ? (
        <div className="cx-empty" style={{ padding: 48, background: 'var(--cx-bg-surface)', borderRadius: 12, border: '1px solid var(--cx-border-subtle)' }}>
          <h3>No ePortfolios Found</h3>
          <p style={{ maxWidth: '360px', margin: '8px auto 16px auto' }}>Create a new portfolio to display your course accomplishments to advisors and peers.</p>
          <button className="cx-btn cx-btn--primary" onClick={() => setShowCreateModal(true)}>Create Portfolio</button>
        </div>
      ) : isPreviewMode ? (
        <div className="cx-card" style={{ padding: 32 }}>
          <div style={{ borderBottom: '2px solid var(--cx-border-subtle)', paddingBottom: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{activePortfolio.name}</h2>
              <span className={`cx-badge ${activePortfolio.public ? 'cx-badge--success' : 'cx-badge--neutral'}`}>
                {activePortfolio.public ? 'Public Access' : 'Private'}
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
            <div style={{ borderRight: '1px solid var(--cx-border-subtle)', paddingRight: 24 }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pages.map(page => (
                  <li
                    key={page.id}
                    onClick={() => setSelectedPageId(page.id)}
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: selectedPageId === page.id ? 700 : 500,
                      color: selectedPageId === page.id ? 'var(--cx-color-primary)' : 'var(--cx-text-secondary)',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: selectedPageId === page.id ? 'var(--cx-color-primary-subtle)' : 'transparent'
                    }}
                  >
                    {page.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {activePage ? (
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px 0' }}>{activePage.name}</h3>
                  <div
                    style={{ lineHeight: 1.6, color: 'var(--cx-text-secondary)', fontSize: '0.875rem' }}
                    dangerouslySetInnerHTML={{ __html: activePage.content || '<p>No content yet.</p>' }}
                  />
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', color: 'var(--cx-text-tertiary)' }}>Select a page to preview.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="cx-card" style={{ padding: 14 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', fontWeight: 'bold', display: 'block', marginBottom: 6 }}>ACTIVE PORTFOLIO</label>
              <select
                className="cx-select"
                value={selectedPortfolioId || ''}
                onChange={e => {
                  const id = Number(e.target.value);
                  setSelectedPortfolioId(id || null);
                  setSelectedPageId(null);
                }}
                style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem' }}
              >
                {portfolios.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="cx-card" style={{ padding: 16 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '0.82rem', fontWeight: 600 }}>Portfolio Pages</h3>
              {pagesLoading ? (
                <LogoLoader />
              ) : pages.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>No pages yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pages.map(page => (
                    <li
                      key={page.id}
                      onClick={() => setSelectedPageId(page.id)}
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: selectedPageId === page.id ? 600 : 500,
                        color: selectedPageId === page.id ? 'var(--cx-color-primary)' : 'var(--cx-text-secondary)',
                        cursor: 'pointer',
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: selectedPageId === page.id ? 'var(--cx-color-primary-subtle)' : 'transparent',
                        border: `1px solid ${selectedPageId === page.id ? 'var(--cx-color-primary-hover)' : 'transparent'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{page.name}</span>
                      <button
                        className="cx-btn cx-btn--ghost cx-btn--sm"
                        style={{ padding: '2px 6px', fontSize: '0.65rem' }}
                        onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id); }}
                        title="Delete page"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="New Page..."
                  value={newPageName}
                  onChange={e => setNewPageName(e.target.value)}
                  style={{ flex: 1, height: '30px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 8px', fontSize: '0.72rem' }}
                />
                <button
                  className="cx-btn cx-btn--primary"
                  onClick={handleAddPage}
                  disabled={creatingPage || !newPageName.trim()}
                  style={{ padding: '0 10px', fontSize: '0.72rem', height: '30px' }}
                >
                  {creatingPage ? '…' : 'Add'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activePage ? (
              <>
                <div className="cx-card" style={{ padding: 20 }}>
                  <div style={{ borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{activePage.name}</h3>
                    <button
                      className="cx-btn cx-btn--primary cx-btn--sm"
                      onClick={handleSavePageContent}
                      disabled={savingPage}
                    >
                      {savingPage ? 'Saving…' : 'Save Page'}
                    </button>
                  </div>
                  <NewRceWrapper
                    value={editingPageContent}
                    onChange={setEditingPageContent}
                    placeholder="Start writing your portfolio page content..."
                    minHeight={240}
                  />
                </div>
              </>
            ) : (
              <div className="cx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--cx-text-tertiary)' }}>
                <p>Select or create a page to begin editing.</p>
              </div>
            )}
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
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700 }}>Create New ePortfolio</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Portfolio Name</label>
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

      {/* Share Portfolio Modal */}
      {showShareModal && activePortfolio && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="cx-card" style={{ background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-default)', width: '100%', maxWidth: '440px', padding: 24, borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700 }}>Share Portfolio</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Public Link</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/eportfolios/${activePortfolio.id}`}
                    style={{ flex: 1, height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px', background: 'var(--cx-bg-surface-raised)', fontSize: '0.78rem' }}
                  />
                  <button
                    className="cx-btn cx-btn--secondary cx-btn--sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/eportfolios/${activePortfolio.id}`);
                      showToast({ title: 'Link copied', type: 'success' });
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                <input
                  type="checkbox"
                  checked={activePortfolio.public}
                  onChange={e => handleUpdatePortfolioVisibility(activePortfolio.id, e.target.checked)}
                />
                Public Access Enabled
              </label>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Password Protection (optional)</label>
                <input
                  type="text"
                  placeholder="Leave empty for no password"
                  value={sharePassword}
                  onChange={e => setSharePassword(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>Note: Password protection is a client-side preference only. Canvas ePortfolios do not support server-side password protection via REST API.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="cx-btn cx-btn--ghost" type="button" onClick={() => setShowShareModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
