/**
 * Performance monitoring and analytics for SchoolApex
 */

/**
 * Performance metric types
 */
export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  timestamp: number
  metadata?: Record<string, any>
}

/**
 * Web Vitals metrics
 */
export interface WebVitals {
  FCP?: number  // First Contentful Paint
  LCP?: number  // Largest Contentful Paint
  FID?: number  // First Input Delay
  CLS?: number  // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
}

/**
 * Custom performance metrics
 */
export interface CustomMetrics {
  componentRenderTime?: number
  apiResponseTime?: number
  bundleLoadTime?: number
  routeChangeTime?: number
  memoryUsage?: number
}

/**
 * Performance monitoring configuration
 */
interface PerformanceConfig {
  enableWebVitals: boolean
  enableCustomMetrics: boolean
  enableResourceTiming: boolean
  enableUserTiming: boolean
  sampleRate: number
  reportingEndpoint?: string
  bufferSize: number
}

/**
 * Performance Monitor class
 */
export class PerformanceMonitor {
  private config: PerformanceConfig
  private metrics: PerformanceMetric[] = []
  private webVitals: WebVitals = {}
  private customMetrics: CustomMetrics = {}
  private observers: PerformanceObserver[] = []

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableWebVitals: true,
      enableCustomMetrics: true,
      enableResourceTiming: true,
      enableUserTiming: true,
      sampleRate: 1.0,
      bufferSize: 100,
      ...config,
    }

    this.initialize()
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    if (typeof window === 'undefined') return

    // Sample based on configured rate
    if (Math.random() > this.config.sampleRate) return

    if (this.config.enableWebVitals) {
      this.setupWebVitals()
    }

    if (this.config.enableResourceTiming) {
      this.setupResourceTiming()
    }

    if (this.config.enableUserTiming) {
      this.setupUserTiming()
    }

    // Setup periodic reporting
    this.setupPeriodicReporting()
  }

  /**
   * Setup Web Vitals monitoring
   */
  private setupWebVitals(): void {
    // First Contentful Paint
    this.observePerformanceEntry('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        this.webVitals.FCP = fcpEntry.startTime
        this.recordMetric('FCP', fcpEntry.startTime, 'ms')
      }
    })

    // Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lcpEntry = entries[entries.length - 1] // Get the latest LCP
      if (lcpEntry) {
        this.webVitals.LCP = lcpEntry.startTime
        this.recordMetric('LCP', lcpEntry.startTime, 'ms')
      }
    })

    // First Input Delay
    this.observePerformanceEntry('first-input', (entries) => {
      const fidEntry = entries[0] as any
      if (fidEntry && fidEntry.processingStart) {
        const fid = fidEntry.processingStart - fidEntry.startTime
        this.webVitals.FID = fid
        this.recordMetric('FID', fid, 'ms')
      }
    })

    // Cumulative Layout Shift
    this.observePerformanceEntry('layout-shift', (entries) => {
      let cls = 0
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value
        }
      })
      this.webVitals.CLS = cls
      this.recordMetric('CLS', cls, 'count')
    })

    // Time to First Byte
    if (window.performance && window.performance.timing) {
      const ttfb = window.performance.timing.responseStart - window.performance.timing.requestStart
      this.webVitals.TTFB = ttfb
      this.recordMetric('TTFB', ttfb, 'ms')
    }
  }

  /**
   * Setup resource timing monitoring
   */
  private setupResourceTiming(): void {
    this.observePerformanceEntry('resource', (entries) => {
      entries.forEach(entry => {
        const resource = entry as PerformanceResourceTiming
        
        // Monitor critical resources
        if (this.isCriticalResource(resource.name)) {
          this.recordMetric(
            `resource_load_${this.getResourceType(resource.name)}`,
            resource.duration,
            'ms',
            {
              url: resource.name,
              size: resource.transferSize,
              cached: resource.transferSize === 0,
            }
          )
        }
      })
    })
  }

  /**
   * Setup user timing monitoring
   */
  private setupUserTiming(): void {
    this.observePerformanceEntry('measure', (entries) => {
      entries.forEach(entry => {
        this.recordMetric(
          `user_timing_${entry.name}`,
          entry.duration,
          'ms'
        )
      })
    })
  }

  /**
   * Observe performance entries
   */
  private observePerformanceEntry(
    type: string,
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    if (!window.PerformanceObserver) return

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      
      observer.observe({ type, buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn(`Failed to observe ${type} performance entries:`, error)
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' | 'percentage',
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    }

    this.metrics.push(metric)

    // Limit buffer size
    if (this.metrics.length > this.config.bufferSize) {
      this.metrics.shift()
    }

    // Report immediately for critical metrics
    if (this.isCriticalMetric(name)) {
      this.reportMetrics([metric])
    }
  }

  /**
   * Start timing a custom operation
   */
  startTiming(name: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, 'ms')
    }
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName: string): () => void {
    return this.startTiming(`component_render_${componentName}`)
  }

  /**
   * Measure API call time
   */
  measureAPICall(endpoint: string): () => void {
    return this.startTiming(`api_call_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`)
  }

  /**
   * Measure route change time
   */
  measureRouteChange(from: string, to: string): () => void {
    return this.startTiming(`route_change_${from}_to_${to}`)
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): number | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize
    }
    return null
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    const memoryUsage = this.getMemoryUsage()
    if (memoryUsage !== null) {
      this.recordMetric('memory_usage', memoryUsage, 'bytes')
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get Web Vitals
   */
  getWebVitals(): WebVitals {
    return { ...this.webVitals }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    webVitals: WebVitals
    averageMetrics: Record<string, number>
    criticalIssues: string[]
  } {
    const averageMetrics: Record<string, number> = {}
    const metricGroups: Record<string, number[]> = {}

    // Group metrics by name
    this.metrics.forEach(metric => {
      if (!metricGroups[metric.name]) {
        metricGroups[metric.name] = []
      }
      metricGroups[metric.name].push(metric.value)
    })

    // Calculate averages
    Object.entries(metricGroups).forEach(([name, values]) => {
      averageMetrics[name] = values.reduce((sum, val) => sum + val, 0) / values.length
    })

    // Identify critical issues
    const criticalIssues: string[] = []
    
    if (this.webVitals.LCP && this.webVitals.LCP > 2500) {
      criticalIssues.push('LCP is above 2.5s threshold')
    }
    
    if (this.webVitals.FID && this.webVitals.FID > 100) {
      criticalIssues.push('FID is above 100ms threshold')
    }
    
    if (this.webVitals.CLS && this.webVitals.CLS > 0.1) {
      criticalIssues.push('CLS is above 0.1 threshold')
    }

    return {
      webVitals: this.webVitals,
      averageMetrics,
      criticalIssues,
    }
  }

  /**
   * Report metrics to endpoint
   */
  private async reportMetrics(metrics: PerformanceMetric[]): Promise<void> {
    if (!this.config.reportingEndpoint || metrics.length === 0) return

    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          webVitals: this.webVitals,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      })
    } catch (error) {
      console.warn('Failed to report performance metrics:', error)
    }
  }

  /**
   * Setup periodic reporting
   */
  private setupPeriodicReporting(): void {
    // Report metrics every 30 seconds
    setInterval(() => {
      if (this.metrics.length > 0) {
        this.reportMetrics([...this.metrics])
        this.metrics.length = 0 // Clear reported metrics
      }
    }, 30000)

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      if (this.metrics.length > 0) {
        // Use sendBeacon for reliable reporting on page unload
        if (navigator.sendBeacon && this.config.reportingEndpoint) {
          navigator.sendBeacon(
            this.config.reportingEndpoint,
            JSON.stringify({
              metrics: this.metrics,
              webVitals: this.webVitals,
              timestamp: Date.now(),
            })
          )
        }
      }
    })
  }

  /**
   * Check if resource is critical for monitoring
   */
  private isCriticalResource(url: string): boolean {
    return (
      url.includes('.js') ||
      url.includes('.css') ||
      url.includes('/api/') ||
      url.includes('fonts')
    )
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('/api/')) return 'api'
    if (url.includes('fonts')) return 'font'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image'
    return 'other'
  }

  /**
   * Check if metric is critical and should be reported immediately
   */
  private isCriticalMetric(name: string): boolean {
    return (
      name.includes('LCP') ||
      name.includes('FID') ||
      name.includes('CLS') ||
      name.includes('error') ||
      name.includes('crash')
    )
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.length = 0
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    measureComponentRender: performanceMonitor.measureComponentRender.bind(performanceMonitor),
    measureAPICall: performanceMonitor.measureAPICall.bind(performanceMonitor),
    measureRouteChange: performanceMonitor.measureRouteChange.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getWebVitals: performanceMonitor.getWebVitals.bind(performanceMonitor),
    getPerformanceSummary: performanceMonitor.getPerformanceSummary.bind(performanceMonitor),
  }
}
