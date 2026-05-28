/**
 * DocViewerWrapper Tests
 * ======================
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import DocViewerWrapper from '../DocViewerWrapper'

describe('DocViewerWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders iframe with correct src', () => {
    render(<DocViewerWrapper fileUrl="/files/123/preview" />)
    const iframe = screen.getByTitle('Document preview')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', `${window.location.origin}/files/123/preview`)
  })

  it('shows loading spinner initially', () => {
    render(<DocViewerWrapper fileUrl="/files/123/preview" />)
    expect(screen.getByText('Loading preview...')).toBeInTheDocument()
  })

  it('hides loading spinner after iframe loads', () => {
    render(<DocViewerWrapper fileUrl="/files/123/preview" />)
    expect(screen.getByText('Loading preview...')).toBeInTheDocument()
    const iframe = screen.getByTitle('Document preview')
    fireEvent.load(iframe)
    expect(screen.queryByText('Loading preview...')).not.toBeInTheDocument()
  })

  it('shows error fallback with download link on error', async () => {
    render(<DocViewerWrapper fileUrl="/files/123/preview" />)
    const iframe = screen.getByTitle('Document preview')

    // jsdom does not support synthetic error events on iframes,
    // so we invoke React's onError handler directly via the internal props key.
    const propsKey = Object.keys(iframe).find((k) => k.startsWith('__reactProps$'))
    const props = propsKey ? (iframe as any)[propsKey] : null
    if (props && props.onError) {
      act(() => props.onError())
    }

    await waitFor(() => {
      expect(screen.getByText('Failed to load document preview.')).toBeInTheDocument()
    })
    const downloadLink = screen.getByRole('link', { name: /Download File/i })
    expect(downloadLink).toBeInTheDocument()
    expect(downloadLink).toHaveAttribute('href', `${window.location.origin}/files/123/download?download_frd=1`)
  })

  it('adds annotatable=1 param when annotatable=true', () => {
    render(<DocViewerWrapper fileUrl="/files/123/preview" annotatable={true} />)
    const iframe = screen.getByTitle('Document preview')
    expect(iframe).toHaveAttribute(
      'src',
      `${window.location.origin}/files/123/preview?annotatable=1`
    )
  })

  it('calls onAnnotationSave on postMessage from iframe', () => {
    const onAnnotationSave = vi.fn()
    render(<DocViewerWrapper fileUrl="/files/123/preview" onAnnotationSave={onAnnotationSave} />)

    const iframe = screen.getByTitle('Document preview') as HTMLIFrameElement

    // Simulate a postMessage from the iframe's content window
    const messageEvent = new MessageEvent('message', {
      source: iframe.contentWindow,
      data: [{ id: 1, text: 'annotation' }],
      origin: window.location.origin,
    })

    window.dispatchEvent(messageEvent)

    expect(onAnnotationSave).toHaveBeenCalledWith([{ id: 1, text: 'annotation' }])
  })
})
