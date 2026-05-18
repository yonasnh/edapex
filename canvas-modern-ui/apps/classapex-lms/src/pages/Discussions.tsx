import React, { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import ReplyEditor from '../widgets/ReplyEditor';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editDiscussion, setEditDiscussion] = useState<any | null>(null);
  const [discussionForm, setDiscussionForm] = useState({ title: '', content: '', courseId: '', tags: '' });
  
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
    if (!discussionForm.title.trim() || !discussionForm.courseId) return;
    try {
      const formData = new URLSearchParams()
      formData.append('title', discussionForm.title)
      formData.append('message', discussionForm.content)
      
      const res = await fetch(`/api/v1/courses/${discussionForm.courseId}/discussion_topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })
      if (!res.ok) throw new Error('Failed to create discussion')
      
      alert('Discussion created successfully!')
      setShowCreateModal(false)
      if (discussionForm.courseId === filterCourse) {
        refetch() // Reload list if created in current view
      }
    } catch (err) {
      console.error(err)
      alert('Failed to create discussion.')
    }
  };

  const togglePin = useCallback(async (id: string) => {
    // API logic to toggle pin goes here (PUT /api/v1/courses/:courseId/discussion_topics/:id)
    setSelectedDiscussion((prev: any) => prev?.id === id ? { ...prev, isPinned: !prev.isPinned } : prev);
  }, []);

  const toggleLock = useCallback(async (id: string) => {
    setSelectedDiscussion((prev: any) => prev?.id === id ? { ...prev, isLocked: !prev.isLocked } : prev);
  }, []);

  const toggleSubscribe = useCallback(async (id: string) => {
    setSelectedDiscussion((prev: any) => prev?.id === id ? { ...prev, isSubscribed: !prev.isSubscribed } : prev);
  }, []);

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
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Discussions</h1>
          <p className="cx-page__subtitle">Participate in course discussions and collaborate with peers</p>
        </div>
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
        <div className="cx-modal-overlay" onClick={() => setSelectedDiscussion(null)}>
          <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{selectedDiscussion.title}</h2>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { const d = selectedDiscussion; setSelectedDiscussion(null); openEditModal(d); }} title="Edit"><EditSvg /></button>
                <button className="cx-btn cx-btn--ghost" onClick={() => setSelectedDiscussion(null)}><XSvg /></button>
              </div>
            </div>
            <div className="cx-modal__body">
              <div className="cx-discussion-detail__author">
                <div className="cx-discussion-card__meta">
                  <span style={{ fontWeight: 600 }}>{selectedDiscussion.author.name}</span>
                  {selectedDiscussion.author.role && <span className="cx-badge cx-badge--info">{selectedDiscussion.author.role}</span>}
                  {selectedDiscussion.course && <span className="cx-badge cx-badge--neutral">{selectedDiscussion.course.name}</span>}
                  <span style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.8125rem' }}>{new Date(selectedDiscussion.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div style={{ color: 'var(--cx-text-secondary)', lineHeight: 1.7, marginTop: 16 }} dangerouslySetInnerHTML={{ __html: selectedDiscussion.content }} />
              {selectedDiscussion.tags && selectedDiscussion.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                  {selectedDiscussion.tags.map((tag: string, i: number) => (
                    <span key={i} className="cx-badge cx-badge--neutral">{tag}</span>
                  ))}
                </div>
              )}
              <div className="cx-discussion-card__footer" style={{ marginTop: 16 }}>
                <span><ReplySvg /> {selectedDiscussion.replyCount} replies</span>
                <span><EyeSvg /> {selectedDiscussion.viewCount} views</span>
                <span><HeartSvg /> {selectedDiscussion.likeCount} likes</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  className={clsx('cx-btn cx-btn--sm', selectedDiscussion.isPinned ? 'cx-btn--primary' : 'cx-btn--ghost')}
                  onClick={() => togglePin(selectedDiscussion.id)}
                  title={selectedDiscussion.isPinned ? 'Unpin' : 'Pin'}
                >
                  <PinSvg /> {selectedDiscussion.isPinned ? 'Pinned' : 'Pin'}
                </button>
                <button
                  className={clsx('cx-btn cx-btn--sm', selectedDiscussion.isLocked ? 'cx-btn--secondary' : 'cx-btn--ghost')}
                  onClick={() => toggleLock(selectedDiscussion.id)}
                  title={selectedDiscussion.isLocked ? 'Unlock' : 'Lock'}
                >
                  <LockSvg /> {selectedDiscussion.isLocked ? 'Locked' : 'Lock'}
                </button>
                <button
                  className={clsx('cx-btn cx-btn--sm', selectedDiscussion.isSubscribed ? 'cx-btn--primary' : 'cx-btn--ghost')}
                  onClick={() => toggleSubscribe(selectedDiscussion.id)}
                  title={selectedDiscussion.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                >
                  {selectedDiscussion.isSubscribed ? <BellSvg /> : <BellOffSvg />} {selectedDiscussion.isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
              <div style={{ marginTop: 16 }}>
                <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowReply(p => !p)}>
                  <ReplySvg /> {showReply ? 'Cancel' : 'Reply'}
                </button>
                {showReply && (
                  <div style={{ marginTop: 12 }}>
                    <ReplyEditor
                      onSubmit={async (text) => {
                        try {
                          const formData = new URLSearchParams()
                          formData.append('message', text)
                          
                          const res = await fetch(`/api/v1/courses/${filterCourse}/discussion_topics/${selectedDiscussion.id}/entries`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: formData.toString()
                          })
                          if (!res.ok) throw new Error('Failed to post reply')
                          
                          alert('Reply posted successfully!')
                          setShowReply(false)
                          refetch() // Refresh discussion list (or just the entries)
                        } catch (err) {
                          console.error(err)
                          alert('Failed to post reply. Please try again.')
                        }
                      }}
                      onCancel={() => setShowReply(false)}
                    />
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
                <label className="cx-form-label" htmlFor="disc-content" style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Content</label>
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
    </div>
  );
};

export default DiscussionsPage;
