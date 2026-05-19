// Canvas LMS REST API Service
// This service provides a reliable way to fetch data from Canvas LMS using the REST API

interface CanvasApiConfig {
  baseUrl: string;
  apiToken?: string;
}

class CanvasApiService {
  private config: CanvasApiConfig;

  constructor(config: CanvasApiConfig) {
    this.config = config;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token is available
    if (this.config.apiToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.config.apiToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Canvas API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Canvas API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard Stats (aggregated from multiple endpoints)
  async getDashboardStats() {
    try {
      // Get basic stats from available endpoints
      const [courses, users] = await Promise.allSettled([
        this.getCourses({ per_page: 100 }),
        this.getUsers({ per_page: 100 }),
      ]);

      const coursesData = courses.status === 'fulfilled' ? courses.value : [];
      const usersData = users.status === 'fulfilled' ? users.value : [];

      // Calculate stats
      const activeCourses = coursesData.filter((course: any) => 
        course.workflow_state === 'available'
      ).length;

      const totalAssignments = coursesData.reduce((sum: number, course: any) => {
        // This would require additional API calls to get assignment counts
        return sum + (course.assignment_count || 0);
      }, 0);

      return {
        totalUsers: usersData.length,
        totalCourses: coursesData.length,
        activeCourses,
        totalAssignments,
        totalSubmissions: 0, // Would need additional API calls
        activeUsers: usersData.filter((user: any) => user.workflow_state === 'active').length,
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return null;
    }
  }

  // Courses
  async getCourses(params: { per_page?: number; page?: number } = {}) {
    const queryParams = new URLSearchParams({
      per_page: (params.per_page || 10).toString(),
      page: (params.page || 1).toString(),
      include: 'course_image,banner_image,public_description,syllabus_body,term,course_progress,sections,storage_quota_used_mb,total_students,teachers,tas,concluded',
    });

    return this.makeRequest<any[]>(`/api/v1/courses?${queryParams}`);
  }

  // Single Course
  async getCourse(courseId: string | number) {
    return this.makeRequest<any>(`/api/v1/courses/${courseId}?include=course_image,banner_image,public_description,syllabus_body,term,course_progress,sections,storage_quota_used_mb,total_students,teachers,tas`);
  }

  // Assignments
  async getAssignments(courseId?: string | number, params: { per_page?: number; page?: number } = {}) {
    const queryParams = new URLSearchParams({
      per_page: (params.per_page || 10).toString(),
      page: (params.page || 1).toString(),
      include: 'submission,assignment_visibility,overrides,observed_users,can_edit,score_statistics',
    });

    // If courseId is provided, get assignments for that course
    // Otherwise, try to get assignments from all courses the user has access to
    if (courseId) {
      return this.makeRequest<any[]>(`/api/v1/courses/${courseId}/assignments?${queryParams}`);
    } else {
      // Get assignments from all available courses
      try {
        const courses = await this.getCourses({ per_page: 100 });
        const allAssignments: any[] = [];

        // Get assignments from each course (limit to first 5 courses to avoid too many requests)
        const coursesToCheck = courses.slice(0, 5);

        for (const course of coursesToCheck) {
          try {
            const courseAssignments = await this.makeRequest<any[]>(
              `/api/v1/courses/${course.id}/assignments?${queryParams}`
            );
            if (courseAssignments) {
              allAssignments.push(...courseAssignments);
            }
          } catch (error) {
            // Skip courses that don't allow assignment access
            console.warn(`Could not fetch assignments for course ${course.id}:`, error);
          }
        }

        return allAssignments;
      } catch (error) {
        console.error('Failed to get assignments:', error);
        return [];
      }
    }
  }

  // Users
  async getUsers(params: { per_page?: number; page?: number; search_term?: string } = {}) {
    const queryParams = new URLSearchParams({
      per_page: (params.per_page || 10).toString(),
      page: (params.page || 1).toString(),
    });

    if (params.search_term) {
      queryParams.append('search_term', params.search_term);
    }

    return this.makeRequest<any[]>(`/api/v1/accounts/self/users?${queryParams}`);
  }

  // Current User
  async getCurrentUser() {
    return this.makeRequest<any>('/api/v1/users/self?include=avatar_url,bio,locale,permissions');
  }

  // Calendar Events
  async getCalendarEvents(params: { 
    start_date?: string; 
    end_date?: string; 
    per_page?: number;
    context_codes?: string[];
  } = {}) {
    const queryParams = new URLSearchParams({
      per_page: (params.per_page || 50).toString(),
    });

    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.context_codes) {
      params.context_codes.forEach(code => queryParams.append('context_codes[]', code));
    }

    return this.makeRequest<any[]>(`/api/v1/calendar_events?${queryParams}`);
  }

  // Discussions
  async getDiscussions(courseId: string | number, params: { per_page?: number; page?: number } = {}) {
    const queryParams = new URLSearchParams({
      per_page: (params.per_page || 10).toString(),
      page: (params.page || 1).toString(),
      include: 'sections,sections_user_count,overrides',
    });

    return this.makeRequest<any[]>(`/api/v1/courses/${courseId}/discussion_topics?${queryParams}`);
  }

  // Files
  async getFiles(courseId?: string | number, params: { per_page?: number; page?: number; search_term?: string } = {}) {
    const queryParams = new URLSearchParams({
      per_page: (params.per_page || 10).toString(),
      page: (params.page || 1).toString(),
    });

    if (params.search_term) {
      queryParams.append('search_term', params.search_term);
    }

    const endpoint = courseId 
      ? `/api/v1/courses/${courseId}/files?${queryParams}`
      : `/api/v1/users/self/files?${queryParams}`;

    return this.makeRequest<any[]>(endpoint);
  }

  // Folders
  async getFolders(courseId: string | number, params: { per_page?: number; page?: number } = {}) {
    const queryParams = new URLSearchParams({
      per_page: (params.per_page || 10).toString(),
      page: (params.page || 1).toString(),
    });

    return this.makeRequest<any[]>(`/api/v1/courses/${courseId}/folders?${queryParams}`);
  }

  // Canvas 3-Step File Upload
  // Step 1: Request upload permission → returns upload_url and upload_params
  async requestUpload(params: {
    name: string
    size: number
    contentType: string
    parentFolderId?: number | string
    onProgress?: (pct: number) => void
  }) {
    const body: Record<string, any> = {
      name: params.name,
      size: params.size,
      'content_type': params.contentType,
    }
    if (params.parentFolderId) {
      body.parent_folder_id = params.parentFolderId
    }

    try {
      const startRes = await fetch(`/api/v1/users/self/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(this.config.apiToken ? { Authorization: `Bearer ${this.config.apiToken}` } : {}) },
        body: JSON.stringify(body),
      })

      if (!startRes.ok) throw new Error(`Upload init failed: ${startRes.status}`)
      const uploadTicket = await startRes.json()
      return uploadTicket // { upload_url, upload_params, ... }
    } catch (err) {
      console.error('Upload request failed:', err)
      throw err
    }
  }

  // Step 2: Upload the file to the S3-compatible URL
  async uploadFileToUrl(uploadUrl: string, uploadParams: Record<string, string>, file: File, onProgress?: (pct: number) => void) {
    const form = new FormData()
    Object.entries(uploadParams).forEach(([k, v]) => form.append(k, v))
    form.append('file', file)

    const xhr = new XMLHttpRequest()
    return new Promise<any>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)) }
          catch { resolve(xhr.responseText) }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      })
      xhr.addEventListener('error', () => reject(new Error('Upload network error')))
      xhr.open('POST', uploadUrl)
      xhr.send(form)
    })
  }

  // Step 3: Confirm upload is complete
  async confirmUpload(fileId: string | number) {
    return this.makeRequest<any>(`/api/v1/files/${fileId}`)
  }

  // Full convenience method: 3-step upload in one call
  async uploadFile(file: File, parentFolderId?: number | string) {
    const ticket = await this.requestUpload({
      name: file.name,
      size: file.size,
      contentType: file.type || 'application/octet-stream',
      parentFolderId,
    })
    const uploaded = await this.uploadFileToUrl(ticket.upload_url, ticket.upload_params, file)
    return this.confirmUpload(uploaded.id)
  }

  // Health Check
  async healthCheck(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.getCurrentUser();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Create and export the Canvas API service instance
const canvasApi = new CanvasApiService({
  baseUrl: '', // Use relative URLs since we're using Vite proxy
  // Vite exposes env vars via import.meta.env, NOT process.env
  apiToken: (import.meta as any).env?.VITE_CANVAS_API_TOKEN,
});

export default canvasApi;
