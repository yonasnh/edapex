import React, { useState, useCallback } from 'react'

interface Comment {
  id: number
  author_name: string
  author_avatar?: string
  comment: string
  created_at: string
  is_teacher?: boolean
}

interface SubmissionCommentsProps {
  comments: Comment[]
  onSubmit?: (text: string) => void
  isLoading?: boolean
}

export function SubmissionComments({ comments, onSubmit, isLoading = false }: SubmissionCommentsProps) {
  const [newComment, setNewComment] = useState('')

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onSubmit?.(newComment.trim())
      setNewComment('')
    }
  }, [newComment, onSubmit])

  if (isLoading) {
    return (
      <div className="cx-sub-comments">
        <div className="cx-skeleton cx-skeleton--comments" />
      </div>
    )
  }

  return (
    <div className="cx-sub-comments">
      <h3 className="cx-sub-comments__title">Comments ({comments.length})</h3>

      {comments.length === 0 ? (
        <p className="cx-sub-comments__empty">No comments yet.</p>
      ) : (
        <div className="cx-sub-comments__list">
          {comments.map(c => (
            <div key={c.id} className={`cx-sub-comments__item ${c.is_teacher ? 'cx-sub-comments__item--teacher' : ''}`}>
              <div className="cx-sub-comments__item-avatar">
                {c.author_name.charAt(0).toUpperCase()}
              </div>
              <div className="cx-sub-comments__item-body">
                <div className="cx-sub-comments__item-header">
                  <span className="cx-sub-comments__item-author">{c.author_name}</span>
                  {c.is_teacher && <span className="cx-sub-comments__item-badge">Instructor</span>}
                  <span className="cx-sub-comments__item-time">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="cx-sub-comments__item-text">{c.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form className="cx-sub-comments__form" onSubmit={handleSubmit}>
        <textarea
          className="cx-sub-comments__input"
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          rows={3}
        />
        <button
          type="submit"
          className="cx-sub-comments__submit"
          disabled={!newComment.trim()}
        >
          Post Comment
        </button>
      </form>
    </div>
  )
}
