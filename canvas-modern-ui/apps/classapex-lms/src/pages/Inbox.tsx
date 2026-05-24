/**
 * ClassApex — Inbox / Messaging Page
 * ====================================
 * Split-pane messaging UI powered by Canvas Conversations API.
 * Features:
 *  - Conversation list with search/filter
 *  - Message thread with reply
 *  - Compose new message modal
 *  - Course context badges
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { SearchIcon } from '../navigation'
import './inbox.css'

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

const ComposeSvg = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2l4 4L7 17H3v-4L14 2z"/><path d="M11 5l4 4"/>
  </svg>
)

const StarSvg = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
    <path d="M10 1l2.5 5L18 6.5l-4 3.5 1 5.5L10 13l-5 2.5 1-5.5-4-3.5L7.5 6 10 1z"/>
  </svg>
)

const ArchiveSvg = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="16" height="4" rx="1"/><path d="M3 6v10a2 2 0 002 2h10a2 2 0 002-2V6"/><path d="M8 10h4"/>
  </svg>
)

const TrashSvg = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 5h14"/><path d="M8 5V3a1 1 0 011-1h2a1 1 0 011 1v2"/><path d="M5 5l1 12a2 2 0 002 2h4a2 2 0 002-2l1-12"/>
  </svg>
)

const ChatBubbleSvg = () => (
  <svg width="48" height="48" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M3 1h14a2 2 0 012 2v10a2 2 0 01-2 2H7l-4 4V3a2 2 0 012-2z"/><path d="M6 7h8M6 10h6"/>
  </svg>
)

const PaperclipSvg = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10.5 4.5l-4 4a2 2 0 002.8 2.8l4-4a4 4 0 10-5.6-5.6l-4 4a6 6 0 108.5 8.5l4-4"/>
  </svg>
)

const VideoSvg = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="5" width="12" height="10" rx="2"/><path d="M14 8l4-2v8l-4-2"/>
  </svg>
)

// ─── Types ──────────────────────────────────────────────────────────────────

interface Participant {
  id: number
  name: string
  full_name?: string
  avatar_url?: string
}

interface ConversationMessage {
  id: number
  author_id: number
  body: string
  created_at: string
  generated: boolean
  media_comment?: any
  attachments?: any[]
  forwarded_messages?: ConversationMessage[]
}

interface Conversation {
  id: number
  subject: string
  workflow_state: 'read' | 'unread' | 'archived'
  last_message: string
  last_message_at: string
  message_count: number
  participants: Participant[]
  audience: number[]
  context_name?: string
  context_code?: string
  messages?: ConversationMessage[]
  starred: boolean
  properties: string[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6']

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getAvatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffHrs = diffMs / (1000 * 60 * 60)

  if (diffHrs < 1) return `${Math.round(diffMs / 60000)}m ago`
  if (diffHrs < 24) return `${Math.round(diffHrs)}h ago`
  if (diffHrs < 48) return 'Yesterday'
  if (diffHrs < 168) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// ─── Compose Modal ──────────────────────────────────────────────────────────

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (recipients: string[], subject: string, body: string) => void
  conversations?: Conversation[]
}

interface Recipient {
  id: string;
  name: string;
  avatar_url?: string;
  type?: string;
}

function ComposeModal({ isOpen, onClose, onSend, conversations = [] }: ComposeModalProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Recipient[]>([])
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [, setIsSearching] = useState(false)
  const [sendAsBcc, setSendAsBcc] = useState(false)

  // Build unique participants fallback from loaded conversations
  const localParticipants = useMemo(() => {
    const seen = new Set<string>()
    const result: Recipient[] = []
    for (const conv of conversations) {
      for (const p of conv.participants) {
        const key = String(p.id)
        if (!seen.has(key)) {
          seen.add(key)
          result.push({ id: key, name: p.name, avatar_url: p.avatar_url })
        }
      }
    }
    return result
  }, [conversations])

  // Search Canvas recipients API with local fallback
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/v1/search/recipients?search=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setSearchResults(data)
          } else {
            // Fallback: filter local participants
            const q = query.toLowerCase()
            setSearchResults(localParticipants.filter(p => p.name.toLowerCase().includes(q)))
          }
        } else {
          // API error — use local fallback
          const q = query.toLowerCase()
          setSearchResults(localParticipants.filter(p => p.name.toLowerCase().includes(q)))
        }
      } catch (err) {
        console.error('Recipient search failed, using local fallback:', err)
        const q = query.toLowerCase()
        setSearchResults(localParticipants.filter(p => p.name.toLowerCase().includes(q)))
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, localParticipants])

  if (!isOpen) return null

  const handleSend = () => {
    if (selectedRecipients.length > 0 && body.trim()) {
      onSend(selectedRecipients.map(r => r.id), subject, body)
      setSelectedRecipients([])
      setQuery('')
      setSubject('')
      setBody('')
      onClose()
    }
  }

  const toggleRecipient = (rec: Recipient) => {
    if (selectedRecipients.find(r => r.id === rec.id)) {
      setSelectedRecipients(prev => prev.filter(r => r.id !== rec.id))
    } else {
      setSelectedRecipients(prev => [...prev, rec])
      setQuery('')
      setSearchResults([])
    }
  }

  return (
    <div className="cx-compose-overlay" onClick={onClose}>
      <div className="cx-compose" onClick={e => e.stopPropagation()} role="dialog" aria-label="Compose message">
        <div className="cx-compose__header">
          <h2 className="cx-compose__title">New Message</h2>
          <button className="cx-compose__close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="cx-compose__body">
          <div className="cx-compose__field">
            <label className="cx-compose__label">To</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {selectedRecipients.map(rec => (
                <span key={rec.id} className="cx-badge cx-badge--primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {rec.name}
                  <button onClick={() => toggleRecipient(rec)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>&times;</button>
                </span>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="cx-compose__input"
                placeholder={selectedRecipients.length === 0 ? "Search for a person or course..." : "Add another..."}
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {searchResults.length > 0 && (
                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-default)', borderRadius: '6px', zIndex: 10, listStyle: 'none', padding: 0, margin: '4px 0 0', maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--cx-shadow-md)' }}>
                  {searchResults.map(rec => (
                    <li key={rec.id} onClick={() => toggleRecipient(rec)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--cx-border-subtle)', color: 'var(--cx-text-primary)', fontSize: '0.875rem' }}>
                      {rec.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="cx-compose__field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="cx-compose__label" style={{ margin: 0 }}>Subject</label>
              <label className="cx-toggle" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={sendAsBcc} onChange={e => setSendAsBcc(e.target.checked)} />
                <span className="cx-toggle__track" style={{ transform: 'scale(0.8)' }}><span className="cx-toggle__thumb" /></span>
                <span className="cx-toggle__label" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--cx-text-secondary)' }}>Send as individual messages (BCC)</span>
              </label>
            </div>
            <input
              className="cx-compose__input"
              placeholder="Message subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
          <div className="cx-compose__field">
            <label className="cx-compose__label">Message</label>
            <textarea
              className="cx-compose__textarea"
              placeholder="Type your message..."
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
        </div>
        <div className="cx-compose__footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Add Attachment"><PaperclipSvg /></button>
            <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Record Audio/Video"><VideoSvg /></button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cx-compose__cancel" onClick={onClose}>Cancel</button>
            <button className="cx-compose__send" disabled={selectedRecipients.length === 0 || !body.trim()} onClick={handleSend}>
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Inbox Page ─────────────────────────────────────────────────────────────

type FilterScope = 'all' | 'unread' | 'starred' | 'archived'

export default function InboxPage() {
  const { showConfirm, showToast } = useNotification()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<FilterScope>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Canvas API — live conversations list
  const { data: apiConversations, refetch: refetchConversations } = useCanvasQuery<Conversation[]>(
    '/api/v1/conversations',
    { per_page: 50, scope: filter === 'all' ? undefined : filter } as any
  )
  
  // Canvas API - full thread for selected conversation
  const { data: apiSelectedThread, refetch: refetchThread } = useCanvasQuery<Conversation | Conversation[]>(
    selectedId ? `/api/v1/conversations/${selectedId}` : ''
  )

  // Current user — needed to identify self in message threads
  const { data: currentUser } = useCanvasQuery<{ id: number }>('/api/v1/users/self')
  const selfId = currentUser?.id ?? null

  const conversations = Array.isArray(apiConversations) ? apiConversations : []

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let list = [...conversations]

    if (filter === 'unread') list = list.filter(c => c.workflow_state === 'unread')
    else if (filter === 'starred') list = list.filter(c => c.starred)
    else if (filter === 'archived') list = list.filter(c => c.workflow_state === 'archived')
    else list = list.filter(c => c.workflow_state !== 'archived')

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(c =>
        c.subject.toLowerCase().includes(q) ||
        c.last_message.toLowerCase().includes(q) ||
        c.participants.some(p => p.name.toLowerCase().includes(q))
      )
    }

    return list.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
  }, [conversations, filter, searchQuery])

  const selectedListInfo = useMemo(
    () => conversations.find(c => c.id === selectedId) || null,
    [conversations, selectedId]
  )
  
  // Use the detailed thread if available, fallback to list info
  const selected = useMemo(() => {
    if (!selectedId) return null;
    const threadData = Array.isArray(apiSelectedThread) ? apiSelectedThread[0] : apiSelectedThread;
    return threadData || selectedListInfo;
  }, [selectedId, apiSelectedThread, selectedListInfo])

  const unreadCount = conversations.filter(c => c.workflow_state === 'unread').length

  // Scroll to bottom of messages on selection
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedId, selected?.messages])

  const handleReply = useCallback(async () => {
    if (!replyText.trim() || !selected) return
    try {
      const res = await fetch(`/api/v1/conversations/${selected.id}/add_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyText })
      })
      if (!res.ok) throw new Error('Failed to send reply')
      setReplyText('')
      refetchConversations()
      refetchThread()
    } catch (err) {
      console.error('Reply failed:', err)
      showToast({
        title: 'Reply Failed',
        message: 'Failed to send reply. Please try again.',
        type: 'error'
      })
    }
  }, [replyText, selected, refetchConversations, refetchThread])

  const handleCompose = useCallback(async (recipients: string[], subject: string, body: string) => {
    try {
      const res = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, subject, body })
      })
      if (!res.ok) throw new Error('Failed to create conversation')
      showToast({
        title: 'Message Sent',
        message: 'Message sent successfully',
        type: 'success'
      })
      refetchConversations()
    } catch (err) {
      console.error('Compose failed:', err)
      showToast({
        title: 'Compose Failed',
        message: 'Failed to send message. Please try again.',
        type: 'error'
      })
    }
  }, [refetchConversations])

  const handleToggleStar = useCallback(async (conv: Conversation) => {
    try {
      await fetch(`/api/v1/conversations/${conv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: { starred: !conv.starred } })
      })
      refetchConversations()
      if (selectedId === conv.id) refetchThread()
    } catch (err) {
      console.error('Star failed:', err)
    }
  }, [refetchConversations, refetchThread, selectedId])

  const handleToggleArchive = useCallback(async (conv: Conversation) => {
    try {
      const newState = conv.workflow_state === 'archived' ? 'read' : 'archived'
      await fetch(`/api/v1/conversations/${conv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: { workflow_state: newState } })
      })
      refetchConversations()
      if (selectedId === conv.id) setSelectedId(null)
    } catch (err) {
      console.error('Archive failed:', err)
    }
  }, [refetchConversations, selectedId])

  const handleDelete = useCallback(async (conv: Conversation) => {
    const isConfirmed = await showConfirm({
      title: 'Delete Conversation',
      message: 'Are you sure you want to delete this conversation? This cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    })
    if (!isConfirmed) return
    try {
      await fetch(`/api/v1/conversations/${conv.id}`, {
        method: 'DELETE'
      })
      showToast({
        title: 'Conversation Deleted',
        message: 'The conversation was deleted successfully.',
        type: 'success'
      })
      refetchConversations()
      if (selectedId === conv.id) setSelectedId(null)
    } catch (err) {
      console.error('Delete failed:', err)
      showToast({
        title: 'Delete Failed',
        message: 'Failed to delete conversation.',
        type: 'error'
      })
    }
  }, [refetchConversations, selectedId])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReply()
    }
  }, [handleReply])

  // Get other participants (exclude "You")
  const getOtherParticipants = (conv: Conversation) =>
    conv.participants.filter(p => p.id !== 1)

  return (
    <div className="cx-inbox">
      <div className="cx-inbox__header" style={{ paddingTop: 0 }}>
        <div>
          <span className="cx-inbox__subtitle" style={{ margin: 0 }}>
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
          </span>
        </div>
        <div className="cx-inbox__actions">
          <button
            className="cx-btn cx-btn--primary cx-btn--sm"
            onClick={() => setComposeOpen(true)}
            aria-label="Compose new message"
          >
            <ComposeSvg /> Compose
          </button>
        </div>
      </div>

      {/* ── Split Pane ── */}
      <div className={`cx-inbox__split ${selected ? 'cx-inbox__split--detail-open' : ''}`}>
        {/* ── Left: Conversation List ── */}
        <div className="cx-inbox__list-panel">
          <div className="cx-inbox__filters" role="tablist" aria-label="Message filters">
            {(['all', 'unread', 'starred', 'archived'] as FilterScope[]).map(scope => (
              <button
                key={scope}
                className={`cx-inbox__filter-btn ${filter === scope ? 'cx-inbox__filter-btn--active' : ''}`}
                onClick={() => setFilter(scope)}
                role="tab"
                aria-selected={filter === scope}
              >
                {scope === 'all' ? `Inbox${unreadCount ? ` (${unreadCount})` : ''}` : scope.charAt(0).toUpperCase() + scope.slice(1)}
              </button>
            ))}
          </div>

          <div className="cx-inbox__search">
            <div className="cx-search">
              <SearchIcon />
              <input
                type="search"
                className="cx-search__input"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ul className="cx-inbox__conversations" role="listbox" aria-label="Conversations">
            {filteredConversations.length === 0 ? (
              <li style={{ padding: 24, textAlign: 'center', color: 'var(--cx-text-muted, #94a3b8)', fontSize: '0.85rem' }}>
                No conversations found
              </li>
            ) : (
              filteredConversations.map(conv => {
                const others = getOtherParticipants(conv)
                const primaryName = others[0]?.name || 'Unknown'
                const displayNames = others.length > 2
                  ? `${others[0].name}, ${others[1].name} +${others.length - 2}`
                  : others.map(p => p.name).join(', ')

                return (
                  <li
                    key={conv.id}
                    className={`cx-convo-item ${selectedId === conv.id ? 'cx-convo-item--active' : ''} ${conv.workflow_state === 'unread' ? 'cx-convo-item--unread' : ''}`}
                    onClick={() => setSelectedId(conv.id)}
                    role="option"
                    aria-selected={selectedId === conv.id}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') setSelectedId(conv.id) }}
                  >
                    <div
                      className="cx-convo-item__avatar"
                      style={{ background: getAvatarColor(others[0]?.id || conv.id) }}
                    >
                      {getInitials(primaryName)}
                    </div>
                    <div className="cx-convo-item__content">
                      <div className="cx-convo-item__top">
                        <span className="cx-convo-item__participants">{displayNames}</span>
                        <span className="cx-convo-item__time">{formatTime(conv.last_message_at)}</span>
                      </div>
                      <div className="cx-convo-item__subject">{conv.subject}</div>
                      <div className="cx-convo-item__preview">{conv.last_message}</div>
                      {conv.context_name && (
                        <div className="cx-convo-item__meta">
                          <span className="cx-convo-item__course-tag">{conv.context_name}</span>
                          {conv.starred && <span title="Starred" style={{color:'var(--cx-warning,#f59e0b)'}}><StarSvg filled /></span>}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </div>

        {/* ── Right: Detail Panel ── */}
        <div className="cx-inbox__detail-panel">
          {!selected ? (
            <div className="cx-inbox__detail-empty">
              <span className="cx-inbox__detail-empty-icon"><ChatBubbleSvg /></span>
              <p>Select a conversation to read</p>
              <p style={{ fontSize: '0.78rem' }}>Or compose a new message</p>
            </div>
          ) : (
            <>
              <div className="cx-inbox__detail-header">
                <div>
                  <h2 className="cx-inbox__detail-subject">{selected.subject}</h2>
                  {selected.context_name && (
                    <div className="cx-inbox__detail-course">{selected.context_name}</div>
                  )}
                </div>
                <div className="cx-inbox__detail-actions">
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    title={selected.workflow_state === 'archived' ? 'Unarchive' : 'Archive'}
                    aria-label="Archive conversation"
                    onClick={() => handleToggleArchive(selected)}
                  >
                    <ArchiveSvg />
                  </button>
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    title={selected.starred ? 'Unstar' : 'Star'}
                    aria-label={selected.starred ? 'Remove star' : 'Star conversation'}
                    onClick={() => handleToggleStar(selected)}
                  >
                    <StarSvg filled={selected.starred} />
                  </button>
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    title="Delete"
                    aria-label="Delete conversation"
                    onClick={() => handleDelete(selected)}
                  >
                    <TrashSvg />
                  </button>
                </div>
              </div>

              <div className="cx-inbox__messages">
                {(selected.messages || []).slice().reverse().map(msg => {
                  const isSelf = selfId !== null ? msg.author_id === selfId : false
                  const author = selected.participants.find(p => p.id === msg.author_id)
                  const authorName = author?.name || 'Unknown'

                  return (
                    <div key={msg.id} className={`cx-message ${isSelf ? 'cx-message--self' : ''}`}>
                      <div
                        className="cx-message__avatar"
                        style={{ background: getAvatarColor(msg.author_id) }}
                      >
                        {getInitials(authorName)}
                      </div>
                      <div>
                        <div className="cx-message__sender">{isSelf ? 'You' : authorName}</div>
                        <div className="cx-message__bubble">{msg.body}</div>
                        <div className="cx-message__time">{formatMessageTime(msg.created_at)}</div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="cx-inbox__reply">
                <textarea
                  className="cx-inbox__reply-input"
                  placeholder="Type a reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Add Attachment"><PaperclipSvg /></button>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Record Audio/Video"><VideoSvg /></button>
                  <button
                    className="cx-inbox__reply-send"
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Compose Modal ── */}
      <ComposeModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={handleCompose}
        conversations={conversations}
      />
    </div>
  )
}
