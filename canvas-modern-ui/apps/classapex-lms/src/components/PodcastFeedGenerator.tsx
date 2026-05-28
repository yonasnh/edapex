/**
 * PodcastFeedGenerator — ClassApex LMS
 * =====================================
 * Generates podcast RSS feeds from Canvas announcements and discussions.
 */

import React, { useState, useCallback } from 'react'
import { useCanvasQuery } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'

interface FeedItem {
  title: string
  description: string
  link: string
  pubDate: string
  guid: string
  enclosure?: {
    url: string
    type: string
    length: number
  }
  author?: string
}

interface PodcastFeedGeneratorProps {
  courseId: string
  feedType: 'announcements' | 'discussions' | 'both'
  title?: string
  description?: string
  author?: string
  imageUrl?: string
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

function buildRss({
  title,
  link,
  description,
  author,
  imageUrl,
  items,
}: {
  title: string
  link: string
  description: string
  author?: string
  imageUrl?: string
  items: FeedItem[]
}): string {
  const now = new Date().toUTCString()
  const itunesNS = 'xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"'
  const contentNS = 'xmlns:content="http://purl.org/rss/1.0/modules/content/"'

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" ${itunesNS} ${contentNS}>
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>ClassApex LMS Podcast Feed</generator>
`

  if (author) {
    rss += `    <itunes:author>${escapeXml(author)}</itunes:author>\n`
    rss += `    <itunes:owner><itunes:name>${escapeXml(author)}</itunes:name></itunes:owner>\n`
  }

  if (imageUrl) {
    rss += `    <itunes:image href="${escapeXml(imageUrl)}"/>\n`
    rss += `    <image><url>${escapeXml(imageUrl)}</url><title>${escapeXml(title)}</title><link>${escapeXml(link)}</link></image>\n`
  }

  rss += `    <itunes:category text="Education"/>\n`

  items.forEach(item => {
    rss += `    <item>\n`
    rss += `      <title>${escapeXml(item.title)}</title>\n`
    rss += `      <link>${escapeXml(item.link)}</link>\n`
    rss += `      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>\n`
    rss += `      <pubDate>${item.pubDate}</pubDate>\n`
    rss += `      <description>${escapeXml(stripHtml(item.description))}</description>\n`
    rss += `      <content:encoded><![CDATA[${item.description}]]></content:encoded>\n`
    if (item.author) {
      rss += `      <itunes:author>${escapeXml(item.author)}</itunes:author>\n`
    }
    if (item.enclosure) {
      rss += `      <enclosure url="${escapeXml(item.enclosure.url)}" type="${escapeXml(item.enclosure.type)}" length="${item.enclosure.length}"/>\n`
    }
    rss += `    </item>\n`
  })

  rss += `  </channel>\n</rss>`
  return rss
}

function extractAudioEnclosure(item: any): FeedItem['enclosure'] | undefined {
  const attachments = item?.attachments || []
  const audio = attachments.find((a: any) => {
    const mime = a?.content_type || a?.mime_class || ''
    return mime.startsWith('audio/') || /\.(mp3|wav|ogg|aac|m4a)$/i.test(a?.display_name || a?.filename || '')
  })
  if (audio?.url) {
    return {
      url: audio.url,
      type: audio.content_type || 'audio/mpeg',
      length: audio.size || 0,
    }
  }
  return undefined
}

function toFeedItems(data: any[], baseUrl: string): FeedItem[] {
  if (!Array.isArray(data)) return []
  return data.map(item => {
    const posted = item.posted_at || item.created_at || new Date().toISOString()
    const date = new Date(posted)
    return {
      title: item.title || 'Untitled',
      description: item.message || item.description || '',
      link: `${baseUrl}/discussion_topics/${item.id}`,
      pubDate: date.toUTCString(),
      guid: `classapex-${item.id}`,
      enclosure: extractAudioEnclosure(item),
      author: item.author?.display_name || item.user_name || 'Instructor',
    }
  })
}

export default function PodcastFeedGenerator({
  courseId,
  feedType,
  title: customTitle,
  description: customDescription,
  author,
  imageUrl,
}: PodcastFeedGeneratorProps) {
  const { showToast } = useNotification()
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: announcements } = useCanvasQuery<any[]>(
    feedType === 'announcements' || feedType === 'both'
      ? `/api/v1/courses/${courseId}/announcements`
      : '',
    { per_page: 50 } as any,
    { enabled: !!courseId && (feedType === 'announcements' || feedType === 'both') }
  )

  const { data: discussions } = useCanvasQuery<any[]>(
    feedType === 'discussions' || feedType === 'both'
      ? `/api/v1/courses/${courseId}/discussion_topics`
      : '',
    { per_page: 50 } as any,
    { enabled: !!courseId && (feedType === 'discussions' || feedType === 'both') }
  )

  const generateRss = useCallback((): string => {
    const baseUrl = `${window.location.origin}/courses/${courseId}`
    const items: FeedItem[] = []

    if (feedType === 'announcements' || feedType === 'both') {
      items.push(...toFeedItems(Array.isArray(announcements) ? announcements : [], baseUrl))
    }
    if (feedType === 'discussions' || feedType === 'both') {
      items.push(...toFeedItems(Array.isArray(discussions) ? discussions : [], baseUrl))
    }

    items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

    const title = customTitle || `Course Podcast Feed`
    const description = customDescription || `RSS feed for course content.`

    return buildRss({
      title,
      link: baseUrl,
      description,
      author,
      imageUrl,
      items,
    })
  }, [courseId, feedType, announcements, discussions, customTitle, customDescription, author, imageUrl])

  const handleCopyUrl = useCallback(async () => {
    const rss = generateRss()
    const base64 = btoa(unescape(encodeURIComponent(rss)))
    const url = `data:application/rss+xml;base64,${base64}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      showToast({ title: 'RSS URL copied', type: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast({ title: 'Copy failed', message: 'Please copy manually.', type: 'error' })
    }
  }, [generateRss, showToast])

  const handleDownload = useCallback(() => {
    const rss = generateRss()
    const base64 = btoa(unescape(encodeURIComponent(rss)))
    const url = `data:application/rss+xml;base64,${base64}`
    const a = document.createElement('a')
    a.href = url
    a.download = `podcast-feed-${courseId}.rss`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    showToast({ title: 'RSS feed downloaded', type: 'success' })
  }, [generateRss, courseId, showToast])

  const feedLabel = feedType === 'both' ? 'Announcements & Discussions' : feedType === 'announcements' ? 'Announcements' : 'Discussions'

  return (
    <>
      <button
        className="cx-btn cx-btn--ghost cx-btn--sm"
        onClick={() => setShowModal(true)}
        title="Generate podcast RSS feed"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 10a7 7 0 0114 0M6 10a4 4 0 018 0M9 10a1 1 0 012 0"/>
        </svg>
        Podcast Feed
      </button>

      {showModal && (
        <div className="cx-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Podcast RSS Feed</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowModal(false)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13"/></svg>
              </button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>
                  Feed Source
                </label>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>{feedLabel}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>
                  Items Included
                </label>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>
                  {(Array.isArray(announcements) ? announcements.length : 0) + (Array.isArray(discussions) ? discussions.length : 0)} items
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleCopyUrl}>
                  {copied ? 'Copied!' : 'Copy RSS URL'}
                </button>
                <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleDownload}>
                  Download RSS
                </button>
              </div>
              <details>
                <summary style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', cursor: 'pointer' }}>
                  Preview RSS XML
                </summary>
                <pre
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: 'var(--cx-bg-surface-sunken)',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: 240,
                    color: 'var(--cx-text-primary)',
                    border: '1px solid var(--cx-border-subtle)',
                  }}
                >
                  {generateRss().slice(0, 2000)}…
                </pre>
              </details>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
