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
      
      // Don't send health check errors
      if (error?.value?.includes('health check')) {
        return null
      }
      
      // Don't send bot/crawler errors
      if (event.request?.headers?.['user-agent']?.match(/bot|crawler|spider/i)) {
        return null
      }
    }
    
    // Add custom tags to events
    if (event.tags) {
      event.tags = {
        ...event.tags,
        app: 'vipra-sethu-web',
        service: 'backend',
        runtime: 'nextjs-server',
      }
    } else {
      event.tags = {
        app: 'vipra-sethu-web',
        service: 'backend',
        runtime: 'nextjs-server',
      }
    }
    
    return event
  },
})
