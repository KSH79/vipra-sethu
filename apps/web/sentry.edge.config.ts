import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// Disable Sentry for development
// if (process.env.NODE_ENV === 'production' && SENTRY_DSN) {
//   Sentry.init({
//     dsn: SENTRY_DSN,
//     environment: process.env.NODE_ENV,
//     tracesSampleRate: 0.1,
//     debug: false,
//   })
// }
