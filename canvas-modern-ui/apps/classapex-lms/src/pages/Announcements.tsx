import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import NewRceWrapper from '../components/NewRceWrapper'
import PodcastFeedGenerator from '../components/PodcastFeedGenerator'
import { useNotification } from '../hooks/useNotification'
import { useRole } from '../contexts/RoleContext'

interface AnnouncementForm {
  title: string
  message: string
  published: boolean
  delayed_post_at: string
  allow_rating: boolean
}

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AnnouncementsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()

  const { data: announcements, isLoading, refetch } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/discussion_topics?only_announcements=true` : '',
    { per_page: 50, order_by: 'position' } as any,
    { enabled: !!courseId }
  )

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<AnnouncementForm>({
    title: '',
    message: '',
    published: true,
    delayed_post_at: '',
    allow_rating: false,
  })

  const openCreate = () => {
    setEditingId(null)
    setForm({ title: '', message: '', published: true, delayed_post_at: '', allow_rating: false })
    setShowModal(true)
  }

  const openEdit = (a: any) => {
    setEditingId(a.id)
    setForm({
      title: a.title || '',
      message: a.message || '',
      published: a.published ?? true,
      delayed_post_at: toDatetimeLocal(a.delayed_post_at),
      allow_rating: a.allow_rating ?? false,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast({ title: 'Title is required', type: 'warning' })
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, any> = {
        'is_announcement': 'true',
        'title': form.title.trim(),
        'message': form.message,
        'published': form.published ? 'true' : 'false',
        'allow_rating': form.allow_rating ? 'true' : 'false',
      }
      if (form.delayed_post_at) {
        payload['delayed_post_at'] = new Date(form.delayed_post_at).toISOString()
      }

      if (editingId) {
        await canvasFetch(`/api/v1/courses/${courseId}/discussion_topics/${editingId}`, {
          method: 'PUT',
          body: payload,
        })
        showToast({ title: 'Announcement updated', type: 'success' })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/discussion_topics`, {
          method: 'POST',
          body: payload,
        })
        showToast({ title: 'Announcement created', type: 'success' })
      }
      setShowModal(false)
      refetch()
    } catch (err: any) {
      showToast({ title: 'Failed to save', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Announcement?',
      message: `Remove "${title}" permanently?`,
      type: 'danger',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/discussion_topics/${id}`, { method: 'DELETE' })
      showToast({ title: 'Announcement deleted', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Failed to delete', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const handleTogglePin = async (a: any) => {
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/discussion_topics/${a.id}`, {
        method: 'PUT',
        body: { pinned: !a.pinned },
      })
      showToast({ title: a.pinned ? 'Unpinned' : 'Pinned', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Failed to update pin', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const list = Array.isArray(announcements) ? announcements : []

  if (isLoading) {
    return (
      <div className="cx-assignment-list">
        <div className="cx-loading" role="status" aria-label="Loading announcements">
          <div className="cx-loading__spinner" />
          <span className="cx-loading__text">Loading announcements…</span>
        </div>
        <div className="cx-skeleton cx-skeleton--list-banner" style={{ marginTop: 24 }} />
        {[1, 2, 3].map(i => <div key={i} className="cx-skeleton cx-skeleton--assignment-card" style={{ marginTop: 12 }} />)}
      </div>
    )
  }

  return (
    <div className="cx-assignment-list">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 'var(--cx-text-xl)', color: 'var(--cx-text-primary)' }}>Announcements</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {courseId && (
            <PodcastFeedGenerator courseId={courseId} feedType="announcements" />
          )}
          {isTeacher && (
            <button className="cx-btn cx-btn--primary" onClick={openCreate}>+ New Announcement</button>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="cx-assignment-list__empty">
          <p className="cx-assignment-list__empty-text">No announcements yet</p>
          <p className="cx-assignment-list__empty-hint">{isTeacher ? 'Create one to notify your students.' : 'Check back later for updates from your instructor.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(a => {
            const posted = a.posted_at ? new Date(a.posted_at) : null
            const delayed = a.delayed_post_at ? new Date(a.delayed_post_at) : null
            const isDelayed = delayed && delayed > new Date()
            return (
              <div
                key={a.id}
                className="cx-assignment-card"
                style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--cx-text-base)', fontWeight: 600, color: 'var(--cx-text-primary)' }}>{a.title}</h3>
                    {a.pinned && (
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 999, background: 'var(--cx-color-primary-subtle)', color: 'var(--cx-color-primary)', fontWeight: 700 }}>Pinned</span>
                    )}
                    {isDelayed && (
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 999, background: 'var(--cx-color-warning-subtle)', color: 'var(--cx-color-warning)', fontWeight: 700 }}>Delayed</span>
                    )}
                    {!a.published && (
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 999, background: 'var(--cx-bg-surface-sunken)', color: 'var(--cx-text-tertiary)', fontWeight: 700 }}>Unpublished</span>
                    )}
                  </div>
                  {isTeacher && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" title={a.pinned ? 'Unpin' : 'Pin'} onClick={() => handleTogglePin(a)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={a.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M12 2l-5.5 9h11z"/><path d="M12 11v9"/><path d="M5 22h14"/></svg>
                      </button>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Edit" onClick={() => openEdit(a)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Delete" onClick={() => handleDelete(a.id, a.title)} style={{ color: 'var(--cx-color-danger)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 'var(--cx-text-xs)', color: 'var(--cx-text-secondary)' }}>
                  {a.author?.display_name || 'Instructor'}
                  {posted && ` · ${posted.toLocaleDateString()} ${posted.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  {isDelayed && ` · Delayed until ${delayed.toLocaleDateString()}`}
                </div>

                {a.message && (
                  <div
                    style={{ fontSize: 'var(--cx-text-sm)', color: 'var(--cx-text-primary)', lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: a.message }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 'var(--cx-text-xs)', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
                  <span>{a.discussion_subentry_count || 0} replies</span>
                  {a.read_state === 'unread' && <span style={{ color: 'var(--cx-color-primary)', fontWeight: 600 }}>Unread</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="cx-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowModal(false)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg>
              </button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-04)' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>
                  Title <span style={{ color: 'var(--cx-color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="cx-input"
                  style={{ width: '100%' }}
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Message</label>
                <NewRceWrapper
                  value={form.message || ''}
                  onChange={html => setForm(p => ({ ...p, message: html }))}
                  placeholder="Write your announcement..."
                  minHeight={140}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Delayed Post (optional)</label>
                  <input
                    type="datetime-local"
                    className="cx-input"
                    style={{ width: '100%' }}
                    value={form.delayed_post_at}
                    onChange={e => setForm(p => ({ ...p, delayed_post_at: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingTop: 4 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                    style={{ accentColor: 'var(--cx-color-primary)', width: 18, height: 18 }}
                  />
                  Published
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.allow_rating}
                    onChange={e => setForm(p => ({ ...p, allow_rating: e.target.checked }))}
                    style={{ accentColor: 'var(--cx-color-primary)', width: 18, height: 18 }}
                  />
                  Allow Liking
                </label>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSave} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving…' : editingId ? 'Update' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
