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

// We will fetch these from Canvas API instead
// const mockGroups = ...

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function GroupSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 16v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"/><circle cx="8" cy="6" r="3"/><path d="M18 16v-1a3 3 0 00-2-2.87"/><path d="M13 3.13a3 3 0 010 5.75"/></svg>; }
function UserCheckSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 16v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"/><circle cx="8" cy="6" r="3"/><path d="M15 8l2 2 3-4"/></svg>; }
function MessageSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10a7 7 0 1112.6 4.2L17 17l-2.8-1.4A7 7 0 012 10z"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }

import { useCanvasQuery } from '../hooks/useCanvasQuery';

const GroupsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJoined, setFilterJoined] = useState<'all' | 'joined' | 'available'>('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data: groupsData } = useCanvasQuery<any[]>('/api/v1/users/self/groups', { include: ['users'] } as any)
  
  const mockGroups = useMemo<GroupData[]>(() => {
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
    let filtered = [...mockGroups];
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
    total: mockGroups.length,
    joined: mockGroups.filter(g => g.isJoined).length,
    messages: mockGroups.reduce((s, g) => s + (g.unreadMessages || 0), 0),
  }), []);

  const handleClearFilters = () => { setSearchTerm(''); setFilterJoined('all'); setPage(1); };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Groups</h1>
          <p className="cx-page__subtitle">Collaborate with peers in study groups and project teams</p>
        </div>
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
              onClick={() => console.log('View group:', group.name)}
              onJoin={() => console.log('Join group:', group.name)}
              onLeave={() => console.log('Leave group:', group.name)}
              onManage={() => console.log('Manage group:', group.name)}
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
