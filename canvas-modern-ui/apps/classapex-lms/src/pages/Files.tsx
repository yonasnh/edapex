import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import FileCard from '../components/FileCard';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'pdf' | 'image' | 'video' | 'audio' | 'other';
  size?: number;
  modifiedAt: string;
  modifiedBy?: string;
  isShared?: boolean;
  downloadCount?: number;
  parentId?: string;
  courseId?: string;
  courseName?: string;
}

const mockFiles: FileItem[] = [
  { id: 'f1', name: 'Course Materials', type: 'folder', modifiedAt: '2024-01-15T10:30:00Z', modifiedBy: 'Dr. Wilson' },
  { id: 'f2', name: 'Lecture Notes', type: 'folder', modifiedAt: '2024-01-14T14:00:00Z', modifiedBy: 'Dr. Wilson', isShared: true },
  { id: 'f3', name: 'Syllabus.pdf', type: 'pdf', size: 245000, modifiedAt: '2024-01-10T09:00:00Z', modifiedBy: 'Dr. Wilson', downloadCount: 45 },
  { id: 'f4', name: 'Homework1.pdf', type: 'pdf', size: 180000, modifiedAt: '2024-01-12T11:20:00Z', modifiedBy: 'Admin', downloadCount: 32 },
  { id: 'f5', name: 'Lecture_Week1.pptx', type: 'document', size: 3200000, modifiedAt: '2024-01-08T08:00:00Z', modifiedBy: 'Dr. Wilson', downloadCount: 28 },
  { id: 'f6', name: 'Diagram.png', type: 'image', size: 560000, modifiedAt: '2024-01-13T16:45:00Z', modifiedBy: 'TA', downloadCount: 15, isShared: true },
  { id: 'f7', name: 'Lecture_Recording.mp4', type: 'video', size: 45000000, modifiedAt: '2024-01-11T10:00:00Z', modifiedBy: 'Dr. Wilson', downloadCount: 38 },
  { id: 'f8', name: 'Audio_Notes.mp3', type: 'audio', size: 5200000, modifiedAt: '2024-01-09T13:30:00Z', modifiedBy: 'TA' },
  { id: 'f9', name: 'References', type: 'folder', modifiedAt: '2024-01-07T09:15:00Z', modifiedBy: 'Librarian' },
  { id: 'f10', name: 'Lab_Report_Template.docx', type: 'document', size: 95000, modifiedAt: '2024-01-14T12:00:00Z', modifiedBy: 'Admin', downloadCount: 22 },
  { id: 'f11', name: 'Grade_Spreadsheet.xlsx', type: 'document', size: 420000, modifiedAt: '2024-01-15T08:30:00Z', modifiedBy: 'Dr. Wilson', isShared: true },
  { id: 'f12', name: 'Project_Guidelines.pdf', type: 'pdf', size: 310000, modifiedAt: '2024-01-06T16:00:00Z', modifiedBy: 'Dr. Wilson', downloadCount: 50 },
];

const mockCourses = [
  { id: 'cs101', name: 'Computer Science 101' },
  { id: 'eng201', name: 'English Literature' },
  { id: 'math301', name: 'Advanced Mathematics' },
];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const filteredFiles = useMemo(() => {
    let filtered = [...mockFiles];
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
  }, [searchTerm, filterType, sortBy]);

  const totalPages = Math.ceil(filteredFiles.length / pageSize);
  const paginatedFiles = filteredFiles.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    totalFiles: mockFiles.filter(f => f.type !== 'folder').length,
    totalFolders: mockFiles.filter(f => f.type === 'folder').length,
    totalSize: mockFiles.reduce((s, f) => s + (f.size || 0), 0),
    sharedFiles: mockFiles.filter(f => f.isShared).length,
  }), []);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleClearFilters = () => { setSearchTerm(''); setFilterType('all'); setPage(1); };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      console.log('Creating folder:', newFolderName);
      setNewFolderName('');
      setShowCreateFolderModal(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'folder': return <FolderSvg />;
      default: return <DocumentSvg />;
    }
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Files</h1>
          <p className="cx-page__subtitle">Upload, organize, and share files across your courses</p>
        </div>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Files', value: stats.totalFiles, icon: <DocumentSvg /> },
          { label: 'Folders', value: stats.totalFolders, icon: <FolderSvg /> },
          { label: 'Storage Used', value: formatFileSize(stats.totalSize), icon: <CloudSvg /> },
          { label: 'Shared Files', value: stats.sharedFiles, icon: <ShareSvg /> },
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
                <div className="cx-file-upload-area" onClick={() => {}}>
                  <div className="cx-file-upload-area__icon"><UploadSvg /></div>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>Choose files or drag them here</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Max file size is 500MB. Supported formats: PDF, DOC, PPT, XLS, images, videos.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)' }}>Course (optional)</label>
                  <select className="cx-select" style={{ width: '100%' }} defaultValue="">
                    <option value="">Personal files</option>
                    {mockCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
