import React, { useState, useRef, useEffect, memo, forwardRef } from 'react'
import { File, Folder, User } from '@schoolapex/core'
import clsx from 'clsx'

const DocumentIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

const FolderIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)

const DownloadIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const ViewIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

const EditIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const DeleteIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
)

const ShareIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)

const LockIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const TimeIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const PdfIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 12h6"/><path d="M9 18h4"/>
  </svg>
)

const ImageIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
)

const VideoIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
)

const MusicIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
)

const ArchiveIcon = ({size = 24}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
)

const DotsIcon = ({size = 16}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
)

interface FileCardProps {
  item: File | Folder
  currentUser: User
  variant?: 'grid' | 'list' | 'compact'
  showPreview?: boolean
  showActions?: boolean
  isSelected?: boolean
  onSelect?: (item: File | Folder) => void
  onOpen?: (item: File | Folder) => void
  onDownload?: (file: File) => Promise<void>
  onPreview?: (file: File) => void
  onEdit?: (item: File | Folder) => Promise<void>
  onDelete?: (item: File | Folder) => Promise<void>
  onShare?: (item: File | Folder) => Promise<void>
  className?: string
  'data-testid'?: string
}

export const FileCard = memo(
  forwardRef<HTMLDivElement, FileCardProps>(
    (
      {
        item,
        currentUser,
        variant = 'grid',
        showPreview = true,
        showActions = true,
        isSelected = false,
        onSelect,
        onOpen,
        onDownload,
        onPreview,
        onEdit,
        onDelete,
        onShare,
        className,
        'data-testid': testId,
        ...props
      },
      ref
    ) => {
      const [isMenuOpen, setMenuOpen] = useState(false)
      const menuRef = useRef<HTMLDivElement>(null)

      useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setMenuOpen(false)
          }
        }
        if (isMenuOpen) {
          document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }, [isMenuOpen])

      const isFolder = 'folders_url' in item
      const file = isFolder ? null : (item as File)
      const folder = isFolder ? (item as Folder) : null

      const handleCardClick = () => {
        if (onSelect) {
          onSelect(item)
        } else if (onOpen) {
          onOpen(item)
        }
      }

      const handleDoubleClick = () => {
        if (onOpen) {
          onOpen(item)
        } else if (!isFolder && onPreview && file) {
          onPreview(file)
        }
      }

      const getFileIcon = () => {
        if (isFolder) {
          return <FolderIcon size={variant === 'compact' ? 16 : 24} />
        }

        if (!file) return <DocumentIcon size={variant === 'compact' ? 16 : 24} />

        const mimeType = file.content_type.toLowerCase()
        const iconSize = variant === 'compact' ? 16 : 24

        if (mimeType.includes('pdf')) {
          return <PdfIcon size={iconSize} />
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
          return <DocumentIcon size={iconSize} />
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
          return <DocumentIcon size={iconSize} />
        } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
          return <DocumentIcon size={iconSize} />
        } else if (mimeType.startsWith('image/')) {
          return <ImageIcon size={iconSize} />
        } else if (mimeType.startsWith('video/')) {
          return <VideoIcon size={iconSize} />
        } else if (mimeType.startsWith('audio/')) {
          return <MusicIcon size={iconSize} />
        } else if (mimeType.includes('zip') || mimeType.includes('archive')) {
          return <ArchiveIcon size={iconSize} />
        }

        return <DocumentIcon size={iconSize} />
      }

      const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
      }

      const getItemInfo = () => {
        if (isFolder && folder) {
          return {
            name: folder.name,
            subtitle: `${folder.files_count} files, ${folder.folders_count} folders`,
            date: folder.updated_at,
            size: null,
            locked: folder.locked || folder.locked_for_user,
            hidden: folder.hidden || folder.hidden_for_user,
          }
        } else if (file) {
          return {
            name: file.display_name,
            subtitle: file.content_type,
            date: file.modified_at,
            size: file.size,
            locked: file.locked || file.locked_for_user,
            hidden: file.hidden || file.hidden_for_user,
          }
        }
        return null
      }

      const itemInfo = getItemInfo()
      if (!itemInfo) return null

      const canEdit = !itemInfo.locked && (currentUser.roles.includes('teacher') || currentUser.roles.includes('admin'))
      const canDelete = canEdit
      const canShare = !itemInfo.hidden
      const canDownload = !isFolder && !itemInfo.locked

      return (
        <div
          ref={ref}
          className={clsx(
            'cx-card',
            `file-card--${variant}`,
            {
              'file-card--folder': isFolder,
              'file-card--file': !isFolder,
              'file-card--selected': isSelected,
              'file-card--locked': itemInfo.locked,
              'file-card--hidden': itemInfo.hidden,
              'file-card--clickable': !!onSelect || !!onOpen,
            },
            className
          )}
          onClick={handleCardClick}
          onDoubleClick={handleDoubleClick}
          data-testid={testId}
          aria-label={`${isFolder ? 'Folder' : 'File'}: ${itemInfo.name}`}
          {...props}
        >
          {variant === 'grid' && showPreview && file?.thumbnail_url && (
            <div className="file-card__thumbnail">
              <img
                src={file.thumbnail_url}
                alt={`Preview of ${itemInfo.name}`}
                className="file-card__thumbnail-image"
                loading="lazy"
              />
            </div>
          )}

          <div className="file-card__content">
            <div className="file-card__header">
              <div className="file-card__icon-section">
                {getFileIcon()}
                {itemInfo.locked && (
                  <LockIcon size={12} />
                )}
              </div>

              <div className="file-card__title-section">
                <h3 className="file-card__title" title={itemInfo.name}>
                  <button
                    type="button"
                    className="file-card__title-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick()
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleDoubleClick()
                    }}
                  >
                    {itemInfo.name}
                  </button>
                </h3>
                <span className="file-card__subtitle">
                  {itemInfo.subtitle}
                </span>
              </div>

              {showActions && (
                <div className="file-card__actions" ref={menuRef}>
                  <button
                    className="file-card__actions-toggle"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(!isMenuOpen)
                    }}
                    aria-label={`Actions for ${itemInfo.name}`}
                    aria-expanded={isMenuOpen}
                    type="button"
                  >
                    <DotsIcon size={16} />
                  </button>
                  {isMenuOpen && (
                    <div className="cx-dropdown-menu">
                      {!isFolder && onPreview && (
                        <button
                          className="cx-dropdown-menu__item"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpen(false)
                            onPreview(file!)
                          }}
                          type="button"
                        >
                          Preview
                        </button>
                      )}

                      {!isFolder && canDownload && onDownload && (
                        <button
                          className="cx-dropdown-menu__item"
                          onClick={async (e) => {
                            e.stopPropagation()
                            setMenuOpen(false)
                            try {
                              await onDownload(file!)
                            } catch (error) {
                              console.error('Download failed:', error)
                            }
                          }}
                          type="button"
                        >
                          Download
                        </button>
                      )}

                      {canShare && onShare && (
                        <button
                          className="cx-dropdown-menu__item"
                          onClick={async (e) => {
                            e.stopPropagation()
                            setMenuOpen(false)
                            try {
                              await onShare(item)
                            } catch (error) {
                              console.error('Share failed:', error)
                            }
                          }}
                          type="button"
                        >
                          Share
                        </button>
                      )}

                      {canEdit && onEdit && (
                        <button
                          className="cx-dropdown-menu__item"
                          onClick={async (e) => {
                            e.stopPropagation()
                            setMenuOpen(false)
                            try {
                              await onEdit(item)
                            } catch (error) {
                              console.error('Edit failed:', error)
                            }
                          }}
                          type="button"
                        >
                          Rename
                        </button>
                      )}

                      {canDelete && onDelete && (
                        <button
                          className="cx-dropdown-menu__item cx-dropdown-menu__item--danger"
                          onClick={async (e) => {
                            e.stopPropagation()
                            setMenuOpen(false)
                            if (window.confirm(`Are you sure you want to delete "${itemInfo.name}"?`)) {
                              try {
                                await onDelete(item)
                              } catch (error) {
                                console.error('Delete failed:', error)
                              }
                            }
                          }}
                          type="button"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="file-card__meta">
              <div className="file-card__meta-item">
                <TimeIcon size={16} />
                <span className="file-card__date">
                  {new Date(itemInfo.date).toLocaleDateString()}
                </span>
              </div>

              {itemInfo.size && (
                <div className="file-card__meta-item">
                  <span className="file-card__size">
                    {formatFileSize(itemInfo.size)}
                  </span>
                </div>
              )}
            </div>

            <div className="file-card__badges">
              {itemInfo.locked && (
                <span className="cx-badge cx-badge--danger cx-badge--sm">
                  Locked
                </span>
              )}

              {itemInfo.hidden && (
                <span className="cx-badge cx-badge--warning cx-badge--sm">
                  Hidden
                </span>
              )}

              {isFolder && folder?.for_submissions && (
                <span className="cx-badge cx-badge--info cx-badge--sm">
                  Submissions
                </span>
              )}
            </div>
          </div>

          <div className="sr-only">
            {isFolder ? 'Folder' : 'File'} {itemInfo.name}.
            {itemInfo.subtitle && ` ${itemInfo.subtitle}.`}
            {itemInfo.size && ` Size: ${formatFileSize(itemInfo.size)}.`}
            {itemInfo.locked && ' This item is locked.'}
            {itemInfo.hidden && ' This item is hidden.'}
            Last modified {new Date(itemInfo.date).toLocaleDateString()}.
          </div>
        </div>
      )
    }
  )
)

FileCard.displayName = 'FileCard'
