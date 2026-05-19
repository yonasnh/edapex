import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);
/**
 * Common chart options for SchoolApex theme
 */
const getCommonOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#f4f4f4',
                font: {
                    family: 'IBM Plex Sans',
                },
            },
        },
        title: {
            display: true,
            text: title,
            color: '#f4f4f4',
            font: {
                family: 'IBM Plex Sans',
                size: 16,
                weight: 'bold',
            },
        },
        tooltip: {
            backgroundColor: '#262626',
            titleColor: '#f4f4f4',
            bodyColor: '#c6c6c6',
            borderColor: '#393939',
            borderWidth: 1,
        },
    },
    scales: {
        x: {
            ticks: {
                color: '#c6c6c6',
                font: {
                    family: 'IBM Plex Sans',
                },
            },
            grid: {
                color: '#393939',
            },
        },
        y: {
            ticks: {
                color: '#c6c6c6',
                font: {
                    family: 'IBM Plex Sans',
                },
            },
            grid: {
                color: '#393939',
            },
        },
    },
});
/**
 * SchoolApex color palette
 */
const colors = {
    primary: '#0f62fe',
    secondary: '#24a148',
    tertiary: '#ff832b',
    quaternary: '#8a3ffc',
    error: '#da1e28',
    warning: '#f1c21b',
    info: '#0072c3',
    success: '#24a148',
    gradients: {
        primary: 'linear-gradient(135deg, #0f62fe 0%, #0353e9 100%)',
        secondary: 'linear-gradient(135deg, #24a148 0%, #198038 100%)',
    },
};
export const LineChart = memo(({ data, title, height = 300, showArea = false }) => {
    const chartData = {
        ...data,
        datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            borderColor: dataset.borderColor || colors.primary,
            backgroundColor: showArea
                ? (dataset.backgroundColor || `${colors.primary}20`)
                : (dataset.backgroundColor || colors.primary),
            borderWidth: dataset.borderWidth || 2,
            fill: showArea,
            tension: 0.4,
        })),
    };
    const options = {
        ...getCommonOptions(title),
        elements: {
            point: {
                radius: 4,
                hoverRadius: 6,
            },
        },
    };
    return (_jsx("div", { style: { height }, children: _jsx(Line, { data: chartData, options: options }) }));
});
LineChart.displayName = 'LineChart';
export const BarChart = memo(({ data, title, height = 300, horizontal = false }) => {
    const chartData = {
        ...data,
        datasets: data.datasets.map((dataset, index) => {
            const colorIndex = index % Object.keys(colors).length;
            const colorKeys = Object.keys(colors);
            const color = colors[colorKeys[colorIndex]];
            return {
                ...dataset,
                backgroundColor: dataset.backgroundColor || color,
                borderColor: dataset.borderColor || color,
                borderWidth: dataset.borderWidth || 1,
            };
        }),
    };
    const options = {
        ...getCommonOptions(title),
        indexAxis: horizontal ? 'y' : 'x',
        scales: horizontal ? {
            x: {
                ticks: {
                    color: '#c6c6c6',
                    font: {
                        family: 'IBM Plex Sans',
                    },
                },
                grid: {
                    color: '#393939',
                },
            },
            y: {
                ticks: {
                    color: '#c6c6c6',
                    font: {
                        family: 'IBM Plex Sans',
                    },
                },
                grid: {
                    color: '#393939',
                },
            },
        } : getCommonOptions(title).scales,
    };
    return (_jsx("div", { style: { height }, children: _jsx(Bar, { data: chartData, options: options }) }));
});
BarChart.displayName = 'BarChart';
export const PieChart = memo(({ data, title, height = 300 }) => {
    const chartData = {
        ...data,
        datasets: data.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor || [
                colors.primary,
                colors.secondary,
                colors.tertiary,
                colors.quaternary,
                colors.warning,
                colors.info,
            ],
            borderColor: '#262626',
            borderWidth: 2,
        })),
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#f4f4f4',
                    font: {
                        family: 'IBM Plex Sans',
                    },
                    padding: 20,
                },
            },
            title: {
                display: true,
                text: title,
                color: '#f4f4f4',
                font: {
                    family: 'IBM Plex Sans',
                    size: 16,
                    weight: 'bold',
                },
            },
            tooltip: {
                backgroundColor: '#262626',
                titleColor: '#f4f4f4',
                bodyColor: '#c6c6c6',
                borderColor: '#393939',
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };
    return (_jsx("div", { style: { height }, children: _jsx(Pie, { data: chartData, options: options }) }));
});
PieChart.displayName = 'PieChart';
export const DynamicChart = memo(({ type, data, title, height = 300, showArea = false, horizontal = false }) => {
    switch (type) {
        case 'line':
            return _jsx(LineChart, { data: data, title: title, height: height, showArea: showArea });
        case 'bar':
            return _jsx(BarChart, { data: data, title: title, height: height, horizontal: horizontal });
        case 'pie':
            return _jsx(PieChart, { data: data, title: title, height: height });
        default:
            return _jsx(LineChart, { data: data, title: title, height: height });
    }
});
DynamicChart.displayName = 'DynamicChart';
//# sourceMappingURL=ChartComponents.js.map