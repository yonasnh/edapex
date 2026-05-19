import React, { memo, useState, useMemo } from 'react'
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  SelectItem,
  DatePicker,
  DatePickerInput,
  Button,
  Tile
} from '@carbon/react'
import {
  Analytics,
  ChartLine,
  ChartBar,
  ChartPie,
  Download,
  Filter,
  Calendar,
  User,
  Course
} from '@carbon/icons-react'
import { LineChart, BarChart, PieChart, DynamicChart } from './ChartComponents'
import clsx from 'clsx'

/**
 * Analytics data interfaces
 */
interface AnalyticsMetric {
  id: string
  label: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  format: 'number' | 'percentage' | 'duration' | 'currency'
}

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }>
}

interface AnalyticsFilter {
  dateRange: {
    start: Date
    end: Date
  }
  courseId?: string
  userId?: string
  assignmentType?: string
}

/**
 * Analytics Dashboard props
 */
interface AnalyticsDashboardProps {
  metrics: AnalyticsMetric[]
  chartData: {
    engagement: ChartData
    performance: ChartData
    activity: ChartData
    grades: ChartData
  }
  filters: AnalyticsFilter
  onFiltersChange: (filters: AnalyticsFilter) => void
  onExport: (format: 'csv' | 'pdf' | 'xlsx') => void
  courses?: Array<{ id: string; name: string }>
  users?: Array<{ id: string; name: string }>
  className?: string
  'data-testid'?: string
}

/**
 * Analytics Dashboard Component
 * 
 * Comprehensive analytics dashboard with metrics, charts, and filtering capabilities.
 * Provides insights into student engagement, performance, and course activity.
 */
export const AnalyticsDashboard = memo<AnalyticsDashboardProps>(
  ({
    metrics,
    chartData,
    filters,
    onFiltersChange,
    onExport,
    courses = [],
    users = [],
    className,
    'data-testid': testId,
  }) => {
    const [activeTab, setActiveTab] = useState(0)
    const [showFilters, setShowFilters] = useState(false)

    /**
     * Format metric value based on type
     */
    const formatMetricValue = (metric: AnalyticsMetric): string => {
      switch (metric.format) {
        case 'percentage':
          return `${metric.value.toFixed(1)}%`
        case 'duration':
          const hours = Math.floor(metric.value / 60)
          const minutes = metric.value % 60
          return `${hours}h ${minutes}m`
        case 'currency':
          return `$${metric.value.toLocaleString()}`
        default:
          return metric.value.toLocaleString()
      }
    }

    /**
     * Format change indicator
     */
    const formatChange = (metric: AnalyticsMetric): string => {
      const sign = metric.change > 0 ? '+' : ''
      return `${sign}${metric.change.toFixed(1)}%`
    }

    /**
     * Handle filter changes
     */
    const handleFilterChange = (key: keyof AnalyticsFilter, value: any) => {
      onFiltersChange({
        ...filters,
        [key]: value,
      })
    }

    /**
     * Render metric card
     */
    const renderMetricCard = (metric: AnalyticsMetric) => (
      <Tile key={metric.id} className="analytics-metric">
        <div className="analytics-metric__header">
          <span className="analytics-metric__label">{metric.label}</span>
        </div>
        
        <div className="analytics-metric__value">
          {formatMetricValue(metric)}
        </div>
        
        <div className={clsx('analytics-metric__change', `analytics-metric__change--${metric.changeType}`)}>
          {formatChange(metric)} from last period
        </div>
      </Tile>
    )

    /**
     * Render real chart using Chart.js
     */
    const renderChart = (data: ChartData, type: 'line' | 'bar' | 'pie' = 'line', title: string = '') => (
      <div className="analytics-chart">
        <DynamicChart
          type={type}
          data={data}
          title={title}
          height={300}
          showArea={type === 'line'}
        />
      </div>
    )

    return (
      <div
        className={clsx('analytics-dashboard', className)}
        data-testid={testId}
      >
        {/* Dashboard Header */}
        <div className="analytics-dashboard__header">
          <div className="analytics-dashboard__title">
            <Analytics size={24} />
            <h2>Analytics Dashboard</h2>
          </div>
          
          <div className="analytics-dashboard__actions">
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            
            <Button
              kind="secondary"
              size="sm"
              renderIcon={Download}
              onClick={() => onExport('csv')}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="analytics-dashboard__filters">
            <div className="analytics-filters">
              <div className="analytics-filters__group">
                <DatePicker datePickerType="range">
                  <DatePickerInput
                    id="date-picker-start"
                    placeholder="mm/dd/yyyy"
                    labelText="Start date"
                    size="sm"
                  />
                  <DatePickerInput
                    id="date-picker-end"
                    placeholder="mm/dd/yyyy"
                    labelText="End date"
                    size="sm"
                  />
                </DatePicker>
              </div>

              {courses.length > 0 && (
                <div className="analytics-filters__group">
                  <Select
                    id="course-filter"
                    labelText="Course"
                    value={filters.courseId || ''}
                    onChange={(e) => handleFilterChange('courseId', e.target.value || undefined)}
                    size="sm"
                  >
                    <SelectItem value="" text="All Courses" />
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id} text={course.name} />
                    ))}
                  </Select>
                </div>
              )}

              {users.length > 0 && (
                <div className="analytics-filters__group">
                  <Select
                    id="user-filter"
                    labelText="User"
                    value={filters.userId || ''}
                    onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
                    size="sm"
                  >
                    <SelectItem value="" text="All Users" />
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id} text={user.name} />
                    ))}
                  </Select>
                </div>
              )}

              <div className="analytics-filters__group">
                <Select
                  id="assignment-type-filter"
                  labelText="Assignment Type"
                  value={filters.assignmentType || ''}
                  onChange={(e) => handleFilterChange('assignmentType', e.target.value || undefined)}
                  size="sm"
                >
                  <SelectItem value="" text="All Types" />
                  <SelectItem value="assignment" text="Assignments" />
                  <SelectItem value="quiz" text="Quizzes" />
                  <SelectItem value="discussion" text="Discussions" />
                  <SelectItem value="project" text="Projects" />
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="analytics-dashboard__metrics">
          <div className="analytics-metrics-grid">
            {metrics.map(renderMetricCard)}
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="analytics-dashboard__content">
          <Tabs selectedIndex={activeTab} onChange={(evt) => setActiveTab(evt.selectedIndex)}>
            <TabList aria-label="Analytics tabs">
              <Tab>Engagement</Tab>
              <Tab>Performance</Tab>
              <Tab>Activity</Tab>
              <Tab>Grades</Tab>
            </TabList>
            
            <TabPanels>
              {/* Engagement Tab */}
              <TabPanel>
                <div className="analytics-tab-content">
                  <div className="analytics-section">
                    <h3>Student Engagement Overview</h3>
                    <p>Track how students interact with course content and participate in activities.</p>
                    
                    <div className="analytics-charts-grid">
                      <div className="analytics-chart-container">
                        {renderChart(chartData.engagement, 'line', 'Daily Active Users')}
                      </div>

                      <div className="analytics-chart-container">
                        {renderChart(chartData.engagement, 'bar', 'Content Interaction')}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Performance Tab */}
              <TabPanel>
                <div className="analytics-tab-content">
                  <div className="analytics-section">
                    <h3>Academic Performance</h3>
                    <p>Analyze student performance trends and identify areas for improvement.</p>
                    
                    <div className="analytics-charts-grid">
                      <div className="analytics-chart-container">
                        {renderChart(chartData.performance, 'bar', 'Grade Distribution')}
                      </div>

                      <div className="analytics-chart-container">
                        {renderChart(chartData.performance, 'line', 'Performance Trends')}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Activity Tab */}
              <TabPanel>
                <div className="analytics-tab-content">
                  <div className="analytics-section">
                    <h3>Course Activity</h3>
                    <p>Monitor course activity patterns and peak usage times.</p>
                    
                    <div className="analytics-charts-grid">
                      <div className="analytics-chart-container">
                        {renderChart(chartData.activity, 'line', 'Activity Timeline')}
                      </div>

                      <div className="analytics-chart-container">
                        {renderChart(chartData.activity, 'pie', 'Activity by Type')}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Grades Tab */}
              <TabPanel>
                <div className="analytics-tab-content">
                  <div className="analytics-section">
                    <h3>Grade Analytics</h3>
                    <p>Detailed analysis of grading patterns and student achievement.</p>
                    
                    <div className="analytics-charts-grid">
                      <div className="analytics-chart-container">
                        {renderChart(chartData.grades, 'line', 'Grade Trends')}
                      </div>

                      <div className="analytics-chart-container">
                        {renderChart(chartData.grades, 'bar', 'Assignment Performance')}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>

        {/* Insights and Recommendations */}
        <div className="analytics-dashboard__insights">
          <div className="analytics-insights">
            <h3>Key Insights</h3>
            <div className="analytics-insights__list">
              <div className="analytics-insight">
                <div className="analytics-insight__icon">
                  <User size={20} />
                </div>
                <div className="analytics-insight__content">
                  <h4>Student Engagement</h4>
                  <p>Engagement has increased by 15% this week. Consider maintaining current strategies.</p>
                </div>
              </div>
              
              <div className="analytics-insight">
                <div className="analytics-insight__icon">
                  <User size={20} />
                </div>
                <div className="analytics-insight__content">
                  <h4>Assignment Performance</h4>
                  <p>3 students may need additional support based on recent assignment scores.</p>
                </div>
              </div>
              
              <div className="analytics-insight">
                <div className="analytics-insight__icon">
                  <Course size={20} />
                </div>
                <div className="analytics-insight__content">
                  <h4>Course Activity</h4>
                  <p>Peak activity occurs between 2-4 PM. Consider scheduling important content during this time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

AnalyticsDashboard.displayName = 'AnalyticsDashboard'
