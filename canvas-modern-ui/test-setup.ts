import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'
import React from 'react'

// Mock Chart.js for testing
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  ArcElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
}))

vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => React.createElement('div', { 'data-testid': 'line-chart', 'data-chart-data': JSON.stringify(data) }),
  Bar: ({ data, options }: any) => React.createElement('div', { 'data-testid': 'bar-chart', 'data-chart-data': JSON.stringify(data) }),
  Pie: ({ data, options }: any) => React.createElement('div', { 'data-testid': 'pie-chart', 'data-chart-data': JSON.stringify(data) }),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

if (typeof window !== 'undefined') {
  // Mock window.crypto for OAuth2 tests
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256)
        }
        return arr
      },
      subtle: {
        digest: async (algorithm: string, data: ArrayBuffer) => {
          // Simple mock hash
          const view = new Uint8Array(data)
          const hash = new ArrayBuffer(32)
          const hashView = new Uint8Array(hash)
          for (let i = 0; i < 32; i++) {
            hashView[i] = view[i % view.length] || 0
          }
          return hash
        },
      },
    },
  })

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

  // Mock performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      timing: {
        responseStart: 100,
        requestStart: 50,
      },
    },
  })

  // Mock matchMedia for Carbon components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock fetch
global.fetch = vi.fn()

// Mock IntersectionObserver
if (typeof global.IntersectionObserver === 'undefined') {
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

// Mock PerformanceObserver
if (typeof global.PerformanceObserver === 'undefined') {
  global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  }))
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
})
