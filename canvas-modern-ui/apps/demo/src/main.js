import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeatureFlagProvider, AuthProvider } from '@schoolapex/core';
import App from './App';
import './index.css';
// Initialize performance monitoring
if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false') {
    // Performance monitoring is automatically initialized when imported
    console.log('🚀 SchoolApex Performance Monitoring initialized');
}
// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
        },
    },
});
// Enable all SchoolApex features for demo
const demoFeatureFlags = {
    carbon_components: true,
    carbon_theme: true,
    modern_dashboard: true,
    modern_course_list: true,
    enhanced_a11y: true,
    virtual_scrolling: true,
    lazy_loading: true,
    debug_mode: true,
};
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(FeatureFlagProvider, { flags: demoFeatureFlags, children: _jsx(AuthProvider, { children: _jsx(App, {}) }) }) }) }));
//# sourceMappingURL=main.js.map