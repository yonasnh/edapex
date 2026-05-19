import React, { useState } from 'react'
import clsx from 'clsx'

interface SubAccount {
  id: string
  name: string
  parentId: string | null
  courseCount: number
  userCount: number
  enrollmentCount: number
  storageUsedMb: number
}

// We will fetch this data from Canvas API instead
// const mockAccounts: SubAccount[] = ...

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg> }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z"/></svg> }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M11 5v7a1 1 0 01-1 1H4a1 1 0 01-1-1V5"/></svg> }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg> }
function ChevronRightSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4"/></svg> }
function ChevronDownSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5l3 3 3-3"/></svg> }
function BuildingSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 6h2M11 6h2M7 9h2M11 9h2M7 12h2M11 12h2"/></svg> }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg> }

import { useCanvasQuery } from '../../hooks/useCanvasQuery'

export default function SubAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']))
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newParent, setNewParent] = useState('root')
  const [editingAccount, setEditingAccount] = useState<{ id: string; name: string } | null>(null)

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const { data: canvasAccounts, refetch } = useCanvasQuery<any[]>('/api/v1/accounts', { per_page: 50, include: ['storage_quota'] } as any)

  const mockAccounts = React.useMemo<SubAccount[]>(() => {
    if (!Array.isArray(canvasAccounts)) return [];
    return canvasAccounts.map(a => ({
      id: String(a.id),
      name: a.name || 'Untitled Account',
      parentId: a.parent_account_id ? String(a.parent_account_id) : null,
      courseCount: a.course_count || 0,
      userCount: a.user_count || 0,
      enrollmentCount: 0,
      storageUsedMb: 0,
    }));
  }, [canvasAccounts]);

  const childrenOf = (parentId: string | null) =>
    mockAccounts.filter(a => a.parentId === parentId && (!searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase())))

  const rootAccounts = childrenOf(null)

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const formData = new URLSearchParams()
      formData.append('account[name]', newName)
      
      const parentEndpoint = newParent && newParent !== 'root' 
        ? `/api/v1/accounts/${newParent}/sub_accounts`
        : `/api/v1/accounts/1/sub_accounts`

      const res = await fetch(parentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })
      if (!res.ok) throw new Error('Failed to create sub-account')
      
      setNewName('')
      setShowCreate(false)
      refetch()
    } catch (err) {
      console.error(err)
      alert('Failed to create sub-account.')
    }
  }

  const handleRename = async () => {
    if (!editingAccount || !editingAccount.name.trim()) return
    try {
      const formData = new URLSearchParams()
      formData.append('account[name]', editingAccount.name)
      const res = await fetch(`/api/v1/accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })
      if (!res.ok) throw new Error('Failed to rename account')
      setEditingAccount(null)
      refetch()
    } catch (err) {
      console.error(err)
      alert('Failed to rename account.')
    }
  }

  const formatStorage = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`

  const renderTree = (accounts: SubAccount[], depth = 0): React.ReactNode => {
    return accounts.map(account => {
      const hasChildren = mockAccounts.some(a => a.parentId === account.id)
      const isExpanded = expanded.has(account.id)
      return (
        <React.Fragment key={account.id}>
          <div
            className="cx-admin-row"
            style={{ paddingLeft: 16 + depth * 24 }}
          >
            <div className="cx-admin-row__main" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              {hasChildren ? (
                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => toggleExpand(account.id)} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                  {isExpanded ? <ChevronDownSvg /> : <ChevronRightSvg />}
                </button>
              ) : <span style={{ width: 24 }} />}
              <BuildingSvg />
              {editingAccount?.id === account.id ? (
                <>
                  <input
                    className="cx-input"
                    style={{ fontSize: '0.875rem', padding: '2px 8px', maxWidth: 200 }}
                    value={editingAccount.name}
                    onChange={e => setEditingAccount({ ...editingAccount, name: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingAccount(null) }}
                    autoFocus
                  />
                  <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleRename}>Save</button>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setEditingAccount(null)}>Cancel</button>
                </>
              ) : (
                <span style={{ fontWeight: 500 }}>{account.name}</span>
              )}
            </div>
            <span className="cx-admin-row__stat">{account.courseCount} courses</span>
            <span className="cx-admin-row__stat">{account.userCount} users</span>
            <span className="cx-admin-row__stat">{account.enrollmentCount} enrollments</span>
            <span className="cx-admin-row__stat">{formatStorage(account.storageUsedMb)}</span>
            <div className="cx-admin-row__actions">
              <button
                className="cx-btn cx-btn--ghost cx-btn--sm"
                aria-label="Edit"
                onClick={() => setEditingAccount({ id: account.id, name: account.name })}
              >
                <EditSvg />
              </button>
              {account.parentId && (
                <button className="cx-btn cx-btn--ghost cx-btn--sm" aria-label="Delete" onClick={async () => {
                  if (confirm('Delete this account?')) {
                    try {
                      const res = await fetch(`/api/v1/accounts/${account.parentId}/sub_accounts/${account.id}`, { method: 'DELETE' })
                      if (res.ok) refetch()
                    } catch (e) {
                      console.error(e)
                    }
                  }
                }}><TrashSvg /></button>
              )}
            </div>
          </div>
          {hasChildren && isExpanded && renderTree(childrenOf(account.id), depth + 1)}
        </React.Fragment>
      )
    })
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Sub-Accounts</h1>
          <p className="cx-page__subtitle">Manage account hierarchy and sub-account settings</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowCreate(p => !p)}>
          <PlusSvg /> New Sub-Account
        </button>
      </div>

      {showCreate && (
        <div className="cx-card" style={{ marginBottom: 16, padding: 16 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>Create Sub-Account</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="cx-form-group" style={{ flex: 1 }}>
              <label className="cx-form-label" htmlFor="sub-name">Account Name</label>
              <input id="sub-name" className="cx-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. West District" />
            </div>
            <div className="cx-form-group">
              <label className="cx-form-label" htmlFor="sub-parent">Parent Account</label>
              <select id="sub-parent" className="cx-select" value={newParent} onChange={e => setNewParent(e.target.value)}>
                {mockAccounts.filter(a => a.parentId === null || a.parentId === 'root').map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleCreate} disabled={!newName.trim()}>Create</button>
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="cx-toolbar" style={{ marginBottom: 16 }}>
        <div className="cx-search">
          <SearchSvg />
          <input type="search" className="cx-search__input" placeholder="Search accounts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="cx-table-container">
        <div className="cx-admin-header">
          <span className="cx-admin-header__item" style={{ flex: 1 }}>Account</span>
          <span className="cx-admin-header__item">Courses</span>
          <span className="cx-admin-header__item">Users</span>
          <span className="cx-admin-header__item">Enrollments</span>
          <span className="cx-admin-header__item">Storage</span>
          <span className="cx-admin-header__item">Actions</span>
        </div>
        {rootAccounts.length === 0 ? (
          <div className="cx-empty" style={{ padding: 32, textAlign: 'center' }}>
            <BuildingSvg />
            <p style={{ marginTop: 8, color: 'var(--cx-text-secondary)' }}>No accounts found</p>
          </div>
        ) : (
          renderTree(rootAccounts)
        )}
      </div>
    </div>
  )
}
