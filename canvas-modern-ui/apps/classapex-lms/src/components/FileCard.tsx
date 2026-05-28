import React from 'react';
import clsx from 'clsx';

function FolderSvg() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>; }
function DocumentSvg() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>; }
function PdfSvg() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><path d="M9 15h6M9 12h6M9 18h3"/></svg>; }
function ImageSvg() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>; }
function VideoSvg() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>; }
function AudioSvg() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>; }
function DownloadSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10V2M4 7l3 3 3-3"/><path d="M2 11v1h10v-1"/></svg>; }
function ShareSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4" cy="10" r="2"/><circle cx="4" cy="4" r="2"/><circle cx="10" cy="7" r="2"/><path d="M5.5 5.5l3 3M5.5 8.5l3-3"/></svg>; }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.5 1.5l2 2L5 11H3V9l7.5-7.5z"/></svg>; }
function DeleteSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3,5 4,12 10,12 11,5"/><path d="M2 5h10"/><path d="M5 5V3h4v2"/></svg>; }
function ClockSvg() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="6" r="4.5"/><path d="M6 3.5V6l2 1"/></svg>; }
function MoreSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="11" cy="8" r="1"/></svg>; }

export interface FileCardProps {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'pdf' | 'image' | 'video' | 'audio' | 'zip' | 'other';
  size?: number;
  modifiedAt: string;
  modifiedBy?: string;
  isShared?: boolean;
  downloadCount?: number;
  onClick?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  loading?: boolean;
}

const FileCard: React.FC<FileCardProps> = ({
  id, name, type, size, modifiedAt, modifiedBy, isShared = false,
  downloadCount = 0, onClick, onDownload, onShare, onEdit, onDelete, className, loading = false
}) => {
  const getFileIcon = () => {
    switch (type) {
      case 'folder': return <FolderSvg />;
      case 'pdf': return <PdfSvg />;
      case 'image': return <ImageSvg />;
      case 'video': return <VideoSvg />;
      case 'audio': return <AudioSvg />;
      case 'zip': return <DocumentSvg />;
      default: return <DocumentSvg />;
    }
  };

  const getIconClass = () => {
    switch (type) {
      case 'folder': return 'cx-file-card__icon--folder';
      case 'image': return 'cx-file-card__icon--image';
      case 'video': return 'cx-file-card__icon--video';
      case 'pdf': return 'cx-file-card__icon--pdf';
      default: return '';
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const [menuOpen, setMenuOpen] = React.useState(false);

  if (loading) {
    return (
      <div className={clsx('cx-file-card', className)}>
        <div className="cx-shimmer" style={{ width: 44, height: 44, marginBottom: 12, borderRadius: 'var(--radius-lg)' }} />
        <div className="cx-shimmer" style={{ width: '70%', marginBottom: 8 }} />
        <div className="cx-shimmer" style={{ width: '40%' }} />
      </div>
    );
  }

  return (
    <div className={clsx('cx-file-card', className)} onClick={onClick}>
      <div className="cx-file-card__header">
        <div className={clsx('cx-file-card__icon', getIconClass())}>
          {getFileIcon()}
        </div>
        <div style={{ position: 'relative' }}>
          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }} style={{ padding: '2px 4px' }}>
            <MoreSvg />
          </button>
          {menuOpen && (
            <div 
              style={{ 
                position: 'absolute', 
                right: 0, 
                top: '100%', 
                zIndex: 10, 
                background: 'var(--cx-bg-surface)', 
                border: '1px solid var(--cx-border-subtle)', 
                borderRadius: 'var(--radius-md)', 
                boxShadow: 'var(--shadow-03)', 
                minWidth: 120, 
                padding: '4px 0' 
              }}
              onClick={e => e.stopPropagation()} // Prevent card activation
              onMouseLeave={() => setMenuOpen(false)}
            >
              {onDownload && type !== 'folder' && <MenuItem icon={<DownloadSvg />} label="Download" onClick={() => { setMenuOpen(false); onDownload(); }} />}
              {onShare && <MenuItem icon={<ShareSvg />} label="Share" onClick={() => { setMenuOpen(false); onShare(); }} />}
              {onEdit && <MenuItem icon={<EditSvg />} label="Rename" onClick={() => { setMenuOpen(false); onEdit(); }} />}
              {onDelete && <MenuItem icon={<DeleteSvg />} label="Delete" onClick={() => { setMenuOpen(false); onDelete(); }} />}
            </div>
          )}
        </div>
      </div>

      <h3 className="cx-file-card__name" title={name}>
        {onClick ? (
          <button
            type="button"
            className="cx-file-card__name-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {name}
          </button>
        ) : (
          name
        )}
      </h3>

      {isShared && <span className="cx-badge cx-badge--info" style={{ marginBottom: 8, alignSelf: 'flex-start' }}>Shared</span>}

      <div className="cx-file-card__meta">
        {size && type !== 'folder' && <span>{formatFileSize(size)}</span>}
        <span><ClockSvg /> {formatDate(modifiedAt)}</span>
        {modifiedBy && <span>by {modifiedBy}</span>}
        {downloadCount > 0 && type !== 'folder' && <span><DownloadSvg /> {downloadCount}</span>}
      </div>
    </div>
  );
};

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--cx-text-primary)', fontFamily: 'inherit' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cx-bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {icon} {label}
    </button>
  );
}

export default FileCard;
