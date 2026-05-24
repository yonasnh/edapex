import canvasApi from './canvasApi';
// Assuming Apollo client is set up elsewhere in the app (e.g., in a Context or lib)
import { useQuery, useMutation, DocumentNode } from '@apollo/client';

export interface HybridRequestOptions {
  forceRest?: boolean;
  adminContext?: boolean; // If true, forces REST because GraphQL might lack admin support
  masqueradeAsUser?: string; // Canvas 'as_user_id' parameter for masquerading
}

/**
 * Hybrid API Client
 * Routes requests to Canvas GraphQL (for speed/standard workflows)
 * or Canvas REST API v1 (for admin, masquerading, and missing features).
 */
class HybridApiClient {
  
  // ==========================================
  // Administrative & Masquerade Helpers (REST)
  // ==========================================

  /**
   * Masquerade as a specific user for administrative viewing
   * Requires Account Admin privileges in Canvas.
   */
  async getUserAsAdmin(userId: string | number, masqueradeAs?: string | number) {
    const endpoint = `/api/v1/users/${userId}?include=avatar_url,bio,locale,permissions`;
    const finalEndpoint = masqueradeAs ? `${endpoint}&as_user_id=${masqueradeAs}` : endpoint;
    
    // Using the internal makeRequest of canvasApi (which we might need to expose or recreate if private)
    // For now, we'll use a fetch wrapper or expose it. Since makeRequest is private in canvasApi,
    // we'll fetch using standard fetch + env token for this admin wrapper.
    const baseUrl = '';
    const token = (import.meta as any).env?.VITE_CANVAS_API_TOKEN;
    
    const res = await fetch(`${baseUrl}${finalEndpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!res.ok) throw new Error('Failed to fetch user as admin');
    return res.json();
  }

  /**
   * Get Sub-Accounts (Administrative)
   * GraphQL often lacks deep sub-account tree queries.
   */
  async getAccounts() {
    const token = (import.meta as any).env?.VITE_CANVAS_API_TOKEN;
    const res = await fetch(`/api/v1/accounts?include[]=sub_accounts`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
  }

  // ==========================================
  // Data Fetching Facades
  // ==========================================

  /**
   * Fetch courses using REST (fallback if GraphQL fails or for admin)
   */
  async getCoursesRest(params: any = {}) {
    return canvasApi.getCourses(params);
  }

  // You can wrap other REST calls from canvasApi here to provide a unified interface.
}

export const hybridApi = new HybridApiClient();
export default hybridApi;
