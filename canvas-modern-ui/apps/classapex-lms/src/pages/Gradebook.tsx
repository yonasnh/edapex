import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { useRole } from '../contexts/RoleContext'
import MessageStudentsWho from '../components/MessageStudentsWho'
import BulkOperationsBar from '../components/BulkOperationsBar'
import LogoLoader from '../components/LogoLoader'

interface CellState {
  value: string
  saving: boolean
  saved: boolean
}

interface ImportChange {
  userId: number
  userName: string
  assignmentId: number
  assignmentName: string
  oldValue: string
  newValue: string
}

function escapeCsv(value: string): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        cell += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        row.push(cell)
        cell = ''
      } else if (char === '\n') {
        row.push(cell)
        rows.push(row)
        row = []
        cell = ''
      } else if (char === '\r') {
        // ignore carriage return
      } else {
        cell += char
      }
    }
  }
  row.push(cell)
  if (row.length > 0) rows.push(row)
  return rows
}

/**
 * Compute which assignments are dropped for a given student within an assignment group,
 * based on the group's drop_lowest / drop_highest rules.
 * Canvas does not expose dropped status per-submission, so we re-calculate client-side.
 */
function computeDroppedAssignments(
  userId: number,
  groupAssignments: any[],
  getSubmission: (uid: number, aid: number) => any,
  rules: any
): Set<number> {
  if (!rules) return new Set()
  const dropLowest = rules.drop_lowest || 0
  const dropHighest = rules.drop_highest || 0
  if (dropLowest === 0 && dropHighest === 0) return new Set()

  const neverDrop = new Set<number>(Array.isArray(rules.never_drop) ? rules.never_drop : [])

  const scored = groupAssignments
    .map((a: any) => ({
      assignmentId: a.id,
      sub: getSubmission(userId, a.id),
      pointsPossible: a.points_possible ?? 0,
    }))
    .filter(({ assignmentId, sub, pointsPossible }) => {
      if (pointsPossible <= 0) return false
      if (neverDrop.has(assignmentId)) return false
      if (sub?.excused || sub?.grade === 'EX' || sub?.posted_grade === 'EX') return false
      return true
    })
    .map(({ assignmentId, sub }) => ({
      assignmentId,
      score: sub?.score != null ? sub.score : 0,
    }))

  // Must have more scorable assignments than drops
  if (scored.length <= dropLowest + dropHighest) return new Set()

  const dropped = new Set<number>()
  const sorted = [...scored].sort((a, b) => a.score - b.score)

  for (let i = 0; i < dropLowest; i++) {
    dropped.add(sorted[i].assignmentId)
  }

  const remaining = sorted.filter(s => !dropped.has(s.assignmentId))
  const remainingDesc = [...remaining].sort((a, b) => b.score - a.score)
  for (let i = 0; i < dropHighest; i++) {
    if (remainingDesc[i]) {
      dropped.add(remainingDesc[i].assignmentId)
    }
  }

  return dropped
}

export default function GradebookPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { role } = useRole()
  const { showToast, showConfirm } = useNotification()

  // Redirect students to their grades view
  useEffect(() => {
    if (role === 'student') {
      navigate(`/grades?courseId=${courseId}`, { replace: true })
    }
  }, [role, courseId, navigate])

  const [search, setSearch] = useState('')
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({})
  const [overrideScores, setOverrideScores] = useState<Record<string, string>>({})
  const [overrideSaving, setOverrideSaving] = useState<Record<string, boolean>>({})

  // CSV import states
  const [showImportModal, setShowImportModal] = useState(false)
  const [importChanges, setImportChanges] = useState<ImportChange[]>([])
  const [importLoading, setImportLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [messageStudentsOpen, setMessageStudentsOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAssignmentId, setBulkAssignmentId] = useState<number | ''>('')
  const [customColumnData, setCustomColumnData] = useState<Record<number, Record<string, string>>>({})

  const { data: studentsData, isLoading: studentsLoading } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/users` : '',
    { enrollment_type: ['student'], per_page: 100, include: ['avatar'] } as any,
    { enabled: !!courseId }
  )

  const { data: assignmentsData, isLoading: assignmentsLoading } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/assignments` : '',
    { per_page: 100, include: ['submission'] } as any,
    { enabled: !!courseId }
  )

  const { data: submissionsData, isLoading: submissionsLoading } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/students/submissions` : '',
    { student_ids: ['all'], assignment_ids: ['all'], include: ['user'], per_page: 100 } as any,
    { enabled: !!courseId }
  )

  const { data: groupsData } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/assignment_groups` : '',
    { include: ['assignments'], per_page: 50 } as any,
    { enabled: !!courseId }
  )

  const { data: enrollmentsData } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/enrollments` : '',
    { type: ['StudentEnrollment'], per_page: 100 } as any,
    { enabled: !!courseId }
  )

  const { data: customColumnsData } = useCanvasQuery<any[]>(
    courseId ? `/api/v1/courses/${courseId}/custom_gradebook_columns` : '',
    { per_page: 50 } as any,
    { enabled: !!courseId }
  )

  const students = useMemo(() => Array.isArray(studentsData) ? studentsData : [], [studentsData])
  const assignments = useMemo(() => Array.isArray(assignmentsData) ? assignmentsData : [], [assignmentsData])
  const submissions = useMemo(() => Array.isArray(submissionsData) ? submissionsData : [], [submissionsData])
  const groups = useMemo(() => Array.isArray(groupsData) ? groupsData : [], [groupsData])
  const enrollments = useMemo(() => Array.isArray(enrollmentsData) ? enrollmentsData : [], [enrollmentsData])
  const customColumns = useMemo(() => Array.isArray(customColumnsData) ? customColumnsData : [], [customColumnsData])

  useEffect(() => {
    if (!courseId || !customColumns?.length) return
    let cancelled = false
    async function load() {
      const result: Record<number, Record<string, string>> = {}
      await Promise.all(customColumns.map(async (col: any) => {
        try {
          const entries: any[] = await canvasFetch(`/api/v1/courses/${courseId}/custom_gradebook_columns/${col.id}/data`, { method: 'GET' })
          result[col.id] = {}
          ;(Array.isArray(entries) ? entries : []).forEach((entry: any) => {
            if (entry.user_id != null && entry.content != null) {
              result[col.id][String(entry.user_id)] = String(entry.content)
            }
          })
        } catch {
          // ignore missing column data
        }
      }))
      if (!cancelled) setCustomColumnData(result)
    }
    load()
    return () => { cancelled = true }
  }, [courseId, customColumns])

  const enrollmentMap = useMemo(() => {
    const map = new Map<string, number>()
    enrollments.forEach(e => {
      if (e.user_id && e.id) {
        map.set(String(e.user_id), e.id)
      }
    })
    return map
  }, [enrollments])

  const submissionMap = useMemo(() => {
    const map = new Map<string, any>()
    submissions.forEach(s => {
      const key = `${s.user_id}-${s.assignment_id}`
      map.set(key, s)
    })
    return map
  }, [submissions])

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.sortable_name || '').toLowerCase().includes(q)
    )
  }, [students, search])

  const handleSelectAll = useCallback(() => setSelectedIds(filteredStudents.map(s => String(s.id))), [filteredStudents])
  const handleSelectNone = useCallback(() => setSelectedIds([]), [])
  const toggleSelected = useCallback((id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]), [])

  const getSubmission = useCallback((userId: number, assignmentId: number) => {
    return submissionMap.get(`${userId}-${assignmentId}`)
  }, [submissionMap])

  const droppedMap = useMemo(() => {
    const map = new Map<string, boolean>()
    students.forEach(s => {
      groups.forEach(g => {
        const groupAssignments = g.assignments || assignments.filter((a: any) => a.assignment_group_id === g.id)
        const dropped = computeDroppedAssignments(s.id, groupAssignments, getSubmission, g.rules)
        dropped.forEach(aid => {
          map.set(`${s.id}-${aid}`, true)
        })
      })
    })
    return map
  }, [students, groups, assignments, getSubmission])

  const getCellKey = (userId: number, assignmentId: string | number) => `${userId}-${assignmentId}`

  const handleCellChange = (userId: number, assignmentId: string | number, value: string) => {
    const key = getCellKey(userId, assignmentId)
    setCellStates(prev => ({ ...prev, [key]: { ...prev[key], value } }))
  }

  const handleCellBlur = async (userId: number, assignmentId: number, _pointsPossible: number) => {
    const key = getCellKey(userId, assignmentId)
    const state = cellStates[key]
    if (!state) return

    const raw = state.value.trim()
    let postedGrade = raw
    if (raw.toUpperCase() === 'EX') postedGrade = 'EX'
    else if (raw === '') postedGrade = ''
    else if (!isNaN(Number(raw))) postedGrade = raw
    else {
      showToast({ title: 'Invalid grade value', type: 'warning' })
      return
    }

    setCellStates(prev => ({ ...prev, [key]: { ...prev[key], saving: true } }))
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`, {
        method: 'PUT',
        body: { submission: { posted_grade: postedGrade } },
      })
      setCellStates(prev => ({ ...prev, [key]: { ...prev[key], saving: false, saved: true } }))
      setTimeout(() => {
        setCellStates(prev => ({ ...prev, [key]: { ...prev[key], saved: false } }))
      }, 1500)
    } catch (err: any) {
      setCellStates(prev => ({ ...prev, [key]: { ...prev[key], saving: false } }))
      showToast({ title: 'Failed to save grade', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const handleCustomColumnBlur = async (userId: number, columnId: number) => {
    const key = getCellKey(userId, `cc-${columnId}`)
    const state = cellStates[key]
    if (!state) return
    const raw = state.value.trim()
    setCellStates(prev => ({ ...prev, [key]: { ...prev[key], saving: true } }))
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/custom_gradebook_columns/${columnId}/data/${userId}`, {
        method: 'PUT',
        body: { column_data: { content: raw } },
      })
      setCellStates(prev => ({ ...prev, [key]: { ...prev[key], saving: false, saved: true } }))
      setTimeout(() => {
        setCellStates(prev => ({ ...prev, [key]: { ...prev[key], saved: false } }))
      }, 1500)
      const entries: any[] = await canvasFetch(`/api/v1/courses/${courseId}/custom_gradebook_columns/${columnId}/data`, { method: 'GET' })
      setCustomColumnData(prev => ({
        ...prev,
        [columnId]: {
          ...(prev[columnId] || {}),
          ...(Array.isArray(entries) ? Object.fromEntries(entries.map(e => [String(e.user_id), String(e.content)])) : {})
        }
      }))
    } catch (err: any) {
      setCellStates(prev => ({ ...prev, [key]: { ...prev[key], saving: false } }))
      showToast({ title: 'Failed to save', message: err?.message || 'Please try again.', type: 'error' })
    }
  }

  const getOverrideValue = (userId: number): string | undefined => {
    return overrideScores[String(userId)]
  }

  const hasOverride = (userId: number): boolean => {
    const val = getOverrideValue(userId)
    return val !== undefined && val !== ''
  }

  const computeTotal = (userId: number): { score: number; possible: number; percent: number; overridden?: boolean; overridePercent?: number } => {
    const isExcused = (sub: any) => {
      if (!sub) return false
      if (sub.excused || sub.grade === 'EX' || sub.posted_grade === 'EX') return true
      return false
    }

    if (!groups.length) {
      let score = 0
      let possible = 0
      assignments.forEach(a => {
        const sub = getSubmission(userId, a.id)
        if (isExcused(sub)) return
        if (droppedMap.get(`${userId}-${a.id}`)) return
        if (sub && sub.score != null && a.points_possible > 0) {
          score += sub.score
          possible += a.points_possible
        } else if (a.points_possible > 0) {
          possible += a.points_possible
        }
      })
      return { score, possible, percent: possible > 0 ? (score / possible) * 100 : 0 }
    }

    let totalPercent = 0
    let totalWeight = 0
    groups.forEach(g => {
      let groupScore = 0
      let groupPossible = 0
      const groupAssignments = g.assignments || assignments.filter((a: any) => a.assignment_group_id === g.id)
      groupAssignments.forEach((a: any) => {
        const sub = getSubmission(userId, a.id)
        if (isExcused(sub)) return
        if (droppedMap.get(`${userId}-${a.id}`)) return
        if (sub && sub.score != null && (a.points_possible ?? 0) > 0) {
          groupScore += sub.score
          groupPossible += a.points_possible
        } else if ((a.points_possible ?? 0) > 0) {
          groupPossible += a.points_possible
        }
      })
      const weight = g.group_weight ?? 0
      if (groupPossible > 0 && weight > 0) {
        totalPercent += (groupScore / groupPossible) * weight
        totalWeight += weight
      }
    })

    const percent = totalWeight > 0 ? (totalPercent / totalWeight) * 100 : 0
    const overrideVal = getOverrideValue(userId)
    const overridePercent = overrideVal !== undefined && overrideVal !== '' ? parseFloat(overrideVal) : undefined
    return { score: totalPercent, possible: totalWeight, percent, overridden: overridePercent !== undefined && !isNaN(overridePercent), overridePercent }
  }

  const handleExportCsv = useCallback(() => {
    if (!courseId || students.length === 0 || assignments.length === 0) return

    const headers = [
      'Student',
      'ID',
      'SIS User ID',
      'SIS Login ID',
      'Section',
      ...assignments.map(a => a.name),
      'Current Score',
      'Final Score',
    ]

    const rows = students.map(s => {
      const total = computeTotal(s.id)
      const assignmentCells = assignments.map(a => {
        const sub = getSubmission(s.id, a.id)
        if (sub?.excused) return 'EX'
        return sub?.score != null ? String(sub.score) : ''
      })
      return [
        s.name || '',
        String(s.id),
        s.sis_user_id || '',
        s.sis_login_id || s.login_id || '',
        s.section || '',
        ...assignmentCells,
        total.possible > 0 ? total.percent.toFixed(2) : '',
        total.overridden && total.overridePercent !== undefined ? total.overridePercent.toFixed(2) : (total.possible > 0 ? total.percent.toFixed(2) : ''),
      ]
    })

    const csv = [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gradebook-${courseId}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast({ title: 'Gradebook exported', type: 'success' })
  }, [courseId, students, assignments, getSubmission, computeTotal, showToast])

  const handleFileSelect = useCallback(async (file: File) => {
    if (!courseId) return
    const text = await file.text()
    const rows = parseCsv(text)
    if (rows.length < 2) {
      showToast({ title: 'CSV is empty or invalid', type: 'warning' })
      return
    }

    const headers = rows[0]
    const studentIdx = headers.findIndex(h => h.trim().toLowerCase() === 'student')
    const idIdx = headers.findIndex(h => h.trim().toLowerCase() === 'id')
    const assignmentStart = headers.findIndex(h => h.trim().toLowerCase() === 'section') + 1
    const currentScoreIdx = headers.findIndex(h => h.trim().toLowerCase() === 'current score')
    const finalScoreIdx = headers.findIndex(h => h.trim().toLowerCase() === 'final score')

    if (studentIdx === -1 || idIdx === -1) {
      showToast({ title: 'CSV missing required columns (Student, ID)', type: 'warning' })
      return
    }

    const assignmentHeaders = headers.slice(assignmentStart, currentScoreIdx !== -1 ? currentScoreIdx : finalScoreIdx !== -1 ? finalScoreIdx : headers.length)
    const assignmentNameToId = new Map<string, number>()
    assignments.forEach(a => assignmentNameToId.set(a.name, a.id))

    const changes: ImportChange[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (row.length < Math.max(idIdx, assignmentStart) + 1) continue
      const userId = parseInt(row[idIdx]?.trim())
      if (!userId || !students.find(s => s.id === userId)) continue
      const userName = row[studentIdx]?.trim() || ''

      assignmentHeaders.forEach((name, idx) => {
        const cellIdx = assignmentStart + idx
        if (cellIdx >= row.length) return
        const assignmentId = assignmentNameToId.get(name)
        if (!assignmentId) return
        const newValue = row[cellIdx]?.trim() ?? ''
        if (newValue === '') return
        const sub = getSubmission(userId, assignmentId)
        const oldValue = sub?.excused ? 'EX' : (sub?.score != null ? String(sub.score) : '')
        if (newValue !== oldValue) {
          changes.push({
            userId,
            userName,
            assignmentId,
            assignmentName: name,
            oldValue,
            newValue,
          })
        }
      })
    }

    setImportChanges(changes)
    setShowImportModal(true)
  }, [courseId, students, assignments, getSubmission, showToast])

  const applyImport = useCallback(async () => {
    if (!courseId || importChanges.length === 0) return
    setImportLoading(true)
    try {
      await Promise.all(importChanges.map(async change => {
        let postedGrade = change.newValue
        if (postedGrade.toUpperCase() !== 'EX' && postedGrade !== '' && isNaN(Number(postedGrade))) {
          return
        }
        await canvasFetch(`/api/v1/courses/${courseId}/assignments/${change.assignmentId}/submissions/${change.userId}`, {
          method: 'PUT',
          body: { submission: { posted_grade: postedGrade } },
        })
      }))
      showToast({ title: `${importChanges.length} grades updated`, type: 'success' })
      setShowImportModal(false)
      setImportChanges([])
      // Refresh page data by reloading
      window.location.reload()
    } catch (err: any) {
      showToast({ title: 'Import failed', message: err?.message || 'Please try again.', type: 'error' })
    } finally {
      setImportLoading(false)
    }
  }, [courseId, importChanges, showToast])

  const isLoading = studentsLoading || assignmentsLoading || submissionsLoading

  if (isLoading) {
    return (
      <div style={{ maxWidth: 'var(--cx-max-content-width)', margin: '0 auto' }}>
        <LogoLoader text="Loading gradebook…" />
        <div className="cx-skeleton cx-skeleton--list-banner" style={{ marginTop: 24 }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 'var(--cx-max-content-width)', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 'var(--cx-text-xl)', color: 'var(--cx-text-primary)' }}>Gradebook</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="search"
            className="cx-input"
            style={{ maxWidth: 280, width: '100%' }}
            placeholder="Search students…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="cx-select cx-select--sm"
            value={bulkAssignmentId}
            onChange={e => setBulkAssignmentId(e.target.value ? Number(e.target.value) : '')}
            style={{ maxWidth: 200 }}
          >
            <option value="">Select assignment…</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleExportCsv}>Export CSV</button>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => fileInputRef.current?.click()}>Import CSV</button>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setMessageStudentsOpen(true)}>Message Students</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {filteredStudents.length === 0 || assignments.length === 0 ? (
        <div className="cx-assignment-list__empty">
          <p className="cx-assignment-list__empty-text">
            {filteredStudents.length === 0 ? 'No students found' : 'No assignments in this course'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--cx-radius-lg)' }}>
          <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', fontSize: 'var(--cx-text-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--cx-bg-surface)' }}>
                <th style={{ position: 'sticky', left: 0, background: 'var(--cx-bg-surface)', zIndex: 2, padding: '10px 14px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'left', fontWeight: 600, color: 'var(--cx-text-primary)', whiteSpace: 'nowrap', minWidth: 180, boxShadow: '2px 0 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                      onChange={() => selectedIds.length === filteredStudents.length ? handleSelectNone() : handleSelectAll()}
                      style={{ margin: 0 }}
                    />
                    <span>Student</span>
                  </div>
                </th>
                {assignments.map(a => (
                  <th key={a.id} style={{ padding: '10px 8px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center', fontWeight: 600, color: 'var(--cx-text-primary)', minWidth: 90, maxWidth: 140 }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, margin: '0 auto' }} title={a.name}>{a.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--cx-text-tertiary)', fontWeight: 500, marginTop: 2 }}>{a.points_possible} pts</div>
                  </th>
                ))}
                <th style={{ padding: '10px 14px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center', fontWeight: 700, color: 'var(--cx-color-primary)', minWidth: 100 }}>
                  Total
                </th>
                <th style={{ padding: '10px 14px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center', fontWeight: 600, color: 'var(--cx-text-secondary)', minWidth: 110 }}>
                  Final Override
                </th>
                {customColumns?.map((col: any) => (
                  <th key={`cc-h-${col.id}`} style={{ padding: '10px 14px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center', fontWeight: 600, color: 'var(--cx-text-secondary)', minWidth: 100 }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, margin: '0 auto' }} title={col.title}>{col.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => {
                const total = computeTotal(s.id)
                return (
                  <tr key={s.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'var(--cx-bg-surface-sunken, rgba(0,0,0,0.02))' }}>
                    <td style={{ position: 'sticky', left: 0, background: idx % 2 === 0 ? 'var(--cx-bg-app)' : 'var(--cx-bg-surface-sunken, rgba(0,0,0,0.02))', zIndex: 1, padding: '8px 14px', borderBottom: '1px solid var(--cx-border-subtle)', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--cx-text-primary)', boxShadow: '2px 0 4px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(String(s.id))}
                          onChange={() => toggleSelected(String(s.id))}
                          style={{ margin: 0 }}
                        />
                        {s.avatar_url ? (
                          <img src={s.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cx-color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                            {(s.name || '?').charAt(0)}
                          </div>
                        )}
                        <span>{s.name}</span>
                      </div>
                    </td>
                    {assignments.map(a => {
                      const sub = getSubmission(s.id, a.id)
                      const key = getCellKey(s.id, a.id)
                      const state = cellStates[key]
                      const displayValue = state ? state.value : (sub?.score != null ? String(sub.score) : sub?.excused ? 'EX' : '')
                      const isLate = sub?.late
                      const isMissing = sub?.missing
                      const isExcused = sub?.excused || displayValue.toUpperCase() === 'EX' || sub?.posted_grade === 'EX' || sub?.grade === 'EX'
                      const isDropped = droppedMap.get(`${s.id}-${a.id}`) ?? false

                      return (
                        <td key={a.id} style={{ padding: '6px 8px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center' }}>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="cx-input"
                            style={{
                              width: 60,
                              textAlign: 'center',
                              padding: '4px 6px',
                              fontSize: 'var(--cx-text-xs)',
                              background: isExcused ? 'rgba(139,92,246,0.12)' : isLate ? 'var(--cx-color-danger-subtle)' : isMissing ? 'var(--cx-bg-surface-sunken)' : 'var(--cx-bg-surface)',
                              color: isExcused ? '#7c3aed' : isDropped ? '#6b7280' : 'inherit',
                              borderColor: state?.saved ? 'var(--cx-color-success)' : 'var(--cx-border-default)',
                              transition: 'border-color 0.2s',
                            }}
                            value={displayValue}
                            onChange={e => handleCellChange(s.id, a.id, e.target.value)}
                            onBlur={() => handleCellBlur(s.id, a.id, a.points_possible)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur()
                              }
                            }}
                            disabled={state?.saving}
                            title={isExcused ? 'Excused — does not affect grade' : isDropped ? 'Dropped by assignment group rules' : isLate ? 'Late' : isMissing ? 'Missing' : ''}
                          />
                          {state?.saving && <span style={{ fontSize: '0.6rem', color: 'var(--cx-text-tertiary)', display: 'block' }}>…</span>}
                          {isDropped && (
                            <span style={{ display: 'inline-block', marginTop: 2, padding: '1px 4px', fontSize: '0.6rem', borderRadius: 4, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>Dropped</span>
                          )}
                        </td>
                      )
                    })}
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center', fontWeight: 700, color: 'var(--cx-color-primary)', fontSize: 'var(--cx-text-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {total.possible > 0 ? `${total.overridden && total.overridePercent !== undefined ? total.overridePercent.toFixed(1) : total.percent.toFixed(1)}%` : '—'}
                        {total.overridden && (
                          <span className="cx-badge cx-badge--warning" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Override</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center' }}>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="cx-input"
                        style={{
                          width: 70,
                          textAlign: 'center',
                          padding: '4px 6px',
                          fontSize: 'var(--cx-text-xs)',
                          borderColor: overrideSaving[String(s.id)] ? 'var(--cx-color-primary)' : 'var(--cx-border-default)',
                          transition: 'border-color 0.2s',
                        }}
                        placeholder="—"
                        value={overrideScores[String(s.id)] ?? ''}
                        onChange={e => setOverrideScores(prev => ({ ...prev, [String(s.id)]: e.target.value }))}
                        onBlur={async () => {
                          const enrollmentId = enrollmentMap.get(String(s.id))
                          if (!enrollmentId) return
                          const raw = overrideScores[String(s.id)]?.trim() ?? ''
                          if (raw === '') {
                            // Clear override by sending empty override_score
                            setOverrideSaving(prev => ({ ...prev, [String(s.id)]: true }))
                            try {
                              await canvasFetch(`/api/v1/courses/${courseId}/enrollments/${enrollmentId}`, {
                                method: 'PUT',
                                body: { enrollment: { override_score: '' } },
                              })
                            } catch (err: any) {
                              showToast({ title: 'Failed to clear override', message: err?.message || 'Please try again.', type: 'error' })
                            } finally {
                              setOverrideSaving(prev => ({ ...prev, [String(s.id)]: false }))
                            }
                            return
                          }
                          const num = parseFloat(raw)
                          if (isNaN(num)) {
                            showToast({ title: 'Invalid override value', type: 'warning' })
                            return
                          }
                          setOverrideSaving(prev => ({ ...prev, [String(s.id)]: true }))
                          try {
                            await canvasFetch(`/api/v1/courses/${courseId}/enrollments/${enrollmentId}`, {
                              method: 'PUT',
                              body: { enrollment: { override_score: num } },
                            })
                          } catch (err: any) {
                            showToast({ title: 'Failed to save override', message: err?.message || 'Please try again.', type: 'error' })
                          } finally {
                            setOverrideSaving(prev => ({ ...prev, [String(s.id)]: false }))
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                        }}
                        disabled={overrideSaving[String(s.id)]}
                        title="Override final grade (percentage)"
                      />
                      {overrideSaving[String(s.id)] && <span style={{ fontSize: '0.6rem', color: 'var(--cx-text-tertiary)', display: 'block' }}>…</span>}
                    </td>
                    {customColumns?.map((col: any) => {
                      const key = getCellKey(s.id, `cc-${col.id}`)
                      const state = cellStates[key]
                      const savedValue = customColumnData[col.id]?.[String(s.id)] ?? ''
                      const displayValue = state ? state.value : savedValue
                      return (
                        <td key={`cc-${col.id}`} style={{ padding: '6px 8px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center' }}>
                          <input
                            type="text"
                            className="cx-input"
                            style={{
                              width: 80,
                              textAlign: 'center',
                              padding: '4px 6px',
                              fontSize: 'var(--cx-text-xs)',
                              borderColor: state?.saved ? 'var(--cx-color-success)' : 'var(--cx-border-default)',
                              transition: 'border-color 0.2s',
                            }}
                            value={displayValue}
                            onChange={e => handleCellChange(s.id, `cc-${col.id}`, e.target.value)}
                            onBlur={() => handleCustomColumnBlur(s.id, col.id)}
                            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
                            disabled={state?.saving}
                          />
                          {state?.saving && <span style={{ fontSize: '0.6rem', color: 'var(--cx-text-tertiary)', display: 'block' }}>…</span>}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <BulkOperationsBar
        items={filteredStudents}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectNone={handleSelectNone}
        itemName="students"
        actions={[
          {
            id: 'excuse',
            label: 'Excuse',
            variant: 'secondary',
            confirmMessage: `Excuse ${selectedIds.length} students for the selected assignment?`,
            onClick: async (ids) => {
              if (!bulkAssignmentId) {
                showToast({ title: 'Select an assignment first', type: 'warning' })
                return
              }
              await Promise.all(ids.map(id => canvasFetch(`/api/v1/courses/${courseId}/assignments/${bulkAssignmentId}/submissions/${id}`, {
                method: 'PUT',
                body: { submission: { posted_grade: 'EX' } },
              })))
              showToast({ title: `${ids.length} students excused`, type: 'success' })
              setSelectedIds([])
              window.location.reload()
            },
          },
        ]}
      />

      {messageStudentsOpen && (
        <MessageStudentsWho
          courseId={courseId || ''}
          students={filteredStudents.map(s => ({ id: String(s.id), name: s.name }))}
          assignmentId={bulkAssignmentId ? String(bulkAssignmentId) : undefined}
          isOpen={messageStudentsOpen}
          onClose={() => setMessageStudentsOpen(false)}
          onSent={() => {
            setMessageStudentsOpen(false)
            showToast({ title: 'Messages sent', type: 'success' })
          }}
        />
      )}

      {showImportModal && (
        <div className="cx-modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Import Preview</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowImportModal(false)}>&times;</button>
            </div>
            <div className="cx-modal__body">
              {importChanges.length === 0 ? (
                <p style={{ color: 'var(--cx-text-secondary)' }}>No changes detected in the uploaded CSV.</p>
              ) : (
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--cx-text-sm)' }}>
                    <thead>
                      <tr style={{ background: 'var(--cx-bg-surface)' }}>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'left' }}>Student</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'left' }}>Assignment</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center' }}>Old Grade</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center' }}>New Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importChanges.map((change, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'var(--cx-bg-surface-sunken)' }}>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--cx-border-subtle)' }}>{change.userName}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--cx-border-subtle)' }}>{change.assignmentName}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center', color: 'var(--cx-text-tertiary)' }}>{change.oldValue || '—'}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--cx-border-subtle)', textAlign: 'center', fontWeight: 700, color: 'var(--cx-color-primary)' }}>{change.newValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowImportModal(false)}>Cancel</button>
              <button
                className="cx-btn cx-btn--primary cx-btn--sm"
                disabled={importChanges.length === 0 || importLoading}
                onClick={applyImport}
              >
                {importLoading ? 'Applying…' : `Apply ${importChanges.length} Changes`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
