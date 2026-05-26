/**
 * CourseGroups — ClassApex LMS
 * =================================
 * Canvas REST API:
 *  GET/POST /api/v1/courses/:courseId/group_categories
 *  GET/POST /api/v1/group_categories/:categoryId/groups
 *  PUT/DELETE /api/v1/groups/:groupId
 *  POST /api/v1/groups/:groupId/memberships
 *  DELETE /api/v1/groups/:groupId/users/:userId
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

interface GroupSet {
  id: number
  name: string
  self_signup: string
  group_limit: number
}

interface Group {
  id: number
  name: string
  description: string
  members_count: number
  max_membership: number
  users?: { id: number; name: string }[]
}

export default function CourseGroupsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null)
  const [editingSet, setEditingSet] = useState<any | null>(null)
  const [setForm, setSetForm] = useState({ name: '' })
  const [editingGroup, setEditingGroup] = useState<any | null>(null)
  const [groupForm, setGroupForm] = useState({ name: '', description: '', max_membership: 0 })
  const [addingMember, setAddingMember] = useState<{ groupId: number; userId: string } | null>(null)

  const { data: sets, isLoading, refetch: refetchSets } = useCanvasQuery<GroupSet[]>(
    courseId ? `/api/v1/courses/${courseId}/group_categories` : '',
    { per_page: 50 } as any
  )

  const { data: groups, isLoading: groupsLoading, refetch: refetchGroups } = useCanvasQuery<Group[]>(
    selectedSetId ? `/api/v1/group_categories/${selectedSetId}/groups` : '',
    { per_page: 100, include: ['users'] } as any
  )

  const { data: students } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/users?enrollment_type[]=student` : '',
    { per_page: 100 } as any
  )

  const handleSaveSet = async () => {
    if (!setForm.name.trim()) { showToast({ title: 'Name is required', type: 'error' }); return }
    try {
      if (editingSet?.id) {
        await canvasFetch(`/api/v1/group_categories/${editingSet.id}`, { method: 'PUT', body: { name: setForm.name.trim() } })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/group_categories`, { method: 'POST', body: { name: setForm.name.trim() } })
      }
      showToast({ title: `Group set ${editingSet?.id ? 'updated' : 'created'}`, type: 'success' })
      setEditingSet(null)
      setSetForm({ name: '' })
      refetchSets()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleDeleteSet = async (id: number) => {
    const confirmed = await showConfirm({ title: 'Delete Group Set?', message: 'All groups in this set will be deleted.', type: 'danger' })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/group_categories/${id}`, { method: 'DELETE' })
      showToast({ title: 'Group set deleted', type: 'success' })
      refetchSets()
      setSelectedSetId(null)
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) { showToast({ title: 'Name is required', type: 'error' }); return }
    try {
      const payload = { name: groupForm.name.trim(), description: groupForm.description, max_membership: groupForm.max_membership || undefined }
      if (editingGroup?.id) {
        await canvasFetch(`/api/v1/groups/${editingGroup.id}`, { method: 'PUT', body: payload })
      } else if (selectedSetId) {
        await canvasFetch(`/api/v1/group_categories/${selectedSetId}/groups`, { method: 'POST', body: payload })
      }
      showToast({ title: `Group ${editingGroup?.id ? 'updated' : 'created'}`, type: 'success' })
      setEditingGroup(null)
      setGroupForm({ name: '', description: '', max_membership: 0 })
      refetchGroups()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleDeleteGroup = async (id: number) => {
    const confirmed = await showConfirm({ title: 'Delete Group?', message: 'This cannot be undone.', type: 'danger' })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/groups/${id}`, { method: 'DELETE' })
      showToast({ title: 'Group deleted', type: 'success' })
      refetchGroups()
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleAddMember = async (groupId: number, userId: string) => {
    try {
      await canvasFetch(`/api/v1/groups/${groupId}/memberships`, { method: 'POST', body: { user_id: userId } })
      showToast({ title: 'Member added', type: 'success' })
      refetchGroups()
      setAddingMember(null)
    } catch (err: any) {
      showToast({ title: 'Add failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleRemoveMember = async (groupId: number, userId: number) => {
    try {
      await canvasFetch(`/api/v1/groups/${groupId}/users/${userId}`, { method: 'DELETE' })
      showToast({ title: 'Member removed', type: 'success' })
      refetchGroups()
    } catch (err: any) {
      showToast({ title: 'Remove failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  if (!isTeacher) {
    return (
      <div className="cx-page">
        <div className="cx-page__header" style={{ paddingTop: 0 }}>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Groups</h2>
        </div>
        <p style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>You do not have permission to manage course groups.</p>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Course Groups</h2>
        <button className="cx-btn cx-btn--primary" onClick={() => { setEditingSet({}); setSetForm({ name: '' }) }}>+ New Group Set</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedSetId ? '240px 1fr' : '1fr', gap: 20 }}>
        {/* Group Sets */}
        <div>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Group Sets</h3>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 48, borderRadius: 8 }} />)}
            </div>
          ) : !sets || sets.length === 0 ? (
            <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>No group sets.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sets.map(s => (
                <li
                  key={s.id}
                  onClick={() => setSelectedSetId(s.id)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    background: selectedSetId === s.id ? 'rgba(var(--cx-color-primary-rgb, 99,102,241), 0.1)' : 'var(--cx-bg-surface)',
                    border: `1px solid ${selectedSetId === s.id ? 'var(--cx-color-primary)' : 'var(--cx-border-subtle)'}`,
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{s.name}</span>
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { setEditingSet(s); setSetForm({ name: s.name }) }}>✎</button>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteSet(s.id)} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>🗑</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Groups in selected set */}
        {selectedSetId && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Groups</h3>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => { setEditingGroup({}); setGroupForm({ name: '', description: '', max_membership: 0 }) }}>+ New Group</button>
            </div>
            {groupsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 64, borderRadius: 10 }} />)}
              </div>
            ) : !groups || groups.length === 0 ? (
              <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>No groups in this set.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {groups.map(g => (
                  <div key={g.id} className="cx-card" style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)' }}>{g.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>{g.members_count} members · {g.description || 'No description'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { setEditingGroup(g); setGroupForm({ name: g.name, description: g.description || '', max_membership: g.max_membership || 0 }) }}>Edit</button>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteGroup(g.id)} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>Delete</button>
                      </div>
                    </div>
                    {/* Members */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {(g.users || []).map((u: any) => (
                        <span key={u.id} className="cx-badge" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {u.name}
                          <button onClick={() => handleRemoveMember(g.id, u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cx-color-danger)', padding: 0, fontSize: '0.7rem' }}>✕</button>
                        </span>
                      ))}
                    </div>
                    {/* Add member */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="cx-input cx-input--sm" style={{ flex: 1, fontSize: '0.8125rem' }} onChange={e => setAddingMember({ groupId: g.id, userId: e.target.value })} value={addingMember?.groupId === g.id ? addingMember.userId : ''}>
                        <option value="">Add member...</option>
                        {(students || []).map(s => (
                          <option key={s.id} value={String(s.id)}>{s.name}</option>
                        ))}
                      </select>
                      <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => addingMember?.groupId === g.id && addingMember.userId && handleAddMember(g.id, addingMember.userId)} disabled={addingMember?.groupId !== g.id || !addingMember?.userId}>Add</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Set Edit Modal */}
      {editingSet && (
        <div className="cx-modal-overlay" onClick={() => setEditingSet(null)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">{editingSet.id ? 'Edit Group Set' : 'New Group Set'}</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditingSet(null)}>✕</button>
            </div>
            <div className="cx-modal__body">
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Name *</label>
              <input type="text" className="cx-input" value={setForm.name} onChange={e => setSetForm({ name: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setEditingSet(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSaveSet}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Group Edit Modal */}
      {editingGroup && (
        <div className="cx-modal-overlay" onClick={() => setEditingGroup(null)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">{editingGroup.id ? 'Edit Group' : 'New Group'}</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditingGroup(null)}>✕</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Name *</label>
                <input type="text" className="cx-input" value={groupForm.name} onChange={e => setGroupForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea className="cx-input" rows={2} value={groupForm.description} onChange={e => setGroupForm(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Max Members (0 = unlimited)</label>
                <input type="number" className="cx-input" value={groupForm.max_membership} onChange={e => setGroupForm(p => ({ ...p, max_membership: Number(e.target.value) || 0 }))} style={{ width: 120 }} />
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setEditingGroup(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSaveGroup}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
