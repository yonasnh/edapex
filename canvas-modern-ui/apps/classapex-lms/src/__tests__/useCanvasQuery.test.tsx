/**
 * useCanvasQuery Hook Unit Tests
 * ================================
 * Verifies the hook correctly delegates to @schoolapex/core,
 * handles the enabled option, and returns proper shape.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockUseRealCanvasQuery = vi.fn()
const mockUseCanvasMutation = vi.fn()
const mockCreateApiClient = vi.fn()
const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()

vi.mock('@schoolapex/core', () => ({
  useCanvasQuery: (...args: any[]) => mockUseRealCanvasQuery(...args),
  useCanvasMutation: (...args: any[]) => mockUseCanvasMutation(...args),
  createApiClient: () => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  }),
}))

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useCanvasQuery hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates to core useCanvasQuery with enabled defaulting to true', () => {
    mockUseRealCanvasQuery.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => useCanvasQuery('/api/v1/courses'))

    expect(mockUseRealCanvasQuery).toHaveBeenCalledWith(
      '/api/v1/courses',
      undefined,
      { enabled: true }
    )
    expect(result.current.data).toEqual([{ id: 1 }])
  })

  it('passes params and options through to core', () => {
    mockUseRealCanvasQuery.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderHook(() =>
      useCanvasQuery('/api/v1/courses', { per_page: 10 }, { enabled: false })
    )

    expect(mockUseRealCanvasQuery).toHaveBeenCalledWith(
      '/api/v1/courses',
      { per_page: 10 },
      { enabled: false }
    )
  })

  it('preserves additional options like refetchInterval and callbacks', () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()

    mockUseRealCanvasQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderHook(() =>
      useCanvasQuery('/api/v1/users/self', undefined, {
        refetchInterval: 5000,
        onSuccess,
        onError,
      })
    )

    expect(mockUseRealCanvasQuery).toHaveBeenCalledWith(
      '/api/v1/users/self',
      undefined,
      { enabled: true, refetchInterval: 5000, onSuccess, onError }
    )
  })
})

describe('canvasFetch helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('performs GET request via client.get', async () => {
    mockGet.mockResolvedValue({ data: 'ok' })
    const result = await canvasFetch('/api/v1/courses')
    expect(mockGet).toHaveBeenCalledWith('/api/v1/courses', undefined)
    expect(result).toEqual({ data: 'ok' })
  })

  it('performs POST request via client.post with JSON body', async () => {
    mockPost.mockResolvedValue({ id: 1 })
    const body = { title: 'Test' }
    const result = await canvasFetch('/api/v1/courses', { method: 'POST', body })
    expect(mockPost).toHaveBeenCalledWith('/api/v1/courses', body)
    expect(result).toEqual({ id: 1 })
  })

  it('performs PUT request via client.put', async () => {
    mockPut.mockResolvedValue({ updated: true })
    const body = { name: 'Updated' }
    await canvasFetch('/api/v1/courses/1', { method: 'PUT', body })
    expect(mockPut).toHaveBeenCalledWith('/api/v1/courses/1', body)
  })

  it('performs DELETE request via client.delete', async () => {
    mockDelete.mockResolvedValue({ deleted: true })
    await canvasFetch('/api/v1/courses/1', { method: 'DELETE' })
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/courses/1')
  })

  it('converts URLSearchParams to plain object for POST', async () => {
    mockPost.mockResolvedValue({ ok: true })
    const params = new URLSearchParams()
    params.append('name', 'Test')
    params.append('active', 'true')
    await canvasFetch('/api/v1/courses', { method: 'POST', body: params })
    expect(mockPost).toHaveBeenCalledWith('/api/v1/courses', {
      name: 'Test',
      active: 'true',
    })
  })

  it('passes FormData body directly without serialization', async () => {
    mockPost.mockResolvedValue({ ok: true })
    const formData = new FormData()
    formData.append('title', 'Test')
    await canvasFetch('/api/v1/courses', { method: 'POST', body: formData })
    expect(mockPost).toHaveBeenCalledWith('/api/v1/courses', formData)
  })
})
