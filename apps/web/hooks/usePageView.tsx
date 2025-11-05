'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { analytics } from '@/lib/analytics'

function PageViewTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = pathname
      if (searchParams?.toString()) {
        url = `${pathname}?${searchParams.toString()}`
      }
      
      analytics.pageview(url, {
        pathname,
        search_params: Object.fromEntries(searchParams || []),
      })
    }
  }, [pathname, searchParams])

  return null
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  )
}
