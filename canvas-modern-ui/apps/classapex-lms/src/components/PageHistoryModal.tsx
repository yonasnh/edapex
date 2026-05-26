import React, { useState, useMemo } from 'react'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import clsx from 'clsx'

export interface PageHistoryModalProps {
  courseId: string
  pageUrl: string
  isOpen: boolean
  onClose: () => void
}

interface PageRevision {
  revision_id: number
  latest: boolean
  updated_at: string
  edited_by?: {
    display_name: string
    avatar_image_url?: string
  }
  body?: string
  page_title?: string
}

function formatBytes(bytes?: number): string {
  if (bytes == null) return '—'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
  const size = i >= sizes.length ? sizes.length - 1 : i
  const val = parseFloat((bytes / Math.pow(k, size)).toFixed(1))
  return `${val} ${sizes[size]}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function diffText(oldText: string, newText: string): string {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result: string[] = []

  // Simple line-based diff for display
  const maxLen = Math.max(oldLines.length, newLines.length)
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] ?? ''
    const newLine = newLines[i] ?? ''
    if (oldLine === newLine) {
      result.push(`<div style="padding:1px 0;color:var(--cx-text-secondary)">${escapeHtml(oldLine) || '&nbsp;'}</div>`)
    } else {
      if (oldLine) {
        result.push(`<div style="padding:1px 0;background:rgba(239,68,68,0.08);color:#b91c1c;text-decoration:line-through">- ${escapeHtml(oldLine)}</div>`)
      }
      if (newLine) {
        result.push(`<div style="padding:1px 0;background:rgba(34,197,94,0.08);color:#15803d">+ ${escapeHtml(newLine)}</div>`)
      }
    }
  }

  return result.join('')
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export default function PageHistoryModal({ courseId, pageUrl, isOpen, onClose }: PageHistoryModalProps) {
  const { showToast } = useNotification()
  const [previewRevision, setPreviewRevision] = useState<PageRevision | null>(null)
  const [compareIds, setCompareIds] = useState<number[]>([])
  const [restoring, setRestoring] = useState(false)
  const [mode, setMode] = useState<'list' | 'preview' | 'compare'>('list')

  const { data: revisions, isLoading, refetch } = useCanvasQuery<PageRevision[]>(
    isOpen ? `/api/v1/courses/${courseId}/pages/${pageUrl}/revisions` : '',
    { per_page: 50 } as any
  )

  const sortedRevisions = useMemo(() => {
    if (!revisions) return []
    return [...revisions].sort((a, b) => b.revision_id - a.revision_id)
  }, [revisions])

  const handleRestore = async (revision: PageRevision) => {
    setRestoring(true)
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/pages/${pageUrl}/revisions/${revision.revision_id}`, {
        method: 'PUT',
      })
      showToast({ title: 'Version restored', message: `Restored to revision ${revision.revision_id}`, type: 'success' })
      refetch()
      setMode('list')
      setPreviewRevision(null)
    } catch (err: any) {
      showToast({ title: 'Restore failed', message: err.message || 'Could not restore version.', type: 'error' })
    } finally {
      setRestoring(false)
    }
  }

  const toggleCompare = (revisionId: number) => {
    setCompareIds(prev => {
      if (prev.includes(revisionId)) {
        return prev.filter(id => id !== revisionId)
      }
      if (prev.length >= 2) {
        return [prev[1], revisionId]
      }
      return [...prev, revisionId]
    })
  }

  const compareRevisions = useMemo(() => {
    if (compareIds.length !== 2) return null
    const [newerId, olderId] = compareIds[0] > compareIds[1] ? [compareIds[0], compareIds[1]] : [compareIds[1], compareIds[0]]
    const newer = sortedRevisions.find(r => r.revision_id === newerId)
    const older = sortedRevisions.find(r => r.revision_id === olderId)
    return newer && older ? { newer, older } : null
  }, [compareIds, sortedRevisions])

  const handleClose = () => {
    setPreviewRevision(null)
    setCompareIds([])
    setMode('list')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="cx-modal-overlay" onClick={handleClose}>
      <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="cx-modal__header">
          <h2 className="cx-modal__title">Page History</h2>
          <button className="cx-btn cx-btn--ghost" onClick={handleClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg>
          </button>
        </div>

        <div className="cx-modal__body" style={{ overflow: 'auto', flex: 1 }}>
          {mode === 'preview' && previewRevision ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Revision #{previewRevision.revision_id}</span>
                  <span style={{ color: 'var(--cx-text-secondary)', marginLeft: 8, fontSize: '0.8125rem' }}>
                    by {previewRevision.edited_by?.display_name || 'Unknown'} · {formatDate(previewRevision.updated_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setMode('list')}>Back</button>
                  <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => handleRestore(previewRevision)} disabled={restoring}>
                    {restoring ? 'Restoring…' : 'Restore this version'}
                  </button>
                </div>
              </div>
              <div
                style={{
                  border: '1px solid var(--cx-border-subtle)',
                  borderRadius: 8,
                  padding: 20,
                  background: 'var(--cx-bg-surface)',
                  minHeight: 200,
                }}
                dangerouslySetInnerHTML={{ __html: previewRevision.body || '<p><em>No content</em></p>' }}
              />
            </div>
          ) : mode === 'compare' && compareRevisions ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Comparing Revisions</span>
                  <span style={{ color: 'var(--cx-text-secondary)', marginLeft: 8, fontSize: '0.8125rem' }}>
                    #{compareRevisions.older.revision_id} → #{compareRevisions.newer.revision_id}
                  </span>
                </div>
                <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setMode('list')}>Back</button>
              </div>
              <div
                style={{
                  border: '1px solid var(--cx-border-subtle)',
                  borderRadius: 8,
                  padding: 20,
                  background: 'var(--cx-bg-surface)',
                  minHeight: 200,
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                }}
                dangerouslySetInnerHTML={{
                  __html: diffText(
                    compareRevisions.older.body?.replace(/<[^>]+>/g, '\n') || '',
                    compareRevisions.newer.body?.replace(/<[^>]+>/g, '\n') || ''
                  ),
                }}
              />
            </div>
          ) : (
            <div>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="cx-skeleton" style={{ height: 48, borderRadius: 8 }} />
                  ))}
                </div>
              ) : sortedRevisions.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--cx-text-tertiary)', padding: 24 }}>No revisions found.</p>
              ) : (
                <>
                  {compareIds.length === 2 && (
                    <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                      <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setMode('compare')}>
                        Compare selected
                      </button>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setCompareIds([])}>
                        Clear selection
                      </button>
                    </div>
                  )}
                  <div style={{ overflowX: 'auto' }}>
                    <table className="cx-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}></th>
                          <th>Revision</th>
                          <th>Editor</th>
                          <th>Date</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRevisions.map((rev, idx) => {
                          const prevBody = sortedRevisions[idx + 1]?.body
                          const sizeChange = prevBody != null && rev.body != null ? rev.body.length - prevBody.length : 0
                          const isSelected = compareIds.includes(rev.revision_id)

                          return (
                            <tr
                              key={rev.revision_id}
                              className={clsx('cx-table__row', isSelected && 'cx-table__row--selected')}
                              style={isSelected ? { background: 'var(--cx-color-primary-subtle)' } : undefined}
                            >
                              <td style={{ padding: '10px 8px' }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleCompare(rev.revision_id)}
                                  aria-label={`Select revision ${rev.revision_id} for compare`}
                                />
                              </td>
                              <td className="cx-table__cell">
                                <span style={{ fontWeight: 600 }}>#{rev.revision_id}</span>
                                {rev.latest && (
                                  <span
                                    style={{
                                      marginLeft: 8,
                                      fontSize: '0.6875rem',
                                      padding: '1px 6px',
                                      borderRadius: 8,
                                      background: 'var(--cx-color-success-subtle, rgba(34,197,94,0.12))',
                                      color: '#15803d',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Latest
                                  </span>
                                )}
                              </td>
                              <td className="cx-table__cell">{rev.edited_by?.display_name || '—'}</td>
                              <td className="cx-table__cell cx-table__cell--muted">{formatDate(rev.updated_at)}</td>
                              <td className="cx-table__cell cx-table__cell--actions" style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                  {sizeChange !== 0 && (
                                    <span
                                      style={{
                                        fontSize: '0.75rem',
                                        color: sizeChange > 0 ? '#15803d' : '#b91c1c',
                                        fontWeight: 500,
                                      }}
                                      title={`Size change: ${formatBytes(sizeChange)}`}
                                    >
                                      {sizeChange > 0 ? '+' : ''}
                                      {formatBytes(sizeChange)}
                                    </span>
                                  )}
                                  <button
                                    className="cx-btn cx-btn--ghost cx-btn--sm"
                                    onClick={() => {
                                      setPreviewRevision(rev)
                                      setMode('preview')
                                    }}
                                  >
                                    Preview
                                  </button>
                                  {!rev.latest && (
                                    <button
                                      className="cx-btn cx-btn--ghost cx-btn--sm"
                                      onClick={() => handleRestore(rev)}
                                      disabled={restoring}
                                    >
                                      Restore
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="cx-modal__footer">
          <button className="cx-btn cx-btn--secondary" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
