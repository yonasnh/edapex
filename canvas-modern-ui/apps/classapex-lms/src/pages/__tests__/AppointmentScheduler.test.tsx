import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AppointmentScheduler from '../AppointmentScheduler'

const mockShowToast = vi.fn()
const mockShowConfirm = vi.fn()
const mockRefetchGroups = vi.fn()
const mockRefetchReservations = vi.fn()
const mockCanvasFetch = vi.fn()

const MOCK_APPOINTMENT_GROUPS = [
  {
    id: 'ag1',
    title: 'Office Hours',
    location_name: 'Room 101',
    context_codes: ['course_1'],
    participant_type: 'User',
    participant_count: 1,
    max_appointments_per_participant: 1,
    workflow_state: 'active',
    appointments: [
      {
        id: 'slot1',
        start_at: '2026-06-01T10:00:00Z',
        end_at: '2026-06-01T11:00:00Z',
        child_events_count: 0,
        available_slots: 1,
        child_events: [],
      },
    ],
  },
]

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: (...args: any[]) => mockCanvasFetch(...args),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({
    showToast: mockShowToast,
    showConfirm: mockShowConfirm,
    showAlert: vi.fn(),
  }),
}))

vi.mock('../../contexts/RoleContext', () => ({
  useRole: vi.fn(),
}))

import { useCanvasQuery } from '../../hooks/useCanvasQuery'
import { useRole } from '../../contexts/RoleContext'

function renderPage(role: 'student' | 'teacher' | 'admin' | 'ta' | 'observer' = 'student', groupsData?: any, reservationsData?: any, isLoading = false) {
  vi.mocked(useRole).mockReturnValue({ role } as any)
  vi.mocked(useCanvasQuery).mockImplementation((url: string) => {
    if (url === '/api/v1/appointment_groups') {
      return {
        data: groupsData ?? MOCK_APPOINTMENT_GROUPS,
        isLoading,
        isError: false,
        error: null,
        refetch: mockRefetchGroups,
      } as any
    }
    if (url === '/api/v1/calendar_events') {
      return {
        data: reservationsData ?? [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetchReservations,
      } as any
    }
    return { data: [], isLoading: false, isError: false, error: null, refetch: vi.fn() } as any
  })

  return render(
    <MemoryRouter initialEntries={['/courses/1/appointments']}>
      <Routes>
        <Route path="/courses/:courseId/appointments" element={<AppointmentScheduler />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AppointmentScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockShowConfirm.mockResolvedValue(true)
  })

  it('renders page title', () => {
    renderPage('student')
    expect(screen.getByText('Appointment Scheduler')).toBeInTheDocument()
  })

  it('shows loading state for students', () => {
    renderPage('student', undefined, undefined, true)
    expect(screen.getByText('Loading appointment slots…')).toBeInTheDocument()
  })

  it('shows loading state for teachers', () => {
    renderPage('teacher', undefined, undefined, true)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders appointment groups list for students', () => {
    renderPage('student')
    expect(screen.getByText('Office Hours')).toBeInTheDocument()
    expect(screen.getByText('Room 101')).toBeInTheDocument()
  })

  it('shows "Create Appointment Group" UI for teachers', () => {
    renderPage('teacher')
    expect(screen.getByText('Create Appointment Slots')).toBeInTheDocument()
    expect(screen.getByText('Publish Slots')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., Office Hours')).toBeInTheDocument()
  })

  it('shows "Create Appointment Group" UI for admin', () => {
    renderPage('admin')
    expect(screen.getByText('Create Appointment Slots')).toBeInTheDocument()
    expect(screen.getByText('Publish Slots')).toBeInTheDocument()
  })

  it('renders slots with reserve buttons for students when slots are available', () => {
    renderPage('student')
    expect(screen.getByText('Reserve')).toBeInTheDocument()
  })

  it('shows "Sign Up" / reserve button and clicking it calls canvasFetch', async () => {
    mockCanvasFetch.mockResolvedValue({})
    renderPage('student')
    const reserveBtn = screen.getByText('Reserve')
    expect(reserveBtn).toBeInTheDocument()
    fireEvent.click(reserveBtn)
    await waitFor(() => {
      expect(mockCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/calendar_events/slot1/reservations',
        { method: 'POST', body: {} }
      )
    })
  })

  it('shows "Cancel" reservation button when a slot is reserved', () => {
    renderPage('student', MOCK_APPOINTMENT_GROUPS, [
      { id: 'slot1', appointment_group_id: 'ag1' },
    ])
    expect(screen.getByText('Reserved')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls canvasFetch DELETE when cancel button is clicked', async () => {
    mockCanvasFetch.mockResolvedValue({})
    renderPage('student', MOCK_APPOINTMENT_GROUPS, [
      { id: 'slot1', appointment_group_id: 'ag1' },
    ])
    const cancelBtn = screen.getByText('Cancel')
    fireEvent.click(cancelBtn)
    await waitFor(() => {
      expect(mockCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/calendar_events/slot1/reservations/self',
        { method: 'DELETE' }
      )
    })
  })

  it('shows "Full" badge when slot is at capacity', () => {
    const fullGroups = [
      {
        ...MOCK_APPOINTMENT_GROUPS[0],
        appointments: [
          {
            ...MOCK_APPOINTMENT_GROUPS[0].appointments[0],
            child_events_count: 1,
          },
        ],
      },
    ]
    renderPage('student', fullGroups)
    expect(screen.getByText('Full')).toBeInTheDocument()
    expect(screen.queryByText('Reserve')).not.toBeInTheDocument()
  })

  it('renders empty state for students when no appointment groups exist', () => {
    renderPage('student', [])
    expect(screen.getByText('No open appointments')).toBeInTheDocument()
    expect(screen.getByText('Check back later for available appointment slots.')).toBeInTheDocument()
  })

  it('renders empty state for teachers when no appointment groups exist', () => {
    renderPage('teacher', [])
    expect(screen.getByText('No appointment groups yet.')).toBeInTheDocument()
  })

  it('renders existing appointment groups for teachers with slot details', () => {
    renderPage('teacher')
    expect(screen.getByText('Existing Appointment Groups')).toBeInTheDocument()
    expect(screen.getByText('Office Hours')).toBeInTheDocument()
    expect(screen.getByText(/Mon, Jun 1/)).toBeInTheDocument()
  })

  it('allows teachers to select slots and publish', async () => {
    mockCanvasFetch.mockResolvedValue({})
    renderPage('teacher')
    const titleInput = screen.getByPlaceholderText('e.g., Office Hours')
    fireEvent.change(titleInput, { target: { value: 'Test Office Hours' } })

    // Click a slot cell (Mon 8 AM)
    const slotCell = screen.getByLabelText('Select Mon 8:00 AM')
    fireEvent.click(slotCell)

    const publishBtn = screen.getByText('Publish Slots')
    fireEvent.click(publishBtn)

    await waitFor(() => {
      expect(mockCanvasFetch).toHaveBeenCalled()
    })
  })
})
