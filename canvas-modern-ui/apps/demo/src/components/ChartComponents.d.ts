import React from 'react';
/**
 * Chart data interface
 */
interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
        fill?: boolean;
    }>;
}
/**
 * Line Chart Component
 */
interface LineChartProps {
    data: ChartData;
    title: string;
    height?: number;
    showArea?: boolean;
}
export declare const LineChart: React.NamedExoticComponent<LineChartProps>;
/**
 * Bar Chart Component
 */
interface BarChartProps {
    data: ChartData;
    title: string;
    height?: number;
    horizontal?: boolean;
}
export declare const BarChart: React.NamedExoticComponent<BarChartProps>;
/**
 * Pie Chart Component
 */
interface PieChartProps {
    data: ChartData;
    title: string;
    height?: number;
}
export declare const PieChart: React.NamedExoticComponent<PieChartProps>;
/**
 * Chart type union for dynamic rendering
 */
export type ChartType = 'line' | 'bar' | 'pie';
/**
 * Dynamic Chart Component
 */
interface DynamicChartProps {
    type: ChartType;
    data: ChartData;
    title: string;
    height?: number;
    showArea?: boolean;
    horizontal?: boolean;
}
export declare const DynamicChart: React.NamedExoticComponent<DynamicChartProps>;
export {};
//# sourceMappingURL=ChartComponents.d.ts.map