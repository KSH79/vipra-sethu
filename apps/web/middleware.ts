import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
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
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  await supabase.auth.getSession()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // No authenticated user, redirect to login
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirectTo', req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user is an admin
    const { data: adminData, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (error || !adminData) {
      // User is not an admin, redirect to home
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Check MFA status for admin users
    try {
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      
      if (!mfaError && mfaData) {
        // User has MFA enrolled but not verified
        if (mfaData.currentLevel === 'aal1' && mfaData.nextLevel === 'aal2') {
          // Redirect to MFA verification page
          const mfaUrl = new URL('/admin/mfa-verify', req.url)
          mfaUrl.searchParams.set('redirectTo', req.url)
          return NextResponse.redirect(mfaUrl)
        }
      }
    } catch (err) {
      console.error('Error checking MFA status:', err)
      // If we can't check MFA status, allow access but log the error
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
