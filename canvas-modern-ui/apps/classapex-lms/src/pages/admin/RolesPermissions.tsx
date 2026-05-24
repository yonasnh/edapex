import React, { useState } from 'react';
import clsx from 'clsx';
import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery';
import { useNotification } from '../../hooks/useNotification';

function ShieldSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1l7 3v5c0 4.5-3.5 7.5-7 8-3.5-.5-7-3.5-7-8V4l7-3z"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8l3 3 5-5"/></svg>; }
function XSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>; }

const DEFAULT_PERMISSIONS = [
  { id: 'manage_courses', label: 'Manage Courses', category: 'Course Management' },
  { id: 'manage_users', label: 'Manage Users', category: 'User Management' },
  { id: 'manage_grades', label: 'Manage Grades', category: 'Course Management' },
  { id: 'view_statistics', label: 'View Analytics', category: 'Analytics' },
  { id: 'manage_feature_flags', label: 'Manage Feature Flags', category: 'System Configuration' }
];

export default function AdminRolesPermissionsPage() {
  const { showToast } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'account' | 'course'>('account');
  const [selectedRole, setSelectedRole] = useState<any | null>(null);

  const { data: roles, refetch } = useCanvasQuery<any[]>(
    '/api/v1/accounts/1/roles',
    { state: ['active', 'inactive'], show_inherited: true } as any
  );

  const filteredRoles = (roles || []).filter(r => 
    (activeTab === 'account' ? r.base_role_type === 'AccountMembership' : r.base_role_type !== 'AccountMembership') &&
    r.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePermission = async (permId: string, enabled: boolean) => {
    if (!selectedRole) return;
    try {
      await canvasFetch(`/api/v1/accounts/1/roles/${selectedRole.id}`, {
        method: 'PUT',
        body: {
          permissions: {
            [permId]: { enabled: !enabled }
          }
        }
      });
      showToast({ title: 'Permission Updated', message: 'The role has been updated.', type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Update Failed', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Roles & Permissions</h1>
          <p className="cx-page__subtitle">Define and manage what users can do in the system based on their role.</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => showToast({ title: 'Notice', message: 'Role creation is managed via API currently.', type: 'info' })}>
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
              filteredRoles.map(role => (
                <button
                  key={role.id}
                  className={clsx('cx-btn cx-btn--ghost', selectedRole?.id === role.id ? 'cx-btn--active' : '')}
                  style={{ width: '100%', justifyContent: 'flex-start', background: selectedRole?.id === role.id ? 'var(--cx-bg-hover)' : 'transparent' }}
                  onClick={() => setSelectedRole(role)}
                >
                  <ShieldSvg />
                  <span style={{ marginLeft: 8 }}>{role.label}</span>
                  {role.workflow_state === 'inactive' && <span className="cx-badge cx-badge--danger" style={{ marginLeft: 'auto', fontSize: '0.625rem' }}>Inactive</span>}
                </button>
              ))
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
                {Object.entries(
                  DEFAULT_PERMISSIONS.reduce((acc, p) => {
                    if (!acc[p.category]) acc[p.category] = [];
                    acc[p.category].push(p);
                    return acc;
                  }, {} as Record<string, typeof DEFAULT_PERMISSIONS>)
                ).map(([category, perms]) => (
                  <div key={category}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)', borderBottom: '1px solid var(--cx-border-subtle)', paddingBottom: 8, marginBottom: 12 }}>{category}</h3>
                    <div className="cx-table-container">
                      <table className="cx-table" style={{ margin: 0 }}>
                        <tbody>
                          {perms.map(p => {
                            const isEnabled = selectedRole.permissions && selectedRole.permissions[p.id] && selectedRole.permissions[p.id].enabled;
                            return (
                              <tr key={p.id}>
                                <td style={{ width: '50%' }}>{p.label}</td>
                                <td style={{ textAlign: 'right' }}>
                                  <label className="cx-toggle">
                                    <input 
                                      type="checkbox" 
                                      checked={!!isEnabled} 
                                      onChange={() => togglePermission(p.id, !!isEnabled)} 
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
