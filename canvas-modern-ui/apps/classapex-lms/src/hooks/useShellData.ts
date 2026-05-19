/**
 * useShellData — Canvas API bindings for the App Shell
 * =====================================================
 * Provides:
 *  - Activity stream items for NotificationDropdown
 *  - Global search results for GlobalSearchModal
 *  - Current user info for TopBar
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useCanvasQuery } from './useCanvasQuery'
import type { ActivityStreamItem } from '../../../../packages/components/src/ui/layout/NotificationDropdown'
import type { SearchResult } from '../../../../packages/components/src/ui/layout/GlobalSearchModal'

// ─── Activity Stream ────────────────────────────────────────────────────────

interface RawStreamItem {
  id: number
  title: string
  message: string
  type: string
  read_state: boolean
  created_at: string
  html_url: string
  course_id?: number
}

export function useActivityStream() {
  const { data, isLoading, refetch } = useCanvasQuery<RawStreamItem[]>(
    '/api/v1/users/self/activity_stream',
    { per_page: 20 } as any,
  )

  const items: ActivityStreamItem[] = (data ?? []).slice(0, 15).map(item => ({
    id: item.id,
    title: item.title ?? 'Notification',
    message: item.message?.replace(/<[^>]+>/g, '').trim().slice(0, 100) ?? '',
    type: item.type ?? 'general',
    read_state: item.read_state,
    created_at: item.created_at,
    html_url: item.html_url ?? '#',
    course_id: item.course_id,
  }))

  const unreadCount = items.filter(i => !i.read_state).length

  const markAllRead = useCallback(async () => {
    // Canvas doesn't have a bulk-mark-all-read endpoint for activity stream
    // We optimistically refresh; individual read states set via Canvas UI
    await refetch()
  }, [refetch])

  return { items, unreadCount, isLoading, markAllRead }
}

// ─── Current User ───────────────────────────────────────────────────────────

interface CanvasUser {
  id: string
  name: string
  display_name?: string
  avatar_url?: string
  primary_email?: string
  login_id?: string
  bio?: string
}

export function useCurrentUser() {
  const { data, isLoading } = useCanvasQuery<CanvasUser>(
    '/api/v1/users/self',
    { include: ['avatar_url', 'bio'] } as any,
  )

  return {
    user: data ?? null,
    isLoading,
    displayName: data?.display_name ?? data?.name ?? 'User',
    avatarUrl: data?.avatar_url,
  }
}

// ─── Global Search ──────────────────────────────────────────────────────────

export function useGlobalSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    // Abort previous in-flight request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setIsSearching(true)

    try {
      // Canvas search recipients (people)
      const token = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? ''
      const headers: HeadersInit = {
        Accept: 'application/json',
        'X-CSRF-Token': decodeURIComponent(token),
      }

      // Parallel search: courses + people
      const [coursesRes, peopleRes] = await Promise.allSettled([
        fetch(`/api/v1/courses?search_term=${encodeURIComponent(query)}&per_page=5&include[]=term`, {
          headers,
          signal: abortRef.current.signal,
        }),
        fetch(`/api/v1/search/recipients?search=${encodeURIComponent(query)}&per_page=5`, {
          headers,
          signal: abortRef.current.signal,
        }),
      ])

      const mapped: SearchResult[] = []

      if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
        const courses = await coursesRes.value.json()
        courses.slice(0, 4).forEach((c: any) => {
          mapped.push({
            id: `course-${c.id}`,
            title: c.name,
            type: 'course',
            subtitle: c.course_code ?? c.term?.name,
            url: `/courses/${c.id}`,
          })
        })
      }

      if (peopleRes.status === 'fulfilled' && peopleRes.value.ok) {
        const people = await peopleRes.value.json()
        people.slice(0, 3).forEach((p: any) => {
          mapped.push({
            id: `user-${p.id}`,
            title: p.full_name ?? p.name,
            type: 'user',
            subtitle: p.common_courses_count
              ? `${p.common_courses_count} shared course(s)`
              : undefined,
            url: `/users/${p.id}`,
          })
        })
      }

      setResults(mapped)
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('[useGlobalSearch] search error:', err)
        setResults([])
      }
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    abortRef.current?.abort()
  }, [])

  return { results, isSearching, search, clearResults }
}
