import { createServerClient } from '@supabase/ssr'
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
    // Prepare redirect URL first
    let redirectTo = origin
    try {
      const resolved = new URL(next, origin)
      if (resolved.origin === origin) {
        redirectTo = resolved.toString()
      }
    } catch {
      redirectTo = origin
    }

    // Create a redirect response that we can attach cookies to
    const response = NextResponse.redirect(redirectTo)

    // Create a Supabase server client that reads cookies from the request
    // and writes cookies to the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
  }

  // If there's an error or no code, redirect to login with an error message
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
