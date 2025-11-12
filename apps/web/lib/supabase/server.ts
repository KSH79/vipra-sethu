import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // In server components, cookies() returns a readonly store
          return cookieStore.getAll()
        },
        setAll() {
          // No-op in RSC; middleware handles refresh persistence
        }
      }
    }
  )
}
