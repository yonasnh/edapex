import { useState, useEffect } from 'react';
import canvasApi from '../services/canvasApi';

// Generic hook for Canvas API calls
export function useCanvasApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}

// Specific hooks for Canvas data
export function useDashboardStats() {
  return useCanvasApi(() => canvasApi.getDashboardStats());
}

export function useCourses(params: { per_page?: number; page?: number } = {}) {
  return useCanvasApi(
    () => canvasApi.getCourses(params),
    [params.per_page, params.page]
  );
}

export function useCourse(courseId: string | number) {
  return useCanvasApi(
    () => canvasApi.getCourse(courseId),
    [courseId]
  );
}

export function useAssignments(
  courseId?: string | number, 
  params: { per_page?: number; page?: number } = {}
) {
  return useCanvasApi(
    () => canvasApi.getAssignments(courseId, params),
    [courseId, params.per_page, params.page]
  );
}

export function useUsers(params: { per_page?: number; page?: number; search_term?: string } = {}) {
  return useCanvasApi(
    () => canvasApi.getUsers(params),
    [params.per_page, params.page, params.search_term]
  );
}

export function useCurrentUser() {
  return useCanvasApi(() => canvasApi.getCurrentUser());
}

export function useCalendarEvents(params: { 
  start_date?: string; 
  end_date?: string; 
  per_page?: number;
  context_codes?: string[];
} = {}) {
  return useCanvasApi(
    () => canvasApi.getCalendarEvents(params),
    [params.start_date, params.end_date, params.per_page, JSON.stringify(params.context_codes)]
  );
}

export function useDiscussions(
  courseId: string | number, 
  params: { per_page?: number; page?: number } = {}
) {
  return useCanvasApi(
    () => canvasApi.getDiscussions(courseId, params),
    [courseId, params.per_page, params.page]
  );
}

export function useFiles(
  courseId?: string | number, 
  params: { per_page?: number; page?: number; search_term?: string } = {}
) {
  return useCanvasApi(
    () => canvasApi.getFiles(courseId, params),
    [courseId, params.per_page, params.page, params.search_term]
  );
}

export function useFolders(
  courseId: string | number, 
  params: { per_page?: number; page?: number } = {}
) {
  return useCanvasApi(
    () => canvasApi.getFolders(courseId, params),
    [courseId, params.per_page, params.page]
  );
}

export function useCanvasHealth() {
  return useCanvasApi(() => canvasApi.healthCheck());
}
