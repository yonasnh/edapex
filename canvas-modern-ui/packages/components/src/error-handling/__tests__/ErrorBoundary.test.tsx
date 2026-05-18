import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Component Error')).toBeInTheDocument()
    expect(screen.getByText(/This component encountered an error/)).toBeInTheDocument()
  })

  it('should render page-level error UI for page level boundary', () => {
    render(
      <ErrorBoundary level="page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument()
  })

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
      expect.any(String)
    )
  })

  it('should show retry button and allow retry', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Try Again')).toBeInTheDocument()

    // Click retry button - this should call handleRetry
    const retryButton = screen.getByText('Try Again')
    expect(retryButton).toBeInTheDocument()

    // Just verify the button is clickable and doesn't crash
    fireEvent.click(retryButton)

    // The error boundary should still show the error since the component still throws
    expect(screen.getByText('Component Error')).toBeInTheDocument()
  })

  it('should show reload button', () => {
    // Mock window.location.reload
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText('Reload Page')
    expect(reloadButton).toBeInTheDocument()

    fireEvent.click(reloadButton)
    expect(mockReload).toHaveBeenCalled()
  })

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Show Details')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Show Details'))
    expect(screen.getByText('Error Details')).toBeInTheDocument()
    expect(screen.getByText('Error Message')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error fallback</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument()
    expect(screen.queryByText('Component Error')).not.toBeInTheDocument()
  })

  it('should show help text for page-level errors', () => {
    render(
      <ErrorBoundary level="page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('What can you do?')).toBeInTheDocument()
    expect(screen.getByText('Try refreshing the page')).toBeInTheDocument()
    expect(screen.getByText('Check your internet connection')).toBeInTheDocument()
  })

  it('should copy error details to clipboard', async () => {
    const mockWriteText = vi.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    })

    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Show Details'))
    fireEvent.click(screen.getByText('Copy Details'))

    expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('Error ID:'))

    process.env.NODE_ENV = originalEnv
  })

  it('should limit retry attempts', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Try multiple retries
    for (let i = 0; i < 4; i++) {
      if (screen.queryByText('Try Again')) {
        fireEvent.click(screen.getByText('Try Again'))
        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        )
      }
    }

    // After max retries, Try Again button should not be available
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
  })
})
