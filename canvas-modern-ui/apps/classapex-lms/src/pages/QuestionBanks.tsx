/**
 * QuestionBanks — ClassApex LMS (S24)
 * ======================================
 * Canvas REST API:
 *  GET/POST /api/v1/courses/:courseId/assessment_question_banks
 *  GET/POST /api/v1/courses/:courseId/assessment_question_banks/:bankId/assessment_questions
 *  PUT/DELETE /api/v1/courses/:courseId/assessment_question_banks/:bankId
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useRole } from '../contexts/RoleContext'
import { useNotification } from '../hooks/useNotification'

interface QuestionBank {
  id: number
  title: string
  question_count: number
}

interface BankQuestion {
  id: number
  question_name: string
  question_type: string
  question_text: string
  points_possible: number
}

export default function QuestionBanksPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null)
  const [editingBank, setEditingBank] = useState<any | null>(null)
  const [bankForm, setBankForm] = useState({ title: '' })

  const { data: banks, isLoading, refetch } = useCanvasQuery<QuestionBank[]>(
    courseId ? `/api/v1/courses/${courseId}/assessment_question_banks` : '',
    { per_page: 50 } as any
  )

  const { data: questions, isLoading: questionsLoading, refetch: refetchQuestions } = useCanvasQuery<BankQuestion[]>(
    selectedBank ? `/api/v1/courses/${courseId}/assessment_question_banks/${selectedBank.id}/assessment_questions` : '',
    { per_page: 100 } as any
  )

  const handleDeleteBank = async (id: number) => {
    const confirmed = await showConfirm({ title: 'Delete Question Bank?', message: 'All questions in this bank will be deleted.', type: 'danger' })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/assessment_question_banks/${id}`, { method: 'DELETE' })
      showToast({ title: 'Bank deleted', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleSaveBank = async () => {
    if (!bankForm.title.trim()) {
      showToast({ title: 'Title is required', type: 'error' })
      return
    }
    try {
      if (editingBank?.id) {
        await canvasFetch(`/api/v1/courses/${courseId}/assessment_question_banks/${editingBank.id}`, { method: 'PUT', body: { assessment_question_banks: [{ title: bankForm.title.trim() }] } })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/assessment_question_banks`, { method: 'POST', body: { assessment_question_banks: [{ title: bankForm.title.trim() }] } })
      }
      showToast({ title: `Bank ${editingBank?.id ? 'updated' : 'created'}`, type: 'success' })
      setEditingBank(null)
      setBankForm({ title: '' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleDeleteQuestion = async (bankId: number, qId: number) => {
    const confirmed = await showConfirm({ title: 'Delete Question?', message: 'This cannot be undone.', type: 'danger' })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/assessment_question_banks/${bankId}/assessment_questions/${qId}`, { method: 'DELETE' })
      showToast({ title: 'Question deleted', type: 'success' })
      refetchQuestions()
    } catch (err: any) {
      showToast({ title: 'Delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  if (selectedBank) {
    return (
      <div className="cx-page">
        <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>{selectedBank.title}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>{questions?.length ?? 0} questions</p>
          </div>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setSelectedBank(null)}>← Back to Banks</button>
        </div>

        {questionsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 64, borderRadius: 10 }} />)}
          </div>
        ) : !questions || questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cx-text-tertiary)' }}>
            <p>No questions in this bank yet.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {questions.map(q => (
              <li key={q.id} className="cx-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 2 }}>{q.question_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                    {q.question_type} · {q.points_possible} pts
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-secondary)', marginTop: 4 }} dangerouslySetInnerHTML={{ __html: q.question_text }} />
                </div>
                {isTeacher && (
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteQuestion(selectedBank.id, q.id)} style={{ color: 'var(--cx-color-danger, #dc2626)' }}>🗑</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ paddingTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)' }}>Question Banks</h2>
        {isTeacher && (
          <button className="cx-btn cx-btn--primary" onClick={() => { setEditingBank({}); setBankForm({ title: '' }) }}>+ New Bank</button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 72, borderRadius: 10 }} />)}
        </div>
      ) : !banks || banks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cx-text-tertiary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❓</div>
          <p>No question banks found.</p>
          {isTeacher && (
            <button className="cx-btn cx-btn--primary" style={{ marginTop: 12 }} onClick={() => { setEditingBank({}); setBankForm({ title: '' }) }}>
              Create your first question bank
            </button>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {banks.map(bank => (
            <li
              key={bank.id}
              className="cx-card"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
              onClick={() => setSelectedBank(bank)}
            >
              <div style={{ fontSize: 28, flexShrink: 0 }}>❓</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 2 }}>{bank.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>{bank.question_count} questions</div>
              </div>
              {isTeacher && (
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { setEditingBank(bank); setBankForm({ title: bank.title }) }} title="Edit">✎</button>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteBank(bank.id)} title="Delete" style={{ color: 'var(--cx-color-danger, #dc2626)' }}>🗑</button>
                </div>
              )}
              <span style={{ color: 'var(--cx-text-tertiary)', fontSize: '1.2rem' }}>›</span>
            </li>
          ))}
        </ul>
      )}

      {/* Bank edit modal */}
      {editingBank && (
        <div className="cx-modal-overlay" onClick={() => setEditingBank(null)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="cx-modal__header">
              <h3 className="cx-modal__title">{editingBank.id ? 'Edit Bank' : 'New Question Bank'}</h3>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditingBank(null)}>✕</button>
            </div>
            <div className="cx-modal__body">
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Title *</label>
              <input type="text" className="cx-input" value={bankForm.title} onChange={e => setBankForm({ title: e.target.value })} placeholder="e.g. Midterm Review" style={{ width: '100%' }} />
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setEditingBank(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSaveBank}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
