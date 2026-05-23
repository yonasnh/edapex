import { useCanvasQuery as useRealCanvasQuery, useCanvasMutation, createApiClient } from '@schoolapex/core'

export { useCanvasMutation }

export function useCanvasQuery<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | string[]>,
  options?: { enabled?: boolean; refetchInterval?: number; onSuccess?: (data: T) => void; onError?: (error: Error) => void }
): { data: T | null; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => Promise<void> } {
  return useRealCanvasQuery<T>(endpoint, params, {
    ...options,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Robust, authenticated API helper that automatically attaches
 * CSRF tokens, credentials, and Authorization headers.
 */
export async function canvasFetch(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    headers?: Record<string, string>
  } = {}
): Promise<any> {
  const client = createApiClient()
  const method = options.method || 'GET'
  let finalBody = options.body

  if (finalBody instanceof URLSearchParams) {
    const obj: Record<string, any> = {}
    finalBody.forEach((value, key) => {
      obj[key] = value
    })
    finalBody = obj
  }

  switch (method.toUpperCase()) {
    case 'GET':
      return client.get(endpoint, finalBody)
    case 'POST':
      return client.post(endpoint, finalBody)
    case 'PUT':
      return client.put(endpoint, finalBody)
    case 'DELETE':
      return client.delete(endpoint)
    default:
      throw new Error(`Unsupported HTTP method: ${method}`)
  }
}

