import React, { useState, useMemo, useCallback } from 'react'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import canvasApi from '../services/canvasApi'

interface MediaFile {
  id: number
  uuid: string
  folder_id: number
  display_name: string
  filename: string
  contentType: string
  'content-type': string
  url: string
  size: number
  created_at: string
  updated_at: string
  thumbnail_url?: string
}

interface MediaLibraryProps {
  courseId: string | number
  onSelectMedia?: (mediaUrl: string, mediaType: 'video' | 'audio' | 'image', title: string) => void
  isSelectMode?: boolean
}

export function MediaLibrary({ courseId, onSelectMedia, isSelectMode = false }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'image'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<MediaFile | null>(null)
  
  // Upload states
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Fetch course files
  const { data: rawFiles, isLoading, refetch } = useCanvasQuery<MediaFile[]>(
    courseId ? `/api/v1/courses/${courseId}/files` : '',
    { per_page: 100 } as any
  )

  const files = useMemo(() => Array.isArray(rawFiles) ? rawFiles : [], [rawFiles])

  // Media Classification Helpers
  const getMediaType = useCallback((file: MediaFile): 'video' | 'audio' | 'image' | 'unknown' => {
    const mime = (file.contentType || file['content-type'] || '').toLowerCase()
    const name = (file.filename || file.display_name || '').toLowerCase()
    
    if (mime.startsWith('video/') || name.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/)) return 'video'
    if (mime.startsWith('audio/') || name.match(/\.(mp3|wav|ogg|aac|m4a|flac)$/)) return 'audio'
    if (mime.startsWith('image/') || name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image'
    return 'unknown'
  }, [])

  // Filter media files
  const mediaFiles = useMemo(() => {
    return files.filter(f => {
      const type = getMediaType(f)
      if (type === 'unknown') return false
      
      const matchesSearch = f.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (activeTab === 'all') return true
      return type === activeTab
    })
  }, [files, searchQuery, activeTab, getMediaType])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const processUpload = useCallback(async (uploadFiles: File[]) => {
    if (uploadFiles.length === 0) return
    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i]
        // Check if file is a media type
        const type = file.type.toLowerCase()
        const name = file.name.toLowerCase()
        const isMedia = type.startsWith('video/') || type.startsWith('audio/') || type.startsWith('image/') ||
                        name.match(/\.(mp4|webm|ogg|mov|m4v|avi|mp3|wav|aac|m4a|png|jpg|jpeg|gif|webp|svg)$/)
        
        if (!isMedia) {
          throw new Error('Only media files (Video, Audio, Image) can be uploaded to the Media Library.')
        }

        // Upload in 3 steps
        const ticket = await canvasApi.requestUpload({
          name: file.name,
          size: file.size,
          contentType: file.type || 'application/octet-stream',
          onProgress: (pct) => setUploadProgress(pct),
        })

        const uploaded = await canvasApi.uploadFileToUrl(
          ticket.upload_url,
          ticket.upload_params,
          file,
          (pct) => setUploadProgress(pct)
        )

        await canvasApi.confirmUpload(uploaded.id)
      }
      refetch()
    } catch (err: any) {
      console.error(err)
      setUploadError(err.message || 'Failed to upload media files.')
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      setIsDragging(false)
    }
  }, [refetch])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      processUpload(Array.from(e.dataTransfer.files))
    }
  }, [processUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processUpload(Array.from(e.target.files))
    }
  }, [processUpload])

  // Custom player formats
  const renderItemThumbnail = (file: MediaFile) => {
    const type = getMediaType(file)
    if (type === 'image') {
      return (
        <img 
          src={file.thumbnail_url || file.url} 
          alt={file.display_name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'
          }}
        />
      )
    }

    if (type === 'video') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <span style={{ position: 'absolute', bottom: 8, right: 8, fontSize: '0.65rem', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4, color: '#fff', fontWeight: 600 }}>VIDEO</span>
        </div>
      )
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span style={{ position: 'absolute', bottom: 8, right: 8, fontSize: '0.65rem', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4, color: '#fff', fontWeight: 600 }}>AUDIO</span>
      </div>
    )
  }

  return (
    <div className="cx-media-library" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed var(--cx-color-primary, #6366f1)' : '2px dashed var(--cx-border-subtle, rgba(255,255,255,0.1))',
          background: isDragging ? 'var(--cx-bg-surface-raised, rgba(99, 102, 241, 0.05))' : 'var(--cx-bg-surface, rgba(255,255,255,0.02))',
          borderRadius: 12,
          padding: '24px',
          textAlign: 'center',
          transition: 'all 0.2s',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => document.getElementById('media-upload-input')?.click()}
      >
        <input 
          id="media-upload-input" 
          type="file" 
          multiple 
          accept="video/*,audio/*,image/*" 
          onChange={handleFileSelect} 
          style={{ display: 'none' }}
        />
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div className="cx-loading__spinner" style={{ width: 24, height: 24 }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Uploading Instructional Media...</div>
            {uploadProgress !== null && (
              <div className="cx-progress-bar" style={{ width: '60%', maxWidth: 300, margin: '8px auto' }}>
                <div className="cx-progress-bar__track">
                  <div className="cx-progress-bar__fill" style={{ width: `${uploadProgress}%`, background: 'var(--cx-color-primary)' }} />
                </div>
                <div style={{ fontSize: '0.72rem', marginTop: 4 }}>{uploadProgress}% Uploaded</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 6, color: 'var(--cx-text-secondary)' }}><svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 14V3M6 7l4-4 4 4"/><path d="M3 14v3h14v-3"/></svg></div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>
              Drag & drop audio, video, or image learning materials here
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
              Or click to browse from your device
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="cx-notification cx-notification--warning" style={{ margin: 0, padding: '8px 16px', borderRadius: 8 }} role="alert">
          <span className="cx-notification__title" style={{ fontSize: '0.75rem' }}>Upload Warning</span>
          <span className="cx-notification__subtitle" style={{ fontSize: '0.72rem' }}>{uploadError}</span>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--cx-bg-surface-raised, rgba(0,0,0,0.15))', padding: 3, borderRadius: 8 }}>
          {(['all', 'video', 'audio', 'image'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                border: 'none',
                background: activeTab === tab ? 'var(--cx-bg-surface, #1e293b)' : 'transparent',
                color: activeTab === tab ? 'var(--cx-text-primary)' : 'var(--cx-text-secondary)',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab === 'all' ? 'All' : tab === 'video' ? 'Videos' : tab === 'audio' ? 'Audio' : 'Images'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <input
            type="search"
            placeholder="Search media library..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--cx-border-subtle, rgba(255,255,255,0.1))',
              background: 'var(--cx-bg-surface, rgba(0,0,0,0.1))',
              color: 'var(--cx-text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 180, borderRadius: 12 }} />
          ))}
        </div>
      ) : mediaFiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ marginBottom: 12, color: 'var(--cx-text-tertiary)' }}><svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 4a1 1 0 011-1h5l2 2h7a1 1 0 011 1v10a1 1 0 01-1 1h-14a1 1 0 01-1-1V4z"/></svg></div>
          <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>No media files found</p>
          <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Try uploading audio, video, or images to begin.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {mediaFiles.map(file => {
            const type = getMediaType(file)
            return (
              <div
                key={file.id}
                onClick={() => {
                  if (isSelectMode && onSelectMedia) {
                    onSelectMedia(file.url, type as any, file.display_name)
                  } else {
                    setSelectedItem(file)
                  }
                }}
                style={{
                  background: 'var(--cx-bg-surface)',
                  border: '1px solid var(--cx-border-subtle)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 185
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'var(--cx-shadow-md, 0 4px 12px rgba(0,0,0,0.15))'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Media Preview Box */}
                <div style={{ height: 120, position: 'relative', overflow: 'hidden' }}>
                  {renderItemThumbnail(file)}
                </div>
                
                {/* Info block */}
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', justifyItems: 'center', flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--cx-text-primary)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {file.display_name}
                  </div>
                  <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.68rem', color: 'var(--cx-text-tertiary)' }}>
                    <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                    <span style={{ marginLeft: 'auto' }}>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating Modal Premium Player Overlay */}
      {selectedItem && (
        <div 
          className="cx-modal-overlay" 
          onClick={() => setSelectedItem(null)}
          style={{ zIndex: 1000 }}
        >
          <div 
            className="cx-modal cx-modal--md" 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(30, 41, 59, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
              borderRadius: 16,
              overflow: 'hidden',
              width: '90%',
              maxWidth: 680
            }}
          >
            <div className="cx-modal__header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px' }}>
              <h2 className="cx-modal__title" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                {selectedItem.display_name}
              </h2>
              <button 
                className="cx-btn cx-btn--ghost" 
                onClick={() => setSelectedItem(null)}
                style={{ color: '#fff', opacity: 0.8 }}
              >
                &times;
              </button>
            </div>
            <div className="cx-modal__body" style={{ padding: 0, background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {getMediaType(selectedItem) === 'video' && (
                <video 
                  src={selectedItem.url} 
                  controls 
                  autoPlay 
                  style={{ width: '100%', maxHeight: '420px', display: 'block' }}
                />
              )}

              {getMediaType(selectedItem) === 'audio' && (
                <div style={{ width: '100%', padding: '40px 24px', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <div style={{ animation: 'pulse 2s infinite', color: '#10b981' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(16, 185, 129, 0.1)" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
                  <audio 
                    src={selectedItem.url} 
                    controls 
                    autoPlay 
                    style={{ width: '100%', maxWidth: 460 }}
                  />
                </div>
              )}

              {getMediaType(selectedItem) === 'image' && (
                <div style={{ width: '100%', maxHeight: '480px', overflowY: 'auto', display: 'flex', justifyContent: 'center', background: '#020617' }}>
                  <img 
                    src={selectedItem.url} 
                    alt={selectedItem.display_name} 
                    style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              )}
            </div>
            
            {/* Modal actions / Footer */}
            <div style={{ display: 'flex', padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'flex-end', gap: 8 }}>
              {isSelectMode && onSelectMedia && (
                <button
                  className="cx-btn cx-btn--primary cx-btn--sm"
                  onClick={() => {
                    onSelectMedia(selectedItem.url, getMediaType(selectedItem) as any, selectedItem.display_name)
                    setSelectedItem(null)
                  }}
                >
                  Select Media
                </button>
              )}
              <button 
                className="cx-btn cx-btn--secondary cx-btn--sm" 
                onClick={() => setSelectedItem(null)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
