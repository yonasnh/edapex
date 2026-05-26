/**
 * AssignmentEditModal Deep Feature Tests
 * ======================================
 * Verifies advanced toggles, submission-type logic, and API-populated selects.
 */

import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import AssignmentEditModal from '../AssignmentEditModal'
import { useCanvasQuery } from '../../hooks/useCanvasQuery'
import { useNotification } from '../../hooks/useNotification'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

vi.mock('../../components/NewRceWrapper', () => ({
  default: ({ value, onChange }: any) => (
    <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} />
  ),
}))

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_GROUPS = [
  { id: 1, name: 'Homework' },
  { id: 2, name: 'Exams' },
]

const MOCK_RUBRICS = [{ id: 10, title: 'Writing Rubric' }]

const MOCK_SECTIONS = [{ id: 100, name: 'Section A' }]

const MOCK_STUDENTS = [{ id: 1, name: 'Alice' }]

const MOCK_GRADERS = [{ id: 50, name: 'Prof Smith' }]

// ─── Helpers ────────────────────────────────────────────────────────────────

function setupMocks() {
  vi.mocked(useNotification).mockReturnValue({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  } as any)

  vi.mocked(useCanvasQuery).mockImplementation((endpoint: string) => {
    if (endpoint.includes('/assignment_groups')) {
      return { data: MOCK_GROUPS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/rubrics')) {
      return { data: MOCK_RUBRICS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/sections')) {
      return { data: MOCK_SECTIONS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/users?enrollment_type[]=student')) {
      return { data: MOCK_STUDENTS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/users?enrollment_type[]=teacher')) {
      return { data: MOCK_GRADERS, isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    if (endpoint.includes('/overrides')) {
      return { data: [], isLoading: false, isError: false, refetch: vi.fn() } as any
    }
    return { data: null, isLoading: false, isError: false, refetch: vi.fn() }
  })
}

function renderModal(props?: Partial<Parameters<typeof AssignmentEditModal>[0]>) {
  const onClose = vi.fn()
  const onSaved = vi.fn()

  return render(
    <AssignmentEditModal
      courseId="1"
      assignment={null}
      onClose={onClose}
      onSaved={onSaved}
      {...props}
    />
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AssignmentEditModal — Deep Features', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  it('shows moderated grading toggle', () => {
    renderModal()
    expect(screen.getByLabelText('Moderated Grading')).toBeInTheDocument()
  })

  it('shows anonymous grading toggle', () => {
    renderModal()
    expect(screen.getByLabelText('Anonymous Grading')).toBeInTheDocument()
  })

  it('selecting moderated grading reveals grader count input and final grader select', () => {
    renderModal()

    const moderatedCheckbox = screen.getByLabelText('Moderated Grading')
    fireEvent.click(moderatedCheckbox)

    expect(screen.getByText('Number of Graders')).toBeInTheDocument()

    const graderCountInput = screen.getByDisplayValue('2')
    expect(graderCountInput).toBeInTheDocument()
    expect(graderCountInput).toHaveAttribute('type', 'number')

    expect(screen.getByText('Final Grader')).toBeInTheDocument()

    const graderSelect = screen.getByText('Final Grader').closest('div')?.querySelector('select')
    expect(graderSelect).toBeInTheDocument()
    expect(screen.getByText('Select grader…')).toBeInTheDocument()
  })

  it('selecting anonymous grading reveals help text', () => {
    renderModal()

    const anonymousCheckbox = screen.getByLabelText('Anonymous Grading')
    fireEvent.click(anonymousCheckbox)

    expect(
      screen.getByText(/Student names will be hidden during grading/)
    ).toBeInTheDocument()
  })

  it('selecting peer reviews reveals count input and automatic checkbox', () => {
    renderModal()

    const peerReviewsCheckbox = screen.getByLabelText('Peer Reviews')
    fireEvent.click(peerReviewsCheckbox)

    expect(screen.getByLabelText('Automatic')).toBeInTheDocument()
    expect(screen.getByText('Count')).toBeInTheDocument()

    const countInput = screen.getByDisplayValue('1')
    expect(countInput).toBeInTheDocument()
    expect(countInput).toHaveAttribute('type', 'number')
  })

  it('selecting submission type "none" clears other types', () => {
    renderModal()

    const textEntryCheckbox = screen.getByLabelText('Text Entry')
    const fileUploadCheckbox = screen.getByLabelText('File Upload')
    expect(textEntryCheckbox).toBeChecked()
    expect(fileUploadCheckbox).toBeChecked()

    const noneCheckbox = screen.getByLabelText('No Submission')
    fireEvent.click(noneCheckbox)

    expect(noneCheckbox).toBeChecked()
    expect(textEntryCheckbox).not.toBeChecked()
    expect(fileUploadCheckbox).not.toBeChecked()
  })

  it('populates assignment group select from API', () => {
    renderModal()

    const groupSelect = screen.getByText('Assignment Group').closest('div')?.querySelector('select')
    expect(groupSelect).toBeInTheDocument()

    const options = within(groupSelect as HTMLElement).getAllByRole('option')
    const optionTexts = options.map((o) => (o as HTMLOptionElement).text)
    expect(optionTexts).toContain('Default')
    expect(optionTexts).toContain('Homework')
    expect(optionTexts).toContain('Exams')
  })

  it('populates rubric select from API', () => {
    renderModal()

    const rubricSelect = screen.getByText('Rubric').closest('div')?.querySelector('select')
    expect(rubricSelect).toBeInTheDocument()

    const options = within(rubricSelect as HTMLElement).getAllByRole('option')
    const optionTexts = options.map((o) => (o as HTMLOptionElement).text)
    expect(optionTexts).toContain('None')
    expect(optionTexts).toContain('Writing Rubric')
  })
})
