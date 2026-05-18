import React, { useEffect, useState } from 'react'
import type { Metric } from 'web-vitals'

export interface PerformanceMetrics {
  fcp?: number
  lcp?: number
  fid?: number
  cls?: number
  ttfb?: number
}

export interface PerformanceMonitorProps {
  className?: string
  showDetails?: boolean
}

const CheckmarkFilledIcon = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" style={style}>
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-1 10.3l-3.5-3.5 1.4-1.4 2.1 2.1 4.1-4.1 1.4 1.4-5.5 5.5z"/>
  </svg>
)

const WarningFilledIcon = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" style={style}>
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v6z"/>
  </svg>
)

const ErrorFilledIcon = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" style={style}>
    <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm3.5 9.5l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8z"/>
  </svg>
)

const AnalyticsIcon = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" style={style}>
    <path d="M4 2H3v11h12v-1H4V2z"/>
    <path d="M6 5h2v6H6zM10 3h2v8h-2z"/>
  </svg>
)

export function PerformanceMonitor({ className, showDetails = false }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS((metric: Metric) => {
        setMetrics(prev => ({ ...prev, cls: metric.value }))
      })

      onINP((metric: Metric) => {
        setMetrics(prev => ({ ...prev, fid: metric.value }))
      })

      onFCP((metric: Metric) => {
        setMetrics(prev => ({ ...prev, fcp: metric.value }))
      })

      onLCP((metric: Metric) => {
        setMetrics(prev => ({ ...prev, lcp: metric.value }))
      })

      onTTFB((metric: Metric) => {
        setMetrics(prev => ({ ...prev, ttfb: metric.value }))
      })

      setIsLoading(false)
    }).catch(() => {
      setIsLoading(false)
    })
  }, [])

  const getMetricStatus = (value: number | undefined, thresholds: { good: number; poor: number }) => {
    if (value === undefined) return 'unknown'
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckmarkFilledIcon size={16} style={{ color: 'var(--cm-status-success-text)' }} />
      case 'needs-improvement':
        return <WarningFilledIcon size={16} style={{ color: 'var(--cm-status-warning-text)' }} />
      case 'poor':
        return <ErrorFilledIcon size={16} style={{ color: 'var(--cm-status-danger-text)' }} />
      default:
        return <AnalyticsIcon size={16} style={{ color: 'var(--cm-text-tertiary)' }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'green'
      case 'needs-improvement': return 'yellow'
      case 'poor': return 'red'
      default: return 'gray'
    }
  }

  const formatMetric = (value: number | undefined, unit: string = 'ms') => {
    if (value === undefined) return 'N/A'
    return `${Math.round(value)}${unit}`
  }

  const thresholds = {
    fcp: { good: 1800, poor: 3000 },
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    ttfb: { good: 800, poor: 1800 },
  }

  const performanceScore = () => {
    const scores = [
      getMetricStatus(metrics.fcp, thresholds.fcp),
      getMetricStatus(metrics.lcp, thresholds.lcp),
      getMetricStatus(metrics.fid, thresholds.fid),
      getMetricStatus(metrics.cls, thresholds.cls),
      getMetricStatus(metrics.ttfb, thresholds.ttfb),
    ]
    
    const goodCount = scores.filter(s => s === 'good').length
    const totalCount = scores.filter(s => s !== 'unknown').length
    
    return totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 0
  }

  if (isLoading) {
    return (
      <div className={`cm-card ${className || ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AnalyticsIcon size={20} />
          <span>Loading performance metrics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`cm-card ${className || ''}`}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <AnalyticsIcon size={20} />
          <h4>Performance Score: {performanceScore()}%</h4>
        </div>
        <div
          className="cm-progress-bar"
          role="progressbar"
          aria-valuenow={performanceScore()}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Performance Score"
        >
          <div
            className={`cm-progress-bar__fill cm-progress-bar__fill--${performanceScore() >= 80 ? 'success' : performanceScore() >= 60 ? 'active' : 'error'}`}
            style={{ width: `${performanceScore()}%` }}
          />
        </div>
      </div>

      {showDetails && (
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>First Contentful Paint (FCP)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getStatusIcon(getMetricStatus(metrics.fcp, thresholds.fcp))}
              <span className={`cm-badge cm-badge--${getStatusColor(getMetricStatus(metrics.fcp, thresholds.fcp))} cm-badge--sm`}>
                {formatMetric(metrics.fcp)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Largest Contentful Paint (LCP)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getStatusIcon(getMetricStatus(metrics.lcp, thresholds.lcp))}
              <span className={`cm-badge cm-badge--${getStatusColor(getMetricStatus(metrics.lcp, thresholds.lcp))} cm-badge--sm`}>
                {formatMetric(metrics.lcp)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>First Input Delay (FID)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getStatusIcon(getMetricStatus(metrics.fid, thresholds.fid))}
              <span className={`cm-badge cm-badge--${getStatusColor(getMetricStatus(metrics.fid, thresholds.fid))} cm-badge--sm`}>
                {formatMetric(metrics.fid)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Cumulative Layout Shift (CLS)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getStatusIcon(getMetricStatus(metrics.cls, thresholds.cls))}
              <span className={`cm-badge cm-badge--${getStatusColor(getMetricStatus(metrics.cls, thresholds.cls))} cm-badge--sm`}>
                {formatMetric(metrics.cls, '')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Time to First Byte (TTFB)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getStatusIcon(getMetricStatus(metrics.ttfb, thresholds.ttfb))}
              <span className={`cm-badge cm-badge--${getStatusColor(getMetricStatus(metrics.ttfb, thresholds.ttfb))} cm-badge--sm`}>
                {formatMetric(metrics.ttfb)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
