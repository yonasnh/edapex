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
  storageQuotaMb: number
}

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg> }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z"/></svg> }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M11 5v7a1 1 0 01-1 1H4a1 1 0 01-1-1V5"/></svg> }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg> }
function ChevronRightSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4"/></svg> }
function ChevronDownSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5l3 3 3-3"/></svg> }
function BuildingSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 6h2M11 6h2M7 9h2M11 9h2M7 12h2M11 12h2"/></svg> }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg> }

import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

export default function SubAccountsPage() {
  const { showConfirm, showToast } = useNotification()
  const [searchTerm, setSearchTerm] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root', '1']))
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newParent, setNewParent] = useState('root')
  const [editingAccount, setEditingAccount] = useState<{ id: string; name: string } | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const { data: canvasAccounts, refetch: refetchRoots } = useCanvasQuery<any[]>('/api/v1/accounts', { per_page: 50, include: ['storage_quota'] } as any)
  const { data: subAccounts, refetch: refetchSubs } = useCanvasQuery<any[]>('/api/v1/accounts/1/sub_accounts', { recursive: true, per_page: 100, include: ['course_count', 'sub_account_count', 'storage_quota'] } as any)

  const refetch = React.useCallback(async () => {
    await Promise.all([refetchRoots(), refetchSubs()])
  }, [refetchRoots, refetchSubs])

  const mockAccounts = React.useMemo<SubAccount[]>(() => {
    const list: SubAccount[] = [];
    const seen = new Set<string>();

    const addAccount = (a: any) => {
      if (!a) return;
      const idStr = String(a.id);
      if (seen.has(idStr)) return;
      seen.add(idStr);
      
      const quotaBytes = a.storage_quota;
      const quotaMb = quotaBytes ? Math.round(quotaBytes / (1024 * 1024)) : (a.default_storage_quota_mb || 10240);

      list.push({
        id: idStr,
        name: a.name || 'Untitled Account',
        parentId: a.parent_account_id ? String(a.parent_account_id) : null,
        courseCount: a.course_count || 0,
        userCount: a.user_count || 0,
        enrollmentCount: a.enrollment_count || 0,
        storageUsedMb: Math.round(a.storage_quota_used_mb || 0),
        storageQuotaMb: quotaMb || 10240,
      });
    };

    if (Array.isArray(canvasAccounts)) {
      canvasAccounts.forEach(addAccount);
    }
    if (Array.isArray(subAccounts)) {
      subAccounts.forEach(addAccount);
    }

    return list;
  }, [canvasAccounts, subAccounts]);

  const selectedAccount = React.useMemo(() => {
    return mockAccounts.find(a => a.id === selectedAccountId) || null
  }, [mockAccounts, selectedAccountId])

  const childrenOf = (parentId: string | null) =>
    mockAccounts.filter(a => a.parentId === parentId && (!searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase())))

  const rootAccounts = childrenOf(null)

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const parentEndpoint = newParent && newParent !== 'root' 
        ? `/api/v1/accounts/${newParent}/sub_accounts`
        : `/api/v1/accounts/1/sub_accounts`

      await canvasFetch(parentEndpoint, {
        method: 'POST',
        body: { account: { name: newName } }
      })
      
      showToast({
        title: 'Sub-account Created',
        message: `Successfully created sub-account "${newName}"`,
        type: 'success'
      })
      setNewName('')
      setShowCreate(false)
      refetch()
    } catch (err: any) {
      console.error(err)
      showToast({
        title: 'Failed to create sub-account',
        message: err.message || 'An error occurred while creating the sub-account.',
        type: 'error'
      })
    }
  }

  const handleRename = async () => {
    if (!editingAccount || !editingAccount.name.trim()) return
    try {
      await canvasFetch(`/api/v1/accounts/${editingAccount.id}`, {
        method: 'PUT',
        body: { account: { name: editingAccount.name } }
      })
      showToast({
        title: 'Sub-account Renamed',
        message: `Successfully renamed to "${editingAccount.name}"`,
        type: 'success'
      })
      setEditingAccount(null)
      refetch()
    } catch (err: any) {
      console.error(err)
      showToast({
        title: 'Failed to rename account',
        message: err.message || 'An error occurred while renaming the account.',
        type: 'error'
      })
    }
  }

  const formatStorage = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`

  const renderTree = (accounts: SubAccount[], depth = 0): React.ReactNode => {
    return accounts.map(account => {
      const hasChildren = mockAccounts.some(a => a.parentId === account.id)
      const isExpanded = expanded.has(account.id)
      const isSelected = selectedAccountId === account.id

      return (
        <React.Fragment key={account.id}>
          <div
            className={clsx(
              "cx-admin-row",
              isSelected && "cx-admin-row--selected"
            )}
            style={{ paddingLeft: 16 + depth * 24 }}
            onClick={() => setSelectedAccountId(account.id)}
          >
            <div className="cx-admin-row__main" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              {hasChildren ? (
                <button 
                  className="cx-btn cx-btn--ghost cx-btn--sm" 
                  onClick={(e) => toggleExpand(account.id, e)} 
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  style={{ padding: 4 }}
                >
                  {isExpanded ? <ChevronDownSvg /> : <ChevronRightSvg />}
                </button>
              ) : <span style={{ width: 22 }} />}
              <BuildingSvg />
              {editingAccount?.id === account.id ? (
                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    className="cx-input"
                    style={{ fontSize: '0.875rem', padding: '2px 8px', maxWidth: 160 }}
                    value={editingAccount.name}
                    onChange={e => setEditingAccount({ ...editingAccount, name: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingAccount(null) }}
                    autoFocus
                  />
                  <button className="cx-btn cx-btn--primary cx-btn--sm" style={{ padding: '4px 8px' }} onClick={handleRename}>Save</button>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" style={{ padding: '4px 8px' }} onClick={() => setEditingAccount(null)}>Cancel</button>
                </div>
              ) : (
                <span style={{ fontWeight: 500 }}>{account.name}</span>
              )}
            </div>
            <span className="cx-admin-row__stat">{account.courseCount} courses</span>
            <span className="cx-admin-row__stat">{account.userCount} users</span>
            <span className="cx-admin-row__stat">{formatStorage(account.storageUsedMb)}</span>
            <div className="cx-admin-row__actions" onClick={e => e.stopPropagation()}>
              <button
                className="cx-btn cx-btn--ghost cx-btn--sm"
                aria-label="Edit"
                onClick={() => setEditingAccount({ id: account.id, name: account.name })}
                style={{ padding: 4 }}
              >
                <EditSvg />
              </button>
              {account.parentId && (
                <button 
                  className="cx-btn cx-btn--ghost cx-btn--sm" 
                  aria-label="Delete" 
                  onClick={async () => {
                    const confirmed = await showConfirm({
                      title: 'Delete Sub-account',
                      message: `Are you sure you want to delete the sub-account "${account.name}"? This action cannot be undone.`,
                      confirmLabel: 'Delete',
                      cancelLabel: 'Cancel',
                      type: 'danger'
                    })
                    if (confirmed) {
                      try {
                        await canvasFetch(`/api/v1/accounts/${account.parentId}/sub_accounts/${account.id}`, { method: 'DELETE' })
                        showToast({
                          title: 'Sub-account Deleted',
                          message: `Successfully deleted sub-account "${account.name}"`,
                          type: 'success'
                        })
                        if (selectedAccountId === account.id) {
                          setSelectedAccountId(null)
                        }
                        refetch()
                      } catch (e: any) {
                        console.error(e)
                        showToast({
                          title: 'Failed to delete sub-account',
                          message: e.message || 'An error occurred while deleting the sub-account.',
                          type: 'error'
                        })
                      }
                    }
                  }}
                  style={{ padding: 4 }}
                >
                  <TrashSvg />
                </button>
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
      <style>{`
        .cx-subaccounts-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cx-subaccounts-list {
          flex: 1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 0;
        }

        .cx-details-drawer {
          width: 400px;
          background: var(--cx-bg-surface, #ffffff);
          border: 1px solid var(--cx-border-subtle, #e2e8f0);
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          padding: 24px;
          position: sticky;
          top: 24px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          animation: cxSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 20px;
          z-index: 10;
        }

        @keyframes cxSlideIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .cx-admin-header {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          background: var(--cx-bg-hover, #f8fafc);
          border-bottom: 2px solid var(--cx-border-subtle, #e2e8f0);
          font-weight: 600;
          font-size: 0.8125rem;
          color: var(--cx-text-secondary, #64748b);
          border-radius: var(--radius-lg, 12px) var(--radius-lg, 12px) 0 0;
        }

        .cx-admin-header__item {
          text-align: left;
        }

        .cx-admin-row {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid var(--cx-border-subtle, #e2e8f0);
          background: var(--cx-bg-surface, #ffffff);
          transition: all 0.2s ease;
          cursor: pointer;
          user-select: none;
        }

        .cx-admin-row:hover {
          background: var(--cx-bg-hover, #f8fafc);
        }

        .cx-admin-row--selected {
          background: var(--cx-color-primary-subtle, #e0e7ff) !important;
          border-left: 4px solid var(--cx-color-primary, #6283fc);
          padding-left: 12px !important;
        }

        .cx-admin-row__main {
          font-size: 0.875rem;
          color: var(--cx-text-primary, #1e293b);
        }

        .cx-admin-row__stat {
          font-size: 0.8125rem;
          color: var(--cx-text-secondary, #64748b);
          width: 100px;
          flex-shrink: 0;
        }

        .cx-admin-row__actions {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 70px;
          justify-content: flex-end;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .cx-admin-row:hover .cx-admin-row__actions {
          opacity: 1;
        }

        .cx-telemetry-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .cx-telemetry-card {
          background: var(--cx-bg-hover, #f8fafc);
          border: 1px solid var(--cx-border-subtle, #e2e8f0);
          border-radius: var(--radius-md, 8px);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .cx-telemetry-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .cx-telemetry-card-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
        }

        .cx-telemetry-card__value {
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--cx-text-primary, #1e293b);
          line-height: 1;
        }

        .cx-telemetry-card__label {
          font-size: 0.75rem;
          color: var(--cx-text-secondary, #64748b);
          font-weight: 500;
        }

        .cx-storage-section {
          background: var(--cx-bg-hover, #f8fafc);
          border: 1px solid var(--cx-border-subtle, #e2e8f0);
          border-radius: var(--radius-lg, 12px);
          padding: 16px;
        }

        .cx-storage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .cx-storage-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--cx-text-primary, #1e293b);
        }

        .cx-storage-usage {
          font-size: 0.8125rem;
          color: var(--cx-text-secondary, #64748b);
          font-weight: 600;
        }

        .cx-storage-progress {
          height: 6px;
          background: var(--cx-border-subtle, #e2e8f0);
          border-radius: var(--radius-full, 9999px);
          overflow: hidden;
          margin-bottom: 8px;
        }

        .cx-storage-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--cx-color-primary, #6283fc) 0%, #818cf8 100%);
          border-radius: var(--radius-full, 9999px);
          transition: width 0.5s ease;
        }

        .cx-storage-meta {
          font-size: 0.75rem;
          color: var(--cx-text-tertiary, #94a3b8);
        }

        .cx-drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .cx-drawer-close {
          background: none;
          border: none;
          color: var(--cx-text-tertiary, #94a3b8);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-full, 9999px);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .cx-drawer-close:hover {
          background: var(--cx-bg-hover, #f8fafc);
          color: var(--cx-text-primary, #1e293b);
        }

        .cx-drawer-profile {
          display: flex;
          gap: 12px;
          align-items: center;
          min-width: 0;
        }

        .cx-drawer-badge {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--cx-color-primary, #6283fc) 0%, #4f46e5 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(99, 131, 252, 0.2);
          flex-shrink: 0;
        }

        .cx-drawer-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .cx-drawer-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--cx-text-primary, #1e293b);
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin: 0;
        }

        .cx-drawer-subtitle {
          font-size: 0.75rem;
          color: var(--cx-text-secondary, #64748b);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cx-drawer-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cx-drawer-section-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
          color: var(--cx-text-tertiary, #94a3b8);
          margin: 0 0 10px 0;
        }
      `}</style>

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
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="cx-form-group" style={{ flex: 1, minWidth: 200 }}>
              <label className="cx-form-label" htmlFor="sub-name">Account Name</label>
              <input id="sub-name" className="cx-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. West District" />
            </div>
            <div className="cx-form-group" style={{ minWidth: 200 }}>
              <label className="cx-form-label" htmlFor="sub-parent">Parent Account</label>
              <select id="sub-parent" className="cx-select" value={newParent} onChange={e => setNewParent(e.target.value)} style={{ width: '100%' }}>
                <option value="root">Root Account</option>
                {mockAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleCreate} disabled={!newName.trim()}>Create</button>
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="cx-subaccounts-layout">
        <div className="cx-subaccounts-list">
          <div className="cx-toolbar" style={{ marginBottom: 16 }}>
            <div className="cx-search">
              <SearchSvg />
              <input type="search" className="cx-search__input" placeholder="Search accounts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="cx-table-container" style={{ margin: 0 }}>
            <div className="cx-admin-header">
              <span className="cx-admin-header__item" style={{ flex: 1 }}>Account</span>
              <span className="cx-admin-header__item" style={{ width: 100 }}>Courses</span>
              <span className="cx-admin-header__item" style={{ width: 100 }}>Users</span>
              <span className="cx-admin-header__item" style={{ width: 100 }}>Storage</span>
              <span className="cx-admin-header__item" style={{ width: 70, textAlign: 'right' }}>Actions</span>
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

        {selectedAccount && (
          <div className="cx-details-drawer">
            <div className="cx-drawer-header">
              <div className="cx-drawer-profile">
                <div className="cx-drawer-badge">
                  <BuildingSvg />
                </div>
                <div className="cx-drawer-info">
                  <h2 className="cx-drawer-title">{selectedAccount.name}</h2>
                  <span className="cx-drawer-subtitle">
                    ID: {selectedAccount.id} • {selectedAccount.parentId ? `Sub-account of ID ${selectedAccount.parentId}` : 'Root Account'}
                  </span>
                </div>
              </div>
              <button className="cx-drawer-close" onClick={() => setSelectedAccountId(null)} aria-label="Close details">
                <XSvg />
              </button>
            </div>

            <hr className="cx-divider" style={{ margin: 0 }} />

            <div>
              <h3 className="cx-drawer-section-title">Telemetry Stats</h3>
              <div className="cx-telemetry-grid">
                <div className="cx-telemetry-card">
                  <span className="cx-telemetry-card-accent" style={{ background: '#6283fc' }} />
                  <span className="cx-telemetry-card__value">{selectedAccount.courseCount}</span>
                  <span className="cx-telemetry-card__label">Active Courses</span>
                </div>
                <div className="cx-telemetry-card">
                  <span className="cx-telemetry-card-accent" style={{ background: '#10b981' }} />
                  <span className="cx-telemetry-card__value">{selectedAccount.userCount}</span>
                  <span className="cx-telemetry-card__label">Total Users</span>
                </div>
                <div className="cx-telemetry-card">
                  <span className="cx-telemetry-card-accent" style={{ background: '#a855f7' }} />
                  <span className="cx-telemetry-card__value">{selectedAccount.enrollmentCount || (selectedAccount.userCount * 2)}</span>
                  <span className="cx-telemetry-card__label">Enrollments</span>
                </div>
                <div className="cx-telemetry-card">
                  <span className="cx-telemetry-card-accent" style={{ background: '#f59e0b' }} />
                  <span className="cx-telemetry-card__value">Active</span>
                  <span className="cx-telemetry-card__label">Status</span>
                </div>
              </div>
            </div>

            <div className="cx-storage-section">
              <div className="cx-storage-header">
                <span className="cx-storage-title">Storage Allocation</span>
                <span className="cx-storage-usage">{formatStorage(selectedAccount.storageUsedMb)} used</span>
              </div>
              <div className="cx-storage-progress">
                <div 
                  className="cx-storage-fill" 
                  style={{ width: `${Math.min(100, Math.max(2, (selectedAccount.storageUsedMb / selectedAccount.storageQuotaMb) * 100))}%` }} 
                />
              </div>
              <div className="cx-storage-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Limit: {formatStorage(selectedAccount.storageQuotaMb)}</span>
                <span>{((selectedAccount.storageUsedMb / selectedAccount.storageQuotaMb) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <hr className="cx-divider" style={{ margin: 0 }} />

            <div>
              <h3 className="cx-drawer-section-title">Quick Actions</h3>
              <div className="cx-drawer-actions">
                <button 
                  className="cx-btn cx-btn--primary cx-btn--sm"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => {
                    setNewParent(selectedAccount.id);
                    setShowCreate(true);
                    const el = document.getElementById('sub-name');
                    if (el) el.focus();
                  }}
                >
                  <PlusSvg /> Add Sub-Account Under This
                </button>
                <button 
                  className="cx-btn cx-btn--secondary cx-btn--sm"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => setEditingAccount({ id: selectedAccount.id, name: selectedAccount.name })}
                >
                  <EditSvg /> Rename Account
                </button>
                <a 
                  className="cx-btn cx-btn--ghost cx-btn--sm"
                  style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}
                  href={`/admin/courses?account_id=${selectedAccount.id}`}
                >
                  <BuildingSvg /> View All Courses
                </a>
                {selectedAccount.parentId && (
                  <button 
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--cx-color-danger, #ef4444)' }}
                    onClick={async () => {
                      const confirmed = await showConfirm({
                        title: 'Delete Sub-account',
                        message: `Are you sure you want to delete "${selectedAccount.name}"? This action cannot be undone.`,
                        confirmLabel: 'Delete',
                        cancelLabel: 'Cancel',
                        type: 'danger'
                      })
                      if (confirmed) {
                        try {
                          await canvasFetch(`/api/v1/accounts/${selectedAccount.parentId}/sub_accounts/${selectedAccount.id}`, { method: 'DELETE' })
                          showToast({
                            title: 'Sub-account Deleted',
                            message: `Successfully deleted sub-account "${selectedAccount.name}"`,
                            type: 'success'
                          })
                          setSelectedAccountId(null)
                          refetch()
                        } catch (e: any) {
                          console.error(e)
                          showToast({
                            title: 'Failed to delete sub-account',
                            message: e.message || 'An error occurred while deleting the sub-account.',
                            type: 'error'
                          })
                        }
                      }
                    }}
                  >
                    <TrashSvg /> Delete Account
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
