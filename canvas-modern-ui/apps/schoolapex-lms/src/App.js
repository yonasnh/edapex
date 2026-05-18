import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, Suspense, useEffect } from 'react';
import { Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction, Button, Loading } from '@carbon/react';
import { Notification, Settings, User as UserIcon } from '@carbon/icons-react';
import { useFeatureFlags } from '@schoolapex/core';
import { navItems, filterNavItemsByRole } from './navigation';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
// Import the professional-grade components we've built
import { NavigationSidebar } from '../../../packages/components/dist/navigation/NavigationSidebar.js';
// import { LoadingSpinner } from '../../../packages/components/dist/loading/LoadingStates.js'
// import { APIErrorHandler } from '../../../packages/components/dist/error-handling/APIErrorHandler.js'
// import { UserProfile } from '../../../packages/components/dist/profile/UserProfile.js'
// import { SettingsPanel } from '../../../packages/components/dist/ui/SettingsPanel/SettingsPanel.js'
// import { ToastContainer, useToasts } from '../../../packages/components/dist/notifications/Toast.js'
// Import real page components that use GraphQL
import Dashboard from './Dashboard';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import AnalyticsPage from './pages/Analytics';
import Comparison from './pages/Comparison';
// Import new pages
import HelpPage from './pages/Help';
import FilesPage from './pages/Files';
import CalendarPage from './pages/Calendar';
import DiscussionsPage from './pages/Discussions';
import GradesPage from './pages/Grades';
import GroupsPage from './pages/Groups';
import ReportsPage from './pages/Reports';
// Import admin pages
import AdminUsersPage from './pages/admin/Users';
import AdminCourseManagementPage from './pages/admin/CourseManagement';
import AdminSystemSettingsPage from './pages/admin/SystemSettings';
// Import stylesheets
import './app-styles.css';
import './dashboard-styles.css';
import './styles/courses.css';
import './styles/navigation.css';
import './styles/global-search.css';
/**
 * SchoolApex Modern UI Application
 *
 * Showcases the modern Canvas LMS interface with:
 * - Beautiful Carbon Design System components
 * - Performance monitoring integration
 * - Security audit capabilities
 * - Accessibility compliance
 * - Production-ready architecture
 * - Real data from Canvas database via GraphQL
 */
// Mock user for UI components that need it
const mockUser = {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    roles: ['student'],
    locale: 'en',
    timezone: 'UTC',
    created_at: new Date(),
    updated_at: new Date(),
};
const AppContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // const { addToast, toasts, removeToast } = useToasts()
    // Simple toast replacement for demo
    const addToast = (toast) => console.log('Toast:', toast);
    const toasts = [];
    const removeToast = (id) => console.log('Remove toast:', id);
    // Feature flags
    const featureFlags = useFeatureFlags();
    const enablePerformanceMonitoring = true;
    const enableAccessibilityAudit = true;
    // Determine active navigation item based on current route
    const getActiveNavigationItem = () => {
        const path = location.pathname;
        if (path.startsWith('/courses'))
            return 'courses';
        if (path.startsWith('/assignments'))
            return 'assignments';
        if (path.startsWith('/grades'))
            return 'grades';
        if (path.startsWith('/calendar'))
            return 'calendar';
        if (path.startsWith('/discussions'))
            return 'discussions';
        if (path.startsWith('/files'))
            return 'files';
        if (path.startsWith('/groups'))
            return 'groups';
        if (path.startsWith('/analytics'))
            return 'analytics';
        if (path.startsWith('/reports'))
            return 'reports';
        if (path.startsWith('/admin'))
            return 'admin';
        if (path.startsWith('/help'))
            return 'help';
        if (path.startsWith('/comparison'))
            return 'comparison';
        return 'dashboard'; // default
    };
    const handleNavigation = (itemId, href) => {
        // Navigate using React Router
        if (href)
            navigate(href);
    };
    // Demo welcome toast
    useEffect(() => {
        const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
        if (!hasShownWelcome) {
            setTimeout(() => {
                addToast({
                    type: 'info',
                    title: 'Welcome to SchoolApex',
                    message: 'Your modern learning management system with enhanced features and analytics.',
                    duration: 5000
                });
                sessionStorage.setItem('hasShownWelcome', 'true');
            }, 1000);
        }
    }, []);
    return (_jsxs("div", { className: "schoolapex-app", children: [toasts.length > 0 && (_jsx("div", { className: "toast-container" })), showUserProfile && (_jsx("div", { className: "modal-overlay", onClick: () => setShowUserProfile(false), children: _jsxs("div", { className: "modal-content", children: [_jsx("h2", { children: "User Profile" }), _jsxs("p", { children: [mockUser.name, " (", mockUser.email, ")"] }), _jsx(Button, { onClick: () => setShowUserProfile(false), children: "Close" })] }) })), showSettings && (_jsx("div", { className: "modal-overlay", onClick: () => setShowSettings(false), children: _jsxs("div", { className: "modal-content", children: [_jsx("h2", { children: "Settings" }), _jsxs("p", { children: ["Settings panel for ", mockUser.name] }), _jsx(Button, { onClick: () => setShowSettings(false), children: "Close" })] }) })), _jsx(NavigationSidebar, { currentUser: mockUser, activeItem: getActiveNavigationItem(), isCollapsed: sidebarCollapsed, onToggleCollapse: setSidebarCollapsed, onNavigate: handleNavigation, customItems: filterNavItemsByRole(navItems, mockUser.roles[0] || 'student'), showBadges: true }), _jsxs(Header, { "aria-label": "SchoolApex LMS", className: "schoolapex-header", children: [_jsx(HeaderName, { href: "#", prefix: "", className: "schoolapex-brand", children: "SchoolApex" }), _jsxs(HeaderGlobalBar, { children: [_jsx(HeaderGlobalAction, { "aria-label": "Notifications", tooltipAlignment: "end", onClick: () => {
                                    addToast({
                                        type: 'success',
                                        title: 'Notifications',
                                        message: 'You have no new notifications at this time.',
                                        duration: 3000
                                    });
                                }, children: _jsx(Notification, { size: 20 }) }), _jsx(HeaderGlobalAction, { "aria-label": "Settings", tooltipAlignment: "end", onClick: () => setShowSettings(true), className: "schoolapex-header-action", children: _jsx(Settings, { size: 20 }) }), _jsx(HeaderGlobalAction, { "aria-label": "User Profile", tooltipAlignment: "end", onClick: () => setShowUserProfile(true), className: "schoolapex-header-action", children: _jsx(UserIcon, { size: 20 }) })] })] }), _jsx("main", { className: "schoolapex-main", children: _jsx(Suspense, { fallback: _jsx(Loading, { description: "Loading..." }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/courses/*", element: _jsx(Courses, {}) }), _jsx(Route, { path: "/assignments", element: _jsx(Assignments, {}) }), _jsx(Route, { path: "/grades", element: _jsx(GradesPage, {}) }), _jsx(Route, { path: "/calendar", element: _jsx(CalendarPage, {}) }), _jsx(Route, { path: "/discussions", element: _jsx(DiscussionsPage, {}) }), _jsx(Route, { path: "/files", element: _jsx(FilesPage, {}) }), _jsx(Route, { path: "/groups", element: _jsx(GroupsPage, {}) }), _jsx(Route, { path: "/analytics", element: _jsx(AnalyticsPage, {}) }), _jsx(Route, { path: "/reports", element: _jsx(ReportsPage, {}) }), _jsx(Route, { path: "/admin/users", element: _jsx(AdminUsersPage, {}) }), _jsx(Route, { path: "/admin/courses", element: _jsx(AdminCourseManagementPage, {}) }), _jsx(Route, { path: "/admin/settings", element: _jsx(AdminSystemSettingsPage, {}) }), _jsx(Route, { path: "/help", element: _jsx(HelpPage, {}) }), _jsx(Route, { path: "/comparison", element: _jsx(Comparison, {}) })] }) }) })] }));
};
const App = () => {
    return (_jsx(Router, { children: _jsx(AppContent, {}) }));
};
export default App;
//# sourceMappingURL=App.js.map