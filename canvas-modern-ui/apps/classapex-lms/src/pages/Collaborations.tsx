/**
 * Collaborations — ClassApex LMS
 * ================================
 * Canvas REST API integration:
 *   GET  /api/v1/courses/:courseId/collaborations  — list
 *   DELETE /api/v1/courses/:courseId/collaborations/:id — delete (with permission)
 *
 * LTI Collaborations are opened via iframe to Canvas native
 * /courses/:courseId/lti_collaborations for creation.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { useRole } from '../contexts/RoleContext'
import CollaborationIframeModal from '../components/CollaborationIframeModal'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Collaboration {
  id: number
  collaboration_type: string
  document_id?: string
  user_id: number
  user_name: string
  context_id: number
  context_type: string
  url: string
  created_at: string
  updated_at: string
  description?: string
  title: string
  type: string
  update_url: string
  permissions: {
    update: boolean
    delete: boolean
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCollaborationIcon(type: string) {
  const t = type.toLowerCase()
  if (t.includes('google') || t.includes('gdocs')) {
    return (
      <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2h4a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1h4" />
        <path d="M8 1h4v3H8z" />
        <path d="M7 9h6M7 12h4" />
      </svg>
    )
  }
  if (t.includes('office') || t.includes('microsoft') || t.includes('onedrive')) {
    return (
      <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="8" height="16" rx="1" />
        <rect x="10" y="5" width="8" height="10" rx="1" />
        <path d="M7 7h2M7 10h2M7 13h2" />
      </svg>
    )
  }
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 17v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 002 15.5V17" />
      <circle cx="7.5" cy="6" r="3.5" />
      <path d="M18 17v-1.5a3.5 3.5 0 00-2.5-3.4" />
      <circle cx="14" cy="6" r="3.5" />
    </svg>
  )
}

function getCollaborationLabel(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('google')) return 'Google Docs'
  if (t.includes('office') || t.includes('microsoft')) return 'Office 365'
  if (t.includes('etherpad')) return 'Etherpad'
  return type
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CollaborationsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const {
    data: collaborations,
    isLoading,
    refetch,
  } = useCanvasQuery<Collaboration[]>(
    courseId ? `/api/v1/courses/${courseId}/collaborations` : '',
    { per_page: 100 } as any
  )

  const handleDelete = async (collab: Collaboration) => {
    if (!courseId) return
    const isConfirmed = await showConfirm({
      title: 'Delete Collaboration',
      message: `Are you sure you want to delete "${collab.title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
    })
    if (!isConfirmed) return
    setDeletingId(collab.id)
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/collaborations/${collab.id}`, {
        method: 'DELETE',
      })
      showToast({ title: 'Deleted', message: `"${collab.title}" has been removed.`, type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Delete Failed', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="cx-page">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--cx-text-primary)', flex: 1 }}>
          Collaborations
        </h2>
        {isTeacher && (
          <button
            className="cx-btn cx-btn--primary cx-btn--sm"
            onClick={() => setShowCreateModal(true)}
            data-testid="create-collaboration-btn"
          >
            + New Collaboration
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 72, borderRadius: 10 }} />
          ))}
        </div>
      ) : !collaborations || collaborations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 17v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 002 15.5V17" />
              <circle cx="7.5" cy="6" r="3.5" />
              <path d="M18 17v-1.5a3.5 3.5 0 00-2.5-3.4" />
              <circle cx="14" cy="6" r="3.5" />
            </svg>
          </div>
          <p>No collaborations yet for this course.</p>
          {isTeacher && (
            <button
              className="cx-btn cx-btn--primary"
              onClick={() => setShowCreateModal(true)}
              style={{ marginTop: 16 }}
            >
              Create the first collaboration
            </button>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {collaborations.map(collab => (
            <li
              key={collab.id}
              data-testid={`collaboration-${collab.id}`}
              className="cx-quiz-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 12,
                background: 'var(--cx-bg-surface-elevated)',
                border: '1px solid var(--cx-border-subtle)',
              }}
            >
              <div style={{ flexShrink: 0, color: 'var(--cx-text-secondary)' }}>
                {getCollaborationIcon(collab.collaboration_type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {collab.title}
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: 'rgba(99,102,241,0.12)',
                      color: '#4f46e5',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {getCollaborationLabel(collab.collaboration_type)}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                  Created by {collab.user_name} · {new Date(collab.created_at).toLocaleDateString()}
                  {collab.description ? ` · ${collab.description}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <a
                  href={collab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cx-btn cx-btn--primary cx-btn--sm"
                  style={{ textDecoration: 'none' }}
                  data-testid={`open-collab-${collab.id}`}
                >
                  Open
                </a>
                {collab.permissions?.delete && (
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    onClick={() => handleDelete(collab)}
                    disabled={deletingId === collab.id}
                    data-testid={`delete-collab-${collab.id}`}
                  >
                    {deletingId === collab.id ? '…' : 'Delete'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)', marginTop: 12, textAlign: 'right' }}>
        {collaborations?.length ?? 0} collaboration{collaborations?.length !== 1 ? 's' : ''}
      </p>

      {showCreateModal && courseId && (
        <CollaborationIframeModal
          courseId={courseId}
          onClose={() => {
            setShowCreateModal(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}
