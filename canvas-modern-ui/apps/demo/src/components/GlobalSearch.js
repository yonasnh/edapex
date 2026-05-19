import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo, useState, useCallback, useMemo } from 'react';
import { Search, Tag, Button, Modal, Checkbox, DatePicker, DatePickerInput } from '@carbon/react';
import { Search as SearchIcon, Filter, Course, Task as Assignment, Chat, Folder, Calendar, Group } from '@carbon/icons-react';
import clsx from 'clsx';
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
export const GlobalSearch = memo(({ currentUser, placeholder = "Search courses, assignments, discussions...", onSearch, onResultClick, showFilters = true, showRecentSearches = true, maxResults = 50, className, 'data-testid': testId, }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [recentSearches, setRecentSearches] = useState([
        'React components',
        'Assignment 1',
        'Discussion forum',
        'Course materials'
    ]);
    const [filters, setFilters] = useState({
        types: [],
        courses: [],
        includeArchived: false,
    });
    const searchTypes = [
        { id: 'course', label: 'Courses', icon: Course },
        { id: 'assignment', label: 'Assignments', icon: Assignment },
        { id: 'discussion', label: 'Discussions', icon: Chat },
        { id: 'file', label: 'Files', icon: Folder },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'user', label: 'People', icon: Group },
    ];
    const handleSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim() || !onSearch)
            return;
        setIsSearching(true);
        try {
            const searchResults = await onSearch(searchQuery, filters);
            setResults(searchResults.slice(0, maxResults));
            // Add to recent searches
            if (showRecentSearches) {
                setRecentSearches(prev => {
                    const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)];
                    return updated.slice(0, 5); // Keep only 5 recent searches
                });
            }
        }
        catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        }
        finally {
            setIsSearching(false);
        }
    }, [onSearch, filters, maxResults, showRecentSearches]);
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.length >= 2) {
            handleSearch(value);
        }
        else {
            setResults([]);
        }
    };
    const handleResultClick = (result) => {
        if (onResultClick) {
            onResultClick(result);
        }
        else {
            window.open(result.url, '_blank');
        }
        setQuery('');
        setResults([]);
    };
    const handleRecentSearchClick = (recentQuery) => {
        setQuery(recentQuery);
        handleSearch(recentQuery);
    };
    const handleFilterChange = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        if (query.trim()) {
            handleSearch(query);
        }
    };
    const getResultIcon = (type) => {
        const searchType = searchTypes.find(t => t.id === type);
        return searchType ? searchType.icon : SearchIcon;
    };
    const groupedResults = useMemo(() => {
        return results.reduce((groups, result) => {
            const type = result.type;
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(result);
            return groups;
        }, {});
    }, [results]);
    const activeFiltersCount = filters.types.length + filters.courses.length +
        (filters.dateRange?.start || filters.dateRange?.end ? 1 : 0) +
        (filters.includeArchived ? 1 : 0);
    return (_jsxs("div", { className: clsx('global-search', className), "data-testid": testId, children: [_jsxs("div", { className: "global-search__input-container", children: [_jsx(Search, { labelText: "Global search", placeholder: placeholder, value: query, onChange: handleInputChange, size: "lg", className: "global-search__input" }), showFilters && (_jsx(Button, { kind: "ghost", size: "lg", renderIcon: Filter, iconDescription: "Search filters", onClick: () => setShowFilterModal(true), className: clsx('global-search__filter-button', {
                            'global-search__filter-button--active': activeFiltersCount > 0
                        }), "aria-label": "Search filters", children: activeFiltersCount > 0 && (_jsx("span", { className: "global-search__filter-count", children: activeFiltersCount })) }))] }), activeFiltersCount > 0 && (_jsxs("div", { className: "global-search__active-filters", children: [filters.types.map(type => (_jsx(Tag, { type: "blue", size: "sm", filter: true, onClose: () => handleFilterChange({
                            types: filters.types.filter(t => t !== type)
                        }), children: searchTypes.find(t => t.id === type)?.label || type }, type))), filters.courses.map(course => (_jsx(Tag, { type: "purple", size: "sm", filter: true, onClose: () => handleFilterChange({
                            courses: filters.courses.filter(c => c !== course)
                        }), children: course }, course))), (filters.dateRange?.start || filters.dateRange?.end) && (_jsx(Tag, { type: "green", size: "sm", filter: true, onClose: () => handleFilterChange({
                            dateRange: undefined
                        }), children: "Date Range" })), filters.includeArchived && (_jsx(Tag, { type: "warm-gray", size: "sm", filter: true, onClose: () => handleFilterChange({
                            includeArchived: false
                        }), children: "Include Archived" }))] })), (results.length > 0 || isSearching) && (_jsx("div", { className: "global-search__results", children: isSearching ? (_jsx("div", { className: "global-search__loading", children: "Searching..." })) : (_jsx(_Fragment, { children: Object.entries(groupedResults).map(([type, typeResults]) => {
                        const searchType = searchTypes.find(t => t.id === type);
                        const Icon = searchType?.icon || SearchIcon;
                        return (_jsxs("div", { className: "global-search__result-group", children: [_jsxs("div", { className: "global-search__result-group-header", children: [_jsx(Icon, { size: 16 }), _jsxs("span", { className: "global-search__result-group-title", children: [searchType?.label || type, " (", typeResults.length, ")"] })] }), _jsx("div", { className: "global-search__result-list", children: typeResults.map(result => (_jsx("div", { className: "global-search__result-item", onClick: () => handleResultClick(result), role: "button", tabIndex: 0, onKeyDown: (e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleResultClick(result);
                                            }
                                        }, children: _jsxs("div", { className: "global-search__result-content", children: [_jsx("h4", { className: "global-search__result-title", children: result.title }), result.description && (_jsx("p", { className: "global-search__result-description", children: result.description })), _jsxs("div", { className: "global-search__result-meta", children: [result.course && (_jsx("span", { className: "global-search__result-course", children: result.course })), result.date && (_jsx("span", { className: "global-search__result-date", children: result.date.toLocaleDateString() }))] })] }) }, result.id))) })] }, type));
                    }) })) })), showRecentSearches && !query && recentSearches.length > 0 && (_jsxs("div", { className: "global-search__recent", children: [_jsx("h4", { className: "global-search__recent-title", children: "Recent Searches" }), _jsx("div", { className: "global-search__recent-list", children: recentSearches.map((recentQuery, index) => (_jsxs("button", { className: "global-search__recent-item", onClick: () => handleRecentSearchClick(recentQuery), children: [_jsx(SearchIcon, { size: 16 }), _jsx("span", { children: recentQuery })] }, index))) })] })), _jsx(Modal, { open: showFilterModal, onRequestClose: () => setShowFilterModal(false), modalHeading: "Search Filters", primaryButtonText: "Apply Filters", secondaryButtonText: "Clear All", onRequestSubmit: () => setShowFilterModal(false), onSecondarySubmit: () => {
                    handleFilterChange({
                        types: [],
                        courses: [],
                        dateRange: undefined,
                        includeArchived: false,
                    });
                    setShowFilterModal(false);
                }, children: _jsxs("div", { className: "global-search__filter-content", children: [_jsxs("div", { className: "global-search__filter-section", children: [_jsx("h5", { children: "Content Types" }), searchTypes.map(type => (_jsx(Checkbox, { id: `filter-type-${type.id}`, labelText: type.label, checked: filters.types.includes(type.id), onChange: (checked) => {
                                        const newTypes = checked
                                            ? [...filters.types, type.id]
                                            : filters.types.filter(t => t !== type.id);
                                        handleFilterChange({ types: newTypes });
                                    } }, type.id)))] }), _jsxs("div", { className: "global-search__filter-section", children: [_jsx("h5", { children: "Date Range" }), _jsxs(DatePicker, { datePickerType: "range", children: [_jsx(DatePickerInput, { id: "date-picker-start", placeholder: "mm/dd/yyyy", labelText: "Start date", size: "md" }), _jsx(DatePickerInput, { id: "date-picker-end", placeholder: "mm/dd/yyyy", labelText: "End date", size: "md" })] })] }), _jsx("div", { className: "global-search__filter-section", children: _jsx(Checkbox, { id: "include-archived", labelText: "Include archived content", checked: filters.includeArchived, onChange: (evt, { checked }) => handleFilterChange({ includeArchived: checked }) }) })] }) }), _jsxs("div", { className: "sr-only", children: ["Global search interface.", query && ` Current search: ${query}.`, results.length > 0 && ` ${results.length} results found.`, activeFiltersCount > 0 && ` ${activeFiltersCount} filters active.`] })] }));
});
GlobalSearch.displayName = 'GlobalSearch';
//# sourceMappingURL=GlobalSearch.js.map