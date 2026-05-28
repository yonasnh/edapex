import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery';
import { useNotification } from '../../hooks/useNotification';

function ShieldSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1l7 3v5c0 4.5-3.5 7.5-7 8-3.5-.5-7-3.5-7-8V4l7-3z"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function TrashSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12"/><path d="M5.5 4v9a1 1 0 001 1h3a1 1 0 001-1V4"/><path d="M6.5 4V2.5a1 1 0 011-1h1a1 1 0 011 1V4"/></svg>; }

function inferPermissionCategory(key: string): string {
  if (key.startsWith('manage_')) return 'Management';
  if (key.startsWith('view_')) return 'Viewing';
  if (key.startsWith('create_')) return 'Creation';
  if (key.startsWith('delete_')) return 'Deletion';
  if (key.startsWith('edit_')) return 'Editing';
  if (key.startsWith('read_')) return 'Reading';
  if (key.startsWith('post_')) return 'Posting';
  if (key.startsWith('moderate_')) return 'Moderation';
  if (key.startsWith('send_')) return 'Communication';
  if (key.startsWith('add_')) return 'Addition';
  if (key.startsWith('remove_')) return 'Removal';
  if (key.startsWith('update_')) return 'Updating';
  if (key.startsWith('generate_')) return 'Generation';
  if (key.startsWith('import_')) return 'Import';
  if (key.startsWith('export_')) return 'Export';
  if (key.startsWith('change_')) return 'Changes';
  if (key.startsWith('assign_')) return 'Assignment';
  if (key.startsWith('grade_')) return 'Grading';
  if (key.startsWith('submit_')) return 'Submission';
  if (key.startsWith('share_')) return 'Sharing';
  if (key.startsWith('publish_')) return 'Publishing';
  if (key.startsWith('unpublish_')) return 'Unpublishing';
  if (key.startsWith('copy_')) return 'Copying';
  if (key.startsWith('move_')) return 'Moving';
  if (key.startsWith('reorder_')) return 'Reordering';
  if (key.startsWith('attach_')) return 'Attachment';
  if (key.startsWith('download_')) return 'Downloading';
  if (key.startsWith('upload_')) return 'Uploading';
  if (key.startsWith('search_')) return 'Search';
  if (key.startsWith('filter_')) return 'Filtering';
  if (key.startsWith('configure_')) return 'Configuration';
  if (key.startsWith('custom_')) return 'Customization';
  if (key.startsWith('select_')) return 'Selection';
  if (key.startsWith('set_')) return 'Settings';
  if (key.startsWith('sync_')) return 'Sync';
  if (key.startsWith('access_')) return 'Access';
  if (key.startsWith('use_')) return 'Usage';
  return 'Other';
}

function formatPermissionLabel(key: string): string {
  return key
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function AdminRolesPermissionsPage() {
  const { showToast, showConfirm } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'account' | 'course'>('account');
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    base_role_type: 'StudentEnrollment',
  });
  const [newRolePermissions, setNewRolePermissions] = useState<Record<string, boolean>>({});

  const { data: roles, refetch } = useCanvasQuery<any[]>(
    '/api/v1/accounts/1/roles',
    { state: ['active', 'inactive'], show_inherited: true } as any
  );

  const { data: allPermissions } = useCanvasQuery<any>(
    '/api/v1/accounts/1/permissions',
    {} as any
  );

  const filteredRoles = (roles || []).filter(r => 
    (activeTab === 'account' ? r.base_role_type === 'AccountMembership' : r.base_role_type !== 'AccountMembership') &&
    r.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = useMemo(() => {
    const perms = selectedRole?.permissions || {};
    const groups: Record<string, Array<[string, any]>> = {};
    Object.entries(perms).forEach(([key, value]) => {
      const category = inferPermissionCategory(key);
      if (!groups[category]) groups[category] = [];
      groups[category].push([key, value]);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [selectedRole]);

  const baseRoleOptions = [
    { value: 'StudentEnrollment', label: 'Student' },
    { value: 'TeacherEnrollment', label: 'Teacher' },
    { value: 'TaEnrollment', label: 'TA' },
    { value: 'ObserverEnrollment', label: 'Observer' },
    { value: 'DesignerEnrollment', label: 'Designer' },
  ];

  const availablePermissions = useMemo(() => {
    if (!allPermissions) return [];
    return Object.keys(allPermissions).sort();
  }, [allPermissions]);

  const handleCreateRole = async () => {
    if (!newRoleForm.name.trim()) {
      showToast({ title: 'Role name is required', type: 'error' });
      return;
    }
    setCreatingRole(true);
    try {
      const payload: any = {
        role: newRoleForm.name.trim(),
        base_role_type: newRoleForm.base_role_type,
      };
      if (Object.keys(newRolePermissions).length > 0) {
        payload.permissions = {};
        Object.entries(newRolePermissions).forEach(([key, enabled]) => {
          payload.permissions[key] = { enabled };
        });
      }
      await canvasFetch('/api/v1/accounts/1/roles', {
        method: 'POST',
        body: payload,
      });
      showToast({ title: 'Role created', type: 'success' });
      setShowCreateModal(false);
      setNewRoleForm({ name: '', base_role_type: 'StudentEnrollment' });
      setNewRolePermissions({});
      refetch();
    } catch (err: any) {
      showToast({ title: 'Failed to create role', message: err?.message || 'Please try again.', type: 'error' });
    } finally {
      setCreatingRole(false);
    }
  };

  const SYSTEM_ROLES = ['AccountAdmin', 'StudentEnrollment', 'TeacherEnrollment', 'TaEnrollment', 'ObserverEnrollment', 'DesignerEnrollment'];

  const handleDeleteRole = async (roleId: string | number) => {
    const confirmed = await showConfirm({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this custom role? This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await canvasFetch(`/api/v1/accounts/1/roles/${roleId}`, { method: 'DELETE' });
      showToast({ title: 'Role deleted', type: 'success' });
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }
      refetch();
    } catch (err: any) {
      showToast({ title: 'Failed to delete role', message: err?.message || 'Please try again.', type: 'error' });
    }
  };

  const togglePermission = async (permId: string, enabled: boolean) => {
    if (!selectedRole) return;
    setUpdatingPermission(permId);
    try {
      const formData = new FormData()
      formData.append(`permissions[${permId}][enabled]`, String(!enabled))
      await canvasFetch(`/api/v1/accounts/1/roles/${selectedRole.id}`, {
        method: 'PUT',
        body: formData
      });
      setSelectedRole((prev: any) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permId]: { ...prev.permissions?.[permId], enabled: !enabled }
        }
      }));
      showToast({ title: 'Permission Updated', message: 'The role has been updated.', type: 'success' });
      refetch();
    } catch (err: any) {
      console.error('Permission update failed:', err)
      const errType = err?.constructor?.name || typeof err
      const errMsg = err?.message || '(no message)'
      const errStatus = err?.status ?? '—'
      showToast({ title: 'Update Failed', message: `${errType} [${errStatus}]: ${errMsg}`, type: 'error' });
    } finally {
      setUpdatingPermission(null);
    }
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Roles & Permissions</h1>
          <p className="cx-page__subtitle">Define and manage what users can do in the system based on their role.</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowCreateModal(true)}>
          <PlusSvg /> Add Role
        </button>
      </div>

      <div className="cx-tabs" style={{ marginBottom: 24 }}>
        <button className={clsx('cx-tab', activeTab === 'account' && 'cx-tab--active')} onClick={() => { setActiveTab('account'); setSelectedRole(null); }}>Account Roles</button>
        <button className={clsx('cx-tab', activeTab === 'course' && 'cx-tab--active')} onClick={() => { setActiveTab('course'); setSelectedRole(null); }}>Course Roles</button>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div className="cx-section" style={{ flex: '0 0 320px', padding: 16 }}>
          <div className="cx-search" style={{ marginBottom: 16 }}>
            <SearchSvg />
            <input type="search" className="cx-search__input" placeholder="Search roles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filteredRoles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--cx-text-tertiary)' }}>No roles found</div>
            ) : (
              filteredRoles.map(role => {
                const isDeletable = role.base_role_type && !SYSTEM_ROLES.includes(role.role);
                return (
                  <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      className={clsx('cx-btn cx-btn--ghost', selectedRole?.id === role.id ? 'cx-btn--active' : '')}
                      style={{ flex: 1, justifyContent: 'flex-start', background: selectedRole?.id === role.id ? 'var(--cx-bg-hover)' : 'transparent' }}
                      onClick={() => setSelectedRole(role)}
                    >
                      <ShieldSvg />
                      <span style={{ marginLeft: 8 }}>{role.label}</span>
                      {role.workflow_state === 'inactive' && <span className="cx-badge cx-badge--danger" style={{ marginLeft: 'auto', fontSize: '0.625rem' }}>Inactive</span>}
                    </button>
                    {isDeletable && (
                      <button
                        className="cx-btn cx-btn--ghost"
                        style={{ padding: '6px 8px', color: 'var(--cx-color-danger)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.id);
                        }}
                        title="Delete role"
                      >
                        <TrashSvg />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="cx-section" style={{ flex: 1, padding: 24, minHeight: 400 }}>
          {!selectedRole ? (
            <div className="cx-empty" style={{ margin: 'auto', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <ShieldSvg />
              <h3>Select a Role</h3>
              <p>Choose a role from the sidebar to edit its permissions.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>{selectedRole.label}</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: '4px 0 0' }}>Base Type: {selectedRole.base_role_type}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {groupedPermissions.length === 0 ? (
                  <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>No permissions available for this role.</p>
                ) : (
                  groupedPermissions.map(([category, perms]) => (
                    <div key={category}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)', borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 8, marginBottom: 12 }}>{category}</h3>
                      <div className="cx-table-container">
                        <table className="cx-table" style={{ margin: 0 }}>
                          <tbody>
                            {perms.map(([key, value]) => {
                              const isEnabled = !!value?.enabled;
                              const isReadonly = !!value?.readonly;
                              return (
                                <tr key={key}>
                                  <td style={{ width: '50%' }}>{formatPermissionLabel(key)}</td>
                                  <td style={{ textAlign: 'right' }}>
                                    <label className="cx-toggle">
                                      <input 
                                        type="checkbox" 
                                        checked={isEnabled} 
                                        disabled={isReadonly || updatingPermission === key}
                                        onChange={() => togglePermission(key, isEnabled)} 
                                      />
                                      <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                                    </label>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">Create Custom Role</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Role Name *</label>
                <input type="text" className="cx-input" value={newRoleForm.name} onChange={e => setNewRoleForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%' }} placeholder="e.g. Lab Assistant" />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Base Role</label>
                <select className="cx-input" style={{ width: '100%' }} value={newRoleForm.base_role_type} onChange={e => setNewRoleForm(p => ({ ...p, base_role_type: e.target.value }))}>
                  {baseRoleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Permissions</label>
                {availablePermissions.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-tertiary)' }}>Loading permissions…</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxHeight: 300, overflow: 'auto', border: '1px solid var(--cx-border-subtle)', borderRadius: 8, padding: 12 }}>
                    {availablePermissions.map(perm => (
                      <label key={perm} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--cx-text-primary)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={!!newRolePermissions[perm]}
                          onChange={e => setNewRolePermissions(prev => ({ ...prev, [perm]: e.target.checked }))}
                          style={{ accentColor: 'var(--cx-color-primary)', width: 16, height: 16 }}
                        />
                        {formatPermissionLabel(perm)}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleCreateRole} disabled={creatingRole}>
                {creatingRole ? 'Creating…' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
