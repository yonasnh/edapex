import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCanvasQuery } from '../hooks/useCanvasQuery';

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function SettingsSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }

interface ExternalTool {
  id: number;
  name: string;
  description: string;
  url: string;
  domain: string;
  privacy_level: string;
  consumer_key: string;
  created_at: string;
}

interface DeveloperKey {
  id: number;
  name: string;
  client_id: string;
  secret: string;
  contact_email: string;
  status: 'active' | 'inactive';
  placements: string[];
}

interface ScormPackage {
  id: string;
  title: string;
  version: string;
  status: string;
  score: number;
}

export default function ExternalToolsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState<'tools' | 'keys' | 'scorm'>('tools');

  // LTI Modal & postMessage Simulation states (S20-02, S20-03, S20-07)
  const [launchingTool, setLaunchingTool] = useState<ExternalTool | null>(null);
  const [ltiLogs, setLtiLogs] = useState<string[]>([]);
  const [deepLinkSelections, setDeepLinkSelections] = useState<string[]>([]);

  // Add App state & Placement states (S20-04)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolUrl, setNewToolUrl] = useState('');
  const [placements, setPlacements] = useState({
    course_navigation: true,
    editor_button: false,
    assignment_selection: false,
  });

  // Developer Keys Manager (S20-05)
  const [developerKeys, setDeveloperKeys] = useState<DeveloperKey[]>([
    {
      id: 1,
      name: 'Piazza Discussion Integration',
      client_id: '10000000002829',
      secret: '27ae8d2...82df391c',
      contact_email: 'integrations@piazza.com',
      status: 'active',
      placements: ['course_navigation', 'editor_button']
    },
    {
      id: 2,
      name: 'Gradescope LTI 1.3 Connect',
      client_id: '10000000009482',
      secret: '8910fed...203fbda1',
      contact_email: 'support@gradescope.com',
      status: 'active',
      placements: ['assignment_selection']
    }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEmail, setNewKeyEmail] = useState('');

  // SCORM Player (S20-10)
  const [scormPackages, setScormPackages] = useState<ScormPackage[]>([
    { id: 'scorm-1', title: 'Biology Lab Safety Module', version: 'SCORM 2004 4th Ed', status: 'Completed', score: 100 },
    { id: 'scorm-2', title: 'Calculus Introductory Diagnostics', version: 'SCORM 1.2', status: 'In Progress', score: 65 }
  ]);
  const [activeScorm, setActiveScorm] = useState<ScormPackage | null>(null);
  const [scormLogs, setScormLogs] = useState<string[]>([]);

  // Fetch course tools
  const { data: toolsData, isLoading } = useCanvasQuery<ExternalTool[]>(
    courseId ? `/api/v1/courses/${courseId}/external_tools` : '',
    { per_page: 50 } as any
  );
  
  const initialTools = Array.isArray(toolsData) ? toolsData : [];
  const [localTools, setLocalTools] = useState<ExternalTool[]>([]);

  useEffect(() => {
    if (initialTools.length > 0) {
      setLocalTools(initialTools);
    } else {
      // Mock Fallbacks if empty
      setLocalTools([
        {
          id: 101,
          name: 'Piazza Q&A Forum',
          description: 'Synchronized real-time student discussions and wiki boards.',
          url: 'https://piazza.com/lti/launch',
          domain: 'piazza.com',
          privacy_level: 'public',
          consumer_key: 'piazza-key-canvas-101',
          created_at: new Date().toISOString()
        },
        {
          id: 102,
          name: 'Vimeo Video Cartridge',
          description: 'Embed secure premium educational videos directly inside pages.',
          url: 'https://vimeo.com/lti/connect',
          domain: 'vimeo.com',
          privacy_level: 'anonymous',
          consumer_key: 'vimeo-secure-key-99',
          created_at: new Date().toISOString()
        }
      ]);
    }
  }, [initialTools]);

  // Simulate postMessage handler (S20-02, S20-03, S20-07)
  const handleLaunchLti = (tool: ExternalTool) => {
    setLaunchingTool(tool);
    setLtiLogs([
      `Initiating LTI 1.3 connection handshake to: ${tool.url}`,
      'Constructing encrypted JWT login token...',
      'Client Assertions status code: 200 OK',
      'Target endpoint successfully launched in sandboxed container.'
    ]);
  };

  const simulatePostMessage = (actionType: string) => {
    if (actionType === 'grade') {
      setLtiLogs(prev => [
        ...prev,
        'Incoming postMessage: {"type": "lti.gradeUpdate", "score": 95, "max": 100}',
        'Canvas Assignment grade updated to 95/100 for student!'
      ]);
    } else if (actionType === 'deepLink') {
      setLtiLogs(prev => [
        ...prev,
        'Incoming postMessage: {"type": "lti.deepLinkingResponse", "items": [{"title": "Lab 1 Assessment", "url": "..."}]}',
        'Parsing deep linking response...',
        'Deep linking successful: Aligned 1 item to assignment module. ✅'
      ]);
      setDeepLinkSelections(prev => [...prev, 'Lab 1 Assessment - Aligned from Piazza']);
    }
  };

  // SCORM Player API Simulation (S20-10)
  const handleLaunchScorm = (pkg: ScormPackage) => {
    setActiveScorm(pkg);
    setScormLogs([
      `Initializing SCORM SCORM player frame for: ${pkg.title}`,
      'Binding global window interface: window.API_1484_11',
      'window.API_1484_11.Initialize("") -> 100% Success',
      'cmi.core.entry = "resume"'
    ]);
  };

  const triggerScormInteraction = (type: 'progress' | 'complete') => {
    if (type === 'progress') {
      setScormLogs(prev => [
        ...prev,
        'SCORM API Call: GetValue("cmi.core.lesson_location")',
        'SCORM API Call: SetValue("cmi.core.lesson_location", "slide_4")',
        'cmi.core.lesson_location set to slide_4. Status committed. 💾'
      ]);
    } else {
      setScormLogs(prev => [
        ...prev,
        'SCORM API Call: SetValue("cmi.core.lesson_status", "completed")',
        'SCORM API Call: SetValue("cmi.core.score.raw", "98")',
        'SCORM API Call: Commit("")',
        'SCORM successfully finished. Grade posted back to gradebook: 98%. ✅'
      ]);
      setScormPackages(prev =>
        prev.map(p => p.id === activeScorm?.id ? { ...p, status: 'Completed', score: 98 } : p)
      );
    }
  };

  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName || !newToolUrl) return;

    const newTool: ExternalTool = {
      id: Date.now(),
      name: newToolName,
      description: 'Custom external LTI integration tool.',
      url: newToolUrl,
      domain: new URL(newToolUrl).hostname,
      privacy_level: 'public',
      consumer_key: 'ckey-' + Math.random().toString(36).substring(4),
      created_at: new Date().toISOString()
    };

    setLocalTools(prev => [...prev, newTool]);
    setNewToolName('');
    setNewToolUrl('');
    setShowAddModal(false);
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyEmail) return;

    const newKey: DeveloperKey = {
      id: Date.now(),
      name: newKeyName,
      client_id: '1000000000' + Math.floor(1000 + Math.random() * 9000),
      secret: Math.random().toString(36).substring(2, 10) + '...' + Math.random().toString(36).substring(2, 10),
      contact_email: newKeyEmail,
      status: 'active',
      placements: ['course_navigation']
    };

    setDeveloperKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setNewKeyEmail('');
  };

  return (
    <div className="cx-page">
      {/* Page Header */}
      <div className="cx-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="cx-page__title">LTI Integrations &amp; SCORM Hub</h1>
          <p className="cx-page__subtitle">Manage third-party tools, SCORM player modules, and LTI developer keys.</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowAddModal(true)}>
          <PlusSvg /> Add LTI App
        </button>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--cx-border-subtle)', marginBottom: 20, gap: 8 }}>
        <button
          className={`cx-btn cx-btn--sm ${activeTab === 'tools' ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
          onClick={() => setActiveTab('tools')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          🔑 Course Tools
        </button>
        <button
          className={`cx-btn cx-btn--sm ${activeTab === 'keys' ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
          onClick={() => setActiveTab('keys')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          🔐 Developer Keys (Admin)
        </button>
        <button
          className={`cx-btn cx-btn--sm ${activeTab === 'scorm' ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
          onClick={() => setActiveTab('scorm')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          💿 SCORM Player
        </button>
      </div>

      {/* ── Tab 1: Course Tools ── */}
      {activeTab === 'tools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {isLoading ? (
            <div className="cx-loading"><div className="cx-loading__spinner" /></div>
          ) : localTools.length === 0 ? (
            <div className="cx-empty">
              <SettingsSvg />
              <h3>No External Tools</h3>
              <p>No LTI apps are currently configured for this course.</p>
            </div>
          ) : (
            <div className="cx-table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>App Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Domain</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Privacy</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)', width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localTools.map(tool => (
                    <tr key={tool.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{tool.name}</div>
                        {tool.description && <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)', marginTop: 4 }}>{tool.description}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--cx-text-primary)' }}>{tool.domain}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="cx-badge cx-badge--neutral" style={{ textTransform: 'capitalize' }}>{tool.privacy_level}</span>
                      </td>
                      <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleLaunchLti(tool)}>
                          🚀 Launch App
                        </button>
                        <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => {
                          setLocalTools(prev => prev.filter(t => t.id !== tool.id))
                        }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Deep Linking Results */}
          {deepLinkSelections.length > 0 && (
            <div className="cx-card" style={{ padding: 16, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.8125rem', fontWeight: 600, color: '#059669' }}>
                Deep Linked Content Items Imported
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.78rem', color: 'var(--cx-text-secondary)' }}>
                {deepLinkSelections.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>
          )}

          {/* LTI Sandboxed Launch Overlay (S20-02, S20-03, S20-07) */}
          {launchingTool && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0, 0, 0, 0.75)', zIndex: 100, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 24
            }}>
              <div style={{
                background: 'var(--cx-bg-surface)', width: '90%', maxWidth: '1000px',
                height: '85vh', borderRadius: 12, overflow: 'hidden', display: 'grid',
                gridTemplateRows: '56px 1fr',
                border: '1px solid var(--cx-border-default)'
              }}>
                <div style={{ background: 'var(--cx-bg-surface-raised)', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>LTI Launch Wrapper: {launchingTool.name}</span>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setLaunchingTool(null)}>✕ Close Player</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: '100%' }}>
                  {/* Simulated App Iframe Area */}
                  <div style={{ background: 'var(--cx-bg-surface-sunken)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--cx-border-subtle)' }}>
                    <div style={{
                      background: 'var(--cx-bg-surface)', width: '100%', maxWidth: '600px', height: '280px',
                      borderRadius: 8, boxShadow: 'var(--cx-shadow-md)', border: '1px solid var(--cx-border-subtle)',
                      display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                      <div style={{ background: 'var(--cx-bg-surface-raised)', padding: '6px 12px', fontSize: '0.72rem', display: 'flex', gap: 6, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>
                        <span style={{ color: '#ef4444' }}>●</span><span style={{ color: '#eab308' }}>●</span><span style={{ color: '#22c55e' }}>●</span>
                        <span style={{ marginLeft: 6, fontFamily: 'monospace', color: 'var(--cx-text-tertiary)' }}>{launchingTool.url}</span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
                        <span style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</span>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--cx-text-primary)' }}>Piazza LTI Deep Linker Provider</h4>
                        <p style={{ margin: '0 0 16px 0', fontSize: '0.75rem', color: 'var(--cx-text-secondary)', maxWidth: '360px' }}>
                          Simulate external tool action events sending grade data or alignments back to ClassApex.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="cx-btn cx-btn--sm cx-btn--primary" onClick={() => simulatePostMessage('grade')}>
                            Post Grade back (95%)
                          </button>
                          <button className="cx-btn cx-btn--sm cx-btn--secondary" onClick={() => simulatePostMessage('deepLink')}>
                            Return Deep Link Items
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time postMessage handshake debugger console */}
                  <div style={{ background: '#0f172a', color: '#38bdf8', padding: '16px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: 6, marginBottom: 10 }}>
                      LTI postMessage Handshake Console
                    </span>
                    <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {ltiLogs.map((log, index) => <div key={index}>&gt; {log}</div>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Developer Keys (S20-05 Admin Management) ── */}
      {activeTab === 'keys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Create Developer Key Form */}
          <form className="cx-card" onSubmit={handleAddKey} style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Key/App Name</label>
              <input
                type="text"
                className="cx-grading__comment-input"
                placeholder="e.g. Gradescope LTI v1.3"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Developer Email</label>
              <input
                type="email"
                className="cx-grading__comment-input"
                placeholder="developer@gradescope.com"
                value={newKeyEmail}
                onChange={e => setNewKeyEmail(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                required
              />
            </div>
            <button className="cx-btn cx-btn--primary" type="submit" style={{ height: '36px' }}>
              Create Developer Key
            </button>
          </form>

          {/* Developer Keys Table */}
          <div className="cx-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ background: 'var(--cx-bg-surface-raised, #f8fafc)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--cx-border-subtle)' }}>App Client ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--cx-border-subtle)' }}>Secret</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--cx-border-subtle)' }}>Owner/Contact</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--cx-border-subtle)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--cx-border-subtle)', width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {developerKeys.map(key => (
                  <tr key={key.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{key.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', fontFamily: 'monospace', marginTop: 2 }}>
                        Client ID: {key.client_id}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--cx-text-primary)' }}>{key.secret}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--cx-text-secondary)' }}>{key.contact_email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`cx-badge ${key.status === 'active' ? 'cx-badge--success' : 'cx-badge--neutral'}`}>
                        {key.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        className="cx-btn cx-btn--ghost cx-btn--sm"
                        onClick={() => {
                          setDeveloperKeys(prev => prev.map(k => k.id === key.id ? { ...k, status: k.status === 'active' ? 'inactive' : 'active' } : k))
                        }}
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: SCORM Player (S20-10 launch wrapper) ── */}
      {activeTab === 'scorm' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* SCORM List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>SCORM 1.2 / 2004 Course Packages</h3>
            {scormPackages.map(pkg => (
              <div key={pkg.id} className="cx-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{pkg.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginTop: 2 }}>
                    Standards: {pkg.version} · Status: {pkg.status}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {pkg.status === 'Completed' && (
                    <span className="cx-badge cx-badge--success">{pkg.score}% Score</span>
                  )}
                  <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => handleLaunchScorm(pkg)}>
                    Play SCORM
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SCORM API Monitor Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Simulated SCORM Runtime Stream</h3>
            <div style={{ flex: 1, background: '#0f172a', color: '#10b981', padding: '16px', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.72rem', minHeight: '220px', overflowY: 'auto' }}>
              <div style={{ color: '#64748b', borderBottom: '1px solid #1e293b', paddingBottom: 6, marginBottom: 10, fontWeight: 'bold' }}>
                SCORM API_1484_11 bindings log
              </div>
              {scormLogs.length === 0 ? (
                <div style={{ color: '#475569', fontStyle: 'italic' }}>Awaiting SCORM Package Launch...</div>
              ) : (
                scormLogs.map((log, index) => <div key={index}>&gt; {log}</div>)
              )}
            </div>

            {activeScorm && (
              <div className="cx-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--cx-text-primary)' }}>
                  Active Module: {activeScorm.title}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="cx-btn cx-btn--sm cx-btn--primary" onClick={() => triggerScormInteraction('progress')}>
                    Advance to slide 4
                  </button>
                  <button className="cx-btn cx-btn--sm cx-btn--success" onClick={() => triggerScormInteraction('complete')}>
                    Complete Package with 98% Score
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add App Placement settings Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <form className="cx-card" onSubmit={handleAddTool} style={{ background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-default)', width: '100%', maxWidth: '480px', padding: 24, borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--cx-text-primary)' }}>
              Configure External LTI App
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>App Name</label>
                <input
                  type="text"
                  className="cx-grading__comment-input"
                  placeholder="e.g. Gradescope Connect"
                  value={newToolName}
                  onChange={e => setNewToolName(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>LTI Launch URL</label>
                <input
                  type="url"
                  className="cx-grading__comment-input"
                  placeholder="https://gradescope.com/lti/launch"
                  value={newToolUrl}
                  onChange={e => setNewToolUrl(e.target.value)}
                  style={{ width: '100%', height: '36px', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, padding: '0 10px' }}
                  required
                />
              </div>

              {/* Tool Placement checkboxes S20-04 */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Tool Placements Rendering Selection</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={placements.course_navigation}
                      onChange={e => setPlacements(prev => ({ ...prev, course_navigation: e.target.checked }))}
                    />
                    Course Left Navigation Tab
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={placements.editor_button}
                      onChange={e => setPlacements(prev => ({ ...prev, editor_button: e.target.checked }))}
                    />
                    Rich Text Editor Button Icon
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={placements.assignment_selection}
                      onChange={e => setPlacements(prev => ({ ...prev, assignment_selection: e.target.checked }))}
                    />
                    Assignment Tool Selection Placement
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="cx-btn cx-btn--ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" type="submit">Configure Tool</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
