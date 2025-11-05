'use client'

import { useEffect } from 'react'
import { getPostHog } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize PostHog in production or if explicitly enabled
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_POSTHOG_KEY
    ) {
      getPostHog()
    }

    // Clean up on unmount
    return () => {
      if (getPostHog()) {
        getPostHog()?.capture('$pageleave')
      }
    }
  }, [])

  return <>{children}</>
}
