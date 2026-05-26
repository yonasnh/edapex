/**
 * StorageQuotas — ClassApex LMS Admin
 * =====================================
 * Canvas REST API integration:
 *   GET  /api/v1/accounts/:accountId
 *   PUT  /api/v1/accounts/:accountId
 *
 * Manage default storage quotas for courses, users, and groups.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

interface Account {
  id: number
  name: string
  default_storage_quota_mb?: number
  default_user_storage_quota_mb?: number
  default_group_storage_quota_mb?: number
}

export default function StorageQuotasPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const resolvedAccountId = accountId || '1'
  const { showToast } = useNotification()

  const { data: account, isLoading, refetch } = useCanvasQuery<Account>(
    `/api/v1/accounts/${resolvedAccountId}`
  )

  const [courseQuota, setCourseQuota] = useState('')
  const [userQuota, setUserQuota] = useState('')
  const [groupQuota, setGroupQuota] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (account) {
      setCourseQuota(account.default_storage_quota_mb?.toString() || '')
      setUserQuota(account.default_user_storage_quota_mb?.toString() || '')
      setGroupQuota(account.default_group_storage_quota_mb?.toString() || '')
    }
  }, [account])

  const handleSave = async () => {
    setSaving(true)
    try {
      const body: Record<string, any> = {}
      if (courseQuota) body.default_storage_quota_mb = Number(courseQuota)
      if (userQuota) body.default_user_storage_quota_mb = Number(userQuota)
      if (groupQuota) body.default_group_storage_quota_mb = Number(groupQuota)

      await canvasFetch(`/api/v1/accounts/${resolvedAccountId}`, {
        method: 'PUT',
        body: { account: body },
      })
      showToast({ title: 'Saved', message: 'Storage quotas updated successfully.', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Save Failed', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="cx-page">
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', marginBottom: 20 }}>Storage Quotas</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="cx-skeleton" style={{ height: 64, borderRadius: 10 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', flex: 1 }}>Storage Quotas</h2>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', marginBottom: 20 }}>
        Configure default storage limits for {account?.name || 'this account'}. Values are in megabytes (MB).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>
            Course Default Quota (MB)
          </label>
          <input
            type="number"
            className="cx-input"
            value={courseQuota}
            onChange={e => setCourseQuota(e.target.value)}
            placeholder="e.g. 512"
            min={0}
            data-testid="course-quota"
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
            Default file storage limit per course
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>
            User Default Quota (MB)
          </label>
          <input
            type="number"
            className="cx-input"
            value={userQuota}
            onChange={e => setUserQuota(e.target.value)}
            placeholder="e.g. 1024"
            min={0}
            data-testid="user-quota"
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
            Default file storage limit per user
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>
            Group Default Quota (MB)
          </label>
          <input
            type="number"
            className="cx-input"
            value={groupQuota}
            onChange={e => setGroupQuota(e.target.value)}
            placeholder="e.g. 256"
            min={0}
            data-testid="group-quota"
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
            Default file storage limit per group
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            className="cx-btn cx-btn--primary"
            onClick={handleSave}
            disabled={saving}
            data-testid="save-quotas"
          >
            {saving ? 'Saving…' : 'Save Quotas'}
          </button>
          <button
            className="cx-btn cx-btn--secondary"
            onClick={() => {
              setCourseQuota(account?.default_storage_quota_mb?.toString() || '')
              setUserQuota(account?.default_user_storage_quota_mb?.toString() || '')
              setGroupQuota(account?.default_group_storage_quota_mb?.toString() || '')
            }}
            disabled={saving}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
