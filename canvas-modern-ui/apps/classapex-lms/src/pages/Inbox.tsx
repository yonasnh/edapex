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
import { useCanvasQuery, useCanvasMutation } from '../hooks/useCanvasQuery'
import './inbox.css'

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

// ─── Mock Data ──────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6']

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1, subject: 'Question about Assignment 3', workflow_state: 'unread',
    last_message: 'Hi, I wanted to ask about the requirements for the third assignment. Specifically, do we need to include unit tests?',
    last_message_at: '2026-05-18T14:30:00Z', message_count: 3,
    participants: [{ id: 1, name: 'You' }, { id: 2, name: 'Dr. Sarah Chen', avatar_url: '' }],
    audience: [2], context_name: 'CS 301 — Data Structures', context_code: 'course_1', starred: false,
    properties: ['last_author'],
    messages: [
      { id: 101, author_id: 2, body: 'Great question! Yes, unit tests are required. Please include at least 5 test cases covering edge cases. I have updated the rubric to clarify this.', created_at: '2026-05-18T14:30:00Z', generated: false },
      { id: 102, author_id: 1, body: 'Hi, I wanted to ask about the requirements for the third assignment. Specifically, do we need to include unit tests?', created_at: '2026-05-18T13:15:00Z', generated: false },
      { id: 103, author_id: 2, body: 'Hello! Feel free to ask any questions about the assignments. I am available during office hours as well.', created_at: '2026-05-18T10:00:00Z', generated: false },
    ],
  },
  {
    id: 2, subject: 'Study Group — Final Exam Prep', workflow_state: 'read',
    last_message: 'Who is available Saturday at 2pm for our last study session before the exam?',
    last_message_at: '2026-05-18T11:00:00Z', message_count: 12,
    participants: [{ id: 1, name: 'You' }, { id: 3, name: 'Alex Rivera' }, { id: 4, name: 'Priya Patel' }, { id: 5, name: 'Marcus Johnson' }],
    audience: [3, 4, 5], context_name: 'CS 301 — Data Structures', context_code: 'course_1', starred: true,
    properties: [],
    messages: [
      { id: 201, author_id: 3, body: 'Who is available Saturday at 2pm for our last study session before the exam?', created_at: '2026-05-18T11:00:00Z', generated: false },
      { id: 202, author_id: 4, body: 'I can make it! Should we focus on graph algorithms or dynamic programming?', created_at: '2026-05-18T10:45:00Z', generated: false },
      { id: 203, author_id: 1, body: 'Both would be great. I am struggling with Dijkstra\'s especially.', created_at: '2026-05-18T10:30:00Z', generated: false },
      { id: 204, author_id: 5, body: 'Count me in. I can bring my notes on DP.', created_at: '2026-05-18T10:20:00Z', generated: false },
    ],
  },
  {
    id: 3, subject: 'Lab Report Feedback', workflow_state: 'read',
    last_message: 'Your lab report was excellent. I especially liked your analysis section. Grade: A',
    last_message_at: '2026-05-17T16:00:00Z', message_count: 1,
    participants: [{ id: 1, name: 'You' }, { id: 6, name: 'Prof. James Walker' }],
    audience: [6], context_name: 'PHYS 201 — Modern Physics', context_code: 'course_2', starred: false,
    properties: [],
    messages: [
      { id: 301, author_id: 6, body: 'Your lab report was excellent. I especially liked your analysis section where you connected the quantum tunneling probabilities to real-world applications. Grade: A', created_at: '2026-05-17T16:00:00Z', generated: false },
    ],
  },
  {
    id: 4, subject: 'Office Hours Cancellation', workflow_state: 'read',
    last_message: 'Due to a faculty meeting, my Thursday office hours are cancelled this week. Please use the discussion board for questions.',
    last_message_at: '2026-05-17T09:00:00Z', message_count: 1,
    participants: [{ id: 1, name: 'You' }, { id: 7, name: 'Dr. Lisa Park' }],
    audience: [7], context_name: 'MATH 401 — Abstract Algebra', context_code: 'course_3', starred: false,
    properties: [],
    messages: [
      { id: 401, author_id: 7, body: 'Due to a faculty meeting, my Thursday office hours are cancelled this week. Please use the discussion board for questions, or email me directly for urgent matters. I will resume normal hours next week.', created_at: '2026-05-17T09:00:00Z', generated: false },
    ],
  },
  {
    id: 5, subject: 'Group Project — Milestone 2', workflow_state: 'unread',
    last_message: 'I\'ve pushed the updated wireframes to the shared drive. Can everyone review by Wednesday?',
    last_message_at: '2026-05-18T08:00:00Z', message_count: 8,
    participants: [{ id: 1, name: 'You' }, { id: 8, name: 'Jordan Kim' }, { id: 9, name: 'Taylor Morgan' }],
    audience: [8, 9], context_name: 'CS 410 — Software Engineering', context_code: 'course_4', starred: false,
    properties: [],
    messages: [
      { id: 501, author_id: 8, body: 'I\'ve pushed the updated wireframes to the shared drive. Can everyone review by Wednesday? We need to finalize the UI before Sprint 3 begins.', created_at: '2026-05-18T08:00:00Z', generated: false },
      { id: 502, author_id: 9, body: 'Got it. I\'ll review tomorrow. Also, I finished the backend API for the user authentication module.', created_at: '2026-05-18T07:30:00Z', generated: false },
      { id: 503, author_id: 1, body: 'Nice work! I am wrapping up the database schema. Should be done by tonight.', created_at: '2026-05-18T07:00:00Z', generated: false },
    ],
  },
  {
    id: 6, subject: 'Welcome to the Spring Semester!', workflow_state: 'archived',
    last_message: 'Welcome to all students enrolled in CS 301 this semester...',
    last_message_at: '2026-01-15T10:00:00Z', message_count: 1,
    participants: [{ id: 1, name: 'You' }, { id: 2, name: 'Dr. Sarah Chen' }],
    audience: [2], context_name: 'CS 301 — Data Structures', context_code: 'course_1', starred: false,
    properties: [],
    messages: [
      { id: 601, author_id: 2, body: 'Welcome to all students enrolled in CS 301 this semester! I look forward to an exciting journey through data structures and algorithms. Please review the syllabus posted on the course page and come prepared for our first lab session next week.', created_at: '2026-01-15T10:00:00Z', generated: false },
    ],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  onSend: (to: string, subject: string, body: string) => void
}

function ComposeModal({ isOpen, onClose, onSend }: ComposeModalProps) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  if (!isOpen) return null

  const handleSend = () => {
    if (to.trim() && body.trim()) {
      onSend(to, subject, body)
      setTo('')
      setSubject('')
      setBody('')
      onClose()
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
            <input
              className="cx-compose__input"
              placeholder="Search for a person or course..."
              value={to}
              onChange={e => setTo(e.target.value)}
              autoFocus
            />
          </div>
          <div className="cx-compose__field">
            <label className="cx-compose__label">Subject</label>
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
        <div className="cx-compose__footer">
          <button className="cx-compose__cancel" onClick={onClose}>Cancel</button>
          <button className="cx-compose__send" disabled={!to.trim() || !body.trim()} onClick={handleSend}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Inbox Page ─────────────────────────────────────────────────────────────

type FilterScope = 'all' | 'unread' | 'starred' | 'archived'

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<FilterScope>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Canvas API — with fallback to mock
  const { data: apiConversations } = useCanvasQuery<Conversation[]>(
    '/api/v1/conversations',
    { per_page: 50, include_all_conversation_ids: false, scope: filter === 'all' ? undefined : filter } as any
  )

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

  const selected = useMemo(
    () => conversations.find(c => c.id === selectedId) || null,
    [conversations, selectedId]
  )

  const unreadCount = conversations.filter(c => c.workflow_state === 'unread').length

  // Scroll to bottom of messages on selection
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedId])

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
      // Ideally trigger a refetch of conversations here
    } catch (err) {
      console.error('Reply failed:', err)
      alert('Failed to send reply. Please try again.')
    }
  }, [replyText, selected])

  const handleCompose = useCallback(async (to: string, subject: string, body: string) => {
    try {
      // Note: Canvas API expects `recipients` as an array of IDs
      const recipients = to.split(',').map(s => s.trim())
      const res = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, subject, body })
      })
      if (!res.ok) throw new Error('Failed to create conversation')
      alert('Message sent successfully')
    } catch (err) {
      console.error('Compose failed:', err)
      alert('Failed to send message. Please ensure the recipient ID is valid.')
    }
  }, [])

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
      {/* ── Header ── */}
      <div className="cx-inbox__header">
        <div>
          <h1 className="cx-inbox__title">Inbox</h1>
          <p className="cx-inbox__subtitle">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        <div className="cx-inbox__actions">
          <button
            className="cx-btn cx-btn--primary cx-btn--sm"
            onClick={() => setComposeOpen(true)}
            aria-label="Compose new message"
          >
            ✉ Compose
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
            <div className="cx-inbox__search-wrap">
              <span className="cx-inbox__search-icon">🔍</span>
              <input
                type="search"
                className="cx-inbox__search-input"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
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
                          {conv.starred && <span title="Starred">⭐</span>}
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
              <span className="cx-inbox__detail-empty-icon">💬</span>
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
                    title="Archive"
                    aria-label="Archive conversation"
                  >
                    📁
                  </button>
                  <button
                    className="cx-btn cx-btn--ghost cx-btn--sm"
                    title={selected.starred ? 'Unstar' : 'Star'}
                    aria-label={selected.starred ? 'Remove star' : 'Star conversation'}
                  >
                    {selected.starred ? '⭐' : '☆'}
                  </button>
                </div>
              </div>

              <div className="cx-inbox__messages">
                {(selected.messages || []).slice().reverse().map(msg => {
                  const isSelf = msg.author_id === 1
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
                <button
                  className="cx-inbox__reply-send"
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                >
                  Send
                </button>
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
      />
    </div>
  )
}
