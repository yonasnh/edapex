import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CalendarPage from '../Calendar'
import { NotificationProvider } from '../../contexts/NotificationContext'

// Mock useAuth from @schoolapex/core
vi.mock('@schoolapex/core', () => ({
  useAuth: () => ({
    user: { id: '101', name: 'Yonas Nebro' },
    isAuthenticated: true,
  }),
}))

// Mock useCanvasQuery with course, event, and assignment data
vi.mock('../../hooks/useCanvasQuery', () => {
  return {
    useCanvasQuery: vi.fn().mockImplementation((url: string, params: any) => {
      if (url === '/api/v1/courses') {
        return {
          data: [{ id: 15, name: 'Advanced Software Engineering' }],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        }
      }
      if (url === '/api/v1/calendar_events') {
        if (params?.type === 'assignment') {
          return {
            data: [
              {
                id: 'assignment_555',
                title: 'Assignment 1: CI/CD Workflow',
                description: 'Complete Git workflow setup',
                start_at: new Date().toISOString(),
                end_at: new Date().toISOString(),
                location_name: 'Online Submission',
                context_code: 'course_15',
                all_day: true,
              },
            ],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
          }
        } else {
          return {
            data: [
              {
                id: '12345',
                title: 'Review Lecture',
                description: 'Type: lecture\nReviewing exam questions',
                start_at: new Date().toISOString(),
                end_at: new Date().toISOString(),
                location_name: 'Room 302',
                context_code: 'user_101',
                all_day: false,
              },
            ],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
          }
        }
      }
      return { data: [], isLoading: false, isError: false, refetch: vi.fn() }
    }),
  }
})

describe('Calendar Page E2E Integration', () => {
  it('renders stats grid, filters, and merged events/assignments correctly', async () => {
    render(
      <MemoryRouter>
        <NotificationProvider>
          <CalendarPage />
        </NotificationProvider>
      </MemoryRouter>
    )

    // Verify key toolbar headers are present
    expect(screen.getAllByText('Today')[0]).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search events...')).toBeInTheDocument()

    // Verify course selector exists and lists mock course
    const courseSelect = screen.getAllByRole('combobox')[0] // select tags
    expect(courseSelect).toBeInTheDocument()

    // Verify that BOTH standard calendar events and assignments render inside the UI grid
    await waitFor(() => {
      expect(screen.getByText('Review Lecture')).toBeInTheDocument()
      expect(screen.getByText('Assignment 1: CI/CD Workflow')).toBeInTheDocument()
    })
  })

  it('renders selected event details modal overlay', async () => {
    render(
      <MemoryRouter>
        <NotificationProvider>
          <CalendarPage />
        </NotificationProvider>
      </MemoryRouter>
    )

    // Click standard calendar event to trigger detail modal
    const eventBtn = await screen.findByText('Review Lecture')
    fireEvent.click(eventBtn)

    // Verify modal overlay opens showing detail information
    expect(screen.getByRole('heading', { name: 'Review Lecture' })).toBeInTheDocument()
    expect(screen.getByText('Reviewing exam questions')).toBeInTheDocument()
    expect(screen.getByText('Room 302')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('disables deletion when reviewing an assignment in the edit modal', async () => {
    render(
      <MemoryRouter>
        <NotificationProvider>
          <CalendarPage />
        </NotificationProvider>
      </MemoryRouter>
    )

    // Click assignment event to trigger detail modal
    const assignmentBtn = await screen.findByText('Assignment 1: CI/CD Workflow')
    fireEvent.click(assignmentBtn)

    // Click edit button in details modal to open the editing form
    const editBtn = screen.getByText('Edit')
    fireEvent.click(editBtn)

    // Verify the "Edit Event" form loads
    expect(screen.getByRole('heading', { name: 'Edit Event' })).toBeInTheDocument()

    // Verify that the "Delete" button is disabled for assignments, rendering the helper message
    const deleteDisabledMsg = screen.getByText('Delete Disabled')
    expect(deleteDisabledMsg).toBeInTheDocument()
    expect(deleteDisabledMsg).toHaveAttribute('title', 'Assignments must be deleted from the course assignments list.')
  })
})
