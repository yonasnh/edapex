/**
 * Web Vitals Performance Monitoring for SchoolApex Modern UI
 * 
 * Implements comprehensive performance monitoring following Google's Web Vitals
 * guidelines and Canvas LMS performance best practices.
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * Performance metric interface
 */
export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
  userAgent: string
  connectionType?: string
}

/**
 * Performance thresholds based on Web Vitals guidelines
 */
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint (replaces FID)
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  
  // Other important metrics
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  
  // Custom SchoolApex metrics
  CANVAS_API_RESPONSE: { good: 1000, poor: 3000 },
  COMPONENT_RENDER: { good: 16, poor: 50 },
  ROUTE_TRANSITION: { good: 200, poor: 1000 },
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  enabled: boolean
  endpoint?: string
  sampleRate: number
  debug: boolean
  trackCustomMetrics: boolean
  trackUserInteractions: boolean
  trackResourceTiming: boolean
}

/**
 * Default performance configuration
 */
const DEFAULT_CONFIG: PerformanceConfig = {
  enabled: true,
  sampleRate: 1.0, // 100% sampling in development, reduce in production
  debug: import.meta.env.VITE_DEBUG_MODE === 'true',
  trackCustomMetrics: true,
  trackUserInteractions: true,
  trackResourceTiming: true,
}

/**
 * Performance Monitor Class
 * 
 * Handles collection, analysis, and reporting of performance metrics
 * for SchoolApex Modern UI application.
 */
export class PerformanceMonitor {
  private config: PerformanceConfig
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    if (this.config.enabled && typeof window !== 'undefined') {
      this.initializeMonitoring()
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    // Initialize Web Vitals monitoring
    this.initializeWebVitals()
    
    // Initialize custom metrics monitoring
    if (this.config.trackCustomMetrics) {
      this.initializeCustomMetrics()
    }
    
    // Initialize user interaction monitoring
    if (this.config.trackUserInteractions) {
      this.initializeUserInteractionMonitoring()
    }
    
    // Initialize resource timing monitoring
    if (this.config.trackResourceTiming) {
      this.initializeResourceTimingMonitoring()
    }
    
    // Set up periodic reporting
    this.setupPeriodicReporting()
    
    if (this.config.debug) {
      console.log('🚀 SchoolApex Performance Monitor initialized')
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initializeWebVitals(): void {
    // Largest Contentful Paint
    onLCP((metric: Metric) => {
      this.recordMetric({
        name: 'LCP',
        value: metric.value,
        rating: this.getRating('LCP', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType(),
      })
    })

    // Interaction to Next Paint (replaces FID)
    onINP((metric: Metric) => {
      this.recordMetric({
        name: 'INP',
        value: metric.value,
        rating: this.getRating('INP', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType(),
      })
    })

    // Cumulative Layout Shift
    onCLS((metric: Metric) => {
      this.recordMetric({
        name: 'CLS',
        value: metric.value,
        rating: this.getRating('CLS', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType(),
      })
    })

    // First Contentful Paint
    onFCP((metric: Metric) => {
      this.recordMetric({
        name: 'FCP',
        value: metric.value,
        rating: this.getRating('FCP', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType(),
      })
    })

    // Time to First Byte
    onTTFB((metric: Metric) => {
      this.recordMetric({
        name: 'TTFB',
        value: metric.value,
        rating: this.getRating('TTFB', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType(),
      })
    })
  }

  /**
   * Initialize custom metrics monitoring
   */
  private initializeCustomMetrics(): void {
    // Monitor Canvas API response times
    this.monitorCanvasAPIPerformance()
    
    // Monitor component render times
    this.monitorComponentRenderTimes()
    
    // Monitor route transitions
    this.monitorRouteTransitions()
    
    // Monitor memory usage
    this.monitorMemoryUsage()
  }

  /**
   * Monitor Canvas API performance
   */
  private monitorCanvasAPIPerformance(): void {
    // Intercept fetch requests to Canvas API
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      const [url] = args
      const isCanvasAPI = typeof url === 'string' && url.includes('/api/v1/')
      
      if (isCanvasAPI) {
        const startTime = performance.now()
        
        try {
          const response = await originalFetch(...args)
          const endTime = performance.now()
          const duration = endTime - startTime
          
          this.recordMetric({
            name: 'CANVAS_API_RESPONSE',
            value: duration,
            rating: this.getRating('CANVAS_API_RESPONSE', duration),
            timestamp: Date.now(),
            url: typeof url === 'string' ? url : window.location.href,
            userAgent: navigator.userAgent,
          })
          
          return response
        } catch (error) {
          const endTime = performance.now()
          const duration = endTime - startTime
          
          this.recordMetric({
            name: 'CANVAS_API_ERROR',
            value: duration,
            rating: 'poor',
            timestamp: Date.now(),
            url: typeof url === 'string' ? url : window.location.href,
            userAgent: navigator.userAgent,
          })
          
          throw error
        }
      }
      
      return originalFetch(...args)
    }
  }

  /**
   * Monitor component render times
   */
  private monitorComponentRenderTimes(): void {
    // Use Performance Observer to monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.recordMetric({
              name: 'LONG_TASK',
              value: entry.duration,
              rating: entry.duration > 200 ? 'poor' : 'good',
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
            })
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['longtask'] })
        this.observers.push(observer)
      } catch (error) {
        if (this.config.debug) {
          console.warn('Long task monitoring not supported:', error)
        }
      }
    }
  }

  /**
   * Monitor route transitions
   */
  private monitorRouteTransitions(): void {
    let navigationStartTime = performance.now()
    
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            
            this.recordMetric({
              name: 'ROUTE_TRANSITION',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              rating: this.getRating('ROUTE_TRANSITION', navEntry.loadEventEnd - navEntry.fetchStart),
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
            })
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['navigation'] })
        this.observers.push(observer)
      } catch (error) {
        if (this.config.debug) {
          console.warn('Navigation timing monitoring not supported:', error)
        }
      }
    }
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        
        this.recordMetric({
          name: 'MEMORY_USAGE',
          value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
          rating: memory.usedJSHeapSize > 50 * 1024 * 1024 ? 'poor' : 'good', // 50MB threshold
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        })
      }, 30000) // Check every 30 seconds
    }
  }

  /**
   * Initialize user interaction monitoring
   */
  private initializeUserInteractionMonitoring(): void {
    // Monitor click interactions
    document.addEventListener('click', (event) => {
      const startTime = performance.now()
      
      // Use requestAnimationFrame to measure interaction response time
      requestAnimationFrame(() => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.recordMetric({
          name: 'CLICK_RESPONSE',
          value: duration,
          rating: this.getRating('COMPONENT_RENDER', duration),
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        })
      })
    })
  }

  /**
   * Initialize resource timing monitoring
   */
  private initializeResourceTimingMonitoring(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            
            // Monitor slow resources
            if (resourceEntry.duration > 1000) {
              this.recordMetric({
                name: 'SLOW_RESOURCE',
                value: resourceEntry.duration,
                rating: 'poor',
                timestamp: Date.now(),
                url: resourceEntry.name,
                userAgent: navigator.userAgent,
              })
            }
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['resource'] })
        this.observers.push(observer)
      } catch (error) {
        if (this.config.debug) {
          console.warn('Resource timing monitoring not supported:', error)
        }
      }
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    // Apply sampling rate
    if (Math.random() > this.config.sampleRate) {
      return
    }
    
    this.metrics.push(metric)
    
    if (this.config.debug) {
      console.log(`📊 Performance Metric: ${metric.name} = ${metric.value.toFixed(2)}ms (${metric.rating})`)
    }
    
    // Send to analytics endpoint if configured
    if (this.config.endpoint) {
      this.sendMetricToEndpoint(metric)
    }
    
    // Trigger performance alerts if needed
    this.checkPerformanceAlerts(metric)
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS]
    
    if (!thresholds) {
      return 'good'
    }
    
    if (value <= thresholds.good) {
      return 'good'
    } else if (value <= thresholds.poor) {
      return 'needs-improvement'
    } else {
      return 'poor'
    }
  }

  /**
   * Get connection type
   */
  private getConnectionType(): string | undefined {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    return connection?.effectiveType
  }

  /**
   * Send metric to analytics endpoint
   */
  private async sendMetricToEndpoint(metric: PerformanceMetric): Promise<void> {
    if (!this.config.endpoint) return
    
    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      })
    } catch (error) {
      if (this.config.debug) {
        console.warn('Failed to send performance metric:', error)
      }
    }
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    if (metric.rating === 'poor' && metric.name !== 'LONG_TASK') {
      // Trigger performance alert
      if (this.config.debug) {
        console.warn(`⚠️ Performance Alert: ${metric.name} is performing poorly (${metric.value.toFixed(2)}ms)`)
      }
      
      // Could integrate with error reporting service here
      this.triggerPerformanceAlert(metric)
    }
  }

  /**
   * Trigger performance alert
   */
  private triggerPerformanceAlert(metric: PerformanceMetric): void {
    // Custom event for performance alerts
    const alertEvent = new CustomEvent('schoolapex:performance-alert', {
      detail: metric,
    })
    
    window.dispatchEvent(alertEvent)
  }

  /**
   * Set up periodic reporting
   */
  private setupPeriodicReporting(): void {
    // Report metrics every 30 seconds
    setInterval(() => {
      this.generatePerformanceReport()
    }, 30000)
    
    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.generatePerformanceReport()
    })
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.metrics.slice(), // Copy metrics array
      summary: this.generateSummary(),
    }
    
    if (this.config.debug) {
      console.log('📊 Performance Report:', report)
    }
    
    return report
  }

  /**
   * Generate performance summary
   */
  private generateSummary(): PerformanceSummary {
    const metricsByName = this.groupMetricsByName()
    const summary: PerformanceSummary = {
      totalMetrics: this.metrics.length,
      coreWebVitals: {},
      customMetrics: {},
      alerts: this.metrics.filter(m => m.rating === 'poor').length,
    }

    // Summarize Core Web Vitals
    const coreMetrics = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB']
    coreMetrics.forEach((metric: string) => {
      const values = metricsByName[metric] || []
      if (values.length > 0) {
        summary.coreWebVitals[metric] = {
          average: values.reduce((sum, v) => sum + v.value, 0) / values.length,
          latest: values[values.length - 1].value,
          rating: values[values.length - 1].rating,
        }
      }
    })
    
    // Summarize custom metrics
    Object.keys(metricsByName).forEach((metricName: string) => {
      if (!coreMetrics.includes(metricName)) {
        const values = metricsByName[metricName]
        summary.customMetrics[metricName] = {
          count: values.length,
          average: values.reduce((sum, v) => sum + v.value, 0) / values.length,
          latest: values[values.length - 1].value,
        }
      }
    })
    
    return summary
  }

  /**
   * Group metrics by name
   */
  private groupMetricsByName(): Record<string, PerformanceMetric[]> {
    return this.metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = []
      }
      groups[metric.name].push(metric)
      return groups
    }, {} as Record<string, PerformanceMetric[]>)
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return this.metrics.slice()
  }

  /**
   * Clear metrics
   */
  public clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Destroy performance monitor
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics = []
  }
}

/**
 * Performance report interface
 */
export interface PerformanceReport {
  timestamp: number
  url: string
  userAgent: string
  metrics: PerformanceMetric[]
  summary: PerformanceSummary
}

/**
 * Performance summary interface
 */
export interface PerformanceSummary {
  totalMetrics: number
  coreWebVitals: Record<string, {
    average: number
    latest: number
    rating: string
  }>
  customMetrics: Record<string, {
    count: number
    average: number
    latest: number
  }>
  alerts: number
}

/**
 * Create and initialize performance monitor
 */
export function createPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  return new PerformanceMonitor(config)
}

/**
 * Default performance monitor instance
 */
export const performanceMonitor = createPerformanceMonitor({
  endpoint: import.meta.env.VITE_PERFORMANCE_ENDPOINT,
  sampleRate: import.meta.env.VITE_ENVIRONMENT === 'production' ? 0.1 : 1.0,
})

export default performanceMonitor
