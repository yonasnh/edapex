import React from 'react';
/**
 * Analytics data interfaces
 */
interface AnalyticsMetric {
    id: string;
    label: string;
    value: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    format: 'number' | 'percentage' | 'duration' | 'currency';
}
interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
    }>;
}
interface AnalyticsFilter {
    dateRange: {
        start: Date;
        end: Date;
    };
    courseId?: string;
    userId?: string;
    assignmentType?: string;
}
/**
 * Analytics Dashboard props
 */
interface AnalyticsDashboardProps {
    metrics: AnalyticsMetric[];
    chartData: {
        engagement: ChartData;
        performance: ChartData;
        activity: ChartData;
        grades: ChartData;
    };
    filters: AnalyticsFilter;
    onFiltersChange: (filters: AnalyticsFilter) => void;
    onExport: (format: 'csv' | 'pdf' | 'xlsx') => void;
    courses?: Array<{
        id: string;
        name: string;
    }>;
    users?: Array<{
        id: string;
        name: string;
    }>;
    className?: string;
    'data-testid'?: string;
}
/**
 * Analytics Dashboard Component
 *
 * Comprehensive analytics dashboard with metrics, charts, and filtering capabilities.
 * Provides insights into student engagement, performance, and course activity.
 */
export declare const AnalyticsDashboard: React.NamedExoticComponent<AnalyticsDashboardProps>;
export {};
//# sourceMappingURL=AnalyticsDashboard.d.ts.map