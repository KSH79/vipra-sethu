import { createClient } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Handles Supabase authentication callbacks.
 * This route is called after a user clicks a magic link or OAuth provider.
 * It exchanges the code for a session and redirects the user.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful authentication, redirect to the intended page.
      // "next" may be an absolute URL (e.g., from middleware passing req.url)
      // or a relative path. Normalize safely and avoid duplicating origin.
      try {
        const resolved = new URL(next, origin)
        // Prevent open redirect: only allow same-origin redirects
        if (resolved.origin !== origin) {
          return NextResponse.redirect(origin)
        }
        return NextResponse.redirect(resolved.toString())
      } catch {
        // If URL parsing fails, fall back to site origin
        return NextResponse.redirect(origin)
      }
    }
  }

  // If there's an error or no code, redirect to login with an error message
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
