import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  
  // Set release version for better error tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Filter out noise and sensitive errors
  beforeSend(event) {
    // Filter out certain errors if needed
    if (event.exception) {
      const error = event.exception.values?.[0]
      
      // Don't send network errors that are expected
      if (error?.value?.includes('Network request failed')) {
        return null
      }
      
      // Don't send browser extension errors
      if (error?.value?.includes('Non-Error promise rejection captured')) {
        return null
      }
      
      // Don't send third-party script errors
      if (error?.stacktrace?.frames?.some(frame => 
        frame.filename?.includes('chrome-extension://') || 
        frame.filename?.includes('moz-extension://')
      )) {
        return null
      }
    }
    
    // Remove sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter(breadcrumb => {
        // Filter out sensitive URLs
        if (breadcrumb.data?.url && 
            (breadcrumb.data.url.includes('/api/') || 
             breadcrumb.data.url.includes('token'))) {
          return false
        }
        return true
      })
    }
    
    // Add custom tags to events
    if (event.tags) {
      event.tags = {
        ...event.tags,
        app: 'vipra-sethu-web',
        service: 'frontend',
      }
    } else {
      event.tags = {
        app: 'vipra-sethu-web',
        service: 'frontend',
      }
    }
    
    return event
  },
})
