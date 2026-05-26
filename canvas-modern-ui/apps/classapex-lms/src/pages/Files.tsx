import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import FileCard from '../components/FileCard';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';

/* ─── Types ──────────────────────────────────────────────────────────── */
interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'pdf' | 'image' | 'video' | 'audio' | 'other';
  size?: number;
  modifiedAt: string;
  modifiedBy?: string;
  isShared?: boolean;
  downloadCount?: number;
  url?: string;
  thumbnail_url?: string;
  content_type?: string;
  rawFolderId?: number; // numeric Canvas folder ID, for drill-down
  usage_rights?: {
    use_justification: 'own_copyright' | 'used_by_permission' | 'fair_use' | 'public_domain' | 'creative_commons';
    license?: string;
    legal_copyright?: string;
    message?: string;
  };
}

interface BreadcrumbEntry { id: number; name: string; }

function toFileType(mimeClass: string): FileItem['type'] {
  switch (mimeClass) {
    case 'folder': return 'folder';
    case 'pdf': return 'pdf';
    case 'image': return 'image';
    case 'video': return 'video';
    case 'audio': return 'audio';
    case 'doc': case 'xls': case 'ppt': case 'text': return 'document';
    default: return 'other';
  }
}

/* ─── Icons ──────────────────────────────────────────────────────────── */
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function UploadSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 11V3M4 7l4-4 4 4"/><path d="M2 13h12"/></svg>; }
function FolderAddSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 11a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h4l1.5 2H13a1 1 0 011 1z"/><path d="M8 8v4M6 10h4"/></svg>; }
function GridSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>; }
function ListSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="2" rx="1"/><rect x="2" y="7" width="12" height="2" rx="1"/><rect x="2" y="11" width="12" height="2" rx="1"/></svg>; }
function FolderSvg({ size = 20 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4l1.5 2H17a1 1 0 011 1z"/></svg>; }
function DocumentSvg({ size = 20 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V7l-4-5z"/><path d="M12 2v5h5"/></svg>; }
function PdfSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V7l-4-5z"/><polyline points="12,2 12,7 17,7"/><path d="M8 12h4M8 10h4M8 14h2"/></svg>; }
function ImageSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="14" height="14" rx="2" ry="2"/><circle cx="7" cy="7" r="1.5"/><polyline points="17,12 13,8 4,17"/></svg>; }
function VideoSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="18 6 12 10 18 14 18 6"/><rect x="1" y="4" width="11" height="12" rx="2" ry="2"/></svg>; }
function AudioSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 15V4l8-2v11"/><circle cx="5" cy="15" r="3"/><circle cx="13" cy="13" r="3"/></svg>; }
function CloudSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 12a4 4 0 100-8 4.5 4.5 0 00-8.5 1.5A3.5 3.5 0 005 12h10z"/></svg>; }
function ShareSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4" cy="10" r="2"/><circle cx="4" cy="4" r="2"/><circle cx="10" cy="7" r="2"/><path d="M5.5 5.5l3 3M5.5 8.5l3-3"/></svg>; }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>; }
function DownloadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10V2M4 7l3 3 3-3"/><path d="M2 11v1h10v-1"/></svg>; }
function EyeSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/><circle cx="7" cy="7" r="1.5"/></svg>; }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 1.5l3 3L5 11.5H2v-3z"/></svg>; }
function DeleteSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,3 3,11 9,11 10,3"/><path d="M1 3h10"/><path d="M4 3V1h4v2"/></svg>; }
function ExternalLinkSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H2v10h10V8M8 2h4v4M6 8l5-5"/></svg>; }
function ChevronRightSvg() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2l4 4-4 4"/></svg>; }
function HomeSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 6l6-5 6 5v7H9v-4H5v4H1V6z"/></svg>; }
function LockSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="6" width="8" height="7" rx="1"/><path d="M4 6V4a3 3 0 016 0v2"/></svg>; }

/* ─── Breadcrumb bar ─────────────────────────────────────────────────── */
interface BreadcrumbBarProps {
  crumbs: BreadcrumbEntry[];
  onNavigate: (index: number) => void; // -1 = go to root
}
const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({ crumbs, onNavigate }) => (
  <nav aria-label="Folder breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', padding: '8px 0', fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
    <button
      className="cx-btn cx-btn--ghost cx-btn--sm"
      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px', fontWeight: crumbs.length === 0 ? 600 : 400, color: crumbs.length === 0 ? 'var(--cx-text-primary)' : 'var(--cx-color-primary)' }}
      onClick={() => onNavigate(-1)}
    >
      <HomeSvg /> My Files
    </button>
    {crumbs.map((crumb, i) => (
      <React.Fragment key={crumb.id}>
        <span style={{ opacity: 0.4 }}><ChevronRightSvg /></span>
        <button
          className="cx-btn cx-btn--ghost cx-btn--sm"
          style={{
            padding: '3px 6px',
            fontWeight: i === crumbs.length - 1 ? 600 : 400,
            color: i === crumbs.length - 1 ? 'var(--cx-text-primary)' : 'var(--cx-color-primary)',
          }}
          onClick={() => onNavigate(i)}
          aria-current={i === crumbs.length - 1 ? 'page' : undefined}
        >
          {crumb.name}
        </button>
      </React.Fragment>
    ))}
  </nav>
);

/* ─── File Preview Modal ─────────────────────────────────────────────── */
interface PreviewModalProps { file: FileItem; onClose: () => void; onDownload: () => void; onSaved?: () => void; }
const FilePreviewModal: React.FC<PreviewModalProps> = ({ file, onClose, onDownload, onSaved }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const { showToast } = useNotification();
  const [usageJustification, setUsageJustification] = useState(file.usage_rights?.use_justification || '');
  const [usageLicense, setUsageLicense] = useState(file.usage_rights?.license || '');
  const [savingUsage, setSavingUsage] = useState(false);

  useEffect(() => {
    setUsageJustification(file.usage_rights?.use_justification || '');
    setUsageLicense(file.usage_rights?.license || '');
  }, [file.id]);

  const handleSaveUsageRights = async () => {
    if (!usageJustification) return;
    setSavingUsage(true);
    try {
      const body: Record<string, any> = {
        usage_rights: {
          use_justification: usageJustification,
        },
      };
      if (usageJustification === 'creative_commons' && usageLicense) {
        body.usage_rights.license = usageLicense;
      }
      await canvasFetch(`/api/v1/files/${file.id}`, { method: 'PUT', body });
      showToast({ title: 'Usage rights updated', type: 'success' });
      onSaved?.();
    } catch (err) {
      console.error('[Files] save usage rights failed:', err);
      showToast({ title: 'Failed to update usage rights', type: 'error' });
    } finally {
      setSavingUsage(false);
    }
  };

  const fmt = (b?: number) => {
    if (!b) return '—';
    const s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${s[i]}`;
  };

  const body = () => {
    if (!file.url) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48, color: 'var(--cx-text-secondary)' }}>
        <div style={{ fontSize: 48 }}>{getTypeIcon(file.type)}</div>
        <p style={{ margin: 0 }}>Preview not available.</p>
      </div>
    );
    switch (file.type) {
      case 'image':
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, padding: 16 }}>
          <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 8 }} />
        </div>;
      case 'video':
        return <div style={{ padding: 16 }}>
          <video src={file.url} controls style={{ width: '100%', maxHeight: '60vh', borderRadius: 8, background: '#000' }} />
        </div>;
      case 'audio':
        return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 48 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cx-color-primary) 0%, #8a3ffc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <AudioSvg />
          </div>
          <p style={{ margin: 0, fontWeight: 600 }}>{file.name}</p>
          <audio src={file.url} controls style={{ width: '100%', maxWidth: 400 }} />
        </div>;
      case 'pdf':
        return <div style={{ height: '65vh' }}>
          <iframe src={`${file.url}#view=FitH`} title={file.name} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }} />
        </div>;
      default:
        return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 48, color: 'var(--cx-text-secondary)' }}>
          <div style={{ opacity: 0.5 }}>{getTypeIcon(file.type)}</div>
          <p style={{ margin: 0 }}>No inline preview for <strong>{file.type}</strong> files.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {file.url && <a href={file.url} target="_blank" rel="noopener noreferrer" className="cx-btn cx-btn--secondary cx-btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ExternalLinkSvg /> Open in Canvas</a>}
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={onDownload} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DownloadSvg /> Download</button>
          </div>
        </div>;
    }
  };

  return (
    <div className="cx-modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 900, width: '92vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="cx-modal__header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ flexShrink: 0, color: 'var(--cx-color-primary)' }}>{getTypeIcon(file.type)}</span>
            <div style={{ minWidth: 0 }}>
              <h2 className="cx-modal__title" style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>
                {file.type.toUpperCase()} {file.size ? `· ${fmt(file.size)}` : ''} · Modified {new Date(file.modifiedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {file.type !== 'folder' && <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onDownload} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DownloadSvg /> Download</button>}
            {file.url && <a href={file.url} target="_blank" rel="noopener noreferrer" className="cx-btn cx-btn--ghost cx-btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ExternalLinkSvg /></a>}
            <button className="cx-btn cx-btn--ghost" onClick={onClose} aria-label="Close preview"><XSvg /></button>
          </div>
        </div>
        <div className="cx-modal__body" style={{ flex: 1, overflow: 'auto', padding: 0 }}>
          {body()}
          {file.type !== 'folder' && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--cx-border-subtle)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Usage Rights</h4>
              {file.usage_rights ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', marginBottom: 10 }}>
                  <span className="cx-badge cx-badge--info" style={{ textTransform: 'capitalize' }}>{file.usage_rights.use_justification.replace(/_/g, ' ')}</span>
                  {file.usage_rights.license && <span style={{ marginLeft: 8 }}>License: {file.usage_rights.license}</span>}
                </div>
              ) : (
                <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)', marginBottom: 10 }}>No usage rights set.</div>
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  className="cx-select"
                  style={{ fontSize: '0.8125rem', minWidth: 160 }}
                  value={usageJustification}
                  onChange={e => setUsageJustification(e.target.value)}
                >
                  <option value="">Select justification…</option>
                  <option value="own_copyright">I hold the copyright</option>
                  <option value="used_by_permission">Used with permission</option>
                  <option value="fair_use">Fair use</option>
                  <option value="public_domain">Public domain</option>
                  <option value="creative_commons">Creative Commons</option>
                </select>
                {usageJustification === 'creative_commons' && (
                  <select
                    className="cx-select"
                    style={{ fontSize: '0.8125rem', minWidth: 160 }}
                    value={usageLicense}
                    onChange={e => setUsageLicense(e.target.value)}
                  >
                    <option value="">Select license…</option>
                    <option value="cc_by">CC BY</option>
                    <option value="cc_by_sa">CC BY-SA</option>
                    <option value="cc_by_nc">CC BY-NC</option>
                    <option value="cc_by_nc_sa">CC BY-NC-SA</option>
                    <option value="cc_by_nd">CC BY-ND</option>
                    <option value="cc_by_nc_nd">CC BY-NC-ND</option>
                  </select>
                )}
                <button
                  className="cx-btn cx-btn--primary cx-btn--sm"
                  disabled={!usageJustification || savingUsage}
                  onClick={handleSaveUsageRights}
                >
                  {savingUsage ? 'Saving…' : 'Save Usage Rights'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Rename Modal ───────────────────────────────────────────────────── */
interface RenameModalProps { file: FileItem; onClose: () => void; onConfirm: (n: string) => Promise<void>; }
const RenameModal: React.FC<RenameModalProps> = ({ file, onClose, onConfirm }) => {
  const [name, setName] = useState(file.name);
  const [loading, setLoading] = useState(false);
  const submit = async () => { if (!name.trim() || name === file.name) return; setLoading(true); await onConfirm(name.trim()); setLoading(false); };
  return (
    <div className="cx-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="cx-modal cx-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="cx-modal__header">
          <h2 className="cx-modal__title">Rename {file.type === 'folder' ? 'Folder' : 'File'}</h2>
          <button className="cx-btn cx-btn--ghost" onClick={onClose}><XSvg /></button>
        </div>
        <div className="cx-modal__body">
          <input type="text" className="cx-search__input" autoFocus
            style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '0.875rem', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', width: '100%' }}
            value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }} />
        </div>
        <div className="cx-modal__footer">
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onClose}>Cancel</button>
          <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={!name.trim() || name === file.name || loading} onClick={submit}>{loading ? 'Saving…' : 'Rename'}</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Confirm Modal ───────────────────────────────────────────── */
interface DeleteModalProps { file: FileItem; onClose: () => void; onConfirm: () => Promise<void>; }
const DeleteModal: React.FC<DeleteModalProps> = ({ file, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const doDelete = async () => { setLoading(true); await onConfirm(); setLoading(false); };
  return (
    <div className="cx-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="cx-modal cx-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="cx-modal__header">
          <h2 className="cx-modal__title" style={{ color: 'var(--cx-color-danger)' }}>Delete {file.type === 'folder' ? 'Folder' : 'File'}</h2>
          <button className="cx-btn cx-btn--ghost" onClick={onClose}><XSvg /></button>
        </div>
        <div className="cx-modal__body">
          <p style={{ margin: 0, color: 'var(--cx-text-secondary)', fontSize: '0.9375rem' }}>
            Delete <strong style={{ color: 'var(--cx-text-primary)' }}>{file.name}</strong>?
            {file.type === 'folder' && ' All files inside will also be removed.'}
            {' '}This cannot be undone.
          </p>
        </div>
        <div className="cx-modal__footer">
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={onClose}>Cancel</button>
          <button className="cx-btn cx-btn--sm" style={{ background: 'var(--cx-color-danger)', color: '#fff', border: 'none' }} disabled={loading} onClick={doDelete}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Icon helper ────────────────────────────────────────────────────── */
function getTypeIcon(type: FileItem['type']) {
  switch (type) {
    case 'folder': return <FolderSvg />;
    case 'pdf': return <PdfSvg />;
    case 'image': return <ImageSvg />;
    case 'video': return <VideoSvg />;
    case 'audio': return <AudioSvg />;
    default: return <DocumentSvg />;
  }
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
const FilesPage: React.FC = () => {
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ── Folder navigation state ──
  // folderStack holds breadcrumb path; empty = root level
  const [folderStack, setFolderStack] = useState<BreadcrumbEntry[]>([]);
  const currentFolderId = folderStack.length > 0 ? folderStack[folderStack.length - 1].id : null;

  // ── UI state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [renameFile, setRenameFile] = useState<FileItem | null>(null);
  const [deleteFile, setDeleteFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showBulkUsageModal, setShowBulkUsageModal] = useState(false);
  const [bulkJustification, setBulkJustification] = useState('');
  const [bulkLicense, setBulkLicense] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);

  // ── Dynamic API endpoints based on current folder ──
  // When at root (currentFolderId == null): use user self endpoints
  // When inside a folder: use folder-scoped endpoints
  const filesEndpoint = currentFolderId
    ? `/api/v1/folders/${currentFolderId}/files`
    : '/api/v1/users/self/files';
  const foldersEndpoint = currentFolderId
    ? `/api/v1/folders/${currentFolderId}/folders`
    : '/api/v1/users/self/folders';

  const { data: rawFiles, isLoading: filesLoading, refetch: refetchFiles } = useCanvasQuery<any[]>(
    filesEndpoint, { per_page: 100, sort: 'created_at', order: 'desc' } as any
  );
  const { data: rawFolders, isLoading: foldersLoading, refetch: refetchFolders } = useCanvasQuery<any[]>(
    foldersEndpoint, { per_page: 100 } as any
  );
  const { data: rawCourses } = useCanvasQuery<any[]>(
    '/api/v1/courses', { enrollment_state: 'active', per_page: 50 } as any
  );
  // Root folder info (to know the root folder ID for accurate root-level display)
  const { data: rootFolderData } = useCanvasQuery<any>(
    '/api/v1/users/self/folders/root', {} as any
  );

  const isLoading = filesLoading || foldersLoading;
  const courses = Array.isArray(rawCourses) ? rawCourses : [];

  // When at root level, Canvas returns ALL user folders (flat). Filter to only root-level
  // by checking parent_folder_id matches the root folder id.
  const rootFolderId: number | null = rootFolderData?.id ?? null;

  const allFiles: FileItem[] = useMemo(() => {
    let rawFolderList = Array.isArray(rawFolders) ? rawFolders : [];

    // At root: only show folders whose parent is the Canvas root folder
    if (currentFolderId === null && rootFolderId !== null) {
      rawFolderList = rawFolderList.filter(f => f.parent_folder_id === rootFolderId);
    }

    const folders: FileItem[] = rawFolderList.map(f => ({
      id: `folder_${f.id}`,
      name: f.name,
      type: 'folder' as const,
      modifiedAt: f.updated_at || f.created_at,
      modifiedBy: undefined,
      rawFolderId: f.id,
    }));

    const files: FileItem[] = Array.isArray(rawFiles) ? rawFiles.map(f => ({
      id: String(f.id),
      name: f.display_name || f.filename,
      type: toFileType(f.mime_class || ''),
      size: f.size,
      modifiedAt: f.updated_at || f.created_at,
      modifiedBy: f.user?.name,
      url: f.url,
      thumbnail_url: f.thumbnail_url,
      content_type: f.content_type,
      usage_rights: f.usage_rights,
    })) : [];

    return [...folders, ...files];
  }, [rawFiles, rawFolders, currentFolderId, rootFolderId]);

  // ── CSRF token helper ──
  const getCsrfToken = useCallback(() => {
    const raw = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? '';
    return decodeURIComponent(raw);
  }, []);

  // ── Folder navigation ──
  const drillIntoFolder = (folderId: number, folderName: string) => {
    setFolderStack(prev => [...prev, { id: folderId, name: folderName }]);
    setPage(1);
    setSearchTerm('');
  };

  const navigateBreadcrumb = (index: number) => {
    if (index === -1) {
      setFolderStack([]);
    } else {
      setFolderStack(prev => prev.slice(0, index + 1));
    }
    setPage(1);
    setSearchTerm('');
  };

  // ── Upload ──
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      // Upload to current folder if inside one, otherwise user personal files
      const endpoint = currentFolderId
        ? `/api/v1/folders/${currentFolderId}/files`
        : '/api/v1/users/self/files';

      const notifyBody: Record<string, string | number> = {
        name: file.name,
        size: file.size,
        content_type: file.type,
      };

      const notifyRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
        body: JSON.stringify(notifyBody),
      });
      if (!notifyRes.ok) throw new Error('Upload notify failed');
      const { upload_url, upload_params } = await notifyRes.json();

      const formData = new FormData();
      Object.entries(upload_params || {}).forEach(([k, v]) => formData.append(k, v as string));
      formData.append('file', file);
      const uploadRes = await fetch(upload_url, { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('File upload failed');

      const confirmUrl = uploadRes.headers.get('Location') || (await uploadRes.json()).location;
      if (confirmUrl) await fetch(confirmUrl, { method: 'GET' });

      refetchFiles();
      setShowUploadModal(false);
    } catch (err) {
      console.error('[Files] Upload failed:', err);
      showToast({ title: 'Upload failed', message: 'Check console for details.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // ── Create Folder ──
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      // Create folder inside current folder, or at root if at root level
      const body: Record<string, string | number> = { name: newFolderName };
      if (currentFolderId) {
        body.parent_folder_id = currentFolderId;
      } else {
        body.parent_folder_path = '/';
      }

      const res = await fetch('/api/v1/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Create folder failed');
      refetchFolders();
      setNewFolderName('');
      setShowCreateFolderModal(false);
    } catch (err) {
      console.error('[Files] Create folder failed:', err);
      showToast({ title: 'Failed to create folder', type: 'error' });
    }
  };

  // ── Download ──
  const handleDownload = (file: FileItem) => {
    if (!file.url) { showToast({ title: 'No download URL available', type: 'warning' }); return; }
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Rename ──
  const handleRename = async (file: FileItem, newName: string) => {
    try {
      const isFolder = file.type === 'folder';
      const rawId = isFolder ? file.id.replace('folder_', '') : file.id;
      const endpoint = isFolder ? `/api/v1/folders/${rawId}` : `/api/v1/files/${rawId}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error('Rename failed');
      refetchFiles(); refetchFolders();
      setRenameFile(null);
    } catch (err) {
      console.error('[Files] Rename failed:', err);
      showToast({ title: 'Failed to rename', type: 'error' });
    }
  };

  // ── Delete ──
  const handleDelete = async (file: FileItem) => {
    try {
      const isFolder = file.type === 'folder';
      const rawId = isFolder ? file.id.replace('folder_', '') : file.id;
      const endpoint = isFolder ? `/api/v1/folders/${rawId}?force=true` : `/api/v1/files/${rawId}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });
      if (!res.ok) throw new Error('Delete failed');
      refetchFiles(); refetchFolders();
      setDeleteFile(null);
    } catch (err) {
      console.error('[Files] Delete failed:', err);
      showToast({ title: 'Failed to delete', type: 'error' });
    }
  };

  // ── Filtering / sorting ──
  const filteredFiles = useMemo(() => {
    let list = [...allFiles];
    if (filterType !== 'all') list = list.filter(f => f.type === filterType);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      switch (sortBy) {
        case 'modified': return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case 'size': return (b.size || 0) - (a.size || 0);
        case 'type': return a.type.localeCompare(b.type);
        default: return a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [allFiles, searchTerm, filterType, sortBy]);

  const totalPages = Math.ceil(filteredFiles.length / pageSize);
  const paginatedFiles = filteredFiles.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    totalFiles: allFiles.filter(f => f.type !== 'folder').length,
    totalFolders: allFiles.filter(f => f.type === 'folder').length,
    totalSize: allFiles.reduce((s, f) => s + (f.size || 0), 0),
    sharedFiles: allFiles.filter(f => f.isShared).length,
  }), [allFiles]);

  const formatFileSize = (b: number) => {
    if (!b) return '0 B';
    const s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${s[i]}`;
  };
  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const handleClearFilters = () => { setSearchTerm(''); setFilterType('all'); setPage(1); };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleBulkUsageRights = async () => {
    if (!bulkJustification || selectedFiles.size === 0) return;
    setBulkSaving(true);
    try {
      const promises = Array.from(selectedFiles).map(fileId => {
        const body: Record<string, any> = {
          usage_rights: { use_justification: bulkJustification },
        };
        if (bulkJustification === 'creative_commons' && bulkLicense) {
          body.usage_rights.license = bulkLicense;
        }
        return canvasFetch(`/api/v1/files/${fileId}`, { method: 'PUT', body });
      });
      await Promise.all(promises);
      showToast({ title: `Updated usage rights for ${selectedFiles.size} file(s)`, type: 'success' });
      setSelectedFiles(new Set());
      setShowBulkUsageModal(false);
      setBulkJustification('');
      setBulkLicense('');
      refetchFiles();
    } catch (err) {
      console.error('[Files] bulk usage rights failed:', err);
      showToast({ title: 'Failed to update usage rights for some files', type: 'error' });
    } finally {
      setBulkSaving(false);
    }
  };

  // Current folder permission context label
  const locationLabel = currentFolderId
    ? `"${folderStack[folderStack.length - 1]?.name}"`
    : 'My Files';

  /* ──────────────────────────────────────────────────────────────────── */
  return (
    <div className="cx-page">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />

      {/* ── Breadcrumb ── */}
      <BreadcrumbBar crumbs={folderStack} onNavigate={navigateBreadcrumb} />

      {/* ── Stats ── */}
      <div className="cx-stats-grid">
        {[
          { label: 'Items Here', value: isLoading ? '…' : allFiles.length, icon: <DocumentSvg /> },
          { label: 'Folders', value: isLoading ? '…' : stats.totalFolders, icon: <FolderSvg /> },
          { label: 'Storage Used', value: isLoading ? '…' : formatFileSize(stats.totalSize), icon: <CloudSvg /> },
          { label: 'Shared Files', value: isLoading ? '…' : stats.sharedFiles, icon: <ShareSvg /> },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon">{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bulk Operations Bar ── */}
      {selectedFiles.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: 'var(--cx-color-primary-subtle, rgba(99,102,241,0.08))',
          border: '1px solid var(--cx-color-primary)', borderRadius: 'var(--radius-md)',
          marginBottom: 12, fontSize: '0.875rem',
        }}>
          <span style={{ fontWeight: 500, color: 'var(--cx-text-primary)' }}>{selectedFiles.size} selected</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowBulkUsageModal(true)}>Set Usage Rights</button>
            <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setSelectedFiles(new Set())}>Clear</button>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="cx-file-toolbar">
        <div className="cx-file-toolbar__left">
          <div className="cx-search">
            <SearchSvg />
            <input type="search" className="cx-search__input" placeholder={`Search in ${locationLabel}…`}
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="cx-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="folder">Folders</option>
            <option value="document">Documents</option>
            <option value="pdf">PDFs</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>
          <select className="cx-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
            <option value="name">Name</option>
            <option value="modified">Date Modified</option>
            <option value="size">Size</option>
            <option value="type">Type</option>
          </select>
        </div>
        <div className="cx-file-toolbar__right">
          <div className="cx-file-actions">
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowUploadModal(true)}>
              <UploadSvg /> Upload{currentFolderId ? ' Here' : ''}
            </button>
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreateFolderModal(true)}>
              <FolderAddSvg /> New Folder
            </button>
          </div>
          <div style={{ display: 'flex', gap: 2, background: 'var(--cx-bg-hover)', borderRadius: 'var(--radius-md)', padding: 2 }}>
            <button className={clsx('cx-view-btn', viewMode === 'grid' && 'cx-view-btn--active')} onClick={() => setViewMode('grid')}><GridSvg /></button>
            <button className={clsx('cx-view-btn', viewMode === 'list' && 'cx-view-btn--active')} onClick={() => setViewMode('list')}><ListSvg /></button>
          </div>
        </div>
      </div>

      {/* ── Upload destination badge ── */}
      {currentFolderId && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
          background: 'var(--cx-color-primary-subtle, rgba(99,102,241,0.08))',
          borderRadius: 'var(--radius-md)', fontSize: '0.8125rem',
          color: 'var(--cx-color-primary)', marginBottom: 8, alignSelf: 'flex-start'
        }}>
          <LockSvg />
          <span>Uploads and new folders will be created inside <strong>{folderStack[folderStack.length - 1]?.name}</strong></span>
        </div>
      )}

      {/* ── File list ── */}
      {isLoading ? (
        <div className="cx-file-card-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cx-file-card">
              <div className="cx-shimmer" style={{ width: 44, height: 44, marginBottom: 12, borderRadius: 'var(--radius-lg)' }} />
              <div className="cx-shimmer" style={{ width: '70%', marginBottom: 8 }} />
              <div className="cx-shimmer" style={{ width: '40%' }} />
            </div>
          ))}
        </div>
      ) : paginatedFiles.length === 0 ? (
        <div className="cx-empty">
          {currentFolderId ? <FolderSvg size={40} /> : <DocumentSvg size={40} />}
          <h3>{searchTerm ? 'No results' : `${locationLabel} is empty`}</h3>
          <p>{searchTerm ? 'Try a different search term.' : 'Upload files or create a folder to get started.'}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cx-btn cx-btn--primary" onClick={() => setShowUploadModal(true)}><UploadSvg /> Upload Files</button>
            {searchTerm && <button className="cx-btn cx-btn--secondary" onClick={handleClearFilters}>Clear Search</button>}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="cx-file-card-grid">
            {paginatedFiles.map(file => (
              <div key={file.id} style={{ position: 'relative' }}>
                {file.type !== 'folder' && (
                  <label style={{
                    position: 'absolute', top: 8, left: 8, zIndex: 5,
                    background: 'var(--cx-bg-surface)', borderRadius: 'var(--radius-sm)',
                    padding: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      onClick={e => e.stopPropagation()}
                    />
                  </label>
                )}
                <FileCard
                  id={file.id}
                  name={file.name}
                  type={file.type}
                  size={file.size}
                  modifiedAt={file.modifiedAt}
                  modifiedBy={file.modifiedBy}
                  isShared={file.isShared}
                  downloadCount={file.downloadCount}
                  onClick={() => {
                    if (file.type === 'folder' && file.rawFolderId) {
                      drillIntoFolder(file.rawFolderId, file.name);
                    } else {
                      setPreviewFile(file);
                    }
                  }}
                  onDownload={() => handleDownload(file)}
                  onShare={() => { if (file.url) navigator.clipboard.writeText(file.url).then(() => showToast({ title: 'Link copied to clipboard', type: 'success' })); }}
                  onEdit={() => setRenameFile(file)}
                  onDelete={() => setDeleteFile(file)}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)' }}>
            {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'items'}
          </div>
        </>
      ) : (
        <div className="cx-table-container">
          <table className="cx-table">
            <thead>
              <tr>
                <th style={{ width: 40, padding: '10px 4px' }}>
                  <input
                    type="checkbox"
                    checked={paginatedFiles.filter(f => f.type !== 'folder').length > 0 && paginatedFiles.filter(f => f.type !== 'folder').every(f => selectedFiles.has(f.id))}
                    onChange={e => {
                      const fileIds = paginatedFiles.filter(f => f.type !== 'folder').map(f => f.id);
                      if (e.target.checked) {
                        setSelectedFiles(prev => {
                          const next = new Set(prev);
                          fileIds.forEach(id => next.add(id));
                          return next;
                        });
                      } else {
                        setSelectedFiles(prev => {
                          const next = new Set(prev);
                          fileIds.forEach(id => next.delete(id));
                          return next;
                        });
                      }
                    }}
                  />
                </th>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Modified</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedFiles.map(file => (
                <tr key={file.id} className="cx-table__row" style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (file.type === 'folder' && file.rawFolderId) drillIntoFolder(file.rawFolderId, file.name);
                    else setPreviewFile(file);
                  }}
                >
                  <td className="cx-table__cell" onClick={e => e.stopPropagation()}>
                    {file.type !== 'folder' && (
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                      />
                    )}
                  </td>
                  <td className="cx-table__cell cx-table__cell--name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flexShrink: 0, color: 'var(--cx-text-tertiary)' }}>{getTypeIcon(file.type)}</span>
                    <span style={{ fontWeight: file.type === 'folder' ? 500 : 400 }}>{file.name}</span>
                    {file.isShared && <span className="cx-badge cx-badge--info" style={{ marginLeft: 6 }}>Shared</span>}
                    {file.type === 'folder' && <ChevronRightSvg />}
                  </td>
                  <td className="cx-table__cell cx-table__cell--muted" style={{ textTransform: 'capitalize' }}>{file.type}</td>
                  <td className="cx-table__cell cx-table__cell--muted">{file.size ? formatFileSize(file.size) : '—'}</td>
                  <td className="cx-table__cell cx-table__cell--muted">{formatDate(file.modifiedAt)}</td>
                  <td className="cx-table__cell cx-table__cell--actions" onClick={e => e.stopPropagation()}>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Preview"
                      onClick={() => { if (file.type !== 'folder') setPreviewFile(file); }}
                      disabled={file.type === 'folder'} style={{ opacity: file.type === 'folder' ? 0.3 : 1 }}>
                      <EyeSvg />
                    </button>
                    {file.type !== 'folder' && (
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Download" onClick={() => handleDownload(file)}>
                        <DownloadSvg />
                      </button>
                    )}
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Rename" onClick={() => setRenameFile(file)}>
                      <EditSvg />
                    </button>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Delete" onClick={() => setDeleteFile(file)}
                      style={{ color: 'var(--cx-color-danger)' }}>
                      <DeleteSvg />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '8px 16px', fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)', borderTop: '1px solid var(--cx-border-subtle)' }}>
            {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="cx-pagination" style={{ marginTop: 16 }}>
          <span className="cx-pagination__info">Page {page} of {totalPages}</span>
          <div className="cx-pagination__controls">
            <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3L5 7l4 4"/></svg>
            </button>
            <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div className="cx-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <div>
                <h2 className="cx-modal__title">Upload Files</h2>
                {currentFolderId && (
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--cx-color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <LockSvg /> Uploading to <strong>{folderStack[folderStack.length - 1]?.name}</strong>
                  </p>
                )}
              </div>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowUploadModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div className="cx-upload-form">
                <div className="cx-file-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileUpload(f); }}
                >
                  <div className="cx-file-upload-area__icon"><UploadSvg /></div>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>{isUploading ? 'Uploading…' : 'Drag & drop files here'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Max file size 500MB.</p>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button type="button" className="cx-btn cx-btn--secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, minHeight: 48 }}
                    onClick={() => fileInputRef.current?.click()}>
                    <UploadSvg /> Browse Files
                  </button>
                  <button type="button" className="cx-btn cx-btn--primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, minHeight: 48, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none' }}
                    onClick={() => cameraInputRef.current?.click()}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 6a2 2 0 012-2h1.5a1 1 0 00.8-.4l1.4-1.8a1 1 0 01.8-.4h3a1 1 0 01.8.4l1.4 1.8a1 1 0 00.8.4H14a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                      <circle cx="10" cy="10" r="3" />
                    </svg>
                    Use Camera
                  </button>
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowUploadModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Folder Modal ── */}
      {showCreateFolderModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCreateFolderModal(false)}>
          <div className="cx-modal cx-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <div>
                <h2 className="cx-modal__title">Create New Folder</h2>
                {currentFolderId && (
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--cx-color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <LockSvg /> Inside <strong>{folderStack[folderStack.length - 1]?.name}</strong>
                  </p>
                )}
              </div>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCreateFolderModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)' }}>Folder Name</label>
                <input type="text" className="cx-search__input" autoFocus
                  style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '0.875rem', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', width: '100%' }}
                  placeholder="Enter folder name" value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); }} />
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreateFolderModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={!newFolderName.trim()} onClick={handleCreateFolder}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} onDownload={() => handleDownload(previewFile)} onSaved={() => { refetchFiles(); }} />
      )}
      {renameFile && (
        <RenameModal file={renameFile} onClose={() => setRenameFile(null)} onConfirm={n => handleRename(renameFile, n)} />
      )}
      {deleteFile && (
        <DeleteModal file={deleteFile} onClose={() => setDeleteFile(null)} onConfirm={() => handleDelete(deleteFile)} />
      )}

      {/* ── Bulk Usage Rights Modal ── */}
      {showBulkUsageModal && (
        <div className="cx-modal-overlay" onClick={() => setShowBulkUsageModal(false)}>
          <div className="cx-modal cx-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Set Usage Rights ({selectedFiles.size} files)</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowBulkUsageModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Justification</label>
                <select
                  className="cx-select"
                  style={{ width: '100%' }}
                  value={bulkJustification}
                  onChange={e => setBulkJustification(e.target.value)}
                >
                  <option value="">Select justification…</option>
                  <option value="own_copyright">I hold the copyright</option>
                  <option value="used_by_permission">Used with permission</option>
                  <option value="fair_use">Fair use</option>
                  <option value="public_domain">Public domain</option>
                  <option value="creative_commons">Creative Commons</option>
                </select>
              </div>
              {bulkJustification === 'creative_commons' && (
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>License</label>
                  <select
                    className="cx-select"
                    style={{ width: '100%' }}
                    value={bulkLicense}
                    onChange={e => setBulkLicense(e.target.value)}
                  >
                    <option value="">Select license…</option>
                    <option value="cc_by">CC BY</option>
                    <option value="cc_by_sa">CC BY-SA</option>
                    <option value="cc_by_nc">CC BY-NC</option>
                    <option value="cc_by_nc_sa">CC BY-NC-SA</option>
                    <option value="cc_by_nd">CC BY-ND</option>
                    <option value="cc_by_nc_nd">CC BY-NC-ND</option>
                  </select>
                </div>
              )}
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowBulkUsageModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={!bulkJustification || bulkSaving} onClick={handleBulkUsageRights}>
                {bulkSaving ? 'Saving…' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;
