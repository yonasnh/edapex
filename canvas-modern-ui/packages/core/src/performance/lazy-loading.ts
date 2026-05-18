import { lazy, ComponentType, LazyExoticComponent } from 'react'

/**
 * Lazy loading configuration options
 */
interface LazyLoadOptions {
  /**
   * Delay before loading the component (in milliseconds)
   */
  delay?: number
  
  /**
   * Retry attempts if loading fails
   */
  retries?: number
  
  /**
   * Preload the component when conditions are met
   */
  preload?: boolean
  
  /**
   * Custom error handler for loading failures
   */
  onError?: (error: Error) => void
}

/**
 * Enhanced lazy loading with retry logic and preloading
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> } {
  const {
    delay = 0,
    retries = 3,
    onError,
  } = options

  let importPromise: Promise<{ default: T }> | null = null

  const loadComponent = async (): Promise<{ default: T }> => {
    if (importPromise) {
      return importPromise
    }

    importPromise = retryImport(importFn, retries, delay)
      .catch((error) => {
        importPromise = null // Reset on error to allow retry
        if (onError) {
          onError(error)
        }
        throw error
      })

    return importPromise
  }

  const LazyComponent = lazy(loadComponent) as LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>
  }

  // Add preload method
  LazyComponent.preload = loadComponent

  return LazyComponent
}

/**
 * Retry import with exponential backoff
 */
async function retryImport<T>(
  importFn: () => Promise<T>,
  retries: number,
  delay: number
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (delay > 0 && attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
      }
      
      return await importFn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on the last attempt
      if (attempt === retries) {
        break
      }
      
      console.warn(`Import attempt ${attempt + 1} failed, retrying...`, error)
    }
  }

  throw lastError!
}

/**
 * Preload components based on user interaction or viewport
 */
export class ComponentPreloader {
  private preloadedComponents = new Set<string>()
  private intersectionObserver?: IntersectionObserver
  private hoverTimeouts = new Map<string, NodeJS.Timeout>()

  constructor() {
    this.setupIntersectionObserver()
  }

  /**
   * Preload component when element enters viewport
   */
  preloadOnViewport(
    element: Element,
    componentLoader: () => Promise<any>,
    componentId: string
  ): void {
    if (this.preloadedComponents.has(componentId)) {
      return
    }

    if (this.intersectionObserver) {
      // Store the loader function on the element
      ;(element as any).__componentLoader = componentLoader
      ;(element as any).__componentId = componentId
      
      this.intersectionObserver.observe(element)
    }
  }

  /**
   * Preload component on hover with delay
   */
  preloadOnHover(
    element: Element,
    componentLoader: () => Promise<any>,
    componentId: string,
    delay: number = 100
  ): (() => void) {
    if (this.preloadedComponents.has(componentId)) {
      return () => {} // Return empty cleanup function
    }

    const handleMouseEnter = () => {
      const timeout = setTimeout(() => {
        this.loadComponent(componentLoader, componentId)
      }, delay)
      
      this.hoverTimeouts.set(componentId, timeout)
    }

    const handleMouseLeave = () => {
      const timeout = this.hoverTimeouts.get(componentId)
      if (timeout) {
        clearTimeout(timeout)
        this.hoverTimeouts.delete(componentId)
      }
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    // Return cleanup function
    const cleanup = () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      const timeout = this.hoverTimeouts.get(componentId)
      if (timeout) {
        clearTimeout(timeout)
        this.hoverTimeouts.delete(componentId)
      }
    }

    return cleanup
  }

  /**
   * Preload component immediately
   */
  preloadImmediate(
    componentLoader: () => Promise<any>,
    componentId: string
  ): Promise<any> {
    return this.loadComponent(componentLoader, componentId)
  }

  /**
   * Preload multiple components in sequence
   */
  async preloadSequence(
    components: Array<{
      loader: () => Promise<any>
      id: string
      delay?: number
    }>
  ): Promise<void> {
    for (const component of components) {
      if (component.delay) {
        await new Promise(resolve => setTimeout(resolve, component.delay))
      }
      
      await this.loadComponent(component.loader, component.id)
    }
  }

  /**
   * Preload components in parallel
   */
  async preloadParallel(
    components: Array<{
      loader: () => Promise<any>
      id: string
    }>
  ): Promise<void> {
    const promises = components.map(component =>
      this.loadComponent(component.loader, component.id)
    )
    
    await Promise.allSettled(promises)
  }

  /**
   * Load component and track loading state
   */
  private async loadComponent(
    componentLoader: () => Promise<any>,
    componentId: string
  ): Promise<any> {
    if (this.preloadedComponents.has(componentId)) {
      return
    }

    try {
      console.log(`Preloading component: ${componentId}`)
      const component = await componentLoader()
      this.preloadedComponents.add(componentId)
      console.log(`Component preloaded: ${componentId}`)
      return component
    } catch (error) {
      console.error(`Failed to preload component ${componentId}:`, error)
      throw error
    }
  }

  /**
   * Setup intersection observer for viewport-based preloading
   */
  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as any
            const componentLoader = element.__componentLoader
            const componentId = element.__componentId

            if (componentLoader && componentId) {
              this.loadComponent(componentLoader, componentId)
              this.intersectionObserver?.unobserve(entry.target)
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before element enters viewport
        threshold: 0.1,
      }
    )
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }
    
    this.hoverTimeouts.forEach(timeout => clearTimeout(timeout))
    this.hoverTimeouts.clear()
  }
}

/**
 * Global preloader instance
 */
export const componentPreloader = new ComponentPreloader()

/**
 * Hook for component preloading
 */
export function useComponentPreloader() {
  return {
    preloadOnViewport: componentPreloader.preloadOnViewport.bind(componentPreloader),
    preloadOnHover: componentPreloader.preloadOnHover.bind(componentPreloader),
    preloadImmediate: componentPreloader.preloadImmediate.bind(componentPreloader),
    preloadSequence: componentPreloader.preloadSequence.bind(componentPreloader),
    preloadParallel: componentPreloader.preloadParallel.bind(componentPreloader),
  }
}

/**
 * Common lazy-loaded components for SchoolApex
 * Note: These are placeholder imports for future components
 */
export const LazyComponents = {
  // Placeholder for future components
  // These would be implemented as actual components are created
}

/**
 * Preload critical components for faster navigation
 */
export function preloadCriticalComponents(): void {
  // Placeholder for future implementation
  console.log('Critical components preloading would be implemented here')
}

/**
 * Preload components based on user role
 */
export function preloadRoleBasedComponents(userRole: string): void {
  // Placeholder for future implementation
  console.log(`Role-based preloading for ${userRole} would be implemented here`)
}
