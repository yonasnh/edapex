import React, { useState, useMemo, useRef } from 'react';
import clsx from 'clsx';
import FileCard from '../components/FileCard';
import { useCanvasQuery } from '../hooks/useCanvasQuery';

interface FileItem {
  id: string;
  name: string;
  // Canvas API mime_class: 'folder', 'pdf', 'image', 'video', 'audio', 'doc', 'zip'
  type: 'folder' | 'document' | 'pdf' | 'image' | 'video' | 'audio' | 'other';
  size?: number;
  modifiedAt: string;
  modifiedBy?: string;
  isShared?: boolean;
  downloadCount?: number;
  url?: string;
  thumbnail_url?: string;
}

// Canvas mime_class → our FileItem.type
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
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function UploadSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 11V3M4 7l4-4 4 4"/><path d="M2 13h12"/></svg>; }
function FolderAddSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 11a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h4l1.5 2H13a1 1 0 011 1z"/><path d="M8 8v4M6 10h4"/></svg>; }
function GridSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>; }
function ListSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="2" rx="1"/><rect x="2" y="7" width="12" height="2" rx="1"/><rect x="2" y="11" width="12" height="2" rx="1"/></svg>; }
function FolderSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4l1.5 2H17a1 1 0 011 1z"/></svg>; }
function DocumentSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V7l-4-5z"/><path d="M12 2v5h5"/></svg>; }
function CloudSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 12a4 4 0 100-8 4.5 4.5 0 00-8.5 1.5A3.5 3.5 0 005 12h10z"/></svg>; }
function ShareSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="14" r="2.5"/><circle cx="6" cy="6" r="2.5"/><circle cx="14" cy="10" r="2.5"/><path d="M7.5 7.5l5 5M7.5 12.5l5-5"/></svg>; }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>; }
function DownloadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10V2M4 7l3 3 3-3"/><path d="M2 11v1h10v-1"/></svg>; }
function EyeSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/><circle cx="7" cy="7" r="1.5"/></svg>; }

const FilesPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadCourseId, setUploadCourseId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // ── Live Canvas API ──
  const { data: rawFiles, isLoading, refetch: refetchFiles } = useCanvasQuery<any[]>(
    '/api/v1/users/self/files',
    { per_page: 100, sort: 'created_at', order: 'desc' } as any
  )
  const { data: rawFolders, refetch: refetchFolders } = useCanvasQuery<any[]>(
    '/api/v1/users/self/folders',
    { per_page: 50 } as any
  )
  const { data: rawCourses } = useCanvasQuery<any[]>(
    '/api/v1/courses',
    { enrollment_state: 'active', per_page: 50 } as any
  )

  const courses = Array.isArray(rawCourses) ? rawCourses : []

  // Merge files + folders into unified FileItem list
  const allFiles: FileItem[] = useMemo(() => {
    const folders = Array.isArray(rawFolders) ? rawFolders.map(f => ({
      id: `folder_${f.id}`,
      name: f.name,
      type: 'folder' as const,
      modifiedAt: f.updated_at || f.created_at,
      modifiedBy: undefined,
    })) : []
    const files = Array.isArray(rawFiles) ? rawFiles.map(f => ({
      id: String(f.id),
      name: f.display_name || f.filename,
      type: toFileType(f.mime_class || ''),
      size: f.size,
      modifiedAt: f.updated_at || f.created_at,
      modifiedBy: f.user?.name,
      url: f.url,
      thumbnail_url: f.thumbnail_url,
    })) : []
    return [...folders, ...files]
  }, [rawFiles, rawFolders])

  // ── Upload handler using Canvas 3-step upload protocol ──
  const handleFileUpload = async (file: File) => {
    if (!file) return
    setIsUploading(true)
    try {
      const endpoint = uploadCourseId
        ? `/api/v1/courses/${uploadCourseId}/files`
        : '/api/v1/users/self/files'

      // Step 1: Notify Canvas
      const notifyRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, size: file.size, content_type: file.type }),
      })
      if (!notifyRes.ok) throw new Error('Upload notify failed')
      const { upload_url, upload_params } = await notifyRes.json()

      // Step 2: Upload file to pre-signed URL
      const formData = new FormData()
      Object.entries(upload_params || {}).forEach(([k, v]) => formData.append(k, v as string))
      formData.append('file', file)
      const uploadRes = await fetch(upload_url, { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('File upload failed')

      // Step 3: Confirm upload (follow redirect)
      const confirmUrl = uploadRes.headers.get('Location') || (await uploadRes.json()).location
      if (confirmUrl) await fetch(confirmUrl, { method: 'GET' })

      refetchFiles()
      refetchFolders()
      setShowUploadModal(false)
    } catch (err) {
      console.error('[Files] Upload failed:', err)
      alert('Upload failed. Check console for details.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      const res = await fetch('/api/v1/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, parent_folder_path: '/' }),
      })
      if (!res.ok) throw new Error('Create folder failed')
      refetchFolders()
      setNewFolderName('');
      setShowCreateFolderModal(false);
    } catch (err) {
      console.error('[Files] Create folder failed:', err)
      alert('Failed to create folder.')
    }
  };

  const filteredFiles = useMemo(() => {
    let filtered = [...allFiles];
    if (filterType !== 'all') filtered = filtered.filter(f => f.type === filterType);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(q));
    }
    filtered.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      switch (sortBy) {
        case 'modified': return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case 'size': return (b.size || 0) - (a.size || 0);
        case 'type': return a.type.localeCompare(b.type);
        default: return a.name.localeCompare(b.name);
      }
    });
    return filtered;
  }, [allFiles, searchTerm, filterType, sortBy]);

  const totalPages = Math.ceil(filteredFiles.length / pageSize);
  const paginatedFiles = filteredFiles.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    totalFiles: allFiles.filter(f => f.type !== 'folder').length,
    totalFolders: allFiles.filter(f => f.type === 'folder').length,
    totalSize: allFiles.reduce((s, f) => s + (f.size || 0), 0),
    sharedFiles: allFiles.filter(f => f.isShared).length,
  }), [allFiles]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleClearFilters = () => { setSearchTerm(''); setFilterType('all'); setPage(1); };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'folder': return <FolderSvg />;
      default: return <DocumentSvg />;
    }
  };

  return (
    <div className="cx-page">
      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
          e.target.value = ''
        }}
      />

      {/* Hidden camera capture input (S22-07) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
          e.target.value = ''
        }}
      />


      <div className="cx-stats-grid">
        {[
          { label: 'Total Files', value: isLoading ? '…' : stats.totalFiles, icon: <DocumentSvg /> },
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

      <div className="cx-file-toolbar">
        <div className="cx-file-toolbar__left">
          <div className="cx-search">
            <SearchSvg />
            <input type="search" className="cx-search__input" placeholder="Search files..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowUploadModal(true)}><UploadSvg /> Upload</button>
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreateFolderModal(true)}><FolderAddSvg /> New Folder</button>
          </div>
          <div style={{ display: 'flex', gap: 2, background: 'var(--cx-bg-hover)', borderRadius: 'var(--radius-md)', padding: 2 }}>
            <button className={clsx('cx-view-btn', viewMode === 'grid' && 'cx-view-btn--active')} onClick={() => setViewMode('grid')}><GridSvg /></button>
            <button className={clsx('cx-view-btn', viewMode === 'list' && 'cx-view-btn--active')} onClick={() => setViewMode('list')}><ListSvg /></button>
          </div>
        </div>
      </div>

      {paginatedFiles.length === 0 ? (
        <div className="cx-empty">
          <DocumentSvg />
          <h3>No files found</h3>
          <p>Try adjusting your search terms or filters, or upload some files to get started.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cx-btn cx-btn--primary" onClick={() => setShowUploadModal(true)}><UploadSvg /> Upload Files</button>
            <button className="cx-btn cx-btn--secondary" onClick={handleClearFilters}>Clear Filters</button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="cx-file-card-grid">
            {paginatedFiles.map(file => (
              <FileCard
                key={file.id}
                id={file.id}
                name={file.name}
                type={file.type}
                size={file.size}
                modifiedAt={file.modifiedAt}
                modifiedBy={file.modifiedBy}
                isShared={file.isShared}
                downloadCount={file.downloadCount}
                onClick={() => {
                  if (file.type === 'folder') setCurrentFolder(file.id);
                  else console.log('Opening file:', file.name);
                }}
                onDownload={() => console.log('Download:', file.name)}
                onShare={() => console.log('Share:', file.name)}
                onEdit={() => console.log('Edit:', file.name)}
                onDelete={() => console.log('Delete:', file.name)}
              />
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
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Modified</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedFiles.map(file => (
                <tr key={file.id} className="cx-table__row" onClick={() => {
                  if (file.type === 'folder') setCurrentFolder(file.id);
                  else console.log('Opening file:', file.name);
                }}>
                  <td className="cx-table__cell cx-table__cell--name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flexShrink: 0, fontSize: 16 }}>{getTypeIcon(file.type)}</span>
                    {file.name}
                    {file.isShared && <span className="cx-badge cx-badge--info" style={{ marginLeft: 6 }}>Shared</span>}
                  </td>
                  <td className="cx-table__cell cx-table__cell--muted">{file.type}</td>
                  <td className="cx-table__cell cx-table__cell--muted">{file.size ? formatFileSize(file.size) : '—'}</td>
                  <td className="cx-table__cell cx-table__cell--muted">{formatDate(file.modifiedAt)}</td>
                  <td className="cx-table__cell cx-table__cell--actions">
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={e => { e.stopPropagation(); }}><EyeSvg /></button>
                    {file.type !== 'folder' && (
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={e => { e.stopPropagation(); console.log('Download:', file.name); }}><DownloadSvg /></button>
                    )}
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

      {showUploadModal && (
        <div className="cx-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Upload Files</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowUploadModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div className="cx-upload-form">
                <div
                  className="cx-file-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    const file = e.dataTransfer.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                >
                  <div className="cx-file-upload-area__icon"><UploadSvg /></div>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>
                    {isUploading ? 'Uploading…' : 'Drag & drop files here'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Max file size 500MB.</p>
                </div>

                {/* S22-07: Touch Friendly Upload & Mobile Direct Camera Capture Options */}
                <div style={{ display: 'flex', gap: 12, marginTop: 4, marginBottom: 12 }}>
                  <button
                    type="button"
                    className="cx-btn cx-btn--secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, minHeight: 48 }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadSvg /> Browse Files
                  </button>
                  <button
                    type="button"
                    className="cx-btn cx-btn--primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, minHeight: 48, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none' }}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 6a2 2 0 012-2h1.5a1 1 0 00.8-.4l1.4-1.8a1 1 0 01.8-.4h3a1 1 0 01.8.4l1.4 1.8a1 1 0 00.8.4H14a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                      <circle cx="10" cy="10" r="3" />
                    </svg>
                    Use Camera
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)' }}>Course (optional)</label>
                  <select
                    className="cx-select"
                    style={{ width: '100%' }}
                    value={uploadCourseId}
                    onChange={e => setUploadCourseId(e.target.value)}
                  >
                    <option value="">Personal files</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => { setShowUploadModal(false); }}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {showCreateFolderModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCreateFolderModal(false)}>
          <div className="cx-modal cx-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Create New Folder</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCreateFolderModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)' }}>Folder Name</label>
                <input type="text" className="cx-search__input" style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '0.875rem', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', width: '100%' }}
                  placeholder="Enter folder name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); }} autoFocus />
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreateFolderModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={!newFolderName.trim()} onClick={handleCreateFolder}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;
