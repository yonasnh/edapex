import React from 'react';
import { User } from '@schoolapex/core';
/**
 * Search result interface
 */
interface SearchResult {
    id: string;
    type: 'course' | 'assignment' | 'discussion' | 'file' | 'user' | 'announcement' | 'calendar';
    title: string;
    description?: string;
    url: string;
    course?: string;
    date?: Date;
    relevance: number;
    metadata?: Record<string, any>;
}
/**
 * Search filter interface
 */
interface SearchFilter {
    types: string[];
    courses: string[];
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    includeArchived: boolean;
}
/**
 * Global Search component props
 */
interface GlobalSearchProps {
    currentUser: User;
    placeholder?: string;
    onSearch?: (query: string, filters: SearchFilter) => Promise<SearchResult[]>;
    onResultClick?: (result: SearchResult) => void;
    showFilters?: boolean;
    showRecentSearches?: boolean;
    maxResults?: number;
    className?: string;
    'data-testid'?: string;
}
/**
 * SchoolApex Global Search component
 *
 * Comprehensive search interface with filters, recent searches, and result categorization.
 * Provides intelligent search across all Canvas content types.
 *
 * @example
 * ```tsx
 * <GlobalSearch
 *   currentUser={currentUser}
 *   onSearch={handleSearch}
 *   onResultClick={handleResultClick}
 *   showFilters={true}
 * />
 * ```
 */
export declare const GlobalSearch: React.NamedExoticComponent<GlobalSearchProps>;
export {};
//# sourceMappingURL=GlobalSearch.d.ts.map