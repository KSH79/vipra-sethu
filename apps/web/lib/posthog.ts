import posthog from 'posthog-js'

export function getPostHog() {
  if (!posthog.__loaded && typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        console.log('PostHog loaded successfully')
      },
    })
  }
  return posthog
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  const client = getPostHog()
  if (client) {
    client.capture(eventName, properties)
  }
}

// Core events for our application
export const EVENTS = {
  SEARCH_SUBMITTED: 'search_submitted',
  PROVIDER_VIEWED: 'provider_viewed',
  CONTACT_CTA_CLICKED: 'contact_cta_clicked',
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_PHOTO_UPLOADED: 'onboarding_photo_uploaded',
  ADMIN_APPROVAL_COMPLETED: 'admin_approval_completed',
  ADMIN_REJECTION_COMPLETED: 'admin_rejection_completed',
} as const

export type EventName = typeof EVENTS[keyof typeof EVENTS]
