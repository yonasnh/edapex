import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Select, SelectItem, DatePicker, DatePickerInput, Button, Tile } from '@carbon/react';
import { Analytics, Download, Filter, User, Course } from '@carbon/icons-react';
import { DynamicChart } from './ChartComponents';
import clsx from 'clsx';
/**
 * Analytics Dashboard Component
 *
 * Comprehensive analytics dashboard with metrics, charts, and filtering capabilities.
 * Provides insights into student engagement, performance, and course activity.
 */
export const AnalyticsDashboard = memo(({ metrics, chartData, filters, onFiltersChange, onExport, courses = [], users = [], className, 'data-testid': testId, }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    /**
     * Format metric value based on type
     */
    const formatMetricValue = (metric) => {
        switch (metric.format) {
            case 'percentage':
                return `${metric.value.toFixed(1)}%`;
            case 'duration':
                const hours = Math.floor(metric.value / 60);
                const minutes = metric.value % 60;
                return `${hours}h ${minutes}m`;
            case 'currency':
                return `$${metric.value.toLocaleString()}`;
            default:
                return metric.value.toLocaleString();
        }
    };
    /**
     * Format change indicator
     */
    const formatChange = (metric) => {
        const sign = metric.change > 0 ? '+' : '';
        return `${sign}${metric.change.toFixed(1)}%`;
    };
    /**
     * Handle filter changes
     */
    const handleFilterChange = (key, value) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };
    /**
     * Render metric card
     */
    const renderMetricCard = (metric) => (_jsxs(Tile, { className: "analytics-metric", children: [_jsx("div", { className: "analytics-metric__header", children: _jsx("span", { className: "analytics-metric__label", children: metric.label }) }), _jsx("div", { className: "analytics-metric__value", children: formatMetricValue(metric) }), _jsxs("div", { className: clsx('analytics-metric__change', `analytics-metric__change--${metric.changeType}`), children: [formatChange(metric), " from last period"] })] }, metric.id));
    /**
     * Render real chart using Chart.js
     */
    const renderChart = (data, type = 'line', title = '') => (_jsx("div", { className: "analytics-chart", children: _jsx(DynamicChart, { type: type, data: data, title: title, height: 300, showArea: type === 'line' }) }));
    return (_jsxs("div", { className: clsx('analytics-dashboard', className), "data-testid": testId, children: [_jsxs("div", { className: "analytics-dashboard__header", children: [_jsxs("div", { className: "analytics-dashboard__title", children: [_jsx(Analytics, { size: 24 }), _jsx("h2", { children: "Analytics Dashboard" })] }), _jsxs("div", { className: "analytics-dashboard__actions", children: [_jsx(Button, { kind: "ghost", size: "sm", renderIcon: Filter, onClick: () => setShowFilters(!showFilters), children: "Filters" }), _jsx(Button, { kind: "secondary", size: "sm", renderIcon: Download, onClick: () => onExport('csv'), children: "Export" })] })] }), showFilters && (_jsx("div", { className: "analytics-dashboard__filters", children: _jsxs("div", { className: "analytics-filters", children: [_jsx("div", { className: "analytics-filters__group", children: _jsxs(DatePicker, { datePickerType: "range", children: [_jsx(DatePickerInput, { id: "date-picker-start", placeholder: "mm/dd/yyyy", labelText: "Start date", size: "sm" }), _jsx(DatePickerInput, { id: "date-picker-end", placeholder: "mm/dd/yyyy", labelText: "End date", size: "sm" })] }) }), courses.length > 0 && (_jsx("div", { className: "analytics-filters__group", children: _jsxs(Select, { id: "course-filter", labelText: "Course", value: filters.courseId || '', onChange: (e) => handleFilterChange('courseId', e.target.value || undefined), size: "sm", children: [_jsx(SelectItem, { value: "", text: "All Courses" }), courses.map(course => (_jsx(SelectItem, { value: course.id, text: course.name }, course.id)))] }) })), users.length > 0 && (_jsx("div", { className: "analytics-filters__group", children: _jsxs(Select, { id: "user-filter", labelText: "User", value: filters.userId || '', onChange: (e) => handleFilterChange('userId', e.target.value || undefined), size: "sm", children: [_jsx(SelectItem, { value: "", text: "All Users" }), users.map(user => (_jsx(SelectItem, { value: user.id, text: user.name }, user.id)))] }) })), _jsx("div", { className: "analytics-filters__group", children: _jsxs(Select, { id: "assignment-type-filter", labelText: "Assignment Type", value: filters.assignmentType || '', onChange: (e) => handleFilterChange('assignmentType', e.target.value || undefined), size: "sm", children: [_jsx(SelectItem, { value: "", text: "All Types" }), _jsx(SelectItem, { value: "assignment", text: "Assignments" }), _jsx(SelectItem, { value: "quiz", text: "Quizzes" }), _jsx(SelectItem, { value: "discussion", text: "Discussions" }), _jsx(SelectItem, { value: "project", text: "Projects" })] }) })] }) })), _jsx("div", { className: "analytics-dashboard__metrics", children: _jsx("div", { className: "analytics-metrics-grid", children: metrics.map(renderMetricCard) }) }), _jsx("div", { className: "analytics-dashboard__content", children: _jsxs(Tabs, { selectedIndex: activeTab, onChange: (evt) => setActiveTab(evt.selectedIndex), children: [_jsxs(TabList, { "aria-label": "Analytics tabs", children: [_jsx(Tab, { children: "Engagement" }), _jsx(Tab, { children: "Performance" }), _jsx(Tab, { children: "Activity" }), _jsx(Tab, { children: "Grades" })] }), _jsxs(TabPanels, { children: [_jsx(TabPanel, { children: _jsx("div", { className: "analytics-tab-content", children: _jsxs("div", { className: "analytics-section", children: [_jsx("h3", { children: "Student Engagement Overview" }), _jsx("p", { children: "Track how students interact with course content and participate in activities." }), _jsxs("div", { className: "analytics-charts-grid", children: [_jsx("div", { className: "analytics-chart-container", children: renderChart(chartData.engagement, 'line', 'Daily Active Users') }), _jsx("div", { className: "analytics-chart-container", children: renderChart(chartData.engagement, 'bar', 'Content Interaction') })] })] }) }) }), _jsx(TabPanel, { children: _jsx("div", { className: "analytics-tab-content", children: _jsxs("div", { className: "analytics-section", children: [_jsx("h3", { children: "Academic Performance" }), _jsx("p", { children: "Analyze student performance trends and identify areas for improvement." }), _jsxs("div", { className: "analytics-charts-grid", children: [_jsx("div", { className: "analytics-chart-container", children: renderChart(chartData.performance, 'bar', 'Grade Distribution') }), _jsx("div", { className: "analytics-chart-container", children: renderChart(chartData.performance, 'line', 'Performance Trends') })] })] }) }) }), _jsx(TabPanel, { children: _jsx("div", { className: "analytics-tab-content", children: _jsxs("div", { className: "analytics-section", children: [_jsx("h3", { children: "Course Activity" }), _jsx("p", { children: "Monitor course activity patterns and peak usage times." }), _jsxs("div", { className: "analytics-charts-grid", children: [_jsx("div", { className: "analytics-chart-container", children: renderChart(chartData.activity, 'line', 'Activity Timeline') }), _jsx("div", { className: "analytics-chart-container", children: renderChart(chartData.activity, 'pie', 'Activity by Type') })] })] }) }) }), _jsx(TabPanel, { children: _jsx("div", { className: "analytics-tab-content", children: _jsxs("div", { className: "analytics-section", children: [_jsx("h3", { children: "Grade Analytics" }), _jsx("p", { children: "Detailed analysis of grading patterns and student achievement." }), _jsxs("div", { className: "analytics-charts-grid", children: [_jsx("div", { className: "analytics-chart-container", children: renderChart(chartData.grades, 'line', 'Grade Trends') }), _jsx("div", { className: "analytics-chart-container", children: renderChart(chartData.grades, 'bar', 'Assignment Performance') })] })] }) }) })] })] }) }), _jsx("div", { className: "analytics-dashboard__insights", children: _jsxs("div", { className: "analytics-insights", children: [_jsx("h3", { children: "Key Insights" }), _jsxs("div", { className: "analytics-insights__list", children: [_jsxs("div", { className: "analytics-insight", children: [_jsx("div", { className: "analytics-insight__icon", children: _jsx(User, { size: 20 }) }), _jsxs("div", { className: "analytics-insight__content", children: [_jsx("h4", { children: "Student Engagement" }), _jsx("p", { children: "Engagement has increased by 15% this week. Consider maintaining current strategies." })] })] }), _jsxs("div", { className: "analytics-insight", children: [_jsx("div", { className: "analytics-insight__icon", children: _jsx(User, { size: 20 }) }), _jsxs("div", { className: "analytics-insight__content", children: [_jsx("h4", { children: "Assignment Performance" }), _jsx("p", { children: "3 students may need additional support based on recent assignment scores." })] })] }), _jsxs("div", { className: "analytics-insight", children: [_jsx("div", { className: "analytics-insight__icon", children: _jsx(Course, { size: 20 }) }), _jsxs("div", { className: "analytics-insight__content", children: [_jsx("h4", { children: "Course Activity" }), _jsx("p", { children: "Peak activity occurs between 2-4 PM. Consider scheduling important content during this time." })] })] })] })] }) })] }));
});
AnalyticsDashboard.displayName = 'AnalyticsDashboard';
//# sourceMappingURL=AnalyticsDashboard.js.map