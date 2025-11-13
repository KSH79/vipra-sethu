import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to protect admin routes and refresh user sessions.
 * - Protects all routes under /admin/* 
 * - Verifies authenticated users are in the admins table
 * - Refreshes user sessions automatically
 * - Enforces MFA for admin routes
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  await supabase.auth.getSession()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Route protection
  const protectedRoutes = ['/home', '/providers', '/admin', '/onboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some((p) => req.nextUrl.pathname.startsWith(p))

  if (isProtectedRoute && !session) {
    const url = new URL('/login', req.url)
    url.searchParams.set('redirectTo', '/home')
    return NextResponse.redirect(url)
  }

  // If logged-in and accessing admin, verify admin role
  if (req.nextUrl.pathname.startsWith('/admin') && session) {
    const { data: adminData } = await supabase
      .from('admins')
      .select('user_email')
      .eq('user_email', session.user.email)
      .single()
    if (!adminData) {
      return NextResponse.redirect(new URL('/home', req.url))
    }
    try {
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (!mfaError && mfaData && mfaData.currentLevel === 'aal1' && mfaData.nextLevel === 'aal2') {
        const mfaUrl = new URL('/admin/mfa-verify', req.url)
        mfaUrl.searchParams.set('redirectTo', req.url)
        return NextResponse.redirect(mfaUrl)
      }
    } catch (err) {
      console.error('Error checking MFA status:', err)
    }
  }

  // Onboarding gate and landing redirect for authenticated users
  if (session) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single()
    const isComplete = prof?.onboarding_completed as boolean | undefined
    console.log('[middleware] path=', req.nextUrl.pathname, 'user=', session.user.id, 'onboarding_completed=', isComplete)
    const isCompletionPage = req.nextUrl.pathname.startsWith('/complete-profile')
    // Only block when explicitly false; allow when true or unknown
    if (isComplete === false && !isCompletionPage) {
      return NextResponse.redirect(new URL('/complete-profile', req.url))
    }
    // If authenticated and on public landing, send to /home (unless onboarding incomplete)
    if (req.nextUrl.pathname === '/' && isComplete !== false) {
      return NextResponse.redirect(new URL('/home', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
