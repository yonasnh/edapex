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

function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // deletion
          matrix[i][j - 1] + 1,    // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        )
      }
    }
  }
  return matrix[a.length][b.length]
}

function fuzzyMatch(target: string, query: string): boolean {
  const t = target.toLowerCase().trim()
  const q = query.toLowerCase().trim()
  
  if (!q) return true
  if (t.includes(q)) return true

  // Word-level matching
  const targetWords = t.split(/\s+/)
  const queryWords = q.split(/\s+/)

  // If all query words are present (or very close to) target words
  return queryWords.every(qw => {
    if (targetWords.some(tw => tw.includes(qw))) return true
    
    return targetWords.some(tw => {
      const maxDistance = qw.length > 4 ? 2 : qw.length > 2 ? 1 : 0
      return getLevenshteinDistance(tw, qw) <= maxDistance
    })
  })
}

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
      const token = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? ''
      const headers: HeadersInit = {
        Accept: 'application/json',
        'X-CSRF-Token': decodeURIComponent(token),
      }

      // Parallel search: courses + account courses + people
      const [coursesRes, accountCoursesRes, peopleRes] = await Promise.allSettled([
        fetch(`/api/v1/courses?per_page=50&include[]=term`, {
          headers,
          signal: abortRef.current.signal,
        }),
        fetch(`/api/v1/accounts/1/courses?per_page=50&include[]=term`, {
          headers,
          signal: abortRef.current.signal,
        }),
        fetch(`/api/v1/search/recipients?search=${encodeURIComponent(query)}&per_page=5`, {
          headers,
          signal: abortRef.current.signal,
        }),
      ])

      const mapped: SearchResult[] = []

      let apiCourses: any[] = []
      if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
        try {
          apiCourses = await coursesRes.value.json()
        } catch (e) {
          console.warn('[useGlobalSearch] failed to parse courses JSON:', e)
        }
      }

      let apiAccountCourses: any[] = []
      if (accountCoursesRes.status === 'fulfilled' && accountCoursesRes.value.ok) {
        try {
          apiAccountCourses = await accountCoursesRes.value.json()
        } catch (e) {
          console.warn('[useGlobalSearch] failed to parse account courses JSON:', e)
        }
      }

      // De-duplicate API courses by name
      const mergedCoursesMap = new Map<string, any>()

      if (Array.isArray(apiCourses)) {
        apiCourses.forEach((c: any) => {
          if (c && c.name) {
            mergedCoursesMap.set(c.name.toLowerCase(), {
              id: c.id,
              name: c.name,
              course_code: c.course_code,
              term_name: c.term?.name
            })
          }
        })
      }

      if (Array.isArray(apiAccountCourses)) {
        apiAccountCourses.forEach((c: any) => {
          if (c && c.name) {
            mergedCoursesMap.set(c.name.toLowerCase(), {
              id: c.id,
              name: c.name,
              course_code: c.course_code,
              term_name: c.term?.name
            })
          }
        })
      }

      // Filter courses locally by search term (fuzzy matching)
      const filteredCourses = Array.from(mergedCoursesMap.values()).filter(c =>
        fuzzyMatch(c.name, query) ||
        (c.course_code && fuzzyMatch(c.course_code, query))
      )

      // Map to search results
      filteredCourses.slice(0, 4).forEach((c) => {
        mapped.push({
          id: `course-${c.id}`,
          title: c.name,
          type: 'course',
          subtitle: c.course_code ?? c.term_name,
          url: `/courses/${c.id}`,
        })
      })

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

// ─── Global Account Announcements ───────────────────────────────────────────

export interface AccountNotification {
  id: number
  subject: string
  message: string
  start_at: string
  end_at: string
  icon: string
  roles?: string[]
}

export function useAccountNotifications() {
  const { data, isLoading, refetch } = useCanvasQuery<AccountNotification[]>(
    '/api/v1/accounts/1/account_notifications',
    {} as any
  )

  const dismissNotification = useCallback(async (id: number) => {
    try {
      const token = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? '';
      const headers: Record<string, string> = {
        'X-CSRF-Token': decodeURIComponent(token),
      };
      const apiToken = import.meta.env.VITE_CANVAS_API_TOKEN || localStorage.getItem('cx_access_token');
      if (apiToken) {
        headers['Authorization'] = `Bearer ${apiToken}`;
      }
      await fetch(`/api/v1/accounts/1/account_notifications/${id}`, {
        method: 'DELETE',
        headers,
      })
      refetch()
    } catch (err) {
      console.error('Failed to dismiss global notification:', err)
    }
  }, [refetch])

  return {
    notifications: data || [],
    isLoading,
    refetch,
    dismissNotification,
  }
}
