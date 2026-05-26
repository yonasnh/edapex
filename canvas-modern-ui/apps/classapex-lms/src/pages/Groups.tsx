import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import GroupCard from '../components/GroupCard';

interface GroupData {
  id: string;
  name: string;
  description?: string;
  course?: { id: string; name: string; color?: string };
  memberCount: number;
  maxMembers?: number;
  isJoined?: boolean;
  isPublic?: boolean;
  role?: 'member' | 'leader' | 'admin';
  lastActivity?: string;
  upcomingEvents?: number;
  pendingTasks?: number;
  unreadMessages?: number;
  avatar?: string;
  tags?: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function GroupSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 16v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"/><circle cx="8" cy="6" r="3"/><path d="M18 16v-1a3 3 0 00-2-2.87"/><path d="M13 3.13a3 3 0 010 5.75"/></svg>; }
function UserCheckSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 16v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"/><circle cx="8" cy="6" r="3"/><path d="M15 8l2 2 3-4"/></svg>; }
function MessageSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10a7 7 0 1112.6 4.2L17 17l-2.8-1.4A7 7 0 012 10z"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }

import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';

function GroupDetail({ groupId, onBack }: { groupId: string, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'members' | 'files' | 'conferences'>('members');

  const { data: group } = useCanvasQuery<any>(`/api/v1/groups/${groupId}`);
  const { data: members } = useCanvasQuery<any[]>(`/api/v1/groups/${groupId}/users`);
  const { data: files } = useCanvasQuery<any[]>(`/api/v1/groups/${groupId}/files`);
  const { data: conferences } = useCanvasQuery<any[]>(`/api/v1/groups/${groupId}/conferences`);

  if (!group) return <div className="cx-loading"><div className="cx-loading__spinner" /></div>;

  return (
    <div className="cx-page" style={{ paddingTop: 0 }}>
      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Groups</button>
      
      <div className="cx-page__header" style={{ paddingTop: 0, paddingBottom: 16, borderBottom: '1px solid var(--cx-border-subtle)', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.5rem', color: 'var(--cx-text-primary)' }}>{group.name}</h2>
          {group.description && <p style={{ marginTop: 8, color: 'var(--cx-text-secondary)' }}>{group.description}</p>}
        </div>
      </div>

      <div className="cx-toolbar" style={{ marginBottom: 20 }}>
        <div className="cx-calendar-views" style={{ display: 'flex', gap: 8 }}>
          <button className={clsx('cx-tab', activeTab === 'members' && 'cx-tab--active')} onClick={() => setActiveTab('members')}>Members</button>
          <button className={clsx('cx-tab', activeTab === 'files' && 'cx-tab--active')} onClick={() => setActiveTab('files')}>Files</button>
          <button className={clsx('cx-tab', activeTab === 'conferences' && 'cx-tab--active')} onClick={() => setActiveTab('conferences')}>Conferences</button>
        </div>
      </div>

      {activeTab === 'members' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {members?.map(m => (
            <div key={m.id} className="cx-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cx-bg-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--cx-text-secondary)' }}>
                {m.short_name?.charAt(0) || 'U'}
              </div>
              <div style={{ fontWeight: 500, color: 'var(--cx-text-primary)', fontSize: '0.875rem' }}>{m.name}</div>
            </div>
          ))}
          {!members?.length && <p style={{ color: 'var(--cx-text-tertiary)' }}>No members found.</p>}
        </div>
      )}

      {activeTab === 'files' && (
        <div className="cx-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--cx-bg-surface-raised)' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Filename</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Size</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--cx-text-secondary)', borderBottom: '1px solid var(--cx-border-subtle)' }}>Modified</th>
              </tr>
            </thead>
            <tbody>
              {files?.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--cx-text-primary)' }}>
                    <a href={f.url} target="_blank" rel="noreferrer" style={{ color: 'var(--cx-color-primary)', textDecoration: 'none', fontWeight: 500 }}>{f.display_name}</a>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--cx-text-secondary)' }}>{Math.round(f.size / 1024)} KB</td>
                  <td style={{ padding: '12px 16px', color: 'var(--cx-text-secondary)' }}>{new Date(f.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {!files?.length && (
                <tr>
                  <td colSpan={3} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--cx-text-tertiary)' }}>No files shared in this group.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'conferences' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
             <button className="cx-btn cx-btn--primary cx-btn--sm"><PlusSvg /> New Conference</button>
          </div>
          {conferences?.map(c => (
            <div key={c.id} className="cx-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--cx-text-primary)', marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>
                  {c.description} • {c.conference_type}
                </div>
              </div>
              <a href={c.join_url} target="_blank" rel="noreferrer" className="cx-btn cx-btn--secondary cx-btn--sm">Join (WebRTC)</a>
            </div>
          ))}
          {!conferences?.length && (
             <div className="cx-empty" style={{ padding: 48, background: 'var(--cx-bg-surface-raised)', borderRadius: 12 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📹</div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--cx-text-primary)', marginBottom: 4 }}>No Active Conferences</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>Start a BigBlueButton or Zoom conference for your group.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

const GroupsPage: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJoined, setFilterJoined] = useState<'all' | 'joined' | 'available'>('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data: groupsData, refetch } = useCanvasQuery<any[]>('/api/v1/users/self/groups', { include: ['users'] } as any)
  const { showToast } = useNotification()
  
  const groups = useMemo<GroupData[]>(() => {
    if (!Array.isArray(groupsData)) return [];
    return groupsData.map(g => ({
      id: String(g.id),
      name: g.name,
      description: g.description,
      course: g.context_type === 'Course' ? { id: String(g.course_id), name: `Course ${g.course_id}` } : undefined,
      memberCount: g.users_count || 0,
      maxMembers: g.max_membership || undefined,
      isJoined: true, // We only fetch groups the user is part of right now
      role: g.role === 'leader' ? 'leader' : 'member',
      isPublic: g.is_public,
      lastActivity: undefined, // Canvas doesn't return this by default
      upcomingEvents: 0,
      pendingTasks: 0,
      unreadMessages: 0,
      tags: [],
    }))
  }, [groupsData]);

  const filteredGroups = useMemo(() => {
    let filtered = [...groups];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
    }
    if (filterJoined === 'joined') filtered = filtered.filter(g => g.isJoined);
    if (filterJoined === 'available') filtered = filtered.filter(g => !g.isJoined);
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'members': return b.memberCount - a.memberCount;
        case 'activity': return new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
        default: return a.name.localeCompare(b.name);
      }
    });
    return filtered;
  }, [searchTerm, filterJoined, sortBy]);

  const totalPages = Math.ceil(filteredGroups.length / pageSize);
  const paginatedGroups = filteredGroups.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    total: groups.length,
    joined: groups.filter(g => g.isJoined).length,
    messages: groups.reduce((s, g) => s + (g.unreadMessages || 0), 0),
  }), [groups]);

  const handleClearFilters = () => { setSearchTerm(''); setFilterJoined('all'); setPage(1); };

  const handleJoin = async (group: GroupData) => {
    try {
      await canvasFetch(`/api/v1/groups/${group.id}/memberships`, { method: 'POST' });
      showToast({ title: 'Joined group', type: 'success' });
      await refetch();
    } catch {
      showToast({ title: 'Failed to join group', type: 'error' });
    }
  };

  const handleLeave = async (group: GroupData) => {
    try {
      await canvasFetch(`/api/v1/groups/${group.id}/users/self`, { method: 'DELETE' });
      showToast({ title: 'Left group', type: 'success' });
      await refetch();
    } catch {
      showToast({ title: 'Failed to leave group', type: 'error' });
    }
  };

  if (selectedGroupId) {
    return <GroupDetail groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ justifyContent: 'flex-end', paddingTop: 0 }}>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => {}}><PlusSvg /> Create Group</button>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Groups', value: stats.total, icon: <GroupSvg /> },
          { label: 'Joined', value: stats.joined, icon: <UserCheckSvg /> },
          { label: 'Unread Messages', value: stats.messages, icon: <MessageSvg />, trend: stats.messages > 0 ? 'increase' as const : 'neutral' as const },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon">{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cx-toolbar">
        <div className="cx-search">
          <SearchSvg />
          <input type="search" className="cx-search__input" placeholder="Search groups..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="cx-select" value={filterJoined} onChange={e => setFilterJoined(e.target.value as any)}>
          <option value="all">All Groups</option>
          <option value="joined">My Groups</option>
          <option value="available">Available</option>
        </select>
        <select className="cx-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
          <option value="name">Name</option>
          <option value="members">Most Members</option>
          <option value="activity">Recent Activity</option>
        </select>
      </div>

      {paginatedGroups.length === 0 ? (
        <div className="cx-empty">
          <GroupSvg />
          <h3>No groups found</h3>
          <p>Try adjusting your search or filters.</p>
          <button className="cx-btn cx-btn--secondary" onClick={handleClearFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className="cx-group-card-grid">
          {paginatedGroups.map(group => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              description={group.description}
              course={group.course}
              memberCount={group.memberCount}
              maxMembers={group.maxMembers}
              isJoined={group.isJoined}
              isPublic={group.isPublic}
              role={group.role}
              lastActivity={group.lastActivity}
              upcomingEvents={group.upcomingEvents}
              pendingTasks={group.pendingTasks}
              unreadMessages={group.unreadMessages}
              tags={group.tags}
              onClick={() => setSelectedGroupId(group.id)}
              onJoin={() => handleJoin(group)}
              onLeave={() => handleLeave(group)}
              onManage={() => setSelectedGroupId(group.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="cx-pagination" style={{ marginTop: 16 }}>
          <span className="cx-pagination__info">Page {page} of {totalPages}</span>
          <div className="cx-pagination__controls">
            <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3L5 7l4 4"/></svg>
            </button>
            <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
