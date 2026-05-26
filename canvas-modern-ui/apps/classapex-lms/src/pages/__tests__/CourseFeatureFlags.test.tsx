import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CourseFeatureFlagsPage from '../CourseFeatureFlags'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn(),
  canvasFetch: vi.fn(),
}))

vi.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
  }),
}))

vi.mock('../../contexts/RoleContext', () => ({
  useRole: () => ({ role: 'teacher' }),
  RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery'

const mockedUseCanvasQuery = vi.mocked(useCanvasQuery)
const mockedCanvasFetch = vi.mocked(canvasFetch)

function renderPage(initialEntries = ['/courses/1/features']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/courses/:courseId/features" element={<CourseFeatureFlagsPage />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CourseFeatureFlagsPage', () => {
  beforeEach(() => {
    mockedUseCanvasQuery.mockReset()
    mockedCanvasFetch.mockReset()
  })

  it('renders loading state', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: undefined, isLoading: true } as any)
    renderPage()
    expect(screen.getByText('Feature Options')).toBeInTheDocument()
    expect(document.querySelectorAll('.cx-skeleton').length).toBeGreaterThan(0)
  })

  it('renders empty state', () => {
    mockedUseCanvasQuery.mockReturnValue({ data: [], isLoading: false } as any)
    renderPage()
    expect(screen.getByText('No course features available')).toBeInTheDocument()
  })

  it('renders course features with state badges', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [
        { feature: 'new_gradebook', display_name: 'New Gradebook', description: 'Enhanced gradebook UI', applies_to: 'Course', beta: false, feature_flag: { feature: 'new_gradebook', state: 'on', locked: false, transitions: {} } },
        { feature: 'discussion_checkpoints', display_name: 'Discussion Checkpoints', description: 'Break discussions into checkpoints', applies_to: 'Course', beta: true, feature_flag: { feature: 'discussion_checkpoints', state: 'off', locked: false, transitions: {} } },
        { feature: 'locked_feature', display_name: 'Locked Feature', description: 'Admin controlled', applies_to: 'Course', beta: false, feature_flag: { feature: 'locked_feature', state: 'allowed', locked: true, transitions: {} } },
      ],
      isLoading: false,
    } as any)
    renderPage()

    expect(screen.getByText('New Gradebook')).toBeInTheDocument()
    expect(screen.getByText('Discussion Checkpoints')).toBeInTheDocument()
    expect(screen.getByText('Locked Feature')).toBeInTheDocument()
    expect(screen.getByTestId('feature-new_gradebook')).toHaveTextContent('Enabled')
    expect(screen.getByTestId('feature-discussion_checkpoints')).toHaveTextContent('Disabled')
    expect(screen.getByTestId('feature-locked_feature')).toHaveTextContent('Allowed')
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('filters by search query', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [
        { feature: 'new_gradebook', display_name: 'New Gradebook', description: 'Enhanced gradebook UI', applies_to: 'Course', beta: false, feature_flag: { feature: 'new_gradebook', state: 'on', locked: false, transitions: {} } },
        { feature: 'discussion_checkpoints', display_name: 'Discussion Checkpoints', description: 'Break discussions into checkpoints', applies_to: 'Course', beta: true, feature_flag: { feature: 'discussion_checkpoints', state: 'off', locked: false, transitions: {} } },
      ],
      isLoading: false,
    } as any)
    renderPage()

    const input = screen.getByTestId('feature-search')
    fireEvent.change(input, { target: { value: 'gradebook' } })
    expect(screen.getByText('New Gradebook')).toBeInTheDocument()
    expect(screen.queryByText('Discussion Checkpoints')).not.toBeInTheDocument()
  })

  it('filters by state', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [
        { feature: 'new_gradebook', display_name: 'New Gradebook', description: 'Enhanced gradebook UI', applies_to: 'Course', beta: false, feature_flag: { feature: 'new_gradebook', state: 'on', locked: false, transitions: {} } },
        { feature: 'discussion_checkpoints', display_name: 'Discussion Checkpoints', description: 'Break discussions into checkpoints', applies_to: 'Course', beta: true, feature_flag: { feature: 'discussion_checkpoints', state: 'off', locked: false, transitions: {} } },
      ],
      isLoading: false,
    } as any)
    renderPage()

    const select = screen.getByTestId('feature-filter-state')
    fireEvent.change(select, { target: { value: 'off' } })
    expect(screen.queryByText('New Gradebook')).not.toBeInTheDocument()
    expect(screen.getByText('Discussion Checkpoints')).toBeInTheDocument()
  })

  it('toggles feature state via canvasFetch', async () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [
        { feature: 'new_gradebook', display_name: 'New Gradebook', description: 'Enhanced gradebook UI', applies_to: 'Course', beta: false, feature_flag: { feature: 'new_gradebook', state: 'on', locked: false, transitions: {} } },
      ],
      isLoading: false,
    } as any)
    mockedCanvasFetch.mockResolvedValue({})
    renderPage()

    fireEvent.click(screen.getByTestId('toggle-new_gradebook'))
    await waitFor(() => {
      expect(mockedCanvasFetch).toHaveBeenCalledWith(
        '/api/v1/courses/1/features/flags/new_gradebook?state=off',
        { method: 'PUT' }
      )
    })
  })

  it('shows locked state and disables toggle for locked features', () => {
    mockedUseCanvasQuery.mockReturnValue({
      data: [
        { feature: 'locked_feature', display_name: 'Locked Feature', description: 'Admin controlled', applies_to: 'Course', beta: false, feature_flag: { feature: 'locked_feature', state: 'allowed', locked: true, transitions: {} } },
      ],
      isLoading: false,
    } as any)
    renderPage()

    const toggleBtn = screen.getByTestId('toggle-locked_feature')
    expect(toggleBtn).toBeDisabled()
    expect(toggleBtn).toHaveTextContent('Locked')
  })
})
