/**
 * QuestionBanks — ClassApex LMS (S24)
 * ======================================
 * Canvas REST API:
 *  GET/POST /api/v1/courses/:courseId/assessment_question_banks
 *  GET/POST /api/v1/courses/:courseId/assessment_question_banks/:bankId/assessment_questions
 *  PUT/DELETE /api/v1/courses/:courseId/assessment_question_banks/:bankId
 *  PUT/DELETE /api/v1/courses/:courseId/assessment_question_banks/:bankId/assessment_questions/:qId
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
  answers?: Array<{
    id?: number
    text?: string
    html?: string
    weight?: number
    blank_id?: string
  }>
  hotspot_image_url?: string
  hotspot_coords?: Array<{ x: number; y: number; r: number }>
  stimulus_text?: string
  algorithmic_vars?: Array<{ name: string; min: number; max: number; decimal_places: number }>
}

type QuestionType =
  | 'essay_question'
  | 'file_upload_question'
  | 'fill_in_multiple_blanks_question'
  | 'matching_question'
  | 'multiple_answers_question'
  | 'multiple_choice_question'
  | 'multiple_dropdowns_question'
  | 'numerical_question'
  | 'short_answer_question'
  | 'text_only_question'
  | 'true_false_question'
  | 'hotspot_question'
  | 'ordering_question'
  | 'stimulus_question'
  | 'algorithmic_question'

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  essay_question: 'Essay',
  file_upload_question: 'File Upload',
  fill_in_multiple_blanks_question: 'Fill in Multiple Blanks',
  matching_question: 'Matching',
  multiple_answers_question: 'Multiple Answers',
  multiple_choice_question: 'Multiple Choice',
  multiple_dropdowns_question: 'Multiple Dropdowns',
  numerical_question: 'Numerical',
  short_answer_question: 'Short Answer',
  text_only_question: 'Text (No Question)',
  true_false_question: 'True/False',
  hotspot_question: 'Hotspot (Click on Image)',
  ordering_question: 'Ordering (Sequence)',
  stimulus_question: 'Stimulus / Passage Set',
  algorithmic_question: 'Algorithmic (Dynamic Variables)',
}

const QUESTION_TYPES = Object.entries(QUESTION_TYPE_LABELS) as [QuestionType, string][]

interface QuestionForm {
  question_name: string
  question_type: QuestionType
  question_text: string
  points_possible: number
  answers: Array<{ text: string; weight: number; blank_id?: string }>
  hotspot_image_url?: string
  hotspot_coords?: Array<{ x: number; y: number; r: number }>
  stimulus_text?: string
  algorithmic_vars?: Array<{ name: string; min: number; max: number; decimal_places: number }>
}

function blankForm(): QuestionForm {
  return {
    question_name: '',
    question_type: 'multiple_choice_question',
    question_text: '',
    points_possible: 1,
    answers: [
      { text: '', weight: 100 },
      { text: '', weight: 0 },
    ],
    hotspot_image_url: '',
    hotspot_coords: [],
    stimulus_text: '',
    algorithmic_vars: [],
  }
}

function questionToForm(q: BankQuestion): QuestionForm {
  return {
    question_name: q.question_name || '',
    question_type: (q.question_type as QuestionType) || 'multiple_choice_question',
    question_text: q.question_text || '',
    points_possible: q.points_possible ?? 1,
    answers: (q.answers || []).map(a => ({
      text: a.text || a.html || '',
      weight: a.weight ?? 0,
      blank_id: a.blank_id,
    })),
    hotspot_image_url: q.hotspot_image_url || '',
    hotspot_coords: q.hotspot_coords || [],
    stimulus_text: q.stimulus_text || '',
    algorithmic_vars: q.algorithmic_vars || [],
  }
}

function buildAnswersForType(type: QuestionType, answers: QuestionForm['answers']) {
  switch (type) {
    case 'true_false_question':
      return [
        { text: 'True', weight: 100 },
        { text: 'False', weight: 0 },
      ]
    case 'essay_question':
    case 'file_upload_question':
    case 'text_only_question':
    case 'hotspot_question':
    case 'stimulus_question':
    case 'algorithmic_question':
      return []
    case 'ordering_question':
      return answers.map((a, i) => ({ text: a.text, weight: a.weight, blank_id: String(i + 1) }))
    default:
      return answers.map(a => ({ text: a.text, weight: a.weight }))
  }
}

export default function QuestionBanksPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const isTeacher = role === 'teacher' || role === 'admin'
  const { showToast, showConfirm } = useNotification()
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null)
  const [editingBank, setEditingBank] = useState<any | null>(null)
  const [bankForm, setBankForm] = useState({ title: '' })

  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null)
  const [questionModalOpen, setQuestionModalOpen] = useState(false)
  const [questionForm, setQuestionForm] = useState<QuestionForm>(blankForm())

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

  const openNewQuestion = () => {
    setEditingQuestion(null)
    setQuestionForm(blankForm())
    setQuestionModalOpen(true)
  }

  const openEditQuestion = (q: BankQuestion) => {
    setEditingQuestion(q)
    setQuestionForm(questionToForm(q))
    setQuestionModalOpen(true)
  }

  const closeQuestionModal = () => {
    setQuestionModalOpen(false)
    setEditingQuestion(null)
    setQuestionForm(blankForm())
  }

  const handleSaveQuestion = async () => {
    if (!selectedBank) return
    if (!questionForm.question_name.trim()) {
      showToast({ title: 'Question name is required', type: 'warning' })
      return
    }
    if (!questionForm.question_text.trim() && questionForm.question_type !== 'text_only_question') {
      showToast({ title: 'Question text is required', type: 'warning' })
      return
    }

    const payload: any = {
      assessment_questions: [{
        question_name: questionForm.question_name.trim(),
        question_type: questionForm.question_type,
        question_text: questionForm.question_text.trim(),
        points_possible: questionForm.points_possible,
        answers: buildAnswersForType(questionForm.question_type, questionForm.answers),
      }],
    }
    if (questionForm.hotspot_image_url) payload.assessment_questions[0].hotspot_image_url = questionForm.hotspot_image_url
    if (questionForm.stimulus_text) payload.assessment_questions[0].stimulus_text = questionForm.stimulus_text
    if (questionForm.algorithmic_vars?.length) payload.assessment_questions[0].algorithmic_vars = questionForm.algorithmic_vars

    try {
      if (editingQuestion?.id) {
        await canvasFetch(
          `/api/v1/courses/${courseId}/assessment_question_banks/${selectedBank.id}/assessment_questions/${editingQuestion.id}`,
          { method: 'PUT', body: payload }
        )
      } else {
        await canvasFetch(
          `/api/v1/courses/${courseId}/assessment_question_banks/${selectedBank.id}/assessment_questions`,
          { method: 'POST', body: payload }
        )
      }
      showToast({ title: `Question ${editingQuestion?.id ? 'updated' : 'created'}`, type: 'success' })
      closeQuestionModal()
      refetchQuestions()
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const needsAnswers = (type: QuestionType) => {
    switch (type) {
      case 'essay_question':
      case 'file_upload_question':
      case 'text_only_question':
      case 'hotspot_question':
      case 'ordering_question':
      case 'stimulus_question':
      case 'algorithmic_question':
        return false
      default:
        return true
    }
  }

  const resetAnswersForType = (type: QuestionType) => {
    switch (type) {
      case 'true_false_question':
        return [
          { text: 'True', weight: 100 },
          { text: 'False', weight: 0 },
        ]
      case 'short_answer_question':
      case 'fill_in_multiple_blanks_question':
        return [{ text: '', weight: 100 }]
      case 'ordering_question':
        return [
          { text: '', weight: 100, blank_id: '1' },
          { text: '', weight: 0, blank_id: '2' },
        ]
      default:
        return [
          { text: '', weight: 100 },
          { text: '', weight: 0 },
        ]
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
          <div style={{ display: 'flex', gap: 8 }}>
            {isTeacher && (
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={openNewQuestion}>+ Add Question</button>
            )}
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setSelectedBank(null)}>← Back to Banks</button>
          </div>
        </div>

        {questionsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map(i => <div key={i} className="cx-skeleton" style={{ height: 64, borderRadius: 10 }} />)}
          </div>
        ) : !questions || questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cx-text-tertiary)' }}>
            <p>No questions in this bank yet.</p>
            {isTeacher && (
              <button className="cx-btn cx-btn--primary" style={{ marginTop: 12 }} onClick={openNewQuestion}>Add your first question</button>
            )}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {questions.map(q => (
              <li key={q.id} className="cx-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginBottom: 2 }}>{q.question_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)' }}>
                    {QUESTION_TYPE_LABELS[q.question_type as QuestionType] || q.question_type.replace(/_/g, ' ')} · {q.points_possible} pts
                    {(q.question_type === 'numerical_question' || q.question_type === 'formula_question') && <span style={{ marginLeft: 4, fontSize: '0.65rem', padding: '1px 4px', borderRadius: 4, background: 'rgba(99,102,241,0.12)', color: '#4f46e5' }}>Formula</span>}
                    {q.question_type === 'file_upload_question' && <span style={{ marginLeft: 4, fontSize: '0.65rem', padding: '1px 4px', borderRadius: 4, background: 'rgba(16,185,129,0.12)', color: '#059669' }}>File Upload</span>}
                    {q.question_type === 'hotspot_question' && <span style={{ marginLeft: 4, fontSize: '0.65rem', padding: '1px 4px', borderRadius: 4, background: 'rgba(59,130,246,0.12)', color: '#2563eb' }}>Hotspot</span>}
                    {q.question_type === 'ordering_question' && <span style={{ marginLeft: 4, fontSize: '0.65rem', padding: '1px 4px', borderRadius: 4, background: 'rgba(168,85,247,0.12)', color: '#9333ea' }}>Ordering</span>}
                    {q.question_type === 'stimulus_question' && <span style={{ marginLeft: 4, fontSize: '0.65rem', padding: '1px 4px', borderRadius: 4, background: 'rgba(249,115,22,0.12)', color: '#ea580c' }}>Stimulus</span>}
                    {q.question_type === 'algorithmic_question' && <span style={{ marginLeft: 4, fontSize: '0.65rem', padding: '1px 4px', borderRadius: 4, background: 'rgba(79,70,229,0.12)', color: '#4338ca' }}>Algorithmic</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-secondary)', marginTop: 4 }} dangerouslySetInnerHTML={{ __html: q.question_text }} />
                </div>
                {isTeacher && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => openEditQuestion(q)} title="Edit">✎</button>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteQuestion(selectedBank.id, q.id)} style={{ color: 'var(--cx-color-danger, #dc2626)' }} title="Delete">🗑</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Question edit/create modal */}
        {questionModalOpen && (
          <div className="cx-modal-overlay" onClick={closeQuestionModal}>
            <div className="cx-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="cx-modal__header">
                <h3 className="cx-modal__title">{editingQuestion?.id ? 'Edit Question' : 'New Question'}</h3>
                <button className="cx-btn cx-btn--ghost" onClick={closeQuestionModal}>✕</button>
              </div>
                  <div className="cx-modal__body" style={{ overflow: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Question Name *</label>
                        <input
                          type="text"
                          className="cx-input"
                          value={questionForm.question_name}
                          onChange={e => setQuestionForm(prev => ({ ...prev, question_name: e.target.value }))}
                          placeholder="e.g. Q1 - Photosynthesis"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Type</label>
                          <select
                            className="cx-select"
                            value={questionForm.question_type}
                            onChange={e => {
                              const newType = e.target.value as QuestionType
                              setQuestionForm(prev => ({
                                ...prev,
                                question_type: newType,
                                answers: resetAnswersForType(newType),
                              }))
                            }}
                            style={{ width: '100%' }}
                          >
                            {QUESTION_TYPES.map(([type, label]) => (
                              <option key={type} value={type}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ width: 120 }}>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Points</label>
                          <input
                            type="number"
                            className="cx-input"
                            value={questionForm.points_possible}
                            onChange={e => setQuestionForm(prev => ({ ...prev, points_possible: Number(e.target.value) }))}
                            min={0}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Question Text *</label>
                        <textarea
                          className="cx-input"
                          value={questionForm.question_text}
                          onChange={e => setQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
                          placeholder="Enter question text… HTML is supported."
                          rows={4}
                          style={{ width: '100%', resize: 'vertical' }}
                        />
                      </div>

                      {questionForm.question_type === 'hotspot_question' && (
                        <div>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Background Image URL</label>
                          <input
                            type="text"
                            className="cx-input"
                            value={questionForm.hotspot_image_url || ''}
                            onChange={e => setQuestionForm(prev => ({ ...prev, hotspot_image_url: e.target.value }))}
                            placeholder="https://example.com/image.png"
                            style={{ width: '100%' }}
                          />
                          <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
                            Hotspot questions require a background image. Students click on regions to answer.
                          </p>
                        </div>
                      )}

                      {questionForm.question_type === 'ordering_question' && (
                        <div>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Items (in correct order)</label>
                          <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginBottom: 8 }}>
                            Enter items in the correct order. Students will drag to sequence them.
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {questionForm.answers.map((ans, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', width: 20 }}>{idx + 1}.</span>
                                <input
                                  type="text"
                                  className="cx-input"
                                  value={ans.text}
                                  onChange={e => {
                                    setQuestionForm(prev => {
                                      const next = [...prev.answers]
                                      next[idx] = { ...next[idx], text: e.target.value }
                                      return { ...prev, answers: next }
                                    })
                                  }}
                                  placeholder={`Item ${idx + 1}`}
                                  style={{ flex: 1 }}
                                />
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button
                                    className="cx-btn cx-btn--ghost cx-btn--sm"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      setQuestionForm(prev => {
                                        const next = [...prev.answers]
                                        const temp = next[idx]
                                        next[idx] = next[idx - 1]
                                        next[idx - 1] = temp
                                        return { ...prev, answers: next }
                                      })
                                    }}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    className="cx-btn cx-btn--ghost cx-btn--sm"
                                    disabled={idx === questionForm.answers.length - 1}
                                    onClick={() => {
                                      setQuestionForm(prev => {
                                        const next = [...prev.answers]
                                        const temp = next[idx]
                                        next[idx] = next[idx + 1]
                                        next[idx + 1] = temp
                                        return { ...prev, answers: next }
                                      })
                                    }}
                                  >
                                    ↓
                                  </button>
                                  <button
                                    className="cx-btn cx-btn--ghost cx-btn--sm"
                                    onClick={() => {
                                      setQuestionForm(prev => ({
                                        ...prev,
                                        answers: prev.answers.filter((_, i) => i !== idx),
                                      }))
                                    }}
                                    style={{ color: 'var(--cx-color-danger)' }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              className="cx-btn cx-btn--secondary cx-btn--sm"
                              onClick={() => {
                                setQuestionForm(prev => ({
                                  ...prev,
                                  answers: [...prev.answers, { text: '', weight: 0, blank_id: String(prev.answers.length + 1) }],
                                }))
                              }}
                            >
                              + Add Item
                            </button>
                          </div>
                        </div>
                      )}

                      {questionForm.question_type === 'stimulus_question' && (
                        <div>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Passage / Stimulus Text</label>
                          <textarea
                            className="cx-input"
                            value={questionForm.stimulus_text || ''}
                            onChange={e => setQuestionForm(prev => ({ ...prev, stimulus_text: e.target.value }))}
                            placeholder="Enter the passage or stimulus text here…"
                            rows={6}
                            style={{ width: '100%', resize: 'vertical' }}
                          />
                          <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginTop: 4 }}>
                            Stimulus questions present a passage followed by related sub-questions.
                          </p>
                        </div>
                      )}

                      {questionForm.question_type === 'algorithmic_question' && (
                        <div>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Dynamic Variables</label>
                          <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', marginBottom: 8 }}>
                            Use {'{{variable_name}}'} in question text. Values will be randomized per student.
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(questionForm.algorithmic_vars || []).map((v, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                  type="text"
                                  className="cx-input"
                                  value={v.name}
                                  onChange={e => {
                                    setQuestionForm(prev => {
                                      const next = [...(prev.algorithmic_vars || [])]
                                      next[idx] = { ...next[idx], name: e.target.value }
                                      return { ...prev, algorithmic_vars: next }
                                    })
                                  }}
                                  placeholder="Name"
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="number"
                                  className="cx-input"
                                  value={v.min}
                                  onChange={e => {
                                    setQuestionForm(prev => {
                                      const next = [...(prev.algorithmic_vars || [])]
                                      next[idx] = { ...next[idx], min: Number(e.target.value) }
                                      return { ...prev, algorithmic_vars: next }
                                    })
                                  }}
                                  placeholder="Min"
                                  style={{ width: 80 }}
                                />
                                <input
                                  type="number"
                                  className="cx-input"
                                  value={v.max}
                                  onChange={e => {
                                    setQuestionForm(prev => {
                                      const next = [...(prev.algorithmic_vars || [])]
                                      next[idx] = { ...next[idx], max: Number(e.target.value) }
                                      return { ...prev, algorithmic_vars: next }
                                    })
                                  }}
                                  placeholder="Max"
                                  style={{ width: 80 }}
                                />
                                <input
                                  type="number"
                                  className="cx-input"
                                  value={v.decimal_places}
                                  onChange={e => {
                                    setQuestionForm(prev => {
                                      const next = [...(prev.algorithmic_vars || [])]
                                      next[idx] = { ...next[idx], decimal_places: Number(e.target.value) }
                                      return { ...prev, algorithmic_vars: next }
                                    })
                                  }}
                                  placeholder="Decimals"
                                  style={{ width: 80 }}
                                />
                                <button
                                  className="cx-btn cx-btn--ghost cx-btn--sm"
                                  onClick={() => {
                                    setQuestionForm(prev => ({
                                      ...prev,
                                      algorithmic_vars: (prev.algorithmic_vars || []).filter((_, i) => i !== idx),
                                    }))
                                  }}
                                  style={{ color: 'var(--cx-color-danger)' }}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              className="cx-btn cx-btn--secondary cx-btn--sm"
                              onClick={() => {
                                setQuestionForm(prev => ({
                                  ...prev,
                                  algorithmic_vars: [...(prev.algorithmic_vars || []), { name: '', min: 0, max: 10, decimal_places: 0 }],
                                }))
                              }}
                            >
                              + Add Variable
                            </button>
                          </div>
                        </div>
                      )}

                      {needsAnswers(questionForm.question_type) && (
                        <div>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 6 }}>Answers</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {questionForm.answers.map((ans, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                  type={questionForm.question_type === 'multiple_answers_question' ? 'checkbox' : 'radio'}
                                  checked={ans.weight === 100}
                                  onChange={() => {
                                    setQuestionForm(prev => {
                                      const next = [...prev.answers]
                                      if (questionForm.question_type === 'multiple_answers_question') {
                                        next[idx] = { ...next[idx], weight: next[idx].weight === 100 ? 0 : 100 }
                                      } else {
                                        next.forEach((a, i) => { a.weight = i === idx ? 100 : 0 })
                                      }
                                      return { ...prev, answers: next }
                                    })
                                  }}
                                  style={{ accentColor: 'var(--cx-color-primary)', cursor: 'pointer' }}
                                  title={ans.weight === 100 ? 'Correct' : 'Incorrect'}
                                />
                                <input
                                  type="text"
                                  className="cx-input"
                                  value={ans.text}
                                  onChange={e => {
                                    setQuestionForm(prev => {
                                      const next = [...prev.answers]
                                      next[idx] = { ...next[idx], text: e.target.value }
                                      return { ...prev, answers: next }
                                    })
                                  }}
                                  placeholder={`Answer ${idx + 1}`}
                                  style={{ flex: 1 }}
                                />
                                {questionForm.answers.length > 1 && (
                                  <button
                                    className="cx-btn cx-btn--ghost cx-btn--sm"
                                    onClick={() => {
                                      setQuestionForm(prev => ({
                                        ...prev,
                                        answers: prev.answers.filter((_, i) => i !== idx),
                                      }))
                                    }}
                                    style={{ color: 'var(--cx-color-danger)' }}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              className="cx-btn cx-btn--secondary cx-btn--sm"
                              onClick={() => {
                                setQuestionForm(prev => ({
                                  ...prev,
                                  answers: [...prev.answers, { text: '', weight: 0 }],
                                }))
                              }}
                            >
                              + Add Answer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              <div className="cx-modal__footer">
                <button className="cx-btn cx-btn--secondary" onClick={closeQuestionModal}>Cancel</button>
                <button className="cx-btn cx-btn--primary" onClick={handleSaveQuestion}>
                  {editingQuestion?.id ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
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
