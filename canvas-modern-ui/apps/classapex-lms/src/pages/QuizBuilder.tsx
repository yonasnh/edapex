import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import NewRceWrapper from '../components/NewRceWrapper'
import { useNotification } from '../hooks/useNotification'
import { useRole } from '../contexts/RoleContext'
import LogoLoader from '../components/LogoLoader'

type QuestionType =
  | 'multiple_choice_question'
  | 'true_false_question'
  | 'essay_question'
  | 'short_answer_question'
  | 'matching_question'
  | 'multiple_answers_question'
  | 'numerical_question'
  | 'calculated_question'
  | 'fill_in_multiple_blanks_question'

interface QuestionForm {
  id?: number
  question_name: string
  question_type: QuestionType
  question_text: string
  points_possible: number
  answers: any[]
}

interface QuestionGroup {
  id: number
  name: string
  pick_count: number
  question_points: number
}

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice_question', label: 'Multiple Choice' },
  { value: 'true_false_question', label: 'True / False' },
  { value: 'essay_question', label: 'Essay' },
  { value: 'short_answer_question', label: 'Fill in the Blank' },
  { value: 'matching_question', label: 'Matching' },
  { value: 'multiple_answers_question', label: 'Multiple Answers' },
  { value: 'numerical_question', label: 'Numerical' },
  { value: 'calculated_question', label: 'Formula' },
  { value: 'fill_in_multiple_blanks_question', label: 'Fill in Multiple Blanks' },
]

function emptyAnswers(type: QuestionType): any[] {
  switch (type) {
    case 'multiple_choice_question':
      return [
        { answer_text: '', answer_weight: 100 },
        { answer_text: '', answer_weight: 0 },
        { answer_text: '', answer_weight: 0 },
      ]
    case 'true_false_question':
      return [
        { answer_text: 'True', answer_weight: 100 },
        { answer_text: 'False', answer_weight: 0 },
      ]
    case 'short_answer_question':
      return [{ answer_text: '', answer_weight: 100 }]
    case 'matching_question':
      return [
        { answer_match_left: '', answer_match_right: '' },
        { answer_match_left: '', answer_match_right: '' },
      ]
    case 'multiple_answers_question':
      return [
        { answer_text: '', answer_weight: 100 },
        { answer_text: '', answer_weight: 100 },
        { answer_text: '', answer_weight: 0 },
      ]
    case 'numerical_question':
      return [{ numerical_answer_type: 'exact_answer', exact: 0, margin: 0 }]
    case 'calculated_question':
      return [{ variables: [{ name: 'x', min: 1, max: 10, scale: 0 }], formulas: ['x + 5'], answer_tolerance: 0, formula_decimal_places: 2 }]
    case 'fill_in_multiple_blanks_question':
      return [
        { blank_id: 'blank1', answer_text: '', answer_weight: 100 },
        { blank_id: 'blank2', answer_text: '', answer_weight: 100 },
      ]
    default:
      return []
  }
}

export default function QuizBuilderPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>()
  const navigate = useNavigate()
  const { role } = useRole()
  const { showToast, showConfirm } = useNotification()
  const isTeacher = role === 'teacher' || role === 'admin'

  const { data: quiz, isLoading: quizLoading } = useCanvasQuery<any>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}` : ''
  )

  const { data: questionsData, isLoading: questionsLoading, refetch } = useCanvasQuery<any[]>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}/questions` : '',
    { per_page: 100 } as any
  )

  const { data: groupsData, isLoading: groupsLoading, refetch: refetchGroups } = useCanvasQuery<QuestionGroup[]>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}/groups` : '',
    { per_page: 50 } as any
  )

  const { data: submissionsData } = useCanvasQuery<any[]>(
    courseId && quizId ? `/api/v1/courses/${courseId}/quizzes/${quizId}/submissions` : '',
    { per_page: 1 } as any,
    { enabled: !!(courseId && quizId) }
  )
  const hasSubmissions = !!(submissionsData?.length || (quiz?.submission_count ?? 0) > 0)

  const [saving, setSaving] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionForm | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [regradeOption, setRegradeOption] = useState<'no_regrade' | 'full_credit' | 'current_correct_only' | 'current_and_previously_correct'>('no_regrade')

  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Partial<QuestionGroup> | null>(null)
  const [groupSaving, setGroupSaving] = useState(false)

  const questions = questionsData || []
  const groups = groupsData || []

  useEffect(() => {
    if (!isTeacher) {
      navigate(`/courses/${courseId}/quizzes`, { replace: true })
    }
  }, [isTeacher, courseId, navigate])

  const openCreate = () => {
    setEditingQuestion({
      question_name: '',
      question_type: 'multiple_choice_question',
      question_text: '',
      points_possible: 1,
      answers: emptyAnswers('multiple_choice_question'),
    })
    setShowModal(true)
  }

  const openEdit = (q: any) => {
    setEditingQuestion({
      id: q.id,
      question_name: q.question_name || '',
      question_type: q.question_type,
      question_text: q.question_text || '',
      points_possible: q.points_possible || 1,
      answers: q.answers ? q.answers.map((a: any) => ({ ...a })) : emptyAnswers(q.question_type),
    })
    setShowModal(true)
  }

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return
    if (!editingQuestion.question_text.trim()) {
      showToast({ title: 'Question text is required', type: 'warning' })
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, any> = {
        question: {
          question_name: editingQuestion.question_name.trim() || 'Question',
          question_type: editingQuestion.question_type,
          question_text: editingQuestion.question_text,
          points_possible: Number(editingQuestion.points_possible) || 1,
        }
      }

      // Format answers per Canvas expectations
      if (editingQuestion.question_type === 'multiple_choice_question') {
        payload.question.answers = editingQuestion.answers.map((a: any) => ({
          answer_text: a.answer_text || '',
          answer_weight: a.answer_weight || 0,
        }))
      } else if (editingQuestion.question_type === 'true_false_question') {
        payload.question.answers = editingQuestion.answers.map((a: any) => ({
          answer_text: a.answer_text,
          answer_weight: a.answer_weight,
        }))
      } else if (editingQuestion.question_type === 'short_answer_question') {
        payload.question.answers = editingQuestion.answers.map((a: any) => ({
          answer_text: a.answer_text || '',
          answer_weight: 100,
        }))
      } else if (editingQuestion.question_type === 'matching_question') {
        payload.question.answers = editingQuestion.answers.map((a: any) => ({
          answer_match_left: a.answer_match_left || '',
          answer_match_right: a.answer_match_right || '',
        }))
      } else if (editingQuestion.question_type === 'multiple_answers_question') {
        payload.question.answers = editingQuestion.answers.map((a: any) => ({
          answer_text: a.answer_text || '',
          answer_weight: a.answer_weight || 0,
        }))
      } else if (editingQuestion.question_type === 'numerical_question') {
        payload.question.answers = editingQuestion.answers.map((a: any) => ({
          numerical_answer_type: a.numerical_answer_type || 'exact_answer',
          exact: Number(a.exact) || 0,
          margin: Number(a.margin) || 0,
        }))
      } else if (editingQuestion.question_type === 'calculated_question') {
        const a = editingQuestion.answers[0] || {}
        payload.question.answers = [{
          variables: (a.variables || []).map((v: any) => ({
            name: v.name || 'x',
            min: Number(v.min) || 0,
            max: Number(v.max) || 10,
            scale: Number(v.scale) || 0,
          })),
          formulas: (a.formulas || []).map((f: any) => String(f)),
          answer_tolerance: Number(a.answer_tolerance) || 0,
          formula_decimal_places: Number(a.formula_decimal_places) || 2,
        }]
      } else if (editingQuestion.question_type === 'fill_in_multiple_blanks_question') {
        payload.question.answers = editingQuestion.answers.map((a: any) => ({
          blank_id: a.blank_id || '',
          answer_text: a.answer_text || '',
          answer_weight: 100,
        }))
      }

      if (editingQuestion.id) {
        // Include regrade option when editing a question with existing submissions
        if (hasSubmissions && regradeOption !== 'no_regrade') {
          payload.question.regrade_option = regradeOption
        }
        await canvasFetch(`/api/v1/courses/${courseId}/quizzes/${quizId}/questions/${editingQuestion.id}`, {
          method: 'PUT',
          body: payload,
        })
        showToast({ title: 'Question updated', type: 'success' })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/quizzes/${quizId}/questions`, {
          method: 'POST',
          body: payload,
        })
        showToast({ title: 'Question created', type: 'success' })
      }
      setShowModal(false)
      setRegradeOption('none')
      refetch()
    } catch (err: any) {
      showToast({ title: 'Failed to save question', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({
      title: 'Delete Question?',
      message: 'This question will be permanently removed.',
      type: 'danger',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/quizzes/${quizId}/questions/${id}`, { method: 'DELETE' })
      showToast({ title: 'Question deleted', type: 'success' })
      refetch()
    } catch (err: any) {
      showToast({ title: 'Failed to delete', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const openGroupCreate = () => {
    setEditingGroup({ name: '', pick_count: 1, question_points: 1 })
    setShowGroupModal(true)
  }

  const openGroupEdit = (g: QuestionGroup) => {
    setEditingGroup({ ...g })
    setShowGroupModal(true)
  }

  const handleSaveGroup = async () => {
    if (!editingGroup || !editingGroup.name?.trim()) {
      showToast({ title: 'Group name is required', type: 'warning' })
      return
    }
    setGroupSaving(true)
    try {
      const payload = {
        quiz_groups: [{
          name: editingGroup.name.trim(),
          pick_count: Math.max(1, Number(editingGroup.pick_count) || 1),
          question_points: Number(editingGroup.question_points) || 1,
        }]
      }
      if (editingGroup.id) {
        await canvasFetch(`/api/v1/courses/${courseId}/quizzes/${quizId}/groups/${editingGroup.id}`, {
          method: 'PUT',
          body: payload,
        })
        showToast({ title: 'Group updated', type: 'success' })
      } else {
        await canvasFetch(`/api/v1/courses/${courseId}/quizzes/${quizId}/groups`, {
          method: 'POST',
          body: payload,
        })
        showToast({ title: 'Group created', type: 'success' })
      }
      setShowGroupModal(false)
      refetchGroups()
    } catch (err: any) {
      showToast({ title: 'Failed to save group', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setGroupSaving(false)
    }
  }

  const handleDeleteGroup = async (id: number) => {
    const confirmed = await showConfirm({
      title: 'Delete Group?',
      message: 'Questions in this group will remain but will no longer be randomized.',
      type: 'danger',
      confirmLabel: 'Delete',
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/quizzes/${quizId}/groups/${id}`, { method: 'DELETE' })
      showToast({ title: 'Group deleted', type: 'success' })
      refetchGroups()
    } catch (err: any) {
      showToast({ title: 'Failed to delete group', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const handleTypeChange = (type: QuestionType) => {
    if (!editingQuestion) return
    setEditingQuestion({ ...editingQuestion, question_type: type, answers: emptyAnswers(type) })
  }

  const updateAnswer = (idx: number, patch: any) => {
    if (!editingQuestion) return
    const next = [...editingQuestion.answers]
    next[idx] = { ...next[idx], ...patch }
    setEditingQuestion({ ...editingQuestion, answers: next })
  }

  const addAnswer = () => {
    if (!editingQuestion) return
    const base = emptyAnswers(editingQuestion.question_type)[0] || {}
    setEditingQuestion({ ...editingQuestion, answers: [...editingQuestion.answers, { ...base }] })
  }

  const removeAnswer = (idx: number) => {
    if (!editingQuestion) return
    setEditingQuestion({ ...editingQuestion, answers: editingQuestion.answers.filter((_, i) => i !== idx) })
  }

  if (quizLoading || questionsLoading || groupsLoading) {
    return (
      <div className="cx-page">
        <LogoLoader text="Loading quiz builder…" />
      </div>
    )
  }

  return (
    <div className="cx-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--cx-text-xl)', color: 'var(--cx-text-primary)' }}>{quiz?.title || 'Quiz'} — Builder</h2>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--cx-text-sm)', color: 'var(--cx-text-secondary)' }}>{questions.length} question{questions.length !== 1 ? 's' : ''} · {quiz?.points_possible || 0} pts</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="cx-btn cx-btn--secondary" onClick={() => navigate(`/courses/${courseId}/quizzes`)}>Back to Quizzes</button>
          <button className="cx-btn cx-btn--primary" onClick={openCreate}>+ Add Question</button>
        </div>
      </div>

      {/* Question Groups */}
      {groups.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>Question Groups</h3>
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={openGroupCreate}>+ Add Group</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groups.map(g => (
              <div key={g.id} className="cx-assignment-card" style={{ padding: '12px 16px', background: 'var(--cx-bg-surface-raised)', borderLeft: '3px solid var(--cx-color-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--cx-text-primary)' }}>{g.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-tertiary)', marginTop: 2 }}>
                      Pick {g.pick_count} of {questions.filter((q: any) => q.quiz_group_id === g.id).length} questions · {g.question_points} pts each
                      <span style={{ marginLeft: 8, fontSize: '0.7rem', padding: '1px 6px', borderRadius: 8, background: 'rgba(99,102,241,0.12)', color: '#4f46e5', fontWeight: 600 }}>Randomized</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Edit group" onClick={() => openGroupEdit(g)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Delete group" onClick={() => handleDeleteGroup(g.id)} style={{ color: 'var(--cx-color-danger)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {questions.length === 0 && groups.length === 0 ? (
        <div className="cx-assignment-list__empty">
          <p className="cx-assignment-list__empty-text">No questions yet</p>
          <p className="cx-assignment-list__empty-hint">Add your first question or create a question group to build this quiz.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map((q, idx) => (
            <div key={q.id} className="cx-assignment-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{
                    background: q.quiz_group_id ? 'var(--cx-color-secondary, #8b5cf6)' : 'var(--cx-color-primary)', color: '#fff', borderRadius: '50%', width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  }}>{idx + 1}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--cx-text-primary)', fontSize: 'var(--cx-text-sm)' }} dangerouslySetInnerHTML={{ __html: q.question_text || q.question_name }} />
                    <div style={{ fontSize: 'var(--cx-text-xs)', color: 'var(--cx-text-tertiary)', marginTop: 2 }}>
                      {q.question_type.replace(/_/g, ' ')} · {q.points_possible} pts
                      {q.quiz_group_id && (
                        <span style={{ marginLeft: 8, fontSize: '0.7rem', padding: '1px 6px', borderRadius: 8, background: 'rgba(99,102,241,0.12)', color: '#4f46e5', fontWeight: 600 }}>
                          In Group: {groups.find((g: any) => g.id === q.quiz_group_id)?.name || 'Group'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Edit" onClick={() => openEdit(q)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" title="Delete" onClick={() => handleDelete(q.id)} style={{ color: 'var(--cx-color-danger)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showGroupModal && editingGroup && (
        <div className="cx-modal-overlay" onClick={() => setShowGroupModal(false)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{editingGroup.id ? 'Edit Question Group' : 'New Question Group'}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowGroupModal(false)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg>
              </button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Group Name <span style={{ color: 'var(--cx-color-danger)' }}>*</span></label>
                <input type="text" className="cx-input" style={{ width: '100%' }} value={editingGroup.name || ''} onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })} placeholder="e.g. Random Section A" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Questions to Pick</label>
                  <input type="number" className="cx-input" style={{ width: '100%' }} min={1} value={editingGroup.pick_count || 1} onChange={e => setEditingGroup({ ...editingGroup, pick_count: Number(e.target.value) })} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', margin: '4px 0 0' }}>Number randomly selected from group</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Points per Question</label>
                  <input type="number" className="cx-input" style={{ width: '100%' }} min={0} step={0.5} value={editingGroup.question_points || 1} onChange={e => setEditingGroup({ ...editingGroup, question_points: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowGroupModal(false)} disabled={groupSaving}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSaveGroup} disabled={groupSaving || !editingGroup.name?.trim()}>
                {groupSaving ? 'Saving…' : editingGroup.id ? 'Update Group' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && editingQuestion && (
        <div className="cx-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{editingQuestion.id ? 'Edit Question' : 'New Question'}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowModal(false)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg>
              </button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-04)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Question Text <span style={{ color: 'var(--cx-color-danger)' }}>*</span></label>
                  <NewRceWrapper
                    value={editingQuestion.question_text || ''}
                    onChange={html => setEditingQuestion({ ...editingQuestion, question_text: html })}
                    placeholder="Enter your question..."
                    minHeight={80}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Type</label>
                  <select className="cx-input" style={{ width: '100%' }} value={editingQuestion.question_type} onChange={e => handleTypeChange(e.target.value as QuestionType)}>
                    {QUESTION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Points</label>
                  <input type="number" className="cx-input" style={{ width: '100%' }} min={0} step={0.5} value={editingQuestion.points_possible} onChange={e => setEditingQuestion({ ...editingQuestion, points_possible: Number(e.target.value) })} />
                </div>
              </div>

              {/* Regrade option selector for existing submissions */}
              {editingQuestion.id && hasSubmissions && (
                <div style={{ padding: 12, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cx-color-warning, #d97706)', marginBottom: 8 }}>
                    ⚠️ Existing Submissions — Regrade Option
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: '0 0 10px 0' }}>
                    This quiz has existing submissions. Choose how to regrade previously submitted answers:
                  </p>
                  <select
                    className="cx-input"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                    value={regradeOption}
                    onChange={e => setRegradeOption(e.target.value as any)}
                  >
                    <option value="no_regrade">No regrade (apply to future attempts only)</option>
                    <option value="full_credit">Award full credit to all students</option>
                    <option value="current_correct_only">Give points to students who selected the now-correct answer</option>
                    <option value="current_and_previously_correct">Give points to students who selected the now-correct or previously correct answer</option>
                  </select>
                </div>
              )}

              {/* Answer editor */}
              {editingQuestion.question_type !== 'essay_question' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)' }}>{editingQuestion.question_type === 'calculated_question' ? 'Formula Configuration' : 'Answers'}</label>
                    {editingQuestion.question_type !== 'calculated_question' && (
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={addAnswer}>+ Add Answer</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {editingQuestion.answers.map((ans, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--cx-border-subtle)', background: 'var(--cx-bg-surface)' }}>
                        {/* Multiple Choice / Multiple Answers / Short Answer */}
                        {(editingQuestion.question_type === 'multiple_choice_question' || editingQuestion.question_type === 'multiple_answers_question' || editingQuestion.question_type === 'short_answer_question') && (
                          <>
                            <input
                              type="text"
                              className="cx-input"
                              style={{ flex: 1 }}
                              value={ans.answer_text || ''}
                              onChange={e => updateAnswer(idx, { answer_text: e.target.value })}
                              placeholder="Answer text"
                            />
                            {(editingQuestion.question_type === 'multiple_choice_question' || editingQuestion.question_type === 'multiple_answers_question') && (
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                <input
                                  type="checkbox"
                                  checked={(ans.answer_weight || 0) > 0}
                                  onChange={e => updateAnswer(idx, { answer_weight: e.target.checked ? 100 : 0 })}
                                />
                                Correct
                              </label>
                            )}
                          </>
                        )}

                        {/* True/False */}
                        {editingQuestion.question_type === 'true_false_question' && (
                          <span style={{ flex: 1, fontSize: 'var(--cx-text-sm)' }}>{ans.answer_text}</span>
                        )}
                        {editingQuestion.question_type === 'true_false_question' && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                            <input
                              type="radio"
                              name="tf-correct"
                              checked={(ans.answer_weight || 0) > 0}
                              onChange={() => {
                                const next = editingQuestion.answers.map((a: any, i: number) => ({ ...a, answer_weight: i === idx ? 100 : 0 }))
                                setEditingQuestion({ ...editingQuestion, answers: next })
                              }}
                            />
                            Correct
                          </label>
                        )}

                        {/* Matching */}
                        {editingQuestion.question_type === 'matching_question' && (
                          <>
                            <input type="text" className="cx-input" style={{ flex: 1 }} value={ans.answer_match_left || ''} onChange={e => updateAnswer(idx, { answer_match_left: e.target.value })} placeholder="Left side" />
                            <span style={{ color: 'var(--cx-text-tertiary)' }}>→</span>
                            <input type="text" className="cx-input" style={{ flex: 1 }} value={ans.answer_match_right || ''} onChange={e => updateAnswer(idx, { answer_match_right: e.target.value })} placeholder="Right side" />
                          </>
                        )}

                        {/* Numerical */}
                        {editingQuestion.question_type === 'numerical_question' && (
                          <>
                            <input type="number" className="cx-input" style={{ flex: 1 }} value={ans.exact || 0} onChange={e => updateAnswer(idx, { exact: Number(e.target.value) })} placeholder="Exact answer" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', whiteSpace: 'nowrap' }}>±</span>
                            <input type="number" className="cx-input" style={{ width: 80 }} value={ans.margin || 0} onChange={e => updateAnswer(idx, { margin: Number(e.target.value) })} placeholder="Margin" />
                          </>
                        )}

                        {/* Formula / Calculated */}
                        {editingQuestion.question_type === 'calculated_question' && (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--cx-text-secondary)' }}>
                              Define variables and formulas. Use <code style={{ background: 'var(--cx-bg-surface-raised)', padding: '1px 4px', borderRadius: 4 }}>{'[variable]'}</code> in question text.
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Variables</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {(ans.variables || []).map((v: any, vIdx: number) => (
                                  <div key={vIdx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input type="text" className="cx-input" style={{ width: 80 }} value={v.name || ''} onChange={e => {
                                      const nextVars = [...(ans.variables || [])]
                                      nextVars[vIdx] = { ...nextVars[vIdx], name: e.target.value }
                                      updateAnswer(idx, { variables: nextVars })
                                    }} placeholder="Name" />
                                    <input type="number" className="cx-input" style={{ width: 70 }} value={v.min ?? 0} onChange={e => {
                                      const nextVars = [...(ans.variables || [])]
                                      nextVars[vIdx] = { ...nextVars[vIdx], min: Number(e.target.value) }
                                      updateAnswer(idx, { variables: nextVars })
                                    }} placeholder="Min" />
                                    <span style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.75rem' }}>to</span>
                                    <input type="number" className="cx-input" style={{ width: 70 }} value={v.max ?? 10} onChange={e => {
                                      const nextVars = [...(ans.variables || [])]
                                      nextVars[vIdx] = { ...nextVars[vIdx], max: Number(e.target.value) }
                                      updateAnswer(idx, { variables: nextVars })
                                    }} placeholder="Max" />
                                    <input type="number" className="cx-input" style={{ width: 60 }} value={v.scale ?? 0} onChange={e => {
                                      const nextVars = [...(ans.variables || [])]
                                      nextVars[vIdx] = { ...nextVars[vIdx], scale: Number(e.target.value) }
                                      updateAnswer(idx, { variables: nextVars })
                                    }} placeholder="Scale" />
                                    <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => {
                                      const nextVars = (ans.variables || []).filter((_: any, i: number) => i !== vIdx)
                                      updateAnswer(idx, { variables: nextVars })
                                    }} style={{ color: 'var(--cx-color-danger)' }}>✕</button>
                                  </div>
                                ))}
                                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => {
                                  const nextVars = [...(ans.variables || []), { name: '', min: 1, max: 10, scale: 0 }]
                                  updateAnswer(idx, { variables: nextVars })
                                }} style={{ alignSelf: 'flex-start' }}>+ Add Variable</button>
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Formulas (one per line)</label>
                              <textarea className="cx-input" rows={3} value={(ans.formulas || []).join('\n')} onChange={e => {
                                updateAnswer(idx, { formulas: e.target.value.split('\n').filter((l: string) => l.trim()) })
                              }} placeholder="x + 5&#10;y * 2" style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--cm-font-family-mono, monospace)' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Answer Tolerance</label>
                                <input type="number" className="cx-input" style={{ width: '100%' }} value={ans.answer_tolerance ?? 0} onChange={e => updateAnswer(idx, { answer_tolerance: Number(e.target.value) })} placeholder="0" />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>Decimal Places</label>
                                <input type="number" className="cx-input" style={{ width: '100%' }} value={ans.formula_decimal_places ?? 2} onChange={e => updateAnswer(idx, { formula_decimal_places: Number(e.target.value) })} placeholder="2" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Fill in Multiple Blanks */}
                        {editingQuestion.question_type === 'fill_in_multiple_blanks_question' && (
                          <>
                            <input type="text" className="cx-input" style={{ width: 100 }} value={ans.blank_id || ''} onChange={e => updateAnswer(idx, { blank_id: e.target.value })} placeholder="Blank ID" />
                            <input type="text" className="cx-input" style={{ flex: 1 }} value={ans.answer_text || ''} onChange={e => updateAnswer(idx, { answer_text: e.target.value })} placeholder="Correct answer" />
                          </>
                        )}

                        {editingQuestion.question_type !== 'calculated_question' && editingQuestion.question_type !== 'fill_in_multiple_blanks_question' && (
                          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => removeAnswer(idx)} style={{ color: 'var(--cx-color-danger)' }} title="Remove">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={handleSaveQuestion} disabled={saving || !editingQuestion.question_text.trim()}>
                {saving ? 'Saving…' : editingQuestion.id ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
