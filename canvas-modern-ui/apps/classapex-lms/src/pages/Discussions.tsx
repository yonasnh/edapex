import React, { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import ReplyEditor from '../widgets/ReplyEditor';
import { MediaLibrary } from '../widgets/MediaLibrary';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: { id: string; name: string; avatar?: string; role?: 'student' | 'teacher' | 'ta' | 'admin' };
  course?: { id: string; name: string; color?: string };
  createdAt: string;
  lastReplyAt?: string;
  replyCount: number;
  viewCount: number;
  likeCount: number;
  isLiked?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  isResolved?: boolean;
  isUnread?: boolean;
  isSubscribed?: boolean;
  tags?: string[];
}

// We will fetch these from Canvas API instead
// const initialDiscussions = ...
// const mockCourses = ...

const SearchSvg = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>;
const PlusSvg = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>;
const ChatSvg = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10a8 8 0 1114.7 4.7L18 18l-3.3-1.3A8 8 0 012 10z"/></svg>;
const ReplySvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8l5-5v3c4 0 6 2 7 5-2-2-4-3-7-3v3L2 8z"/></svg>;
const HeartSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 12C3.5 9.5 1 7.3 1 5a3.5 3.5 0 016-2A3.5 3.5 0 0113 5c0 2.3-2.5 4.5-6 7z"/></svg>;
const EyeSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z"/><circle cx="7" cy="7" r="1.5"/></svg>;
const PinSvg = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0C4.5 0 3 1 2 2.5L4 5l-2 3 2 2 3-2 2.5 2C11 9 12 7.5 12 6"/></svg>;
const LockSvg = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3" y="5" width="6" height="5" rx="1"/><path d="M4 5V3a2 2 0 014 0v2"/></svg>;
const CheckSvg = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 6l3 3 4-5"/></svg>;
const XSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>;
const EditSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z"/></svg>;

function BellSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1.5A4.5 4.5 0 002.5 6c0 2.5-.8 4-1.5 5h12c-.7-1-1.5-2.5-1.5-5A4.5 4.5 0 007 1.5z"/><path d="M5.5 11a1.5 1.5 0 003 0"/></svg>; }
function BellOffSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 1.5l11 11M7 1.5A4.5 4.5 0 002.5 6c0 2.5-.8 4-1.5 5h12"/><path d="M5.5 11a1.5 1.5 0 003 0"/></svg>; }

import { useCanvasQuery } from '../hooks/useCanvasQuery';

const DiscussionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<any | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyToEntryId, setReplyToEntryId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editDiscussion, setEditDiscussion] = useState<any | null>(null);
  const [discussionForm, setDiscussionForm] = useState({ title: '', content: '', courseId: '', tags: '' });
  const [entriesRefetch, setEntriesRefetch] = useState(0)
  const [showPicker, setShowPicker] = useState(false);

  const activeCourseId = editDiscussion ? (editDiscussion.course?.id || filterCourse) : (discussionForm.courseId || filterCourse);

  const insertMediaIntoContent = (tag: string) => {
    const ta = document.getElementById('disc-content') as HTMLTextAreaElement;
    if (!ta) {
      setDiscussionForm(p => ({ ...p, content: p.content + tag }));
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = discussionForm.content.slice(0, start);
    const after = discussionForm.content.slice(end);
    setDiscussionForm(p => ({ ...p, content: `${before}${tag}${after}` }));
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + tag.length;
    }, 0);
  };

  const handleSelectMedia = (url: string, type: 'video' | 'audio' | 'image', title: string) => {
    let tag = '';
    if (type === 'video') {
      tag = `<p><video src="${url}" controls style="max-width: 100%; width: 100%; border-radius: 8px; box-shadow: var(--cx-shadow-sm);"></video></p>`;
    } else if (type === 'audio') {
      tag = `<p><audio src="${url}" controls style="max-width: 100%; width: 100%;"></audio></p>`;
    } else if (type === 'image') {
      tag = `<p><img src="${url}" alt="${title}" style="max-width: 100%; border-radius: 8px; box-shadow: var(--cx-shadow-sm);" /></p>`;
    }
    insertMediaIntoContent(tag);
    setShowPicker(false);
  };

  const handleInsertMediaUrl = () => {
    const url = prompt('Enter Media URL (video, audio, or image):', 'https://');
    if (!url) return;
    const lowerUrl = url.toLowerCase();
    let tag = '';
    if (lowerUrl.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/)) {
      tag = `<p><video src="${url}" controls style="max-width: 100%; width: 100%; border-radius: 8px; box-shadow: var(--cx-shadow-sm);"></video></p>`;
    } else if (lowerUrl.match(/\.(mp3|wav|ogg|aac|m4a|flac)$/)) {
      tag = `<p><audio src="${url}" controls style="max-width: 100%; width: 100%;"></audio></p>`;
    } else if (lowerUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      tag = `<p><img src="${url}" style="max-width: 100%; border-radius: 8px; box-shadow: var(--cx-shadow-sm);" /></p>`;
    } else {
      tag = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }
    insertMediaIntoContent(tag);
  };
  
  // Live Canvas API Queries
  const { data: coursesData } = useCanvasQuery<any[]>('/api/v1/users/self/courses', { enrollment_state: 'active' } as any)
  const courses = Array.isArray(coursesData) ? coursesData : []

  // Default to first course if none selected
  React.useEffect(() => {
    if (!filterCourse && courses.length > 0) {
      setFilterCourse(String(courses[0].id))
    }
  }, [courses, filterCourse])

  const { data: apiDiscussions, refetch } = useCanvasQuery<any[]>(
    filterCourse ? `/api/v1/courses/${filterCourse}/discussion_topics` : '',
    { per_page: 50, enabled: !!filterCourse } as any
  )

  // Live entries for selected discussion (threaded)
  const { data: apiEntries, refetch: refetchEntries } = useCanvasQuery<any[]>(
    selectedDiscussion && filterCourse
      ? `/api/v1/courses/${filterCourse}/discussion_topics/${selectedDiscussion.id}/entries`
      : '',
    { per_page: 50 } as any
  )
  
  const discussions = Array.isArray(apiDiscussions) ? apiDiscussions.map(d => ({
    id: String(d.id),
    title: d.title,
    content: d.message || '',
    author: { id: String(d.author?.id), name: d.author?.display_name || 'Unknown', role: undefined },
    course: courses.find(c => String(c.id) === filterCourse),
    createdAt: d.posted_at || d.created_at,
    lastReplyAt: d.last_reply_at,
    replyCount: d.discussion_subentry_count || 0,
    viewCount: 0,
    likeCount: 0,
    isPinned: d.pinned,
    isLocked: d.locked,
    isUnread: d.unread_count > 0,
    isSubscribed: d.subscribed,
    isResolved: false,
    tags: [] as string[],
  })) : []
  const openCreateModal = () => {
    setEditDiscussion(null);
    setDiscussionForm({ title: '', content: '', courseId: '', tags: '' });
    setShowCreateModal(true);
  };

  const openEditModal = (d: Discussion) => {
    setEditDiscussion(d);
    setDiscussionForm({ title: d.title, content: d.content, courseId: d.course?.id || '', tags: d.tags?.join(', ') || '' });
    setShowCreateModal(true);
  };

  const handleCreateDiscussion = async () => {
    if (!discussionForm.title.trim()) return;
    const courseId = editDiscussion ? (editDiscussion.course?.id || filterCourse) : discussionForm.courseId
    if (!courseId) return
    try {
      const formData = new URLSearchParams()
      formData.append('title', discussionForm.title)
      formData.append('message', discussionForm.content)

      const isEdit = !!editDiscussion
      const url = isEdit
        ? `/api/v1/courses/${courseId}/discussion_topics/${editDiscussion.id}`
        : `/api/v1/courses/${courseId}/discussion_topics`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setShowCreateModal(false)
      setEditDiscussion(null)
      refetch()
    } catch (err) {
      console.error(err)
      alert('Failed to save discussion.')
    }
  };

  const togglePin = useCallback(async (id: string, currentlyPinned: boolean) => {
    try {
      await fetch(`/api/v1/courses/${filterCourse}/discussion_topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `discussion_topic[pinned]=${!currentlyPinned}`,
      })
      refetch()
    } catch (err) {
      console.error('[Discussions] togglePin failed:', err)
    }
  }, [filterCourse, refetch])

  const toggleLock = useCallback(async (id: string, currentlyLocked: boolean) => {
    try {
      await fetch(`/api/v1/courses/${filterCourse}/discussion_topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `discussion_topic[locked]=${!currentlyLocked}`,
      })
      refetch()
    } catch (err) {
      console.error('[Discussions] toggleLock failed:', err)
    }
  }, [filterCourse, refetch])

  const toggleSubscribe = useCallback(async (id: string, currentlySubscribed: boolean) => {
    try {
      // Canvas uses PUT to subscribe, DELETE to unsubscribe
      await fetch(`/api/v1/courses/${filterCourse}/discussion_topics/${id}/subscribed`, {
        method: currentlySubscribed ? 'DELETE' : 'PUT',
      })
      refetch()
    } catch (err) {
      console.error('[Discussions] toggleSubscribe failed:', err)
    }
  }, [filterCourse, refetch])

  const filteredDiscussions = useMemo(() => {
    let filtered = [...discussions];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(d => d.title?.toLowerCase().includes(q) || d.content?.toLowerCase().includes(q));
    }
    if (filterCourse !== 'all') filtered = filtered.filter(d => d.course?.id === filterCourse);
    if (showUnreadOnly) filtered = filtered.filter(d => d.isUnread);
    const pinned = filtered.filter(d => d.isPinned);
    const unpinned = filtered.filter(d => !d.isPinned);
    unpinned.sort((a, b) => {
      const aDate = a.lastReplyAt || a.createdAt;
      const bDate = b.lastReplyAt || b.createdAt;
      switch (sortBy) {
        case 'replies': return b.replyCount - a.replyCount;
        case 'likes': return b.likeCount - a.likeCount;
        case 'views': return b.viewCount - a.viewCount;
        case 'title': return a.title.localeCompare(b.title);
        default: return new Date(bDate).getTime() - new Date(aDate).getTime();
      }
    });
    return [...pinned, ...unpinned];
  }, [searchTerm, filterCourse, showUnreadOnly, sortBy]);

  const totalPages = Math.ceil(filteredDiscussions.length / pageSize);
  const paginatedDiscussions = filteredDiscussions.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    total: discussions.length,
    unread: discussions.filter(d => d.isUnread).length,
    replies: discussions.reduce((s, d) => s + d.replyCount, 0),
  }), [discussions]);

  const handleClearFilters = () => { setSearchTerm(''); setShowUnreadOnly(false); setPage(1); };

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ justifyContent: 'flex-end', paddingTop: 0 }}>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={openCreateModal}><PlusSvg /> New Discussion</button>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Discussions', value: stats.total, icon: <ChatSvg /> },
          { label: 'Unread', value: stats.unread, icon: <EyeSvg />, trend: 'neutral' as const },
          { label: 'Total Replies', value: stats.replies, icon: <ReplySvg /> },
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
          <input type="search" className="cx-search__input" placeholder="Search discussions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="cx-select" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="" disabled>Select a Course</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="cx-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="replies">Most Replies</option>
          <option value="likes">Most Liked</option>
          <option value="views">Most Viewed</option>
          <option value="title">Title</option>
        </select>
        <label className="cx-toggle">
          <input type="checkbox" checked={showUnreadOnly} onChange={e => setShowUnreadOnly(e.target.checked)} />
          <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
          <span className="cx-toggle__label">Unread only</span>
        </label>
      </div>

      {paginatedDiscussions.length === 0 ? (
        <div className="cx-empty">
          <ChatSvg />
          <h3>No discussions found</h3>
          <p>Try adjusting your search terms or filters.</p>
          <button className="cx-btn cx-btn--secondary" onClick={handleClearFilters}>Clear Filters</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {paginatedDiscussions.map(discussion => (
            <div key={discussion.id} className="cx-discussion-card" onClick={() => setSelectedDiscussion(discussion)}>
              <div className="cx-discussion-card__header">
                <div className="cx-discussion-card__titles">
                  {discussion.isPinned && <span className="cx-discussion-card__pin" title="Pinned"><PinSvg /></span>}
                  {discussion.isLocked && <span className="cx-discussion-card__lock" title="Locked"><LockSvg /></span>}
                  {discussion.isResolved && <span className="cx-discussion-card__resolved" title="Resolved"><CheckSvg /></span>}
                  <h3 className={clsx('cx-discussion-card__title', discussion.isUnread && 'cx-discussion-card__title--unread')}>
                    {discussion.title}
                  </h3>
                  {discussion.isUnread && <span className="cx-discussion-card__unread-dot" />}
                </div>
                <div className="cx-discussion-card__meta">
                  <span className="cx-discussion-card__author">{discussion.author.name}</span>
                  {discussion.author.role && <span className="cx-badge cx-badge--info">{discussion.author.role}</span>}
                  {discussion.course && <span className="cx-badge cx-badge--neutral">{discussion.course.name}</span>}
                  <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="cx-discussion-card__excerpt" dangerouslySetInnerHTML={{ __html: discussion.content }} />
              <div className="cx-discussion-card__footer">
                <span><ReplySvg /> {discussion.replyCount}</span>
                <span><EyeSvg /> {discussion.viewCount}</span>
                <span><HeartSvg /> {discussion.likeCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="cx-pagination" style={{ marginTop: 16 }}>
          <span className="cx-pagination__info">Page {page} of {totalPages}</span>
          <div className="cx-pagination__controls">
            <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3L5 7l4 4"/></svg></button>
            <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4"/></svg></button>
          </div>
        </div>
      )}

      {selectedDiscussion && (
        <div className="cx-modal-overlay" onClick={() => { setSelectedDiscussion(null); setShowReply(false); setReplyToEntryId(null) }}>
          <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{selectedDiscussion.title}</h2>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { const d = selectedDiscussion; setSelectedDiscussion(null); openEditModal(d); }} title="Edit"><EditSvg /></button>
                <button className="cx-btn cx-btn--ghost" onClick={() => { setSelectedDiscussion(null); setShowReply(false); setReplyToEntryId(null) }}><XSvg /></button>
              </div>
            </div>
            <div className="cx-modal__body" style={{ overflowY: 'auto', flex: 1 }}>
              <div className="cx-discussion-card__meta">
                <span style={{ fontWeight: 600 }}>{selectedDiscussion.author.name}</span>
                {selectedDiscussion.author.role && <span className="cx-badge cx-badge--info">{selectedDiscussion.author.role}</span>}
                {selectedDiscussion.course && <span className="cx-badge cx-badge--neutral">{selectedDiscussion.course.name}</span>}
                <span style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.8125rem' }}>{new Date(selectedDiscussion.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ color: 'var(--cx-text-secondary)', lineHeight: 1.7, marginTop: 12, marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: selectedDiscussion.content }} />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <button
                  className={clsx('cx-btn cx-btn--sm', selectedDiscussion.isPinned ? 'cx-btn--primary' : 'cx-btn--ghost')}
                  onClick={() => togglePin(selectedDiscussion.id, selectedDiscussion.isPinned)}
                ><PinSvg /> {selectedDiscussion.isPinned ? 'Pinned' : 'Pin'}</button>
                <button
                  className={clsx('cx-btn cx-btn--sm', selectedDiscussion.isLocked ? 'cx-btn--secondary' : 'cx-btn--ghost')}
                  onClick={() => toggleLock(selectedDiscussion.id, selectedDiscussion.isLocked)}
                ><LockSvg /> {selectedDiscussion.isLocked ? 'Locked' : 'Lock'}</button>
                <button
                  className={clsx('cx-btn cx-btn--sm', selectedDiscussion.isSubscribed ? 'cx-btn--primary' : 'cx-btn--ghost')}
                  onClick={() => toggleSubscribe(selectedDiscussion.id, selectedDiscussion.isSubscribed)}
                >{selectedDiscussion.isSubscribed ? <BellSvg /> : <BellOffSvg />} {selectedDiscussion.isSubscribed ? 'Subscribed' : 'Subscribe'}</button>
                <button
                  className="cx-btn cx-btn--primary cx-btn--sm"
                  onClick={() => { setShowReply(p => !p); setReplyToEntryId(null) }}
                ><ReplySvg /> {showReply && replyToEntryId === null ? 'Cancel' : 'Reply'}</button>
              </div>

              {/* Top-level reply form */}
              {showReply && replyToEntryId === null && (
                <div style={{ marginBottom: 20, padding: '14px', background: 'var(--cx-bg-surface-raised, #f8fafc)', borderRadius: 8, border: '1px solid var(--cx-border-subtle)' }}>
                  <ReplyEditor
                    courseId={filterCourse}
                    onSubmit={async (text) => {
                      try {
                        const res = await fetch(`/api/v1/courses/${filterCourse}/discussion_topics/${selectedDiscussion.id}/entries`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                          body: new URLSearchParams({ message: text }).toString()
                        })
                        if (!res.ok) throw new Error('Failed to post reply')
                        setShowReply(false)
                        refetchEntries()
                        refetch()
                      } catch (err) {
                        console.error(err)
                        alert('Failed to post reply. Please try again.')
                      }
                    }}
                    onCancel={() => setShowReply(false)}
                  />
                </div>
              )}

              {/* Threaded entries */}
              <div style={{ borderTop: '1px solid var(--cx-border-subtle)', paddingTop: 16 }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  {(apiEntries?.length ?? 0)} {(apiEntries?.length ?? 0) === 1 ? 'Reply' : 'Replies'}
                </h4>
                {!apiEntries || apiEntries.length === 0 ? (
                  <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem', fontStyle: 'italic' }}>No replies yet. Be the first to respond!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {apiEntries.map(entry => (
                      <div key={entry.id}>
                        {/* Entry */}
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'var(--cx-color-primary)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700,
                          }}>
                            {(entry.user?.display_name || entry.user_name || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-text-primary)' }}>
                                {entry.user?.display_name || entry.user_name}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--cx-text-tertiary)' }}>
                                {new Date(entry.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div
                              style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', lineHeight: 1.6 }}
                              dangerouslySetInnerHTML={{ __html: entry.message }}
                            />
                            <button
                              className="cx-btn cx-btn--ghost cx-btn--sm"
                              style={{ marginTop: 6, fontSize: '0.75rem' }}
                              onClick={() => setReplyToEntryId(replyToEntryId === String(entry.id) ? null : String(entry.id))}
                            >
                              <ReplySvg /> Reply
                            </button>

                            {/* Nested reply form */}
                            {replyToEntryId === String(entry.id) && (
                              <div style={{ marginTop: 10, padding: '12px', background: 'var(--cx-bg-surface-raised, #f8fafc)', borderRadius: 8, border: '1px solid var(--cx-border-subtle)' }}>
                                <ReplyEditor
                                  courseId={filterCourse}
                                  onSubmit={async (text) => {
                                    try {
                                      const res = await fetch(
                                        `/api/v1/courses/${filterCourse}/discussion_topics/${selectedDiscussion.id}/entries/${entry.id}/replies`,
                                        {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                          body: new URLSearchParams({ message: text }).toString()
                                        }
                                      )
                                      if (!res.ok) throw new Error('Failed')
                                      setReplyToEntryId(null)
                                      refetchEntries()
                                    } catch {
                                      alert('Failed to post nested reply.')
                                    }
                                  }}
                                  onCancel={() => setReplyToEntryId(null)}
                                />
                              </div>
                            )}

                            {/* Sub-entries (replies to entries) */}
                            {entry.recent_replies?.length > 0 && (
                              <div style={{ marginTop: 10, paddingLeft: 16, borderLeft: '2px solid var(--cx-border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {entry.recent_replies.map((sub: any) => (
                                  <div key={sub.id} style={{ display: 'flex', gap: 8 }}>
                                    <div style={{
                                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                      background: 'var(--cx-bg-surface-raised)', border: '1px solid var(--cx-border-subtle)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.65rem', fontWeight: 700, color: 'var(--cx-text-secondary)',
                                    }}>
                                      {(sub.user?.display_name || sub.user_name || 'U').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--cx-text-primary)' }}>{sub.user?.display_name || sub.user_name}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--cx-text-tertiary)' }}>{new Date(sub.created_at).toLocaleString()}</span>
                                      </div>
                                      <div style={{ fontSize: '0.82rem', color: 'var(--cx-text-secondary)', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: sub.message }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{editDiscussion ? 'Edit Discussion' : 'Create Discussion'}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCreateModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="cx-form-label" htmlFor="disc-title" style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Title</label>
                <input id="disc-title" className="cx-input" type="text" required value={discussionForm.title} onChange={e => setDiscussionForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Week 4 Discussion Topic" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="cx-form-label" htmlFor="disc-content" style={{ fontSize: '0.8125rem', fontWeight: 500, margin: 0 }}>Content</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      className="cx-btn cx-btn--ghost cx-btn--xs"
                      onClick={handleInsertMediaUrl}
                      style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                      title="Insert Media URL"
                    >
                      🌐 Media URL
                    </button>
                    {activeCourseId && (
                      <button
                        type="button"
                        className="cx-btn cx-btn--ghost cx-btn--xs"
                        onClick={() => setShowPicker(true)}
                        style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                        title="Insert Course Media"
                      >
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: 4 }}><rect x="1" y="4" width="12" height="12" rx="2"/><path d="M13 7l6-3v12l-6-3"/></svg>
                        Course Media
                      </button>
                    )}
                  </div>
                </div>
                <textarea id="disc-content" className="cx-input cx-input--textarea" rows={6} value={discussionForm.content} onChange={e => setDiscussionForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your discussion prompt here..." />
              </div>
              <div>
                <label className="cx-form-label" htmlFor="disc-course" style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Course</label>
                <select id="disc-course" className="cx-select" value={discussionForm.courseId} onChange={e => setDiscussionForm(p => ({ ...p, courseId: e.target.value }))}>
                  <option value="">Select a course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="cx-form-label" htmlFor="disc-tags" style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Tags <span style={{ fontWeight: 400, color: 'var(--cx-text-tertiary)' }}>(comma-separated)</span></label>
                <input id="disc-tags" className="cx-input" type="text" value={discussionForm.tags} onChange={e => setDiscussionForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. homework, help, discussion" />
              </div>
            </div>
            <div className="cx-modal__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleCreateDiscussion} disabled={!discussionForm.title.trim()}>
                {editDiscussion ? 'Save Changes' : 'Create Discussion'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showPicker && activeCourseId && (
        <div 
          className="cx-modal-overlay" 
          onClick={() => setShowPicker(false)}
          style={{ zIndex: 1200 }}
        >
          <div 
            className="cx-modal cx-modal--lg" 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(30, 41, 59, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
              borderRadius: 16,
              width: '90%',
              maxWidth: 800,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
              overflow: 'hidden'
            }}
          >
            <div className="cx-modal__header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', flexShrink: 0 }}>
              <h2 className="cx-modal__title" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                Select Course Instructional Media
              </h2>
              <button 
                className="cx-btn cx-btn--ghost" 
                onClick={() => setShowPicker(false)}
                style={{ color: '#fff', opacity: 0.8 }}
              >
                &times;
              </button>
            </div>
            <div className="cx-modal__body" style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              <MediaLibrary courseId={activeCourseId} isSelectMode={true} onSelectMedia={handleSelectMedia} />
            </div>
            <div style={{ display: 'flex', padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button 
                className="cx-btn cx-btn--secondary cx-btn--sm" 
                onClick={() => setShowPicker(false)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsPage;
