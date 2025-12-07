import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/auth/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for a protected route
  const isProtectedRoute = pathname.startsWith('/dashboard')
  const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup')

  const token = request.cookies.get('session')?.value

  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    if (!token) {
      // Redirect to sign in if not authenticated
      const url = new URL('/signin', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Verify the token
    const session = await verifySession(token)
    if (!session) {
      // Invalid token, redirect to sign in
      const url = new URL('/signin', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // If user is already authenticated and tries to access auth pages, redirect to dashboard
  if (isAuthRoute && token) {
    const session = await verifySession(token)
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
}
