import { useCanvasQuery as useRealCanvasQuery, useCanvasMutation } from '../../../../packages/core/src/hooks/useCanvasApi'

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
