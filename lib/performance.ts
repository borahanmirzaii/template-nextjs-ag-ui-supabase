// Web Vitals tracking
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics
    console.log(metric)
    
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      })
    }
  }
}

// Custom performance marks
export function measurePerformance(name: string, fn: () => void) {
  if (typeof performance === 'undefined') return
  
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name} took ${end - start}ms`)
}

// Long task detection
if (typeof window !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry)
        }
      }
    })
    
    observer.observe({ entryTypes: ['longtask'] })
  } catch (e) {
    // PerformanceObserver not supported
  }
}

