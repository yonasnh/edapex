/**
 * PushNotificationManager Tests
 * =============================
 */

import React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { PushNotificationManager } from '../PushNotificationManager'

const mockShowToast = vi.fn()

vi.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({ showToast: mockShowToast }),
}))

const mockGetSubscription = vi.fn()
const mockSubscribe = vi.fn()
const mockUnsubscribe = vi.fn()

function setupNotificationMocks(permission: NotificationPermission = 'default') {
  Object.defineProperty(global, 'Notification', {
    writable: true,
    configurable: true,
    value: class MockNotification {
      static permission = permission
    },
  })

  Object.defineProperty(global.navigator, 'serviceWorker', {
    writable: true,
    configurable: true,
    value: {
      ready: Promise.resolve({
        pushManager: {
          getSubscription: mockGetSubscription,
          subscribe: mockSubscribe,
        },
      }),
    },
  })
}

function clearNotificationMocks() {
  // Remove Notification from global so ('Notification' in window) is false
  try {
    delete (global as any).Notification
  } catch {
    Object.defineProperty(global, 'Notification', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  }

  try {
    delete (global.navigator as any).serviceWorker
  } catch {
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  }
}

describe('PushNotificationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearNotificationMocks()
  })

  it('returns null if Notification API not supported', () => {
    clearNotificationMocks()
    const { container } = render(<PushNotificationManager vapidPublicKey="test-key" />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null if permission is denied', async () => {
    setupNotificationMocks('denied')
    mockGetSubscription.mockResolvedValue(null)
    const { container } = render(<PushNotificationManager vapidPublicKey="test-key" />)
    // Allow microtasks to flush so useEffect promises resolve
    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('shows prompt after timeout when permission is default', async () => {
    setupNotificationMocks('default')
    mockGetSubscription.mockResolvedValue(null)

    const originalSetTimeout = global.setTimeout
    let timeoutCallback: Function | null = null
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: any, delay?: number) => {
      if (delay === 5000 && typeof cb === 'function') {
        timeoutCallback = cb
        return 123 as any
      }
      return originalSetTimeout(cb, delay)
    })

    render(<PushNotificationManager vapidPublicKey="test-key" />)

    await waitFor(() => {
      expect(timeoutCallback).not.toBeNull()
    })

    act(() => timeoutCallback!())

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Stay in the loop')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enable/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Not now/i })).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('shows "Push On" button when subscribed', async () => {
    setupNotificationMocks('granted')
    const subscription = { unsubscribe: mockUnsubscribe }
    mockGetSubscription.mockResolvedValue(subscription)
    render(<PushNotificationManager vapidPublicKey="test-key" />)

    await waitFor(() => {
      expect(screen.getByText(/Push On/i)).toBeInTheDocument()
    })
  })

  it('calls subscribe when "Enable" clicked', async () => {
    setupNotificationMocks('default')
    mockGetSubscription.mockResolvedValue(null)
    const newSubscription = { unsubscribe: mockUnsubscribe }
    mockSubscribe.mockResolvedValue(newSubscription)

    const originalSetTimeout = global.setTimeout
    let timeoutCallback: Function | null = null
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: any, delay?: number) => {
      if (delay === 5000 && typeof cb === 'function') {
        timeoutCallback = cb
        return 123 as any
      }
      return originalSetTimeout(cb, delay)
    })

    render(<PushNotificationManager vapidPublicKey="test-key" />)

    await waitFor(() => {
      expect(timeoutCallback).not.toBeNull()
    })

    act(() => timeoutCallback!())

    expect(screen.getByRole('button', { name: /Enable/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Enable/i }))

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })

    vi.restoreAllMocks()
  })

  it('calls unsubscribe when "Push On" clicked', async () => {
    setupNotificationMocks('granted')
    const subscription = { unsubscribe: mockUnsubscribe }
    mockGetSubscription.mockResolvedValue(subscription)
    mockUnsubscribe.mockResolvedValue(undefined)

    render(<PushNotificationManager vapidPublicKey="test-key" />)

    await waitFor(() => {
      expect(screen.getByText(/Push On/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/Push On/i).closest('button')!)

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  it('hides prompt when "Not now" clicked', async () => {
    setupNotificationMocks('default')
    mockGetSubscription.mockResolvedValue(null)

    const originalSetTimeout = global.setTimeout
    let timeoutCallback: Function | null = null
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: any, delay?: number) => {
      if (delay === 5000 && typeof cb === 'function') {
        timeoutCallback = cb
        return 123 as any
      }
      return originalSetTimeout(cb, delay)
    })

    render(<PushNotificationManager vapidPublicKey="test-key" />)

    await waitFor(() => {
      expect(timeoutCallback).not.toBeNull()
    })

    act(() => timeoutCallback!())

    expect(screen.getByRole('alert')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Not now/i }))

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    vi.restoreAllMocks()
  })
})
